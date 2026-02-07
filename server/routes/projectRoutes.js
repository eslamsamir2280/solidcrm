const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const multer = require("multer");
const path = require("path");

// استدعاء الموديلات
const Project = require("../models/Project");
const Task = require("../models/Task");
const Transaction = require("../models/Transaction");

// إعدادات رفع الملفات (Multer)
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/");
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + path.extname(file.originalname));
  },
});
const upload = multer({ storage: storage });

// ==========================================
// 1. إنشاء مشروع جديد + مهمة تسعير تلقائية
// ==========================================
router.post("/", upload.single("muqaysaFile"), async (req, res) => {
  try {
    const { client, title, projectAddress, initialDoorsCount } = req.body;
    const filePath = req.file ? req.file.path : null;

    const newProject = new Project({
      client,
      title,
      projectAddress,
      initialDoorsCount,
      muqaysaFile: filePath,
      status: "PendingPricing",
    });
    const savedProject = await newProject.save();

    // 🔥 أتمتة: إنشاء مهمة تسعير تلقائية للمبيعات
    const today = new Date();
    const deadline = new Date(today);
    deadline.setDate(deadline.getDate() + 2); // مهلة يومين

    await Task.create({
      title: `تسعير مشروع جديد: ${savedProject.title}`,
      description: "المشروع بانتظار التسعير وإرسال العرض للعميل",
      assignedTo: "Sales",
      type: "System",
      relatedProject: savedProject._id,
      status: "Pending",
      dueDate: deadline,
    });

    res.status(201).json(savedProject);
  } catch (err) {
    res.status(500).json({ message: "فشل حفظ المشروع", error: err.message });
  }
});

// ==========================================
// 2. جلب المشاريع (الكل أو واحد)
// ==========================================
router.get("/", async (req, res) => {
  try {
    const projects = await Project.find()
      .populate("client")
      .sort({ createdAt: -1 });
    res.status(200).json(projects);
  } catch (err) {
    res.status(500).json(err);
  }
});

router.get("/:id", async (req, res) => {
  try {
    const project = await Project.findById(req.params.id).populate("client");
    if (!project) return res.status(404).json({ message: "المشروع غير موجود" });
    res.status(200).json(project);
  } catch (err) {
    res.status(500).json(err);
  }
});

// ==========================================
// 3. تحديث المشروع (القلب النابض للنظام) ⚙️
// ==========================================
router.put("/:id", upload.single("quotationFile"), async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) return res.status(404).json({ message: "Not Found" });

    let updateData = { ...req.body };

    // لو فيه ملف عرض سعر جديد
    if (req.file) updateData.quotationFile = req.file.path;

    // أ. تحديث السعر -> 🔥 إغلاق مهمة التسعير تلقائياً
    if (req.body.price) {
      updateData.financials = {
        ...project.financials,
        totalValue: req.body.price,
      };

      // إغلاق المهمة
      await Task.findOneAndUpdate(
        {
          relatedProject: project._id,
          status: "Pending",
          title: { $regex: "تسعير" },
        },
        { status: "Completed" }
      );
    }

    // ب. 🔥 أتمتة التركيب: لو تحدد ميعاد التركيب -> إنشاء مهمة للفني
    if (
      req.body.status === "ReadyForInstallation" &&
      req.body.installationDate
    ) {
      const installDate = new Date(
        req.body.installationDate
      ).toLocaleDateString("ar-EG");

      await Task.create({
        title: `تركيب مشروع: ${project.title}`,
        description: `المشروع جاهز في المصنع. موعد التركيب: ${installDate}. العنوان: ${project.projectAddress}`,
        assignedTo: "Technician",
        type: "System",
        relatedProject: project._id,
        status: "Pending",
        dueDate: req.body.installationDate,
      });
    }

    // ج. 🔥 أتمتة المالية: تسجيل الإيراد عند التحصيل
    if (req.body.financials) {
      const oldPaid = Number(project.financials.paidAmount || 0);
      const newPaid = Number(req.body.financials.paidAmount || 0);

      // لو المبلغ المدفوع زاد، يبقى فيه فلوس دخلت الخزنة
      if (newPaid > oldPaid) {
        const diff = newPaid - oldPaid;
        await Transaction.create({
          type: "Income",
          amount: diff,
          category: "ProjectPayment",
          description: `تحصيل دفعة آلي من مشروع: ${project.title}`,
          relatedProject: project._id,
          date: new Date(),
        });
      }
      updateData.financials = { ...project.financials, ...req.body.financials };
    }

    const updatedProject = await Project.findByIdAndUpdate(
      req.params.id,
      { $set: updateData },
      { new: true }
    );
    res.status(200).json(updatedProject);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Update Error" });
  }
});

// ==========================================
// 4. تحديث البنود (الفني) + Socket.io + إدارة المهام
// ==========================================
router.put("/:id/items/:itemId", async (req, res) => {
  try {
    const { serialNumber } = req.body;
    const project = await Project.findById(req.params.id);
    const item = project.items.id(req.params.itemId);

    if (!item) return res.status(404).json({ message: "Item not found" });

    // تحديث البند
    item.serialNumber = serialNumber;
    item.isInstalled = true;

    // تحديث حالة المشروع لو أول مرة يركب
    if (project.status === "ReadyForInstallation") {
      project.status = "Installation";
    }

    await project.save();

    // 🔔 1. إرسال إشعار لحظي (Real-time) بتركيب البند
    const io = req.app.get("socketio");
    if (io) {
      io.emit("notification", {
        title: `تم تركيب بند جديد 🛠️`,
        message: `في مشروع: ${project.title} - ${item.description}`,
        type: "info",
      });
    }

    // 🔥 2. فحص الاكتمال: هل انتهى كل شيء؟
    const updatedProjectCheck = await Project.findById(req.params.id);
    const allItemsInstalled = updatedProjectCheck.items.every(
      (i) => i.isInstalled === true
    );

    if (allItemsInstalled && updatedProjectCheck.items.length > 0) {
      // أ. إغلاق مهمة "التركيب" تلقائياً
      await Task.findOneAndUpdate(
        {
          relatedProject: project._id,
          status: "Pending",
          title: { $regex: "تركيب" },
        },
        { status: "Completed" }
      );

      // ب. إنشاء مهمة "استخراج الشهادات"
      const existingTask = await Task.findOne({
        relatedProject: project._id,
        title: { $regex: "استخراج شهادات" },
      });

      if (!existingTask) {
        await Task.create({
          title: `استخراج شهادات مشروع: ${project.title}`,
          description: `قام الفني بإنهاء جميع التركيبات. يرجى استخراج الشهادات ورفعها وإغلاق المشروع.`,
          assignedTo: "Admin",
          type: "System",
          relatedProject: project._id,
          status: "Pending",
          dueDate: new Date(),
        });
      }

      // 🔔 ج. إرسال إشعار بانتهاء المشروع بالكامل
      if (io) {
        io.emit("notification", {
          title: `🎉 اكتمل التركيب!`,
          message: `مشروع "${project.title}" جاهز لاستخراج الشهادات الآن.`,
          type: "success",
        });
      }
    }

    res.status(200).json(project);
  } catch (err) {
    res.status(500).json({ message: "Error" });
  }
});

// ==========================================
// 5. رفع الشهادات + إغلاق مهمة الشهادات
// ==========================================
router.post(
  "/:id/certificates",
  upload.single("certFile"),
  async (req, res) => {
    try {
      const { title } = req.body;
      if (!req.file) return res.status(400).json({ message: "No file" });

      const project = await Project.findByIdAndUpdate(
        req.params.id,
        {
          $push: {
            certificates: {
              title: title || req.file.originalname,
              url: req.file.path,
            },
          },
        },
        { new: true }
      );

      // 🔥 أتمتة: إغلاق مهمة "استخراج الشهادات"
      await Task.findOneAndUpdate(
        {
          relatedProject: req.params.id,
          status: "Pending",
          title: { $regex: "استخراج شهادات" },
        },
        { status: "Completed" }
      );

      res.status(200).json(project);
    } catch (err) {
      res.status(500).json({ message: "Error" });
    }
  }
);

module.exports = router;
