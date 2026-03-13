import api from "./api.jsx";

const EnrollmentListServices = {
  /**
   * Get all enrollment periods (paginated).
   */
  async getEnrollmentLists(params = {}) {
    const response = await api.get("/enrollment-lists", { params });
    return response.data;
  },

  /**
   * Create a new enrollment period.
   */
  async createEnrollmentList(data) {
    const response = await api.post("/enrollment-lists", data);
    return response.data;
  },

  /**
   * Update an enrollment period.
   */
  async updateEnrollmentList(id, data) {
    const response = await api.put(`/enrollment-lists/${id}`, data);
    return response.data;
  },

  /**
   * Delete an enrollment period.
   */
  async deleteEnrollmentList(id) {
    const response = await api.delete(`/enrollment-lists/${id}`);
    return response.data;
  },

  /**
   * Get students for an enrollment period (paginated).
   */
  async getEnrollmentStudents(enrollmentId, params = {}) {
    const response = await api.get(
      `/enrollment-lists/${enrollmentId}/students`,
      { params },
    );
    return response.data;
  },

  /**
   * Add students to an enrollment period.
   */
  async addStudents(enrollmentId, studentIds) {
    const response = await api.post(
      `/enrollment-lists/${enrollmentId}/students`,
      { student_ids: studentIds },
    );
    return response.data;
  },

  /**
   * Remove a student from an enrollment period.
   */
  async removeStudent(enrollmentId, studentId) {
    const response = await api.delete(
      `/enrollment-lists/${enrollmentId}/students/${studentId}`,
    );
    return response.data;
  },
};

export default EnrollmentListServices;
