const express = require("express");
const router = express.Router();
const Attendance = require("../models/Attendance");
const Employee = require("../models/Employee");

// دالة مساعدة لجلب تاريخ اليوم بصيغة YYYY-MM-DD
const getTodayDate = () => new Date().toISOString().split("T")[0];

// 1. جلب تقرير الحضور لليوم (مين جه ومين لا)
router.get("/today", async (req, res) => {
  try {
    const today = getTodayDate();
    const employees = await Employee.find();
    const attendanceRecords = await Attendance.find({ date: today });

    // دمج الموظفين مع سجلات حضورهم
    const report = employees.map((emp) => {
      const record = attendanceRecords.find(
        (r) => r.employee.toString() === emp._id.toString()
      );
      return {
        _id: emp._id,
        name: emp.name,
        role: emp.role,
        leaveBalance: emp.leaveBalance,
        status: record ? record.status : "Absent", // لو ملوش سجل يبقى غايب
        checkIn: record?.checkIn,
        checkOut: record?.checkOut,
      };
    });

    res.json(report);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// 2. تسجيل حركة (حضور / انصراف)
router.post("/toggle", async (req, res) => {
  try {
    const { employeeId } = req.body;
    const today = getTodayDate();

    let record = await Attendance.findOne({
      employee: employeeId,
      date: today,
    });

    if (!record) {
      // --- تسجيل حضور (Check In) ---
      // ممكن نضيف لوجيك هنا: لو الساعة عدت 9:30 يبقى Late
      const now = new Date();
      let status = "Present";
      if (now.getHours() >= 10) status = "Late"; // مثال: بعد الساعة 10 يعتبر متأخر

      record = new Attendance({
        employee: employeeId,
        date: today,
        checkIn: now,
        status: status,
      });
      await record.save();
      return res.json({ message: "تم تسجيل الحضور ✅", type: "In" });
    } else if (!record.checkOut) {
      // --- تسجيل انصراف (Check Out) ---
      record.checkOut = new Date();
      await record.save();
      return res.json({ message: "تم تسجيل الانصراف 👋", type: "Out" });
    } else {
      return res
        .status(400)
        .json({ message: "الموظف قام بتسجيل الانصراف مسبقاً اليوم" });
    }
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// 3. تسجيل إجازة (خصم من الرصيد)
router.post("/leave", async (req, res) => {
  try {
    const { employeeId, note } = req.body;
    const today = getTodayDate();

    // التأكد إن الموظف مش مسجل حضور النهاردة
    const existingRecord = await Attendance.findOne({
      employee: employeeId,
      date: today,
    });
    if (existingRecord)
      return res
        .status(400)
        .json({ message: "لا يمكن تسجيل إجازة، الموظف مسجل حضور بالفعل" });

    // خصم الرصيد
    const employee = await Employee.findById(employeeId);
    if (employee.leaveBalance <= 0)
      return res.status(400).json({ message: "رصيد الإجازات لا يسمح!" });

    employee.leaveBalance -= 1;
    await employee.save();

    // تسجيل في الحضور إنها إجازة
    await Attendance.create({
      employee: employeeId,
      date: today,
      status: "OnLeave",
      note: note || "إجازة اعتيادية",
    });

    res.json({
      message: `تم تسجيل الإجازة. المتبقي: ${employee.leaveBalance} يوم`,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});
router.post("/reset-leaves", async (req, res) => {
  try {
    // تحديث كل الموظفين: خلي رصيدهم 21
    // (ممكن مستقبلاً تخليها تعتمد على سن الموظف لو حابب)
    await Employee.updateMany({}, { $set: { leaveBalance: 21 } });

    // ممكن هنا كمان نكتب في السجل إن تم تجديد الرصيد (اختياري)

    res.json({ message: "تم تجديد رصيد الإجازات لجميع الموظفين (21 يوم) ✅" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
