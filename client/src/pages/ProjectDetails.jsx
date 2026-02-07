import { useState, useEffect, useRef, useContext } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import { useReactToPrint } from "react-to-print";
import InvoiceTemplate from "../components/InvoiceTemplate";
import ProjectTracker from "../components/ProjectTracker";
import { AuthContext } from "../context/AuthContext";

function ProjectDetails() {
  const { id } = useParams();
  const { user } = useContext(AuthContext);

  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);

  // States
  const [price, setPrice] = useState("");
  const [quoteFile, setQuoteFile] = useState(null);
  const [installmentTitle, setInstallmentTitle] = useState("");
  const [installmentAmount, setInstallmentAmount] = useState("");
  const [installmentDate, setInstallmentDate] = useState("");
  const [itemName, setItemName] = useState("");
  const [itemType, setItemType] = useState("Door");
  const [certTitle, setCertTitle] = useState("");
  const [certFile, setCertFile] = useState(null);
  const [installDateInput, setInstallDateInput] = useState("");

  const componentRef = useRef(null);
  const handlePrint = useReactToPrint({
    contentRef: componentRef,
    documentTitle: `Invoice-${id}`,
  });

  // 🔥 تعريف الصلاحيات
  const isAdmin = user?.role === "Admin";
  const isFinance = user?.role === "Finance";
  const isSales = user?.role === "Sales";

  // من له حق التعامل المالي؟ (أدمن أو مالية)
  const canManageFinance = isAdmin || isFinance;

  // من له حق التعامل الفني؟ (أدمن أو سيلز - المالية لأ)
  const canManageTechnical = isAdmin || isSales;

  useEffect(() => {
    fetchProjectDetails();
  }, []);

  const fetchProjectDetails = async () => {
    try {
      const res = await axios.get(`http://76.13.44.173/api/projects/${id}`);
      setProject(res.data);
      if (res.data.financials?.totalValue)
        setPrice(res.data.financials.totalValue);
      setLoading(false);
    } catch (err) {
      console.error(err);
      setLoading(false);
    }
  };

  // --- Handlers (نفس الدوال السابقة) ---
  const handleSetPrice = async () => {
    /* ... كود التسعير ... */
    if (!price) return alert("أدخل السعر");
    const formData = new FormData();
    formData.append("price", price);
    formData.append("status", "ClientReview");
    if (quoteFile) formData.append("quotationFile", quoteFile);
    try {
      await axios.put(`http://76.13.44.173/api/projects/${id}`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      alert("✅ تم");
      fetchProjectDetails();
    } catch (err) {
      alert("❌ خطأ");
    }
  };

  const handleAddInstallment = async () => {
    /* ... كود الدفعات ... */
    if (!installmentTitle || !installmentAmount || !installmentDate)
      return alert("أكمل البيانات");
    const newInstallments = [
      ...(project.financials?.installments || []),
      {
        title: installmentTitle,
        amount: Number(installmentAmount),
        dueDate: installmentDate,
        status: "Pending",
      },
    ];
    try {
      await axios.put(`http://76.13.44.173/api/projects/${id}`, {
        financials: { ...project.financials, installments: newInstallments },
        status:
          project.status === "ClientReview" ? "Manufacturing" : project.status,
      });
      alert("✅ تمت الجدولة");
      setInstallmentTitle("");
      setInstallmentAmount("");
      fetchProjectDetails();
    } catch (err) {
      alert("❌ خطأ");
    }
  };

  const handleMarkAsPaid = async (instId, amount) => {
    /* ... كود التحصيل ... */
    if (!window.confirm("تأكيد استلام المبلغ؟")) return;
    const updatedInst = project.financials.installments.map((i) =>
      i._id === instId ? { ...i, status: "Paid", paidAt: new Date() } : i
    );
    const newPaid = (project.financials.paidAmount || 0) + Number(amount);
    try {
      await axios.put(`http://76.13.44.173/api/projects/${id}`, {
        financials: {
          ...project.financials,
          installments: updatedInst,
          paidAmount: newPaid,
        },
      });
      fetchProjectDetails();
    } catch (err) {
      alert("❌ خطأ");
    }
  };

  const handleAddItem = async () => {
    if (!itemName) return;
    const newItems = [
      ...(project.items || []),
      {
        description: itemName,
        itemType: itemType,
        isInstalled: false,
        serialNumber: "",
      },
    ];
    try {
      await axios.put(`http://76.13.44.173/api/projects/${id}`, {
        items: newItems,
      });
      alert("✅ تم");
      setItemName("");
      fetchProjectDetails();
    } catch (err) {
      alert("خطأ");
    }
  };
  const handleScheduleInstallation = async () => {
    if (!installDateInput) return;
    try {
      await axios.put(`http://76.13.44.173/api/projects/${id}`, {
        status: "ReadyForInstallation",
        installationDate: installDateInput,
      });
      alert("✅ تم");
      fetchProjectDetails();
    } catch (err) {
      alert("خطأ");
    }
  };
  const handleUploadCert = async () => {
    if (!certFile) return;
    const formData = new FormData();
    formData.append("title", certTitle || "مستند");
    formData.append("certFile", certFile);
    try {
      await axios.post(
        `http://76.13.44.173/api/projects/${id}/certificates`,
        formData
      );
      alert("✅ تم");
      fetchProjectDetails();
    } catch (e) {
      alert("خطأ");
    }
  };
  const handleCompleteProject = async () => {
    if (!window.confirm("إنهاء؟")) return;
    try {
      await axios.put(`http://76.13.44.173/api/projects/${id}`, {
        status: "Completed",
      });
      fetchProjectDetails();
    } catch (e) {}
  };

  const getStatusBadge = (status) => {
    const styles = {
      PendingPricing: { bg: "#f3f4f6", c: "#374151", l: "انتظار التسعير" },
      ClientReview: { bg: "#fef3c7", c: "#92400e", l: "مراجعة مالية" },
      Manufacturing: { bg: "#dbeafe", c: "#1e40af", l: "جاري التصنيع" },
      ReadyForInstallation: { bg: "#dcfce7", c: "#166534", l: "جاهز للتركيب" },
      Installation: { bg: "#f3e8ff", c: "#6b21a8", l: "جاري التركيب" },
      Completed: { bg: "#dcfce7", c: "#166534", l: "مكتمل ✅" },
    };
    const s = styles[status] || styles.PendingPricing;
    return (
      <span
        style={{
          background: s.bg,
          color: s.c,
          padding: "8px 20px",
          borderRadius: "30px",
          fontWeight: "bold",
          fontSize: "0.9rem",
        }}
      >
        {s.l}
      </span>
    );
  };

  return (
    <div className="container">
      <div style={{ position: "absolute", top: "-9999px" }}>
        <div ref={componentRef}>
          {project && <InvoiceTemplate project={project} />}
        </div>
      </div>

      {loading || !project ? (
        <div>Loading...</div>
      ) : (
        <>
          {/* Header */}
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: "30px",
            }}
          >
            <div>
              <h2 style={{ margin: 0 }}>{project.title}</h2>
              <p style={{ margin: 0, color: "#64748b" }}>
                📍 {project.projectAddress}
              </p>
            </div>
            <div>
              {getStatusBadge(project.status)}{" "}
              <button
                onClick={handlePrint}
                className="btn"
                style={{
                  background: "#4f46e5",
                  color: "white",
                  marginRight: "10px",
                  marginLeft: "10px",
                }}
              >
                🖨️ الفاتورة
              </button>
            </div>
          </div>

          <ProjectTracker
            status={project.status}
            dates={{ installDate: project.installationDate }}
          />

          {/* Client Info */}
          <div
            className="card"
            style={{ marginTop: "30px", borderTop: "4px solid var(--primary)" }}
          >
            <h3>📄 البيانات الأساسية</h3>
            <div className="grid-2">
              <div>
                <label>العميل</label>
                <div>{project.client?.name}</div>
              </div>
              <div>
                <label>التليفون</label>
                <div>{project.client?.phone}</div>
              </div>
              <div>
                <label>المقايسة</label>
                {project.muqaysaFile ? (
                  <a
                    href={`http://localhost:5000/${project.muqaysaFile}`}
                    target="_blank"
                    rel="noreferrer"
                  >
                    تحميل
                  </a>
                ) : (
                  "لا يوجد"
                )}
              </div>
            </div>
          </div>

          {/* 🟢 المرحلة 1: التسعير (مخفي عن المالية) */}
          {project.status === "PendingPricing" && !isFinance && (
            <div
              className="card"
              style={{ background: "#fffbeb", borderColor: "#fcd34d" }}
            >
              <h3 style={{ color: "#b45309" }}>⚠️ مطلوب تسعير المشروع</h3>
              <div style={{ display: "flex", gap: "15px", alignItems: "end" }}>
                <div style={{ flex: 1 }}>
                  <label>قيمة التعاقد</label>
                  <input
                    type="number"
                    className="form-control"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                  />
                </div>
                <div style={{ flex: 1 }}>
                  <label>ملف العرض</label>
                  <input
                    type="file"
                    className="form-control"
                    onChange={(e) => setQuoteFile(e.target.files[0])}
                  />
                </div>
                <button
                  onClick={handleSetPrice}
                  className="btn"
                  style={{ background: "#d97706", color: "white" }}
                >
                  اعتماد السعر
                </button>
              </div>
            </div>
          )}

          {project.status !== "PendingPricing" && (
            <>
              {/* 🟢 المرحلة 2: الإدارة المالية (تحكم كامل للمدير المالي) */}
              <div className="card">
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    borderBottom: "1px solid #eee",
                    paddingBottom: "15px",
                    marginBottom: "20px",
                  }}
                >
                  <h3 style={{ margin: 0, color: "#1e293b" }}>
                    💰 الإدارة المالية
                  </h3>
                  <div
                    style={{
                      fontSize: "1.1rem",
                      background: "#f8fafc",
                      padding: "10px 20px",
                      borderRadius: "10px",
                    }}
                  >
                    <span style={{ color: "#1e293b", fontWeight: "bold" }}>
                      الإجمالي:{" "}
                      {project.financials?.totalValue?.toLocaleString()}
                    </span>
                    <span style={{ margin: "0 10px" }}>|</span>
                    <span style={{ color: "#10b981", fontWeight: "bold" }}>
                      المدفوع:{" "}
                      {project.financials?.paidAmount?.toLocaleString()}
                    </span>
                  </div>
                </div>

                {/* فورم الإضافة: يظهر فقط لمن له صلاحية مالية */}
                {canManageFinance ? (
                  <div
                    style={{
                      display: "flex",
                      gap: "15px",
                      marginBottom: "25px",
                      alignItems: "end",
                      background: "#eff6ff",
                      padding: "15px",
                      borderRadius: "8px",
                    }}
                  >
                    <div style={{ flex: 3 }}>
                      <label>عنوان الدفعة</label>
                      <input
                        className="form-control"
                        value={installmentTitle}
                        onChange={(e) => setInstallmentTitle(e.target.value)}
                      />
                    </div>
                    <div style={{ flex: 1 }}>
                      <label>المبلغ</label>
                      <input
                        type="number"
                        className="form-control"
                        value={installmentAmount}
                        onChange={(e) => setInstallmentAmount(e.target.value)}
                      />
                    </div>
                    <div style={{ flex: 1 }}>
                      <label>تاريخ الاستحقاق</label>
                      <input
                        type="date"
                        className="form-control"
                        value={installmentDate}
                        onChange={(e) => setInstallmentDate(e.target.value)}
                      />
                    </div>
                    <button
                      onClick={handleAddInstallment}
                      className="btn btn-primary"
                      style={{ width: "120px" }}
                    >
                      + جدولة
                    </button>
                  </div>
                ) : (
                  <p style={{ color: "#64748b", fontStyle: "italic" }}>
                    🔒 التحكم المالي للمدير المالي فقط.
                  </p>
                )}

                <table>
                  <thead>
                    <tr>
                      <th>البيان</th>
                      <th>المبلغ</th>
                      <th>الاستحقاق</th>
                      <th>الحالة</th>
                      <th>إجراء</th>
                    </tr>
                  </thead>
                  <tbody>
                    {project.financials?.installments?.map((inst, i) => (
                      <tr key={i}>
                        <td>{inst.title}</td>
                        <td style={{ fontWeight: "bold" }}>
                          {inst.amount.toLocaleString()}
                        </td>
                        <td>
                          {inst.dueDate
                            ? new Date(inst.dueDate).toLocaleDateString("ar-EG")
                            : "-"}
                        </td>
                        <td>
                          {inst.status === "Paid" ? (
                            <span
                              style={{
                                background: "#dcfce7",
                                color: "#166534",
                                padding: "4px 10px",
                                borderRadius: "15px",
                              }}
                            >
                              تم الدفع
                            </span>
                          ) : (
                            <span
                              style={{
                                background: "#fef3c7",
                                color: "#92400e",
                                padding: "4px 10px",
                                borderRadius: "15px",
                              }}
                            >
                              مستحق
                            </span>
                          )}
                        </td>
                        <td>
                          {/* زر التحصيل لمن له صلاحية مالية فقط */}
                          {inst.status === "Pending" && canManageFinance && (
                            <button
                              onClick={() =>
                                handleMarkAsPaid(inst._id, inst.amount)
                              }
                              className="btn"
                              style={{
                                height: "30px",
                                fontSize: "0.8rem",
                                background: "#10b981",
                                color: "white",
                              }}
                            >
                              تحصيل
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* 🟢 المراحل الفنية (مشاهدة فقط للمالية - تعديل للباقي) */}

              {/* جدولة التركيب */}
              {(project.status === "Manufacturing" ||
                project.status === "ReadyForInstallation" ||
                project.status === "Installation" ||
                project.status === "Completed") && (
                <div
                  className="card"
                  style={{ borderTop: "4px solid #8b5cf6" }}
                >
                  <h3
                    style={{
                      margin: 0,
                      marginBottom: "15px",
                      color: "#5b21b6",
                    }}
                  >
                    🚚 التوريد والتركيب
                  </h3>

                  {project.status === "Manufacturing" ? (
                    canManageTechnical ? (
                      <div className="input-group">
                        <input
                          type="date"
                          className="form-control"
                          value={installDateInput}
                          onChange={(e) => setInstallDateInput(e.target.value)}
                        />
                        <button
                          onClick={handleScheduleInstallation}
                          className="btn"
                          style={{ background: "#8b5cf6", color: "white" }}
                        >
                          جدولة
                        </button>
                      </div>
                    ) : (
                      <div style={{ color: "#64748b" }}>
                        ⏳ بانتظار تحديد موعد التركيب من الإدارة الهندسية
                      </div>
                    )
                  ) : (
                    <div>
                      ✅ موعد التركيب:{" "}
                      {new Date(project.installationDate).toLocaleDateString(
                        "ar-EG"
                      )}
                    </div>
                  )}
                </div>
              )}

              {/* بنود الأعمال */}
              {(project.status === "ReadyForInstallation" ||
                project.status === "Installation" ||
                project.status === "Completed") && (
                <div className="card">
                  <h3>🛠️ بنود الأعمال</h3>

                  {/* فورم إضافة البنود (يختفي للمدير المالي) */}
                  {canManageTechnical && (
                    <div
                      style={{
                        display: "flex",
                        gap: "10px",
                        marginBottom: "15px",
                      }}
                    >
                      <select
                        className="form-control"
                        style={{ width: "100px" }}
                        value={itemType}
                        onChange={(e) => setItemType(e.target.value)}
                      >
                        <option value="Door">باب</option>
                        <option value="Frame">حلق</option>
                      </select>
                      <input
                        className="form-control"
                        placeholder="الوصف والمكان"
                        value={itemName}
                        onChange={(e) => setItemName(e.target.value)}
                      />
                      <button
                        onClick={handleAddItem}
                        className="btn btn-primary"
                      >
                        إضافة
                      </button>
                    </div>
                  )}

                  <table>
                    <thead>
                      <tr>
                        <th>النوع</th>
                        <th>الوصف</th>
                        <th>S/N</th>
                        <th>الحالة</th>
                      </tr>
                    </thead>
                    <tbody>
                      {project.items?.map((item, i) => (
                        <tr key={i}>
                          <td>{item.itemType === "Door" ? "🚪" : "🔲"}</td>
                          <td>{item.description}</td>
                          <td>{item.serialNumber || "-"}</td>
                          <td>{item.isInstalled ? "✅ تم" : "⏳"}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {/* الشهادات (مخفي التحكم عن المالية) */}
              {project.items?.every((i) => i.isInstalled) &&
                project.items?.length > 0 && (
                  <div className="card">
                    <h3>🎓 التسليم والشهادات</h3>
                    <ul>
                      {project.certificates?.map((c, i) => (
                        <li key={i}>
                          <a
                            href={`http://localhost:5000/${c.url}`}
                            target="_blank"
                            rel="noreferrer"
                          >
                            {c.title}
                          </a>
                        </li>
                      ))}
                    </ul>

                    {/* فورم الرفع والإغلاق (يختفي للمدير المالي) */}
                    {project.status !== "Completed" && canManageTechnical && (
                      <div style={{ background: "#f8fafc", padding: "15px" }}>
                        <div style={{ display: "flex", gap: "10px" }}>
                          <input
                            className="form-control"
                            placeholder="اسم الشهادة"
                            value={certTitle}
                            onChange={(e) => setCertTitle(e.target.value)}
                          />
                          <input
                            type="file"
                            className="form-control"
                            onChange={(e) => setCertFile(e.target.files[0])}
                          />
                          <button onClick={handleUploadCert} className="btn">
                            رفع
                          </button>
                        </div>
                        <button
                          onClick={handleCompleteProject}
                          className="btn"
                          style={{
                            width: "100%",
                            marginTop: "15px",
                            background: "#0f172a",
                            color: "white",
                          }}
                        >
                          إغلاق المشروع
                        </button>
                      </div>
                    )}
                  </div>
                )}
            </>
          )}
        </>
      )}
    </div>
  );
}

export default ProjectDetails;

