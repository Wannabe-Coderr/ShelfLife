const express = require("express");
const Joi = require("joi");
const Book = require("../models/Book");
const Member = require("../models/Member");
const BorrowRecord = require("../models/BorrowRecord");
const { protect } = require("../middleware/auth");
const { validate } = require("../middleware/validate");

const router = express.Router();

const borrowSchema = Joi.object({
  bookId: Joi.string().required(),
  memberId: Joi.string().required()
});

router.post("/borrow", protect, validate(borrowSchema), async (req, res, next) => {
  try {
    const member = await Member.findById(req.body.memberId);
    if (!member) {
      throw Object.assign(new Error("Member not found."), { status: 404 });
    }

    const book = await Book.findById(req.body.bookId);
    if (!book) {
      throw Object.assign(new Error("Book not found."), { status: 404 });
    }

    if (book.availableCopies <= 0) {
      throw Object.assign(new Error("No copies available for this book."), { status: 400 });
    }

    // Prevent two librarians from issuing the last copy simultaneously.
    // The conditional update only succeeds when availableCopies > 0, so it cannot become negative.
    const updatedBook = await Book.findOneAndUpdate(
      { _id: req.body.bookId, availableCopies: { $gt: 0 } },
      { $inc: { availableCopies: -1 } },
      { new: true }
    );

    if (!updatedBook) {
      throw Object.assign(new Error("Book availability changed. Please retry."), { status: 409 });
    }

    const dueDate = new Date(Date.now() + 14 * 24 * 60 * 60 * 1000);
    const record = await BorrowRecord.create({
      book: req.body.bookId,
      member: req.body.memberId,
      issueDate: new Date(),
      dueDate,
      status: "issued"
    });

    return res.status(201).json({
      success: true,
      message: "Book issued successfully.",
      data: record
    });
  } catch (error) {
    next(error);
  }
});

router.post("/return/:borrowId", protect, async (req, res, next) => {
  try {
    const record = await BorrowRecord.findById(req.params.borrowId);
    if (!record) {
      throw Object.assign(new Error("Borrow record not found."), { status: 404 });
    }

    if (record.status === "returned") {
      throw Object.assign(new Error("This book has already been returned."), { status: 400 });
    }

    const book = await Book.findById(record.book);
    if (!book) {
      throw Object.assign(new Error("Book for borrow record no longer exists."), { status: 404 });
    }

    const updatedBook = await Book.findOneAndUpdate(
      { _id: record.book },
      { $inc: { availableCopies: 1 } },
      { new: true }
    );

    if (!updatedBook) {
      throw Object.assign(new Error("Unable to update book availability."), { status: 500 });
    }

    record.returnDate = new Date();
    record.status = "returned";
    const updatedRecord = await record.save();

    return res.json({
      success: true,
      message: "Book returned successfully.",
      data: updatedRecord
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
