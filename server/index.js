const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const path = require("path");
const http = require("http"); // 1. استدعاء http
const { Server } = require("socket.io"); // 2. استدعاء Socket.io

// --- استدعاء الروتس ---
const clientRoutes = require("./routes/clientRoutes");
const projectRoutes = require("./routes/projectRoutes");
const taskRoutes = require("./routes/taskRoutes");
const financeRoutes = require("./routes/financeRoutes");
const employeeRoutes = require("./routes/employeeRoutes");
const attendanceRoutes = require("./routes/attendanceRoutes");
const dashboardRoutes = require("./routes/dashboardRoutes");
const reportRoutes = require("./routes/reportRoutes");
const authRoutes = require("./routes/authRoutes");

const app = express();

// 3. إعداد السيرفر والـ Socket
const server = http.createServer(app); // ربط express بـ http
const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173", // رابط الفرونت إند
    methods: ["GET", "POST", "PUT", "DELETE"],
  },
});

// 4. تخزين الـ io عشان نستخدمه في الملفات التانية
app.set("socketio", io);

// اختبار اتصال السوكيت
io.on("connection", (socket) => {
  console.log("⚡ A user connected:", socket.id);
  socket.on("disconnect", () => {
    console.log("🔌 User disconnected");
  });
});

// --- Middleware ---
app.use(cors());
app.use(express.json());
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// --- Routes ---
app.use("/api/clients", clientRoutes);
app.use("/api/projects", projectRoutes);
app.use("/api/tasks", taskRoutes);
app.use("/api/finance", financeRoutes);
app.use("/api/employees", employeeRoutes);
app.use("/api/attendance", attendanceRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/reports", reportRoutes);
app.use("/api/auth", authRoutes);

// Database
mongoose
  .connect("mongodb://127.0.0.1:27017/abu-khalil-crm")
  .then(() => console.log("✅ Connected to MongoDB..."))
  .catch((err) => console.error("❌ Could not connect to MongoDB...", err));

const port = process.env.PORT || 5000;
// 5. تشغيل server بدلاً من app
server.listen(port, () => console.log(`🚀 Server running on port ${port}...`));
