const mongoose = require("mongoose");

const borrowRecordSchema = new mongoose.Schema({
  book: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Book",
    required: [true, "Book reference is required"]
  },
  member: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Member",
    required: [true, "Member reference is required"]
  },
  issueDate: {
    type: Date,
    required: [true, "Issue date is required"],
    default: Date.now
  },
  dueDate: {
    type: Date,
    required: [true, "Due date is required"]
  },
  returnDate: {
    type: Date,
    default: null
  },
  status: {
    type: String,
    enum: ["issued", "returned", "overdue"],
    default: "issued"
  }
}, {
  timestamps: true
});

module.exports = mongoose.model("BorrowRecord", borrowRecordSchema);
