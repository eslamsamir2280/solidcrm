const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");

const JWT_SECRET = "super_secret_key_123"; // في الحقيقة بيتخزن في .env

// 1. تسجيل مستخدم جديد (يستخدم مرة واحدة لإنشاء الأدمن)
router.post("/register", async (req, res) => {
  try {
    const { username, password, role, name } = req.body;
    // تشفير الباسورد
    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({
      username,
      password: hashedPassword,
      role,
      name,
    });
    await newUser.save();
    res.json({ message: "تم إنشاء المستخدم بنجاح" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 2. تسجيل الدخول (Login)
router.post("/login", async (req, res) => {
  try {
    const { username, password } = req.body;
    const user = await User.findOne({ username });
    if (!user) return res.status(400).json({ message: "مستخدم غير موجود" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: "كلمة المرور خطأ" });

    // إنشاء التذكرة (Token)
    const token = jwt.sign(
      { id: user._id, role: user.role, name: user.name },
      JWT_SECRET
    );

    res.json({
      token,
      user: { id: user._id, name: user.name, role: user.role },
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
