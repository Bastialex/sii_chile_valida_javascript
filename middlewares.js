const path = require('path');


// Manejador de errores
function errorHandler(err, req, res, next) {
    console.error('Error en la aplicación:', err);
    res.status(500).send('Error en la aplicación');
}

// Exportar middleware y manejador de errores
module.exports = { errorHandler };
