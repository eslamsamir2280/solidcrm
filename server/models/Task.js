const mongoose = require("mongoose");

const taskSchema = new mongoose.Schema(
  {
    title: { type: String, required: true }, // عنوان المهمة
    description: String, // تفاصيل

    // مين المسؤول؟ (ممكن يكون قسم أو شخص)
    assignedTo: {
      type: String,
      enum: ["General", "Sales", "Finance", "Technician", "Admin"],
      default: "General",
    },

    // هل دي مهمة يدوية ولا آلية (بسبب مشروع)؟
    type: { type: String, enum: ["Manual", "System"], default: "Manual" },

    // لو المهمة مرتبطة بمشروع معين (عشان لما ندوس عليها تودينا ليه)
    relatedProject: { type: mongoose.Schema.Types.ObjectId, ref: "Project" },

    status: {
      type: String,
      enum: ["Pending", "Completed"],
      default: "Pending",
    },
    dueDate: Date, // تاريخ الاستحقاق
  },
  { timestamps: true }
);

module.exports = mongoose.model("Task", taskSchema);
