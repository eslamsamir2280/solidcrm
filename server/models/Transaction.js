const mongoose = require("mongoose");

const transactionSchema = new mongoose.Schema(
  {
    type: { type: String, enum: ["Income", "Expense"], required: true }, // دخل ولا خرج
    amount: { type: Number, required: true },
    date: { type: Date, default: Date.now },
    category: {
      type: String,
      enum: [
        "ProjectPayment",
        "Materials",
        "Salaries",
        "Rent",
        "Utilities",
        "Other",
      ],
      default: "Other",
    },
    description: String, // شرح (مثلاً: شراء خشب لمشروع فيلا التجمع)

    // لو المصروف ده يخص مشروع معين (عشان نعرف تكلفة كل مشروع)
    relatedProject: { type: mongoose.Schema.Types.ObjectId, ref: "Project" },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Transaction", transactionSchema);
