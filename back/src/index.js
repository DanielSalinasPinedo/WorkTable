const fs = require('fs');
import app from './app.js'
const https = require('https');

import "./database/connection.js"

const options = {
  key: fs.readFileSync('localhost-key.pem'),
  cert: fs.readFileSync('localhost.pem')
};

https.createServer(options, app).listen(app.get('port'), () => {
  console.log('Servidor corriendo en https://localhost');
});


console.log('servidor chat/farma/mesa iniciado', app.get('port'))