const { Schema, model } = require('mongoose');

const UsuarioSchema = Schema({
    carnet: {
        type: String,
        unique: true,
        required: [true, 'El carnet es obligatorio']
    },
    nombre: {
        type: String,
        required: [true, 'El nombre es obligatorio']
    },
    apellido: {
        type: String,
        required: [true, 'El apellido es obligatorio']
    },
    edad: {
        type: Number,
        required: [true, 'La edad es obligatoria']
    },
    direccion: {
        type: String,
        required: [true, 'La direccion es obligatoria']
    },
    genero: {
        type: String,
        enum: ['Masculino', 'Femenino'],
        required: [true, 'El genero es obligatorio']
    },
    telefono: {
        type: String,
        required: [true, 'El numero de telefono es obligatorio']
    },
    fechaNacimiento: {
        type: Date,
        required: [true, 'La fecha de nacimiento es obligatoria']
    },
    carrera: {
        type: String,
        required: [true, 'La carrera es obligatoria']
    },
    generoPoesia: {
        type: String,
        enum: ['Lirica', 'Epica', 'Dramatica'],
        required: [true, 'El genero de poesia es obligatorio']
    },
    fechaInscripcion: {
        type: Date,
        required: [true, 'La fecha de inscripcion es obligatoria']
    },
    fechaDeclamacion: {
        type: Date
    },
    correo: {
        type: String,
        required: [true, 'El correo es obligatorio' ],
        unique: true
    },
    password: {
        type: String,
        required: [true, 'El password es obligatorio' ]
    },
    rol: {
        type: String,
        required: [true, 'El rol es requerido'],
    },
    estado: {
        type: Boolean,
        default: true
    },
    img:{
        type: String,
        default: 'Sin imagen'
    }
});

module.exports = model('Usuario', UsuarioSchema);