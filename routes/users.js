var express = require('express');
var router = express.Router();
var User = require('../models/user');
var Product = require('../models/product');

/* GET users listing. */
router.get('/', function (req, res, next) {
  res.render('home');
});
// registration
router.get('/register', (req, res, next) => {
  var error = req.flash('error');
  res.render('register', { error });
});

router.post('/register', (req, res, next) => {
  var { email, password } = req.body;
  if (!email && !password) {
    req.flash('error', 'Email/password is required');
    return res.redirect('/users/register');
  }
  User.create(req.body)
    .then((info) => res.redirect('/users/login'))
    .catch((err) => {
      if (err.name === 'ValidationError') {
        req.flash('error', 'password must be greater than 4 digits');
        return res.redirect('/users/register');
      }
      if (err.name === 'MongoServerError') {
        req.flash('error', 'This email is already registered');
        return res.redirect('/users/register');
      }
    });
});

// login

router.get('/login', (req, res, next) => {
  var error = req.flash('error');
  res.render('login', { error });
});
router.post('/login', (req, res, next) => {
  var { email, password } = req.body;
  if (!email || !password) {
    req.flash('error', 'Email/Password is required');
    return res.redirect('/users/login');
  }
  User.findOne({ email }).then((user) => {
    if (!user) {
      req.flash('error', 'This Email is not registered');
      return res.redirect('/users/login');
    }
    user.verifyPassword(password, (err, result) => {
      if (err) return next(err);
      if (!result) {
        req.flash('error', 'Password is incorrect');
        return res.redirect('/users/login');
      } else {
        req.session.userId = user.id;
        if (user.isAdmin) {
          res.render('adminDashboard');
        } else {
          res.redirect('/products/');
        }
      }
    });
  });
});

// cart
router.get('/cart', (req, res, next) => {
  var { userId } = req.session;
  User.findById(userId)
    .populate('cart')
    .exec()
    .then((users) => res.render('cart', { users }))
    .catch((err) => next(err));
});
module.exports = router;
