import { useState, useEffect, useCallback } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "react-toastify";
import { useAuth } from "../../contexts/AuthContext";
import StudentServices from "../../services/StudentServices.jsx";
import StudentRecordServices from "../../services/StudentRecordServices.jsx";
import {
  FiMenu,
  FiPlus,
  FiEdit2,
  FiTrash2,
  FiSearch,
  FiFileText,
  FiUpload,
  FiDownload,
  FiPaperclip,
  FiUser,
  FiX,
  FiFile,
  FiImage,
  FiEye,
} from "react-icons/fi";
import Sidebar from "../adminLayout/Sidebar";
import { formatDate } from "../../utils/index.jsx";
import { validateSpecialCharacters } from "../../utils/validation.js";

// Record type config mapping URL slug to labels
const RECORD_TYPE_CONFIG = {
  tor: { label: "Transcript of Records (TOR)", short: "TOR" },
  "special-order": { label: "Special Order", short: "Special Order" },
  psa: { label: "PSA", short: "PSA" },
  "comprehensive-exam": {
    label: "Comprehensive Exam",
    short: "Comprehensive Exam",
  },
  diploma: { label: "Diploma", short: "Diploma" },
  // Enrollment list removed
};

// Format file size for display
function formatFileSize(bytes) {
  if (!bytes) return "";
  if (bytes < 1024) return bytes + " B";
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
  return (bytes / (1024 * 1024)).toFixed(1) + " MB";
}

// Check if a file is an image by name or type
function isImageFile(fileNameOrType) {
  if (!fileNameOrType) return false;
  const str = fileNameOrType.toLowerCase();
  return (
    str.startsWith("image/") || /\.(jpg|jpeg|png|gif|bmp|webp|svg)$/i.test(str)
  );
}

// Check if a file is a PDF
function isPdfFile(fileNameOrType) {
  if (!fileNameOrType) return false;
  const str = fileNameOrType.toLowerCase();
  return str === "application/pdf" || /\.pdf$/i.test(str);
}

// Get file type info for display (icon and label)
function getFileTypeInfo(fileName, fileType) {
  if (isImageFile(fileName) || isImageFile(fileType)) {
    return { icon: FiImage, label: "Image", color: "text-success" };
  }
  if (isPdfFile(fileName) || isPdfFile(fileType)) {
    return { icon: FiFileText, label: "PDF", color: "text-danger" };
  }
  const ext = (fileName || "").split(".").pop().toLowerCase();
  if (["doc", "docx"].includes(ext)) {
    return { icon: FiFileText, label: "Word Document", color: "text-primary" };
  }
  if (["xls", "xlsx"].includes(ext)) {
    return { icon: FiFileText, label: "Spreadsheet", color: "text-success" };
  }
  return { icon: FiFile, label: "File", color: "text-secondary" };
}

export default function RecordManagement() {
  const { recordType } = useParams();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [sidebarVisible, setSidebarVisible] = useState(true);

  const isUnifiedView = !recordType; // No recordType param means unified view
  const typeConfig = recordType
    ? RECORD_TYPE_CONFIG[recordType]
    : { label: "All Records", short: "Record" };

  // Records data
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    lastPage: 1,
    total: 0,
    perPage: 10,
  });

  // Search and filters
  const [studentSearch, setStudentSearch] = useState("");
  const [recordTypeFilter, setRecordTypeFilter] = useState("");

  // Student search for form (modal)
  const [modalStudentSearch, setModalStudentSearch] = useState("");
  const [studentResults, setStudentResults] = useState([]);
  const [searchingStudents, setSearchingStudents] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);

  // Modal state
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState("create");
  const [formErrors, setFormErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [editingRecordId, setEditingRecordId] = useState(null);
  const [modalRecordType, setModalRecordType] = useState(recordType || "tor"); // Default to TOR

  // Multi-file state
  const [newFiles, setNewFiles] = useState([]);
  const [existingFiles, setExistingFiles] = useState([]);
  const [removeFileIds, setRemoveFileIds] = useState([]);

  // View modal
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState(null);

  // Delete modal
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [recordToDelete, setRecordToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);

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

  // Fetch records
  const fetchRecords = useCallback(
    async (page = 1) => {
      setLoading(true);
      try {
        let allRecords = [];
        let totalRecords = 0;

        if (isUnifiedView) {
          // In unified view, fetch all record types
          const recordTypes = Object.keys(RECORD_TYPE_CONFIG);
          const resultsPerType = 100; // Fetch more records to filter client-side

          const promises = recordTypes.map((type) =>
            StudentRecordServices.getRecordsByType(type, {
              page: 1,
              per_page: resultsPerType,
            }).catch(() => ({ success: false, data: { data: [] } })),
          );

          const responses = await Promise.all(promises);
          responses.forEach((res) => {
            if (res.success && res.data.data) {
              allRecords = [...allRecords, ...res.data.data];
            }
          });

          // Apply filters
          if (recordTypeFilter) {
            allRecords = allRecords.filter(
              (r) => r.record_type === recordTypeFilter,
            );
          }
          if (studentSearch) {
            const search = studentSearch.toLowerCase();
            allRecords = allRecords.filter(
              (r) =>
                r.student?.student_id?.toLowerCase().includes(search) ||
                r.student?.firstname?.toLowerCase().includes(search) ||
                r.student?.lastname?.toLowerCase().includes(search) ||
                `${r.student?.firstname} ${r.student?.lastname}`
                  .toLowerCase()
                  .includes(search),
            );
          }

          totalRecords = allRecords.length;
          const startIdx = (page - 1) * pagination.perPage;
          const endIdx = startIdx + pagination.perPage;
          allRecords = allRecords.slice(startIdx, endIdx);
        } else {
          // Type-specific view
          const params = {
            page,
            per_page: pagination.perPage,
          };

          if (studentSearch) {
            // Search by student ID or name - send to backend
            params.search = studentSearch;
          }

          const response = await StudentRecordServices.getRecordsByType(
            recordType,
            params,
          );
          if (response.success) {
            allRecords = response.data.data;
            totalRecords = response.data.total;
            setPagination({
              currentPage: response.data.current_page,
              lastPage: response.data.last_page,
              total: response.data.total,
              perPage: response.data.per_page,
            });
            setRecords(allRecords);
            setLoading(false);
            return;
          }
        }

        setRecords(allRecords);
        const lastPage = Math.ceil(totalRecords / pagination.perPage);
        setPagination({
          currentPage: page,
          lastPage,
          total: totalRecords,
          perPage: pagination.perPage,
        });
      } catch (error) {
        console.error("Failed to fetch records:", error);
        toast.error("Failed to fetch records");
      } finally {
        setLoading(false);
      }
    },
    [
      isUnifiedView,
      recordType,
      recordTypeFilter,
      studentSearch,
      pagination.perPage,
    ],
  );

  useEffect(() => {
    fetchRecords(1);
  }, [
    isUnifiedView,
    recordType,
    recordTypeFilter,
    studentSearch,
    fetchRecords,
  ]);

  // Search students for the student selector in modal
  useEffect(() => {
    if (!modalStudentSearch || modalStudentSearch.length < 2) {
      setStudentResults([]);
      return;
    }
    const timer = setTimeout(async () => {
      setSearchingStudents(true);
      try {
        const res = await StudentServices.getStudents({
          search: modalStudentSearch,
          per_page: 10,
        });
        if (res.success) {
          setStudentResults(res.data.data);
        }
      } catch {
        setStudentResults([]);
      } finally {
        setSearchingStudents(false);
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [modalStudentSearch]);

  // Open create modal
  const openCreateModal = () => {
    setModalMode("create");
    setFormErrors({});
    setEditingRecordId(null);
    setSelectedStudent(null);
    setModalStudentSearch("");
    setStudentResults([]);
    setModalRecordType(recordType || "tor"); // Set to current type or default to TOR
    setNewFiles([]);
    setExistingFiles([]);
    setRemoveFileIds([]);
    setShowModal(true);
  };

  // Open edit modal
  const openEditModal = (record) => {
    setModalMode("edit");
    setFormErrors({});
    setEditingRecordId(record.id);
    setSelectedStudent(record.student || null);
    setModalStudentSearch("");
    setStudentResults([]);
    setModalRecordType(record.record_type || recordType || "tor"); // Set to record's type or current type
    setExistingFiles(record.files || []);
    setNewFiles([]);
    setRemoveFileIds([]);

    setShowModal(true);
  };

  // Handle multi-file input
  const handleFilesChange = (e) => {
    const selected = Array.from(e.target.files);
    const keptExisting = existingFiles.filter(
      (f) => !removeFileIds.includes(f.id),
    ).length;
    const totalAllowed = 5 - keptExisting;

    if (selected.length + newFiles.length > totalAllowed) {
      toast.warning(
        `You can add up to ${totalAllowed - newFiles.length} more file(s). Maximum 5 total.`,
      );
      return;
    }

    setNewFiles((prev) => [...prev, ...selected]);
    if (formErrors.files) {
      setFormErrors((prev) => ({ ...prev, files: null }));
    }
    // Reset input so user can add again
    e.target.value = "";
  };

  // Remove a newly added file
  const removeNewFile = (index) => {
    setNewFiles((prev) => prev.filter((_, i) => i !== index));
  };

  // Mark an existing file for removal
  const markExistingFileForRemoval = (fileId) => {
    setRemoveFileIds((prev) => [...prev, fileId]);
  };

  // Undo removal of an existing file
  const undoRemoveExistingFile = (fileId) => {
    setRemoveFileIds((prev) => prev.filter((id) => id !== fileId));
  };

  // Select student from dropdown
  const handleSelectStudent = (student) => {
    setSelectedStudent(student);
    setModalStudentSearch("");
    setStudentResults([]);
    if (formErrors.student_id) {
      setFormErrors((prev) => ({ ...prev, student_id: null }));
    }
  };

  // Clear selected student
  const handleClearStudent = () => {
    setSelectedStudent(null);
    setModalStudentSearch("");
  };

  // Validate form
  const validateForm = () => {
    const errors = {};
    if (!selectedStudent) errors.student_id = "Student is required";

    const keptExisting = existingFiles.filter(
      (f) => !removeFileIds.includes(f.id),
    ).length;
    const totalFiles = keptExisting + newFiles.length;
    if (totalFiles < 1) {
      errors.files = "At least 1 file is required";
    }
    if (totalFiles > 5) {
      errors.files = "Maximum 5 files allowed";
    }

    return errors;
  };

  // Submit form
  const handleSubmit = async (e) => {
    e.preventDefault();
    const errors = validateForm();
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    setSubmitting(true);
    try {
      const data = {
        student_id: selectedStudent.id,
        files: newFiles,
      };

      if (modalMode === "create") {
        const response = await StudentRecordServices.createRecordByType(
          modalRecordType,
          data,
        );
        if (response.success) {
          toast.success("Record created successfully");
          setShowModal(false);
          fetchRecords(pagination.currentPage);
        }
      } else {
        data.remove_file_ids = removeFileIds;
        const response = await StudentRecordServices.updateRecordByType(
          modalRecordType,
          editingRecordId,
          data,
        );
        if (response.success) {
          toast.success("Record updated successfully");
          setShowModal(false);
          fetchRecords(pagination.currentPage);
        }
      }
    } catch (error) {
      const serverErrors = error.response?.data?.errors;
      if (serverErrors) {
        setFormErrors(serverErrors);
      } else {
        toast.error(error.response?.data?.message || "Failed to save record");
      }
    } finally {
      setSubmitting(false);
    }
  };

  // View record
  const handleViewRecord = (record) => {
    setSelectedRecord(record);
    setShowViewModal(true);
  };

  // Delete record
  const handleDeleteClick = (record) => {
    setRecordToDelete(record);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    if (!recordToDelete) return;
    setDeleting(true);
    try {
      const response = await StudentRecordServices.deleteRecordByType(
        recordToDelete.record_type,
        recordToDelete.id,
      );
      if (response.success) {
        toast.success("Record deleted successfully");
        setShowDeleteModal(false);
        setRecordToDelete(null);
        fetchRecords(pagination.currentPage);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to delete record");
    } finally {
      setDeleting(false);
    }
  };

  // Download file
  const handleDownload = (url) => {
    if (url) {
      window.open(url, "_blank");
    }
  };

  // Pagination
  const handlePageChange = (page) => {
    if (page >= 1 && page <= pagination.lastPage) {
      fetchRecords(page);
    }
  };

  if (!typeConfig) {
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
            <h2>Invalid record type</h2>
          </div>
        </div>
      </>
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
          <span className="fw-semibold">
            {isUnifiedView ? "All Records" : typeConfig?.label}
          </span>
        </div>

        {/* Main Content */}
        <div className="container-fluid p-4">
          {/* Header */}
          <div className="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-2">
            <div>
              <h1 className="h3 mb-1">
                {isUnifiedView ? "All Records" : typeConfig?.label}
              </h1>
              <p className="text-muted mb-0">
                {isUnifiedView
                  ? "Manage all student records"
                  : `Manage ${typeConfig?.short.toLowerCase()} records across all students`}
              </p>
            </div>
            <button
              className="btn btn-success d-flex align-items-center gap-2"
              onClick={openCreateModal}
            >
              <FiPlus size={18} />
              Add Record
            </button>
          </div>

          {/* Search and Filter Bar */}
          <div className="card border-0 shadow-sm mb-4">
            <div className="card-body">
              <div className="row g-3">
                <div className="col-md-12 col-lg-6">
                  <div className="input-group">
                    <span className="input-group-text bg-white">
                      <FiSearch size={16} />
                    </span>
                    <input
                      type="text"
                      className="form-control border-start-0"
                      placeholder="Search by student name or ID..."
                      value={studentSearch}
                      onChange={(e) => {
                        const value = e.target.value;
                        // Validate special characters
                        const validation = validateSpecialCharacters(value, [
                          "-",
                          " ",
                        ]);
                        if (!validation.isValid) {
                          toast.error(validation.message);
                          return;
                        }
                        setStudentSearch(value);
                      }}
                    />
                  </div>
                </div>

                {isUnifiedView && (
                  <>
                    <div className="col-md-6 col-lg-4">
                      <select
                        className="form-select"
                        value={recordTypeFilter}
                        onChange={(e) => setRecordTypeFilter(e.target.value)}
                      >
                        <option value="">All Record Types</option>
                        <option value="tor">Transcript of Records (TOR)</option>
                        <option value="special-order">Special Order</option>
                        <option value="psa">PSA</option>
                        <option value="comprehensive-exam">
                          Comprehensive Exam
                        </option>
                        <option value="diploma">Diploma</option>
                      </select>
                    </div>
                  </>
                )}

                <div className="col-md-12 col-lg-auto ms-lg-auto">
                  <span className="text-muted">
                    {pagination.total} record{pagination.total !== 1 && "s"}{" "}
                    found
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
                  <div className="spinner-border text-success" role="status">
                    <span className="visually-hidden">Loading...</span>
                  </div>
                </div>
              ) : records.length === 0 ? (
                <div className="text-center py-5">
                  <FiFileText size={48} className="text-muted mb-3" />
                  <h5 className="text-muted">No records found</h5>
                  <p className="text-muted">
                    {search
                      ? "Try adjusting your search terms"
                      : `No ${typeConfig.short.toLowerCase()} records have been added yet`}
                  </p>
                </div>
              ) : (
                <div className="table-responsive">
                  <table className="table table-hover align-middle mb-0">
                    <thead className="table-light">
                      <tr>
                        <th>Student</th>
                        <th>Record Type</th>
                        <th>Files</th>
                        <th>Created</th>
                        <th style={{ width: "120px" }}>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {records.map((record) => (
                        <tr key={record.id}>
                          <td>
                            <button
                              className="btn btn-link p-0 text-decoration-none text-start"
                              onClick={() => handleViewRecord(record)}
                            >
                              {record.student ? (
                                <div>
                                  <div className="fw-semibold">
                                    {record.student.firstname}{" "}
                                    {record.student.lastname}
                                  </div>
                                  <small className="text-muted">
                                    {record.student.student_id} &mdash;{" "}
                                    {record.student.course}
                                  </small>
                                </div>
                              ) : (
                                <span className="text-muted">-</span>
                              )}
                            </button>
                          </td>
                          <td>
                            <span className="badge bg-info">
                              {RECORD_TYPE_CONFIG[record.record_type]?.short ||
                                record.record_type}
                            </span>
                          </td>
                          <td>
                            {record.files && record.files.length > 0 ? (
                              <div className="d-flex align-items-center gap-1">
                                <FiPaperclip size={14} />
                                <small>
                                  {record.files.length} file
                                  {record.files.length !== 1 && "s"}
                                </small>
                              </div>
                            ) : (
                              <span className="text-muted">-</span>
                            )}
                          </td>
                          <td>
                            <small className="text-muted">
                              {formatDate(record.created_at)}
                            </small>
                          </td>
                          <td>
                            <div className="d-flex gap-1">
                              <button
                                className="btn btn-sm btn-outline-warning"
                                onClick={() => openEditModal(record)}
                                title="Edit"
                              >
                                <FiEdit2 size={14} />
                              </button>
                              <button
                                className="btn btn-sm btn-outline-danger"
                                onClick={() => handleDeleteClick(record)}
                                title="Delete"
                              >
                                <FiTrash2 size={14} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* Pagination */}
            {pagination.lastPage > 1 && (
              <div className="card-footer bg-white d-flex justify-content-between align-items-center">
                <small className="text-muted">
                  Showing{" "}
                  {(pagination.currentPage - 1) * pagination.perPage + 1}-{" "}
                  {Math.min(
                    pagination.currentPage * pagination.perPage,
                    pagination.total,
                  )}{" "}
                  of {pagination.total}
                </small>
                <nav>
                  <ul className="pagination pagination-sm mb-0">
                    <li
                      className={`page-item ${pagination.currentPage === 1 ? "disabled" : ""}`}
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
                            className={`page-link ${page === pagination.currentPage ? "active" : ""}`}
                            onClick={() => handlePageChange(page)}
                          >
                            {page}
                          </button>
                        </li>
                      ))}
                    <li
                      className={`page-item ${pagination.currentPage === pagination.lastPage ? "disabled" : ""}`}
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
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Create/Edit Modal */}
      {showModal && (
        <div
          className="modal fade show d-block"
          style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
        >
          <div className="modal-dialog modal-lg modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">
                  {modalMode === "create" ? "Add" : "Edit"} Record
                  {!isUnifiedView && ` - ${typeConfig.short}`}
                </h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setShowModal(false)}
                />
              </div>
              <form onSubmit={handleSubmit}>
                <div className="modal-body">
                  {/* Record Type Selector (unified view only) */}
                  {isUnifiedView && (
                    <div className="mb-3">
                      <label className="form-label fw-semibold">
                        Record Type <span className="text-danger">*</span>
                      </label>
                      <select
                        className="form-select"
                        value={modalRecordType}
                        onChange={(e) => setModalRecordType(e.target.value)}
                        disabled={modalMode === "edit"}
                      >
                        <option value="tor">Transcript of Records (TOR)</option>
                        <option value="special-order">Special Order</option>
                        <option value="psa">PSA</option>
                        <option value="comprehensive-exam">
                          Comprehensive Exam
                        </option>
                        <option value="diploma">Diploma</option>
                      </select>
                    </div>
                  )}
                  {/* Student Selector (always shown) */}
                  <div className="mb-3">
                    <label className="form-label fw-semibold">
                      Student <span className="text-danger">*</span>
                    </label>
                    {selectedStudent ? (
                      <div className="d-flex align-items-center gap-2 p-2 border rounded bg-light">
                        <FiUser size={16} />
                        <div className="flex-grow-1">
                          <div className="fw-semibold">
                            {selectedStudent.firstname}{" "}
                            {selectedStudent.middlename
                              ? selectedStudent.middlename + " "
                              : ""}
                            {selectedStudent.lastname}
                          </div>
                          <small className="text-muted">
                            {selectedStudent.student_id} &mdash;{" "}
                            {selectedStudent.course}
                          </small>
                        </div>
                        <button
                          type="button"
                          className="btn btn-sm btn-outline-secondary"
                          onClick={handleClearStudent}
                        >
                          <FiX size={14} />
                        </button>
                      </div>
                    ) : (
                      <div className="position-relative">
                        <input
                          type="text"
                          className={`form-control ${formErrors.student_id ? "is-invalid" : ""}`}
                          placeholder="Search student by name or ID..."
                          value={modalStudentSearch}
                          onChange={(e) => {
                            const value = e.target.value;
                            // Validate special characters
                            const validation = validateSpecialCharacters(
                              value,
                              ["-", " "],
                            );
                            if (!validation.isValid) {
                              toast.error(validation.message);
                              return;
                            }
                            setModalStudentSearch(value);
                          }}
                          autoComplete="off"
                        />
                        {formErrors.student_id && (
                          <div className="invalid-feedback">
                            {formErrors.student_id}
                          </div>
                        )}
                        {(studentResults.length > 0 || searchingStudents) && (
                          <div
                            className="position-absolute w-100 bg-white border rounded shadow-sm mt-1"
                            style={{
                              zIndex: 1050,
                              maxHeight: "200px",
                              overflowY: "auto",
                            }}
                          >
                            {searchingStudents ? (
                              <div className="p-2 text-center text-muted">
                                <span
                                  className="spinner-border spinner-border-sm me-2"
                                  role="status"
                                />
                                Searching...
                              </div>
                            ) : (
                              studentResults.map((s) => (
                                <button
                                  key={s.id}
                                  type="button"
                                  className="btn btn-light w-100 text-start border-0 rounded-0 py-2 px-3"
                                  onClick={() => handleSelectStudent(s)}
                                >
                                  <div className="fw-semibold">
                                    {s.firstname}{" "}
                                    {s.middlename ? s.middlename + " " : ""}
                                    {s.lastname}
                                  </div>
                                  <small className="text-muted">
                                    {s.student_id} &mdash; {s.course}
                                  </small>
                                </button>
                              ))
                            )}
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Multi-file upload */}
                  <div className="mb-3">
                    <label className="form-label fw-semibold">
                      <FiUpload size={14} className="me-1" />
                      Attach Files <span className="text-danger">*</span>
                      <small className="text-muted fw-normal ms-2">
                        (1-5 files, max 10MB each)
                      </small>
                    </label>

                    {/* Existing files (edit mode) */}
                    {existingFiles.length > 0 && (
                      <div className="mb-2">
                        <small className="text-muted d-block mb-1">
                          Current files:
                        </small>
                        {existingFiles.map((file) => {
                          const isRemoved = removeFileIds.includes(file.id);
                          const isImage =
                            isImageFile(file.file_name) ||
                            isImageFile(file.file_type);
                          return (
                            <div
                              key={file.id}
                              className={`p-2 border rounded mb-1 ${isRemoved ? "bg-danger bg-opacity-10 border-danger" : "bg-light"}`}
                            >
                              {isImage && file.file_url && !isRemoved && (
                                <div className="mb-2">
                                  <img
                                    src={file.file_url}
                                    alt={file.file_name}
                                    className="rounded border"
                                    style={{
                                      maxWidth: "100%",
                                      maxHeight: 120,
                                      objectFit: "cover",
                                    }}
                                  />
                                </div>
                              )}
                              <div className="d-flex align-items-center gap-2">
                                <FiPaperclip size={14} />
                                <div className="flex-grow-1">
                                  <small
                                    className={
                                      isRemoved
                                        ? "text-decoration-line-through text-muted"
                                        : ""
                                    }
                                  >
                                    {file.file_name}
                                  </small>
                                  <small className="text-muted ms-2">
                                    {formatFileSize(file.file_size)}
                                  </small>
                                </div>
                                {isRemoved ? (
                                  <button
                                    type="button"
                                    className="btn btn-sm btn-outline-success"
                                    onClick={() =>
                                      undoRemoveExistingFile(file.id)
                                    }
                                    title="Undo removal"
                                  >
                                    Undo
                                  </button>
                                ) : (
                                  <button
                                    type="button"
                                    className="btn btn-sm btn-outline-danger"
                                    onClick={() =>
                                      markExistingFileForRemoval(file.id)
                                    }
                                    title="Remove file"
                                  >
                                    <FiX size={14} />
                                  </button>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}

                    {/* New files added */}
                    {newFiles.length > 0 && (
                      <div className="mb-2">
                        <small className="text-muted d-block mb-1">
                          New files to upload:
                        </small>
                        {newFiles.map((file, idx) => {
                          const isImage =
                            isImageFile(file.type) || isImageFile(file.name);
                          return (
                            <div
                              key={idx}
                              className="p-2 border rounded mb-1 bg-success bg-opacity-10"
                            >
                              {isImage && (
                                <div className="mb-2">
                                  <img
                                    src={URL.createObjectURL(file)}
                                    alt={file.name}
                                    className="rounded border"
                                    style={{
                                      maxWidth: "100%",
                                      maxHeight: 120,
                                      objectFit: "cover",
                                    }}
                                    onLoad={(e) =>
                                      URL.revokeObjectURL(e.target.src)
                                    }
                                  />
                                </div>
                              )}
                              <div className="d-flex align-items-center gap-2">
                                <FiPaperclip size={14} />
                                <div className="flex-grow-1">
                                  <small>{file.name}</small>
                                  <small className="text-muted ms-2">
                                    {formatFileSize(file.size)}
                                  </small>
                                </div>
                                <button
                                  type="button"
                                  className="btn btn-sm btn-outline-danger"
                                  onClick={() => removeNewFile(idx)}
                                  title="Remove"
                                >
                                  <FiX size={14} />
                                </button>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}

                    {/* File input */}
                    {(() => {
                      const keptExisting = existingFiles.filter(
                        (f) => !removeFileIds.includes(f.id),
                      ).length;
                      const total = keptExisting + newFiles.length;
                      return total < 5 ? (
                        <input
                          type="file"
                          className={`form-control ${formErrors.files ? "is-invalid" : ""}`}
                          onChange={handleFilesChange}
                          accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.xls,.xlsx"
                          multiple
                        />
                      ) : (
                        <div className="text-muted small">
                          Maximum 5 files reached.
                        </div>
                      );
                    })()}
                    {formErrors.files && (
                      <div className="text-danger small mt-1">
                        {Array.isArray(formErrors.files)
                          ? formErrors.files[0]
                          : formErrors.files}
                      </div>
                    )}
                    <small className="text-muted">
                      PDF, DOC, images, spreadsheets accepted.
                    </small>
                  </div>
                </div>
                <div className="modal-footer">
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={() => setShowModal(false)}
                    disabled={submitting}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="btn btn-success d-flex align-items-center gap-2"
                    disabled={submitting}
                  >
                    {submitting && (
                      <span
                        className="spinner-border spinner-border-sm"
                        role="status"
                      />
                    )}
                    {modalMode === "create" ? "Create Record" : "Update Record"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* View Modal */}
      {showViewModal && selectedRecord && (
        <div
          className="modal fade show d-block"
          style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
        >
          <div className="modal-dialog modal-lg modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Record Details</h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setShowViewModal(false)}
                />
              </div>
              <div className="modal-body">
                <div className="row g-3">
                  <div className="col-12">
                    <span className="badge bg-success">
                      {selectedRecord.record_type
                        ? RECORD_TYPE_CONFIG[selectedRecord.record_type]?.label
                        : typeConfig.short}
                    </span>
                  </div>

                  {selectedRecord.student && (
                    <div className="col-12">
                      <label className="form-label fw-semibold text-muted small">
                        Student
                      </label>
                      <div className="d-flex align-items-center gap-2">
                        <FiUser size={16} />
                        <div>
                          <div className="fw-semibold">
                            {selectedRecord.student.firstname}{" "}
                            {selectedRecord.student.lastname}
                          </div>
                          <small className="text-muted">
                            {selectedRecord.student.student_id} &mdash;{" "}
                            {selectedRecord.student.course}
                          </small>
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="col-12">
                    <label className="form-label fw-semibold text-muted small">
                      Created
                    </label>
                    <p className="mb-0">
                      {formatDate(selectedRecord.created_at)}
                    </p>
                  </div>

                  {/* File attachments */}
                  {selectedRecord.files && selectedRecord.files.length > 0 && (
                    <div className="col-12">
                      <label className="form-label fw-semibold text-muted small">
                        Attachments ({selectedRecord.files.length})
                      </label>
                      {selectedRecord.files.map((file) => {
                        const isImage =
                          isImageFile(file.file_name) ||
                          isImageFile(file.file_type);
                        const isPdf =
                          isPdfFile(file.file_name) ||
                          isPdfFile(file.file_type);
                        const typeInfo = getFileTypeInfo(
                          file.file_name,
                          file.file_type,
                        );
                        const TypeIcon = typeInfo.icon;
                        return (
                          <div
                            key={file.id}
                            className="p-2 border rounded bg-light mb-2"
                          >
                            {/* Image preview */}
                            {isImage && file.file_url && (
                              <div className="mb-2 text-center">
                                <img
                                  src={file.file_url}
                                  alt={file.file_name}
                                  className="rounded border"
                                  style={{
                                    maxWidth: "100%",
                                    maxHeight: 300,
                                    objectFit: "contain",
                                    cursor: "pointer",
                                  }}
                                  onClick={() => handleDownload(file.file_url)}
                                  title="Click to open full image"
                                />
                              </div>
                            )}
                            {/* PDF preview */}
                            {isPdf && file.file_url && (
                              <div
                                className="mb-2"
                                style={{
                                  width: "100%",
                                  height: 400,
                                  overflow: "hidden",
                                  borderRadius: 8,
                                  border: "1px solid #dee2e6",
                                }}
                              >
                                <iframe
                                  src={file.file_url}
                                  title={file.file_name}
                                  style={{
                                    width: "100%",
                                    height: "100%",
                                    border: "none",
                                  }}
                                />
                              </div>
                            )}
                            {/* Non-previewable file placeholder */}
                            {!isImage && !isPdf && file.file_url && (
                              <div
                                className="mb-2 d-flex flex-column align-items-center justify-content-center py-4 bg-white rounded border"
                                style={{ cursor: "pointer" }}
                                onClick={() => handleDownload(file.file_url)}
                                title="Click to open file"
                              >
                                <TypeIcon
                                  size={40}
                                  className={typeInfo.color}
                                />
                                <small
                                  className={`mt-1 fw-semibold ${typeInfo.color}`}
                                >
                                  {typeInfo.label}
                                </small>
                                <small className="text-muted mt-1">
                                  <FiEye size={12} className="me-1" />
                                  Click to open
                                </small>
                              </div>
                            )}
                            <div className="d-flex align-items-center gap-2">
                              <TypeIcon size={16} className={typeInfo.color} />
                              <div className="flex-grow-1">
                                <div>{file.file_name}</div>
                                <small className="text-muted">
                                  {formatFileSize(file.file_size)}
                                  <span className="ms-2 badge bg-light text-dark border">
                                    {typeInfo.label}
                                  </span>
                                </small>
                              </div>
                              {file.file_url && (
                                <button
                                  className="btn btn-sm btn-primary d-flex align-items-center gap-1"
                                  onClick={() => handleDownload(file.file_url)}
                                >
                                  <FiDownload size={14} />
                                  Download
                                </button>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
              <div className="modal-footer">
                <button
                  className="btn btn-secondary"
                  onClick={() => setShowViewModal(false)}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && recordToDelete && (
        <div
          className="modal fade show d-block"
          style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
        >
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title text-danger">Delete Record</h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setShowDeleteModal(false)}
                />
              </div>
              <div className="modal-body">
                <p>
                  Are you sure you want to delete this{" "}
                  <strong>{typeConfig.short}</strong> record?
                </p>
                {recordToDelete.student && (
                  <p className="text-muted small">
                    Student: {recordToDelete.student.firstname}{" "}
                    {recordToDelete.student.lastname} (
                    {recordToDelete.student.student_id})
                  </p>
                )}
                {recordToDelete.files && recordToDelete.files.length > 0 && (
                  <p className="text-muted small">
                    {recordToDelete.files.length} file(s) will be deleted.
                  </p>
                )}
                <p className="text-danger small">
                  This action cannot be undone.
                </p>
              </div>
              <div className="modal-footer">
                <button
                  className="btn btn-secondary"
                  onClick={() => setShowDeleteModal(false)}
                  disabled={deleting}
                >
                  Cancel
                </button>
                <button
                  className="btn btn-danger d-flex align-items-center gap-2"
                  onClick={confirmDelete}
                  disabled={deleting}
                >
                  {deleting && (
                    <span
                      className="spinner-border spinner-border-sm"
                      role="status"
                    />
                  )}
                  Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
