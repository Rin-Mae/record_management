import { useState, useEffect, useCallback } from "react";
import { toast } from "react-toastify";
import { useAuth } from "../../contexts/AuthContext";
import CourseServices from "../../services/CourseServices.jsx";
import { FiMenu, FiSearch } from "react-icons/fi";
import StaffSidebar from "../staffLayout/Sidebar";

export default function StaffCourses() {
  const { user, logout } = useAuth();
  const [sidebarVisible, setSidebarVisible] = useState(true);

  const handleLogout = async () => {
    try {
      await logout();
      window.location.href = "/login";
    } catch (err) {
      console.error("Logout failed:", err);
    }
  };

  // Courses data
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    lastPage: 1,
    total: 0,
    perPage: 10,
  });

  // Search and filters
  const [search, setSearch] = useState("");
  const [departmentFilter, setDepartmentFilter] = useState("");

  // Unique departments for filter
  const [departments, setDepartments] = useState([]);

  // Fetch courses
  const fetchCourses = useCallback(
    async (page = 1) => {
      setLoading(true);
      try {
        const response = await CourseServices.getCourses({
          page,
          per_page: pagination.perPage,
          search,
          department: departmentFilter,
          sort_by: "code",
          sort_order: "asc",
        });

        if (response.success) {
          setCourses(response.data.data);
          setPagination({
            currentPage: response.data.current_page,
            lastPage: response.data.last_page,
            total: response.data.total,
            perPage: response.data.per_page,
          });

          // Extract unique departments
          const uniqueDepts = [
            ...new Set(
              response.data.data.map((c) => c.department).filter(Boolean),
            ),
          ];
          setDepartments(uniqueDepts);
        }
      } catch (error) {
        toast.error("Failed to fetch courses");
      } finally {
        setLoading(false);
      }
    },
    [search, departmentFilter, pagination.perPage],
  );

  // Load initial data
  useEffect(() => {
    fetchCourses();
  }, [fetchCourses]);

  return (
    <>
      <StaffSidebar
        visible={sidebarVisible}
        onClose={() => setSidebarVisible(false)}
        user={user}
        onLogout={handleLogout}
      />

      <div className="admin-main-content min-vh-100 bg-light">
        {/* Mobile Header */}
        <div className="d-lg-none bg-dark text-white p-3 d-flex align-items-center">
          <button
            className="btn btn-outline-light btn-sm me-3"
            onClick={() => setSidebarVisible(!sidebarVisible)}
            aria-label="Toggle sidebar"
          >
            <FiMenu size={20} />
          </button>
          <span className="fw-semibold">Courses</span>
        </div>

        {/* Main Content */}
        <div className="container-fluid p-4">
          {/* Page header */}
          <div className="mb-4">
            <div className="mb-3">
              <h2 className="mb-1">Courses</h2>
              <p className="text-muted mb-0">
                View courses from all departments
              </p>
            </div>

            {/* Filters and Search */}
            <div className="card">
              <div className="card-body">
                <div className="row g-2">
                  {/* Search */}
                  <div className="col-12 col-md-8">
                    <div className="input-group">
                      <span className="input-group-text">
                        <FiSearch size={16} />
                      </span>
                      <input
                        type="text"
                        className="form-control"
                        placeholder="Search course..."
                        value={search}
                        onChange={(e) => {
                          setSearch(e.target.value);
                          setPagination((p) => ({ ...p, currentPage: 1 }));
                        }}
                      />
                    </div>
                  </div>

                  {/* Department Filter */}
                  <div className="col-12 col-md-4">
                    <select
                      className="form-select"
                      value={departmentFilter}
                      onChange={(e) => {
                        setDepartmentFilter(e.target.value);
                        setPagination((p) => ({ ...p, currentPage: 1 }));
                      }}
                    >
                      <option value="">All Departments</option>
                      <option value="Basic education center">
                        Basic Education Center
                      </option>
                      <option value="college">College</option>
                      <option value="Graduate">Graduate</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Courses Table */}
          <div className="card">
            <div className="card-body p-0">
              {loading ? (
                <div className="text-center py-5">
                  <div className="spinner-border text-success" role="status">
                    <span className="visually-hidden">Loading...</span>
                  </div>
                </div>
              ) : courses.length === 0 ? (
                <div className="text-center py-5 text-muted">
                  <p>No courses found</p>
                </div>
              ) : (
                <div className="table-responsive">
                  <table className="table table-hover align-middle mb-0">
                    <thead className="table-light">
                      <tr>
                        <th>Code</th>
                        <th>Name</th>
                        <th>Department</th>
                        <th>Description</th>
                      </tr>
                    </thead>
                    <tbody>
                      {courses.map((course) => (
                        <tr key={course.id}>
                          <td>
                            <span className="badge bg-primary">
                              {course.code}
                            </span>
                          </td>
                          <td className="fw-semibold">{course.name}</td>
                          <td>
                            <small className="text-muted">
                              {course.department || "-"}
                            </small>
                          </td>
                          <td>
                            <small className="text-muted">
                              {course.description
                                ? course.description.substring(0, 50) +
                                  (course.description.length > 50 ? "..." : "")
                                : "-"}
                            </small>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* Pagination */}
            {pagination.lastPage > 1 && (
              <div className="card-footer bg-white d-flex justify-content-between align-items-center">
                <small className="text-muted">
                  Showing{" "}
                  {(pagination.currentPage - 1) * pagination.perPage + 1}-
                  {Math.min(
                    pagination.currentPage * pagination.perPage,
                    pagination.total,
                  )}{" "}
                  of {pagination.total}
                </small>
                <nav>
                  <ul className="pagination pagination-sm mb-0">
                    <li
                      className={`page-item ${pagination.currentPage === 1 ? "disabled" : ""}`}
                    >
                      <button
                        className="page-link"
                        onClick={() => fetchCourses(pagination.currentPage - 1)}
                      >
                        Previous
                      </button>
                    </li>
                    {Array.from(
                      { length: pagination.lastPage },
                      (_, i) => i + 1,
                    ).map((page) => (
                      <li
                        key={page}
                        className={`page-item ${pagination.currentPage === page ? "active" : ""}`}
                      >
                        <button
                          className="page-link"
                          onClick={() => fetchCourses(page)}
                        >
                          {page}
                        </button>
                      </li>
                    ))}
                    <li
                      className={`page-item ${pagination.currentPage === pagination.lastPage ? "disabled" : ""}`}
                    >
                      <button
                        className="page-link"
                        onClick={() => fetchCourses(pagination.currentPage + 1)}
                      >
                        Next
                      </button>
                    </li>
                  </ul>
                </nav>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
