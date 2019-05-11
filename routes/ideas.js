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
  Ideas.create({
    text: req.body.text,
    rank: req.body.rank
  })
  .then(idea => {
    console.log('Idea Created: ', idea);
    res.statusCode = 200;
    res.setHeader('Content-Type', 'application/json');
    res.json(idea);
  }, err => next(err))
  .catch(err => next(err));
});

ideasRouter.route('/:ideaId')
.put((req,res,next) => {
  Ideas.findById(req.params.ideaId)
  .then(idea => {
    res.statusCode = 200;
    res.setHeader('Content-Type', 'application/json');
    res.json(idea);  
  }, err => next(err))
  .catch(err => next(err));
})
.delete((req,res,next) => {
  Ideas.deleteOne({id: req.params.ideaId})
  .then(idea => {
    console.log("Idea Deleted: ", idea);
    res.statusCode = 200;
    res.setHeader('Content-Type', 'application/json');
    res.json(idea);
  }, err => next(err));
});


// .put, .delete, etc...

module.exports = ideasRouter;