const express = require('express');
const bodyParser = require('body-parser');
const authenticate = require('../authenticate');
const cors = require('../cors');

const Ideas = require('../models/ideas');

const ideasRouter = express.Router();
ideasRouter.use(bodyParser.json());

ideasRouter.route('/')
.options(cors.corsWithOptions, (req, res) => res.sendStatus(200))
.get(cors.cors, (req,res,next) => { 
  Ideas.find({})
  .then(ideas => {
    res.statusCode = 200;
    res.setHeader('Content-Type', 'application/json');
    res.json(ideas);
  }, err => next(err))
  .catch(err => next(err));
})
.put(cors.corsWithOptions, authenticate.verifyUser, authenticate.verifyAdmin, (req,res,next) => {
  res.statusCode = 403;
  res.setHeader('Content-Type', 'text/plain');
  res.end('PUT operation not supported on /ideas');
})
.post(cors.corsWithOptions, authenticate.verifyUser, (req,res,next) => {
  Ideas.create({
    author: req.user._id,
    text: req.body.text
  })
  .then(idea => {
    console.log('Idea Created: ', idea);
    res.statusCode = 200;
    res.setHeader('Content-Type', 'application/json');
    res.json(idea);
  }, err => next(err))
  .catch(err => next(err));
})
.delete(cors.corsWithOptions, authenticate.verifyUser, authenticate.verifyAdmin, (req,res,next) => {
  res.statusCode = 403;
  res.setHeader('Content-Type', 'text/plain');
  res.end('DELETE operation not supported on /ideas');
});

ideasRouter.route('/:ideaId')
.options(cors.corsWithOptions, (req, res) => res.sendStatus(200))
.get(cors.cors, (req,res,next) => {
  Ideas.findById(req.params.ideaId)
  .then(idea => {
    res.statusCode = 200;
    res.setHeader('Content-Type', 'application/json');
    res.json(idea); 
  }, err => next(err))
  .catch(err => next(err));
})
.put(cors.corsWithOptions, authenticate.verifyUser, (req,res,next) => {
  Ideas.findOneAndUpdate({$and: [{author: req.user._id}, {_id: req.params.ideaId}]}, {
    $inc: {likedIdeas: 1}
  }, { new: true })
  .then(idea => {
    res.statusCode = 200;
    res.setHeader('Content-Type', 'application/json');
    res.json(idea);  
  }, err => next(err))
  .catch(err => next(err));
})
.post(cors.corsWithOptions, authenticate.verifyUser, authenticate.verifyAdmin, (req,res,next) => {
  res.statusCode = 403;
  res.setHeader('Content-Type', 'text/plain');
  res.end('POST operation not supported on /ideas/' + req.params.ideaId);
})
.delete(cors.corsWithOptions, authenticate.verifyUser, authenticate.verifyAdmin, (req,res,next) => {
  Ideas.deleteOne({_id: req.params.ideaId})
  .then(idea => {
    console.log("Idea Deleted: ", idea);
    res.statusCode = 200;
    res.setHeader('Content-Type', 'application/json');
    res.json(idea);
  }, err => next(err))
  .catch(err => next(err));
});

module.exports = ideasRouter;