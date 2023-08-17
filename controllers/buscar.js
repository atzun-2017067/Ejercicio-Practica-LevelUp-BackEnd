const { request, response } = require('express');
const { ObjectId } = require('mongoose').Types;

const Usuario = require('../models/usuario');

const coleccionesPermitidas = [
    'usuarios',
];


const buscarUsuarios = async (termino = '', res = response) => {

    const esMongoID = ObjectId.isValid(termino);  //TRUE

    if (esMongoID) {
        const usuario = await Usuario.findById(termino);
        return res.json({
            //results: [ usuario ]
            results: (usuario) ? [usuario] : []
            //Preguntar si el usuario existe, si no existe regresa un array vacio
        });
    }

    if (!isNaN(termino)) { // Verifica si el término es un número (edad)
        const edad = parseInt(termino);
        const usuariosPorEdad = await Usuario.find({
            edad: edad,
            $and: [{ estado: true }, { rol: 'ROL_USUARIO' }]
        });
        return res.json({
            results: usuariosPorEdad
        });
    }

    //Expresiones regulares, buscar sin impotar mayusculas y minusculas (DIFIERE DE EL)
    const regex = new RegExp(termino, 'i');

    // Intentar analizar el término como una fecha en formato 'YYYY-MM-DD'
    const fechaTermino = new Date(termino);

    if (!isNaN(fechaTermino)) {
        // Crear una nueva fecha para el día siguiente
        const fechaSiguiente = new Date(fechaTermino);
        fechaSiguiente.setDate(fechaSiguiente.getDate() + 1);

        const usuariosPorFecha = await Usuario.find({
            fechaDeclamacion: {
                $gte: fechaTermino,
                $lt: fechaSiguiente
            },
            estado: true,
            rol: 'ROL_USUARIO'
        });

        return res.json({
            results: usuariosPorFecha
        });
    }

    const usuarios = await Usuario.find({
        $or: [{ carrera: regex }, { generoPoesia: regex }],
        $and: [{ estado: true }, { rol: 'ROL_USUARIO' }]
    });

    res.json({
        results: usuarios
    })

}


const buscar = (req = request, res = response) => {

    const { coleccion, termino } = req.params;

    if (!coleccionesPermitidas.includes(coleccion)) {
        return res.status(400).json({
            msg: `La colección: ${coleccion} no existe en la DB
                  Las colecciones permitidas son: ${coleccionesPermitidas}`
        });
    }


    switch (coleccion) {
        case 'usuarios':
            buscarUsuarios(termino, res);
            break;
        default:
            res.status(500).json({
                msg: 'Ups, se me olvido hacer esta busqueda...'
            });
            break;
    }

}


module.exports = {
    buscar
}