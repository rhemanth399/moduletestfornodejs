const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const bookSchema = new Schema({
    title: {
        type: String,
        require: true,
      },
      author: {
        type: String,
        require: true,
      },
      price: {
        type: Number,
        require: true,
      },
      category: {
        type: String,
        require: true,
      },
      username: {
        type: String,
        require: true,
      },
})

module.exports = mongoose.model("inventory", bookSchema);