const express = require("express");
const router = express.Router();
const Project = require("../models/Project");
const Transaction = require("../models/Transaction");
const Task = require("../models/Task");
const Client = require("../models/Client");
const Employee = require("../models/Employee");

router.get("/stats", async (req, res) => {
  try {
    // 1. إحصائيات عامة
    const totalProjects = await Project.countDocuments();
    const activeProjects = await Project.countDocuments({
      status: { $ne: "Completed" },
    });
    const totalClients = await Client.countDocuments();
    const totalEmployees = await Employee.countDocuments();

    // 2. إحصائيات مالية
    const transactions = await Transaction.find();
    let totalIncome = 0;
    let totalExpense = 0;
    let expenseByCategory = {};

    transactions.forEach((t) => {
      if (t.type === "Income") {
        totalIncome += t.amount;
      } else if (t.type === "Expense") {
        totalExpense += t.amount;
        if (expenseByCategory[t.category])
          expenseByCategory[t.category] += t.amount;
        else expenseByCategory[t.category] = t.amount;
      }
    });

    const balance = totalIncome - totalExpense;
    const expenseChartData = Object.keys(expenseByCategory).map((key) => ({
      name: key,
      value: expenseByCategory[key],
    }));

    // 3. حالات المشاريع
    const projects = await Project.find(); // جبنا كل المشاريع عشان نستخدمها تحت كمان
    let projectStatusCounts = {
      PendingPricing: 0,
      ClientReview: 0,
      Manufacturing: 0,
      ReadyForInstallation: 0,
      Installation: 0,
      Completed: 0,
    };

    projects.forEach((p) => {
      if (projectStatusCounts[p.status] !== undefined)
        projectStatusCounts[p.status]++;
    });

    const projectPieData = [
      { name: "تسعير", value: projectStatusCounts.PendingPricing },
      { name: "مراجعة", value: projectStatusCounts.ClientReview },
      { name: "تصنيع", value: projectStatusCounts.Manufacturing },
      { name: "جاهز", value: projectStatusCounts.ReadyForInstallation },
      { name: "تركيب", value: projectStatusCounts.Installation },
      { name: "مكتمل", value: projectStatusCounts.Completed },
    ].filter((item) => item.value > 0);

    // 4. رسم بياني للشهور
    const monthlyData = [];
    const months = [
      "يناير",
      "فبراير",
      "مارس",
      "أبريل",
      "مايو",
      "يونيو",
      "يوليو",
      "أغسطس",
      "سبتمبر",
      "أكتوبر",
      "نوفمبر",
      "ديسمبر",
    ];
    const today = new Date();

    for (let i = 5; i >= 0; i--) {
      const d = new Date(today.getFullYear(), today.getMonth() - i, 1);
      const monthName = months[d.getMonth()];
      const monthTrans = transactions.filter((t) => {
        const tDate = new Date(t.date);
        return (
          tDate.getMonth() === d.getMonth() &&
          tDate.getFullYear() === d.getFullYear()
        );
      });
      const income = monthTrans
        .filter((t) => t.type === "Income")
        .reduce((a, b) => a + b.amount, 0);
      const expense = monthTrans
        .filter((t) => t.type === "Expense")
        .reduce((a, b) => a + b.amount, 0);
      monthlyData.push({ name: monthName, Income: income, Expense: expense });
    }

    // 5. آخر المعاملات
    const recentTransactions = await Transaction.find()
      .sort({ date: -1 })
      .limit(5);

    // ======================================================
    // 6. 🔥 الجديد: الدفعات المستحقة خلال الشهر الحالي
    // ======================================================
    const currentMonth = today.getMonth();
    const currentYear = today.getFullYear();
    let dueInstallments = [];

    projects.forEach((p) => {
      if (p.financials && p.financials.installments) {
        p.financials.installments.forEach((inst) => {
          if (inst.dueDate) {
            const d = new Date(inst.dueDate);
            // الشرط: الحالة "Pending" + التاريخ في الشهر والسنة الحالية
            if (
              inst.status === "Pending" &&
              d.getMonth() === currentMonth &&
              d.getFullYear() === currentYear
            ) {
              dueInstallments.push({
                _id: inst._id,
                projectTitle: p.title,
                installmentTitle: inst.title,
                amount: inst.amount,
                dueDate: inst.dueDate,
                clientName: p.client ? p.client.name : "عميل", // (لو عامل populate فوق)
              });
            }
          }
        });
      }
    });

    // ترتيب الدفعات حسب التاريخ الأقرب
    dueInstallments.sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate));

    res.json({
      counts: { totalProjects, activeProjects, totalClients, totalEmployees },
      financials: { totalIncome, totalExpense, balance },
      charts: { monthlyData, projectPieData, expenseChartData },
      recentTransactions,
      dueInstallments, // 👈 بعتنا الداتا الجديدة
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
