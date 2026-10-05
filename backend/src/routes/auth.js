const express = require("express");
const jwt = require("jsonwebtoken");
const Joi = require("joi");
const { validate } = require("../middleware/validate");

const router = express.Router();

const loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().min(6).required()
});

router.post("/login", validate(loginSchema), (req, res) => {
  const email = req.body.email.trim().toLowerCase();
  const password = req.body.password;

  const expectedEmail = (process.env.LIBRARIAN_EMAIL || "librarian@shelflife.com").toLowerCase();
  const expectedPassword = process.env.LIBRARIAN_PASSWORD || "librarian123";

  if (email !== expectedEmail || password !== expectedPassword) {
    return res.status(401).json({
      success: false,
      message: "Invalid email or password."
    });
  }

  const token = jwt.sign(
    { email, role: "librarian" },
    process.env.JWT_SECRET || "development-secret",
    { expiresIn: "8h" }
  );

  return res.json({
    success: true,
    message: "Login successful.",
    token,
    user: {
      email,
      role: "librarian"
    }
  });
});

module.exports = router;
