import { useState, useEffect } from "react";
import axios from "axios";

function Finance() {
  const [transactions, setTransactions] = useState([]);
  const [stats, setStats] = useState({ income: 0, expense: 0, balance: 0 });
  const [projects, setProjects] = useState([]); // عشان نختار المشروع واحنا بنصرف

  // Form State
  const [type, setType] = useState("Expense");
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState("Materials");
  const [description, setDescription] = useState("");
  const [projectId, setProjectId] = useState("");

  useEffect(() => {
    fetchData();
    fetchProjects();
  }, []);

  const fetchData = async () => {
    const resTrans = await axios.get("http://localhost:5000/api/finance");
    const resStats = await axios.get("http://localhost:5000/api/finance/stats");
    setTransactions(resTrans.data);
    setStats(resStats.data);
  };

  const fetchProjects = async () => {
    const res = await axios.get("http://localhost:5000/api/projects");
    setProjects(res.data);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!amount || !description) return alert("أكمل البيانات");

    try {
      await axios.post("http://localhost:5000/api/finance", {
        type,
        amount: Number(amount),
        category,
        description,
        relatedProject: projectId || null,
      });
      alert("تم تسجيل المعاملة ✅");
      setAmount("");
      setDescription("");
      setProjectId("");
      fetchData(); // تحديث فوري
    } catch (err) {
      alert("خطأ");
    }
  };

  return (
    <div className="container">
      <div style={{ marginBottom: "30px" }}>
        <h2 style={{ margin: 0 }}>💰 الإدارة المالية والخزنة</h2>
      </div>

      {/* --- 1. كروت الرصيد (Stats) --- */}
      <div className="grid-3" style={{ marginBottom: "30px" }}>
        <div
          className="card"
          style={{
            borderRight: "5px solid #10b981",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <div>
            <div style={{ color: "#64748b" }}>إجمالي المقبوضات</div>
            <div
              style={{
                fontSize: "1.8rem",
                fontWeight: "bold",
                color: "#10b981",
              }}
            >
              {stats.income.toLocaleString()}
            </div>
          </div>
          <div style={{ fontSize: "2rem" }}>📥</div>
        </div>

        <div
          className="card"
          style={{
            borderRight: "5px solid #ef4444",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <div>
            <div style={{ color: "#64748b" }}>إجمالي المصروفات</div>
            <div
              style={{
                fontSize: "1.8rem",
                fontWeight: "bold",
                color: "#ef4444",
              }}
            >
              {stats.expense.toLocaleString()}
            </div>
          </div>
          <div style={{ fontSize: "2rem" }}>💸</div>
        </div>

        <div
          className="card"
          style={{
            borderRight: "5px solid #3b82f6",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            background: "#f8fafc",
          }}
        >
          <div>
            <div style={{ color: "#64748b" }}>صافي الرصيد (الخزنة)</div>
            <div
              style={{
                fontSize: "1.8rem",
                fontWeight: "bold",
                color: stats.balance >= 0 ? "#3b82f6" : "#ef4444",
              }}
            >
              {stats.balance.toLocaleString()}
            </div>
          </div>
          <div style={{ fontSize: "2rem" }}>🏦</div>
        </div>
      </div>

      {/* --- 2. فورم تسجيل معاملة جديدة --- */}
      <div className="card">
        <h3 style={{ marginTop: 0, color: "var(--primary)" }}>
          📝 تسجيل حركة جديدة (مصروف / إيراد)
        </h3>
        <form onSubmit={handleSubmit}>
          <div className="grid-3" style={{ marginBottom: "15px" }}>
            <div>
              <label>نوع الحركة</label>
              <select
                className="form-control"
                value={type}
                onChange={(e) => setType(e.target.value)}
              >
                <option value="Expense">💸 مصروف (خارج)</option>
                <option value="Income">📥 إيراد (داخل)</option>
              </select>
            </div>
            <div>
              <label>المبلغ (EGP)</label>
              <input
                type="number"
                className="form-control"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0.00"
              />
            </div>
            <div>
              <label>التصنيف</label>
              <select
                className="form-control"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
              >
                <option value="Materials">🪵 خامات وتشوين</option>
                <option value="Salaries">👷 يوميات ورواتب</option>
                <option value="Rent">🏠 إيجارات</option>
                <option value="Utilities">💡 كهرباء ومرافق</option>
                <option value="ProjectPayment">💰 دفعة عميل</option>
                <option value="Other">📦 نثريات وأخرى</option>
              </select>
            </div>
          </div>

          <div style={{ display: "flex", gap: "15px", alignItems: "end" }}>
            <div style={{ flex: 1 }}>
              <label>البيان / الوصف</label>
              <input
                className="form-control"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="مثال: شراء 10 لوح خشب زان..."
              />
            </div>
            <div style={{ flex: 1 }}>
              <label>يخص مشروع؟ (اختياري)</label>
              <select
                className="form-control"
                value={projectId}
                onChange={(e) => setProjectId(e.target.value)}
              >
                <option value="">-- مصروف عام --</option>
                {projects.map((p) => (
                  <option key={p._id} value={p._id}>
                    {p.title}
                  </option>
                ))}
              </select>
            </div>
            <button
              type="submit"
              className="btn btn-primary"
              style={{ width: "150px" }}
            >
              حفظ
            </button>
          </div>
        </form>
      </div>

      {/* --- 3. جدول المعاملات --- */}
      <div className="card">
        <h3 style={{ marginBottom: "20px" }}>📋 دفتر اليومية</h3>
        <table>
          <thead>
            <tr>
              <th>التاريخ</th>
              <th>النوع</th>
              <th>التصنيف</th>
              <th>البيان</th>
              <th>المشروع</th>
              <th>المبلغ</th>
            </tr>
          </thead>
          <tbody>
            {transactions.map((t) => (
              <tr key={t._id}>
                <td style={{ color: "#64748b", fontSize: "0.9rem" }}>
                  {new Date(t.date).toLocaleDateString("ar-EG")}
                </td>
                <td>
                  <span
                    style={{
                      background: t.type === "Income" ? "#dcfce7" : "#fee2e2",
                      color: t.type === "Income" ? "#166534" : "#991b1b",
                      padding: "4px 10px",
                      borderRadius: "20px",
                      fontSize: "0.85rem",
                      fontWeight: "bold",
                    }}
                  >
                    {t.type === "Income" ? "إيراد" : "مصروف"}
                  </span>
                </td>
                <td>
                  {t.category === "Materials"
                    ? "🪵 خامات"
                    : t.category === "Salaries"
                    ? "👷 رواتب"
                    : t.category === "ProjectPayment"
                    ? "💰 دفعة"
                    : "📦 أخرى"}
                </td>
                <td style={{ fontWeight: "600" }}>{t.description}</td>
                <td style={{ fontSize: "0.9rem", color: "var(--primary)" }}>
                  {t.relatedProject?.title || "---"}
                </td>
                <td
                  style={{
                    fontWeight: "bold",
                    color: t.type === "Income" ? "#10b981" : "#ef4444",
                    direction: "ltr",
                    textAlign: "right",
                  }}
                >
                  {t.type === "Income" ? "+" : "-"} {t.amount.toLocaleString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default Finance;
