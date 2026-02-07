const express = require("express");
const router = express.Router();
const Transaction = require("../models/Transaction");

// 1. إضافة معاملة جديدة (مصروف أو إيراد يدوي)
router.post("/", async (req, res) => {
  try {
    const newTrans = new Transaction(req.body);
    const savedTrans = await newTrans.save();
    res.status(201).json(savedTrans);
  } catch (err) {
    res.status(500).json(err);
  }
});

// 2. جلب كل المعاملات (للعرض في الجدول)
router.get("/", async (req, res) => {
  try {
    const transactions = await Transaction.find()
      .populate("relatedProject", "title") // عشان نجيب اسم المشروع
      .sort({ date: -1 });
    res.status(200).json(transactions);
  } catch (err) {
    res.status(500).json(err);
  }
});

// 3. جلب إحصائيات سريعة (رصيد، مصروفات، إيرادات)
router.get("/stats", async (req, res) => {
  try {
    const transactions = await Transaction.find();
    let income = 0;
    let expense = 0;

    transactions.forEach((t) => {
      if (t.type === "Income") income += t.amount;
      else expense += t.amount;
    });

    res.status(200).json({ income, expense, balance: income - expense });
  } catch (err) {
    res.status(500).json(err);
  }
});

module.exports = router;
