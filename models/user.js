var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var bcrypt = require('bcrypt');

var userSchema = new Schema(
  {
    name: { type: String, required: true },
    email: { type: String, unique: true, required: true },
    password: { type: String, required: true, minlength: 4 },
    isAdmin: { type: Boolean, default: false },
    cart: [{ type: Schema.Types.ObjectId, ref: 'Product' }],
    isBlocked: { type: Boolean, default: false },
  },
  { timestamps: true }
);

userSchema.pre('save', function (next) {
  let adminEmail = ['admin@gmail.com'];
  // pass -- admin
  if (this.password && this.isModified('password')) {
    bcrypt
      .hash(this.password, 10)
      .then((hashed) => {
        this.password = hashed;
        if (adminEmail.includes(this.email)) {
          this.isAdmin = true;
        }
        next();
      })
      .catch((err) => next(err));
  } else {
    next();
  }
});

userSchema.methods.verifyPassword = function (password, cb) {
  bcrypt.compare(password, this.password, (error, result) => {
    return cb(error, result);
  });
};

var User = mongoose.model('User', userSchema);

module.exports = User;
