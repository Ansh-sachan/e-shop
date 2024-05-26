var express = require('express');
var router = express.Router();
var User = require('../models/user');
var Product = require('../models/product');
var auth = require('../middlewares/auth');

// all product
router.get('/', (req, res, next) => {
  var { userId } = req.session;
  Product.find({})
    .then((products) => {
      User.findById(userId)
        .then((user) => {
          Product.distinct('category')
            .then((categories) => {
              return res.render('allProducts', { products, user, categories });
            })
            .catch((err) => next(err));
        })
        .catch((err) => next(err));
    })
    .catch((err) => next(err));
});

// new product
router.get('/new', auth.adminUser, (req, res, next) => {
  var error = req.flash('error');
  return res.render('createProduct', { error });
});
router.post('/', (req, res, next) => {
  var { userId } = req.session;
  var { name, quantity, price } = req.body;
  User.findById(userId)
    .then((user) => {
      if (!user || !user.isAdmin) return next(err);
      if (!name || !quantity || !price) {
        req.flash('error', 'Please fill the details');
        return res.redirect('/products/new');
      }
      Product.create(req.body)
        .then((product) => res.redirect('/products'))
        .catch((err) => next(err));
    })
    .catch((err) => next(err));
});
// single product
router.get('/:id', (req, res, next) => {
  var { userId } = req.session;
  var productId = req.params.id;
  Product.findById(productId)
    .then((product) => {
      User.findById(userId)
        .then((user) => res.render('singleProduct', { product, user }))
        .catch((err) => next(err));
    })
    .catch((err) => next(err));
});
// filter product
router.get('/:category/single', (req, res, next) => {
  var { userId } = req.session;
  var category = req.params.category;
  Product.find({ category: category })
    .then((products) => {
      User.findById(userId)
        .then((user) => {
          return res.render('category', { products, user });
        })
        .catch((err) => next(err));
    })
    .catch((err) => next(err));
});

router.use(auth.isUserLogged);

// like
router.get('/:id/like', (req, res, next) => {
  var id = req.params.id;
  Product.findByIdAndUpdate(id, { $inc: { likes: 1 } })
    .then((product) => res.redirect('/products/' + id))
    .catch((err) => next(err));
});
// cart
router.get('/:id/cart/delete', (req, res, next) => {
  var id = req.params.id;
  var { userId } = req.session;

  Product.findById(id)
    .then((product) => {
      User.findByIdAndUpdate(userId, { $pop: { cart: product.id } })
        .then((info) => res.redirect('/users/cart'))
        .catch((err) => next(err));
    })
    .catch((err) => next(Err));
});

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

router.use(auth.adminUser);
// edit form
router.get('/:id/edit', (req, res, next) => {
  var id = req.params.id;
  Product.findById(id)
    .then((product) => {
      var error = req.flash('error');
      return res.render('edit', { product, error });
    })
    .catch((err) => next(err));
});

router.post('/:id/edit', (req, res, next) => {
  var { userId } = req.session;
  var productId = req.params.id;
  var { name, price, quantity } = req.body;
  User.findById(userId).then((user) => {
    if (!user || !user.isAdmin) return next(err);
    if ((!name, !price, !quantity)) {
      req.flash('error', 'Fill the required fields');
      return res.redirect(`/${id}/edit`);
    }
    Product.findByIdAndUpdate(productId, req.body, { new: true })
      .then((product) => res.redirect('/products/' + productId))
      .catch((err) => next(err));
  });
});
// add product
router.post('/', (req, res, next) => {
  var { userId } = req.session;
  var { name, quantity, price } = req.body;
  User.findById(userId)
    .then((user) => {
      if (!user || !user.isAdmin) return next(err);
      if (!name || !quantity || !price) {
        req.flash('error', 'Please fill the details');
        return res.redirect('/products/new');
      }
      Product.create(req.body)
        .then((product) => res.redirect('/products'))
        .catch((err) => next(err));
    })
    .catch((err) => next(err));
});

// delete
router.get('/:id/delete', (req, res, next) => {
  var id = req.params.id;
  Product.findByIdAndDelete(id)
    .then((product) => res.redirect('/products'))
    .catch((err) => next(err));
});

module.exports = router;
