const express = require('express');

// Importación de controladores
const {GET_TABLA_SII} = require('./controller_sii');

router.get('/GET_TABLA_SII',GET_TABLA_SII);

module.exports = router;
