var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var productSchema = new Schema(
  {
    name: { type: String, required: true },
    quantity: { type: Number, required: true },
    price: { type: Number, required: true },
    likes: { type: Number, default: 0 },
  },
  { timestamps: true }
);

var Product = mongoose.model('Product', productSchema);

module.exports = Product;
