import api from "./api.jsx";

const API_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000";

const StudentRecordServices = {
  // ---- Records Management by type endpoints ----
  async getRecordTypes() {
    const response = await api.get("/records/types");
    return response.data;
  },

  async getRecordsByType(type, params = {}) {
    const response = await api.get(`/records/type/${type}`, { params });
    return response.data;
  },

  async createRecordByType(type, data) {
    const formData = new FormData();

    // Append scalar fields (skip files and remove_file_ids)
    Object.entries(data).forEach(([key, value]) => {
      if (
        key === "files" ||
        key === "file" ||
        key === "remove_file_ids" ||
        value === null ||
        value === undefined ||
        value === ""
      )
        return;
      formData.append(key, value);
    });

    // Append multiple files as 'files[]' with square brackets to indicate array to Laravel
    if (data.files && data.files.length > 0) {
      data.files.forEach((file) => {
        formData.append("files[]", file);
      });
    }

    // Append single file
    if (data.file) {
      formData.append("file", data.file);
    }

    const response = await api.post(`/records/type/${type}`, formData);
    return response.data;
  },

  async updateRecordByType(type, recordId, data) {
    const formData = new FormData();

    // Append scalar fields
    Object.entries(data).forEach(([key, value]) => {
      if (
        key === "files" ||
        key === "file" ||
        key === "remove_file_ids" ||
        value === null ||
        value === undefined ||
        value === ""
      )
        return;
      formData.append(key, value);
    });

    // Append multiple files as 'files[]' with square brackets to indicate array to Laravel
    if (data.files && data.files.length > 0) {
      data.files.forEach((file) => {
        formData.append("files[]", file);
      });
    }

    // Append single file
    if (data.file) {
      formData.append("file", data.file);
    }

    // Append file IDs to remove as 'remove_file_ids[]' with square brackets
    if (data.remove_file_ids && data.remove_file_ids.length > 0) {
      data.remove_file_ids.forEach((id) => {
        formData.append("remove_file_ids[]", id);
      });
    }

    formData.append("_method", "PUT");
    const response = await api.post(
      `/records/type/${type}/${recordId}`,
      formData,
    );
    return response.data;
  },

  async deleteRecordByType(type, recordId) {
    const response = await api.delete(`/records/type/${type}/${recordId}`);
    return response.data;
  },

  async uploadRecordByType(type, formData) {
    // Log FormData content for debugging
    console.log("=== UPLOADING RECORD ===");
    console.log("Type:", type);
    console.log("FormData entries:");
    for (let pair of formData.entries()) {
      if (pair[1] instanceof File) {
        console.log(
          `  ${pair[0]}: File (${pair[1].name} - ${pair[1].size} bytes)`,
        );
      } else {
        console.log(`  ${pair[0]}: ${pair[1]}`);
      }
    }

    try {
      // Use fetch API directly for file uploads
      // Fetch properly handles FormData multipart encoding
      const headers = {
        "X-Requested-With": "XMLHttpRequest",
        // DO NOT set Content-Type - let the browser auto-set it with multipart boundary
      };

      // Try to get CSRF token from api client
      try {
        // The api client should have already set up the CSRF token from its initialization
        // We'll let our request interceptor handle it through api.post below
      } catch (e) {
        console.warn("Could not pre-fetch CSRF token:", e.message);
      }

      console.log("Sending FormData upload request");

      // Use axios api client which has CSRF token handling
      const response = await api.post(`/my-records/type/${type}`, formData);

      console.log("Upload response:", response.data);
      return response.data;
    } catch (error) {
      console.error("Upload error:", error);
      if (error.response?.data) {
        console.error("Error response:", error.response.data);
      }
      throw error;
    }
  },

  async getVerifiedStudentsWithRecords(type) {
    const response = await api.get(`/students/verified-with-records/${type}`);
    return response.data;
  },

  async getMyRecords() {
    const response = await api.get("/my-records");
    return response.data;
  },

  // ---- Record Verification endpoints (admin) ----
  async getPendingVerification(params = {}) {
    const response = await api.get("/records/pending-verification", { params });
    return response.data;
  },

  async verifyRecord(recordId, action) {
    const response = await api.post(`/records/${recordId}/verify`, {
      action,
    });
    return response.data;
  },
};

export default StudentRecordServices;
