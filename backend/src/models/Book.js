const mongoose = require("mongoose");

const bookSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, "Book title is required"],
    trim: true
  },
  author: {
    type: String,
    required: [true, "Author name is required"],
    trim: true
  },
  isbn: {
    type: String,
    required: [true, "ISBN is required"],
    unique: true,
    trim: true,
    uppercase: true,
    match: [/^(?:97[89])?\d{9}[\dXx]$/, "ISBN must be a valid 10 or 13 digit ISBN"]
  },
  genre: {
    type: String,
    required: [true, "Genre is required"],
    trim: true
  },
  totalCopies: {
    type: Number,
    required: [true, "Total copies is required"],
    min: [1, "Total copies must be at least 1"]
  },
  availableCopies: {
    type: Number,
    required: [true, "Available copies is required"],
    min: [0, "Available copies cannot be negative"],
    validate: {
      validator: function (value) {
        return value <= this.totalCopies;
      },
      message: "availableCopies cannot exceed totalCopies"
    }
  }
}, {
  timestamps: true
});

bookSchema.pre("save", function (next) {
  if (this.availableCopies > this.totalCopies) {
    return next(new Error("availableCopies cannot exceed totalCopies"));
  }
  next();
});

module.exports = mongoose.model("Book", bookSchema);
