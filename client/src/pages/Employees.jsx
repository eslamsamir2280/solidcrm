import { useState, useEffect } from "react";
import axios from "axios";

function Employees() {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);

  // فورم إضافة موظف
  const [showAddForm, setShowAddForm] = useState(false);
  const [newEmp, setNewEmp] = useState({
    name: "",
    role: "Worker",
    basicSalary: "",
    phone: "",
  });

  useEffect(() => {
    fetchEmployees();
  }, []);

  const fetchEmployees = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/employees");
      setEmployees(res.data);
      setLoading(false);
    } catch (err) {
      console.error(err);
      setLoading(false);
    }
  };

  // --- إضافة موظف جديد ---
  const handleAddEmployee = async () => {
    if (!newEmp.name || !newEmp.basicSalary)
      return alert("أكمل البيانات المطلوبة");
    try {
      await axios.post("http://localhost:5000/api/employees", newEmp);
      alert("✅ تم تعيين الموظف بنجاح");
      setShowAddForm(false);
      setNewEmp({ name: "", role: "Worker", basicSalary: "", phone: "" });
      fetchEmployees();
    } catch (err) {
      alert("خطأ في الإضافة");
    }
  };

  // --- صرف راتب ---
  const handlePaySalary = async (id, name, basicSalary) => {
    const amount = prompt(
      `صرف راتب للموظف: ${name}\nالراتب الأساسي: ${basicSalary}\n\nأدخل المبلغ المراد صرفه (بعد الخصومات/الإضافات):`,
      basicSalary
    );
    if (!amount) return;

    try {
      await axios.post(`http://localhost:5000/api/employees/${id}/pay-salary`, {
        amount: Number(amount),
      });
      alert("💰 تم صرف الراتب وتسجيله في المصروفات");
    } catch (err) {
      alert("خطأ");
    }
  };

  // --- إعطاء سلفة ---
  const handleGiveLoan = async (id, name) => {
    const amount = prompt(`إعطاء سلفة للموظف: ${name}\nأدخل قيمة السلفة:`);
    if (!amount) return;

    try {
      await axios.post(`http://localhost:5000/api/employees/${id}/advance`, {
        amount: Number(amount),
      });
      alert("⚠️ تم تسجيل السلفة وخصمها من الخزنة");
      fetchEmployees(); // تحديث عشان الرصيد يظهر
    } catch (err) {
      alert("خطأ");
    }
  };

  // --- سداد سلفة ---
  const handleRepayLoan = async (id, name, currentLoan) => {
    if (currentLoan <= 0) return alert("الموظف ليس عليه سلف!");

    const amount = prompt(
      `سداد سلفة للموظف: ${name}\nالقيمة المستحقة: ${currentLoan}\n\nأدخل المبلغ المسدد:`
    );
    if (!amount) return;

    // سؤال هل الدفع كاش ولا خصم من الراتب؟
    // هنا للتبسيط هنعتبره خصم ورقي (تقليل المديونية فقط)،
    // لو عاوز تدخله الخزنة كإيراد ممكن تعمل Checkbox

    try {
      await axios.post(`http://localhost:5000/api/employees/${id}/repay-loan`, {
        amount: Number(amount),
        isCash: false,
      });
      alert("✅ تم خصم المبلغ من مديونية الموظف");
      fetchEmployees();
    } catch (err) {
      alert("خطأ");
    }
  };

  // ألوان الأدوار
  const getRoleBadge = (role) => {
    const roles = {
      Manager: { bg: "#fee2e2", col: "#991b1b", label: "مدير" },
      Sales: { bg: "#fef3c7", col: "#92400e", label: "مبيعات" },
      Technician: { bg: "#e0e7ff", col: "#3730a3", label: "فني" },
      Accountant: { bg: "#dcfce7", col: "#166534", label: "محاسب" },
      Worker: { bg: "#f3f4f6", col: "#374151", label: "عامل" },
    };
    const s = roles[role] || roles.Worker;
    return (
      <span
        style={{
          background: s.bg,
          color: s.col,
          padding: "4px 12px",
          borderRadius: "20px",
          fontSize: "0.8rem",
          fontWeight: "bold",
        }}
      >
        {s.label}
      </span>
    );
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
        <div>
          <h2 style={{ margin: 0 }}>👥 إدارة الموظفين</h2>
          <p style={{ color: "#64748b", margin: 0 }}>الرواتب، السلف، والحضور</p>
        </div>
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="btn btn-primary"
          style={{ height: "40px" }}
        >
          {showAddForm ? "إلغاء" : "+ موظف جديد"}
        </button>
      </div>

      {/* فورم الإضافة */}
      {showAddForm && (
        <div
          className="card"
          style={{
            background: "#f8fafc",
            marginBottom: "30px",
            border: "2px dashed #cbd5e1",
          }}
        >
          <h3 style={{ marginTop: 0 }}>بيانات الموظف الجديد</h3>
          <div style={{ display: "flex", gap: "15px", alignItems: "end" }}>
            <div style={{ flex: 2 }}>
              <label>الاسم</label>
              <input
                className="form-control"
                value={newEmp.name}
                onChange={(e) => setNewEmp({ ...newEmp, name: e.target.value })}
              />
            </div>
            <div style={{ flex: 1 }}>
              <label>الوظيفة</label>
              <select
                className="form-control"
                value={newEmp.role}
                onChange={(e) => setNewEmp({ ...newEmp, role: e.target.value })}
              >
                <option value="Worker">عامل</option>
                <option value="Technician">فني تركيب</option>
                <option value="Sales">مبيعات</option>
                <option value="Manager">مدير</option>
                <option value="Accountant">محاسب</option>
              </select>
            </div>
            <div style={{ flex: 1 }}>
              <label>الراتب الأساسي</label>
              <input
                type="number"
                className="form-control"
                value={newEmp.basicSalary}
                onChange={(e) =>
                  setNewEmp({ ...newEmp, basicSalary: e.target.value })
                }
              />
            </div>
            <div style={{ flex: 1 }}>
              <label>تليفون</label>
              <input
                className="form-control"
                value={newEmp.phone}
                onChange={(e) =>
                  setNewEmp({ ...newEmp, phone: e.target.value })
                }
              />
            </div>
            <button
              onClick={handleAddEmployee}
              className="btn"
              style={{ background: "#0f172a", color: "white" }}
            >
              حفظ
            </button>
          </div>
        </div>
      )}

      {loading ? (
        <div style={{ textAlign: "center" }}>جاري التحميل...</div>
      ) : (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
            gap: "20px",
          }}
        >
          {employees.map((emp) => (
            <div
              key={emp._id}
              className="card"
              style={{
                position: "relative",
                borderTop: `4px solid ${
                  emp.loanBalance > 0 ? "#ef4444" : "#10b981"
                }`,
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "start",
                  marginBottom: "15px",
                }}
              >
                <div>
                  <h3 style={{ margin: "0 0 5px 0" }}>{emp.name}</h3>
                  <div style={{ fontSize: "0.9rem", color: "#64748b" }}>
                    📞 {emp.phone || "لا يوجد"}
                  </div>
                </div>
                {getRoleBadge(emp.role)}
              </div>

              <div
                style={{
                  background: "#f1f5f9",
                  padding: "15px",
                  borderRadius: "10px",
                  display: "flex",
                  justifyContent: "space-between",
                  marginBottom: "20px",
                }}
              >
                <div style={{ textAlign: "center" }}>
                  <div style={{ fontSize: "0.8rem", color: "#64748b" }}>
                    الراتب
                  </div>
                  <div style={{ fontWeight: "bold" }}>
                    {emp.basicSalary.toLocaleString()}
                  </div>
                </div>
                <div style={{ width: "1px", background: "#cbd5e1" }}></div>
                <div style={{ textAlign: "center" }}>
                  <div style={{ fontSize: "0.8rem", color: "#64748b" }}>
                    عليه سلف
                  </div>
                  <div
                    style={{
                      fontWeight: "bold",
                      color: emp.loanBalance > 0 ? "#ef4444" : "#10b981",
                    }}
                  >
                    {emp.loanBalance.toLocaleString()}
                  </div>
                </div>
              </div>

              <div style={{ display: "flex", gap: "10px" }}>
                <button
                  onClick={() =>
                    handlePaySalary(emp._id, emp.name, emp.basicSalary)
                  }
                  className="btn"
                  style={{
                    flex: 1,
                    background: "#dcfce7",
                    color: "#166534",
                    fontSize: "0.9rem",
                  }}
                >
                  💵 صرف راتب
                </button>
                <button
                  onClick={() => handleGiveLoan(emp._id, emp.name)}
                  className="btn"
                  style={{
                    flex: 1,
                    background: "#fee2e2",
                    color: "#991b1b",
                    fontSize: "0.9rem",
                  }}
                >
                  📉 سلفة
                </button>
                {emp.loanBalance > 0 && (
                  <button
                    onClick={() =>
                      handleRepayLoan(emp._id, emp.name, emp.loanBalance)
                    }
                    className="btn"
                    style={{
                      flex: 1,
                      background: "#e0e7ff",
                      color: "#3730a3",
                      fontSize: "0.9rem",
                    }}
                  >
                    تسديد
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default Employees;
