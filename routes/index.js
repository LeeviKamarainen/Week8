

var express = require('express');
var router = express.Router();
const bcrypt = require('bcryptjs');
const mongoose = require("mongoose");
const {body, validationResult} = require('express-validator');
const User = require("../models/Users");
const passport = require("passport");

const validateToken = require('../auth/validateToken.js')

const initializePassport = require('../passport-config')
initializePassport(passport, getUserByUsername, getUserByID)

const users = [{"username":"test123","password":"$2a$10$.elcG9VTzfixsG5RnyS3QuvCcUYi/SzPoculqpFv5S8VTc9ZbcZs.","id":4726}];

/* GET home page. */
router.get('/', (req, res, next) => {
  res.render('index', { title: 'Express' });
});


router.get('/api/user/register', checkNotAuthenticated, (req, res, next) => {
  res.render('register')
});


router.get('/api/user/login', checkNotAuthenticated, (req, res, next) => {
  res.render('login')

});

router.post('/api/user/login', passport.authenticate('local', {
}), (req,res) => {
  res.status(200).send(req.cookies['connect.sid'])
}
)

router.get('/api/user/list', (req, res, next) => {
  res.send(users)

});

router.get('/api/secret', checkAuthenticated, (req,res,next) => {
  

})

router.post("/api/user/register",
  body("username").isLength({min: 3}).trim().escape(),
  body("password").isLength({min: 5}),
  (req, res, next) => {
    const errors = validationResult(req);
    if(!errors.isEmpty()) {
      return res.status(400).json({errors: errors.array()})

    }
    let userFound = 0;
    for (let index = 0; index < users.length; index++) {
      if(users[index] == req.body.username) {
        userFound = 1;
        break
      }
    }
      console.log("Adding new user");
      if(userFound == 1) {
        return res.status(400).json({username: "Username already in use."})
      } else {
        bcrypt.genSalt(10, (err, salt) => {
          bcrypt.hash(req.body.password, salt, (err,hash) => {
            if(err) throw err;
            let user =
              {
                username: req.body.username,
                password: hash,
                id: Date.now()
              }
            users.push(user)
                res.json(user);
              }
            )
          })
        }
  
});

function getUserByUsername(username) {
  return users.find(user => user.username === username)
  }

function getUserByID(id) {
  return users.find(user => user.id === id)
}

function checkAuthenticated(req,res,next) {
  if(req.isAuthenticated()) {
      return res.status(200)
  }

  res.status(401).send('User not authenticated')
}
function checkNotAuthenticated(req,res,next) {
  if(req.isAuthenticated()) {
      return res.redirect('/')
  }

  return next()
}
module.exports = router;
