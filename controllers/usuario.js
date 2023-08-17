const { response, request } = require('express');
const bcrypt = require('bcryptjs');
const Usuario = require('../models/usuario');
const Role = require('../models/role');


// ADMINISTRADOR
const getUsuarios = async (req = request, res = response) => {
  try {
    const listaUsuarios = await Usuario.find({ estado: true, rol: 'ROL_USUARIO' });
    res.status(200).json(listaUsuarios);
  } catch (error) {
    res.status(500).json({ error: 'Error en el servidor' });
  }
};


const postUsuario = async (req = request, res = response) => {
  const {
    carnet,
    nombre,
    apellido,
    direccion,
    genero,
    telefono,
    fechaNacimiento,
    carrera,
    generoPoesia,
    correo,
    password,
    rol,
    img
  } = req.body;

  const fechaInscripcion = new Date(); // Obtener la fecha actual

  // Validación del carnet
  if (
    carnet.length !== 6 ||
    carnet[0] !== 'A' ||
    carnet[2] !== '5' ||
    !/[139]$/.test(carnet[5]) || 
    carnet.includes('0') // Validación de que no contenga el número cero
  ) {
    return res.status(400).json({ error: 'El carnet no cumple con las condiciones requeridas: La primera letra debe de ser una A, la tercera tiene que contener un 5 y el ultimo caracter debe de terminar en 1,3 o 9' });
  }

  if (!/^[A-Za-zÁÉÍÓÚáéíóúñÑ\s]+$/.test(nombre, apellido)) {
    return res.status(400).json({ error: 'El nombre y apellido deben contener únicamente letras' });
  }

  const generoValido = ['Masculino', 'Femenino'];
  if (!generoValido.includes(genero.charAt(0).toUpperCase() + genero.slice(1).toLowerCase())) {
    return res.status(400).json({
      mensaje: 'El genero debe de ser Masculino o Femenino'
    });
  }

  if (telefono.length !== 8) {
    return res.status(400).json({ error: 'El telefono debe tener una longitud de 8 numeros' });
  }

  // Calculando la edad a partir de la fecha de nacimiento
  const fechaNacimientoUsuario = new Date(fechaNacimiento);
  const hoy = new Date();
  let edad = hoy.getFullYear() - fechaNacimientoUsuario.getFullYear();
  if (
    hoy.getMonth() < fechaNacimientoUsuario.getMonth() ||
    (hoy.getMonth() === fechaNacimientoUsuario.getMonth() && hoy.getDate() < fechaNacimientoUsuario.getDate())
  ) {
    edad--; // Si aún no ha pasado el cumpleaños este año
  }

  const generoPoesiavalido = ['Lirica', 'Epica', 'Dramatica'];
  if (!generoPoesiavalido.includes(generoPoesia.charAt(0).toUpperCase() + generoPoesia.slice(1).toLowerCase())) {
    return res.status(400).json({
      mensaje: 'El genero de poesia debe de ser Lirica, Epica o Dramatica'
    });
  }

  // Calculando la fecha de declamación
  let fechaDeclamacion = new Date(fechaInscripcion);

  // Obtener el último dígito del carnet
  const lastDigit = carnet.charAt(carnet.length - 1);

  // Modificar el género de poesía para asegurar la capitalización correcta
  const generoPoesiaModificado = generoPoesia.charAt(0).toUpperCase() + generoPoesia.slice(1).toLowerCase();

  // Verificar si el último dígito del carnet es '1' y el género de poesía es 'Dramatica'
  if (lastDigit === '1' && generoPoesiaModificado === 'Dramatica') {
    let diasParaDeclamacion = 5; // Días para la declamación
    while (diasParaDeclamacion > 0) {
      fechaDeclamacion.setDate(fechaDeclamacion.getDate() + 1);

      // Omitir sábado (6) y domingo (0)
      if (fechaDeclamacion.getDay() !== 6 && fechaDeclamacion.getDay() !== 0) {
        diasParaDeclamacion--;
      }
    }
  } else if (lastDigit === '3' && generoPoesiaModificado === 'Epica') {
    fechaDeclamacion = new Date(fechaDeclamacion.getFullYear(), fechaDeclamacion.getMonth() + 1, 0);

    // Retroceder al último día del mes (excepto sábado y domingo)
    while (fechaDeclamacion.getDay() === 6 || fechaDeclamacion.getDay() === 0) {
      fechaDeclamacion.setDate(fechaDeclamacion.getDate() - 1);
    }
  } else {
    // Calcular el próximo viernes (excepto sábado y domingo)
    while (fechaDeclamacion.getDay() !== 5) {
      fechaDeclamacion.setDate(fechaDeclamacion.getDate() + 1);
    }
  }

  const generoModificado = genero.charAt(0).toUpperCase() + genero.slice(1).toLowerCase();


  const carnetEncontrado = await Usuario.findOne({ carnet: carnet })
  const correoEncontrado = await Usuario.findOne({ correo: correo });
  const telefonoEncontrado = await Usuario.findOne({ telefono: telefono });

  if (carnetEncontrado == null) {
    if (correoEncontrado == null) {
      if (telefonoEncontrado == null) {
        try {
          const nuevoUsuario = new Usuario({
            carnet,
            nombre,
            apellido,
            edad,
            direccion,
            genero: generoModificado,
            telefono,
            fechaNacimiento: fechaNacimientoUsuario,
            carrera,
            generoPoesia: generoPoesiaModificado,
            fechaInscripcion,
            fechaDeclamacion,
            correo,
            password,
            rol,
            img: img
          });
          const salt = bcrypt.genSaltSync();
          nuevoUsuario.password = bcrypt.hashSync(password, salt);
          await nuevoUsuario.save();
          res.status(201).json(nuevoUsuario);
        } catch (error) {
          console.error('Error en postUsuario:', error);

          res.status(500).json({ error: 'Error en el servidor', error });
        }
      } else {
        res.status(500).json({ error: 'El numero de telefono ya está ingresado en la base de datos' });
      }
    } else {
      res.status(500).json({ error: 'El correo ya está ingresado en la base de datos' });
    }
  } else {
    res.status(500).json({ error: 'El carnet ya fue ingresado, ingrese otro' });
  }
};


const deleteUsuario = async (req, res) => {
  const { id } = req.params;

  try {
    const usuarioEncontrado = await Usuario.findById(id);

    if (!usuarioEncontrado) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }
    const usuarioEliminado = await Usuario.findByIdAndDelete(id);
    res.json(usuarioEliminado);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al eliminar el usuario' });
  }
};


// AUTOMATICO
const adminPorDefecto = async (req = request, res = response) => {
  try {
    let usuario = new Usuario();
    usuario.carnet = "AE5IO1";
    usuario.nombre = "Anthony";
    usuario.apellido = "Acabal";
    usuario.edad = 23;
    usuario.direccion = "zona 3";

    usuario.genero = "Masculino";
    usuario.telefono = "20250203";
    usuario.fechaNacimiento = "2000-09-12";
    usuario.carrera = "Informatica";
    usuario.generoPoesia = "Lirica";

    usuario.fechaInscripcion = "2023-08-16";
    usuario.correo = "admin@gmail.com";
    usuario.password = "ADMIN";
    usuario.rol = "ROL_ADMINISTRADOR";
    const usuarioEncontrado = await Usuario.findOne({ correo: usuario.correo });
    usuario.password = bcrypt.hashSync(usuario.password, bcrypt.genSaltSync());

    if (usuarioEncontrado) return console.log("EL ADMIN ESTA LISTO");
    usuario = await usuario.save();
    if (!usuario) return console.log("EL ADMIN NO ESTA LISTO");
    return console.log("EL ADMIN ESTA LISTO");
  } catch (err) {
    throw new Error(err);
  }
};

// USUARIO
const getUsuarioPerfil = async (req = request, res = response) => {
  const query = req.usuario._id;
  const listaUsuario = await Usuario.find(query)
  res.json(
    listaUsuario
  );
}

const deleteUsuarioPerfil = async (req, res) => {
  const id = req.usuario._id;

  try {
    const usuarioEncontrado = await Usuario.findById(id);

    if (!usuarioEncontrado) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }
    
    const usuarioEliminado = await Usuario.findByIdAndDelete(id);
    res.json(usuarioEliminado);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al eliminar el usuario' });
  }
};



const roles = async (req, res) => {
  try {
    let role = new Role();
    let role2 = new Role();
    role.rol = "ROL_ADMINISTRADOR";
    role2.rol = "ROL_USUARIO";
    const rolBusca = await Role.findOne({ rol: role.rol })
    if (rolBusca != null) {
      return console.log("LOS ROLES ESTAN LISTOS");
    } else {
      rol1 = await role.save();
      rol2 = await role2.save();
      if (!rol1 && !rol2) return console.log("LOS ROLES NO ESTAN LISTOS");
      return console.log("LOS ROLES ESTAN LISTOS");
    }
  } catch (err) {
    throw new Error(err);
  }
};

module.exports = {
  //ADMIN
  getUsuarios,
  postUsuario,
  deleteUsuario,

  adminPorDefecto,
  roles,

  //USUARIO PERFIL
  getUsuarioPerfil,
  deleteUsuarioPerfil,
};