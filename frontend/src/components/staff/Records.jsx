import { useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import StaffSidebar from "../staffLayout/Sidebar";
import { FiMenu, FiChevronRight } from "react-icons/fi";
import { useState } from "react";

export default function StaffRecords() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [sidebarVisible, setSidebarVisible] = useState(true);

  const handleLogout = async () => {
    try {
      await logout();
      navigate("/login", { replace: true });
    } catch (err) {
      console.error("Logout failed:", err);
    }
  };

  const recordTypes = [
    {
      id: "tor",
      name: "Transcript of Records",
      description: "TOR",
      color: "success",
      icon: "📋",
    },
    {
      id: "special-order",
      name: "Special Order",
      description: "Special Order documents",
      color: "info",
      icon: "📄",
    },
    {
      id: "psa",
      name: "PSA",
      description: "Philippine Statistics Authority documents",
      color: "primary",
      icon: "🏛️",
    },
  ];

  return (
    <>
      <StaffSidebar
        visible={sidebarVisible}
        onClose={() => setSidebarVisible(false)}
        user={user}
        onLogout={handleLogout}
      />

      <div className="admin-main-content min-vh-100 bg-light">
        {/* Mobile Header */}
        <div className="d-lg-none bg-dark text-white p-3 d-flex align-items-center">
          <button
            className="btn btn-outline-light btn-sm me-3"
            onClick={() => setSidebarVisible(!sidebarVisible)}
            aria-label="Toggle sidebar"
          >
            <FiMenu size={20} />
          </button>
          <span className="fw-semibold">Records</span>
        </div>

        {/* Main Content */}
        <div className="container-fluid p-4">
          {/* Page Header */}
          <div className="mb-4">
            <h2 className="mb-2">Student Records</h2>
            <p className="text-muted">
              Manage and view different types of student records
            </p>
          </div>

          {/* Record Types Grid */}
          <div className="row g-4">
            {recordTypes.map((type) => (
              <div key={type.id} className="col-md-6 col-lg-4">
                <div
                  className="card h-100 cursor-pointer border-0 shadow-sm hover-shadow"
                  onClick={() => navigate(`/staff/records/${type.id}`)}
                  style={{ cursor: "pointer", transition: "all 0.3s ease" }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = "translateY(-4px)";
                    e.currentTarget.style.boxShadow =
                      "0 8px 16px rgba(0,0,0,0.15)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = "translateY(0)";
                    e.currentTarget.style.boxShadow =
                      "0 0.125rem 0.25rem rgba(0,0,0,0.075)";
                  }}
                >
                  <div
                    className={`card-header bg-${type.color} text-white d-flex align-items-center gap-2`}
                  >
                    <span style={{ fontSize: "24px" }}>{type.icon}</span>
                    <h5 className="mb-0">{type.name}</h5>
                  </div>
                  <div className="card-body d-flex flex-column">
                    <p className="text-muted flex-grow-1">{type.description}</p>
                    <div className="d-flex align-items-center gap-2 text-primary">
                      <span className="fw-semibold">View Records</span>
                      <FiChevronRight size={16} />
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Info Card */}
          <div className="mt-5">
            <div className="alert alert-info d-flex gap-3">
              <span style={{ fontSize: "24px" }}>ℹ️</span>
              <div>
                <h6 className="mb-1">About Student Records</h6>
                <p className="mb-0 text-muted">
                  You can add new student records and view existing ones. Each
                  record type serves a specific purpose in managing student
                  documentation.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
