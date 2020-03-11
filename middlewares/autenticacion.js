var jwt = require('jsonwebtoken');

var SEED = require('../config/config').SEED;

//  ===================================
//  verificar Token
//  ===================================

exports.verificaToken = function(req, res, next) {

    var token = req.query.token;
    jwt.verify(token, SEED, (err, decoded) => {
        if (err) {
            return res.status(401).json({
                ok: false,
                mensaje: 'Token incorrecto',
                errors: err
            });
        }

        req.usuario = decoded.usuario;
        next();

    });
};

//  ===================================
//  verificar Admin
//  ===================================

exports.verificaADMIN_ROLE = function(req, res, next) {

    var usuario = req.usuario;

    if (usuario.role === 'ADMIN_ROLE') {
        next();
        return;
    } else {

        return res.status(401).json({
            ok: false,
            mensaje: 'Token incorrecto - is not an admin user',
            errors: { message: 'Is not an admin, you can not do it' }
        });
    }
};

//  ===================================
//  verificar Admin o Mismo Usuario 
//  ===================================

exports.verificaADMIN_o_Mismousuario = function(req, res, next) {

    var usuario = req.usuario;
    var id = req.params.id;

    if (usuario.role === 'ADMIN_ROLE' || usuario._id === id) {
        next();
        return;
    } else {

        return res.status(401).json({
            ok: false,
            mensaje: 'Token incorrecto - is not an admin user and is not yourself',
            errors: { message: 'Is not an admin or yourself, you can not do it' }
        });
    }
};