import React from "react";
import "./ProjectTracker.css";

const ProjectTracker = ({ status, dates }) => {
  const steps = [
    { key: "PendingPricing", label: "طلب جديد", icon: "📝" },
    { key: "ClientReview", label: "مراجعة العميل", icon: "⚖️" },
    { key: "Manufacturing", label: "التصنيع", icon: "🏭" },
    { key: "ReadyForInstallation", label: "جاهز للتركيب", icon: "📦" },
    { key: "Installation", label: "جاري التركيب", icon: "🔧" },
    { key: "Completed", label: "تم التسليم", icon: "🎓" },
  ];

  const getCurrentStepIndex = () => {
    const index = steps.findIndex((s) => s.key === status);
    return index === -1 ? 0 : index;
  };

  const currentIndex = getCurrentStepIndex();

  return (
    <div className="tracker-container card">
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "10px",
          marginBottom: "40px",
        }}
      >
        <h3 style={{ margin: 0, color: "var(--primary)" }}>
          📍 تتبع مسار المشروع
        </h3>
        {/* لو لسه مخلصش نكتب يتم التحديث، لو خلص نكتب مبروك */}
        <span style={{ fontSize: "0.8rem", color: "#94a3b8" }}>
          {status === "Completed" ? "(المشروع مغلق)" : "(يتم التحديث تلقائياً)"}
        </span>
      </div>

      <div className="tracker-wrapper">
        {steps.map((step, index) => {
          let stepClass = "step";
          if (index < currentIndex) stepClass += " completed";
          if (index === currentIndex) stepClass += " active";

          return (
            <div key={step.key} className={stepClass}>
              <div className="step-circle">
                {index < currentIndex ? "✔" : step.icon}
              </div>

              <div className="step-content">
                <span className="step-label">{step.label}</span>

                {/* تاريخ التركيب */}
                {step.key === "ReadyForInstallation" &&
                  dates?.installDate &&
                  index <= currentIndex && (
                    <span className="step-date">
                      📅{" "}
                      {new Date(dates.installDate).toLocaleDateString("ar-EG")}
                    </span>
                  )}

                {/* --- التعديل هنا --- */}
                {/* لو دي المرحلة الحالية */}
                {index === currentIndex && (
                  <span
                    className="step-date"
                    style={{
                      // لو "تم التسليم" يبقى خلفية خضراء، غير كده زرقاء
                      background:
                        step.key === "Completed" ? "#dcfce7" : "#e0e7ff",
                      color: step.key === "Completed" ? "#166534" : "#4338ca",
                    }}
                  >
                    {step.key === "Completed"
                      ? "تم بنجاح 🎉"
                      : "جاري التنفيذ..."}
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ProjectTracker;
