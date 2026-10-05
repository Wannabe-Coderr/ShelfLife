const express = require("express");
const Joi = require("joi");
const Member = require("../models/Member");
const BorrowRecord = require("../models/BorrowRecord");
const { validate } = require("../middleware/validate");

const router = express.Router();

router.get("/", async (req, res, next) => {
  try {
    const page = Math.max(Number(req.query.page) || 1, 1);
    const limit = Math.min(Math.max(Number(req.query.limit) || 20, 1), 100);
    const totalMembers = await Member.countDocuments();
    const members = await Member.find()
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean();

    res.json({
      success: true,
      data: members,
      pagination: {
        page,
        limit,
        total: totalMembers,
        pages: Math.ceil(totalMembers / limit)
      }
    });
  } catch (error) {
    next(error);
  }
});

const memberSchema = Joi.object({
  name: Joi.string().trim().min(2).required(),
  email: Joi.string().email().required(),
  membershipId: Joi.string().trim().min(3).required()
});

router.post("/", validate(memberSchema), async (req, res, next) => {
  try {
    const { email, membershipId, ...rest } = req.body;
    const normalizedEmail = email.trim().toLowerCase();
    const normalizedMembershipId = membershipId.trim().toUpperCase();

    const existingMemberByEmail = await Member.findOne({ email: normalizedEmail });
    if (existingMemberByEmail) {
      return res.status(409).json({
        success: false,
        message: "A member with this email already exists."
      });
    }

    const existingMemberByMembershipId = await Member.findOne({ membershipId: normalizedMembershipId });
    if (existingMemberByMembershipId) {
      return res.status(409).json({
        success: false,
        message: "This membership ID is already in use."
      });
    }

    const member = await Member.create({
      ...rest,
      email: normalizedEmail,
      membershipId: normalizedMembershipId
    });

    res.status(201).json({
      success: true,
      message: "Member registered successfully.",
      data: member
    });
  } catch (error) {
    next(error);
  }
});

router.get("/:id/history", async (req, res, next) => {
  try {
    const member = await Member.findById(req.params.id);
    if (!member) {
      return res.status(404).json({
        success: false,
        message: "Member not found."
      });
    }

    const records = await BorrowRecord.find({ member: member._id })
      .populate("book", "title author isbn")
      .sort({ issueDate: -1 })
      .lean();

    const history = records.map((record) => {
      const isOverdue = record.status === "issued" && new Date(record.dueDate) < new Date();

      return {
        ...record,
        displayStatus: isOverdue ? "overdue" : record.status,
        isOverdue
      };
    });

    res.json({
      success: true,
      data: {
        member,
        history
      }
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
