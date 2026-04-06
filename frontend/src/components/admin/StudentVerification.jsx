import React, { useState, useEffect } from "react";
import { FiCheckCircle, FiXCircle, FiTrash2 } from "react-icons/fi";
import Sidebar from "../adminLayout/Sidebar";
import { useAuth } from "../../contexts/AuthContext";
import UserServices from "../../services/UserServices.jsx";

function StudentVerification() {
  const { user, logout } = useAuth();
  const [sidebarVisible, setSidebarVisible] = useState(true);
  const [activeTab, setActiveTab] = useState("pending");
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [rejectionModal, setRejectionModal] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [rejectionReason, setRejectionReason] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleLogout = async () => {
    try {
      await logout();
    } catch (err) {
      console.error("Logout failed:", err);
    }
  };

  const toggleSidebar = () => {
    setSidebarVisible((prev) => !prev);
    window.dispatchEvent(new CustomEvent("toggle-admin-sidebar"));
  };

  const fetchStudents = async (status) => {
    setLoading(true);
    try {
      const response = await UserServices.getStudentVerifications(status);
      if (response.status) {
        setStudents(response.data);
      }
    } catch (error) {
      console.error("Failed to fetch students:", error);
      window.showAlert("error", "Failed to load student verifications");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStudents(activeTab);
  }, [activeTab]);

  const handleApprove = async (studentId) => {
    if (!window.confirm("Are you sure you want to approve this student?")) {
      return;
    }

    setSubmitting(true);
    try {
      const response = await UserServices.approveStudentVerification(studentId);
      if (response.status) {
        window.showAlert("success", "Student approved successfully");
        fetchStudents(activeTab);
      }
    } catch (error) {
      console.error("Failed to approve student:", error);
      window.showAlert("error", "Failed to approve student");
    } finally {
      setSubmitting(false);
    }
  };

  const handleRejectClick = (student) => {
    setSelectedStudent(student);
    setRejectionReason("");
    setRejectionModal(true);
  };

  const handleRejectSubmit = async () => {
    if (!rejectionReason.trim()) {
      window.showAlert("error", "Please provide a rejection reason");
      return;
    }

    setSubmitting(true);
    try {
      const response = await UserServices.rejectStudentVerification(
        selectedStudent.id,
        { reason: rejectionReason },
      );
      if (response.status) {
        window.showAlert("success", "Student registration rejected");
        setRejectionModal(false);
        setSelectedStudent(null);
        setRejectionReason("");
        fetchStudents(activeTab);
      }
    } catch (error) {
      console.error("Failed to reject student:", error);
      window.showAlert("error", "Failed to reject student");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <Sidebar
        visible={sidebarVisible}
        onClose={() => setSidebarVisible(false)}
        user={user}
        onLogout={handleLogout}
      />

      <div className="admin-main-content min-vh-100 bg-light">
        <div className="container-fluid p-4">
          <div className="d-flex justify-content-between align-items-center mb-4">
            <h1 className="h3 mb-0">Student Verification</h1>
          </div>

          {/* Tabs */}
          <div className="card mb-4">
            <div className="card-header">
              <ul className="nav nav-tabs card-header-tabs" role="tablist">
                <li className="nav-item" role="presentation">
                  <button
                    className={`nav-link text-dark ${activeTab === "pending" ? "active" : ""}`}
                    onClick={() => setActiveTab("pending")}
                    type="button"
                  >
                    Pending Review
                  </button>
                </li>
                <li className="nav-item" role="presentation">
                  <button
                    className={`nav-link text-dark ${activeTab === "verified" ? "active" : ""}`}
                    onClick={() => setActiveTab("verified")}
                    type="button"
                  >
                    Approved
                  </button>
                </li>
                <li className="nav-item" role="presentation">
                  <button
                    className={`nav-link text-dark ${activeTab === "rejected" ? "active" : ""}`}
                    onClick={() => setActiveTab("rejected")}
                    type="button"
                  >
                    Rejected
                  </button>
                </li>
              </ul>
            </div>
          </div>

          {/* Students List */}
          <div className="card">
            <div className="card-body">
              {loading ? (
                <div className="text-center py-5">
                  <div className="spinner-border text-success" role="status">
                    <span className="visually-hidden">Loading...</span>
                  </div>
                </div>
              ) : students.length === 0 ? (
                <div className="text-center py-5">
                  <p className="text-muted mb-0">
                    No students in this category
                  </p>
                </div>
              ) : (
                <div className="table-responsive">
                  <table className="table table-hover mb-0">
                    <thead>
                      <tr>
                        <th>Student ID</th>
                        <th>Name</th>
                        <th>Email</th>
                        <th>Contact</th>
                        <th>Registration Date</th>
                        {activeTab === "pending" && <th>Actions</th>}
                        {activeTab === "rejected" && <th>Rejection Reason</th>}
                      </tr>
                    </thead>
                    <tbody>
                      {students.map((student) => (
                        <tr key={student.id}>
                          <td>
                            <small className="text-muted">
                              {student.student_id}
                            </small>
                          </td>
                          <td>
                            <strong>
                              {student.firstname} {student.middlename}{" "}
                              {student.lastname}
                            </strong>
                          </td>
                          <td>{student.email}</td>
                          <td>{student.contact_number}</td>
                          <td>
                            {new Date(student.created_at).toLocaleDateString()}
                          </td>
                          {activeTab === "pending" && (
                            <td>
                              <button
                                className="btn btn-sm btn-success me-2"
                                onClick={() => handleApprove(student.id)}
                                disabled={submitting}
                                title="Approve"
                              >
                                <FiCheckCircle size={16} />
                              </button>
                              <button
                                className="btn btn-sm btn-warning"
                                onClick={() => handleRejectClick(student)}
                                disabled={submitting}
                                title="Reject"
                              >
                                <FiXCircle size={16} />
                              </button>
                            </td>
                          )}
                          {activeTab === "rejected" && (
                            <td>
                              <small className="text-muted">
                                {student.verification_rejected_reason}
                              </small>
                            </td>
                          )}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Rejection Reason Modal */}
      {rejectionModal && (
        <div
          className="modal show d-block"
          tabIndex="-1"
          style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
        >
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Reject Student Registration</h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setRejectionModal(false)}
                  disabled={submitting}
                />
              </div>
              <div className="modal-body">
                <p className="mb-3">
                  Provide a reason for rejecting{" "}
                  <strong>
                    {selectedStudent?.firstname} {selectedStudent?.lastname}
                  </strong>
                  's registration:
                </p>
                <textarea
                  className="form-control"
                  rows="4"
                  placeholder="Enter rejection reason..."
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  disabled={submitting}
                />
              </div>
              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setRejectionModal(false)}
                  disabled={submitting}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  className="btn btn-warning"
                  onClick={handleRejectSubmit}
                  disabled={submitting || !rejectionReason.trim()}
                >
                  {submitting ? "Rejecting..." : "Reject"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default StudentVerification;
