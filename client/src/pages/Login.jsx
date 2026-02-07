import { useState, useContext } from "react";
import axios from "axios";
import { AuthContext } from "../context/AuthContext";
import { toast } from "react-toastify";

function Login() {
  const { login } = useContext(AuthContext);

  // هل نحن في وضع الدخول أم التسجيل؟
  const [isRegister, setIsRegister] = useState(false);

  // البيانات
  const [formData, setFormData] = useState({
    username: "",
    password: "",
    name: "",
    role: "Technician", // القيمة الافتراضية عند التسجيل
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // 1. تسجيل الدخول
  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post("http://76.13.44.173/api/auth/login", {
        username: formData.username,
        password: formData.password,
      });

      toast.success(`مرحباً بك يا ${res.data.user.name} 👋`);
      login(res.data.user, res.data.token);
    } catch (err) {
      toast.error(err.response?.data?.message || "خطأ في بيانات الدخول");
    }
  };

  // 2. إنشاء حساب جديد (لإعداد الموظفين)
  const handleRegister = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.username || !formData.password)
      return toast.warning("أكمل البيانات");

    try {
      await axios.post("http://76.13.44.173/api/auth/register", formData);
      toast.success("تم إنشاء الحساب بنجاح! يمكنك الدخول الآن ✅");
      setIsRegister(false); // ارجع لصفحة الدخول
    } catch (err) {
      toast.error("حدث خطأ، ربما اسم المستخدم مكرر");
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        {/* اللوجو والعنوان */}
        <div style={{ textAlign: "center", marginBottom: "30px" }}>
          <div style={styles.logoCircle}>🏗️</div>
          <h2 style={{ margin: "15px 0 5px", color: "#0f172a" }}>
            {isRegister ? "إنشاء مستخدم جديد" : "مؤسسة أبو خليل"}
          </h2>
          <p style={{ color: "#64748b", margin: 0 }}>
            {isRegister ? "إضافة موظف للنظام" : "نظام إدارة المقاولات المتكامل"}
          </p>
        </div>

        {/* الفورم */}
        <form onSubmit={isRegister ? handleRegister : handleLogin}>
          {/* حقل الاسم (يظهر فقط عند التسجيل) */}
          {isRegister && (
            <div style={styles.inputGroup}>
              <label style={styles.label}>الاسم بالكامل</label>
              <input
                name="name"
                style={styles.input}
                placeholder="مثال: أحمد محمد"
                value={formData.name}
                onChange={handleChange}
              />
            </div>
          )}

          <div style={styles.inputGroup}>
            <label style={styles.label}>اسم المستخدم</label>
            <input
              name="username"
              style={styles.input}
              placeholder="Username"
              value={formData.username}
              onChange={handleChange}
            />
          </div>

          <div style={styles.inputGroup}>
            <label style={styles.label}>كلمة المرور</label>
            <input
              type="password"
              name="password"
              style={styles.input}
              placeholder="•••••••"
              value={formData.password}
              onChange={handleChange}
            />
          </div>

          {/* اختيار الوظيفة (يظهر فقط عند التسجيل) */}
          {isRegister && (
            <div style={styles.inputGroup}>
              <label style={styles.label}>الصلاحية / الوظيفة</label>
              <select
                name="role"
                style={styles.input}
                value={formData.role}
                onChange={handleChange}
              >
                <option value="Technician">فني (Technician)</option>
                <option value="Sales">مبيعات (Sales)</option>
                <option value="Finance">مدير مالي (Finance)</option>
                <option value="Admin">مدير عام (Admin)</option>
              </select>
            </div>
          )}

          <button type="submit" style={styles.button}>
            {isRegister ? "حفظ المستخدم" : "تسجيل الدخول"}
          </button>
        </form>

        {/* التبديل بين الدخول والتسجيل */}
        <div
          style={{ marginTop: "20px", textAlign: "center", fontSize: "0.9rem" }}
        >
          <span style={{ color: "#64748b", marginLeft: "5px" }}>
            {isRegister ? "لديك حساب بالفعل؟" : "إعداد النظام لأول مرة؟"}
          </span>
          <span
            onClick={() => setIsRegister(!isRegister)}
            style={{
              color: "#4f46e5",
              fontWeight: "bold",
              cursor: "pointer",
              textDecoration: "underline",
            }}
          >
            {isRegister ? "تسجيل الدخول" : "إنشاء حساب جديد"}
          </span>
        </div>
      </div>

      <div style={{ marginTop: "20px", color: "#94a3b8", fontSize: "0.8rem" }}>
        &copy; 2025 Abu Khalil ERP System
      </div>
    </div>
  );
}

// تنسيقات CSS داخلية (ممكن تنقلها لملف CSS منفصل لو حابب)
const styles = {
  container: {
    minHeight: "100vh",
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
    background: "#f1f5f9",
    fontFamily: "Cairo, sans-serif",
  },
  card: {
    background: "white",
    padding: "40px",
    borderRadius: "16px",
    boxShadow: "0 10px 25px rgba(0,0,0,0.05)",
    width: "100%",
    maxWidth: "400px",
  },
  logoCircle: {
    width: "60px",
    height: "60px",
    background: "#e0e7ff",
    borderRadius: "50%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "2rem",
    margin: "0 auto 15px",
  },
  inputGroup: {
    marginBottom: "20px",
  },
  label: {
    display: "block",
    marginBottom: "8px",
    color: "#334155",
    fontWeight: "600",
    fontSize: "0.9rem",
  },
  input: {
    width: "100%",
    padding: "12px",
    borderRadius: "8px",
    border: "1px solid #cbd5e1",
    fontSize: "1rem",
    outline: "none",
    transition: "border-color 0.2s",
    background: "#f8fafc",
  },
  button: {
    width: "100%",
    padding: "14px",
    background: "#0f172a",
    color: "white",
    border: "none",
    borderRadius: "8px",
    fontSize: "1rem",
    fontWeight: "bold",
    cursor: "pointer",
    marginTop: "10px",
  },
};

export default Login;

