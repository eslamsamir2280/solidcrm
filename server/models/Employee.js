const mongoose = require("mongoose");

const EmployeeSchema = new mongoose.Schema({
  name: { type: String, required: true },
  role: {
    type: String,
    enum: ["Manager", "Sales", "Technician", "Accountant", "Worker"],
    default: "Worker",
  },
  phone: { type: String },
  basicSalary: { type: Number, required: true },
  loanBalance: { type: Number, default: 0 },

  // --- إضافات جديدة ---
  leaveBalance: { type: Number, default: 21 }, // رصيد الإجازات السنوي
  joinedAt: { type: Date, default: Date.now }, // تاريخ التعيين

  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Employee", EmployeeSchema);
