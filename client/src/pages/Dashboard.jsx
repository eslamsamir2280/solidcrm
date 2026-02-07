import { useState, useEffect } from "react";
import axios from "axios";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  Legend,
} from "recharts";

function Dashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const res = await axios.get("http://76.13.44.173/api/dashboard/stats");
      setData(res.data);
      setLoading(false);
    } catch (err) {
      console.error(err);
      setLoading(false);
    }
  };

  const COLORS = [
    "#0088FE",
    "#00C49F",
    "#FFBB28",
    "#FF8042",
    "#8884d8",
    "#82ca9d",
  ];
  const getTypeColor = (type) => (type === "Income" ? "#10b981" : "#ef4444");

  if (loading)
    return (
      <div style={{ textAlign: "center", padding: "50px" }}>
        جاري تحميل الإحصائيات...
      </div>
    );

  return (
    <div className="container">
      <div style={{ marginBottom: "30px" }}>
        <h2 style={{ margin: 0 }}>📊 لوحة القيادة المتكاملة</h2>
        <p style={{ color: "#64748b", margin: 0 }}>
          نظرة شاملة على الأداء المالي والتشغيلي
        </p>
      </div>

      {/* 1. KPIs */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
          gap: "20px",
          marginBottom: "30px",
        }}
      >
        <div
          className="card"
          style={{
            borderRight: "5px solid #4f46e5",
            background: "linear-gradient(to left, #fff, #eef2ff)",
          }}
        >
          <div style={{ color: "#64748b", fontSize: "0.9rem" }}>
            صافي الخزنة
          </div>
          <div
            style={{
              fontSize: "1.6rem",
              fontWeight: "bold",
              color: data.financials.balance >= 0 ? "#1e293b" : "#ef4444",
            }}
          >
            {data.financials.balance.toLocaleString()}
          </div>
        </div>
        <div className="card" style={{ borderRight: "5px solid #10b981" }}>
          <div style={{ color: "#64748b", fontSize: "0.9rem" }}>
            إجمالي الإيرادات
          </div>
          <div
            style={{ fontSize: "1.6rem", fontWeight: "bold", color: "#10b981" }}
          >
            {data.financials.totalIncome.toLocaleString()}
          </div>
        </div>
        <div className="card" style={{ borderRight: "5px solid #ef4444" }}>
          <div style={{ color: "#64748b", fontSize: "0.9rem" }}>
            إجمالي المصروفات
          </div>
          <div
            style={{ fontSize: "1.6rem", fontWeight: "bold", color: "#ef4444" }}
          >
            {data.financials.totalExpense.toLocaleString()}
          </div>
        </div>
        <div className="card" style={{ borderRight: "5px solid #f59e0b" }}>
          <div style={{ color: "#64748b", fontSize: "0.9rem" }}>
            مشاريع جارية
          </div>
          <div
            style={{ fontSize: "1.6rem", fontWeight: "bold", color: "#1e293b" }}
          >
            {data.counts.activeProjects}
          </div>
        </div>
      </div>

      {/* 2. Charts Row 1 */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(400px, 1fr))",
          gap: "20px",
          marginBottom: "30px",
        }}
      >
        <div className="card" style={{ height: "350px" }}>
          <h3 style={{ marginTop: 0, color: "#475569", fontSize: "1rem" }}>
            📈 التدفق النقدي (آخر 6 شهور)
          </h3>
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={data.charts.monthlyData}
              margin={{ top: 10, right: 30, left: 0, bottom: 30 }}
            >
              <defs>
                <linearGradient id="colorIncome" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.8} />
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="colorExpense" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#ef4444" stopOpacity={0.8} />
                  <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis dataKey="name" />
              <YAxis />
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <Tooltip />
              <Legend verticalAlign="top" height={36} />
              <Area
                type="monotone"
                dataKey="Income"
                name="إيرادات"
                stroke="#10b981"
                fillOpacity={1}
                fill="url(#colorIncome)"
              />
              <Area
                type="monotone"
                dataKey="Expense"
                name="مصروفات"
                stroke="#ef4444"
                fillOpacity={1}
                fill="url(#colorExpense)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className="card" style={{ height: "350px" }}>
          <h3 style={{ marginTop: 0, color: "#475569", fontSize: "1rem" }}>
            🏗️ موقف المشاريع الحالية
          </h3>
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data.charts.projectPieData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={100}
                fill="#8884d8"
                paddingAngle={5}
                dataKey="value"
                label={({ name, percent }) =>
                  `${name} ${(percent * 100).toFixed(0)}%`
                }
              >
                {data.charts.projectPieData.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={COLORS[index % COLORS.length]}
                  />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* 3. Charts Row 2 + Upcoming Installments */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(400px, 1fr))",
          gap: "20px",
          marginBottom: "30px",
        }}
      >
        {/* تحليل المصروفات */}
        <div className="card" style={{ height: "350px" }}>
          <h3 style={{ marginTop: 0, color: "#475569", fontSize: "1rem" }}>
            💸 تحليل المصروفات
          </h3>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={data.charts.expenseChartData}
              margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip cursor={{ fill: "transparent" }} />
              <Bar
                dataKey="value"
                name="القيمة"
                fill="#f59e0b"
                radius={[10, 10, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* 🔥 الجديد: مستحقات هذا الشهر */}
        <div className="card" style={{ height: "350px", overflowY: "auto" }}>
          <h3
            style={{
              marginTop: 0,
              color: "#d97706",
              fontSize: "1rem",
              display: "flex",
              alignItems: "center",
              gap: "8px",
            }}
          >
            📅 دفعات مستحقة هذا الشهر
            <span
              style={{
                fontSize: "0.8rem",
                background: "#fef3c7",
                color: "#92400e",
                padding: "2px 8px",
                borderRadius: "10px",
              }}
            >
              {data.dueInstallments.length} دفعة
            </span>
          </h3>

          {data.dueInstallments.length > 0 ? (
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <tbody>
                {data.dueInstallments.map((inst, idx) => (
                  <tr key={idx} style={{ borderBottom: "1px solid #fef3c7" }}>
                    <td style={{ padding: "10px" }}>
                      <div style={{ fontWeight: "bold", color: "#1e293b" }}>
                        {inst.projectTitle}
                      </div>
                      <div style={{ fontSize: "0.8rem", color: "#64748b" }}>
                        {inst.installmentTitle}
                      </div>
                    </td>
                    <td style={{ padding: "10px", textAlign: "left" }}>
                      <div style={{ fontWeight: "bold", color: "#059669" }}>
                        {inst.amount.toLocaleString()}{" "}
                        <span style={{ fontSize: "0.7rem" }}>EGP</span>
                      </div>
                      <div
                        style={{
                          fontSize: "0.75rem",
                          color: "#d97706",
                          fontWeight: "bold",
                        }}
                      >
                        مطلوب:{" "}
                        {new Date(inst.dueDate).toLocaleDateString("ar-EG")}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div
              style={{ textAlign: "center", padding: "40px", color: "#94a3b8" }}
            >
              🎉 لا توجد متأخرات أو مستحقات لهذا الشهر!
            </div>
          )}
        </div>
      </div>

      {/* 4. آخر المعاملات (Full Width) */}
      <div className="card">
        <h3 style={{ marginTop: 0, color: "#475569", fontSize: "1rem" }}>
          🕒 أحدث المعاملات المالية
        </h3>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr
              style={{
                background: "#f8fafc",
                fontSize: "0.9rem",
                color: "#64748b",
              }}
            >
              <th style={{ padding: "10px", textAlign: "right" }}>البيان</th>
              <th style={{ padding: "10px", textAlign: "right" }}>المبلغ</th>
              <th style={{ padding: "10px", textAlign: "right" }}>التاريخ</th>
            </tr>
          </thead>
          <tbody>
            {data.recentTransactions.map((t) => (
              <tr key={t._id} style={{ borderBottom: "1px solid #f1f5f9" }}>
                <td style={{ padding: "12px", fontSize: "0.9rem" }}>
                  <div style={{ fontWeight: "bold" }}>{t.description}</div>
                  <div style={{ fontSize: "0.75rem", color: "#94a3b8" }}>
                    {t.category}
                  </div>
                </td>
                <td
                  style={{
                    padding: "12px",
                    fontWeight: "bold",
                    color: getTypeColor(t.type),
                  }}
                >
                  {t.type === "Income" ? "+" : "-"} {t.amount.toLocaleString()}
                </td>
                <td
                  style={{
                    padding: "12px",
                    fontSize: "0.85rem",
                    color: "#64748b",
                  }}
                >
                  {new Date(t.date).toLocaleDateString("ar-EG")}
                </td>
              </tr>
            ))}
            {data.recentTransactions.length === 0 && (
              <tr>
                <td
                  colSpan="3"
                  style={{ textAlign: "center", padding: "20px" }}
                >
                  لا توجد معاملات
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default Dashboard;

