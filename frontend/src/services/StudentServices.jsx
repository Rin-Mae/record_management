import api from "./api.jsx";

const StudentServices = {
  async getStudents(params = {}) {
    const response = await api.get("/students", { params });
    return response.data;
  },

  async getStudent(id) {
    const response = await api.get(`/students/${id}`);
    return response.data;
  },

  async createStudent(data) {
    const response = await api.post("/students", data);
    return response.data;
  },

  async updateStudent(id, data) {
    const response = await api.put(`/students/${id}`, data);
    return response.data;
  },

  async deleteStudent(id) {
    const response = await api.delete(`/students/${id}`);
    return response.data;
  },

  async getStatistics() {
    const response = await api.get("/students/statistics");
    return response.data;
  },

  async getRecordStatistics() {
    const response = await api.get("/students/record-statistics");
    return response.data;
  },
};

export default StudentServices;
