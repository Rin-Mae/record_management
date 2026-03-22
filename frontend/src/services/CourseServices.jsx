import api from "./api.jsx";

const CourseServices = {
  async getAllCourses() {
    const response = await api.get("/courses/all");
    return response.data;
  },

  async getCourses(params = {}) {
    const response = await api.get("/courses", { params });
    return response.data;
  },

  async getCourse(id) {
    const response = await api.get(`/courses/${id}`);
    return response.data;
  },

  async createCourse(data) {
    const response = await api.post("/courses", data);
    return response.data;
  },

  async updateCourse(id, data) {
    const response = await api.put(`/courses/${id}`, data);
    return response.data;
  },

  async deleteCourse(id) {
    const response = await api.delete(`/courses/${id}`);
    return response.data;
  },

  async getStatistics() {
    const response = await api.get("/courses/statistics");
    return response.data;
  },
};

export default CourseServices;
