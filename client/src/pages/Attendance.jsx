import { useState, useEffect } from "react";
import axios from "axios";

function Attendance() {
  const [report, setReport] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAttendance();
  }, []);

  const fetchAttendance = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/attendance/today");
      setReport(res.data);
      setLoading(false);
    } catch (err) {
      console.error(err);
      setLoading(false);
    }
  };

  // زر الحضور والانصراف (ذكي)
  const handleToggleAttendance = async (empId, name) => {
    if (!window.confirm(`تسجيل حركة للموظف: ${name}؟`)) return;
    try {
      const res = await axios.post(
        "http://localhost:5000/api/attendance/toggle",
        { employeeId: empId }
      );
      alert(res.data.message);
      fetchAttendance();
    } catch (err) {
      alert(err.response?.data?.message || "خطأ");
    }
  };
  // دالة تجديد السنة الجديدة
  const handleResetYear = async () => {
    const confirmMsg =
      "⚠️ تحذير هام!\n\nهل أنت متأكد من تجديد رصيد الإجازات لجميع الموظفين؟\nسيتم ضبط الرصيد لـ 21 يوم للجميع.\nيستخدم هذا الزر مرة واحدة في بداية السنة.";
    if (!window.confirm(confirmMsg)) return;

    try {
      const res = await axios.post(
        "http://localhost:5000/api/attendance/reset-leaves"
      );
      alert(res.data.message);
      fetchAttendance();
    } catch (err) {
      alert("خطأ في التحديث");
    }
  };
  // زر الإجازة
  const handleRegisterLeave = async (empId, name) => {
    const note = prompt(`تسجيل إجازة للموظف: ${name}\nاكتب السبب:`);
    if (!note) return;

    try {
      const res = await axios.post(
        "http://localhost:5000/api/attendance/leave",
        { employeeId: empId, note }
      );
      alert(res.data.message);
      fetchAttendance();
    } catch (err) {
      alert(err.response?.data?.message || "خطأ");
    }
  };

  // تنسيق الوقت
  const formatTime = (dateStr) => {
    if (!dateStr) return "-";
    return new Date(dateStr).toLocaleTimeString("ar-EG", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // حالة الموظف (ألوان)
  const getStatusBadge = (status) => {
    const styles = {
      Present: { bg: "#dcfce7", col: "#166534", label: "حضور ✅" },
      Absent: { bg: "#fee2e2", col: "#991b1b", label: "غياب ❌" },
      Late: { bg: "#fef3c7", col: "#92400e", label: "تأخير ⚠️" },
      OnLeave: { bg: "#e0e7ff", col: "#3730a3", label: "إجازة 🏖️" },
    };
    const s = styles[status] || styles.Absent;
    return (
      <span
        style={{
          background: s.bg,
          color: s.col,
          padding: "5px 12px",
          borderRadius: "15px",
          fontWeight: "bold",
          fontSize: "0.85rem",
        }}
      >
        {s.label}
      </span>
    );
  };

  if (loading)
    return (
      <div
        className="container"
        style={{ textAlign: "center", padding: "50px" }}
      >
        جاري التحميل...
      </div>
    );

  return (
    <div className="container">
      <div
        style={{
          marginBottom: "30px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <div>
          <h2 style={{ margin: 0 }}>🕒 دفتر الحضور والانصراف</h2>
          <p style={{ color: "#64748b", margin: 0 }}>
            تاريخ اليوم: {new Date().toLocaleDateString("ar-EG")}
          </p>
        </div>

        <div style={{ display: "flex", gap: "10px" }}>
          {/* زر تجديد السنة */}
          <button
            onClick={handleResetYear}
            className="btn"
            style={{
              background: "#fee2e2",
              color: "#991b1b",
              border: "1px solid #991b1b",
            }}
          >
            📅 سنة جديدة
          </button>

          <button
            onClick={fetchAttendance}
            className="btn"
            style={{ background: "#f1f5f9", color: "#334155" }}
          >
            🔄 تحديث
          </button>
        </div>
      </div>

      {/* Grid الكروت للموظفين */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
          gap: "20px",
        }}
      >
        {report.map((emp) => (
          <div
            key={emp._id}
            className="card"
            style={{
              borderLeft: `5px solid ${
                emp.status === "Absent" ? "#ef4444" : "#10b981"
              }`,
            }}
          >
            {/* الهيدر: الاسم والحالة */}
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "start",
                marginBottom: "15px",
              }}
            >
              <div>
                <h3 style={{ margin: 0 }}>{emp.name}</h3>
                <span style={{ fontSize: "0.8rem", color: "#64748b" }}>
                  {emp.role}
                </span>
              </div>
              {getStatusBadge(emp.status)}
            </div>

            {/* تفاصيل الوقت */}
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                background: "#f8fafc",
                padding: "10px",
                borderRadius: "8px",
                marginBottom: "15px",
              }}
            >
              <div style={{ textAlign: "center" }}>
                <div style={{ fontSize: "0.75rem", color: "#64748b" }}>
                  دخول
                </div>
                <div style={{ fontWeight: "bold", color: "#1e293b" }}>
                  {formatTime(emp.checkIn)}
                </div>
              </div>
              <div style={{ width: "1px", background: "#e2e8f0" }}></div>
              <div style={{ textAlign: "center" }}>
                <div style={{ fontSize: "0.75rem", color: "#64748b" }}>
                  خروج
                </div>
                <div style={{ fontWeight: "bold", color: "#1e293b" }}>
                  {formatTime(emp.checkOut)}
                </div>
              </div>
              <div style={{ width: "1px", background: "#e2e8f0" }}></div>
              <div style={{ textAlign: "center" }}>
                <div style={{ fontSize: "0.75rem", color: "#64748b" }}>
                  رصيد إجازات
                </div>
                <div style={{ fontWeight: "bold", color: "#4f46e5" }}>
                  {emp.leaveBalance}
                </div>
              </div>
            </div>

            {/* أزرار التحكم */}
            <div style={{ display: "flex", gap: "10px" }}>
              {/* زر الحضور/الانصراف يظهر فقط لو مش إجازة */}
              {emp.status !== "OnLeave" && (
                <button
                  onClick={() => handleToggleAttendance(emp._id, emp.name)}
                  className="btn"
                  disabled={emp.checkOut} // لو عمل خروج نقفل الزرار
                  style={{
                    flex: 1,
                    background: !emp.checkIn
                      ? "#10b981"
                      : emp.checkOut
                      ? "#cbd5e1"
                      : "#f59e0b",
                    color: "white",
                    opacity: emp.checkOut ? 0.7 : 1,
                  }}
                >
                  {!emp.checkIn
                    ? "تسجيل دخول 🟢"
                    : emp.checkOut
                    ? "تم الانتهاء"
                    : "تسجيل خروج 🔴"}
                </button>
              )}

              {/* زر الإجازة يظهر فقط لو غايب */}
              {emp.status === "Absent" && (
                <button
                  onClick={() => handleRegisterLeave(emp._id, emp.name)}
                  className="btn"
                  style={{
                    background: "#e0e7ff",
                    color: "#3730a3",
                    width: "40%",
                  }}
                >
                  إجازة 🏖️
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Attendance;
