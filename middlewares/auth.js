var User = require('../models/user');
module.exports = {
  isUserLogged: (req, res, next) => {
    if (req.session && req.session.userId) {
      return next();
    } else {
      return res.redirect('/users/login');
    }
  },
  userInfo: (req, res, next) => {
    var userId = req.session && req.session.userId;
    if (userId) {
      User.findById(userId, 'name email isAdmin').then((user) => {
        req.user = user;
        res.locals.user = user;
        next();
      });
    } else {
      req.user = null;
      res.locals.user = null;
      next();
    }
  },
  adminUser: (req, res, next) => {
    var { userId } = req.session;
    User.findById(userId).then((user) => {
      if (!user) {
        return next('User not found');
      } else if (user.isAdmin) {
        return next();
      } else {
        return res.render('noauth');
      }
    });
  },
};
