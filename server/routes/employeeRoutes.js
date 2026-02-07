const express = require("express");
const router = express.Router();
const Employee = require("../models/Employee");
const Transaction = require("../models/Transaction"); // عشان نخصم من الخزنة

// 1. جلب كل الموظفين
router.get("/", async (req, res) => {
  try {
    const employees = await Employee.find().sort({ createdAt: -1 });
    res.json(employees);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// 2. إضافة موظف جديد
router.post("/", async (req, res) => {
  try {
    const newEmp = new Employee(req.body);
    const savedEmp = await newEmp.save();
    res.status(201).json(savedEmp);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// 3. صرف راتب (Pay Salary)
// ده بيعمل عملية سحب من الخزنة
router.post("/:id/pay-salary", async (req, res) => {
  try {
    const { amount, note } = req.body; // المبلغ المدفوع (ممكن يكون ناقص خصومات)
    const employee = await Employee.findById(req.params.id);

    if (!employee) return res.status(404).json({ message: "الموظف غير موجود" });

    // تسجيل العملية في الخزنة كمصروف
    await Transaction.create({
      type: "Expense",
      amount: amount,
      category: "Salaries",
      description: `راتب: ${employee.name} - ${note || ""}`,
      date: new Date(),
    });

    res.json({ message: "تم صرف الراتب وتسجيله في المصروفات" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// 4. إعطاء سلفة (Give Advance/Loan)
// ده بيخصم من الخزنة + بيزود المديونية على الموظف
router.post("/:id/advance", async (req, res) => {
  try {
    const { amount } = req.body;
    const employee = await Employee.findById(req.params.id);

    // 1. تسجيل السلفة في الخزنة (فلوس خرجت)
    await Transaction.create({
      type: "Expense",
      amount: amount,
      category: "Loans", // ممكن تعمل تصنيف جديد اسمه سلف موظفين
      description: `سلفة للموظف: ${employee.name}`,
      date: new Date(),
    });

    // 2. زيادة رصيد السلف على الموظف
    employee.loanBalance += Number(amount);
    await employee.save();

    res.json(employee);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// 5. سداد سلفة (خصم من الراتب أو سداد كاش)
// الموظف رجع الفلوس أو خصمناها من مرتبه
router.post("/:id/repay-loan", async (req, res) => {
  try {
    const { amount, isCash } = req.body; // isCash: هل دفع كاش للخزنة ولا خصم ورقي؟
    const employee = await Employee.findById(req.params.id);

    // تنقيص المديونية
    employee.loanBalance -= Number(amount);
    await employee.save();

    // لو دفع كاش، يبقى الخزنة زادت (إيراد استرداد سلفة)
    if (isCash) {
      await Transaction.create({
        type: "Income",
        amount: amount,
        category: "Other",
        description: `سداد سلفة نقدي من: ${employee.name}`,
        date: new Date(),
      });
    }

    res.json(employee);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
