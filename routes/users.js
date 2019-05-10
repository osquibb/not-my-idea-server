const express = require('express');
const bodyParser = require('body-parser');

const Users = require('../models/users');

const usersRouter = express.Router();

usersRouter.use(bodyParser.json());

usersRouter.route('/')
.get((req,res,next) => {
  Users.find({})
  .then(users => {
    res.statusCode = 200;
    res.setHeader('Content-Type', 'application/json');
    res.json({text: 'All Users'});
  }, err => next(err))
  .catch(err => next(err));
});

//.post, .delete, etc...