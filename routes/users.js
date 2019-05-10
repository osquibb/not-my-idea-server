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
    res.json(users);
  }, err => next(err))
  .catch(err => next(err));
})

usersRouter.post('/signup', (req, res, next) => {
  User.findOne({username: req.body.username})
  .then((user) => {
    if(user !== null) {
      var err = new Error('User ' + req.body.username + ' already exists!');
      err.status = 403;
      next(err);
    }
    else {
      return User.create({
        username: req.body.username,
        password: req.body.password});
    }
  })
  .then((user) => {
    res.statusCode = 200;
    res.setHeader('Content-Type', 'application/json');
    res.json({status: 'Registration Successful!', user: user});
  }, (err) => next(err))
  .catch((err) => next(err));
});

// .get (for /login), .put, .delete, etc...

module.exports = usersRouter;