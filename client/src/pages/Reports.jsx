import { useState, useRef } from "react";
import axios from "axios";
import { useReactToPrint } from "react-to-print";

function Reports() {
  const [reportType, setReportType] = useState("financial");
  const [dates, setDates] = useState({ start: "", end: "" });
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);

  // إعدادات الطباعة
  const componentRef = useRef();
  const handlePrint = useReactToPrint({
    contentRef: componentRef,
    documentTitle: `Report-${reportType}-${
      new Date().toISOString().split("T")[0]
    }`,
  });

  const generateReport = async () => {
    // التقارير المالية والحضور محتاجة تاريخ
    if (
      (reportType === "financial" || reportType === "attendance") &&
      (!dates.start || !dates.end)
    ) {
      return alert("يرجى تحديد الفترة الزمنية");
    }

    setLoading(true);
    try {
      let endpoint = "";
      if (reportType === "financial")
        endpoint = `http://76.13.44.173/api/reports/financial?startDate=${dates.start}&endDate=${dates.end}`;
      else if (reportType === "projects")
        endpoint = `http://76.13.44.173/api/reports/projects`;
      else if (reportType === "attendance")
        endpoint = `http://76.13.44.173/api/reports/attendance?startDate=${dates.start}&endDate=${dates.end}`; // 👈 الرابط الجديد

      const res = await axios.get(endpoint);
      setData(res.data);
      setLoading(false);
    } catch (err) {
      console.error(err);
      setLoading(false);
      alert("حدث خطأ");
    }
  };

  return (
    <div className="container">
      <div style={{ marginBottom: "30px" }}>
        <h2 style={{ margin: 0 }}>📑 التقارير والسجلات</h2>
        <p style={{ color: "#64748b" }}>استخراج تقارير رسمية للطباعة</p>
      </div>

      {/* 1. أدوات التحكم */}
      <div
        className="card"
        style={{ marginBottom: "30px", background: "#f8fafc" }}
      >
        <div
          style={{
            display: "flex",
            gap: "20px",
            alignItems: "end",
            flexWrap: "wrap",
          }}
        >
          <div style={{ minWidth: "200px" }}>
            <label>نوع التقرير</label>
            <select
              className="form-control"
              value={reportType}
              onChange={(e) => {
                setReportType(e.target.value);
                setData(null);
              }}
            >
              <option value="financial">💰 تقرير مالي (أرباح وخسائر)</option>
              <option value="projects">🏗️ تقرير حالة المشاريع</option>
              <option value="attendance">🕒 تقرير ساعات العمل</option>{" "}
              {/* 👈 الخيار الجديد */}
            </select>
          </div>

          {/* التاريخ يظهر للمالي وللحضور */}
          {(reportType === "financial" || reportType === "attendance") && (
            <>
              <div>
                <label>من تاريخ</label>
                <input
                  type="date"
                  className="form-control"
                  value={dates.start}
                  onChange={(e) =>
                    setDates({ ...dates, start: e.target.value })
                  }
                />
              </div>
              <div>
                <label>إلى تاريخ</label>
                <input
                  type="date"
                  className="form-control"
                  value={dates.end}
                  onChange={(e) => setDates({ ...dates, end: e.target.value })}
                />
              </div>
            </>
          )}

          <button
            onClick={generateReport}
            className="btn btn-primary"
            style={{ height: "42px" }}
          >
            🔎 استخراج
          </button>

          {data && (
            <button
              onClick={handlePrint}
              className="btn"
              style={{ height: "42px", background: "#334155", color: "white" }}
            >
              🖨️ طباعة
            </button>
          )}
        </div>
      </div>

      {/* 2. منطقة العرض والطباعة */}
      {loading && (
        <div style={{ textAlign: "center" }}>جاري تجهيز التقرير...</div>
      )}

      {data && (
        <div className="card" style={{ overflowX: "auto" }}>
          <div
            ref={componentRef}
            style={{ padding: "20px", background: "white", minHeight: "600px" }}
          >
            {/* ترويسة التقرير */}
            <div
              style={{
                textAlign: "center",
                borderBottom: "2px solid #0f172a",
                paddingBottom: "20px",
                marginBottom: "30px",
              }}
            >
              <h1 style={{ margin: 0, color: "#0f172a" }}>
سوليد للأواب المعدنية              </h1>
              <p style={{ margin: "5px 0" }}>
                {reportType === "financial" && "تقرير مالي مفصل"}
                {reportType === "projects" && "تقرير حالة المشاريع"}
                {reportType === "attendance" && "تقرير ساعات العمل والحضور"}
              </p>
              {(reportType === "financial" || reportType === "attendance") && (
                <p style={{ fontSize: "0.9rem", color: "#64748b" }}>
                  الفترة من: {dates.start} إلى: {dates.end}
                </p>
              )}
              <p style={{ fontSize: "0.8rem", color: "#94a3b8" }}>
                تاريخ الاستخراج: {new Date().toLocaleDateString("ar-EG")}
              </p>
            </div>

            {/* --- أ. المحتوى المالي --- */}
            {reportType === "financial" && (
              <>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-around",
                    background: "#f1f5f9",
                    padding: "20px",
                    borderRadius: "10px",
                    marginBottom: "30px",
                  }}
                >
                  <div style={{ textAlign: "center" }}>
                    <div style={{ color: "#10b981", fontWeight: "bold" }}>
                      إجمالي الإيرادات
                    </div>
                    <div style={{ fontSize: "1.2rem" }}>
                      {data.summary.totalIncome.toLocaleString()}
                    </div>
                  </div>
                  <div style={{ textAlign: "center" }}>
                    <div style={{ color: "#ef4444", fontWeight: "bold" }}>
                      إجمالي المصروفات
                    </div>
                    <div style={{ fontSize: "1.2rem" }}>
                      {data.summary.totalExpense.toLocaleString()}
                    </div>
                  </div>
                  <div style={{ textAlign: "center" }}>
                    <div style={{ color: "#1e293b", fontWeight: "bold" }}>
                      صافي الربح
                    </div>
                    <div style={{ fontSize: "1.4rem", fontWeight: "bold" }}>
                      {data.summary.netProfit.toLocaleString()}
                    </div>
                  </div>
                </div>
                <h3
                  style={{
                    borderBottom: "1px solid #e2e8f0",
                    paddingBottom: "10px",
                  }}
                >
                  📝 سجل العمليات
                </h3>
                <table
                  style={{
                    width: "100%",
                    borderCollapse: "collapse",
                    fontSize: "0.9rem",
                  }}
                >
                  <thead>
                    <tr style={{ background: "#0f172a", color: "white" }}>
                      <th style={{ padding: "10px" }}>التاريخ</th>
                      <th style={{ padding: "10px" }}>النوع</th>
                      <th style={{ padding: "10px" }}>البيان</th>
                      <th style={{ padding: "10px" }}>المبلغ</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.details.map((t, i) => (
                      <tr key={i} style={{ borderBottom: "1px solid #e2e8f0" }}>
                        <td style={{ padding: "8px" }}>
                          {new Date(t.date).toLocaleDateString("ar-EG")}
                        </td>
                        <td
                          style={{
                            padding: "8px",
                            color: t.type === "Income" ? "green" : "red",
                          }}
                        >
                          {t.type === "Income" ? "إيراد" : "مصروف"}
                        </td>
                        <td style={{ padding: "8px" }}>{t.description}</td>
                        <td style={{ padding: "8px", fontWeight: "bold" }}>
                          {t.amount.toLocaleString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </>
            )}

            {/* --- ب. محتوى المشاريع --- */}
            {reportType === "projects" && (
              <table
                style={{
                  width: "100%",
                  borderCollapse: "collapse",
                  fontSize: "0.9rem",
                }}
              >
                <thead>
                  <tr style={{ background: "#0f172a", color: "white" }}>
                    <th style={{ padding: "10px" }}>المشروع</th>
                    <th style={{ padding: "10px" }}>العميل</th>
                    <th style={{ padding: "10px" }}>الحالة</th>
                    <th style={{ padding: "10px" }}>العقد</th>
                    <th style={{ padding: "10px" }}>المدفوع</th>
                    <th style={{ padding: "10px" }}>المتبقي</th>
                    <th style={{ padding: "10px" }}>%</th>
                  </tr>
                </thead>
                <tbody>
                  {data.map((proj, i) => (
                    <tr key={i} style={{ borderBottom: "1px solid #e2e8f0" }}>
                      <td style={{ padding: "10px", fontWeight: "bold" }}>
                        {proj.title}
                      </td>
                      <td style={{ padding: "10px" }}>{proj.client}</td>
                      <td style={{ padding: "10px" }}>{proj.status}</td>
                      <td style={{ padding: "10px" }}>
                        {proj.total.toLocaleString()}
                      </td>
                      <td style={{ padding: "10px", color: "green" }}>
                        {proj.paid.toLocaleString()}
                      </td>
                      <td style={{ padding: "10px", color: "red" }}>
                        {proj.remaining.toLocaleString()}
                      </td>
                      <td style={{ padding: "10px" }}>{proj.completion}%</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}

            {/* --- ج. 🔥 الجديد: محتوى ساعات العمل --- */}
            {reportType === "attendance" && (
              <table
                style={{
                  width: "100%",
                  borderCollapse: "collapse",
                  fontSize: "0.9rem",
                }}
              >
                <thead>
                  <tr style={{ background: "#0f172a", color: "white" }}>
                    <th style={{ padding: "10px" }}>الموظف</th>
                    <th style={{ padding: "10px" }}>الوظيفة</th>
                    <th style={{ padding: "10px" }}>أيام الحضور</th>
                    <th style={{ padding: "10px" }}>أيام التأخير</th>
                    <th style={{ padding: "10px" }}>إجمالي الساعات</th>
                  </tr>
                </thead>
                <tbody>
                  {data.map((emp, i) => (
                    <tr key={i} style={{ borderBottom: "1px solid #e2e8f0" }}>
                      <td style={{ padding: "10px", fontWeight: "bold" }}>
                        {emp.name}
                      </td>
                      <td style={{ padding: "10px" }}>{emp.role}</td>
                      <td
                        style={{
                          padding: "10px",
                          color: "green",
                          fontWeight: "bold",
                        }}
                      >
                        {emp.presentDays}
                      </td>
                      <td style={{ padding: "10px", color: "#d97706" }}>
                        {emp.lateDays}
                      </td>
                      <td style={{ padding: "10px", fontWeight: "bold" }}>
                        {emp.totalHours}{" "}
                        <span
                          style={{ fontSize: "0.8rem", fontWeight: "normal" }}
                        >
                          ساعة
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}

            {/* تذييل الصفحة */}
            <div
              style={{
                marginTop: "50px",
                paddingTop: "20px",
                borderTop: "1px solid #e2e8f0",
                display: "flex",
                justifyContent: "space-between",
              }}
            >
              <div>توقيع المحاسب / HR: ....................</div>
              <div>توقيع المدير: ....................</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Reports;

