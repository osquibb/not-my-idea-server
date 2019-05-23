const express = require('express');
const bodyParser = require('body-parser');
const passport = require('passport');
const authenticate = require('../authenticate');
const cors = require('../cors');
const User = require('../models/users');
const Ideas = require('../models/ideas');

const usersRouter = express.Router();
usersRouter.use(bodyParser.json());

usersRouter.options('*', cors.corsWithOptions, (req,res) => res.statusCode(200));

usersRouter.get('/', cors.corsWithOptions, authenticate.verifyUser, authenticate.verifyAdmin, (req, res, next) => {
    User.find({})
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

usersRouter.post('/login', cors.corsWithOptions, (req, res, next) => {
  
  passport.authenticate('local', (err, user, info) => {
    if (err)
      return next(err);
    if (!user) {
      res.statusCode = 401;
      res.setHeader('Content-Type', 'application/json');
      res.json({
                success: false,
                status: 'Login Unsuccessful',
                err: info
              });
    }
    req.logIn(user, (err) => {
      if (err) {
        res.statusCode = 401;
        res.setHeader('Content-Type', 'application/json');
        res.json({
                  success: false,
                  status: 'Login Unsuccessful',
                  err: 'Could not log in user'
                });
      }
      let token = authenticate.getToken({_id: req.user._id});
      res.statusCode = 200;
      res.setHeader('Content-Type', 'application/json');
      res.json({
                success: true,
                status: 'Login Successful',
                token: token
              });
    });
  })(req, res, next);
});

router.get('/checkJWTTOKEN', cors.corsWithOptions, (req, res) => {
  passport.authenticate('jwt', {session: false}, (err, user, info) => {
    if (err)
      next(err);
    if (!user) {
      res.statusCode = 401;
      res.setHeader('Content-Type', 'application/json');
      res.json({
        status: 'JWT Invalid',
        success: false,
        err: info
      });
    }
    else {
      res.statusCode = 200;
      res.setHeader('Content-Type', 'application/json');
      res.json({
        status: 'JWT Valid',
        success: true,
        user: user
      });
    }
  })(req, res);
})


// TODO: handle user logouts (with jwt?  delete jwt on client side?)

// NOTE: Every user has likedIdeas and flaggedIdeas
// arrays by default.  Empty arrays at start.

// *** TODO: should i add :userId param? instead of relying on
// req.user only ?

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

// user adds idea ids (from an array) to their likedIdeas
// and each idea's likedRank is incremented
.post((req,res,next) => {
  User.findById(req.user._id)
  .then(user => {
    if (user) {
      for (let i=0; i < req.body.length; i++) {
        if (user.likedIdeas.indexOf(req.body[i]._id) === -1) {
          Ideas.findByIdAndUpdate(req.body[i]._id, {
            $inc: {likedRank: 1}
          }, { new: true })
          .then(idea => {
          }, err => next(err));
        }
      }    
    }
    return user;   
  }, err => next(err))
  .then(user => {
    if (user) {
      for (let i=0; i < req.body.length; i++) {
        if (user.likedIdeas.indexOf(req.body[i]._id) === -1) {
          user.likedIdeas.push(req.body[i]._id);
        }
      }
      user.save()
      .then(user => {
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.json(user.likedIdeas);
      }, err => next(err));
    }
  }, err => next(err))
  .catch(err => next(err))
});

// user deletes an idea from their likedIdeas and the idea's
// likedRank is decremented
usersRouter.delete('/likedIdeas/:ideaId', cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
  User.findById(req.user._id)
  .then(user => {
    if (user) {
      const foundIdx = user.likedIdeas.indexOf(req.params.ideaId);
      // if idea in user's likedIdeas
      if (foundIdx !== -1) {
        // find idea in Ideas collection and decrement likedRank
        Ideas.findByIdAndUpdate(req.params.ideaId, {
          $inc: {likedRank: -1}
        }, { new: true })
        // then remove idea id from user's likedIdeas
        .then(idea => {
          user.likedIdeas.splice(user.likedIdeas.indexOf(idea._id), 1);
          // save user and return user's likedIdeas
          user.save()
          .then(user => {
            res.statusCode = 200;
            res.setHeader('Content-Type', 'application/json');
            res.json(user.likedIdeas);
          }, err => next(err));
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

// user adds idea ids (from an array) to their flaggedIdeas
// and each idea's flaggedRank is incremented
.post((req,res,next) => {
  User.findById(req.user._id)
  .then(user => {
    if (user) {
      for (let i=0; i < req.body.length; i++) {
        if (user.flaggedIdeas.indexOf(req.body[i]._id) === -1) {
          Ideas.findByIdAndUpdate(req.body[i]._id, {
            $inc: {flaggedRank: 1}
          }, { new: true })
          .then(idea => {
          }, err => next(err));
        }
      }    
    }
    return user;   
  }, err => next(err))
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
  }, err => next(err))
  .catch(err => next(err))
});

// user deletes an idea from their flaggedIdeas and the idea's
// flaggedRank is decremented
usersRouter.delete('/flaggedIdeas/:ideaId', cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
  User.findById(req.user._id)
  .then(user => {
    if (user) {
      const foundIdx = user.flaggedIdeas.indexOf(req.params.ideaId);
      // if idea in user's flaggedIdeas
      if (foundIdx !== -1) {
        // find idea in Ideas collection and decrement flaggedRank
        Ideas.findByIdAndUpdate(req.params.ideaId, {
          $inc: {flaggedRank: -1}
        }, { new: true })
        // then remove idea id from user's flaggedIdeas
        .then(idea => {
          user.flaggedIdeas.splice(user.flaggedIdeas.indexOf(idea._id), 1);
          // save user and return user's flaggedIdeas
          user.save()
          .then(user => {
            res.statusCode = 200;
            res.setHeader('Content-Type', 'application/json');
            res.json(user.flaggedIdeas);
          }, err => next(err));
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