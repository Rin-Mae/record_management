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
  FiFileText,
} from "react-icons/fi";
import { useNavigate } from "react-router-dom";
import Sidebar from "../adminLayout/Sidebar";
import { useStudents, getGenderDisplay, formatDate } from "./useStudents.jsx";

function Students() {
  const navigate = useNavigate();
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
  } = useStudents();

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
          {/* Header */}
          <div className="d-flex flex-wrap justify-content-between align-items-center mb-4">
            <h1 className="h3 mb-2 mb-md-0">Students Management</h1>
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
                <div className="col-md-6">
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

                {/* Course Filter */}
                <div className="col-md-4">
                  <select
                    className="form-select"
                    value={courseFilter}
                    onChange={(e) => setCourseFilter(e.target.value)}
                  >
                    <option value="">All Courses</option>
                    <optgroup label="Basic Education">
                      <option value="Elementary">Elementary</option>
                      <option value="Junior Highschool">
                        Junior High School
                      </option>
                      <option value="Senior Highschool">
                        Senior High School
                      </option>
                    </optgroup>
                    <optgroup label="Undergraduate">
                      <option value="BSIT">BSIT</option>
                      <option value="BSCS">BSCS</option>
                      <option value="BSGE">BSGE</option>
                      <option value="BSA">BSA</option>
                      <option value="BEEd">BEEd</option>
                      <option value="BSCrim">BSCrim</option>
                      <option value="BSN">BSN</option>
                      <option value="AB PolSci">AB PolSci</option>
                      <option value="AB English">AB English</option>
                      <option value="ABCom">ABCom</option>
                      <option value="BSMA">BSMA</option>
                      <option value="BSHM">BSHM</option>
                    </optgroup>
                    <optgroup label="BSEd - Majors">
                      <option value="BSEd">BSEd (All)</option>
                      <option value="BSEd - Math">BSEd - Major in Math</option>
                      <option value="BSEd - English">
                        BSEd - Major in English
                      </option>
                      <option value="BSEd - Filipino">
                        BSEd - Major in Filipino
                      </option>
                      <option value="BSEd - Science">
                        BSEd - Major in Science
                      </option>
                    </optgroup>
                    <optgroup label="BSBA - Majors">
                      <option value="BSBA">BSBA (All)</option>
                      <option value="BSBA - FM">
                        BSBA - Financial Management
                      </option>
                      <option value="BSBA - MM">
                        BSBA - Marketing Management
                      </option>
                      <option value="BSBA - HRM">
                        BSBA - Human Resource Management
                      </option>
                    </optgroup>
                    <optgroup label="Graduate Degrees">
                      <option value="Ph.D">Ph.D</option>
                      <option value="Ed.D">Ed.D</option>
                      <option value="MA.Ed">MA.Ed</option>
                      <option value="MA.Ed - L.L">MA.Ed - L.L</option>
                      <option value="MPA">MPA</option>
                      <option value="MBA">MBA</option>
                    </optgroup>
                  </select>
                </div>

                {/* Year Level Filter */}
                <div className="col-md-2">
                  <select
                    className="form-select"
                    value={yearLevelFilter}
                    onChange={(e) => setYearLevelFilter(e.target.value)}
                  >
                    <option value="">All Years</option>
                    <option value="1">1st Year</option>
                    <option value="2">2nd Year</option>
                    <option value="3">3rd Year</option>
                    <option value="4">4th Year</option>
                    <option value="5">5th Year</option>
                  </select>
                </div>
              </form>
            </div>
          </div>

          {/* Students Table */}
          <div className="card">
            <div className="card-body">
              {loading ? (
                <div className="text-center py-5">
                  <div className="spinner-border text-success" role="status">
                    <span className="visually-hidden">Loading...</span>
                  </div>
                </div>
              ) : students.length === 0 ? (
                <div className="text-center py-5 text-muted">
                  <p className="mb-0">No students found</p>
                </div>
              ) : (
                <div className="table-responsive">
                  <table className="table table-hover align-middle">
                    <thead className="table-light">
                      <tr>
                        <th>Student ID</th>
                        <th>Name</th>
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
                <div className="d-flex justify-content-between align-items-center mt-4">
                  <small className="text-muted">
                    Showing {students.length} of {pagination.total} students
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
                        className={`page-item ${
                          pagination.currentPage === pagination.lastPage
                            ? "disabled"
                            : ""
                        }`}
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
                  disabled={submitting}
                />
              </div>
              <form onSubmit={handleSubmit}>
                <div className="modal-body">
                  <div className="row g-3">
                    {/* Student ID */}
                    <div className="col-md-4">
                      <label className="form-label">
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
                        <div className="invalid-feedback">
                          {formErrors.student_id[0]}
                        </div>
                      )}
                    </div>

                    {/* First Name */}
                    <div className="col-md-4">
                      <label className="form-label">
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
                        <div className="invalid-feedback">
                          {formErrors.firstname[0]}
                        </div>
                      )}
                    </div>

                    {/* Middle Name */}
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

                    {/* Last Name */}
                    <div className="col-md-4">
                      <label className="form-label">
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
                        <div className="invalid-feedback">
                          {formErrors.lastname[0]}
                        </div>
                      )}
                    </div>

                    {/* Email */}
                    <div className="col-md-4">
                      <label className="form-label">
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
                        <div className="invalid-feedback">
                          {formErrors.email[0]}
                        </div>
                      )}
                    </div>

                    {/* Gender */}
                    <div className="col-md-4">
                      <label className="form-label">Gender</label>
                      <select
                        className="form-select"
                        name="gender"
                        value={formData.gender}
                        onChange={handleInputChange}
                      >
                        <option value="">Select Gender</option>
                        <option value="male">Male</option>
                        <option value="female">Female</option>
                        <option value="other">Other</option>
                      </select>
                    </div>

                    {/* Birthdate */}
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

                    {/* Age */}
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

                    {/* Contact Number */}
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

                    {/* Address */}
                    <div className="col-12">
                      <label className="form-label">Address</label>
                      <textarea
                        className="form-control"
                        name="address"
                        value={formData.address}
                        onChange={handleInputChange}
                        rows="2"
                      />
                    </div>

                    {/* Course */}
                    <div className="col-md-4">
                      <label className="form-label">Course</label>
                      <select
                        className="form-select"
                        name="course"
                        value={formData.course}
                        onChange={handleInputChange}
                        disabled={loadingCourses}
                      >
                        <option value="">Select Course</option>
                        {courses.map((course) => (
                          <option key={course.id} value={course.code}>
                            {course.code} - {course.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Year Level */}
                    <div className="col-md-4">
                      <label className="form-label">Year Level</label>
                      <select
                        className="form-select"
                        name="year_level"
                        value={formData.year_level}
                        onChange={handleInputChange}
                      >
                        <option value="">Select Year</option>
                        <option value="1">1st Year</option>
                        <option value="2">2nd Year</option>
                        <option value="3">3rd Year</option>
                        <option value="4">4th Year</option>
                        <option value="5">5th Year</option>
                      </select>
                    </div>
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
                    className="btn btn-success"
                    disabled={submitting}
                  >
                    {submitting ? (
                      <>
                        <span
                          className="spinner-border spinner-border-sm me-2"
                          role="status"
                          aria-hidden="true"
                        />
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

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div
          className="modal show d-block"
          tabIndex="-1"
          style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
        >
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Confirm Delete</h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setShowDeleteModal(false)}
                  disabled={deleting}
                />
              </div>
              <div className="modal-body">
                <p className="mb-0">
                  Are you sure you want to delete student{" "}
                  <strong>
                    {studentToDelete?.firstname} {studentToDelete?.lastname}
                  </strong>{" "}
                  ({studentToDelete?.student_id})?
                </p>
                <p className="text-danger small mt-2 mb-0">
                  This action cannot be undone.
                </p>
              </div>
              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setShowDeleteModal(false)}
                  disabled={deleting}
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
                      <span
                        className="spinner-border spinner-border-sm me-2"
                        role="status"
                        aria-hidden="true"
                      />
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

      {/* View Student Modal */}
      {showViewModal && selectedStudent && (
        <div
          className="modal show d-block"
          tabIndex="-1"
          style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
        >
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header border-0 pb-0">
                <button
                  type="button"
                  className="btn-close"
                  onClick={closeViewModal}
                />
              </div>
              <div className="modal-body pt-0">
                {/* Student Header */}
                <div className="text-center mb-4">
                  <div
                    className="rounded-circle bg-primary d-flex align-items-center justify-content-center text-white fw-bold mx-auto mb-3"
                    style={{
                      width: "80px",
                      height: "80px",
                      fontSize: "1.5rem",
                    }}
                  >
                    {selectedStudent.firstname?.charAt(0)}
                    {selectedStudent.lastname?.charAt(0)}
                  </div>
                  <h4 className="mb-1">
                    {selectedStudent.firstname}{" "}
                    {selectedStudent.middlename
                      ? selectedStudent.middlename + " "
                      : ""}
                    {selectedStudent.lastname}
                  </h4>
                  <p className="text-muted mb-0">
                    {selectedStudent.student_id}
                  </p>
                </div>

                {/* Student Details */}
                <div className="border-top pt-3">
                  <div className="row g-3">
                    {/* Course */}
                    <div className="col-6">
                      <div className="d-flex align-items-center text-muted small mb-1">
                        <FiBook className="me-2" size={14} />
                        Course
                      </div>
                      <div className="fw-medium">
                        {selectedStudent.course || "-"}
                      </div>
                    </div>

                    {/* Year Level */}
                    <div className="col-6">
                      <div className="d-flex align-items-center text-muted small mb-1">
                        <FiUser className="me-2" size={14} />
                        Year Level
                      </div>
                      <div className="fw-medium">
                        {selectedStudent.year_level
                          ? `${selectedStudent.year_level}${
                              selectedStudent.year_level === 1
                                ? "st"
                                : selectedStudent.year_level === 2
                                  ? "nd"
                                  : selectedStudent.year_level === 3
                                    ? "rd"
                                    : "th"
                            } Year`
                          : "-"}
                      </div>
                    </div>

                    {/* Email */}
                    <div className="col-12">
                      <div className="d-flex align-items-center text-muted small mb-1">
                        <FiMail className="me-2" size={14} />
                        Email
                      </div>
                      <div className="fw-medium">{selectedStudent.email}</div>
                    </div>

                    {/* Contact Number */}
                    <div className="col-6">
                      <div className="d-flex align-items-center text-muted small mb-1">
                        <FiPhone className="me-2" size={14} />
                        Contact
                      </div>
                      <div className="fw-medium">
                        {selectedStudent.contact_number || "-"}
                      </div>
                    </div>

                    {/* Gender */}
                    <div className="col-6">
                      <div className="d-flex align-items-center text-muted small mb-1">
                        <FiUser className="me-2" size={14} />
                        Gender
                      </div>
                      <div className="fw-medium">
                        {getGenderDisplay(selectedStudent.gender)}
                      </div>
                    </div>

                    {/* Birthdate */}
                    <div className="col-6">
                      <div className="d-flex align-items-center text-muted small mb-1">
                        <FiCalendar className="me-2" size={14} />
                        Birthdate
                      </div>
                      <div className="fw-medium">
                        {formatDate(selectedStudent.birthdate)}
                      </div>
                    </div>

                    {/* Age */}
                    <div className="col-6">
                      <div className="d-flex align-items-center text-muted small mb-1">
                        <FiUser className="me-2" size={14} />
                        Age
                      </div>
                      <div className="fw-medium">
                        {selectedStudent.age
                          ? `${selectedStudent.age} years old`
                          : "-"}
                      </div>
                    </div>

                    {/* Address */}
                    <div className="col-12">
                      <div className="d-flex align-items-center text-muted small mb-1">
                        <FiMapPin className="me-2" size={14} />
                        Address
                      </div>
                      <div className="fw-medium">
                        {selectedStudent.address || "-"}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="modal-footer border-0">
                <button
                  type="button"
                  className="btn btn-success"
                  onClick={() => {
                    closeViewModal();
                    openEditModal(selectedStudent);
                  }}
                >
                  <FiEdit2 className="me-2" size={16} />
                  Edit Student
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default Students;
