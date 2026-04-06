import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import { FiMenu, FiCheckCircle, FiXCircle } from "react-icons/fi";
import StudentSidebar from "../studentLayout/StudentSidebar";
import "./StudentPages.css";

export default function StudentMyRecordsChecklist() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [sidebarVisible, setSidebarVisible] = useState(true);

  // Checklist data
  const [recordTypes, setRecordTypes] = useState([]);
  const [recordsMap, setRecordsMap] = useState({});
  const [loading, setLoading] = useState(true);

  const toggleSidebar = useCallback(() => {
    setSidebarVisible((prev) => !prev);
  }, []);

  useEffect(() => {
    if (user && user.role === "student") {
      fetchChecklistData();
    }
  }, [user]);

  const fetchChecklistData = async () => {
    setLoading(true);
    try {
      console.log("Fetching student records checklist from backend...");

      const response = await fetch(
        `${import.meta.env.VITE_API_BASE_URL || "http://localhost:8000"}/my-records/checklist`,
        {
          headers: {
            Accept: "application/json",
          },
          credentials: "include",
        },
      );

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }

      const data = await response.json();
      console.log("Checklist data received:", data);

      if (data.success && data.data) {
        const { record_types, records } = data.data;
        setRecordTypes(record_types || []);
        setRecordsMap(records || {});
      }
    } catch (error) {
      console.error("Error fetching checklist data:", error);
      window.showAlert("error", "Failed to load your records checklist");
    } finally {
      setLoading(false);
    }
  };

  const getRecordStatus = (recordData) => {
    if (!recordData) return "not-submitted";
    return recordData.submitted ? "submitted" : "not-submitted";
  };

  const getRecordCount = (recordData) => {
    if (!recordData) return 0;
    return recordData.count || 0;
  };

  // Calculate overall progress
  const submittedCount = recordTypes.filter(
    (rt) => getRecordStatus(recordsMap[rt.name]) === "submitted",
  ).length;

  if (loading) {
    return (
      <div className="d-flex vh-100 bg-light">
        <StudentSidebar visible={sidebarVisible} />
        <div className="student-main-content min-vh-100 bg-light w-100">
          <div className="d-flex align-items-center justify-content-center h-100">
            <div className="spinner-border text-primary" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <StudentSidebar visible={sidebarVisible} />
      <div className="student-main-content min-vh-100 bg-light">
        {/* Mobile Header */}
        <div className="d-lg-none bg-dark text-white p-3 d-flex align-items-center">
          <button
            className="btn btn-outline-light btn-sm me-3"
            onClick={toggleSidebar}
            aria-label="Toggle sidebar"
          >
            <FiMenu size={20} />
          </button>
          <span className="fw-semibold">Records Checklist</span>
        </div>

        {/* Main Content */}
        <div className="container-fluid p-4">
          {/* Header */}
          <div className="mb-4">
            <h1 className="h3 mb-1">My Records Checklist</h1>
            <p className="text-muted mb-0">
              Track the status of your submitted records
            </p>
          </div>

          {/* Info Card */}
          <div className="card border-0 shadow-sm mb-4">
            <div className="card-body bg-info bg-opacity-10">
              <div className="row g-3">
                <div className="col-md-10">
                  <div>
                    <strong>Overview</strong>
                    <p className="text-muted mb-0 mt-2">
                      You have submitted <strong>{submittedCount}</strong> out
                      of <strong>{recordTypes.length}</strong> record types.
                    </p>
                  </div>
                </div>

                <div className="col-md-12 col-lg-auto ms-lg-auto">
                  <span className="text-muted">
                    {submittedCount}/{recordTypes.length} submitted
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Records Checklist */}
          <div className="card border-0 shadow-sm">
            <div className="card-body p-0">
              {recordTypes.length === 0 ? (
                <div className="text-center py-5">
                  <h5 className="text-muted">No record types available</h5>
                  <p className="text-muted">
                    Please check back later for available record types
                  </p>
                </div>
              ) : (
                <div
                  style={{
                    padding: "1rem",
                    backgroundColor: "#f8f9fa",
                  }}
                >
                  <div className="row g-3">
                    {recordTypes.map((recordType) => {
                      const records = recordsMap[recordType.name];
                      const status = getRecordStatus(records);
                      const count = getRecordCount(records);

                      return (
                        <div key={recordType.id} className="col-md-6">
                          <div
                            style={{
                              padding: "0.875rem",
                              border:
                                status === "submitted"
                                  ? "1px solid #d4edda"
                                  : "1px solid #f8d7da",
                              borderRadius: "0.25rem",
                              backgroundColor:
                                status === "submitted" ? "#f1f9f5" : "#fff5f5",
                              display: "flex",
                              alignItems: "center",
                              gap: "0.75rem",
                            }}
                          >
                            {status === "submitted" ? (
                              <FiCheckCircle
                                size={20}
                                className="text-success"
                                style={{ flexShrink: 0 }}
                              />
                            ) : (
                              <FiXCircle
                                size={20}
                                className="text-danger"
                                style={{ flexShrink: 0 }}
                              />
                            )}
                            <div style={{ flex: 1 }}>
                              <small className="d-block fw-semibold">
                                {recordType.name}
                              </small>
                              <small className="text-muted d-block">
                                {status === "submitted"
                                  ? `${count} submitted`
                                  : "Not submitted"}
                              </small>
                            </div>
                            {status === "submitted" && (
                              <span
                                className="badge bg-success"
                                style={{ flexShrink: 0 }}
                              >
                                {count}
                              </span>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
