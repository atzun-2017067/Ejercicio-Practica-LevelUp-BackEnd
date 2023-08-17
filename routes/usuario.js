const { Router } = require('express');
const { check } = require('express-validator');

const { validarCampos } = require('../middlewares/validar-campos');
const { getUsuarios, postUsuario, deleteUsuario, getUsuarioPerfil, deleteUsuarioPerfil } = require('../controllers/usuario');
const { validarJWT } = require('../middlewares/validar-jwt');
const { tieneRole } = require('../middlewares/validar-roles');

const router = Router();

//ADMIN
router.get('/mostrar', getUsuarios);

router.post('/agregar', [
    validarJWT,
    tieneRole("ROL_ADMINISTRADOR"),
    validarCampos
], postUsuario);

router.post('/crearCuenta', [
    validarCampos
], postUsuario);

router.delete('/eliminar/:id', [
    validarJWT,
    tieneRole("ROL_ADMINISTRADOR"),
    validarCampos
], deleteUsuario);



// USUARIO
router.get('/mostrar-perfil', [
    validarJWT,
    validarCampos
], getUsuarioPerfil);

router.delete('/eliminar-perfil', [
    validarJWT,
    validarCampos
], deleteUsuarioPerfil);

module.exports = router;