const mongoose = require("mongoose");

const projectSchema = new mongoose.Schema(
  {
    client: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Client",
      required: true,
    },
    title: { type: String, required: true },
    projectAddress: String,
    initialDoorsCount: { type: Number, default: 0 },

    muqaysaFile: String,
    quotationFile: String,

    // 1. تحديث الحالات المتاحة
    status: {
      type: String,
      enum: [
        "PendingPricing", // انتظار تسعير
        "ClientReview", // مراجعة عميل
        "Manufacturing", // جاري التصنيع
        "ReadyForInstallation", // 🔥 جاهز للتركيب (جديد)
        "Installation", // جاري التركيب (الفني شغال)
        "Completed", // مكتمل
      ],
      default: "PendingPricing",
    },

    // 2. خانة ميعاد التركيب
    installationDate: Date,

    financials: {
      totalValue: { type: Number, default: 0 },
      paidAmount: { type: Number, default: 0 },
      installments: [
        {
          title: String,
          amount: Number,
          dueDate: Date,
          status: {
            type: String,
            enum: ["Pending", "Paid"],
            default: "Pending",
          },
          paidAt: Date,
        },
      ],
    },

    items: [
      {
        itemType: { type: String, enum: ["Door", "Frame"], default: "Door" },
        description: String,
        quantity: { type: Number, default: 1 },
        serialNumber: { type: String, default: "" },
        isInstalled: { type: Boolean, default: false },
      },
    ],

    certificates: [
      {
        title: String,
        url: String,
        uploadedAt: { type: Date, default: Date.now },
      },
    ],
  },
  { timestamps: true }
);

module.exports = mongoose.model("Project", projectSchema);
