import React, { useState, useEffect } from "react";
import { FiUploadCloud, FiX } from "react-icons/fi";
import { useAuth } from "../../contexts/AuthContext";
import { toast } from "react-toastify";
import StudentSidebar from "../studentLayout/StudentSidebar";
import StudentRecordServices from "../../services/StudentRecordServices.jsx";
import apiClient from "../../services/api";
import "./StudentPages.css";

function UploadRecord() {
  const { user } = useAuth();
  const [files, setFiles] = useState([]);
  const [recordType, setRecordType] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [recordTypes, setRecordTypes] = useState([]);
  const [loadingTypes, setLoadingTypes] = useState(true);
  const [showInstructions, setShowInstructions] = useState(false);
  const [uploadedRecordType, setUploadedRecordType] = useState("");
  const MAX_FILES = 5;

  // Fetch record types from database
  useEffect(() => {
    const fetchRecordTypes = async () => {
      try {
        const response = await apiClient.get("/record-types/active");
        console.log("Fetched record types:", response.data);
        setRecordTypes(
          Array.isArray(response.data)
            ? response.data
            : response.data.data || [],
        );
      } catch (error) {
        console.error("Failed to fetch record types:", error);
        toast.error("Failed to load record types");
        setRecordTypes([]);
      } finally {
        setLoadingTypes(false);
      }
    };

    fetchRecordTypes();
  }, []);

  const handleFileChange = (e) => {
    const selectedFiles = Array.from(e.target.files || []);

    // Check if adding new files would exceed the limit
    if (files.length + selectedFiles.length > MAX_FILES) {
      toast.error(
        `Maximum ${MAX_FILES} files allowed. You can add ${MAX_FILES - files.length} more.`,
      );
      return;
    }

    const allowedTypes = [
      "application/pdf",
      "image/jpeg",
      "image/png",
      "image/gif",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "application/vnd.ms-excel",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    ];

    const validFiles = [];
    selectedFiles.forEach((file) => {
      // Validate file size (max 50MB)
      if (file.size > 50 * 1024 * 1024) {
        toast.error(`${file.name}: File size must be less than 50MB`);
        return;
      }

      // Validate file type
      if (!allowedTypes.includes(file.type)) {
        toast.error(
          `${file.name}: Unsupported file type. Please upload PDF, images, or Office documents.`,
        );
        return;
      }

      validFiles.push(file);
    });

    setFiles([...files, ...validFiles]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (files.length === 0) {
      toast.error("Please select at least one file");
      return;
    }

    if (!recordType) {
      toast.error("Please select a record type");
      return;
    }

    setLoading(true);
    try {
      const formData = new FormData();

      console.log("=== UPLOAD DEBUG ===");
      console.log("Record type:", recordType);
      console.log("Total files to upload:", files.length);

      files.forEach((file, index) => {
        console.log(`File ${index}:`, {
          name: file.name,
          size: `${(file.size / 1024 / 1024).toFixed(2)} MB`,
          type: file.type,
        });
        formData.append("files", file);
      });

      if (description) {
        formData.append("description", description);
        console.log("Description:", description);
      }

      // For debugging - show what's in FormData
      console.log("FormData entries:");
      for (let [key, value] of formData.entries()) {
        if (value instanceof File) {
          console.log(`  [${key}] File: ${value.name} (${value.size} bytes)`);
        } else {
          console.log(`  [${key}]: ${value}`);
        }
      }
      console.log("===================");

      // Add a request interceptor hook to see headers
      const hookId = Math.random();
      console.log(
        `[${hookId}] Starting upload to /my-records/type/${recordType}`,
      );

      const response = await StudentRecordServices.uploadRecordByType(
        recordType,
        formData,
      );

      if (response.success) {
        toast.success("Records uploaded successfully");
        setUploadedRecordType(recordTypes[recordType] || recordType);
        setShowInstructions(true);
        setFiles([]);
        setRecordType("");
        setDescription("");
        // Reset form
        const fileInput = document.getElementById("file-input");
        if (fileInput) fileInput.value = "";
      }
    } catch (error) {
      console.error("Failed to upload records:", error);
      const errorData = error.response?.data;
      const errorMessage =
        errorData?.message || error.message || "Failed to upload records";

      console.error("Error status:", error.response?.status);
      console.error("Error data:", errorData);

      // Log detailed validation errors if present
      if (errorData?.errors) {
        console.error("Validation errors:", errorData.errors);
        // Show first validation error to user
        const firstError = Object.values(errorData.errors)[0];
        if (firstError && Array.isArray(firstError)) {
          toast.error(firstError[0]);
        } else {
          toast.error(errorMessage);
        }
      } else {
        // Handle other error types
        if (error.response?.status === 419 || error.response?.status === 422) {
          if (errorMessage.includes("CSRF")) {
            toast.error(
              "Security token expired. Please refresh the page and try again.",
            );
            console.warn("CSRF token mismatch - this should be auto-retried");
          } else {
            toast.error(errorMessage);
          }
        } else {
          toast.error(errorMessage);
        }
      }
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveFile = (index) => {
    setFiles(files.filter((_, i) => i !== index));
  };

  return (
    <div className="student-layout">
      <StudentSidebar />
      <main className="student-main-content">
        <div className="container-fluid p-4">
          <h2 className="mb-4">Upload a Record</h2>

          <div className="row justify-content-center">
            <div className="col-lg-8">
              <div className="card shadow-sm">
                <div className="card-body">
                  <form onSubmit={handleSubmit}>
                    {/* Record Type Selection */}
                    <div className="mb-4">
                      <label
                        htmlFor="record-type"
                        className="form-label fw-semibold"
                      >
                        Record Type <span className="text-danger">*</span>
                      </label>
                      <select
                        id="record-type"
                        className="form-select"
                        value={recordType}
                        onChange={(e) => setRecordType(e.target.value)}
                        disabled={loading || loadingTypes}
                      >
                        <option value="">
                          {loadingTypes
                            ? "Loading record types..."
                            : "-- Choose a record type --"}
                        </option>
                        {recordTypes.map((type) => (
                          <option key={type.id} value={type.code}>
                            {type.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* File Upload */}
                    <div className="mb-4">
                      <label
                        htmlFor="file-input"
                        className="form-label fw-semibold"
                      >
                        Upload Files <span className="text-danger">*</span>
                        <span className="text-muted ms-2">
                          ({files.length}/{MAX_FILES})
                        </span>
                      </label>
                      <div className="upload-area">
                        <input
                          type="file"
                          id="file-input"
                          className="form-control"
                          onChange={handleFileChange}
                          disabled={loading || files.length >= MAX_FILES}
                          accept=".pdf,.jpg,.jpeg,.png,.gif,.doc,.docx,.xls,.xlsx"
                          multiple
                        />
                        <small className="text-muted d-block mt-2">
                          Supported formats: PDF, JPEG, PNG, GIF, DOC, DOCX,
                          XLS, XLSX (Max 50MB per file, up to {MAX_FILES} files)
                        </small>
                      </div>

                      {/* File Preview */}
                      {files.length > 0 && (
                        <div className="mt-3 space-y-2">
                          {files.map((file, index) => (
                            <div
                              key={index}
                              className="p-3 bg-light border rounded d-flex align-items-center justify-content-between"
                            >
                              <div>
                                <p className="mb-1 fw-semibold text-truncate">
                                  {file.name}
                                </p>
                                <small className="text-muted">
                                  {(file.size / 1024 / 1024).toFixed(2)} MB
                                </small>
                              </div>
                              <button
                                type="button"
                                className="btn btn-sm btn-outline-danger"
                                onClick={() => handleRemoveFile(index)}
                              >
                                <FiX size={16} />
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Description */}
                    <div className="mb-4">
                      <label
                        htmlFor="description"
                        className="form-label fw-semibold"
                      >
                        Description (Optional)
                      </label>
                      <textarea
                        id="description"
                        className="form-control"
                        rows={4}
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        placeholder="Add any notes or details about this record..."
                        disabled={loading}
                      />
                    </div>

                    {/* Submit Button */}
                    <div className="d-grid gap-2">
                      <button
                        type="submit"
                        className="btn btn-success btn-lg"
                        disabled={loading || files.length === 0 || !recordType}
                      >
                        {loading ? (
                          <>
                            <span
                              className="spinner-border spinner-border-sm me-2"
                              role="status"
                              aria-hidden="true"
                            ></span>
                            Uploading...
                          </>
                        ) : (
                          <>
                            <FiUploadCloud className="me-2" />
                            Upload Records
                          </>
                        )}
                      </button>
                    </div>
                  </form>
                </div>
              </div>

              {/* Information Card */}
              <div className="card mt-4 bg-light">
                <div className="card-body">
                  <h6 className="card-title fw-semibold">Upload Guidelines</h6>
                  <ul className="mb-0 ps-3">
                    <li>Ensure your file is clearly labeled and organized</li>
                    <li>Upload files in supported formats only</li>
                    <li>Maximum file size is 50MB</li>
                    <li>Your files will be reviewed by the registrar</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Instruction Modal */}
      {showInstructions && (
        <div
          className="modal d-block"
          style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
        >
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header bg-success text-white">
                <h5 className="modal-title">Upload Successful!</h5>
                <button
                  type="button"
                  className="btn-close btn-close-white"
                  onClick={() => setShowInstructions(false)}
                ></button>
              </div>
              <div className="modal-body">
                <div className="alert alert-info mb-4">
                  <strong>Important Instructions:</strong>
                </div>
                <p>
                  Your <strong>{uploadedRecordType}</strong> has been uploaded
                  successfully and submitted for verification.
                </p>
                <div className="card bg-light border-0">
                  <div className="card-body">
                    <h6 className="card-title fw-semibold mb-3">Next Steps:</h6>
                    <ol className="mb-0">
                      <li className="mb-2">
                        A <strong>physical copy</strong> of your{" "}
                        {uploadedRecordType.toLowerCase()} is required.
                      </li>
                      <li className="mb-2">
                        <strong>Visit the Registrar's Office</strong> and
                        present the original document.
                      </li>
                      <li className="mb-0">
                        The registrar will verify the uploaded file using your
                        physical copy.
                      </li>
                    </ol>
                  </div>
                </div>
                <div className="alert alert-warning mt-4 mb-0">
                  <small>
                    <strong>Note:</strong> Your digital copy will be reviewed by
                    the registrar. The physical verification cannot be completed
                    until you visit the office with the original document.
                  </small>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default UploadRecord;
