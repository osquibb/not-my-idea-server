const express = require('express');
const bodyParser = require('body-parser');
const passport = require('passport');
const authenticate = require('../authenticate');
const cors = require('../cors');
const User = require('../models/users');
const Ideas = require('../models/ideas');

const usersRouter = express.Router();
usersRouter.use(bodyParser.json());

usersRouter.get('/', cors.corsWithOptions, authenticate.verifyUser, authenticate.verifyAdmin, (req, res, next) => {
    Users.find({})
      .populate('likedIdeas')
      .populate('flaggedIdeas')
      .then(users => {
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.json(users);
      }, err => next(err))
      .catch(err => next(err));
});

usersRouter.post('/signup', cors.corsWithOptions, (req, res, next) => {
  User.register(new User({username: req.body.username}), 
    req.body.password, (err, user) => {
    if(err) {
      res.statusCode = 500;
      res.setHeader('Content-Type', 'application/json');
      res.json({err: err});
    }
    else {
      if (req.body.firstname) {
        user.firstname = req.body.firstname;
      }
      if (req.body.lastname) {
        user.lastname = req.body.lastname;
      }
      user.save((err, user) => {
        if (err) {
          res.statusCode = 500;
          res.setHeader('Content-Type', 'application/json');
          res.json({err: err});
          return;
        }
        passport.authenticate('local')(req, res, () => {
          res.statusCode = 200;
          res.setHeader('Content-Type', 'application/json');
          res.json({success: true, status: 'Registration Successful!'});
        });
      });
    }
  });
});

usersRouter.post('/login', cors.corsWithOptions, passport.authenticate('local'), (req, res) => {
  
  let token = authenticate.getToken({_id: req.user._id});

  res.statusCode = 200;
  res.setHeader('Content-Type', 'application/json');
  res.json({
            success: true,
            token: token, 
            status: 'You are successfully logged in'
          });
});

usersRouter.get('/logout', cors.corsWithOptions, (req, res) => {
  if (req.session) {
    req.session.destroy();
    res.clearCookie('session-id');
    res.redirect('/');
  }
  else {
    var err = new Error('You are not logged in!');
    err.status = 403;
    next(err);
  }
});

// NOTE: Every user has likedIdeas and flaggedIdeas
// arrays by default.  Empty arrays at start.


usersRouter.route('/likedIdeas')
.all(cors.corsWithOptions, authenticate.verifyUser, (req,res,next) => {
  next();
})
.get((req,res,next) => {
  User.findById(req.user._id)
  .populate('likedIdeas')
  .then(user => {
    if (user) {
      res.statusCode = 200;
      res.setHeader('Content-Type', 'application/json');
      res.json(user.likedIdeas);
    }
    else {
      let err = new Error('You are not logged in!');
      err.status = 403;
      next(err);
    }
  }, err => next(err))
  .catch(err => next(err));
})
.post((req,res,next) => {
  User.findById(req.user._id)
  .then(user => {
    if (user) {
      for (let i=0; i < req.body.length; i++) {
        // if idea not already in user's liked ideas
        if (user.likedIdeas.indexOf(req.body[i]._id) === -1) {
          // find idea in Ideas collection and increment likedIdeas
          Ideas.findByIdAndUpdate(req.body[i]._id, {
            $inc: {likedRank: 1}
          }, { new: true })
          // then add idea id to user's liked ideas
          .then(idea => {
            user.likedIdeas.push(idea._id);
          }, err => next(err))
        }
      }
      user.save()
      .then(user => {
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.json(user.likedIdeas);
      }, err => next(err));
    }
    else {
      let err = new Error('You are not logged in!');
      err.status = 403;
      next(err);
    }
  }, err => next(err))
  .catch(err => next(err));
});

usersRouter.delete('/likedIdeas/:ideaId', cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
  User.findById(req.user._id)
  .then(user => {
    if (user) {
      const foundIdx = user.likedIdeas.indexOf(req.params.ideaId);
      // if idea in user's liked ideas
      if (foundIdx !== -1) {
        Ideas.findByIdAndUpdate(req.params.ideaId, {
          $inc: {likedRank: -1}
        }, { new: true }))
        .then() //...
        user.likedIdeas.splice(foundIdx, 1);
        user.save()
          .then(user => {
            res.statusCode = 200;
            res.setHeader('Content-Type', 'application/json');
            res.json(user.likedIdeas);
          }, err => next(err));
      }
      else {
        let err = new Error('Idea ' + req.params.ideaId + ' not found in likedIdeas');
        err.status = 404;
        return next(err);
      }
    }
    else {
      let err = new Error('You are not logged in!');
      err.status = 403;
      next(err);
    }
  }, err => next(err))
  .catch(err => next(err));
});

usersRouter.route('/flaggedIdeas')
.all(cors.corsWithOptions, authenticate.verifyUser, (req,res,next) => {
  next();
})
.get((req,res,next) => {
  User.findById(req.user._id)
  .populate('flaggedIdeas')
  .then(user => {
    if (user) {
      res.statusCode = 200;
      res.setHeader('Content-Type', 'application/json');
      res.json(user.flaggedIdeas);
    }
    else {
      let err = new Error('You are not logged in!');
      err.status = 403;
      next(err);
    }
  }, err => next(err))
  .catch(err => next(err));
})
.post((req,res,next) => {
  User.findById(req.user._id)
  .then(user => {
    if (user) {
      for (let i=0; i < req.body.length; i++) {
        if (user.flaggedIdeas.indexOf(req.body[i]._id) === -1) {
          user.flaggedIdeas.push(req.body[i]._id);
        }
      }
      user.save()
      .then(user => {
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.json(user.flaggedIdeas);
      }, err => next(err));
    }
    else {
      let err = new Error('You are not logged in!');
      err.status = 403;
      next(err);
    }
  }, err => next(err))
  .catch(err => next(err));
});

usersRouter.delete('/flaggedIdeas/:ideaId', cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
  User.findById(req.user._id)
  .then(user => {
    if (user) {
      const foundIdx = user.flaggedIdeas.indexOf(req.params.ideaId);
      if (foundIdx !== -1) {
        user.flaggedIdeas.splice(foundIdx, 1);
        user.save()
          .then(user => {
            res.statusCode = 200;
            res.setHeader('Content-Type', 'application/json');
            res.json(user.flaggedIdeas);
          }, err => next(err));
      }
      else {
        let err = new Error('Idea ' + req.params.ideaId + ' not found in flaggedIdeas');
        err.status = 404;
        return next(err);
      }
    }
    else {
      let err = new Error('You are not logged in!');
      err.status = 403;
      next(err);
    }
  }, err => next(err))
  .catch(err => next(err));
});

// TODO: OAuth implementation...

module.exports = usersRouter;