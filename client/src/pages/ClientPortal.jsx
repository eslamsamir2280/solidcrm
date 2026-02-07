import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import ProjectTracker from "../components/ProjectTracker";

function ClientPortal() {
  const { id } = useParams();
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // جلب بيانات المشروع
    axios
      .get(`http://localhost:5000/api/projects/${id}`)
      .then((res) => {
        setProject(res.data);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  }, [id]);

  if (loading)
    return (
      <div style={{ textAlign: "center", padding: "50px", color: "#64748b" }}>
        جاري تحميل بيانات المشروع...
      </div>
    );
  if (!project)
    return (
      <div style={{ textAlign: "center", padding: "50px", color: "red" }}>
        عفواً، الرابط غير صحيح أو المشروع غير موجود.
      </div>
    );

  // حساب المتبقي
  const total = project.financials?.totalValue || 0;
  const paid = project.financials?.paidAmount || 0;
  const remaining = total - paid;

  return (
    <div
      style={{
        maxWidth: "800px",
        margin: "0 auto",
        padding: "20px",
        fontFamily: "Cairo, sans-serif",
      }}
    >
      {/* --- الهيدر (شعار الشركة) --- */}
      <div style={{ textAlign: "center", marginBottom: "40px" }}>
        <h1 style={{ color: "#4f46e5", margin: 0, fontSize: "2rem" }}>
          أبو خليل
        </h1>
        <p style={{ color: "#64748b", fontWeight: "bold" }}>
          بوابة متابعة العملاء
        </p>
      </div>

      {/* --- رسالة ترحيب --- */}
      <div
        className="card"
        style={{ textAlign: "center", borderTop: "5px solid #4f46e5" }}
      >
        <h2 style={{ margin: "0 0 10px 0" }}>
          مرحباً، {project.client?.name} 👋
        </h2>
        <p style={{ color: "#64748b", margin: 0 }}>
          هنا يمكنك متابعة حالة مشروعك <strong>"{project.title}"</strong> لحظة
          بلحظة.
        </p>
      </div>

      {/* --- شريط التتبع --- */}
      <ProjectTracker
        status={project.status}
        dates={{ installDate: project.installationDate }}
      />

      {/* --- الموقف المالي --- */}
      <div className="card" style={{ marginTop: "20px" }}>
        <h3 style={{ marginTop: 0, color: "#1e293b" }}>💰 الموقف المالي</h3>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr 1fr",
            gap: "10px",
            textAlign: "center",
          }}
        >
          <div
            style={{
              background: "#f8fafc",
              padding: "15px",
              borderRadius: "10px",
            }}
          >
            <div style={{ fontSize: "0.8rem", color: "#64748b" }}>
              إجمالي العقد
            </div>
            <div style={{ fontWeight: "bold", fontSize: "1.1rem" }}>
              {total.toLocaleString()}
            </div>
          </div>

          <div
            style={{
              background: "#dcfce7",
              padding: "15px",
              borderRadius: "10px",
              color: "#166534",
            }}
          >
            <div style={{ fontSize: "0.8rem" }}>تم سداد</div>
            <div style={{ fontWeight: "bold", fontSize: "1.1rem" }}>
              {paid.toLocaleString()}
            </div>
          </div>

          <div
            style={{
              background: "#fee2e2",
              padding: "15px",
              borderRadius: "10px",
              color: "#991b1b",
            }}
          >
            <div style={{ fontSize: "0.8rem" }}>المتبقي</div>
            <div style={{ fontWeight: "bold", fontSize: "1.1rem" }}>
              {remaining.toLocaleString()}
            </div>
          </div>
        </div>
      </div>

      {/* --- تواصل معنا (واتساب) --- */}
      <div style={{ marginTop: "40px", textAlign: "center" }}>
        <p style={{ color: "#64748b" }}>هل لديك استفسار؟</p>
        <a
          href="https://wa.me/201000000000" // حط رقمك هنا
          target="_blank"
          rel="noreferrer"
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "10px",
            background: "#25D366",
            color: "white",
            padding: "12px 30px",
            borderRadius: "50px",
            textDecoration: "none",
            fontWeight: "bold",
            boxShadow: "0 4px 10px rgba(37, 211, 102, 0.4)",
          }}
        >
          <span style={{ fontSize: "1.2rem" }}>💬</span> تواصل عبر واتساب
        </a>
      </div>

      <div
        style={{
          marginTop: "50px",
          textAlign: "center",
          fontSize: "0.8rem",
          color: "#cbd5e1",
        }}
      >
        جميع الحقوق محفوظة © مؤسسة أبو خليل للمقاولات
      </div>
    </div>
  );
}

export default ClientPortal;
