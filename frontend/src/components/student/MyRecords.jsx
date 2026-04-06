import React, { useState, useEffect } from "react";
import {
  FiDownload,
  FiTrash2,
  FiFileText,
  FiImage,
  FiX,
  FiCheckCircle,
  FiXCircle,
  FiClock,
  FiAlertCircle,
} from "react-icons/fi";
import { useAuth } from "../../contexts/AuthContext";
import StudentRecordServices from "../../services/StudentRecordServices.jsx";
import StudentSidebar from "../studentLayout/StudentSidebar";
import "./StudentPages.css";

// Check if a file is an image
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

// Get verification status badge
function getStatusBadge(status) {
  switch (status) {
    case "verified":
      return (
        <span className="badge bg-success d-inline-flex align-items-center gap-1">
          <FiCheckCircle size={12} /> Verified
        </span>
      );
    case "rejected":
      return (
        <span className="badge bg-danger d-inline-flex align-items-center gap-1">
          <FiXCircle size={12} /> Rejected
        </span>
      );
    case "pending":
      return (
        <span className="badge bg-warning d-inline-flex align-items-center gap-1">
          <FiClock size={12} /> Pending
        </span>
      );
    default:
      return (
        <span className="badge bg-secondary d-inline-flex align-items-center gap-1">
          <FiAlertCircle size={12} /> Unknown
        </span>
      );
  }
}

function MyRecords() {
  const { user } = useAuth();
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [previewImage, setPreviewImage] = useState(null);
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [selectedRecordFiles, setSelectedRecordFiles] = useState(null);
  const [showFilesModal, setShowFilesModal] = useState(false);

  useEffect(() => {
    // Fetch student records
    const fetchRecords = async () => {
      try {
        setLoading(true);
        const response = await StudentRecordServices.getMyRecords();
        if (response.success) {
          setRecords(response.data);
        }
      } catch (error) {
        console.error("Failed to fetch records:", error);
        window.showAlert("error", "Failed to load records");
      } finally {
        setLoading(false);
      }
    };

    fetchRecords();
  }, []);

  const handleDownload = (file) => {
    const url =
      file.file_url || (file.file_path ? `/storage/${file.file_path}` : null);
    if (url) {
      window.open(url, "_blank");
    }
  };

  const handleViewRecord = (record) => {
    setSelectedRecordFiles(record);
    setShowFilesModal(true);
  };

  const handlePreviewImage = (file) => {
    setPreviewImage(file);
    setShowPreviewModal(true);
  };

  const handleDelete = (recordId) => {
    if (window.confirm("Are you sure you want to delete this record?")) {
      window.showAlert("success", "Delete functionality coming soon");
      // TODO: Implement delete logic
    }
  };

  return (
    <div className="student-layout">
      <StudentSidebar />
      <main className="student-main-content">
        <div className="container-fluid p-4">
          <div className="d-flex align-items-center justify-content-between mb-4">
            <h2 className="mb-0">My Records</h2>
          </div>

          {loading ? (
            <div
              className="d-flex justify-content-center align-items-center"
              style={{ height: "400px" }}
            >
              <div className="spinner-border text-success" role="status">
                <span className="visually-hidden">Loading...</span>
              </div>
            </div>
          ) : records.length === 0 ? (
            <div className="card">
              <div className="card-body text-center py-5">
                <h5 className="card-title text-muted">No records yet</h5>
                <p className="card-text text-muted">
                  You haven't uploaded any records yet.
                </p>
              </div>
            </div>
          ) : (
            <div className="table-responsive">
              <table className="table table-hover">
                <thead className="table-light">
                  <tr>
                    <th>Record Type</th>
                    <th>Files</th>
                    <th>Upload Date</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {records.map((record) => (
                    <tr key={record.id}>
                      <td>
                        <span className="badge bg-info">
                          {record.record_type}
                        </span>
                      </td>
                      <td>
                        {record.files && record.files.length > 0 ? (
                          <div>
                            {record.files.map((file) => {
                              const isImage =
                                isImageFile(file.file_name) ||
                                isImageFile(file.file_type);
                              return (
                                <div
                                  key={file.id}
                                  className="d-flex align-items-center gap-2 mb-2"
                                >
                                  {isImage ? (
                                    <FiImage
                                      size={16}
                                      className="text-success"
                                    />
                                  ) : (
                                    <FiFileText size={16} />
                                  )}
                                  <span className="small">
                                    {file.file_name}
                                  </span>
                                </div>
                              );
                            })}
                          </div>
                        ) : (
                          <span className="text-muted">No files</span>
                        )}
                      </td>
                      <td>
                        <small className="text-muted">
                          {new Date(record.created_at).toLocaleDateString()}
                        </small>
                      </td>
                      <td>
                        {getStatusBadge(
                          record.verification_status || "pending",
                        )}
                      </td>
                      <td>
                        <div className="btn-group" role="group">
                          <button
                            className="btn btn-sm btn-outline-success"
                            onClick={() => handleViewRecord(record)}
                            title="View files"
                            disabled={
                              !record.files || record.files.length === 0
                            }
                          >
                            <FiImage size={16} />
                          </button>
                          <button
                            className="btn btn-sm btn-outline-danger"
                            onClick={() => handleDelete(record.id)}
                            title="Delete record"
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
        </div>

        {/* Files List Modal */}
        {showFilesModal && selectedRecordFiles && (
          <div
            className="modal fade show d-block"
            style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
          >
            <div className="modal-dialog modal-dialog-centered">
              <div className="modal-content">
                <div className="modal-header">
                  <h5 className="modal-title">
                    Files - {selectedRecordFiles.record_type}
                  </h5>
                  <button
                    type="button"
                    className="btn-close"
                    onClick={() => setShowFilesModal(false)}
                  />
                </div>
                <div className="modal-body">
                  {selectedRecordFiles.files &&
                  selectedRecordFiles.files.length > 0 ? (
                    <div className="list-group">
                      {selectedRecordFiles.files.map((file) => (
                        <div
                          key={file.id}
                          className="list-group-item d-flex justify-content-between align-items-center"
                        >
                          <div className="small flex-grow-1">
                            <div className="fw-semibold">{file.file_name}</div>
                            <small className="text-muted">
                              {(file.file_size / 1024 / 1024).toFixed(2)} MB
                            </small>
                          </div>
                          <div className="d-flex gap-2">
                            <button
                              className="btn btn-sm btn-outline-info"
                              onClick={() => {
                                handlePreviewImage(file);
                                setShowFilesModal(false);
                              }}
                              title="Preview file"
                            >
                              <FiImage size={14} />
                            </button>
                            <button
                              className="btn btn-sm btn-outline-primary"
                              onClick={() => handleDownload(file)}
                              title="Download file"
                            >
                              <FiDownload size={14} />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-4">
                      <p className="text-muted">No files available</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* File Preview Modal */}
        {showPreviewModal && previewImage && (
          <div
            className="modal fade show d-block"
            style={{ backgroundColor: "rgba(0,0,0,0.7)" }}
          >
            <div className="modal-dialog modal-lg modal-dialog-centered">
              <div className="modal-content">
                <div className="modal-header">
                  <h5 className="modal-title">{previewImage.file_name}</h5>
                  <button
                    type="button"
                    className="btn-close"
                    onClick={() => setShowPreviewModal(false)}
                  />
                </div>
                <div className="modal-body text-center">
                  {(() => {
                    const isImage =
                      isImageFile(previewImage.file_name) ||
                      isImageFile(previewImage.file_type);
                    const isPdf =
                      isPdfFile(previewImage.file_name) ||
                      isPdfFile(previewImage.file_type);

                    if (isImage && previewImage.file_url) {
                      return (
                        <img
                          src={previewImage.file_url}
                          alt={previewImage.file_name}
                          className="rounded"
                          style={{
                            maxWidth: "100%",
                            maxHeight: "70vh",
                            objectFit: "contain",
                          }}
                        />
                      );
                    }

                    if (isPdf && previewImage.file_url) {
                      return (
                        <iframe
                          src={previewImage.file_url}
                          title={previewImage.file_name}
                          style={{
                            width: "100%",
                            height: 600,
                            border: "none",
                            borderRadius: 8,
                          }}
                        />
                      );
                    }

                    return (
                      <div className="text-muted py-5">
                        <p>Preview not available for this file type</p>
                        <p className="small">
                          {previewImage.file_type ||
                            "Click 'Open in Browser' to view"}
                        </p>
                      </div>
                    );
                  })()}
                </div>
                <div className="modal-footer">
                  {previewImage.file_url && (
                    <button
                      className="btn btn-primary d-flex align-items-center gap-2"
                      onClick={() =>
                        window.open(previewImage.file_url, "_blank")
                      }
                    >
                      <FiImage size={16} />
                      Open in Browser
                    </button>
                  )}
                  {previewImage.file_url && (
                    <button
                      className="btn btn-info d-flex align-items-center gap-2"
                      onClick={() => handleDownload(previewImage)}
                    >
                      <FiDownload size={16} />
                      Download
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

export default MyRecords;
