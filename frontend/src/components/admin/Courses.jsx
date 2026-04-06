import { useState, useEffect, useCallback } from "react";
import { useAuth } from "../../contexts/AuthContext";
import CourseServices from "../../services/CourseServices.jsx";
import { FiMenu, FiPlus, FiEdit2, FiTrash2, FiSearch } from "react-icons/fi";
import Sidebar from "../adminLayout/Sidebar";
import {
  validateCourseName,
  validateSpecialCharacters,
} from "../../utils/validation.js";

export default function Courses() {
  const { user, logout } = useAuth();
  const [sidebarVisible, setSidebarVisible] = useState(true);

  const handleLogout = async () => {
    try {
      await logout();
      window.location.href = "/login";
    } catch (err) {
      console.error("Logout failed:", err);
    }
  };

  // Courses data
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    lastPage: 1,
    total: 0,
    perPage: 10,
  });

  // Search and filters
  const [search, setSearch] = useState("");
  const [departmentFilter, setDepartmentFilter] = useState("");
  const [sortBy, setSortBy] = useState("code");
  const [sortOrder, setSortOrder] = useState("asc");

  // Modal states
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState("create");
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [formData, setFormData] = useState({
    code: "",
    name: "",
    department: "",
    description: "",
  });
  const [formErrors, setFormErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  // Delete confirmation modal
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [courseToDelete, setCourseToDelete] = useState(null);

  // Unique departments for filter
  const [departments, setDepartments] = useState([]);

  // Fetch courses
  const fetchCourses = useCallback(
    async (page = 1) => {
      setLoading(true);
      try {
        const response = await CourseServices.getCourses({
          page,
          per_page: pagination.perPage,
          search,
          department: departmentFilter,
          sort_by: sortBy,
          sort_order: sortOrder,
        });

        if (response.success) {
          setCourses(response.data.data);
          setPagination({
            currentPage: response.data.current_page,
            lastPage: response.data.last_page,
            total: response.data.total,
            perPage: response.data.per_page,
          });

          // Extract unique departments
          const uniqueDepts = [
            ...new Set(
              response.data.data.map((c) => c.department).filter(Boolean),
            ),
          ];
          setDepartments(uniqueDepts);
        }
      } catch (error) {
        window.showAlert("error", "Failed to fetch courses");
      } finally {
        setLoading(false);
      }
    },
    [search, departmentFilter, sortBy, sortOrder, pagination.perPage],
  );

  // Load initial data and debounce search/filters
  useEffect(() => {
    const debounceTimer = setTimeout(() => {
      fetchCourses(1);
    }, 500); // 500ms debounce delay

    return () => clearTimeout(debounceTimer);
  }, [search, departmentFilter, sortBy, sortOrder, fetchCourses]);

  // Handle input change with validation
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    let error = "";

    // Validate based on field type
    if (name === "code" && value) {
      const validation = validateSpecialCharacters(value, ["-"]);
      if (!validation.isValid) error = validation.message;
    } else if (name === "name" && value) {
      const validation = validateCourseName(value);
      if (!validation.isValid) error = validation.message;
    } else if (name === "department" && value) {
      const validation = validateSpecialCharacters(value, ["-", "&", "(", " "]);
      if (!validation.isValid) error = validation.message;
    } else if (name === "description" && value) {
      const validation = validateSpecialCharacters(value, ["-", ".", ",", " "]);
      if (!validation.isValid) error = validation.message;
    }

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Set or clear error for this field
    if (error) {
      setFormErrors((prev) => ({
        ...prev,
        [name]: error,
      }));
    } else if (formErrors[name]) {
      setFormErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }
  };

  // Open create modal
  const openCreateModal = () => {
    setFormData({
      code: "",
      name: "",
      department: "",
      description: "",
    });
    setFormErrors({});
    setModalMode("create");
    setSelectedCourse(null);
    setShowModal(true);
  };

  // Open edit modal
  const openEditModal = (course) => {
    setFormData({
      code: course.code,
      name: course.name,
      department: course.department || "",
      description: course.description || "",
    });
    setFormErrors({});
    setModalMode("edit");
    setSelectedCourse(course);
    setShowModal(true);
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setFormErrors({});

    try {
      if (modalMode === "create") {
        await CourseServices.createCourse(formData);
        window.showAlert("success", "Course created successfully");
      } else {
        await CourseServices.updateCourse(selectedCourse.id, formData);
        window.showAlert("success", "Course updated successfully");
      }

      setShowModal(false);
      fetchCourses();
    } catch (error) {
      const errors = error.response?.data?.errors || {};
      if (Object.keys(errors).length > 0) {
        setFormErrors(errors);
      } else {
        window.showAlert(
          "error",
          error.response?.data?.message || "Failed to save course",
        );
      }
    } finally {
      setSubmitting(false);
    }
  };

  // Handle delete click
  const handleDeleteClick = (course) => {
    setCourseToDelete(course);
    setShowDeleteModal(true);
  };

  // Confirm delete
  const confirmDelete = async () => {
    try {
      await CourseServices.deleteCourse(courseToDelete.id);
      window.showAlert("success", "Course deleted successfully");
      setShowDeleteModal(false);
      setCourseToDelete(null);
      fetchCourses();
    } catch (error) {
      window.showAlert(
        "error",
        error.response?.data?.message || "Failed to delete course",
      );
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
        {/* Mobile Header */}
        <div className="d-lg-none bg-dark text-white p-3 d-flex align-items-center">
          <button
            className="btn btn-outline-light btn-sm me-3"
            onClick={() => setSidebarVisible(!sidebarVisible)}
            aria-label="Toggle sidebar"
          >
            <FiMenu size={20} />
          </button>
          <span className="fw-semibold">Courses</span>
        </div>

        {/* Main Content */}
        <div className="container-fluid p-4">
          {/* Page header */}
          <div className="mb-4">
            <div className="d-flex justify-content-between align-items-center mb-3">
              <div>
                <h2 className="mb-1">Courses</h2>
                <p className="text-muted mb-0">
                  Manage courses from all departments
                </p>
              </div>
              <button
                className="btn btn-success d-flex align-items-center gap-2"
                onClick={openCreateModal}
              >
                <FiPlus size={16} />
                Add Course
              </button>
            </div>

            {/* Filters and Search */}
            <div className="card">
              <div className="card-body bg-success bg-opacity-10">
                <div className="row g-2">
                  {/* Search */}
                  <div className="col-12 col-md-8">
                    <div className="input-group">
                      <span className="input-group-text">
                        <FiSearch size={16} />
                      </span>
                      <input
                        type="text"
                        className="form-control"
                        placeholder="Search course..."
                        value={search}
                        onChange={(e) => {
                          const value = e.target.value;
                          // Validate special characters
                          const validation = validateSpecialCharacters(value, [
                            "-",
                            " ",
                          ]);
                          if (!validation.isValid) {
                            window.showAlert("error", validation.message);
                            return;
                          }
                          setSearch(value);
                          setPagination((p) => ({ ...p, currentPage: 1 }));
                        }}
                      />
                    </div>
                  </div>

                  {/* Department Filter */}
                  <div className="col-12 col-md-4">
                    <select
                      className="form-select"
                      value={departmentFilter}
                      onChange={(e) => {
                        setDepartmentFilter(e.target.value);
                        setPagination((p) => ({ ...p, currentPage: 1 }));
                      }}
                    >
                      <option value="">All Departments</option>
                      <option value="Basic Education Center">
                        Basic Education Center
                      </option>
                      <option value="Graduate Program">Graduate Program</option>
                      {departments
                        .filter(
                          (dept) =>
                            dept !== "Basic Education Center" &&
                            dept !== "Graduate Program",
                        )
                        .map((dept) => (
                          <option key={dept} value={dept}>
                            {dept}
                          </option>
                        ))}
                    </select>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Courses Table */}
          <div className="card">
            <div className="card-body p-0">
              {loading ? (
                <div className="text-center py-5">
                  <div className="spinner-border text-success" role="status">
                    <span className="visually-hidden">Loading...</span>
                  </div>
                </div>
              ) : courses.length === 0 ? (
                <div className="text-center py-5 text-muted">
                  <p>No courses found</p>
                </div>
              ) : (
                <div className="table-responsive">
                  <table className="table table-hover align-middle mb-0">
                    <thead className="table-success">
                      <tr>
                        <th>Code</th>
                        <th>Name</th>
                        <th>Department</th>
                        <th>Description</th>
                        <th style={{ width: "120px" }}>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {courses.map((course) => (
                        <tr key={course.id}>
                          <td>
                            <span className="badge btn btn-success">
                              {course.code}
                            </span>
                          </td>
                          <td className="fw-semibold">{course.name}</td>
                          <td>
                            <small className="text-muted">
                              {course.department || "-"}
                            </small>
                          </td>
                          <td>
                            <small className="text-muted">
                              {course.description
                                ? course.description.substring(0, 50) +
                                  (course.description.length > 50 ? "..." : "")
                                : "-"}
                            </small>
                          </td>
                          <td>
                            <div className="d-flex gap-1">
                              <button
                                className="btn btn-sm btn-outline-primary"
                                onClick={() => openEditModal(course)}
                                title="Edit"
                              >
                                <FiEdit2 size={14} />
                              </button>
                              <button
                                className="btn btn-sm btn-outline-danger"
                                onClick={() => handleDeleteClick(course)}
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
                  {(pagination.currentPage - 1) * pagination.perPage + 1}-
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
                        onClick={() => fetchCourses(pagination.currentPage - 1)}
                      >
                        Previous
                      </button>
                    </li>
                    {Array.from(
                      { length: pagination.lastPage },
                      (_, i) => i + 1,
                    ).map((page) => (
                      <li
                        key={page}
                        className={`page-item ${pagination.currentPage === page ? "active" : ""}`}
                      >
                        <button
                          className="page-link"
                          onClick={() => fetchCourses(page)}
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
                        onClick={() => fetchCourses(pagination.currentPage + 1)}
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
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content">
              <form onSubmit={handleSubmit}>
                <div className="modal-header">
                  <h5 className="modal-title">
                    {modalMode === "create" ? "Add Course" : "Edit Course"}
                  </h5>
                  <button
                    type="button"
                    className="btn-close"
                    onClick={() => setShowModal(false)}
                    disabled={submitting}
                  />
                </div>
                <div className="modal-body">
                  <div className="mb-3">
                    <label className="form-label fw-semibold">
                      Course Code <span className="text-danger">*</span>
                    </label>
                    <input
                      type="text"
                      className={`form-control ${formErrors.code ? "is-invalid" : ""}`}
                      name="code"
                      value={formData.code}
                      onChange={handleInputChange}
                      placeholder="e.g., BSIT"
                      required
                    />
                    {formErrors.code && (
                      <div className="invalid-feedback d-block">
                        {typeof formErrors.code === "string"
                          ? formErrors.code
                          : formErrors.code[0]}
                      </div>
                    )}
                  </div>

                  <div className="mb-3">
                    <label className="form-label fw-semibold">
                      Course Name <span className="text-danger">*</span>
                    </label>
                    <input
                      type="text"
                      className={`form-control ${formErrors.name ? "is-invalid" : ""}`}
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      placeholder="e.g., Bachelor of Science in Information Technology"
                      required
                    />
                    {formErrors.name && (
                      <div className="invalid-feedback d-block">
                        {typeof formErrors.name === "string"
                          ? formErrors.name
                          : formErrors.name[0]}
                      </div>
                    )}
                  </div>

                  <div className="mb-3">
                    <label className="form-label fw-semibold">Department</label>
                    <select
                      className={`form-select ${formErrors.department ? "is-invalid" : ""}`}
                      name="department"
                      value={formData.department}
                      onChange={handleInputChange}
                    >
                      <option value="">Select Department</option>
                      <option value="Basic Education Center">
                        Basic Education Center
                      </option>
                      <option value="College Degree">College Degree</option>
                      <option value="Graduate Program">Graduate Program</option>
                    </select>
                    {formErrors.department && (
                      <div className="invalid-feedback d-block">
                        {formErrors.department}
                      </div>
                    )}
                  </div>

                  <div className="mb-3">
                    <label className="form-label fw-semibold">
                      Description
                    </label>
                    <textarea
                      className={`form-control ${formErrors.description ? "is-invalid" : ""}`}
                      name="description"
                      value={formData.description}
                      onChange={handleInputChange}
                      placeholder="Course description"
                      rows={3}
                    />
                    {formErrors.description && (
                      <div className="invalid-feedback d-block">
                        {formErrors.description}
                      </div>
                    )}
                  </div>
                </div>
                <div className="modal-footer">
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
                    {modalMode === "create" ? "Create Course" : "Update Course"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && courseToDelete && (
        <div
          className="modal fade show d-block"
          style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
        >
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title text-danger">Delete Course</h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setShowDeleteModal(false)}
                />
              </div>
              <div className="modal-body">
                <p>
                  Are you sure you want to delete the course{" "}
                  <strong>{courseToDelete.code}</strong>?
                </p>
                <p className="text-muted small">
                  This action cannot be undone.
                </p>
              </div>
              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-danger"
                  onClick={confirmDelete}
                >
                  Delete Course
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
