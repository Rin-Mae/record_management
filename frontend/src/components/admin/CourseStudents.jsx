import { useState, useEffect, useCallback } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import { toast } from "react-toastify";
import { useAuth } from "../../contexts/AuthContext";
import StudentServices from "../../services/StudentServices.jsx";
import { getCourseInfo } from "./courseConfig.jsx";
import {
  FiMenu,
  FiPlus,
  FiEdit2,
  FiTrash2,
  FiSearch,
  FiMail,
  FiPhone,
  FiMapPin,
  FiCalendar,
  FiUser,
  FiBook,
  FiArrowLeft,
} from "react-icons/fi";
import Sidebar from "../adminLayout/Sidebar";
import {
  getGenderDisplay,
  formatDate,
  initialStudentForm,
} from "../../utils/index.jsx";

// Custom hook for course-specific student management
function useCourseStudents(courseCode, courseLabel) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [sidebarVisible, setSidebarVisible] = useState(true);

  // Data state
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    lastPage: 1,
    total: 0,
    perPage: 10,
  });

  // Search and filter state
  const [search, setSearch] = useState("");

  // Modal state
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState("create");
  const [formData, setFormData] = useState({
    ...initialStudentForm,
    course: courseCode,
  });
  const [formErrors, setFormErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  // View modal state
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);

  // Delete confirmation state
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [studentToDelete, setStudentToDelete] = useState(null);
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

  // Fetch students filtered by course
  const fetchStudents = useCallback(
    async (page = 1) => {
      setLoading(true);
      try {
        const params = {
          page,
          per_page: pagination.perPage,
          search: search || undefined,
          course: courseCode,
        };
        const response = await StudentServices.getStudents(params);
        if (response.success) {
          setStudents(response.data.data);
          setPagination({
            currentPage: response.data.current_page,
            lastPage: response.data.last_page,
            total: response.data.total,
            perPage: response.data.per_page,
          });
        }
      } catch (error) {
        console.error("Failed to fetch students:", error);
        toast.error("Failed to load students");
      } finally {
        setLoading(false);
      }
    },
    [search, pagination.perPage, courseCode],
  );

  useEffect(() => {
    if (courseCode) {
      fetchStudents();
    }
  }, [fetchStudents, courseCode]);

  // Handle search
  const handleSearch = (e) => {
    e.preventDefault();
    fetchStudents(1);
  };

  // Open create modal with course pre-filled
  const openCreateModal = () => {
    setFormData({ ...initialStudentForm, course: courseCode });
    setFormErrors({});
    setModalMode("create");
    setShowModal(true);
  };

  // Open edit modal
  const openEditModal = (student) => {
    setFormData({
      ...initialStudentForm,
      ...student,
      birthdate: student.birthdate ? student.birthdate.split("T")[0] : "",
      age: student.age || "",
      year_level: student.year_level || "",
    });
    setFormErrors({});
    setModalMode("edit");
    setShowModal(true);
  };

  // Open view modal
  const openViewModal = (student) => {
    setSelectedStudent(student);
    setShowViewModal(true);
  };

  // Close view modal
  const closeViewModal = () => {
    setShowViewModal(false);
    setSelectedStudent(null);
  };

  // Handle form input change
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (formErrors[name]) {
      setFormErrors((prev) => ({ ...prev, [name]: null }));
    }
  };

  // Handle form submit
  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setFormErrors({});

    try {
      const dataToSend = {
        ...formData,
        age: formData.age ? parseInt(formData.age) : null,
        year_level: formData.year_level ? parseInt(formData.year_level) : null,
        enrollment_list_id: formData.enrollment_list_id
          ? parseInt(formData.enrollment_list_id)
          : null,
        course: courseCode, // Always use the course from URL
      };

      if (modalMode === "create") {
        await StudentServices.createStudent(dataToSend);
        toast.success("Student created successfully");
      } else {
        await StudentServices.updateStudent(formData.id, dataToSend);
        toast.success("Student updated successfully");
      }

      setShowModal(false);
      fetchStudents(pagination.currentPage);
    } catch (error) {
      console.error("Form submission error:", error);
      if (error.response?.data?.errors) {
        setFormErrors(error.response.data.errors);
      } else {
        toast.error(error.response?.data?.message || "An error occurred");
      }
    } finally {
      setSubmitting(false);
    }
  };

  // Open delete confirmation
  const openDeleteModal = (student) => {
    setStudentToDelete(student);
    setShowDeleteModal(true);
  };

  // Handle delete
  const handleDelete = async () => {
    if (!studentToDelete) return;
    setDeleting(true);

    try {
      await StudentServices.deleteStudent(studentToDelete.id);
      toast.success("Student deleted successfully");
      setShowDeleteModal(false);
      setStudentToDelete(null);
      fetchStudents(pagination.currentPage);
    } catch (error) {
      console.error("Delete error:", error);
      toast.error("Failed to delete student");
    } finally {
      setDeleting(false);
    }
  };

  // Pagination handler
  const goToPage = (page) => {
    if (page >= 1 && page <= pagination.lastPage) {
      fetchStudents(page);
    }
  };

  return {
    // Auth & Layout
    user,
    sidebarVisible,
    setSidebarVisible,
    handleLogout,
    toggleSidebar,

    // Data
    students,
    loading,
    pagination,

    // Search & Filter
    search,
    setSearch,
    handleSearch,

    // Create/Edit Modal
    showModal,
    setShowModal,
    modalMode,
    formData,
    formErrors,
    submitting,
    openCreateModal,
    openEditModal,
    handleInputChange,
    handleSubmit,
    enrollmentOptions,
    loadingEnrollmentOptions,

    // View Modal
    showViewModal,
    selectedStudent,
    openViewModal,
    closeViewModal,

    // Delete Modal
    showDeleteModal,
    setShowDeleteModal,
    studentToDelete,
    deleting,
    openDeleteModal,
    handleDelete,

    // Pagination
    goToPage,
  };
}

// Main CourseStudents Component
export default function CourseStudents() {
  const { course, specialization } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  // Extract category from pathname (e.g., /admin/basic-education/elementary -> basic-education)
  const pathParts = location.pathname.split("/");
  const category = pathParts[2]; // ['', 'admin', 'basic-education', 'elementary']

  // Get course info from URL parameters
  const courseInfo = getCourseInfo(category, course, specialization);

  // If invalid course, show error
  if (!courseInfo) {
    return (
      <div className="min-vh-100 bg-light d-flex align-items-center justify-content-center">
        <div className="text-center">
          <h2 className="text-danger mb-3">Course Not Found</h2>
          <p className="text-muted mb-4">
            The requested course does not exist.
          </p>
          <button
            className="btn btn-success"
            onClick={() => navigate("/admin/dashboard")}
          >
            <FiArrowLeft className="me-2" />
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  const courseCode = courseInfo.code;
  const courseLabel = courseInfo.label;

  const {
    user,
    sidebarVisible,
    setSidebarVisible,
    handleLogout,
    toggleSidebar,
    students,
    loading,
    pagination,
    search,
    setSearch,
    handleSearch,
    showModal,
    setShowModal,
    modalMode,
    formData,
    formErrors,
    submitting,
    openCreateModal,
    openEditModal,
    handleInputChange,
    handleSubmit,
    enrollmentOptions,
    loadingEnrollmentOptions,
    showViewModal,
    selectedStudent,
    openViewModal,
    closeViewModal,
    showDeleteModal,
    setShowDeleteModal,
    studentToDelete,
    deleting,
    openDeleteModal,
    handleDelete,
    goToPage,
  } = useCourseStudents(courseCode, courseLabel);

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
          <span className="fw-semibold">Admin Panel</span>
        </div>

        {/* Main Content */}
        <div className="container-fluid p-4">
          {/* Breadcrumb */}
          <nav aria-label="breadcrumb" className="mb-3">
            <ol className="breadcrumb">
              <li className="breadcrumb-item">{courseInfo.categoryLabel}</li>
              {courseInfo.parentLabel && (
                <li className="breadcrumb-item">{courseInfo.parentLabel}</li>
              )}
              <li className="breadcrumb-item active" aria-current="page">
                {courseLabel}
              </li>
            </ol>
          </nav>

          {/* Header */}
          <div className="d-flex flex-wrap justify-content-between align-items-center mb-4">
            <div>
              <h1 className="h3 mb-1">{courseLabel}</h1>
              <p className="text-muted mb-0">
                <span className="badge bg-secondary me-2">{courseCode}</span>
                {courseInfo.track && (
                  <span className="badge bg-info">{courseInfo.track}</span>
                )}
              </p>
            </div>
            <button
              className="btn btn-success d-flex align-items-center gap-2"
              onClick={openCreateModal}
            >
              <FiPlus size={18} />
              Add Student
            </button>
          </div>

          {/* Search and Filter */}
          <div className="card mb-4">
            <div className="card-body">
              <form onSubmit={handleSearch} className="row g-3">
                <div className="col-md-10">
                  <div className="input-group">
                    <span className="input-group-text">
                      <FiSearch />
                    </span>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="Search by ID or Name"
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                    />
                  </div>
                </div>
                <div className="col-md-2">
                  <button type="submit" className="btn btn-success w-100">
                    Search
                  </button>
                </div>
              </form>
            </div>
          </div>

          {/* Students Table */}
          <div className="card">
            <div className="card-header bg-white d-flex justify-content-between align-items-center">
              <h5 className="mb-0">Students</h5>
              <span className="badge bg-success">{pagination.total} total</span>
            </div>
            <div className="card-body">
              {loading ? (
                <div className="text-center py-5">
                  <div className="spinner-border text-success" role="status">
                    <span className="visually-hidden">Loading...</span>
                  </div>
                </div>
              ) : students.length === 0 ? (
                <div className="text-center py-5 text-muted">
                  <FiUser size={48} className="mb-3 opacity-50" />
                  <p className="mb-0">No students found in this course</p>
                  <button
                    className="btn btn-outline-success mt-3"
                    onClick={openCreateModal}
                  >
                    <FiPlus className="me-2" />
                    Add First Student
                  </button>
                </div>
              ) : (
                <div className="table-responsive">
                  <table className="table table-hover align-middle">
                    <thead className="table-light">
                      <tr>
                        <th>Student ID</th>
                        <th>Name</th>
                        <th>Year Level</th>
                        <th className="text-end">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {students.map((student) => (
                        <tr
                          key={student.id}
                          onClick={() => openViewModal(student)}
                          style={{ cursor: "pointer" }}
                        >
                          <td className="fw-medium">{student.student_id}</td>
                          <td>
                            {student.firstname}{" "}
                            {student.middlename ? student.middlename + " " : ""}
                            {student.lastname}
                          </td>
                          <td>{student.year_level || "-"}</td>
                          <td>
                            <div
                              className="d-flex justify-content-end gap-2"
                              onClick={(e) => e.stopPropagation()}
                            >
                              <button
                                className="btn btn-sm btn-outline-primary"
                                onClick={() => openEditModal(student)}
                                title="Edit"
                              >
                                <FiEdit2 size={16} />
                              </button>
                              <button
                                className="btn btn-sm btn-outline-danger"
                                onClick={() => openDeleteModal(student)}
                                title="Delete"
                              >
                                <FiTrash2 size={16} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {/* Pagination */}
              {pagination.lastPage > 1 && (
                <nav className="mt-4">
                  <ul className="pagination justify-content-center mb-0">
                    <li
                      className={`page-item ${pagination.currentPage === 1 ? "disabled" : ""}`}
                    >
                      <button
                        className="page-link"
                        onClick={() => goToPage(pagination.currentPage - 1)}
                      >
                        Previous
                      </button>
                    </li>
                    {[...Array(pagination.lastPage)].map((_, i) => (
                      <li
                        key={i + 1}
                        className={`page-item ${pagination.currentPage === i + 1 ? "active" : ""}`}
                      >
                        <button
                          className="page-link"
                          onClick={() => goToPage(i + 1)}
                        >
                          {i + 1}
                        </button>
                      </li>
                    ))}
                    <li
                      className={`page-item ${pagination.currentPage === pagination.lastPage ? "disabled" : ""}`}
                    >
                      <button
                        className="page-link"
                        onClick={() => goToPage(pagination.currentPage + 1)}
                      >
                        Next
                      </button>
                    </li>
                  </ul>
                </nav>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Create/Edit Modal */}
      {showModal && (
        <div
          className="modal show d-block"
          tabIndex="-1"
          style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
        >
          <div className="modal-dialog modal-lg modal-dialog-centered modal-dialog-scrollable">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">
                  {modalMode === "create" ? "Add New Student" : "Edit Student"}
                </h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setShowModal(false)}
                ></button>
              </div>
              <form onSubmit={handleSubmit}>
                <div className="modal-body">
                  <div className="row g-3">
                    <div className="col-md-6">
                      <label className="form-label">Student ID *</label>
                      <input
                        type="text"
                        className={`form-control ${formErrors.student_id ? "is-invalid" : ""}`}
                        name="student_id"
                        value={formData.student_id}
                        onChange={handleInputChange}
                        required
                      />
                      {formErrors.student_id && (
                        <div className="invalid-feedback">
                          {formErrors.student_id}
                        </div>
                      )}
                    </div>
                    <div className="col-md-6">
                      <label className="form-label">Course</label>
                      <input
                        type="text"
                        className="form-control"
                        value={courseLabel}
                        disabled
                      />
                      <small className="text-muted">Code: {courseCode}</small>
                    </div>
                    <div className="col-md-4">
                      <label className="form-label">First Name *</label>
                      <input
                        type="text"
                        className={`form-control ${formErrors.firstname ? "is-invalid" : ""}`}
                        name="firstname"
                        value={formData.firstname}
                        onChange={handleInputChange}
                        required
                      />
                      {formErrors.firstname && (
                        <div className="invalid-feedback">
                          {formErrors.firstname}
                        </div>
                      )}
                    </div>
                    <div className="col-md-4">
                      <label className="form-label">Middle Name</label>
                      <input
                        type="text"
                        className="form-control"
                        name="middlename"
                        value={formData.middlename}
                        onChange={handleInputChange}
                      />
                    </div>
                    <div className="col-md-4">
                      <label className="form-label">Last Name *</label>
                      <input
                        type="text"
                        className={`form-control ${formErrors.lastname ? "is-invalid" : ""}`}
                        name="lastname"
                        value={formData.lastname}
                        onChange={handleInputChange}
                        required
                      />
                      {formErrors.lastname && (
                        <div className="invalid-feedback">
                          {formErrors.lastname}
                        </div>
                      )}
                    </div>
                    <div className="col-md-6">
                      <label className="form-label">
                        Email {modalMode === "create" ? "" : "*"}
                      </label>
                      <input
                        type="email"
                        className={`form-control ${formErrors.email ? "is-invalid" : ""}`}
                        name="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        required={modalMode !== "create"}
                      />
                      {formErrors.email && (
                        <div className="invalid-feedback">
                          {formErrors.email}
                        </div>
                      )}
                    </div>
                    <div className="col-md-3">
                      <label className="form-label">Gender</label>
                      <select
                        className="form-select"
                        name="gender"
                        value={formData.gender}
                        onChange={handleInputChange}
                      >
                        <option value="">Select</option>
                        <option value="male">Male</option>
                        <option value="female">Female</option>
                        <option value="other">Other</option>
                      </select>
                    </div>
                    <div className="col-md-3">
                      <label className="form-label">Year Level</label>
                      <input
                        type="number"
                        className="form-control"
                        name="year_level"
                        value={formData.year_level}
                        onChange={handleInputChange}
                        min="1"
                        max="10"
                      />
                    </div>
                    <div className="col-md-4">
                      <label className="form-label">Birthdate</label>
                      <input
                        type="date"
                        className="form-control"
                        name="birthdate"
                        value={formData.birthdate}
                        onChange={handleInputChange}
                      />
                    </div>
                    <div className="col-md-4">
                      <label className="form-label">Age</label>
                      <input
                        type="number"
                        className="form-control"
                        name="age"
                        value={formData.age}
                        onChange={handleInputChange}
                        min="1"
                        max="150"
                      />
                    </div>
                    <div className="col-md-4">
                      <label className="form-label">Contact Number</label>
                      <input
                        type="text"
                        className="form-control"
                        name="contact_number"
                        value={formData.contact_number}
                        onChange={handleInputChange}
                      />
                    </div>
                    <div className="col-md-8">
                      <label className="form-label">Address</label>
                      <input
                        type="text"
                        className="form-control"
                        name="address"
                        value={formData.address}
                        onChange={handleInputChange}
                      />
                    </div>
                  </div>
                </div>
                <div className="modal-footer">
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={() => setShowModal(false)}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="btn btn-success"
                    disabled={submitting}
                  >
                    {submitting ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-2"></span>
                        Saving...
                      </>
                    ) : modalMode === "create" ? (
                      "Create Student"
                    ) : (
                      "Update Student"
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* View Modal */}
      {showViewModal && selectedStudent && (
        <div
          className="modal show d-block"
          tabIndex="-1"
          style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
        >
          <div className="modal-dialog modal-lg modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Student Details</h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={closeViewModal}
                ></button>
              </div>
              <div className="modal-body">
                <div className="row g-3">
                  <div className="col-md-6">
                    <div className="d-flex align-items-center gap-2 text-muted mb-1">
                      <FiUser size={16} />
                      <small>Student ID</small>
                    </div>
                    <p className="fw-medium mb-0">
                      {selectedStudent.student_id}
                    </p>
                  </div>
                  <div className="col-md-6">
                    <div className="d-flex align-items-center gap-2 text-muted mb-1">
                      <FiBook size={16} />
                      <small>Course</small>
                    </div>
                    <p className="fw-medium mb-0">
                      {selectedStudent.course || courseCode}
                    </p>
                  </div>
                  <div className="col-12">
                    <div className="d-flex align-items-center gap-2 text-muted mb-1">
                      <FiUser size={16} />
                      <small>Full Name</small>
                    </div>
                    <p className="fw-medium mb-0">
                      {selectedStudent.firstname}{" "}
                      {selectedStudent.middlename
                        ? selectedStudent.middlename + " "
                        : ""}
                      {selectedStudent.lastname}
                    </p>
                  </div>
                  <div className="col-md-6">
                    <div className="d-flex align-items-center gap-2 text-muted mb-1">
                      <FiMail size={16} />
                      <small>Email</small>
                    </div>
                    <p className="fw-medium mb-0">
                      {selectedStudent.email || "-"}
                    </p>
                  </div>
                  <div className="col-md-6">
                    <div className="d-flex align-items-center gap-2 text-muted mb-1">
                      <FiPhone size={16} />
                      <small>Contact Number</small>
                    </div>
                    <p className="fw-medium mb-0">
                      {selectedStudent.contact_number || "-"}
                    </p>
                  </div>
                  <div className="col-md-4">
                    <div className="d-flex align-items-center gap-2 text-muted mb-1">
                      <small>Gender</small>
                    </div>
                    <p className="fw-medium mb-0">
                      {getGenderDisplay(selectedStudent.gender)}
                    </p>
                  </div>
                  <div className="col-md-4">
                    <div className="d-flex align-items-center gap-2 text-muted mb-1">
                      <FiCalendar size={16} />
                      <small>Birthdate</small>
                    </div>
                    <p className="fw-medium mb-0">
                      {formatDate(selectedStudent.birthdate)}
                    </p>
                  </div>
                  <div className="col-md-4">
                    <div className="d-flex align-items-center gap-2 text-muted mb-1">
                      <small>Age</small>
                    </div>
                    <p className="fw-medium mb-0">
                      {selectedStudent.age || "-"}
                    </p>
                  </div>
                  <div className="col-12">
                    <div className="d-flex align-items-center gap-2 text-muted mb-1">
                      <FiMapPin size={16} />
                      <small>Address</small>
                    </div>
                    <p className="fw-medium mb-0">
                      {selectedStudent.address || "-"}
                    </p>
                  </div>
                  <div className="col-md-6">
                    <div className="d-flex align-items-center gap-2 text-muted mb-1">
                      <small>Year Level</small>
                    </div>
                    <p className="fw-medium mb-0">
                      {selectedStudent.year_level || "-"}
                    </p>
                  </div>
                </div>
              </div>
              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-outline-primary"
                  onClick={() => {
                    closeViewModal();
                    openEditModal(selectedStudent);
                  }}
                >
                  <FiEdit2 className="me-2" />
                  Edit
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && studentToDelete && (
        <div
          className="modal show d-block"
          tabIndex="-1"
          style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
        >
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title text-danger">Delete Student</h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setShowDeleteModal(false)}
                ></button>
              </div>
              <div className="modal-body">
                <p>
                  Are you sure you want to delete{" "}
                  <strong>
                    {studentToDelete.firstname} {studentToDelete.lastname}
                  </strong>
                  ?
                </p>
                <p className="text-muted small mb-0">
                  This action cannot be undone.
                </p>
              </div>
              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setShowDeleteModal(false)}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  className="btn btn-danger"
                  onClick={handleDelete}
                  disabled={deleting}
                >
                  {deleting ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-2"></span>
                      Deleting...
                    </>
                  ) : (
                    "Delete"
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
