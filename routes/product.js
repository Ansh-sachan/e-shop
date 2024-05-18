var express = require('express');
var router = express.Router();
var User = require('../models/user');
var Product = require('../models/product');

// single product
router.get('/:id', (req, res, next) => {
  var { userId } = req.session;
  var productId = req.params.id;
  Product.findById(productId)
    .then((product) => {
      User.findById(userId)
        .then((user) => res.render('singleUser', { product, user }))
        .catch((err) => next(err));
    })
    .catch((err) => next(err));
});

// all product
router.get('/', (req, res, next) => {
  var { userId } = req.session;
  Product.find({})
    .then((products) => {
      User.findById(userId)
        .then((user) => {
          return res.render('allProducts', { products, user });
        })
        .catch((err) => next(err));
    })
    .catch((err) => next(err));
});

// new product
router.post('/', (req, res, next) => {
  var { userId } = req.session;
  var { name, quantity, price } = req.body;
  User.findById(userId)
    .then((user) => {
      if (!user || !user.isAdmin) return next(err);
      if (!name || !quantity || !price) {
        req.flash('error', 'Please fill the details');
        return res.redirect('/users/admin');
      }
      Product.create(req.body)
        .then((product) => res.redirect('/products'))
        .catch((err) => next(err));
    })
    .catch((err) => next(err));
});

// edit form
router.get('/:id/edit', (req, res, next) => {
  var productId = req.params.id;
  var { userId } = req.session;
  User.findById(userId)
    .then((user) => {
      if (user.isAdmin && user) return next(err);
      Product.findById(productId)
        .then((product) => res.render('edit', product))
        .catch((err) => next(err));
    })
    .catch((err) => next(err));
});

router.post('/:id/edit', (req, res, next) => {
  var { userId } = req.session;
  var productId = req.params.id;
  User.findById(userId).then((user) => {
    if (!user || !user.isAdmin) return next(err);
    Product.findByIdAndUpdate(productId, req.body, { new: true })
      .then((product) => res.redirect('/products/' + productId))
      .catch((err) => next(err));
  });
});

// like
router.get('/:id/like', (req, res, next) => {
  var id = req.params.id;
  Product.findByIdAndUpdate(id, { $inc: { like: 1 } })
    .then((product) => res.redirect('/products/' + id))
    .catch((err) => next(err));
});

// delete
router.get('/:id/delete', (req, res, next) => {
  var id = req.params.id;
  Product.findByIdAndDelete(id)
    .then((product) => res.redirect('/products/' + id))
    .catch((err) => next(err));
});

// cart
router.get('/:id/cart', (req, res, next) => {
  var productId = req.params.id;
  var { userId } = req.session;
  User.findById(userId)
    .then((user) => {
      Product.findById(productId)
        .then((product) => {
          User.findByIdAndUpdate(
            userId,
            { $push: { cart: product.id } },
            { new: true }
          )
            .then((users) => res.redirect('/products'))
            .catch((err) => next(err));
        })
        .catch((err) => next(err));
    })
    .catch((err) => next(err));
});

router.get('/:id/cart/delete');

module.exports = router;
