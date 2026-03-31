import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { useAuth } from "../../contexts/AuthContext";
import {
  FiMenu,
  FiSearch,
  FiCheckCircle,
  FiXCircle,
  FiChevronDown,
  FiChevronRight,
  FiFilter,
} from "react-icons/fi";
import Sidebar from "../adminLayout/Sidebar";
import StudentServices from "../../services/StudentServices.jsx";
import StudentRecordServices from "../../services/StudentRecordServices.jsx";
import { validateSpecialCharacters } from "../../utils/validation.js";

export default function StudentRecordsChecklist() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [sidebarVisible, setSidebarVisible] = useState(true);

  // Students and records data
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [recordTypes, setRecordTypes] = useState([]);

  // Expanded students
  const [expandedStudents, setExpandedStudents] = useState({});

  // Filters
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredStudents, setFilteredStudents] = useState([]);

  const handleLogout = useCallback(async () => {
    try {
      await logout();
      navigate("/login");
    } catch (err) {
      console.error("Logout failed:", err);
    }
  }, [logout, navigate]);

  const toggleSidebar = useCallback(() => {
    setSidebarVisible((prev) => !prev);
    window.dispatchEvent(new CustomEvent("toggle-admin-sidebar"));
  }, []);

  useEffect(() => {
    if (!user || (user.role !== "admin" && !user.roles?.includes("admin"))) {
      navigate("/login");
      return;
    }
    fetchData();
  }, [user, navigate]);

  const fetchData = async () => {
    setLoading(true);
    try {
      console.log("Fetching records checklist from backend...");

      // Fetch all data from optimized backend endpoint
      const response = await fetch(
        `${import.meta.env.VITE_API_BASE_URL || "http://localhost:8000"}/students/records-checklist`,
        {
          headers: {
            Accept: "application/json",
          },
          credentials: "include", // Include cookies for session auth
        },
      );

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }

      const data = await response.json();
      console.log("Checklist data received:", data);

      if (data.success && data.data) {
        const { students, record_types } = data.data;

        // Process students data to match expected format
        const studentsWithRecords = students.map((student) => ({
          ...student,
          fullName: student.name,
          recordsMap: student.records, // Already organized by record type name
        }));

        console.log("Students processed:", studentsWithRecords);

        setRecordTypes(record_types || []);

        setStudents(studentsWithRecords);
        setFilteredStudents(studentsWithRecords);
      }
    } catch (error) {
      console.error("Error fetching checklist data:", error);
      toast.error("Failed to load student records checklist");
    } finally {
      setLoading(false);
    }
  };

  // Filter students based on search and course
  useEffect(() => {
    let filtered = students;

    if (searchTerm) {
      const lowerSearch = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (student) =>
          (student.fullName &&
            student.fullName.toLowerCase().includes(lowerSearch)) ||
          (student.student_id &&
            student.student_id.toLowerCase().includes(lowerSearch)),
      );
    }

    setFilteredStudents(filtered);
  }, [searchTerm, students]);

  const toggleStudent = (studentId) => {
    setExpandedStudents((prev) => ({
      ...prev,
      [studentId]: !prev[studentId],
    }));
  };

  const getRecordCount = (recordData) => {
    if (!recordData) return 0;
    // recordData is now { count, submitted } instead of an array
    return recordData.count || 0;
  };

  const getRecordStatus = (recordData) => {
    if (!recordData) return "not-submitted";
    // recordData is now { count, submitted } instead of an array
    return recordData.submitted ? "submitted" : "not-submitted";
  };

  if (loading) {
    return (
      <div className="d-flex vh-100 bg-light">
        <Sidebar visible={sidebarVisible} />
        <div className="admin-main-content min-vh-100 bg-light w-100">
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
      <Sidebar
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
            onClick={toggleSidebar}
            aria-label="Toggle sidebar"
          >
            <FiMenu size={20} />
          </button>
          <span className="fw-semibold">Student Records Checklist</span>
        </div>

        {/* Main Content */}
        <div className="container-fluid p-4">
          {/* Header */}
          <div className="mb-4">
            <h1 className="h3 mb-1">Student Records Checklist</h1>
            <p className="text-muted mb-0">
              View and verify which records each student has submitted
            </p>
          </div>

          {/* Filters */}
          <div className="card border-0 shadow-sm mb-4">
            <div className="card-body bg-info bg-opacity-10">
              <div className="row g-3">
                <div className="col-md-10">
                  <div className="input-group">
                    <span className="input-group-text bg-white">
                      <FiSearch size={16} />
                    </span>
                    <input
                      type="text"
                      className="form-control border-start-0"
                      placeholder="Search by name or ID..."
                      value={searchTerm}
                      onChange={(e) => {
                        const value = e.target.value;
                        const validation = validateSpecialCharacters(value, [
                          "-",
                          " ",
                          "@",
                          ".",
                        ]);
                        if (!validation.isValid) {
                          toast.error(validation.message);
                          return;
                        }
                        setSearchTerm(value);
                      }}
                    />
                  </div>
                </div>

                <div className="col-md-12 col-lg-auto ms-lg-auto">
                  <span className="text-muted">
                    {filteredStudents.length} student
                    {filteredStudents.length !== 1 && "s"}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Records Checklist */}
          <div className="card border-0 shadow-sm">
            <div className="card-body p-0">
              {filteredStudents.length === 0 ? (
                <div className="text-center py-5">
                  <h5 className="text-muted">No students found</h5>
                  <p className="text-muted">
                    Try adjusting your search or filters
                  </p>
                </div>
              ) : (
                <div>
                  {filteredStudents.map((student) => (
                    <div key={student.id} className="student-checklist-item">
                      {/* Student Header Row */}
                      <div
                        className="student-header-row"
                        onClick={() => toggleStudent(student.id)}
                        style={{
                          borderBottom: "1px solid #dee2e6",
                          padding: "1rem",
                          backgroundColor: expandedStudents[student.id]
                            ? "#e7f3ff"
                            : "#fff",
                          cursor: "pointer",
                          display: "flex",
                          alignItems: "center",
                          gap: "0.75rem",
                          transition: "background-color 0.2s",
                        }}
                      >
                        {/* Expand/Collapse Icon */}
                        <div style={{ minWidth: "24px" }}>
                          {expandedStudents[student.id] ? (
                            <FiChevronDown size={20} className="text-primary" />
                          ) : (
                            <FiChevronRight size={20} className="text-muted" />
                          )}
                        </div>

                        {/* Student Info */}
                        <div style={{ flex: 1 }}>
                          <div className="fw-semibold">{student.fullName}</div>
                          <small className="text-muted">
                            ID: {student.student_id || "N/A"}
                          </small>
                          {student.course && (
                            <>
                              <br />
                              <small className="text-muted">
                                Course: {student.course}
                              </small>
                            </>
                          )}
                        </div>

                        {/* Progress Badge */}
                        <div
                          style={{ minWidth: "120px", textAlign: "right" }}
                          onClick={(e) => e.stopPropagation()}
                        >
                          <small className="text-muted d-block">
                            {(() => {
                              const submitted = recordTypes.filter(
                                (rt) =>
                                  getRecordStatus(
                                    student.recordsMap[rt.name],
                                  ) === "submitted",
                              ).length;
                              return `${submitted}/${recordTypes.length} submitted`;
                            })()}
                          </small>
                          <div
                            className="progress mt-1"
                            style={{ height: "6px" }}
                          >
                            <div
                              className="progress-bar bg-success"
                              style={{
                                width: `${
                                  recordTypes.length > 0
                                    ? (recordTypes.filter(
                                        (rt) =>
                                          getRecordStatus(
                                            student.recordsMap[rt.name],
                                          ) === "submitted",
                                      ).length /
                                        recordTypes.length) *
                                      100
                                    : 0
                                }%`,
                              }}
                            />
                          </div>
                        </div>
                      </div>

                      {/* Expanded Records Checklist */}
                      {expandedStudents[student.id] && (
                        <div
                          style={{
                            padding: "1rem",
                            backgroundColor: "#f8f9fa",
                            borderBottom: "1px solid #dee2e6",
                          }}
                        >
                          {recordTypes.length === 0 ? (
                            <p className="text-muted text-center py-3 mb-0">
                              No record types available
                            </p>
                          ) : (
                            <div className="row g-3">
                              {recordTypes.map((recordType) => {
                                const records =
                                  student.recordsMap[recordType.name];
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
                                          status === "submitted"
                                            ? "#f1f9f5"
                                            : "#fff5f5",
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
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
