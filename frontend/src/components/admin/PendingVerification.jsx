import { useState, useEffect, useCallback, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { useAuth } from "../../contexts/AuthContext";
import {
  FiMenu,
  FiSearch,
  FiCheckCircle,
  FiXCircle,
  FiDownload,
  FiEye,
  FiX,
  FiChevronDown,
  FiChevronRight,
} from "react-icons/fi";
import Sidebar from "../adminLayout/Sidebar";
import { formatDate } from "../../utils/index.jsx";
import { validateSpecialCharacters } from "../../utils/validation.js";
import StudentRecordServices from "../../services/StudentRecordServices.jsx";

export default function PendingVerification() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [sidebarVisible, setSidebarVisible] = useState(true);

  // Pending records data
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [recordTypes, setRecordTypes] = useState({});
  const [loadingTypes, setLoadingTypes] = useState(true);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    lastPage: 1,
    total: 0,
    perPage: 10,
  });

  // Filters
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedRecordType, setSelectedRecordType] = useState("");
  const [recordTypesList, setRecordTypesList] = useState([]);

  // Verification modal
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [showVerificationModal, setShowVerificationModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // File preview modal
  const [previewFile, setPreviewFile] = useState(null);
  const [showPreviewModal, setShowPreviewModal] = useState(false);

  // Expanded students
  const [expandedStudents, setExpandedStudents] = useState({});

  const handleLogout = async () => {
    try {
      await logout();
      navigate("/login");
    } catch (err) {
      console.error("Logout failed:", err);
    }
  };

  const toggleSidebar = () => {
    setSidebarVisible(!sidebarVisible);
    window.dispatchEvent(new CustomEvent("toggle-admin-sidebar"));
  };

  // Fetch record types on mount
  useEffect(() => {
    const fetchRecordTypes = async () => {
      try {
        const response = await StudentRecordServices.getRecordTypes();
        if (response.success) {
          setRecordTypes(response.data);
          setRecordTypesList(Object.keys(response.data));
        }
      } catch (error) {
        console.error("Failed to fetch record types:", error);
      } finally {
        setLoadingTypes(false);
      }
    };

    fetchRecordTypes();
  }, []);

  // Fetch pending records
  const fetchRecords = useCallback(
    async (page = 1) => {
      setLoading(true);
      try {
        const response = await StudentRecordServices.getPendingVerification({
          page,
          per_page: pagination.perPage,
          ...(searchTerm && { search: searchTerm }),
          ...(selectedRecordType && { record_type: selectedRecordType }),
        });

        if (response.success) {
          setRecords(response.data || []);
          setPagination({
            currentPage: response.pagination?.current_page || 1,
            lastPage: response.pagination?.last_page || 1,
            total: response.pagination?.total || 0,
            perPage: response.pagination?.per_page || 10,
          });
        } else {
          toast.error(
            "Failed to fetch records: " + (response.message || "Unknown error"),
          );
          setRecords([]);
        }
      } catch (error) {
        console.error("Failed to fetch pending records:", error);
        toast.error("Failed to fetch pending records: " + error.message);
        setRecords([]);
      } finally {
        setLoading(false);
      }
    },
    [searchTerm, selectedRecordType, pagination.perPage],
  );

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchRecords(1);
    }, 500);

    return () => clearTimeout(timer);
  }, [fetchRecords]);

  const handlePageChange = (page) => {
    if (page >= 1 && page <= pagination.lastPage) {
      fetchRecords(page);
    }
  };

  const openVerificationModal = (record) => {
    setSelectedRecord(record);
    setShowVerificationModal(true);
  };

  const handleVerifyRecord = async (action) => {
    if (!selectedRecord) return;

    setSubmitting(true);
    try {
      const response = await StudentRecordServices.verifyRecord(
        selectedRecord.id,
        action,
      );

      if (response.success) {
        toast.success(response.message);
        setShowVerificationModal(false);
        fetchRecords(pagination.currentPage);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to verify record");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDownloadFile = (file) => {
    if (!file) {
      toast.error("File not available");
      return;
    }

    // Try to use file_url from API response, fallback to constructing URL
    const fileUrl = file.file_url || `/storage/${file.file_path}`;

    if (!fileUrl) {
      toast.error("File URL not available");
      return;
    }

    try {
      const link = document.createElement("a");
      link.href = fileUrl;
      link.download = file.file_name || "download";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      toast.success("Download started");
    } catch (error) {
      toast.error("Failed to download file");
    }
  };

  const handleViewFile = (file) => {
    if (!file || !file.file_path) {
      toast.error("File path not available");
      return;
    }
    setPreviewFile(file);
    setShowPreviewModal(true);
  };

  const isImageFile = (fileName) => {
    if (!fileName) return false;
    const str = fileName.toLowerCase();
    return /\.(jpg|jpeg|png|gif|bmp|webp|svg)$/i.test(str);
  };

  const isPdfFile = (fileName) => {
    if (!fileName) return false;
    const str = fileName.toLowerCase();
    return /\.pdf$/i.test(str);
  };

  // Group records by student, then by record type
  const groupedRecords = useMemo(() => {
    const grouped = {};

    records.forEach((record) => {
      const studentKey =
        record.user?.id ||
        `${record.user?.firstname || "Unknown"}_${record.user?.lastname || ""}`;
      const studentName = `${record.user?.firstname || "Unknown"} ${record.user?.lastname || ""}`;
      const studentEmail = record.user?.email || "N/A";

      if (!grouped[studentKey]) {
        grouped[studentKey] = {
          id: studentKey,
          name: studentName,
          email: studentEmail,
          user: record.user,
          recordsByType: {},
        };
      }

      const recordType = record.record_type;
      if (!grouped[studentKey].recordsByType[recordType]) {
        grouped[studentKey].recordsByType[recordType] = [];
      }

      grouped[studentKey].recordsByType[recordType].push(record);
    });

    return Object.values(grouped);
  }, [records]);

  const toggleStudentExpanded = (studentId) => {
    setExpandedStudents((prev) => ({
      ...prev,
      [studentId]: !prev[studentId],
    }));
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
        {/* Mobile Header */}
        <div className="d-lg-none bg-dark text-white p-3 d-flex align-items-center">
          <button
            className="btn btn-outline-light btn-sm me-3"
            onClick={toggleSidebar}
            aria-label="Toggle sidebar"
          >
            <FiMenu size={20} />
          </button>
          <span className="fw-semibold">Pending Verification</span>
        </div>

        {/* Main Content */}
        <div className="container-fluid p-4">
          {/* Header */}
          <div className="mb-4">
            <h1 className="h3 mb-1">Pending Record Verification</h1>
            <p className="text-muted mb-0">
              Review and verify student uploaded records
            </p>
          </div>

          {/* Filters */}
          <div className="card border-0 shadow-sm mb-4">
            <div className="card-body bg-warning bg-opacity-10">
              <div className="row g-3">
                <div className="col-md-12 col-lg-6">
                  <div className="input-group">
                    <span className="input-group-text bg-white">
                      <FiSearch size={16} />
                    </span>
                    <input
                      type="text"
                      className="form-control border-start-0"
                      placeholder="Search by student name or email..."
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

                <div className="col-md-6 col-lg-4">
                  <select
                    className="form-select"
                    value={selectedRecordType}
                    onChange={(e) => setSelectedRecordType(e.target.value)}
                    disabled={loadingTypes}
                  >
                    <option value="">
                      {loadingTypes ? "Loading..." : "All Record Types"}
                    </option>
                    {recordTypesList.map((code) => (
                      <option key={code} value={code}>
                        {recordTypes[code] || code}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="col-md-12 col-lg-auto ms-lg-auto">
                  <span className="text-muted">
                    {pagination.total} record{pagination.total !== 1 && "s"}{" "}
                    pending
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Records Table */}
          <div className="card border-0 shadow-sm">
            <div className="card-body p-0">
              {loading ? (
                <div className="text-center py-5">
                  <div className="spinner-border text-warning" role="status">
                    <span className="visually-hidden">Loading...</span>
                  </div>
                </div>
              ) : records.length === 0 ? (
                <div className="text-center py-5">
                  <h5 className="text-muted">No pending records</h5>
                  <p className="text-muted">All records have been verified!</p>
                </div>
              ) : (
                <div>
                  {groupedRecords.map((student) => (
                    <div key={student.id} className="student-group">
                      {/* Student Header Row */}
                      <div
                        className="student-header"
                        onClick={() => toggleStudentExpanded(student.id)}
                        style={{
                          borderBottom: "1px solid #dee2e6",
                          padding: "1rem",
                          backgroundColor: expandedStudents[student.id]
                            ? "#fff3cd"
                            : "#fff",
                          cursor: "pointer",
                          display: "flex",
                          alignItems: "center",
                          gap: "0.75rem",
                        }}
                      >
                        {/* Expand/Collapse Icon */}
                        <div style={{ minWidth: "24px" }}>
                          {expandedStudents[student.id] ? (
                            <FiChevronDown size={20} className="text-warning" />
                          ) : (
                            <FiChevronRight size={20} className="text-muted" />
                          )}
                        </div>

                        {/* Student Info */}
                        <div style={{ flex: 1 }}>
                          <div className="fw-semibold">{student.name}</div>
                          <small className="text-muted">{student.email}</small>
                        </div>

                        {/* Record Count */}
                        <div style={{ minWidth: "150px" }}>
                          <small className="text-muted">
                            {Object.values(student.recordsByType)
                              .flat()
                              .reduce(
                                (sum, r) => sum + (r.files?.length || 0),
                                0,
                              )}{" "}
                            file
                            {Object.values(student.recordsByType)
                              .flat()
                              .reduce(
                                (sum, r) => sum + (r.files?.length || 0),
                                0,
                              ) !== 1 && "s"}{" "}
                            across {Object.keys(student.recordsByType).length}{" "}
                            record
                            {Object.keys(student.recordsByType).length !== 1 &&
                              "s"}
                          </small>
                        </div>
                      </div>

                      {/* Expanded Content */}
                      {expandedStudents[student.id] && (
                        <div
                          style={{
                            backgroundColor: "#f8f9fa",
                            borderBottom: "1px solid #dee2e6",
                          }}
                        >
                          {/* Records grouped by type */}
                          {Object.entries(student.recordsByType).map(
                            ([recordType, typeRecords]) => (
                              <div
                                key={recordType}
                                style={{
                                  borderBottom: "1px solid #dee2e6",
                                  padding: "1rem",
                                  marginLeft: "2.5rem",
                                }}
                              >
                                {/* Record Type Header */}
                                <div
                                  style={{
                                    marginBottom: "0.75rem",
                                    paddingBottom: "0.5rem",
                                    borderBottom: "1px solid #e0e0e0",
                                  }}
                                >
                                  <span className="badge bg-warning">
                                    {recordTypes[recordType] || recordType}
                                  </span>
                                </div>

                                {/* Records for this type */}
                                <div className="list-group">
                                  {typeRecords.map((record) => (
                                    <div
                                      key={record.id}
                                      className="list-group-item"
                                      style={{
                                        padding: "0.75rem",
                                        marginBottom: "0.5rem",
                                        backgroundColor: "#fff",
                                        border: "1px solid #dee2e6",
                                        borderRadius: "0.25rem",
                                      }}
                                    >
                                      <div className="d-flex justify-content-between align-items-start">
                                        <div style={{ flex: 1 }}>
                                          <small className="text-muted d-block mb-2">
                                            Uploaded{" "}
                                            {formatDate(record.created_at)}
                                          </small>
                                          {record.files &&
                                          record.files.length > 0 ? (
                                            <div
                                              style={{ marginTop: "0.5rem" }}
                                            >
                                              <small className="fw-semibold d-block mb-2">
                                                Files ({record.files.length}):
                                              </small>
                                              <ul
                                                style={{
                                                  paddingLeft: "1.25rem",
                                                  marginBottom: "0.5rem",
                                                }}
                                              >
                                                {record.files.map((file) => (
                                                  <li key={file.id}>
                                                    <small>
                                                      {file.file_name} (
                                                      {(
                                                        file.file_size /
                                                        1024 /
                                                        1024
                                                      ).toFixed(2)}{" "}
                                                      MB)
                                                    </small>
                                                  </li>
                                                ))}
                                              </ul>
                                            </div>
                                          ) : (
                                            <small className="text-muted">
                                              No files
                                            </small>
                                          )}
                                        </div>
                                        <button
                                          className="btn btn-sm btn-outline-primary ms-2"
                                          onClick={() =>
                                            openVerificationModal(record)
                                          }
                                          title="Verify record"
                                        >
                                          <FiEye size={14} />
                                        </button>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            ),
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Pagination */}
            {records.length > 0 && (
              <div className="card-footer bg-white">
                <div className="d-flex justify-content-between align-items-center">
                  <small className="text-muted">
                    Showing{" "}
                    {(pagination.currentPage - 1) * pagination.perPage + 1}-
                    {Math.min(
                      pagination.currentPage * pagination.perPage,
                      pagination.total,
                    )}{" "}
                    of {pagination.total}
                  </small>
                  {pagination.lastPage > 1 && (
                    <nav>
                      <ul className="pagination pagination-sm mb-0">
                        <li
                          className={`page-item ${
                            pagination.currentPage === 1 ? "disabled" : ""
                          }`}
                        >
                          <button
                            className="page-link"
                            onClick={() =>
                              handlePageChange(pagination.currentPage - 1)
                            }
                          >
                            Previous
                          </button>
                        </li>
                        {Array.from(
                          { length: pagination.lastPage },
                          (_, i) => i + 1,
                        )
                          .filter(
                            (page) =>
                              page === 1 ||
                              page === pagination.lastPage ||
                              Math.abs(page - pagination.currentPage) <= 1,
                          )
                          .map((page, idx, arr) => (
                            <li key={page}>
                              {idx > 0 && arr[idx - 1] !== page - 1 && (
                                <span className="page-link disabled">...</span>
                              )}
                              <button
                                className={`page-link ${
                                  page === pagination.currentPage
                                    ? "active"
                                    : ""
                                }`}
                                onClick={() => handlePageChange(page)}
                              >
                                {page}
                              </button>
                            </li>
                          ))}
                        <li
                          className={`page-item ${
                            pagination.currentPage === pagination.lastPage
                              ? "disabled"
                              : ""
                          }`}
                        >
                          <button
                            className="page-link"
                            onClick={() =>
                              handlePageChange(pagination.currentPage + 1)
                            }
                          >
                            Next
                          </button>
                        </li>
                      </ul>
                    </nav>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Verification Modal */}
      {showVerificationModal && selectedRecord && (
        <div
          className="modal fade show d-block"
          style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
        >
          <div className="modal-dialog modal-lg modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Verify Record</h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setShowVerificationModal(false)}
                />
              </div>
              <div className="modal-body">
                {/* Record Details */}
                <div className="row g-3 mb-4">
                  <div className="col-6">
                    <label className="form-label fw-semibold text-muted small">
                      Student
                    </label>
                    <div>
                      <div className="fw-semibold">
                        {selectedRecord.user?.firstname}{" "}
                        {selectedRecord.user?.lastname}
                      </div>
                      <small className="text-muted">
                        {selectedRecord.user?.email}
                      </small>
                    </div>
                  </div>
                  <div className="col-6">
                    <label className="form-label fw-semibold text-muted small">
                      Record Type
                    </label>
                    <span className="badge bg-warning">
                      {recordTypes[selectedRecord.record_type] ||
                        selectedRecord.record_type}
                    </span>
                  </div>
                  <div className="col-6">
                    <label className="form-label fw-semibold text-muted small">
                      Uploaded Date
                    </label>
                    <small> {formatDate(selectedRecord.created_at)}</small>
                  </div>
                  <div className="col-6">
                    <label className="form-label fw-semibold text-muted small">
                      Files
                    </label>
                    <small>{selectedRecord.files?.length || 0} file(s)</small>
                  </div>
                </div>

                {/* Files List */}
                {selectedRecord.files && selectedRecord.files.length > 0 ? (
                  <div className="mb-4">
                    <label className="form-label fw-semibold">Files</label>
                    <div className="list-group">
                      {selectedRecord.files.map((file) => (
                        <div
                          key={file.id}
                          className="list-group-item d-flex justify-content-between align-items-center"
                        >
                          <div className="small">
                            <div className="fw-semibold">{file.file_name}</div>
                            <small className="text-muted">
                              {(file.file_size / 1024 / 1024).toFixed(2)} MB
                            </small>
                          </div>
                          <div className="d-flex gap-2">
                            <button
                              className="btn btn-sm btn-outline-info"
                              onClick={() => handleViewFile(file)}
                              title="View file"
                            >
                              <FiEye size={14} />
                            </button>
                            <button
                              className="btn btn-sm btn-outline-primary"
                              onClick={() => handleDownloadFile(file)}
                              title="Download file"
                            >
                              <FiDownload size={14} />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="alert alert-warning mb-4" role="alert">
                    <strong>No files found for this record</strong>
                    <p className="mb-0 small mt-2">
                      This record has no attached files. Files array:{" "}
                      {JSON.stringify(selectedRecord.files)}
                    </p>
                  </div>
                )}
              </div>
              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-danger"
                  onClick={() => handleVerifyRecord("reject")}
                  disabled={submitting}
                >
                  {submitting ? (
                    <>
                      <span
                        className="spinner-border spinner-border-sm me-2"
                        role="status"
                        aria-hidden="true"
                      ></span>
                      Processing...
                    </>
                  ) : (
                    <>
                      <FiXCircle className="me-2" />
                      Reject
                    </>
                  )}
                </button>
                <button
                  type="button"
                  className="btn btn-success"
                  onClick={() => handleVerifyRecord("approve")}
                  disabled={submitting}
                >
                  {submitting ? (
                    <>
                      <span
                        className="spinner-border spinner-border-sm me-2"
                        role="status"
                        aria-hidden="true"
                      ></span>
                      Processing...
                    </>
                  ) : (
                    <>
                      <FiCheckCircle className="me-2" />
                      Approve
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* File Preview Modal */}
      {showPreviewModal && previewFile && (
        <div
          className="modal fade show d-block"
          style={{ backgroundColor: "rgba(0,0,0,0.7)" }}
        >
          <div className="modal-dialog modal-lg modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">
                  {previewFile.file_name}
                  <small className="fw-normal text-muted ms-2">
                    ({(previewFile.file_size / 1024 / 1024).toFixed(2)} MB)
                  </small>
                </h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setShowPreviewModal(false)}
                />
              </div>
              <div
                className="modal-body"
                style={{
                  maxHeight: "70vh",
                  overflowY: "auto",
                  backgroundColor: "#f8f9fa",
                }}
              >
                {isImageFile(previewFile.file_name) ? (
                  <div className="text-center">
                    <img
                      src={
                        previewFile.file_url ||
                        `/storage/${previewFile.file_path}`
                      }
                      alt={previewFile.file_name}
                      onError={(e) => {
                        e.target.style.display = "none";
                        e.target.parentElement.innerHTML = `
                          <div class="alert alert-danger m-0">
                            <strong>Failed to load image</strong>
                            <p class="mb-2">Path: ${previewFile.file_path}</p>
                            <p class="mb-2">URL attempted: ${e.target.src}</p>
                            <small class="text-muted">Try downloading the file instead.</small>
                          </div>
                        `;
                      }}
                      onLoad={() => {}}
                      style={{
                        maxWidth: "100%",
                        maxHeight: "60vh",
                        objectFit: "contain",
                      }}
                    />
                  </div>
                ) : isPdfFile(previewFile.file_name) ? (
                  <div>
                    <iframe
                      src={`${previewFile.file_url || `/storage/${previewFile.file_path}`}#toolbar=0`}
                      style={{ width: "100%", height: "60vh", border: "none" }}
                      title={previewFile.file_name}
                      onError={(e) => {
                        toast.error(
                          "Failed to load PDF - try downloading instead",
                        );
                      }}
                    />
                  </div>
                ) : (
                  <div className="alert alert-info m-0">
                    <h6 className="alert-heading">
                      <strong>{previewFile.file_name}</strong>
                    </h6>
                    <p className="mb-3 text-muted">
                      This file type cannot be previewed in the browser. Click
                      the button below to download and view with your default
                      application.
                    </p>
                    <button
                      className="btn btn-primary"
                      onClick={() => handleDownloadFile(previewFile)}
                    >
                      <FiDownload
                        className="me-2"
                        style={{ display: "inline" }}
                      />
                      Download to View
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
