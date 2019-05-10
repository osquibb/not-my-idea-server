const express = require('express');
const bodyParser = require('body-parser');

const Ideas = require('../models/ideas');

const ideasRouter = express.Router();

ideasRouter.use(bodyParser.json());

ideasRouter.route('/')
.get((req,res,next) => { 
  Ideas.find({})
  .then(ideas => {
    res.statusCode = 200;
    res.setHeader('Content-Type', 'application/json');
    res.json(ideas);
  }, err => next(err))
  .catch(err => next(err));
});

//.post, .delete, etc...