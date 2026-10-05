const express = require("express");
const Joi = require("joi");
const Book = require("../models/Book");
const { validate } = require("../middleware/validate");

const router = express.Router();

const bookSchema = Joi.object({
  title: Joi.string().trim().min(1).required(),
  author: Joi.string().trim().min(1).required(),
  isbn: Joi.string().trim().required(),
  genre: Joi.string().trim().min(1).required(),
  totalCopies: Joi.number().integer().min(1).required(),
  availableCopies: Joi.number().integer().min(0).required()
});

router.post("/", validate(bookSchema), async (req, res, next) => {
  try {
    const { isbn, ...rest } = req.body;
    const normalizedIsbn = isbn.trim().toUpperCase();

    const existingBook = await Book.findOne({ isbn: normalizedIsbn });
    if (existingBook) {
      return res.status(409).json({
        success: false,
        message: "A book with this ISBN already exists."
      });
    }

    const book = await Book.create({
      ...rest,
      isbn: normalizedIsbn
    });

    return res.status(201).json({
      success: true,
      message: "Book created successfully.",
      data: book
    });
  } catch (error) {
    next(error);
  }
});

router.get("/", async (req, res, next) => {
  try {
    const page = Math.max(Number(req.query.page) || 1, 1);
    const limit = Math.min(Math.max(Number(req.query.limit) || 10, 1), 50);
    const genre = req.query.genre ? String(req.query.genre).trim() : "";
    const search = req.query.search ? String(req.query.search).trim() : "";

    const filter = {};
    if (genre) {
      filter.genre = new RegExp(`^${genre}$`, "i");
    }
    if (search) {
      filter.title = new RegExp(search, "i");
    }

    const totalBooks = await Book.countDocuments(filter);
    const books = await Book.find(filter)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean();

    res.json({
      success: true,
      data: books,
      pagination: {
        page,
        limit,
        total: totalBooks,
        pages: Math.ceil(totalBooks / limit)
      }
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
