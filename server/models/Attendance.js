const mongoose = require("mongoose");

const AttendanceSchema = new mongoose.Schema({
  employee: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Employee",
    required: true,
  },
  date: { type: String, required: true }, // التنسيق: "YYYY-MM-DD" عشان نضمن سجل واحد في اليوم
  checkIn: { type: Date }, // وقت الحضور
  checkOut: { type: Date }, // وقت الانصراف
  status: {
    type: String,
    enum: ["Present", "Absent", "Late", "OnLeave"],
    default: "Absent",
  },
  note: { type: String }, // ملاحظات (إذن، تأخير..)
});

module.exports = mongoose.model("Attendance", AttendanceSchema);
