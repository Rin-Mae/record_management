import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { useAuth } from "../../contexts/AuthContext";
import StudentServices from "../../services/StudentServices.jsx";
import CourseServices from "../../services/CourseServices.jsx";
import {
  getGenderDisplay,
  formatDate,
  initialStudentForm,
} from "../../utils/index.jsx";

// Re-export utilities for component use
export { getGenderDisplay, formatDate };

// Custom hook for student management
export function useStudents() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [sidebarVisible, setSidebarVisible] = useState(true);

  // Data state
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    lastPage: 1,
    total: 0,
    perPage: 10,
  });

  // Courses state
  const [courses, setCourses] = useState([]);
  const [loadingCourses, setLoadingCourses] = useState(true);

  // Search and filter state
  const [search, setSearch] = useState("");
  const [courseFilter, setCourseFilter] = useState("");
  const [yearLevelFilter, setYearLevelFilter] = useState("");

  // Modal state
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState("create");
  const [formData, setFormData] = useState(initialStudentForm);
  const [formErrors, setFormErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [enrollmentOptions, setEnrollmentOptions] = useState([]);
  const [loadingEnrollmentOptions, setLoadingEnrollmentOptions] =
    useState(false);

  // View modal state
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);

  // Delete confirmation state
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [studentToDelete, setStudentToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const handleLogout = useCallback(async () => {
    try {
      await logout();
      navigate("/login");
    } catch (err) {
      console.error("Logout failed:", err);
    }
  }, [logout, navigate]);

  const toggleSidebar = useCallback(() => {
    setSidebarVisible((prev) => !prev);
    window.dispatchEvent(new CustomEvent("toggle-admin-sidebar"));
  }, []);

  // Fetch students
  const fetchStudents = useCallback(
    async (page = 1) => {
      setLoading(true);
      try {
        const params = {
          page,
          per_page: pagination.perPage,
          search: search || undefined,
          course: courseFilter || undefined,
          year_level: yearLevelFilter || undefined,
        };
        const response = await StudentServices.getStudents(params);
        if (response.success) {
          setStudents(response.data.data);
          setPagination({
            currentPage: response.data.current_page,
            lastPage: response.data.last_page,
            total: response.data.total,
            perPage: response.data.per_page,
          });
        }
      } catch (error) {
        console.error("Failed to fetch students:", error);
        toast.error("Failed to load students");
      } finally {
        setLoading(false);
      }
    },
    [search, courseFilter, yearLevelFilter, pagination.perPage],
  );

  useEffect(() => {
    fetchStudents();
  }, [fetchStudents]);

  // Fetch all courses for dropdown
  const fetchCourses = useCallback(async () => {
    setLoadingCourses(true);
    try {
      const response = await CourseServices.getAllCourses();
      if (response.success) {
        setCourses(response.data);
      }
    } catch (error) {
      console.error("Failed to fetch courses:", error);
    } finally {
      setLoadingCourses(false);
    }
  }, []);

  // Fetch courses on mount
  useEffect(() => {
    fetchCourses();
  }, [fetchCourses]);

  // Handle search
  const handleSearch = useCallback(
    (e) => {
      e.preventDefault();
      fetchStudents(1);
    },
    [fetchStudents],
  );

  // Open create modal
  const openCreateModal = useCallback(() => {
    setFormData(initialStudentForm);
    setFormErrors({});
    setModalMode("create");
    setShowModal(true);
  }, []);

  // Open edit modal
  const openEditModal = useCallback((student) => {
    setFormData({
      ...initialStudentForm,
      ...student,
      birthdate: student.birthdate ? student.birthdate.split("T")[0] : "",
      age: student.age || "",
      year_level: student.year_level || "",
    });
    setFormErrors({});
    setModalMode("edit");
    setShowModal(true);
  }, []);

  // Open view modal
  const openViewModal = useCallback((student) => {
    setSelectedStudent(student);
    setShowViewModal(true);
  }, []);

  // Close view modal
  const closeViewModal = useCallback(() => {
    setShowViewModal(false);
    setSelectedStudent(null);
  }, []);

  // Handle form input change
  const handleInputChange = useCallback((e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setFormErrors((prev) => ({ ...prev, [name]: null }));
  }, []);

  // Handle form submit
  const handleSubmit = useCallback(
    async (e) => {
      e.preventDefault();
      setSubmitting(true);
      setFormErrors({});

      try {
        const dataToSend = {
          ...formData,
          age: formData.age ? parseInt(formData.age) : null,
          year_level: formData.year_level
            ? parseInt(formData.year_level)
            : null,
          enrollment_list_id: formData.enrollment_list_id
            ? parseInt(formData.enrollment_list_id)
            : null,
        };

        if (modalMode === "create") {
          await StudentServices.createStudent(dataToSend);
          toast.success("Student created successfully");
        } else {
          await StudentServices.updateStudent(formData.id, dataToSend);
          toast.success("Student updated successfully");
        }

        setShowModal(false);
        fetchStudents(pagination.currentPage);
      } catch (error) {
        console.error("Form submission error:", error);
        if (error.response?.data?.errors) {
          setFormErrors(error.response.data.errors);
        } else {
          toast.error(error.response?.data?.message || "An error occurred");
        }
      } finally {
        setSubmitting(false);
      }
    },
    [formData, modalMode, pagination.currentPage, fetchStudents],
  );

  // Open delete confirmation
  const openDeleteModal = useCallback((student) => {
    setStudentToDelete(student);
    setShowDeleteModal(true);
  }, []);

  // Handle delete
  const handleDelete = useCallback(async () => {
    if (!studentToDelete) return;
    setDeleting(true);

    try {
      await StudentServices.deleteStudent(studentToDelete.id);
      toast.success("Student deleted successfully");
      setShowDeleteModal(false);
      setStudentToDelete(null);
      fetchStudents(pagination.currentPage);
    } catch (error) {
      console.error("Delete error:", error);
      toast.error("Failed to delete student");
    } finally {
      setDeleting(false);
    }
  }, [studentToDelete, pagination.currentPage, fetchStudents]);

  // Pagination handler
  const goToPage = useCallback(
    (page) => {
      if (page >= 1 && page <= pagination.lastPage) {
        fetchStudents(page);
      }
    },
    [pagination.lastPage, fetchStudents],
  );

  return {
    // Auth & Layout
    user,
    sidebarVisible,
    setSidebarVisible,
    handleLogout,
    toggleSidebar,

    // Data
    students,
    loading,
    pagination,

    // Courses
    courses,
    loadingCourses,

    // Search & Filter
    search,
    setSearch,
    courseFilter,
    setCourseFilter,
    yearLevelFilter,
    setYearLevelFilter,
    handleSearch,

    // Create/Edit Modal
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
    enrollmentOptions,
    loadingEnrollmentOptions,

    // View Modal
    showViewModal,
    selectedStudent,
    openViewModal,
    closeViewModal,

    // Delete Modal
    showDeleteModal,
    setShowDeleteModal,
    studentToDelete,
    deleting,
    openDeleteModal,
    handleDelete,

    // Pagination
    goToPage,
  };
}
