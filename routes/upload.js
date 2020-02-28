var express = require('express');
var fileUpload = require('express-fileupload');
var fs = require('fs');

var app = express();

var Usuario = require('../models/usuario');
var Medico = require('../models/medico');
var Hospital = require('../models/hospital');

// default options
app.use(fileUpload());
app.put('/:tipo/:id', (req, res, next) => {

    var tipo = req.params.tipo;
    var id = req.params.id;

    // tipos de coleccion
    var tiposValidos = ['usuarios', 'hospitales', 'medicos']
    if (tiposValidos.indexOf(tipo) < 0) {
        return res.status(400).json({
            ok: false,
            mensaje: 'Colección(tipo) no válida!',
            errors: { Message: 'Debe seleccionar un tipo de estos: ' + tiposValidos.join(', ') }
        });
    }

    if (!req.files) {
        return res.status(400).json({
            ok: false,
            mensaje: 'No seleccionó ningún archivo!',
            errors: { Message: 'Debe seleccionar una imagen' }
        });
    }

    // Obtener nombre del archivo
    var archivo = req.files.imagen;
    var nombreCortado = archivo.name.split('.');
    var extensionArchivo = nombreCortado[nombreCortado.length - 1];

    // Solo estas extensiones validas
    var extensionesValidas = ['jpg', 'jpeg', 'png', 'img', 'gif'];

    if (extensionesValidas.indexOf(extensionArchivo) < 0) {
        return res.status(400).json({
            ok: false,
            mensaje: 'Extensión no válida!',
            errors: { Message: 'Debe seleccionar un archivo con extensión: ' + extensionesValidas.join(', ') }
        });
    }

    // Nombre de archivo personalizado
    // 234526346346-444.jpg
    var nombreArchivo = `${id}-${new Date().getMilliseconds() }.${extensionArchivo }`;

    // Mover el archivo del temporal a un path
    var path = `./uploads/${tipo}/${nombreArchivo}`;

    archivo.mv(path, err => {
        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: 'Error al mover archivo!',
                errors: err
            });
        }
    });

    subirPorTipo(tipo, id, nombreArchivo, res);

    // res.status(200).json({
    //     ok: true,
    //     mensaje: 'Archivo Movido',
    //     extensionArchivo: extensionArchivo

    // });

});


function subirPorTipo(tipo, id, nombreArchivo, res) {

    if (tipo === 'usuarios') {
        Usuario.findById(id, (err, usuario) => {

            if (err) {
                return res.status(400).json({
                    ok: false,
                    mensaje: 'Error Buscando el usuario!'
                });
            }
            if (usuario == null) {
                return res.status(400).json({
                    ok: false,
                    mensaje: 'El Usuario no existe!'
                });
            }
            var pathViejo = './uploads/usuarios/' + usuario.img;

            // Si exsiste, elimina la imagen anterior
            if (fs.existsSync(pathViejo)) {
                fs.unlinkSync(pathViejo);
            }
            usuario.img = nombreArchivo;
            usuario.save((err, usuarioActualizado) => {

                if (err) {
                    return res.status(400).json({
                        ok: false,
                        mensaje: 'Error actualizando el usuario'
                    });
                }

                usuarioActualizado.password = ':)'
                return res.status(200).json({
                    ok: true,
                    mensaje: 'Imagen de usuario Actualizada',
                    usuario: usuarioActualizado
                });

            });
        });

    }

    if (tipo === 'medicos') {
        Medico.findById(id, (err, medico) => {

            if (err) {
                return res.status(400).json({
                    ok: false,
                    mensaje: 'Error Buscando el medico!'
                });
            }
            if (medico == null) {
                return res.status(400).json({
                    ok: false,
                    mensaje: 'El médico no existe!'
                });
            }
            var pathViejo = './uploads/medicos/' + medico.img;

            // Si exsiste, elimina la imagen anterior
            if (fs.existsSync(pathViejo)) {
                fs.unlinkSync(pathViejo);
            }
            medico.img = nombreArchivo;
            medico.save((err, medicoActualizado) => {

                if (err) {
                    return res.status(400).json({
                        ok: false,
                        mensaje: 'Error actualizando el medico'
                    });
                }

                return res.status(200).json({
                    ok: true,
                    mensaje: 'Imagen de medico Actualizada',
                    medico: medicoActualizado
                });

            });
        });
    }

    if (tipo === 'hospitales') {
        Hospital.findById(id, (err, hospital) => {
            if (err) {
                return res.status(400).json({
                    ok: false,
                    mensaje: 'Error Buscando el hospital!'
                });
            }
            if (hospital == null) {
                return res.status(400).json({
                    ok: false,
                    mensaje: 'El hospital no existe!'
                });
            } else {
                var pathViejo = './uploads/hospitales/' + hospital.img;

                // Si exsiste, elimina la imagen anterior
                if (fs.existsSync(pathViejo)) {
                    fs.unlinkSync(pathViejo);
                }
                hospital.img = nombreArchivo;
                hospital.save((err, hospitalActualizado) => {

                    if (err) {
                        return res.status(400).json({
                            ok: false,
                            mensaje: 'Error actualizando el hospital'
                        });
                    }

                    return res.status(200).json({
                        ok: true,
                        mensaje: 'Imagen de hospital Actualizada',
                        medico: hospitalActualizado
                    });

                });
            }
        });

    }
}

module.exports = app;