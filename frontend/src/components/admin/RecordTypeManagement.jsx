import { useState, useEffect } from "react";
import { useAuth } from "../../contexts/AuthContext";
import { toast } from "react-toastify";
import apiClient from "../../services/api";
import { FiMenu, FiPlus, FiEdit2, FiTrash2, FiSearch } from "react-icons/fi";
import Sidebar from "../adminLayout/Sidebar";
import "../adminLayout/RecordTypeManagement.css";

export default function RecordTypeManagement() {
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

  // Record types data
  const [recordTypes, setRecordTypes] = useState([]);
  const [loading, setLoading] = useState(true);

  // Search
  const [search, setSearch] = useState("");

  // Modal states
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState("create");
  const [selectedType, setSelectedType] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
  });
  const [formErrors, setFormErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  // Delete confirmation
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [typeToDelete, setTypeToDelete] = useState(null);

  // Selected items for bulk actions
  const [selectedIds, setSelectedIds] = useState([]);

  // Fetch record types
  const fetchRecordTypes = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (search) params.append("search", search);

      const response = await apiClient.get(
        `/record-types?${params.toString()}`,
      );
      console.log("Full API Response:", response.data);

      // Handle paginated response from Laravel
      let data = [];
      if (response.data && typeof response.data === "object") {
        // Check if it's a paginated response (has 'data' key with array)
        if (Array.isArray(response.data.data)) {
          data = response.data.data;
        }
        // Check if the response itself is an array
        else if (Array.isArray(response.data)) {
          data = response.data;
        }
      }

      console.log("Extracted data:", data);
      setRecordTypes(data);
    } catch (error) {
      console.error("Fetch error:", error);
      const errorMsg =
        error.response?.status === 404
          ? "Endpoint not found. Make sure the server is running."
          : error.message || "Failed to fetch record types";
      toast.error(errorMsg);
      setRecordTypes([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRecordTypes();
  }, [search]);

  const openCreateModal = () => {
    setModalMode("create");
    setSelectedType(null);
    setFormData({ name: "", description: "" });
    setFormErrors({});
    setShowModal(true);
  };

  const openEditModal = (recordType) => {
    setModalMode("edit");
    setSelectedType(recordType);
    setFormData({
      name: recordType.name,
      description: recordType.description,
    });
    setFormErrors({});
    setShowModal(true);
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
    // Clear error for this field
    if (formErrors[name]) {
      setFormErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      if (modalMode === "create") {
        await apiClient.post("/record-types", formData);
        toast.success("Record type created successfully");
      } else {
        await apiClient.put(`/record-types/${selectedType.id}`, formData);
        toast.success("Record type updated successfully");
      }
      setShowModal(false);
      setFormData({ name: "", description: "" });
      setFormErrors({});
      fetchRecordTypes();
      setSelectedIds([]);
    } catch (error) {
      const message =
        error.response?.data?.message || "Failed to save record type";
      toast.error(message);
      if (error.response?.data?.errors) {
        setFormErrors(error.response.data.errors);
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteClick = (recordType) => {
    setTypeToDelete(recordType);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    try {
      await apiClient.delete(`/record-types/${typeToDelete.id}`);
      toast.success("Record type deleted successfully");
      setShowDeleteModal(false);
      setTypeToDelete(null);
      fetchRecordTypes();
      setSelectedIds(selectedIds.filter((id) => id !== typeToDelete.id));
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Failed to delete record type",
      );
    }
  };

  const handleSelectAll = (e) => {
    if (e.target.checked) {
      setSelectedIds(recordTypes.map((rt) => rt.id));
    } else {
      setSelectedIds([]);
    }
  };

  const handleSelectType = (id, checked) => {
    if (checked) {
      setSelectedIds((prev) => [...prev, id]);
    } else {
      setSelectedIds((prev) => prev.filter((item) => item !== id));
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
          <span className="fw-semibold">Record Types</span>
        </div>

        {/* Main Content */}
        <div className="container-fluid p-4">
          {/* Page header */}
          <div className="mb-4">
            <div className="d-flex justify-content-between align-items-center mb-3">
              <div>
                <h2 className="mb-1">Record Types</h2>
                <p className="text-muted mb-0">
                  Manage available record types in the system
                </p>
              </div>
              <button
                className="btn btn-success d-flex align-items-center gap-2"
                onClick={openCreateModal}
              >
                <FiPlus size={16} />
                Add Record Type
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
                        placeholder="Search by name or code..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Record Types Table */}
          <div className="card">
            <div className="card-body p-0">
              {loading ? (
                <div className="text-center py-5">
                  <div className="spinner-border text-success" role="status">
                    <span className="visually-hidden">Loading...</span>
                  </div>
                </div>
              ) : recordTypes.length === 0 ? (
                <div className="text-center py-5 text-muted">
                  <p>No record types found</p>
                </div>
              ) : (
                <div className="table-responsive">
                  <table className="table table-hover align-middle mb-0">
                    <thead className="table-success">
                      <tr>
                        <th>Name</th>
                        <th>Description</th>
                        <th>Created</th>
                        <th style={{ width: "100px" }}>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {recordTypes.map((recordType) => (
                        <tr key={recordType.id}>
                          <td className="fw-semibold">{recordType.name}</td>
                          <td>
                            <small className="text-muted">
                              {recordType.description
                                ? recordType.description.substring(0, 40) +
                                  (recordType.description.length > 40
                                    ? "..."
                                    : "")
                                : "-"}
                            </small>
                          </td>
                          <td>
                            <small className="text-muted">
                              {new Date(
                                recordType.created_at,
                              ).toLocaleDateString()}
                            </small>
                          </td>
                          <td>
                            <div className="d-flex gap-1">
                              <button
                                className="btn btn-sm btn-outline-primary"
                                onClick={() => openEditModal(recordType)}
                                title="Edit"
                              >
                                <FiEdit2 size={14} />
                              </button>
                              <button
                                className="btn btn-sm btn-outline-danger"
                                onClick={() => handleDeleteClick(recordType)}
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
          </div>
        </div>
      </div>

      {/* Create/Edit Modal */}
      {showModal && (
        <div
          className="modal fade show d-block"
          style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
        >
          <div className="modal-dialog modal-dialog-centered modal-lg">
            <div className="modal-content">
              <form onSubmit={handleSubmit}>
                <div className="modal-header">
                  <h5 className="modal-title">
                    {modalMode === "create"
                      ? "Add Record Type"
                      : "Edit Record Type"}
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
                      Name <span className="text-danger">*</span>
                    </label>
                    <input
                      type="text"
                      className={`form-control ${
                        formErrors.name ? "is-invalid" : ""
                      }`}
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      placeholder="e.g., Transcript of Records"
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
                    <label className="form-label fw-semibold">
                      Description
                    </label>
                    <textarea
                      className={`form-control ${
                        formErrors.description ? "is-invalid" : ""
                      }`}
                      name="description"
                      value={formData.description}
                      onChange={handleInputChange}
                      placeholder="Add a description for this record type"
                      rows="3"
                    />
                    {formErrors.description && (
                      <div className="invalid-feedback d-block">
                        {typeof formErrors.description === "string"
                          ? formErrors.description
                          : formErrors.description[0]}
                      </div>
                    )}
                  </div>
                </div>
                <div className="modal-footer">
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
                        ></span>
                        Saving...
                      </>
                    ) : modalMode === "create" ? (
                      "Create Record Type"
                    ) : (
                      "Update Record Type"
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
          className="modal fade show d-block"
          style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
        >
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Delete Record Type</h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setShowDeleteModal(false)}
                />
              </div>
              <div className="modal-body">
                <p>
                  Are you sure you want to delete the record type{" "}
                  <strong>{typeToDelete?.name}</strong>?
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
