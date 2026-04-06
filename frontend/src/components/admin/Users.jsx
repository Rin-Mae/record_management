import React from "react";
import { FiPlus, FiEdit2, FiTrash2, FiSearch, FiMail } from "react-icons/fi";
import Sidebar from "../adminLayout/Sidebar";
import { useUsers, getRoleBadge } from "./useUsers.jsx";
import { validateSpecialCharacters } from "../../utils/validation.js";
import { toast } from "react-toastify";

function Users() {
  const {
    user,
    sidebarVisible,
    setSidebarVisible,
    handleLogout,
    toggleSidebar,
    users,
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
    showViewModal,
    selectedUser,
    openViewModal,
    closeViewModal,
    showDeleteModal,
    setShowDeleteModal,
    userToDelete,
    deleting,
    openDeleteModal,
    handleDelete,
    goToPage,
  } = useUsers();

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
          <div className="d-flex flex-wrap justify-content-between align-items-center mb-4">
            <h1 className="h3 mb-2 mb-md-0">User Management</h1>
            <button
              className="btn btn-success d-flex align-items-center gap-2"
              onClick={openCreateModal}
            >
              <FiPlus size={18} />
              Add User
            </button>
          </div>

          {/* Search */}
          <div className="card mb-4 ">
            <div className="card-body bg-success bg-opacity-10">
              <form onSubmit={handleSearch} className="row g-3">
                <div className="col-md-10">
                  <div className="input-group">
                    <span className="input-group-text">
                      <FiSearch />
                    </span>
                    <input
                      type="text"
                      className="form-control  "
                      placeholder="Search by name, email, or username"
                      value={search}
                      onChange={(e) => {
                        const value = e.target.value;
                        // Validate special characters
                        const validation = validateSpecialCharacters(value, [
                          "-",
                          "_",
                          ".",
                          "@",
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
                <div className="col-md-2">
                  <button type="submit" className="btn btn-success w-100">
                    Search
                  </button>
                </div>
              </form>
            </div>
          </div>

          {/* Users Table */}
          <div className="card ">
            <div className="card-body bg-success bg-opacity-10">
              {loading ? (
                <div className="text-center py-5 ">
                  <div className="spinner-border text-success" role="status">
                    <span className="visually-hidden">Loading...</span>
                  </div>
                </div>
              ) : users.length === 0 ? (
                <div className="text-center py-5 text-muted">
                  <p className="mb-0">No users found</p>
                </div>
              ) : (
                <div className="table-responsive">
                  <table className="table table-hover align-middle">
                    <thead className="table-success bg-opacity-10">
                      <tr>
                        <th>Name</th>
                        <th>Email</th>
                        <th>Username</th>
                        <th>Role</th>
                        <th className="text-end">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {users.map((userData) => (
                        <tr
                          key={userData.id}
                          onClick={() => openViewModal(userData)}
                          style={{ cursor: "pointer" }}
                        >
                          <td className="fw-medium">
                            {userData.firstname}{" "}
                            {userData.middlename
                              ? userData.middlename + " "
                              : ""}
                            {userData.lastname}
                          </td>
                          <td>{userData.email}</td>
                          <td>{userData.username}</td>
                          <td>
                            <span
                              className={`badge ${getRoleBadge(userData.role)}`}
                            >
                              {userData.role}
                            </span>
                          </td>
                          <td>
                            <div
                              className="d-flex justify-content-end gap-2"
                              onClick={(e) => e.stopPropagation()}
                            >
                              <button
                                className="btn btn-sm btn-outline-primary"
                                onClick={() => openEditModal(userData)}
                                title="Edit"
                              >
                                <FiEdit2 size={16} />
                              </button>
                              <button
                                className="btn btn-sm btn-outline-danger"
                                onClick={() => openDeleteModal(userData)}
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

              {pagination.lastPage > 1 && (
                <div className="d-flex justify-content-between align-items-center mt-4">
                  <small className="text-muted">
                    Showing {users.length} of {pagination.total} users
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
                      {modalMode === "create" ? "Add New User" : "Edit User"}
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

                        <div className="col-md-6">
                          <label className="form-label">
                            Username <span className="text-danger">*</span>
                          </label>
                          <input
                            type="text"
                            className={`form-control ${formErrors.username ? "is-invalid" : ""}`}
                            name="username"
                            value={formData.username}
                            onChange={handleInputChange}
                            required
                          />
                          {formErrors.username && (
                            <div className="invalid-feedback">
                              {formErrors.username[0]}
                            </div>
                          )}
                        </div>

                        <div className="col-md-6">
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

                        <div className="col-md-12">
                          <label className="form-label">
                            Role <span className="text-danger">*</span>
                          </label>
                          <input
                            type="text"
                            className="form-control"
                            value="Admin"
                            disabled
                            readOnly
                          />
                          <input type="hidden" name="role" value="admin" />
                          {formErrors.role && (
                            <div className="invalid-feedback">
                              {formErrors.role[0]}
                            </div>
                          )}
                        </div>

                        <div className="col-md-6">
                          <label className="form-label">
                            Password{" "}
                            {modalMode === "create" && (
                              <span className="text-danger">*</span>
                            )}
                            {modalMode === "edit" && (
                              <small className="text-muted">
                                (leave blank to keep current)
                              </small>
                            )}
                          </label>
                          <input
                            type="password"
                            className={`form-control ${formErrors.password ? "is-invalid" : ""}`}
                            name="password"
                            value={formData.password}
                            onChange={handleInputChange}
                            required={modalMode === "create"}
                          />
                          {formErrors.password && (
                            <div className="invalid-feedback">
                              {formErrors.password[0]}
                            </div>
                          )}
                        </div>

                        <div className="col-md-6">
                          <label className="form-label">
                            Confirm Password{" "}
                            {modalMode === "create" && (
                              <span className="text-danger">*</span>
                            )}
                          </label>
                          <input
                            type="password"
                            className={`form-control ${formErrors.password_confirmation ? "is-invalid" : ""}`}
                            name="password_confirmation"
                            value={formData.password_confirmation}
                            onChange={handleInputChange}
                            required={modalMode === "create"}
                          />
                          {formErrors.password_confirmation && (
                            <div className="invalid-feedback">
                              {formErrors.password_confirmation[0]}
                            </div>
                          )}
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
                          "Create User"
                        ) : (
                          "Update User"
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
                      Are you sure you want to delete user{" "}
                      <strong>
                        {userToDelete?.firstname} {userToDelete?.lastname}
                      </strong>{" "}
                      ({userToDelete?.email})?
                    </p>
                    <p className="text-danger small mt-2 mb-0">
                      This action cannot be undone.
                    </p>
                  </div>
                  <div className="modal-footer">
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

          {/* View User Modal */}
          {showViewModal && selectedUser && (
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
                    <div className="text-center mb-4">
                      <h4 className="mb-1">
                        {selectedUser.firstname}{" "}
                        {selectedUser.middlename
                          ? selectedUser.middlename + " "
                          : ""}
                        {selectedUser.lastname}
                      </h4>
                      <p className="text-muted mb-2">
                        @{selectedUser.username}
                      </p>
                      <span
                        className={`badge ${getRoleBadge(selectedUser.role)}`}
                      >
                        {selectedUser.role}
                      </span>
                    </div>
                    <div className="border-top pt-3">
                      <div className="row g-3">
                        <div className="col-12">
                          <div className="d-flex align-items-center text-muted small mb-1">
                            <FiMail className="me-2" size={14} />
                            Email
                          </div>
                          <div className="fw-medium">{selectedUser.email}</div>
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
                        openEditModal(selectedUser);
                      }}
                    >
                      <FiEdit2 className="me-2" size={16} />
                      Edit User
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}

export default Users;
