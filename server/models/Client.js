const mongoose = require("mongoose");

const clientSchema = new mongoose.Schema(
  {
    name: { type: String, required: true }, // اسم العميل
    phone: { type: String, required: true }, // التليفون
    email: { type: String }, // الايميل
    companyName: String, // اسم الشركة
    address: String, // العنوان
    notes: String,
  },
  { timestamps: true }
);

module.exports = mongoose.model("Client", clientSchema);
