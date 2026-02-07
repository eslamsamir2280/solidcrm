const express = require("express");
const router = express.Router();
const Client = require("../models/Client");

// 1. إضافة عميل جديد
router.post("/", async (req, res) => {
  try {
    const newClient = new Client(req.body);
    const savedClient = await newClient.save();
    res.status(201).json(savedClient);
  } catch (err) {
    res.status(500).json(err);
  }
});

// 2. جلب كل العملاء
router.get("/", async (req, res) => {
  try {
    const clients = await Client.find().sort({ createdAt: -1 });
    res.status(200).json(clients);
  } catch (err) {
    res.status(500).json(err);
  }
});

module.exports = router;
