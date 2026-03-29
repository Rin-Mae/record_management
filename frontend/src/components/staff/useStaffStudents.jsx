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
import {
  validateName,
  validateStudentId,
  validateEmail,
  validateSpecialCharacters,
} from "../../utils/validation.js";

// Re-export utilities for component use
export { getGenderDisplay, formatDate };

// Custom hook for staff student management (read-only and add-only)
export function useStaffStudents() {
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

  // Modal state (only for create, no edit)
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState(initialStudentForm);
  const [formErrors, setFormErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  // View modal state
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);

  // Fetch students
  const fetchStudents = useCallback(
    (page = 1) => {
      setLoading(true);
      StudentServices.getStudents({
        page,
        per_page: pagination.perPage,
        search,
        course: courseFilter,
        year_level: yearLevelFilter,
        sort_by: "created_at",
        sort_order: "desc",
      })
        .then((response) => {
          if (response.success) {
            setPagination({
              currentPage: response.data.current_page || page,
              lastPage: response.data.last_page || 1,
              total: response.data.total || 0,
              perPage: response.data.per_page || 10,
            });
            setStudents(response.data.data || []);
          }
        })
        .catch(() => {
          toast.error("Failed to fetch students");
        })
        .finally(() => setLoading(false));
    },
    [search, courseFilter, yearLevelFilter, pagination.perPage],
  );

  // Debounced search effect
  useEffect(() => {
    const debounceTimer = setTimeout(() => {
      fetchStudents(1);
    }, 500); // 500ms debounce delay

    return () => clearTimeout(debounceTimer);
  }, [search, courseFilter, yearLevelFilter, fetchStudents]);

  // Fetch courses
  useEffect(() => {
    setLoadingCourses(true);
    CourseServices.getAllCourses()
      .then((response) => {
        if (response.success) {
          setCourses(response.data || []);
        }
      })
      .catch(() => {
        toast.error("Failed to fetch courses");
      })
      .finally(() => setLoadingCourses(false));
  }, []);

  // Handle input change for form with validation
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    let error = null;

    // Validate based on field type
    if (name === "student_id") {
      const validation = validateStudentId(value);
      if (!validation.isValid) error = validation.message;
    } else if (name === "firstname" || name === "lastname") {
      const validation = validateName(value);
      if (!validation.isValid) error = validation.message;
    } else if (name === "middlename" && value) {
      const validation = validateSpecialCharacters(value, ["-", ".", " "]);
      if (!validation.isValid) error = validation.message;
    } else if (name === "email" && value) {
      const validation = validateEmail(value);
      if (!validation.isValid) error = validation.message;
    }

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    if (error) {
      setFormErrors((prev) => ({
        ...prev,
        [name]: [error],
      }));
    } else if (formErrors[name]) {
      setFormErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }
  };

  // Open create modal
  const openCreateModal = () => {
    setFormData(initialStudentForm);
    setFormErrors({});
    setShowModal(true);
  };

  // Handle form submission (create only)
  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setFormErrors({});

    try {
      await StudentServices.createStudent(formData);
      toast.success("Student added successfully");
      setShowModal(false);
      fetchStudents(1);
    } catch (error) {
      const errors = error.response?.data?.errors || {};
      if (Object.keys(errors).length > 0) {
        setFormErrors(errors);
      } else {
        toast.error(error.response?.data?.message || "Failed to add student");
      }
    } finally {
      setSubmitting(false);
    }
  };

  // Open view modal
  const openViewModal = (student) => {
    setSelectedStudent(student);
    setShowViewModal(true);
  };

  // Close view modal
  const closeViewModal = () => {
    setShowViewModal(false);
    setSelectedStudent(null);
  };

  // Logout handler
  const handleLogout = async () => {
    try {
      await logout();
      navigate("/login", { replace: true });
    } catch (err) {
      console.error("Logout failed:", err);
    }
  };

  // Toggle sidebar
  const toggleSidebar = useCallback(() => {
    setSidebarVisible((prev) => !prev);
  }, []);

  // Go to page
  const goToPage = (page) => {
    fetchStudents(page);
  };

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
    fetchStudents,

    // Create Modal
    showModal,
    setShowModal,
    formData,
    formErrors,
    submitting,
    openCreateModal,
    handleInputChange,
    handleSubmit,

    // View Modal
    showViewModal,
    selectedStudent,
    openViewModal,
    closeViewModal,

    // Pagination
    goToPage,
  };
}
