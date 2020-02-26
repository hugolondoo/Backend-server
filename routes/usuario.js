var express = require('express');
var bcrypt = require('bcryptjs');
var jwt = require('jsonwebtoken');

var mdAutenticacion = require('../middlewares/autenticacion');

var app = express();

var Usuario = require('../models/usuario');

//  ===================================
//   Obtener todos los usuarios 
//  ===================================
app.get('/', (req, res, next) => {
    Usuario.find({}, 'nombre email img role')
        .exec(
            (err, usuarios) => {
                if (err) {
                    return res.status(500).json({
                        ok: false,
                        mensaje: 'Error en base de datos cargando usuarios!',
                        errors: err
                    });
                }

                res.status(200).json({
                    ok: true,
                    Usuarios: usuarios
                });

            });

});


//  ===================================
//  Actualizar usuarios 
//  ===================================
app.put('/:id', mdAutenticacion.verificaToken, (req, res) => {

    var id = req.params.id;
    var body = req.body;
    Usuario.findById(id, (err, userfinded) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: 'Error al buscar usuario',
                errors: err
            });
        }
        if (!userfinded) {
            return res.status(400).json({
                ok: false,
                mensaje: 'El usuario con el id' + id + ' no existe',
                errors: { message: 'No existe un usuario con ese ID' }
            });
        }

        userfinded.nombre = body.nombre;
        userfinded.email = body.email;
        userfinded.role = body.role;

        userfinded.save((err, usuarioGuardado) => {
            if (err) {
                return res.status(400).json({
                    ok: false,
                    mensaje: 'Error al actualizar usuario',
                    errors: err
                });
            }

            usuarioGuardado.password = ':)';

            res.status(200).json({
                ok: true,
                Usuario: usuarioGuardado
            });

        });

    });

});


//  ===================================
//  Crear usuarios en base de datos 
//  ===================================

app.post('/', mdAutenticacion.verificaToken, (req, res) => {

    var body = req.body;

    var usuario = new Usuario({
        nombre: body.nombre,
        email: body.email,
        password: bcrypt.hashSync(body.password, 10),
        img: body.img,
        role: body.role
    });

    usuario.save((err, usuarioGuardado) => {
        if (err) {
            return res.status(409).json({
                ok: false,
                mensaje: 'Error al crear usuario!',
                errors: err
            });
        }

        res.status(201).json({
            ok: true,
            Usuariocreado: usuarioGuardado,
            Usuariotoken: req.usuario
        });
    });
});

//  ===================================
//  Eliminar usuario de base de datos
//  ===================================

app.delete('/:id', (req, res) => {

    var id = req.params.id;

    Usuario.findByIdAndRemove(id, mdAutenticacion.verificaToken, (err, usuarioBorrado) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: 'Error al borrar usuario!',
                errors: err
            });
        }

        if (!usuarioBorrado) {
            return res.status(400).json({
                ok: false,
                mensaje: 'No existe un usuario con ese ID!'
            });
        }


        res.status(200).json({
            ok: true,
            Usuario: usuarioBorrado
        });

    });

});

module.exports = app;