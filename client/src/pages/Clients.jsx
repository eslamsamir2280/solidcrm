import { useState, useEffect } from "react";
import axios from "axios";

function Clients() {
  const [clients, setClients] = useState([]);

  // تحديث: ضفت كل الحقول في الـ State عشان ميعملش مشاكل
  const [form, setForm] = useState({
    name: "",
    phone: "",
    companyName: "",
    email: "",
    address: "",
  });

  useEffect(() => {
    fetchClients();
  }, []);

  const fetchClients = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/clients");
      setClients(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post("http://localhost:5000/api/clients", form);
      fetchClients();
      // تفريغ الفورم بالكامل
      setForm({ name: "", phone: "", companyName: "", email: "", address: "" });
      alert("✅ تم إضافة العميل بنجاح");
    } catch (err) {
      alert("❌ حدث خطأ أثناء الإضافة");
    }
  };

  return (
    <div className="container">
      {/* --- الهيدر --- */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "30px",
        }}
      >
        <h2 style={{ margin: 0 }}>👥 إدارة العملاء</h2>
        <div
          style={{
            background: "white",
            padding: "8px 20px",
            borderRadius: "12px",
            boxShadow: "0 2px 5px rgba(0,0,0,0.05)",
            fontWeight: "bold",
            color: "#64748b",
          }}
        >
          عدد العملاء:{" "}
          <span style={{ color: "var(--primary)" }}>{clients.length}</span>
        </div>
      </div>

      {/* --- فورم الإضافة (Card Modern) --- */}
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
          <span>➕</span> تسجيل عميل جديد
        </h3>

        <form onSubmit={handleSubmit}>
          {/* الصف الأول: الاسم - التليفون - الايميل */}
          <div className="grid-3" style={{ marginBottom: "20px" }}>
            <div>
              <label>
                اسم العميل <span style={{ color: "red" }}>*</span>
              </label>
              <input
                className="form-control"
                placeholder="الاسم الثلاثي"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                required
              />
            </div>
            <div>
              <label>
                رقم التليفون <span style={{ color: "red" }}>*</span>
              </label>
              <input
                className="form-control"
                placeholder="01xxxxxxxxx"
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                required
              />
            </div>
            <div>
              <label>البريد الإلكتروني</label>
              <input
                type="email"
                className="form-control"
                placeholder="example@mail.com"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
              />
            </div>
          </div>

          {/* الصف الثاني: الشركة - العنوان - الزرار */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 2fr 1fr",
              gap: "20px",
              alignItems: "end",
            }}
          >
            <div>
              <label>اسم الشركة</label>
              <input
                className="form-control"
                placeholder="اختياري"
                value={form.companyName}
                onChange={(e) =>
                  setForm({ ...form, companyName: e.target.value })
                }
              />
            </div>
            <div>
              <label>العنوان</label>
              <input
                className="form-control"
                placeholder="المدينة - المنطقة - الشارع"
                value={form.address}
                onChange={(e) => setForm({ ...form, address: e.target.value })}
              />
            </div>
            <button
              type="submit"
              className="btn btn-primary"
              style={{ width: "100%" }}
            >
              حفظ البيانات
            </button>
          </div>
        </form>
      </div>

      {/* --- جدول العملاء --- */}
      <div style={{ overflowX: "auto" }}>
        <table>
          <thead>
            <tr>
              <th>اسم العميل</th>
              <th>التليفون</th>
              <th>الشركة</th>
              <th>العنوان</th>
              <th>البريد الإلكتروني</th>
            </tr>
          </thead>
          <tbody>
            {clients.length > 0 ? (
              clients.map((client) => (
                <tr key={client._id}>
                  <td style={{ fontWeight: "bold", color: "var(--text-main)" }}>
                    {client.name}
                  </td>
                  <td style={{ color: "var(--primary)", fontWeight: "bold" }}>
                    {client.phone}
                  </td>
                  <td>
                    {client.companyName || (
                      <span style={{ color: "#ccc" }}>-</span>
                    )}
                  </td>
                  <td style={{ fontSize: "0.9rem" }}>
                    {client.address || <span style={{ color: "#ccc" }}>-</span>}
                  </td>
                  <td style={{ fontSize: "0.9rem", color: "#64748b" }}>
                    {client.email || <span style={{ color: "#ccc" }}>-</span>}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan="5"
                  style={{
                    textAlign: "center",
                    padding: "40px",
                    color: "#94a3b8",
                  }}
                >
                  📭 لا يوجد عملاء مسجلين حتى الآن
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default Clients;
