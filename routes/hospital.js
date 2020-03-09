var express = require("express");

var mdAutenticacion = require("../middlewares/autenticacion");

var app = express();

var Hospital = require("../models/hospital");

//  ===================================
//   Obtener todos los Hospitales Creados
//  ===================================
app.get("/", (req, res, next) => {
    var desde = req.query.desde || 0;
    desde = Number(desde);

    Hospital.find({})
        .skip(desde)
        .limit(5)
        .populate("usuario", "nombre email")
        .exec((err, hostpiales) => {
            if (err) {
                return res.status(500).json({
                    ok: false,
                    mensaje: "Error en base de datos cargando los hospitales!",
                    errors: err
                });
            }
            Hospital.count({}, (err, conteo) => {
                res.status(200).json({
                    ok: true,
                    Total: conteo,
                    Hospitales: hostpiales
                });
            });
        });
});

// ==========================================
// Obtener Hospital por ID
// ==========================================
app.get("/:id", (req, res) => {
    var id = req.params.id;
    Hospital.findById(id)
        .populate("usuario", "nombre img email")
        .exec((err, hospital) => {
            if (err) {
                return res.status(500).json({
                    ok: false,
                    mensaje: "Error al buscar hospital",
                    errors: err
                });
            }
            if (!hospital) {
                return res.status(400).json({
                    ok: false,
                    mensaje: "El hospital con el id " + id + " no existe",
                    errors: { message: "No existe un hospital con ese ID" }
                });
            }
            res.status(200).json({
                ok: true,
                hospital: hospital
            });
        });
});

//  ===================================
//  Actualizar Hospital
//  ===================================
app.put("/:id", mdAutenticacion.verificaToken, (req, res) => {
    var id = req.params.id;
    var body = req.body;
    Hospital.findById(id, (err, hostpialfinded) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: "Error al buscar el hospital",
                errors: err
            });
        }
        if (!hostpialfinded) {
            return res.status(400).json({
                ok: false,
                mensaje: "El hospital con el id" + id + " no existe",
                errors: { message: "No existe un hospital con ese ID" }
            });
        }

        hostpialfinded.nombre = body.nombre;
        hostpialfinded.usuario = req.usuario._id;

        hostpialfinded.save((err, hospitalGuardado) => {
            if (err) {
                return res.status(400).json({
                    ok: false,
                    mensaje: "Error al actualizar el hospital",
                    errors: err
                });
            }

            res.status(200).json({
                ok: true,
                hostpial: hospitalGuardado
            });
        });
    });
});

//  ===================================
//  Crear hospitales en base de datos
//  ===================================

app.post("/", mdAutenticacion.verificaToken, (req, res) => {
    var body = req.body;

    var hospital = new Hospital({
        nombre: body.nombre,
        usuario: req.usuario._id
    });

    hospital.save((err, hospitalGuardado) => {
        if (err) {
            return res.status(409).json({
                ok: false,
                mensaje: "Error al crear el hospital!",
                errors: err
            });
        }

        res.status(201).json({
            ok: true,
            Hospitalcreado: hospitalGuardado
        });
    });
});

//  ===================================
//  Eliminar hospital de base de datos
//  ===================================

app.delete("/:id", mdAutenticacion.verificaToken, (req, res) => {
    var id = req.params.id;
    Hospital.findByIdAndRemove(id, (err, hospitalBorrado) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: "Error al borrar el hospital!",
                errors: err
            });
        }

        if (!hospitalBorrado) {
            return res.status(400).json({
                ok: false,
                mensaje: "No existe un hospital con ese ID!"
            });
        }

        res.status(200).json({
            ok: true,
            Hospital: hospitalBorrado
        });
    });
});

module.exports = app;