import api from "./api.jsx";

const UserServices = {
  async getUsers(params = {}) {
    const response = await api.get("/users", { params });
    return response.data;
  },

  async getUser(id) {
    const response = await api.get(`/users/${id}`);
    return response.data;
  },

  async createUser(data) {
    const response = await api.post("/users", data);
    return response.data;
  },

  async updateUser(id, data) {
    const response = await api.put(`/users/${id}`, data);
    return response.data;
  },

  async deleteUser(id) {
    const response = await api.delete(`/users/${id}`);
    return response.data;
  },

  async registerStudent(data) {
    const response = await api.post("/auth/register", data);
    return response.data;
  },

  async verifyEmail(data) {
    const response = await api.post("/auth/verify-email", data);
    return response.data;
  },

  async resendOtp(data) {
    const response = await api.post("/auth/resend-otp", data);
    return response.data;
  },

  async getStudentVerifications(status = "pending") {
    const endpoint =
      status === "pending"
        ? "/student-verifications/pending"
        : status === "verified"
          ? "/student-verifications/verified"
          : "/student-verifications/rejected";
    const response = await api.get(endpoint);
    return response.data;
  },

  async approveStudentVerification(id) {
    const response = await api.post(`/student-verifications/${id}/approve`);
    return response.data;
  },

  async rejectStudentVerification(id, data) {
    const response = await api.post(
      `/student-verifications/${id}/reject`,
      data,
    );
    return response.data;
  },

  async deleteStudentApplication(id) {
    const response = await api.delete(`/student-verifications/${id}`);
    return response.data;
  },
};

export default UserServices;
