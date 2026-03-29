import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { useAuth } from "../../contexts/AuthContext";
import UserServices from "../../services/UserServices.jsx";
import {
  formatDate,
  initialUserForm,
  getRoleBadge,
} from "../../utils/index.jsx";
import {
  validateName,
  validateEmail,
  validatePassword,
  validateSpecialCharacters,
} from "../../utils/validation.js";

// Re-export utilities for component use
export { getRoleBadge };

// Custom hook for user management
export function useUsers() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [sidebarVisible, setSidebarVisible] = useState(true);

  // Data state
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    lastPage: 1,
    total: 0,
    perPage: 10,
  });

  // Search state
  const [search, setSearch] = useState("");

  // Modal state
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState("create");
  const [formData, setFormData] = useState(initialUserForm);
  const [formErrors, setFormErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  // View modal state
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);

  // Delete confirmation state
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [userToDelete, setUserToDelete] = useState(null);
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

  // Fetch users
  const fetchUsers = useCallback(
    async (page = 1) => {
      setLoading(true);
      try {
        const params = {
          page,
          per_page: pagination.perPage,
          search: search || undefined,
        };
        const response = await UserServices.getUsers(params);
        if (response.success) {
          setUsers(response.data.data);
          setPagination({
            currentPage: response.data.current_page,
            lastPage: response.data.last_page,
            total: response.data.total,
            perPage: response.data.per_page,
          });
        }
      } catch (error) {
        console.error("Failed to fetch users:", error);
        toast.error("Failed to load users");
      } finally {
        setLoading(false);
      }
    },
    [search, pagination.perPage],
  );

  // Debounced search effect
  useEffect(() => {
    const debounceTimer = setTimeout(() => {
      fetchUsers(1);
    }, 500); // 500ms debounce delay

    return () => clearTimeout(debounceTimer);
  }, [search, fetchUsers]);

  // Handle search
  const handleSearch = useCallback(
    (e) => {
      e.preventDefault();
      fetchUsers(1);
    },
    [fetchUsers],
  );

  // Open create modal
  const openCreateModal = useCallback(() => {
    setFormData(initialUserForm);
    setFormErrors({});
    setModalMode("create");
    setShowModal(true);
  }, []);

  // Open edit modal
  const openEditModal = useCallback((userData) => {
    setFormData({
      ...initialUserForm,
      ...userData,
      birthdate: userData.birthdate ? userData.birthdate.split("T")[0] : "",
      password: "",
      password_confirmation: "",
    });
    setFormErrors({});
    setModalMode("edit");
    setShowModal(true);
  }, []);

  // Open view modal
  const openViewModal = useCallback((userData) => {
    setSelectedUser(userData);
    setShowViewModal(true);
  }, []);

  // Close view modal
  const closeViewModal = useCallback(() => {
    setShowViewModal(false);
    setSelectedUser(null);
  }, []);

  // Handle form input change with validation
  const handleInputChange = useCallback((e) => {
    const { name, value } = e.target;
    let error = null;

    // Validate based on field type
    if (name === "firstname" || name === "lastname") {
      const validation = validateName(value);
      if (!validation.isValid) error = validation.message;
    } else if (name === "middlename" && value) {
      const validation = validateSpecialCharacters(value, ["-", ".", " "]);
      if (!validation.isValid) error = validation.message;
    } else if (name === "email" && value) {
      const validation = validateEmail(value);
      if (!validation.isValid) error = validation.message;
    } else if (name === "username" && value) {
      const validation = validateSpecialCharacters(value, ["-", "_"]);
      if (!validation.isValid) error = validation.message;
    } else if (name === "password" && value) {
      const validation = validatePassword(value);
      if (!validation.isValid) error = validation.message;
    }

    setFormData((prev) => ({ ...prev, [name]: value }));
    setFormErrors((prev) => ({ ...prev, [name]: error ? [error] : null }));
  }, []);

  // Handle form submit
  const handleSubmit = useCallback(
    async (e) => {
      e.preventDefault();
      setSubmitting(true);
      setFormErrors({});

      try {
        const dataToSend = { ...formData };

        // Remove empty password fields for edit mode
        if (modalMode === "edit" && !dataToSend.password) {
          delete dataToSend.password;
          delete dataToSend.password_confirmation;
        }

        if (modalMode === "create") {
          await UserServices.createUser(dataToSend);
          toast.success("User created successfully");
        } else {
          await UserServices.updateUser(formData.id, dataToSend);
          toast.success("User updated successfully");
        }

        setShowModal(false);
        fetchUsers(pagination.currentPage);
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
    [formData, modalMode, pagination.currentPage, fetchUsers],
  );

  // Open delete confirmation
  const openDeleteModal = useCallback((userData) => {
    setUserToDelete(userData);
    setShowDeleteModal(true);
  }, []);

  // Handle delete
  const handleDelete = useCallback(async () => {
    if (!userToDelete) return;
    setDeleting(true);

    try {
      await UserServices.deleteUser(userToDelete.id);
      toast.success("User deleted successfully");
      setShowDeleteModal(false);
      setUserToDelete(null);
      fetchUsers(pagination.currentPage);
    } catch (error) {
      console.error("Delete error:", error);
      toast.error("Failed to delete user");
    } finally {
      setDeleting(false);
    }
  }, [userToDelete, pagination.currentPage, fetchUsers]);

  // Pagination handler
  const goToPage = useCallback(
    (page) => {
      if (page >= 1 && page <= pagination.lastPage) {
        fetchUsers(page);
      }
    },
    [pagination.lastPage, fetchUsers],
  );

  return {
    // Auth & Layout
    user,
    sidebarVisible,
    setSidebarVisible,
    handleLogout,
    toggleSidebar,

    // Data
    users,
    loading,
    pagination,

    // Search & Filter
    search,
    setSearch,
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

    // View Modal
    showViewModal,
    selectedUser,
    openViewModal,
    closeViewModal,

    // Delete Modal
    showDeleteModal,
    setShowDeleteModal,
    userToDelete,
    deleting,
    openDeleteModal,
    handleDelete,

    // Pagination
    goToPage,
  };
}
