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
})
.post((req,res,next) => {
  Ideas.create(req.body)
  .then(idea => {
    console.log('Idea Created ', idea);
    res.statusCode = 200;
    res.setHeader('Content-Type', 'application/json');
    res.json(idea);
  }, err => next(err))
  .catch(err => next(err));
});

// .put, .delete, etc...

module.exports = ideasRouter;