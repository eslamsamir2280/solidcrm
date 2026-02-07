const express = require("express");
const router = express.Router();
const Transaction = require("../models/Transaction");
const Project = require("../models/Project");
const Attendance = require("../models/Attendance"); // ✅ استدعاء موديل الحضور
const Employee = require("../models/Employee");

// 1. التقرير المالي
router.get("/financial", async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    let query = {};
    if (startDate && endDate) {
      query.date = {
        $gte: new Date(startDate),
        $lte: new Date(new Date(endDate).setHours(23, 59, 59)),
      };
    }
    const transactions = await Transaction.find(query).sort({ date: 1 });
    let totalIncome = 0;
    let totalExpense = 0;
    let categoryBreakdown = {};

    transactions.forEach((t) => {
      if (t.type === "Income") {
        totalIncome += t.amount;
      } else {
        totalExpense += t.amount;
        if (categoryBreakdown[t.category])
          categoryBreakdown[t.category] += t.amount;
        else categoryBreakdown[t.category] = t.amount;
      }
    });

    res.json({
      range: { startDate, endDate },
      summary: {
        totalIncome,
        totalExpense,
        netProfit: totalIncome - totalExpense,
      },
      details: transactions,
      categoryBreakdown,
    });
  } catch (err) {
    res.status(500).json(err);
  }
});

// 2. تقرير المشاريع
router.get("/projects", async (req, res) => {
  try {
    const projects = await Project.find().populate("client");
    const report = projects.map((p) => {
      const total = p.financials?.totalValue || 0;
      const paid = p.financials?.paidAmount || 0;
      return {
        title: p.title,
        client: p.client?.name,
        status: p.status,
        total,
        paid,
        remaining: total - paid,
        completion: total > 0 ? Math.round((paid / total) * 100) : 0,
      };
    });
    res.json(report);
  } catch (err) {
    res.status(500).json(err);
  }
});

// ==========================================
// 3. 🔥 الجديد: تقرير ساعات العمل والحضور
// ==========================================
router.get("/attendance", async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    // فلترة التاريخ
    let query = {};
    if (startDate && endDate) {
      query.date = {
        $gte: startDate, // التاريخ في الداتا بيز متخزن string "YYYY-MM-DD"
        $lte: endDate,
      };
    }

    const employees = await Employee.find();
    const records = await Attendance.find(query);

    const report = employees.map((emp) => {
      // استخراج سجلات الموظف ده بس
      const empRecords = records.filter(
        (r) => r.employee.toString() === emp._id.toString()
      );

      let totalHours = 0;
      let presentDays = 0;
      let lateDays = 0;
      let absentDays = 0; // دي محتاجة حسبة معقدة شوية بناء على أيام العمل، هنا هنسيبها بسيطة

      empRecords.forEach((r) => {
        if (r.status === "Present" || r.status === "Late") {
          presentDays++;
          if (r.status === "Late") lateDays++;

          // حساب الساعات (لو عمل checkOut)
          if (r.checkIn && r.checkOut) {
            const diffMs = new Date(r.checkOut) - new Date(r.checkIn);
            const hours = diffMs / (1000 * 60 * 60); // تحويل ملي ثانية لساعات
            totalHours += hours;
          }
        }
      });

      return {
        name: emp.name,
        role: emp.role,
        presentDays,
        lateDays,
        totalHours: totalHours.toFixed(1), // رقم عشري واحد (مثلاً 40.5 ساعة)
      };
    });

    res.json(report);
  } catch (err) {
    res.status(500).json(err);
  }
});

module.exports = router;
