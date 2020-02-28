var express = require('express');

var mdAutenticacion = require('../middlewares/autenticacion');

var app = express();

var Medico = require('../models/medico');


//  ===================================
//   Obtener todos los Medicos Creados 
//  ===================================
app.get('/', (req, res, next) => {
    var desde = req.query.desde || 0;
    desde = Number(desde);

    Medico.find({})
        .skip(desde)
        .limit(5)
        .populate('usuario', 'nombre email')
        .populate('hospital')
        .exec(
            (err, medicos) => {
                if (err) {
                    return res.status(500).json({
                        ok: false,
                        mensaje: 'Error en base de datos cargando los medicos!',
                        errors: err
                    });
                }
                Medico.count({}, (err, conteo) => {
                    res.status(200).json({
                        ok: true,
                        Total: conteo,
                        Medicos: medicos
                    });
                });

            });
});

//  ===================================
//  Actualizar Medicos 
//  ===================================
app.put('/:id', mdAutenticacion.verificaToken, (req, res) => {

    var id = req.params.id;
    var body = req.body;
    Medico.findById(id, (err, medicofinded) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: 'Error al buscar el medico',
                errors: err
            });
        }
        if (!medicofinded) {
            return res.status(400).json({
                ok: false,
                mensaje: 'El medico con el id' + id + ' no existe',
                errors: { message: 'No existe un medico con ese ID' }
            });
        }

        medicofinded.nombre = body.nombre;
        medicofinded.usuario = req.usuario._id;
        medicofinded.hospital = body.hospital;

        medicofinded.save((err, medicdoGuardado) => {
            if (err) {
                return res.status(400).json({
                    ok: false,
                    mensaje: 'Error al actualizar el medico',
                    errors: err
                });
            }

            res.status(200).json({
                ok: true,
                medico: medicdoGuardado
            });

        });

    });

});


//  ===================================
//  Crear medicos en base de datos 
//  ===================================

app.post('/', mdAutenticacion.verificaToken, (req, res) => {

    var body = req.body;

    var medico = new Medico({
        nombre: body.nombre,
        usuario: req.usuario._id,
        hospital: body.hospital
    });

    medico.save((err, medicoGuardado) => {
        if (err) {
            return res.status(409).json({
                ok: false,
                mensaje: 'Error al crear el medico!',
                errors: err
            });
        }

        res.status(201).json({
            ok: true,
            Medicocreado: medicoGuardado,
        });
    });
});

//  ===================================
//  Eliminar medico de base de datos
//  ===================================

app.delete('/:id', mdAutenticacion.verificaToken, (req, res) => {

    var id = req.params.id;
    Medico.findByIdAndRemove(id, (err, medicoBorrado) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: 'Error al borrar el medico!',
                errors: err
            });
        }

        if (!medicoBorrado) {
            return res.status(400).json({
                ok: false,
                mensaje: 'No existe un medico con ese ID!'
            });
        }

        res.status(200).json({
            ok: true,
            Medico: medicoBorrado
        });

    });

});


module.exports = app;