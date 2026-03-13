import api from "./api.jsx";

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

    // Append scalar fields
    Object.entries(data).forEach(([key, value]) => {
      if (
        key === "files" ||
        key === "file" ||
        value === null ||
        value === undefined ||
        value === ""
      )
        return;
      formData.append(key, value);
    });

    // Append multiple files as files[]
    if (data.files && data.files.length > 0) {
      data.files.forEach((file) => {
        formData.append("files[]", file);
      });
    }

    // Append single file
    if (data.file) {
      formData.append("file", data.file);
    }

    const response = await api.post(`/records/type/${type}`, formData, {
      headers: { "Content-Type": undefined },
    });
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

    // Append multiple files as files[]
    if (data.files && data.files.length > 0) {
      data.files.forEach((file) => {
        formData.append("files[]", file);
      });
    }

    // Append single file
    if (data.file) {
      formData.append("file", data.file);
    }

    // Append file IDs to remove
    if (data.remove_file_ids && data.remove_file_ids.length > 0) {
      data.remove_file_ids.forEach((id) => {
        formData.append("remove_file_ids[]", id);
      });
    }

    formData.append("_method", "PUT");
    const response = await api.post(
      `/records/type/${type}/${recordId}`,
      formData,
      { headers: { "Content-Type": undefined } },
    );
    return response.data;
  },

  async deleteRecordByType(type, recordId) {
    const response = await api.delete(`/records/type/${type}/${recordId}`);
    return response.data;
  },
};

export default StudentRecordServices;
