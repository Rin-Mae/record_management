import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { useAuth } from "../../contexts/AuthContext";
import StudentServices from "../../services/StudentServices.jsx";
import EnrollmentListServices from "../../services/EnrollmentListServices.jsx";
import {
  FiMenu,
  FiPlus,
  FiEdit2,
  FiTrash2,
  FiSearch,
  FiUsers,
  FiUser,
  FiX,
  FiChevronLeft,
  FiUserPlus,
  FiCalendar,
} from "react-icons/fi";
import Sidebar from "../adminLayout/Sidebar";

export default function EnrollmentListManagement() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [sidebarVisible, setSidebarVisible] = useState(true);

  // ---- Enrollment Periods List ----
  const [enrollments, setEnrollments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [pagination, setPagination] = useState({
    currentPage: 1,
    lastPage: 1,
    total: 0,
    perPage: 10,
  });

  // ---- Create/Edit Modal ----
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState("create");
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({ period: "1st Semester", academic_year: "" });
  const [formErrors, setFormErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  // ---- Delete Modal ----
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);

  // ---- Students View ----
  const [selectedEnrollment, setSelectedEnrollment] = useState(null);
  const [students, setStudents] = useState([]);
  const [studentsLoading, setStudentsLoading] = useState(false);
  const [studentSearch, setStudentSearch] = useState("");
  const [studentsPagination, setStudentsPagination] = useState({
    currentPage: 1,
    lastPage: 1,
    total: 0,
    perPage: 20,
  });

  // ---- Add Students Modal ----
  const [showAddStudentsModal, setShowAddStudentsModal] = useState(false);
  const [addStudentSearch, setAddStudentSearch] = useState("");
  const [addStudentResults, setAddStudentResults] = useState([]);
  const [searchingStudents, setSearchingStudents] = useState(false);
  const [selectedStudentIds, setSelectedStudentIds] = useState([]);
  const [addingStudents, setAddingStudents] = useState(false);

  // ---- Remove Student Modal ----
  const [showRemoveStudentModal, setShowRemoveStudentModal] = useState(false);
  const [studentToRemove, setStudentToRemove] = useState(null);
  const [removingStudent, setRemovingStudent] = useState(false);

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

  // Generate year options (current year ± 5)
  const currentYear = new Date().getFullYear();
  const yearOptions = [];
  for (let y = currentYear + 2; y >= currentYear - 5; y--) {
    yearOptions.push(`${y}-${y + 1}`);
  }

  // =========================================
  // ENROLLMENT PERIODS LIST
  // =========================================
  const fetchEnrollments = useCallback(
    async (page = 1) => {
      setLoading(true);
      try {
        const params = {
          page,
          per_page: pagination.perPage,
          search: search || undefined,
        };
        const response = await EnrollmentListServices.getEnrollmentLists(params);
        if (response.success) {
          setEnrollments(response.data.data);
          setPagination({
            currentPage: response.data.current_page,
            lastPage: response.data.last_page,
            total: response.data.total,
            perPage: response.data.per_page,
          });
        }
      } catch (error) {
        console.error("Failed to fetch enrollment lists:", error);
        toast.error("Failed to fetch enrollment lists");
      } finally {
        setLoading(false);
      }
    },
    [search, pagination.perPage],
  );

  useEffect(() => {
    if (!selectedEnrollment) {
      fetchEnrollments(1);
    }
  }, [search, selectedEnrollment]);

  const openCreateModal = () => {
    setModalMode("create");
    setFormErrors({});
    setEditingId(null);
    setFormData({ period: "1st Semester", academic_year: yearOptions[2] || "" });
    setShowModal(true);
  };

  const openEditModal = (enrollment) => {
    setModalMode("edit");
    setFormErrors({});
    setEditingId(enrollment.id);
    setFormData({ period: enrollment.period, academic_year: enrollment.academic_year });
    setShowModal(true);
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    const errors = {};
    if (!formData.period) errors.period = "Period is required";
    if (!formData.academic_year) errors.academic_year = "Academic year is required";
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    setSubmitting(true);
    try {
      if (modalMode === "create") {
        const res = await EnrollmentListServices.createEnrollmentList(formData);
        if (res.success) {
          toast.success("Enrollment period created");
          setShowModal(false);
          fetchEnrollments(pagination.currentPage);
        }
      } else {
        const res = await EnrollmentListServices.updateEnrollmentList(editingId, formData);
        if (res.success) {
          toast.success("Enrollment period updated");
          setShowModal(false);
          fetchEnrollments(pagination.currentPage);
        }
      }
    } catch (error) {
      const serverErrors = error.response?.data?.errors;
      if (serverErrors) {
        setFormErrors(serverErrors);
      } else {
        toast.error(error.response?.data?.message || "Failed to save");
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteClick = (enrollment) => {
    setItemToDelete(enrollment);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    if (!itemToDelete) return;
    setDeleting(true);
    try {
      const res = await EnrollmentListServices.deleteEnrollmentList(itemToDelete.id);
      if (res.success) {
        toast.success("Enrollment period deleted");
        setShowDeleteModal(false);
        setItemToDelete(null);
        fetchEnrollments(pagination.currentPage);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to delete");
    } finally {
      setDeleting(false);
    }
  };

  const handlePageChange = (page) => {
    if (page >= 1 && page <= pagination.lastPage) {
      fetchEnrollments(page);
    }
  };

  // =========================================
  // STUDENTS VIEW (inside an enrollment)
  // =========================================
  const openEnrollmentStudents = (enrollment) => {
    setSelectedEnrollment(enrollment);
    setStudentSearch("");
    setStudents([]);
    setStudentsPagination({ currentPage: 1, lastPage: 1, total: 0, perPage: 20 });
  };

  const fetchStudents = useCallback(
    async (page = 1) => {
      if (!selectedEnrollment) return;
      setStudentsLoading(true);
      try {
        const params = {
          page,
          per_page: studentsPagination.perPage,
          search: studentSearch || undefined,
        };
        const res = await EnrollmentListServices.getEnrollmentStudents(
          selectedEnrollment.id,
          params,
        );
        if (res.success) {
          setStudents(res.data.data);
          setStudentsPagination({
            currentPage: res.data.current_page,
            lastPage: res.data.last_page,
            total: res.data.total,
            perPage: res.data.per_page,
          });
        }
      } catch (error) {
        console.error("Failed to fetch students:", error);
        toast.error("Failed to fetch students");
      } finally {
        setStudentsLoading(false);
      }
    },
    [selectedEnrollment, studentSearch, studentsPagination.perPage],
  );

  useEffect(() => {
    if (selectedEnrollment) {
      fetchStudents(1);
    }
  }, [selectedEnrollment, studentSearch]);

  const handleStudentsPageChange = (page) => {
    if (page >= 1 && page <= studentsPagination.lastPage) {
      fetchStudents(page);
    }
  };

  // ---- Add Students ----
  useEffect(() => {
    if (!addStudentSearch || addStudentSearch.length < 2) {
      setAddStudentResults([]);
      return;
    }
    const timer = setTimeout(async () => {
      setSearchingStudents(true);
      try {
        const res = await StudentServices.getStudents({
          search: addStudentSearch,
          per_page: 10,
        });
        if (res.success) {
          setAddStudentResults(res.data.data);
        }
      } catch {
        setAddStudentResults([]);
      } finally {
        setSearchingStudents(false);
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [addStudentSearch]);

  const openAddStudentsModal = () => {
    setAddStudentSearch("");
    setAddStudentResults([]);
    setSelectedStudentIds([]);
    setShowAddStudentsModal(true);
  };

  const toggleStudentSelection = (studentId) => {
    setSelectedStudentIds((prev) =>
      prev.includes(studentId)
        ? prev.filter((id) => id !== studentId)
        : [...prev, studentId],
    );
  };

  const confirmAddStudents = async () => {
    if (selectedStudentIds.length === 0) {
      toast.warning("Select at least one student");
      return;
    }
    setAddingStudents(true);
    try {
      const res = await EnrollmentListServices.addStudents(
        selectedEnrollment.id,
        selectedStudentIds,
      );
      if (res.success) {
        toast.success(res.message);
        setShowAddStudentsModal(false);
        // Update the count in the selected enrollment
        setSelectedEnrollment((prev) => ({
          ...prev,
          students_count: res.data.students_count,
        }));
        fetchStudents(studentsPagination.currentPage);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to add students");
    } finally {
      setAddingStudents(false);
    }
  };

  // ---- Remove Student ----
  const handleRemoveStudentClick = (student) => {
    setStudentToRemove(student);
    setShowRemoveStudentModal(true);
  };

  const confirmRemoveStudent = async () => {
    if (!studentToRemove) return;
    setRemovingStudent(true);
    try {
      const res = await EnrollmentListServices.removeStudent(
        selectedEnrollment.id,
        studentToRemove.id,
      );
      if (res.success) {
        toast.success("Student removed");
        setShowRemoveStudentModal(false);
        setStudentToRemove(null);
        setSelectedEnrollment((prev) => ({
          ...prev,
          students_count: res.data.students_count,
        }));
        fetchStudents(studentsPagination.currentPage);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to remove student");
    } finally {
      setRemovingStudent(false);
    }
  };

  const goBack = () => {
    setSelectedEnrollment(null);
  };

  // =========================================
  // RENDER
  // =========================================

  // If viewing students inside an enrollment
  if (selectedEnrollment) {
    return (
      <>
        <Sidebar
          visible={sidebarVisible}
          onClose={() => setSidebarVisible(false)}
          user={user}
          onLogout={handleLogout}
        />
        <div className="admin-main-content min-vh-100 bg-light">
          <div className="d-lg-none bg-dark text-white p-3 d-flex align-items-center">
            <button
              className="btn btn-outline-light btn-sm me-3"
              onClick={toggleSidebar}
              aria-label="Toggle sidebar"
            >
              <FiMenu size={20} />
            </button>
            <span className="fw-semibold">Enrollment List</span>
          </div>

          <div className="container-fluid p-4">
            {/* Back + Header */}
            <div className="d-flex align-items-center gap-3 mb-4 flex-wrap">
              <button
                className="btn btn-outline-secondary d-flex align-items-center gap-1"
                onClick={goBack}
              >
                <FiChevronLeft size={16} /> Back
              </button>
              <div className="flex-grow-1">
                <h1 className="h3 mb-0">
                  <FiCalendar size={22} className="me-2 text-success" />
                  {selectedEnrollment.period} &mdash; {selectedEnrollment.academic_year}
                </h1>
                <p className="text-muted mb-0 mt-1">
                  {studentsPagination.total} student{studentsPagination.total !== 1 && "s"} enrolled
                </p>
              </div>
              <button
                className="btn btn-success d-flex align-items-center gap-2"
                onClick={openAddStudentsModal}
              >
                <FiUserPlus size={18} />
                Add Students
              </button>
            </div>

            {/* Student Search */}
            <div className="card border-0 shadow-sm mb-4">
              <div className="card-body">
                <div className="input-group" style={{ maxWidth: 400 }}>
                  <span className="input-group-text bg-white">
                    <FiSearch size={16} />
                  </span>
                  <input
                    type="text"
                    className="form-control border-start-0"
                    placeholder="Search students..."
                    value={studentSearch}
                    onChange={(e) => setStudentSearch(e.target.value)}
                  />
                </div>
              </div>
            </div>

            {/* Students Table */}
            <div className="card border-0 shadow-sm">
              <div className="card-body p-0">
                {studentsLoading ? (
                  <div className="text-center py-5">
                    <div className="spinner-border text-success" role="status">
                      <span className="visually-hidden">Loading...</span>
                    </div>
                  </div>
                ) : students.length === 0 ? (
                  <div className="text-center py-5">
                    <FiUsers size={48} className="text-muted mb-3" />
                    <h5 className="text-muted">No students enrolled</h5>
                    <p className="text-muted">
                      {studentSearch
                        ? "No matching students found"
                        : "Click \"Add Students\" to enroll students in this period"}
                    </p>
                  </div>
                ) : (
                  <div className="table-responsive">
                    <table className="table table-hover align-middle mb-0">
                      <thead className="table-light">
                        <tr>
                          <th>Student ID</th>
                          <th>Name</th>
                          <th>Course</th>
                          <th>Year Level</th>
                          <th style={{ width: "80px" }}>Action</th>
                        </tr>
                      </thead>
                      <tbody>
                        {students.map((student) => (
                          <tr key={student.id}>
                            <td>
                              <span className="fw-semibold">{student.student_id}</span>
                            </td>
                            <td>
                              {student.firstname}{" "}
                              {student.middlename ? student.middlename + " " : ""}
                              {student.lastname}
                            </td>
                            <td>{student.course}</td>
                            <td>{student.year_level}</td>
                            <td>
                              <button
                                className="btn btn-sm btn-outline-danger"
                                onClick={() => handleRemoveStudentClick(student)}
                                title="Remove student"
                              >
                                <FiX size={14} />
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>

              {/* Student Pagination */}
              {studentsPagination.lastPage > 1 && (
                <div className="card-footer bg-white d-flex justify-content-between align-items-center">
                  <small className="text-muted">
                    Showing {(studentsPagination.currentPage - 1) * studentsPagination.perPage + 1}-
                    {Math.min(
                      studentsPagination.currentPage * studentsPagination.perPage,
                      studentsPagination.total,
                    )}{" "}
                    of {studentsPagination.total}
                  </small>
                  <nav>
                    <ul className="pagination pagination-sm mb-0">
                      <li className={`page-item ${studentsPagination.currentPage === 1 ? "disabled" : ""}`}>
                        <button
                          className="page-link"
                          onClick={() => handleStudentsPageChange(studentsPagination.currentPage - 1)}
                        >
                          Previous
                        </button>
                      </li>
                      {Array.from({ length: studentsPagination.lastPage }, (_, i) => i + 1)
                        .filter(
                          (p) =>
                            p === 1 ||
                            p === studentsPagination.lastPage ||
                            Math.abs(p - studentsPagination.currentPage) <= 1,
                        )
                        .map((page, idx, arr) => (
                          <li key={page}>
                            {idx > 0 && arr[idx - 1] !== page - 1 && (
                              <span className="page-link disabled">...</span>
                            )}
                            <button
                              className={`page-link ${page === studentsPagination.currentPage ? "active" : ""}`}
                              onClick={() => handleStudentsPageChange(page)}
                            >
                              {page}
                            </button>
                          </li>
                        ))}
                      <li className={`page-item ${studentsPagination.currentPage === studentsPagination.lastPage ? "disabled" : ""}`}>
                        <button
                          className="page-link"
                          onClick={() => handleStudentsPageChange(studentsPagination.currentPage + 1)}
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

        {/* Add Students Modal */}
        {showAddStudentsModal && (
          <div className="modal fade show d-block" style={{ backgroundColor: "rgba(0,0,0,0.5)" }}>
            <div className="modal-dialog modal-lg modal-dialog-centered">
              <div className="modal-content">
                <div className="modal-header">
                  <h5 className="modal-title">Add Students</h5>
                  <button type="button" className="btn-close" onClick={() => setShowAddStudentsModal(false)} />
                </div>
                <div className="modal-body">
                  <p className="text-muted small mb-3">
                    Search and select students to add to{" "}
                    <strong>{selectedEnrollment.period} {selectedEnrollment.academic_year}</strong>
                  </p>

                  {/* Search input */}
                  <div className="mb-3">
                    <div className="input-group">
                      <span className="input-group-text bg-white">
                        <FiSearch size={16} />
                      </span>
                      <input
                        type="text"
                        className="form-control border-start-0"
                        placeholder="Search student by name or ID..."
                        value={addStudentSearch}
                        onChange={(e) => setAddStudentSearch(e.target.value)}
                        autoComplete="off"
                      />
                    </div>
                  </div>

                  {/* Results */}
                  <div
                    style={{ maxHeight: 300, overflowY: "auto" }}
                    className="border rounded"
                  >
                    {searchingStudents ? (
                      <div className="p-3 text-center text-muted">
                        <span className="spinner-border spinner-border-sm me-2" role="status" />
                        Searching...
                      </div>
                    ) : addStudentResults.length > 0 ? (
                      addStudentResults.map((s) => {
                        const isSelected = selectedStudentIds.includes(s.id);
                        return (
                          <div
                            key={s.id}
                            className={`d-flex align-items-center gap-2 p-2 border-bottom cursor-pointer ${isSelected ? "bg-success bg-opacity-10" : "bg-white"}`}
                            style={{ cursor: "pointer" }}
                            onClick={() => toggleStudentSelection(s.id)}
                          >
                            <input
                              type="checkbox"
                              className="form-check-input"
                              checked={isSelected}
                              onChange={() => toggleStudentSelection(s.id)}
                            />
                            <FiUser size={14} />
                            <div className="flex-grow-1">
                              <div className="fw-semibold">
                                {s.firstname} {s.middlename ? s.middlename + " " : ""}{s.lastname}
                              </div>
                              <small className="text-muted">
                                {s.student_id} &mdash; {s.course}
                              </small>
                            </div>
                          </div>
                        );
                      })
                    ) : addStudentSearch.length >= 2 ? (
                      <div className="p-3 text-center text-muted">No students found</div>
                    ) : (
                      <div className="p-3 text-center text-muted">
                        Type at least 2 characters to search
                      </div>
                    )}
                  </div>

                  {selectedStudentIds.length > 0 && (
                    <div className="mt-2">
                      <small className="text-success fw-semibold">
                        {selectedStudentIds.length} student{selectedStudentIds.length !== 1 && "s"} selected
                      </small>
                    </div>
                  )}
                </div>
                <div className="modal-footer">
                  <button
                    className="btn btn-secondary"
                    onClick={() => setShowAddStudentsModal(false)}
                    disabled={addingStudents}
                  >
                    Cancel
                  </button>
                  <button
                    className="btn btn-success d-flex align-items-center gap-2"
                    onClick={confirmAddStudents}
                    disabled={addingStudents || selectedStudentIds.length === 0}
                  >
                    {addingStudents && (
                      <span className="spinner-border spinner-border-sm" role="status" />
                    )}
                    Add {selectedStudentIds.length > 0 && `(${selectedStudentIds.length})`}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Remove Student Modal */}
        {showRemoveStudentModal && studentToRemove && (
          <div className="modal fade show d-block" style={{ backgroundColor: "rgba(0,0,0,0.5)" }}>
            <div className="modal-dialog modal-dialog-centered">
              <div className="modal-content">
                <div className="modal-header">
                  <h5 className="modal-title text-danger">Remove Student</h5>
                  <button type="button" className="btn-close" onClick={() => setShowRemoveStudentModal(false)} />
                </div>
                <div className="modal-body">
                  <p>
                    Remove <strong>{studentToRemove.firstname} {studentToRemove.lastname}</strong> ({studentToRemove.student_id}) from this enrollment list?
                  </p>
                </div>
                <div className="modal-footer">
                  <button
                    className="btn btn-secondary"
                    onClick={() => setShowRemoveStudentModal(false)}
                    disabled={removingStudent}
                  >
                    Cancel
                  </button>
                  <button
                    className="btn btn-danger d-flex align-items-center gap-2"
                    onClick={confirmRemoveStudent}
                    disabled={removingStudent}
                  >
                    {removingStudent && (
                      <span className="spinner-border spinner-border-sm" role="status" />
                    )}
                    Remove
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </>
    );
  }

  // =========================================
  // ENROLLMENT PERIODS LIST VIEW
  // =========================================
  return (
    <>
      <Sidebar
        visible={sidebarVisible}
        onClose={() => setSidebarVisible(false)}
        user={user}
        onLogout={handleLogout}
      />
      <div className="admin-main-content min-vh-100 bg-light">
        <div className="d-lg-none bg-dark text-white p-3 d-flex align-items-center">
          <button
            className="btn btn-outline-light btn-sm me-3"
            onClick={toggleSidebar}
            aria-label="Toggle sidebar"
          >
            <FiMenu size={20} />
          </button>
          <span className="fw-semibold">Enrollment List</span>
        </div>

        <div className="container-fluid p-4">
          {/* Header */}
          <div className="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-2">
            <div>
              <h1 className="h3 mb-1">Enrollment List</h1>
              <p className="text-muted mb-0">
                Manage enrollment lists by semester and academic year
              </p>
            </div>
            <button
              className="btn btn-success d-flex align-items-center gap-2"
              onClick={openCreateModal}
            >
              <FiPlus size={18} />
              Add Enrollment Period
            </button>
          </div>

          {/* Search */}
          <div className="card border-0 shadow-sm mb-4">
            <div className="card-body">
              <div className="row g-3">
                <div className="col-md-6">
                  <div className="input-group">
                    <span className="input-group-text bg-white">
                      <FiSearch size={16} />
                    </span>
                    <input
                      type="text"
                      className="form-control border-start-0"
                      placeholder="Search by academic year or period..."
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                    />
                  </div>
                </div>
                <div className="col-md-6 d-flex align-items-center">
                  <span className="text-muted">
                    {pagination.total} period{pagination.total !== 1 && "s"} found
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* List */}
          <div className="card border-0 shadow-sm">
            <div className="card-body p-0">
              {loading ? (
                <div className="text-center py-5">
                  <div className="spinner-border text-success" role="status">
                    <span className="visually-hidden">Loading...</span>
                  </div>
                </div>
              ) : enrollments.length === 0 ? (
                <div className="text-center py-5">
                  <FiCalendar size={48} className="text-muted mb-3" />
                  <h5 className="text-muted">No enrollment periods</h5>
                  <p className="text-muted">
                    {search
                      ? "No matching periods found"
                      : "Click \"Add Enrollment Period\" to create one"}
                  </p>
                </div>
              ) : (
                <div className="table-responsive">
                  <table className="table table-hover align-middle mb-0">
                    <thead className="table-light">
                      <tr>
                        <th>Period</th>
                        <th>Students</th>
                        <th>Created</th>
                        <th style={{ width: "120px" }}>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {enrollments.map((enrollment) => (
                        <tr key={enrollment.id}>
                          <td>
                            <button
                              className="btn btn-link p-0 text-decoration-none text-start fw-semibold"
                              onClick={() => openEnrollmentStudents(enrollment)}
                            >
                              <FiCalendar size={14} className="me-2 text-success" />
                              {enrollment.period} &mdash; {enrollment.academic_year}
                            </button>
                          </td>
                          <td>
                            <div className="d-flex align-items-center gap-1">
                              <FiUsers size={14} />
                              <span>{enrollment.students_count ?? 0}</span>
                            </div>
                          </td>
                          <td>
                            <small className="text-muted">
                              {new Date(enrollment.created_at).toLocaleDateString()}
                            </small>
                          </td>
                          <td>
                            <div className="d-flex gap-1">
                              <button
                                className="btn btn-sm btn-outline-warning"
                                onClick={() => openEditModal(enrollment)}
                                title="Edit"
                              >
                                <FiEdit2 size={14} />
                              </button>
                              <button
                                className="btn btn-sm btn-outline-danger"
                                onClick={() => handleDeleteClick(enrollment)}
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
                  Showing {(pagination.currentPage - 1) * pagination.perPage + 1}-
                  {Math.min(pagination.currentPage * pagination.perPage, pagination.total)}{" "}
                  of {pagination.total}
                </small>
                <nav>
                  <ul className="pagination pagination-sm mb-0">
                    <li className={`page-item ${pagination.currentPage === 1 ? "disabled" : ""}`}>
                      <button
                        className="page-link"
                        onClick={() => handlePageChange(pagination.currentPage - 1)}
                      >
                        Previous
                      </button>
                    </li>
                    {Array.from({ length: pagination.lastPage }, (_, i) => i + 1)
                      .filter(
                        (p) =>
                          p === 1 ||
                          p === pagination.lastPage ||
                          Math.abs(p - pagination.currentPage) <= 1,
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
                    <li className={`page-item ${pagination.currentPage === pagination.lastPage ? "disabled" : ""}`}>
                      <button
                        className="page-link"
                        onClick={() => handlePageChange(pagination.currentPage + 1)}
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
        <div className="modal fade show d-block" style={{ backgroundColor: "rgba(0,0,0,0.5)" }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">
                  {modalMode === "create" ? "Add" : "Edit"} Enrollment Period
                </h5>
                <button type="button" className="btn-close" onClick={() => setShowModal(false)} />
              </div>
              <form onSubmit={handleFormSubmit}>
                <div className="modal-body">
                  {/* Period */}
                  <div className="mb-3">
                    <label className="form-label fw-semibold">
                      Period <span className="text-danger">*</span>
                    </label>
                    <select
                      className={`form-select ${formErrors.period ? "is-invalid" : ""}`}
                      value={formData.period}
                      onChange={(e) => setFormData({ ...formData, period: e.target.value })}
                    >
                      <option value="1st Semester">1st Semester</option>
                      <option value="2nd Semester">2nd Semester</option>
                    </select>
                    {formErrors.period && (
                      <div className="invalid-feedback">
                        {Array.isArray(formErrors.period) ? formErrors.period[0] : formErrors.period}
                      </div>
                    )}
                  </div>

                  {/* Academic Year */}
                  <div className="mb-3">
                    <label className="form-label fw-semibold">
                      Academic Year <span className="text-danger">*</span>
                    </label>
                    <select
                      className={`form-select ${formErrors.academic_year ? "is-invalid" : ""}`}
                      value={formData.academic_year}
                      onChange={(e) => setFormData({ ...formData, academic_year: e.target.value })}
                    >
                      <option value="">Select academic year</option>
                      {yearOptions.map((yr) => (
                        <option key={yr} value={yr}>
                          {yr}
                        </option>
                      ))}
                    </select>
                    {formErrors.academic_year && (
                      <div className="invalid-feedback">
                        {Array.isArray(formErrors.academic_year) ? formErrors.academic_year[0] : formErrors.academic_year}
                      </div>
                    )}
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
                      <span className="spinner-border spinner-border-sm" role="status" />
                    )}
                    {modalMode === "create" ? "Create" : "Update"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Delete Modal */}
      {showDeleteModal && itemToDelete && (
        <div className="modal fade show d-block" style={{ backgroundColor: "rgba(0,0,0,0.5)" }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title text-danger">Delete Enrollment Period</h5>
                <button type="button" className="btn-close" onClick={() => setShowDeleteModal(false)} />
              </div>
              <div className="modal-body">
                <p>
                  Are you sure you want to delete{" "}
                  <strong>{itemToDelete.period} &mdash; {itemToDelete.academic_year}</strong>?
                </p>
                <p className="text-muted small">
                  This will remove {itemToDelete.students_count ?? 0} student association(s).
                </p>
                <p className="text-danger small">This action cannot be undone.</p>
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
                    <span className="spinner-border spinner-border-sm" role="status" />
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
