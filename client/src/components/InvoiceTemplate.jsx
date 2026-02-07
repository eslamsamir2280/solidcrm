import React from "react";

// شلنا forwardRef وبقى مكون عادي جداً
const InvoiceTemplate = ({ project }) => {
  if (!project) return null;

  return (
    <div
      style={{
        padding: "40px",
        fontFamily: "Cairo, sans-serif",
        color: "#000",
        background: "white",
        direction: "rtl",
      }}
    >
      {/* --- الهيدر (اللوجو واسم الشركة) --- */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          borderBottom: "3px solid #4f46e5",
          paddingBottom: "20px",
          marginBottom: "30px",
        }}
      >
        <div style={{ textAlign: "right" }}>
          <h1 style={{ margin: 0, color: "#4f46e5", fontSize: "2.5rem" }}>
سوليد          </h1>
          <p style={{ margin: 0, fontSize: "1.2rem", fontWeight: "bold" }}>
للأبواب المعدنية          </p>
        </div>
        <div style={{ textAlign: "left" }}>
          <h2 style={{ margin: 0, color: "#333" }}>فاتورة / عرض سعر</h2>
          <p style={{ margin: "5px 0 0 0" }}>
            تاريخ: {new Date().toLocaleDateString("ar-EG")}
          </p>
          <p style={{ margin: 0 }}>رقم المشروع: #{project._id.slice(-6)}</p>
        </div>
      </div>

      {/* --- بيانات العميل والمشروع --- */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          marginBottom: "40px",
          background: "#f8fafc",
          padding: "20px",
          borderRadius: "10px",
          border: "1px solid #e2e8f0",
        }}
      >
        <div style={{ flex: 1, marginLeft: "20px" }}>
          <h3 style={{ marginTop: 0, color: "#4f46e5" }}>بيانات العميل:</h3>
          <p style={{ margin: "5px 0" }}>
            <strong>الاسم:</strong> {project.client?.name}
          </p>
          <p style={{ margin: "5px 0" }}>
            <strong>الشركة:</strong> {project.client?.companyName || "-"}
          </p>
          <p style={{ margin: "5px 0" }}>
            <strong>الهاتف:</strong> {project.client?.phone}
          </p>
          <p style={{ margin: "5px 0" }}>
            <strong>العنوان:</strong> {project.projectAddress}
          </p>
        </div>
        <div style={{ flex: 1 }}>
          <h3 style={{ marginTop: 0, color: "#4f46e5" }}>تفاصيل المشروع:</h3>
          <p style={{ margin: "5px 0" }}>
            <strong>اسم المشروع:</strong> {project.title}
          </p>
          <p style={{ margin: "5px 0" }}>
            <strong>عدد الأبواب المبدئي:</strong> {project.initialDoorsCount}
          </p>
          <p style={{ margin: "5px 0" }}>
            <strong>الحالة الحالية:</strong> {project.status}
          </p>
        </div>
      </div>

      {/* --- جدول البنود (Items) --- */}
      <h3 style={{ borderBottom: "2px solid #e2e8f0", paddingBottom: "10px" }}>
        تفاصيل البنود والأعمال:
      </h3>
      <table
        style={{
          width: "100%",
          borderCollapse: "collapse",
          marginBottom: "30px",
          fontSize: "0.9rem",
        }}
      >
        <thead>
          <tr style={{ background: "#4f46e5", color: "white" }}>
            <th style={{ padding: "12px", border: "1px solid #4f46e5" }}>م</th>
            <th style={{ padding: "12px", border: "1px solid #4f46e5" }}>
              النوع
            </th>
            <th
              style={{
                padding: "12px",
                border: "1px solid #4f46e5",
                textAlign: "right",
              }}
            >
              الوصف
            </th>
            <th style={{ padding: "12px", border: "1px solid #4f46e5" }}>
              الكمية
            </th>
          </tr>
        </thead>
        <tbody>
          {project.items?.length > 0 ? (
            project.items.map((item, index) => (
              <tr key={index}>
                <td
                  style={{
                    padding: "10px",
                    border: "1px solid #e2e8f0",
                    textAlign: "center",
                  }}
                >
                  {index + 1}
                </td>
                <td
                  style={{
                    padding: "10px",
                    border: "1px solid #e2e8f0",
                    textAlign: "center",
                  }}
                >
                  {item.itemType === "Door" ? "باب" : "حلق"}
                </td>
                <td style={{ padding: "10px", border: "1px solid #e2e8f0" }}>
                  {item.description}
                </td>
                <td
                  style={{
                    padding: "10px",
                    border: "1px solid #e2e8f0",
                    textAlign: "center",
                  }}
                >
                  1
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="4" style={{ padding: "20px", textAlign: "center" }}>
                لم يتم إضافة بنود تفصيلية بعد.
              </td>
            </tr>
          )}
        </tbody>
      </table>

      {/* --- الملخص المالي --- */}
      <div style={{ display: "flex", justifyContent: "flex-end" }}>
        <div style={{ width: "300px" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <tbody>
              <tr>
                <td
                  style={{
                    padding: "10px",
                    borderBottom: "1px solid #eee",
                    fontWeight: "bold",
                  }}
                >
                  إجمالي التعاقد:
                </td>
                <td
                  style={{
                    padding: "10px",
                    borderBottom: "1px solid #eee",
                    textAlign: "left",
                  }}
                >
                  {project.financials?.totalValue?.toLocaleString()} EGP
                </td>
              </tr>
              <tr>
                <td
                  style={{
                    padding: "10px",
                    borderBottom: "1px solid #eee",
                    fontWeight: "bold",
                    color: "#10b981",
                  }}
                >
                  المدفوع:
                </td>
                <td
                  style={{
                    padding: "10px",
                    borderBottom: "1px solid #eee",
                    textAlign: "left",
                    color: "#10b981",
                  }}
                >
                  {project.financials?.paidAmount?.toLocaleString()} EGP
                </td>
              </tr>
              <tr style={{ background: "#f8fafc" }}>
                <td
                  style={{
                    padding: "15px",
                    fontWeight: "bold",
                    fontSize: "1.2rem",
                    color: "#ef4444",
                  }}
                >
                  المتبقي:
                </td>
                <td
                  style={{
                    padding: "15px",
                    fontWeight: "bold",
                    fontSize: "1.2rem",
                    textAlign: "left",
                    color: "#ef4444",
                  }}
                >
                  {(
                    (project.financials?.totalValue || 0) -
                    (project.financials?.paidAmount || 0)
                  ).toLocaleString()}{" "}
                  EGP
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* --- الفوتر --- */}
      <div
        style={{
          marginTop: "50px",
          borderTop: "1px solid #e2e8f0",
          paddingTop: "20px",
          textAlign: "center",
          fontSize: "0.9rem",
          color: "#64748b",
        }}
      >
        <p>شكراً لثقتكم في سوليد للأبواب المعدنية</p>
        <p>العنوان: القاهرة، مصر | تليفون: 01000000000</p>
      </div>
    </div>
  );
};

export default InvoiceTemplate;
