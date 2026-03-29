import { FiMenu, FiPlus, FiEye, FiSearch } from "react-icons/fi";
import StaffSidebar from "../staffLayout/Sidebar";
import {
  useStaffStudents,
  getGenderDisplay,
  formatDate,
} from "./useStaffStudents.jsx";
import { validateSpecialCharacters } from "../../utils/validation.js";
import { toast } from "react-toastify";

function StaffStudents() {
  const {
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

    // Courses
    courses,
    loadingCourses,

    // Search & Filter
    search,
    setSearch,
    courseFilter,
    setCourseFilter,
    yearLevelFilter,
    setYearLevelFilter,

    // Create Modal
    showModal,
    setShowModal,
    formData,
    formErrors,
    submitting,
    openCreateModal,
    handleInputChange,
    handleSubmit,

    // View Modal
    showViewModal,
    selectedStudent,
    openViewModal,
    closeViewModal,

    // Pagination
    goToPage,
  } = useStaffStudents();

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
            onClick={toggleSidebar}
            aria-label="Toggle sidebar"
          >
            <FiMenu size={20} />
          </button>
          <span className="fw-semibold">Students</span>
        </div>

        {/* Main Content */}
        <div className="container-fluid p-4">
          {/* Page Header */}
          <div className="d-flex justify-content-between align-items-center mb-4">
            <div>
              <h2 className="mb-1">Students</h2>
              <p className="text-muted mb-0">View and add new students</p>
            </div>
            <button
              className="btn btn-success d-flex align-items-center gap-2"
              onClick={openCreateModal}
            >
              <FiPlus size={16} />
              Add Student
            </button>
          </div>

          {/* Filters */}
          <div className="card mb-4">
            <div className="card-body">
              <div className="row g-2">
                {/* Search */}
                <div className="col-12 col-md-6">
                  <div className="input-group">
                    <span className="input-group-text">
                      <FiSearch size={16} />
                    </span>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="Search student..."
                      value={search}
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
                        setSearch(value);
                      }}
                    />
                  </div>
                </div>

                {/* Course Filter */}
                <div className="col-12 col-md-3">
                  <select
                    className="form-select"
                    value={courseFilter}
                    onChange={(e) => setCourseFilter(e.target.value)}
                    disabled={loadingCourses}
                  >
                    <option value="">All Courses</option>
                    {courses.map((course) => (
                      <option key={course.id} value={course.code}>
                        {course.code}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Year Level Filter */}
                <div className="col-12 col-md-3">
                  <select
                    className="form-select"
                    value={yearLevelFilter}
                    onChange={(e) => setYearLevelFilter(e.target.value)}
                  >
                    <option value="">All Year Levels</option>
                    <option value="1">1st Year</option>
                    <option value="2">2nd Year</option>
                    <option value="3">3rd Year</option>
                    <option value="4">4th Year</option>
                    <option value="5">5th Year</option>
                    <option value="6">6th Year</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* Students Table */}
          <div className="card">
            <div className="card-body p-0">
              {loading ? (
                <div className="text-center py-5">
                  <div className="spinner-border text-success" role="status">
                    <span className="visually-hidden">Loading...</span>
                  </div>
                </div>
              ) : students.length === 0 ? (
                <div className="text-center py-5 text-muted">
                  <p>No students found</p>
                </div>
              ) : (
                <div className="table-responsive">
                  <table className="table table-hover align-middle mb-0">
                    <thead className="table-light">
                      <tr>
                        <th>ID</th>
                        <th>Name</th>
                        <th>Email</th>
                        <th>Course</th>
                        <th>Year</th>
                        <th style={{ width: "60px" }}>Action</th>
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
                          <td className="fw-semibold">
                            {student.firstname} {student.lastname}
                          </td>
                          <td>
                            <small>{student.email}</small>
                          </td>
                          <td>
                            <small className="text-muted">
                              {student.course}
                            </small>
                          </td>
                          <td>
                            <span className="badge bg-primary">
                              Year {student.year_level}
                            </span>
                          </td>
                          <td>
                            <button
                              className="btn btn-sm btn-outline-info"
                              onClick={() => openViewModal(student)}
                              title="View"
                            >
                              <FiEye size={14} />
                            </button>
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
                        onClick={() => goToPage(pagination.currentPage - 1)}
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
                          onClick={() => goToPage(page)}
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
                        onClick={() => goToPage(pagination.currentPage + 1)}
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

      {/* Add Student Modal */}
      {showModal && (
        <div
          className="modal fade show d-block"
          style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
        >
          <div className="modal-dialog modal-dialog-scrollable">
            <div className="modal-content">
              <form onSubmit={handleSubmit}>
                <div className="modal-header">
                  <h5 className="modal-title">Add Student</h5>
                  <button
                    type="button"
                    className="btn-close"
                    onClick={() => setShowModal(false)}
                    disabled={submitting}
                  />
                </div>
                <div className="modal-body">
                  <div className="row">
                    <div className="col-md-6 mb-3">
                      <label className="form-label fw-semibold">
                        First Name <span className="text-danger">*</span>
                      </label>
                      <input
                        type="text"
                        className={`form-control ${formErrors.firstname ? "is-invalid" : ""}`}
                        name="firstname"
                        value={formData.firstname}
                        onChange={handleInputChange}
                        required
                      />
                      {formErrors.firstname && (
                        <div className="invalid-feedback d-block">
                          {formErrors.firstname[0]}
                        </div>
                      )}
                    </div>
                    <div className="col-md-6 mb-3">
                      <label className="form-label fw-semibold">
                        Last Name <span className="text-danger">*</span>
                      </label>
                      <input
                        type="text"
                        className={`form-control ${formErrors.lastname ? "is-invalid" : ""}`}
                        name="lastname"
                        value={formData.lastname}
                        onChange={handleInputChange}
                        required
                      />
                      {formErrors.lastname && (
                        <div className="invalid-feedback d-block">
                          {formErrors.lastname[0]}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="mb-3">
                    <label className="form-label fw-semibold">
                      Middle Name
                    </label>
                    <input
                      type="text"
                      className="form-control"
                      name="middlename"
                      value={formData.middlename}
                      onChange={handleInputChange}
                    />
                  </div>

                  <div className="mb-3">
                    <label className="form-label fw-semibold">
                      Student ID <span className="text-danger">*</span>
                    </label>
                    <input
                      type="text"
                      className={`form-control ${formErrors.student_id ? "is-invalid" : ""}`}
                      name="student_id"
                      value={formData.student_id}
                      onChange={handleInputChange}
                      required
                    />
                    {formErrors.student_id && (
                      <div className="invalid-feedback d-block">
                        {formErrors.student_id[0]}
                      </div>
                    )}
                  </div>

                  <div className="mb-3">
                    <label className="form-label fw-semibold">
                      Email <span className="text-danger">*</span>
                    </label>
                    <input
                      type="email"
                      className={`form-control ${formErrors.email ? "is-invalid" : ""}`}
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      required
                    />
                    {formErrors.email && (
                      <div className="invalid-feedback d-block">
                        {formErrors.email[0]}
                      </div>
                    )}
                  </div>

                  <div className="row">
                    <div className="col-md-6 mb-3">
                      <label className="form-label fw-semibold">
                        Course <span className="text-danger">*</span>
                      </label>
                      <select
                        className={`form-select ${formErrors.course ? "is-invalid" : ""}`}
                        name="course"
                        value={formData.course}
                        onChange={handleInputChange}
                        required
                      >
                        <option value="">Select Course</option>
                        {courses.map((course) => (
                          <option key={course.id} value={course.code}>
                            {course.code}
                          </option>
                        ))}
                      </select>
                      {formErrors.course && (
                        <div className="invalid-feedback d-block">
                          {formErrors.course[0]}
                        </div>
                      )}
                    </div>
                    <div className="col-md-6 mb-3">
                      <label className="form-label fw-semibold">
                        Year Level <span className="text-danger">*</span>
                      </label>
                      <select
                        className={`form-select ${formErrors.year_level ? "is-invalid" : ""}`}
                        name="year_level"
                        value={formData.year_level}
                        onChange={handleInputChange}
                        required
                      >
                        <option value="">Select Year</option>
                        <option value="1">1st Year</option>
                        <option value="2">2nd Year</option>
                        <option value="3">3rd Year</option>
                        <option value="4">4th Year</option>
                        <option value="5">5th Year</option>
                        <option value="6">6th Year</option>
                      </select>
                      {formErrors.year_level && (
                        <div className="invalid-feedback d-block">
                          {formErrors.year_level[0]}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="row">
                    <div className="col-md-6 mb-3">
                      <label className="form-label fw-semibold">Gender</label>
                      <select
                        className="form-select"
                        name="gender"
                        value={formData.gender}
                        onChange={handleInputChange}
                      >
                        <option value="">Select Gender</option>
                        <option value="male">Male</option>
                        <option value="female">Female</option>
                      </select>
                    </div>
                    <div className="col-md-6 mb-3">
                      <label className="form-label fw-semibold">Age</label>
                      <input
                        type="number"
                        className="form-control"
                        name="age"
                        value={formData.age}
                        onChange={handleInputChange}
                      />
                    </div>
                  </div>

                  <div className="mb-3">
                    <label className="form-label fw-semibold">Birthdate</label>
                    <input
                      type="date"
                      className="form-control"
                      name="birthdate"
                      value={formData.birthdate}
                      onChange={handleInputChange}
                    />
                  </div>

                  <div className="mb-3">
                    <label className="form-label fw-semibold">Address</label>
                    <input
                      type="text"
                      className="form-control"
                      name="address"
                      value={formData.address}
                      onChange={handleInputChange}
                    />
                  </div>

                  <div className="mb-3">
                    <label className="form-label fw-semibold">
                      Contact Number
                    </label>
                    <input
                      type="tel"
                      className="form-control"
                      name="contact_number"
                      value={formData.contact_number}
                      onChange={handleInputChange}
                    />
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
                    Add Student
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* View Student Modal */}
      {showViewModal && selectedStudent && (
        <div
          className="modal fade show d-block"
          style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
        >
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Student Details</h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={closeViewModal}
                />
              </div>
              <div className="modal-body">
                <div className="row mb-3">
                  <div className="col-md-6">
                    <p className="text-muted small mb-1">First Name</p>
                    <p className="fw-semibold">{selectedStudent.firstname}</p>
                  </div>
                  <div className="col-md-6">
                    <p className="text-muted small mb-1">Last Name</p>
                    <p className="fw-semibold">{selectedStudent.lastname}</p>
                  </div>
                </div>

                <div className="mb-3">
                  <p className="text-muted small mb-1">Student ID</p>
                  <p className="fw-semibold">{selectedStudent.student_id}</p>
                </div>

                <div className="mb-3">
                  <p className="text-muted small mb-1">Email</p>
                  <p className="fw-semibold">{selectedStudent.email}</p>
                </div>

                <div className="row mb-3">
                  <div className="col-md-6">
                    <p className="text-muted small mb-1">Course</p>
                    <p className="fw-semibold">{selectedStudent.course}</p>
                  </div>
                  <div className="col-md-6">
                    <p className="text-muted small mb-1">Year Level</p>
                    <p className="fw-semibold">{selectedStudent.year_level}</p>
                  </div>
                </div>

                <div className="row mb-3">
                  <div className="col-md-6">
                    <p className="text-muted small mb-1">Gender</p>
                    <p className="fw-semibold">
                      {getGenderDisplay(selectedStudent.gender)}
                    </p>
                  </div>
                  <div className="col-md-6">
                    <p className="text-muted small mb-1">Age</p>
                    <p className="fw-semibold">{selectedStudent.age || "-"}</p>
                  </div>
                </div>

                <div className="mb-3">
                  <p className="text-muted small mb-1">Birthdate</p>
                  <p className="fw-semibold">
                    {selectedStudent.birthdate
                      ? formatDate(selectedStudent.birthdate)
                      : "-"}
                  </p>
                </div>

                <div className="mb-3">
                  <p className="text-muted small mb-1">Address</p>
                  <p className="fw-semibold">
                    {selectedStudent.address || "-"}
                  </p>
                </div>

                <div className="mb-3">
                  <p className="text-muted small mb-1">Contact Number</p>
                  <p className="fw-semibold">
                    {selectedStudent.contact_number || "-"}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default StaffStudents;
