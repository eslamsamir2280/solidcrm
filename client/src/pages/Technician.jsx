import { useState, useEffect } from "react";
import axios from "axios";

function Technician() {
  const [projects, setProjects] = useState([]);
  const [selectedProject, setSelectedProject] = useState(null); // المشروع المفتوح حالياً
  const [loading, setLoading] = useState(false);

  // States للتعامل مع الإدخال
  const [serialInputs, setSerialInputs] = useState({}); // عشان نحفظ السيريال لكل بند لوحده

  useEffect(() => {
    fetchWorkOrders();
  }, []);

  // 1. جلب المشاريع المتاحة للفني فقط
  const fetchWorkOrders = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/projects");
      // الفلتر: المشاريع الجاهزة للتركيب أو اللي شغالين فيها بالفعل
      const activeProjects = res.data.filter(
        (p) =>
          p.status === "ReadyForInstallation" || p.status === "Installation"
      );
      setProjects(activeProjects);

      // لو كنا فاتحين مشروع معين، نحدث بياناته عشان التغييرات تظهر
      if (selectedProject) {
        const updatedCurrent = activeProjects.find(
          (p) => p._id === selectedProject._id
        );
        if (updatedCurrent) setSelectedProject(updatedCurrent);
      }
    } catch (err) {
      console.error(err);
    }
  };

  // 2. تحديث حالة البند (تركيب)
  const handleInstallItem = async (projectId, itemId) => {
    const serial = serialInputs[itemId];
    if (!serial)
      return alert("⚠️ لازم تكتب رقم السيريال (S/N) الموجود على الباب/الحلق");

    if (!window.confirm(`تأكيد تركيب البند بسيريال: ${serial}؟`)) return;

    setLoading(true);
    try {
      await axios.put(
        `http://localhost:5000/api/projects/${projectId}/items/${itemId}`,
        {
          serialNumber: serial,
        }
      );
      alert("✅ الله ينور! تم تسجيل التركيب.");

      // تصفية الانبوت
      setSerialInputs((prev) => ({ ...prev, [itemId]: "" }));

      // تحديث البيانات
      fetchWorkOrders();
      setLoading(false);
    } catch (err) {
      alert("❌ حصل مشكلة في السيرفر");
      setLoading(false);
    }
  };

  // التعامل مع كتابة السيريال
  const handleSerialChange = (itemId, value) => {
    setSerialInputs((prev) => ({ ...prev, [itemId]: value }));
  };

  // --- واجهة عرض قائمة المشاريع (Home View) ---
  if (!selectedProject) {
    return (
      <div className="container">
        <div style={{ textAlign: "center", marginBottom: "30px" }}>
          <h2 style={{ margin: 0 }}>👷 بوابة الفنيين</h2>
          <p style={{ color: "#64748b" }}>أوامر الشغل المفتوحة اليوم</p>
        </div>

        {projects.length > 0 ? (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
              gap: "20px",
            }}
          >
            {projects.map((p) => (
              <div
                key={p._id}
                className="card"
                style={{
                  borderTop: "5px solid #4f46e5",
                  cursor: "pointer",
                  transition: "0.3s",
                }}
                onClick={() => setSelectedProject(p)}
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "start",
                    marginBottom: "15px",
                  }}
                >
                  <h3 style={{ margin: 0, fontSize: "1.2rem" }}>{p.title}</h3>
                  <span
                    style={{
                      background:
                        p.status === "ReadyForInstallation"
                          ? "#dcfce7"
                          : "#fef3c7",
                      color:
                        p.status === "ReadyForInstallation"
                          ? "#166534"
                          : "#92400e",
                      padding: "5px 10px",
                      borderRadius: "10px",
                      fontSize: "0.8rem",
                      fontWeight: "bold",
                    }}
                  >
                    {p.status === "ReadyForInstallation"
                      ? "🆕 ابدأ الشغل"
                      : "🔧 جاري العمل"}
                  </span>
                </div>

                <p style={{ margin: "0 0 10px 0", color: "#475569" }}>
                  📍 {p.projectAddress}
                </p>
                <div
                  style={{
                    display: "flex",
                    gap: "10px",
                    fontSize: "0.9rem",
                    color: "#64748b",
                  }}
                >
                  <span>
                    📅 الميعاد:{" "}
                    {p.installationDate
                      ? new Date(p.installationDate).toLocaleDateString("ar-EG")
                      : "غير محدد"}
                  </span>
                </div>

                <div style={{ marginTop: "20px", textAlign: "center" }}>
                  <div
                    style={{
                      background: "#f1f5f9",
                      padding: "10px",
                      borderRadius: "8px",
                      fontWeight: "bold",
                      color: "#334155",
                    }}
                  >
                    اضغط للدخول وتسجيل التركيب 🔨
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div
            style={{
              textAlign: "center",
              padding: "50px",
              background: "white",
              borderRadius: "12px",
              boxShadow: "0 2px 5px rgba(0,0,0,0.05)",
            }}
          >
            <h3>🎉 مفيش شغل مطلوب حالياً</h3>
            <p>الله ينور يا رجالة، ارتاحوا شوية.</p>
          </div>
        )}
      </div>
    );
  }

  // --- واجهة العمل داخل المشروع (Detail View) ---
  const completedItems = selectedProject.items.filter(
    (i) => i.isInstalled
  ).length;
  const totalItems = selectedProject.items.length;
  const progress = Math.round((completedItems / totalItems) * 100) || 0;

  return (
    <div className="container">
      {/* زر الرجوع والهيدر */}
      <button
        onClick={() => setSelectedProject(null)}
        style={{
          background: "transparent",
          color: "#4f46e5",
          border: "none",
          marginBottom: "20px",
          fontSize: "1rem",
          cursor: "pointer",
          padding: 0,
        }}
      >
        🡠 رجوع للقائمة
      </button>

      <div
        className="card"
        style={{ marginBottom: "20px", background: "#1e293b", color: "white" }}
      >
        <h2 style={{ margin: "0 0 10px 0", color: "white" }}>
          {selectedProject.title}
        </h2>
        <p style={{ margin: 0, opacity: 0.8 }}>
          📍 {selectedProject.projectAddress}
        </p>

        {/* شريط التقدم */}
        <div style={{ marginTop: "20px" }}>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              marginBottom: "5px",
              fontSize: "0.9rem",
            }}
          >
            <span>نسبة الإنجاز</span>
            <span>
              {completedItems} من {totalItems}
            </span>
          </div>
          <div
            style={{
              width: "100%",
              height: "10px",
              background: "rgba(255,255,255,0.2)",
              borderRadius: "5px",
            }}
          >
            <div
              style={{
                width: `${progress}%`,
                height: "100%",
                background: "#10b981",
                borderRadius: "5px",
                transition: "0.5s",
              }}
            ></div>
          </div>
        </div>
      </div>

      <h3 style={{ marginBottom: "20px" }}>📋 بنود الأعمال المطلوبة</h3>

      <div style={{ display: "flex", flexDirection: "column", gap: "15px" }}>
        {selectedProject.items.map((item, index) => (
          <div
            key={item._id}
            className="card"
            style={{
              padding: "20px",
              margin: 0,
              border: item.isInstalled
                ? "2px solid #10b981"
                : "1px solid #e2e8f0",
              background: item.isInstalled ? "#f0fdf4" : "white",
              opacity: item.isInstalled ? 0.8 : 1,
            }}
          >
            {/* تفاصيل البند */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "15px",
                marginBottom: "15px",
              }}
            >
              <div
                style={{
                  background: item.itemType === "Door" ? "#dbeafe" : "#f3e8ff",
                  color: item.itemType === "Door" ? "#1e40af" : "#6b21a8",
                  width: "50px",
                  height: "50px",
                  borderRadius: "12px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "1.5rem",
                }}
              >
                {item.itemType === "Door" ? "🚪" : "🔲"}
              </div>
              <div>
                <h4 style={{ margin: 0, fontSize: "1.1rem" }}>
                  {item.description}
                </h4>
                <div style={{ fontSize: "0.85rem", color: "#64748b" }}>
                  {item.isInstalled
                    ? `✅ تم التركيب (S/N: ${item.serialNumber})`
                    : "⏳ في انتظار التركيب"}
                </div>
              </div>
            </div>

            {/* الأكشن: لو مش متركب، اظهر خانة الادخال */}
            {!item.isInstalled && (
              <div style={{ display: "flex", gap: "10px" }}>
                <input
                  type="text"
                  className="form-control"
                  placeholder="اكتب السيريال (S/N)"
                  value={serialInputs[item._id] || ""}
                  onChange={(e) => handleSerialChange(item._id, e.target.value)}
                  style={{
                    flex: 1,
                    textAlign: "center",
                    letterSpacing: "2px",
                    fontWeight: "bold",
                  }}
                />
                <button
                  onClick={() =>
                    handleInstallItem(selectedProject._id, item._id)
                  }
                  disabled={loading}
                  className="btn"
                  style={{
                    background: "#4f46e5",
                    color: "white",
                    width: "100px",
                  }}
                >
                  تأكيد
                </button>
              </div>
            )}
          </div>
        ))}

        {selectedProject.items.length === 0 && (
          <p style={{ textAlign: "center", color: "#94a3b8" }}>
            لا توجد بنود مسجلة لهذا المشروع.
          </p>
        )}
      </div>
    </div>
  );
}

export default Technician;
