const express = require("express");
const router = express.Router();
const Task = require("../models/Task");

// 1. إضافة مهمة يدوية
router.post("/", async (req, res) => {
  try {
    const newTask = new Task(req.body);
    const savedTask = await newTask.save();
    res.status(201).json(savedTask);
  } catch (err) {
    res.status(500).json(err);
  }
});

// 2. جلب كل المهام (الغير مكتملة أولاً)
router.get("/", async (req, res) => {
  try {
    const tasks = await Task.find()
      .sort({ status: -1, createdAt: -1 })
      .populate("relatedProject");
    res.status(200).json(tasks);
  } catch (err) {
    res.status(500).json(err);
  }
});

// 3. تحديث حالة المهمة (إكمالها)
router.put("/:id", async (req, res) => {
  try {
    const updatedTask = await Task.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true }
    );
    res.status(200).json(updatedTask);
  } catch (err) {
    res.status(500).json(err);
  }
});

// 4. حذف مهمة
router.delete("/:id", async (req, res) => {
  try {
    await Task.findByIdAndDelete(req.params.id);
    res.status(200).json("Deleted");
  } catch (err) {
    res.status(500).json(err);
  }
});

module.exports = router;
