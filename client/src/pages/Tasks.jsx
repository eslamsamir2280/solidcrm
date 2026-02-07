import { useState, useEffect } from "react";
import axios from "axios";
import { Link } from "react-router-dom";

function Tasks() {
  const [tasks, setTasks] = useState([]);

  // Form State
  const [title, setTitle] = useState("");
  const [desc, setDesc] = useState("");
  const [assignedTo, setAssignedTo] = useState("Sales");
  const [dueDate, setDueDate] = useState(""); // 👈 حالة التاريخ الجديد

  useEffect(() => {
    fetchTasks();
  }, []);

  const fetchTasks = async () => {
    try {
      const res = await axios.get("http://76.13.44.173/api/tasks");
      setTasks(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleAddTask = async (e) => {
    e.preventDefault();
    if (!title) return alert("اكتب عنوان المهمة");
    try {
      await axios.post("http://76.13.44.173/api/tasks", {
        title,
        description: desc,
        assignedTo,
        dueDate, // 👈 إرسال التاريخ
        type: "Manual",
      });
      fetchTasks();
      setTitle("");
      setDesc("");
      setDueDate("");
      alert("✅ تم إسناد المهمة");
    } catch (err) {
      alert("خطأ");
    }
  };

  const toggleTaskStatus = async (task) => {
    const newStatus = task.status === "Pending" ? "Completed" : "Pending";
    await axios.put(`http://76.13.44.173/api/tasks/${task._id}`, {
      status: newStatus,
    });
    fetchTasks();
  };

  const deleteTask = async (id) => {
    if (!window.confirm("حذف المهمة؟")) return;
    await axios.delete(`http://76.13.44.173/api/tasks/${id}`);
    fetchTasks();
  };

  // دالة لحساب هل المهمة متأخرة؟
  const isOverdue = (dateStr) => {
    if (!dateStr) return false;
    return (
      new Date(dateStr) < new Date() &&
      new Date(dateStr).toDateString() !== new Date().toDateString()
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
        <h2>✅ إدارة المهام</h2>
        <span
          style={{
            background: "#e0e7ff",
            color: "#4f46e5",
            padding: "5px 15px",
            borderRadius: "20px",
            fontWeight: "bold",
          }}
        >
          مطلوب تنفيذه: {tasks.filter((t) => t.status === "Pending").length}
        </span>
      </div>

      {/* --- فورم إضافة المهمة --- */}
      <div className="card">
        <h3
          style={{
            marginTop: 0,
            color: "var(--primary)",
            display: "flex",
            alignItems: "center",
            gap: "10px",
          }}
        >
          <span>📌</span> مهمة جديدة
        </h3>
        <form onSubmit={handleAddTask}>
          <div className="grid-3" style={{ marginBottom: "15px" }}>
            <div>
              <label>المسؤول</label>
              <select
                value={assignedTo}
                onChange={(e) => setAssignedTo(e.target.value)}
                className="form-control"
              >
                <option value="Sales">المبيعات</option>
                <option value="Finance">الحسابات</option>
                <option value="Technician">المكتب الفني</option>
                <option value="General">عام</option>
              </select>
            </div>
            <div>
              <label>المطلوب</label>
              <input
                className="form-control"
                placeholder="عنوان المهمة..."
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </div>
            <div>
              <label>تاريخ التنفيذ (Deadline)</label>
              <input
                type="date"
                className="form-control"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
              />
            </div>
          </div>

          <div style={{ display: "flex", gap: "15px" }}>
            <input
              className="form-control"
              placeholder="تفاصيل إضافية (اختياري)..."
              value={desc}
              onChange={(e) => setDesc(e.target.value)}
              style={{ flex: 1 }}
            />
            <button
              type="submit"
              className="btn btn-primary"
              style={{ width: "150px" }}
            >
              + حفظ
            </button>
          </div>
        </form>
      </div>

      {/* --- قائمة المهام --- */}
      <div className="card">
        <h3 style={{ marginBottom: "20px" }}>📋 قائمة العمل</h3>

        {tasks.length > 0 ? (
          <ul style={{ listStyle: "none", padding: 0 }}>
            {tasks.map((task) => {
              const overdue =
                isOverdue(task.dueDate) && task.status === "Pending";

              return (
                <li
                  key={task._id}
                  style={{
                    background:
                      task.status === "Completed" ? "#f8fafc" : "white",
                    border: "1px solid #e2e8f0",
                    borderRadius: "12px",
                    padding: "20px",
                    marginBottom: "15px",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    boxShadow:
                      task.status === "Pending"
                        ? "0 4px 6px rgba(0,0,0,0.05)"
                        : "none",
                    opacity: task.status === "Completed" ? 0.6 : 1,
                    // لو متأخرة نحط خط أحمر، لو سيستم نحط خط أصفر، عادي خط أزرق
                    borderLeft: overdue
                      ? "5px solid #ef4444"
                      : task.type === "System"
                      ? "5px solid #f59e0b"
                      : "5px solid #4f46e5",
                  }}
                >
                  {/* الجزء اليمين: الشيك بوكس والتفاصيل */}
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "20px",
                    }}
                  >
                    <div
                      onClick={() => toggleTaskStatus(task)}
                      style={{
                        width: "28px",
                        height: "28px",
                        borderRadius: "50%",
                        border:
                          task.status === "Completed"
                            ? "none"
                            : "2px solid #cbd5e1",
                        background:
                          task.status === "Completed" ? "#10b981" : "white",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        cursor: "pointer",
                        color: "white",
                        fontSize: "14px",
                      }}
                    >
                      {task.status === "Completed" && "✓"}
                    </div>

                    <div>
                      <h4
                        style={{
                          margin: 0,
                          fontSize: "1.1rem",
                          textDecoration:
                            task.status === "Completed"
                              ? "line-through"
                              : "none",
                          color:
                            task.status === "Completed" ? "#94a3b8" : "#1e293b",
                        }}
                      >
                        {task.title}
                        {task.type === "System" && (
                          <span
                            style={{
                              fontSize: "0.7rem",
                              background: "#fffbeb",
                              color: "#b45309",
                              padding: "2px 8px",
                              borderRadius: "10px",
                              marginRight: "10px",
                              verticalAlign: "middle",
                            }}
                          >
                            🤖 آلي
                          </span>
                        )}
                        {overdue && (
                          <span
                            style={{
                              fontSize: "0.7rem",
                              background: "#fef2f2",
                              color: "#ef4444",
                              padding: "2px 8px",
                              borderRadius: "10px",
                              marginRight: "10px",
                              verticalAlign: "middle",
                            }}
                          >
                            🔥 متأخرة
                          </span>
                        )}
                      </h4>

                      <p
                        style={{
                          margin: "5px 0 0 0",
                          fontSize: "0.9rem",
                          color: "#64748b",
                        }}
                      >
                        👤{" "}
                        <strong>
                          {task.assignedTo === "Technician"
                            ? "الفني"
                            : task.assignedTo === "Finance"
                            ? "المالية"
                            : task.assignedTo === "Sales"
                            ? "المبيعات"
                            : "عام"}
                        </strong>
                        {task.description && ` | ${task.description}`}
                      </p>

                      {task.relatedProject && (
                        <Link
                          to={`/projects/${task.relatedProject._id}`}
                          style={{
                            fontSize: "0.85rem",
                            color: "var(--primary)",
                            marginTop: "8px",
                            display: "inline-block",
                            fontWeight: "bold",
                            textDecoration: "none",
                          }}
                        >
                          🔗 الذهاب للمشروع
                        </Link>
                      )}
                    </div>
                  </div>

                  {/* الجزء اليسار: التاريخ والزر */}
                  <div style={{ textAlign: "left" }}>
                    {task.dueDate && (
                      <div
                        style={{
                          fontSize: "0.85rem",
                          fontWeight: "bold",
                          marginBottom: "10px",
                          color: overdue ? "#ef4444" : "#64748b",
                          display: "flex",
                          alignItems: "center",
                          gap: "5px",
                        }}
                      >
                        📅 {new Date(task.dueDate).toLocaleDateString("ar-EG")}
                        {overdue && <span>⚠️</span>}
                      </div>
                    )}

                    <button
                      onClick={() => deleteTask(task._id)}
                      style={{
                        background: "#fee2e2",
                        color: "#ef4444",
                        border: "none",
                        borderRadius: "8px",
                        padding: "5px 10px",
                        cursor: "pointer",
                      }}
                    >
                      حذف
                    </button>
                  </div>
                </li>
              );
            })}
          </ul>
        ) : (
          <div
            style={{ textAlign: "center", padding: "40px", color: "#94a3b8" }}
          >
            ✨ لا توجد مهام.. القهوة جاهزة؟ ☕
          </div>
        )}
      </div>
    </div>
  );
}

export default Tasks;

