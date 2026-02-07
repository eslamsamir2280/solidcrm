import React, { useContext } from "react";
import { Link, useLocation } from "react-router-dom";
import { AuthContext } from "../context/AuthContext"; // ✅ استدعاء الكونتكست
import "./Sidebar.css";

const Sidebar = () => {
  const location = useLocation();

  // ✅ 1. جلب بيانات المستخدم ودالة الخروج من الكونتكست
  const { user, logout } = useContext(AuthContext);

  // التأكد من وجود دور للمستخدم (تجنب الأخطاء لو مفيش مستخدم)
  const userRole = user?.role || "Technician";

  // ✅ 2. تعريف الروابط (نفس القائمة بتاعتك)
  const allLinks = [
    {
      path: "/",
      label: "لوحة القيادة",
      icon: "📊",
      roles: ["Admin", "Sales", "Finance"],
    },
    {
      path: "/clients",
      label: "العملاء",
      icon: "👥",
      roles: ["Admin", "Sales"],
    },
    {
      path: "/projects",
      label: "المشاريع",
      icon: "🏗️",
      roles: ["Admin", "Sales", "Finance"],
    },
    {
      path: "/tasks",
      label: "المهام",
      icon: "✅",
      roles: ["Admin", "Sales"],
    },
    {
      path: "/finance",
      label: "المالية",
      icon: "💰",
      roles: ["Admin", "Finance"],
    },
    {
      path: "/employees",
      label: "الموظفين",
      icon: "👔",
      roles: ["Admin", "Finance"],
    },
    {
      path: "/attendance",
      label: "الحضور",
      icon: "🕒",
      roles: ["Admin", "Finance"],
    },
    {
      path: "/reports",
      label: "التقارير",
      icon: "📑",
      roles: ["Admin", "Finance"],
    },
  ];

  // ✅ 3. فلترة الروابط بناءً على الدور
  const links = allLinks.filter((link) => link.roles.includes(userRole));

  return (
    <aside className="sidebar">
      {/* الهيدر */}
      <div className="sidebar-header">
        <h1 className="brand-name"> سوليد للأبواب المعدنية</h1>
      </div>

      {/* القائمة */}
      <ul className="sidebar-menu">
        {links.map((link) => {
          const isActive =
            location.pathname === link.path ||
            (link.path !== "/" && location.pathname.startsWith(link.path));

          return (
            <li key={link.path} className="menu-item">
              <Link
                to={link.path}
                className={`menu-link ${isActive ? "active" : ""}`}
              >
                <span className="menu-icon">{link.icon}</span>
                <span>{link.label}</span>
              </Link>
            </li>
          );
        })}
      </ul>

      {/* الفوتر وزرار الخروج */}
      <div className="sidebar-footer">
        <button
          className="logout-btn"
          onClick={logout} // ✅ تفعيل دالة الخروج الحقيقية
        >
          <span>🚪</span> تسجيل خروج
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
