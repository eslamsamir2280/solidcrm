import { useState, useEffect } from "react";
import axios from "axios";
import { Link, useLocation } from "react-router-dom";

function Projects() {
  const [projects, setProjects] = useState([]);
  const [clients, setClients] = useState([]);

  // Filter Logic
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const [filterStatus, setFilterStatus] = useState(
    queryParams.get("status") || "All"
  );

  // Form State
  const [title, setTitle] = useState("");
  const [clientId, setClientId] = useState("");
  const [address, setAddress] = useState("");
  const [doorsCount, setDoorsCount] = useState("");
  const [file, setFile] = useState(null);

  useEffect(() => {
    fetchProjects();
    fetchClients();
  }, []);

  const fetchProjects = async () => {
    const res = await axios.get("http://76.13.44.173/api/projects");
    setProjects(res.data);
  };
  const fetchClients = async () => {
    const res = await axios.get("http://76.13.44.173/api/clients");
    setClients(res.data);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append("client", clientId);
    formData.append("title", title);
    formData.append("projectAddress", address);
    formData.append("initialDoorsCount", doorsCount);
    if (file) formData.append("muqaysaFile", file);

    try {
      await axios.post("http://76.13.44.173/api/projects", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      fetchProjects();
      alert("✅ تم الحفظ");
      setTitle("");
      setAddress("");
      setDoorsCount("");
      setFile(null);
      setClientId("");
    } catch (err) {
      alert("❌ خطأ");
    }
  };

  const filteredProjects = projects.filter(
    (p) => filterStatus === "All" || p.status === filterStatus
  );

  // Status Badge Helper
  const getStatusStyle = (status) => {
    const styles = {
      Completed: { bg: "#dcfce7", color: "#166534" },
      Manufacturing: { bg: "#dbeafe", color: "#1e40af" },
      Installation: { bg: "#f3e8ff", color: "#6b21a8" },
      ClientReview: { bg: "#fef3c7", color: "#92400e" },
      PendingPricing: { bg: "#f3f4f6", color: "#374151" },
    };
    const s = styles[status] || styles.PendingPricing;
    return {
      background: s.bg,
      color: s.color,
      padding: "6px 12px",
      borderRadius: "20px",
      fontSize: "0.85rem",
      fontWeight: "700",
    };
  };

  return (
    <div className="container">
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "30px",
        }}
      >
        <h2 style={{ margin: 0, fontSize: "1.8rem" }}>📂 المشاريع</h2>
        <div
          style={{
            background: "white",
            padding: "10px 20px",
            borderRadius: "12px",
            boxShadow: "0 2px 5px rgba(0,0,0,0.05)",
            fontWeight: "bold",
            color: "#64748b",
          }}
        >
          العدد الإجمالي:{" "}
          <span style={{ color: "#4f46e5" }}>{projects.length}</span>
        </div>
      </div>

      {/* --- فورم إضافة مشروع (Clean Grid Layout) --- */}
      <div className="card">
        <h3
          style={{
            marginTop: 0,
            marginBottom: "20px",
            color: "var(--primary)",
            display: "flex",
            alignItems: "center",
            gap: "10px",
          }}
        >
          <span>✨</span> تسجيل مشروع جديد
        </h3>

        <form onSubmit={handleSubmit}>
          {/* الصف الأول: 3 أعمدة متساوية */}
          <div className="grid-3" style={{ marginBottom: "20px" }}>
            <div>
              <label>العميل</label>
              <select
                className="form-control"
                value={clientId}
                onChange={(e) => setClientId(e.target.value)}
                required
              >
                <option value="">-- اختر العميل --</option>
                {clients.map((c) => (
                  <option key={c._id} value={c._id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label>اسم المشروع</label>
              <input
                className="form-control"
                placeholder="مثال: فيلا التجمع"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
              />
            </div>
            <div>
              <label>العنوان</label>
              <input
                className="form-control"
                placeholder="العنوان بالتفصيل"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
              />
            </div>
          </div>

          {/* الصف الثاني: تقسيم 25% - 50% - 25% */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 2fr 1fr",
              gap: "20px",
              alignItems: "end",
            }}
          >
            <div>
              <label>عدد الأبواب</label>
              <input
                type="number"
                className="form-control"
                value={doorsCount}
                onChange={(e) => setDoorsCount(e.target.value)}
              />
            </div>
            <div>
              <label>رفع المقايسة</label>
              <input
                type="file"
                className="form-control"
                onChange={(e) => setFile(e.target.files[0])}
                style={{ paddingTop: "10px" }}
              />
            </div>
            <button
              type="submit"
              className="btn btn-primary"
              style={{ width: "100%" }}
            >
              + حفظ المشروع
            </button>
          </div>
        </form>
      </div>

      {/* --- الفلتر --- */}
      <div
        className="card"
        style={{
          padding: "15px",
          display: "flex",
          alignItems: "center",
          gap: "15px",
          background: "#f8fafc",
        }}
      >
        <span style={{ fontWeight: "700", color: "var(--secondary)" }}>
          🔍 تصفية حسب الحالة:
        </span>
        <select
          className="form-control"
          style={{ width: "250px", height: "40px", background: "white" }}
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
        >
          <option value="All">عرض الكل</option>
          <option value="PendingPricing">في انتظار التسعير</option>
          <option value="ClientReview">مراجعة العميل</option>
          <option value="Manufacturing">جاري التصنيع</option>
          <option value="Installation">جاري التركيب</option>
          <option value="Completed">مكتمل</option>
        </select>
      </div>

      {/* --- الجدول --- */}
      <div style={{ overflowX: "auto" }}>
        <table>
          <thead>
            <tr>
              <th style={{ width: "25%" }}>المشروع</th>
              <th style={{ width: "25%" }}>العنوان</th>
              <th>العدد</th>
              <th>المقايسة</th>
              <th>الحالة</th>
              <th>إجراء</th>
            </tr>
          </thead>
          <tbody>
            {filteredProjects.length > 0 ? (
              filteredProjects.map((p) => (
                <tr key={p._id}>
                  <td style={{ fontWeight: "700", color: "#1e293b" }}>
                    {p.title}
                  </td>
                  <td style={{ color: "#64748b" }}>{p.projectAddress}</td>
                  <td style={{ textAlign: "center", fontWeight: "bold" }}>
                    {p.initialDoorsCount}
                  </td>
                  <td>
                    {p.muqaysaFile ? (
                      <a
                        href={`http://localhost:5000/${p.muqaysaFile}`}
                        target="_blank"
                        style={{ color: "var(--primary)", fontWeight: "bold" }}
                      >
                        📄 تحميل
                      </a>
                    ) : (
                      "-"
                    )}
                  </td>
                  <td>
                    <span style={getStatusStyle(p.status)}>{p.status}</span>
                  </td>
                  <td>
                    <Link to={`/projects/${p._id}`}>
                      <button
                        className="btn"
                        style={{
                          background: "#f1f5f9",
                          color: "#334155",
                          height: "35px",
                          fontSize: "0.85rem",
                        }}
                      >
                        تفاصيل ↗
                      </button>
                    </Link>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan="6"
                  style={{
                    textAlign: "center",
                    padding: "40px",
                    color: "#94a3b8",
                  }}
                >
                  لا توجد مشاريع
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default Projects;

