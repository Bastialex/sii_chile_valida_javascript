const express = require('express');
const cors = require('cors');
const routes = require('./routes');
const { errorHandler } = require('./middlewares');

const app = express();

app.use(cors());
app.use(express.json());
// Aqui guardamos las rutas, este proyecto era mas grande, dejé justo lo necesario
app.use('/api', routes);
// Manejamos errores con Middleware
app.use(errorHandler);

const PORT = process.env.PORT || 8080;//por si tienes un puerto en tu .env. Recuerda usar require('dotenv'); si tienes uno
app.listen(PORT, () => {
  //Respuesta para el servidor
  console.log(`Validado en puerto ${PORT}`);
});
