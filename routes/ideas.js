const express = require('express');
const bodyParser = require('body-parser');
const authenticate = require('../authenticate');
const cors = require('../cors');

const Ideas = require('../models/ideas');
const User = require('../models/users');

const ideasRouter = express.Router();
ideasRouter.use(bodyParser.json());

ideasRouter.route('/')
.options(cors.corsWithOptions, (req, res) => res.sendStatus(200))
.get(cors.cors, (req,res,next) => { 
  Ideas.find({})
  .populate('author')
  .then(ideas => {
    res.statusCode = 200;
    res.setHeader('Content-Type', 'application/json');
    res.json(ideas);
  }, err => next(err))
  .catch(err => next(err));
})
.put(cors.corsWithOptions, (req,res,next) => {
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
.delete(cors.corsWithOptions, (req,res,next) => {
  res.statusCode = 403;
  res.setHeader('Content-Type', 'text/plain');
  res.end('DELETE operation not supported on /ideas');
});

ideasRouter.route('/:ideaId')
.options(cors.corsWithOptions, (req, res) => res.sendStatus(200))
.get(cors.cors, (req,res,next) => {
  Ideas.findById(req.params.ideaId)
  .populate('author')
  .then(idea => {
    res.statusCode = 200;
    res.setHeader('Content-Type', 'application/json');
    res.json(idea); 
  }, err => next(err))
  .catch(err => next(err));
})
.put(cors.corsWithOptions, (req,res,next) => {
  res.statusCode = 403;
  res.setHeader('Content-Type', 'text/plain');
  res.end('PUT operation not supported on /ideas/' + req.params.ideaId);
})
.post(cors.corsWithOptions, (req,res,next) => {
  res.statusCode = 403;
  res.setHeader('Content-Type', 'text/plain');
  res.end('POST operation not supported on /ideas/' + req.params.ideaId);
})

// TODO: when deleting an idea, needs to be deleted from
// every user's likedIdeas and flaggedIdeas ***
.delete(cors.corsWithOptions, authenticate.verifyUser, authenticate.verifyAdmin, (req,res,next) => {
  User.update({},
    {$pull: { "likedIdeas": req.params.ideaId,
              "flaggedIdeas": req.params.ideaId }
  })
  .then(() => {
    Ideas.deleteOne({_id: req.params.ideaId})
    .then(idea => {
      console.log("Idea Deleted: ", idea);
      res.statusCode = 200;
      res.setHeader('Content-Type', 'application/json');
      res.json(idea);
    }, err => next(err))})
  .catch(err => next(err));
});

module.exports = ideasRouter;