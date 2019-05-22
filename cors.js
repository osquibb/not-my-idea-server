const cors = require('cors');

const whitelist = ['http://localhost:3000', 'https://localhost:3443'];

let corsOptionsDelegate = (req, callback) => {
  let corsOptions;

  if (whitelist.indexOf(req.header('Origin')) !== -1) {
    corsOptions = { origin: true };
  }
  else {
    corsOptions = { origin: false };
  }
  callback(null, corsOptions);
};

// standard cors, all origins permitted
exports.cors = cors();

// custom cors with options, only permitting whitelist origins
exports.corsWithOptions = cors(corsOptionsDelegate);