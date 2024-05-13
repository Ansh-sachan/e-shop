var express = require('express');
var router = express.Router();
var User = require('../models/user');
var Product = require('../models/product');

router.get('/new', (req, res, next) => {
  var { userId } = req.session;
  User.findById(userId)
    .then((user) => {
      if (!user || !user.isAdmin) return next(err);
      res.render('createProduct');
    })
    .catch((err) => next(err));
});

router.post('/', (req, res, next) => {
  var { userId } = req.session;
  User.findById(userId)
    .then((user) => {
      if (!user || !user.isAdmin) return next(err);
      Product.create(req.body)
        .then((product) => res.redirect('/products'))
        .catch((err) => next(err));
    })
    .catch((err) => next(err));
});
router.get('/', (req, res, next) => {
  var { userId } = req.session;
  Product.find({})
    .then((products) => {
      User.findById(userId)
        .then((users) => {
          return res.render('allProducts', { products, users });
        })
        .catch((err) => next(err));
    })
    .catch((err) => next(err));
});

module.exports = router;
