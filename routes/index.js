

var express = require('express');
var router = express.Router();
const bcrypt = require('bcryptjs');
const mongoose = require("mongoose");
const {body, validationResult} = require('express-validator');
const passport = require("passport");


const initializePassport = require('../passport-config')
initializePassport(passport, getUserByUsername, getUserByID)

const users = [];

const todos = [];

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

router.post('/api/user/login', checkNotAuthenticated, passport.authenticate('local', {
}), (req,res) => {
  res.status(200).send(req.cookies['connect.sid'])
}
)

router.post('/api/todos', checkAuthenticated,  (req,res) => {

  todobody = req.body.todo;
  todojson = {
    "id": req.user.id,
    "todo": [req.body.todo]
  }
  let foundflag = 0;
  let foundindex = 0;
  for (let index = 0; index < todos.length; index++) {
    const element = todos[index];
    if(element.id == todojson.id) {
      todos[index].todo.push(todobody)
      foundflag = 1;
      foundindex = index;
    }
  }
  if(foundflag == 0) {
    todos.push(todojson)
    console.log("Todo added: "+todojson)
    res.send(todojson)
  } else {
    console.log("Todo added: "+todos[foundindex])
    res.send(todos[foundindex])
  }
}
)

router.get('/api/todos/list', checkAuthenticated, (req, res, next) => {
  res.send(todos)

});

router.get('/api/user/list', (req, res, next) => {
  res.send(users)

});

router.get('/api/secret', checkAuthenticated, (req,res,next) => {
  res.send('This is a secret.')
})

router.post("/api/user/register", checkNotAuthenticated,
  body("username").trim().escape(),
  body("password"),
  (req, res, next) => {
    const errors = validationResult(req);
    if(!errors.isEmpty()) {
      return res.status(400).json({errors: errors.array()})

    }
    let userFound = 0;
    for (let index = 0; index < users.length; index++) {
      console.log(req.body.username)
      console.log
      if(users[index].username == req.body.username) {
        userFound = 1;
        console.log("User exists already.")
        break
      }
    }
      if(userFound == 1) {
        return res.status(400).json({message: "Username already in use."})
      } else {
        console.log("Adding new user");
        bcrypt.genSalt(10, (err, salt) => {
          bcrypt.hash(req.body.password, salt, (err,hash) => {
            if(err) throw err;
            let user =
              {
                id: Date.now(),
                username: req.body.username,
                password: hash
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
    res.status(200)
    return next()
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
