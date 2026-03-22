import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { useAuth } from "../../contexts/AuthContext";
import { FiMenu, FiSearch, FiFilter } from "react-icons/fi";
import Sidebar from "../adminLayout/Sidebar";
import { formatDate } from "../../utils/index.jsx";

export default function ActivityLogs() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [sidebarVisible, setSidebarVisible] = useState(true);

  // Activity logs data
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    lastPage: 1,
    total: 0,
    perPage: 20,
  });

  // Filters
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedModel, setSelectedModel] = useState("");
  const [selectedAction, setSelectedAction] = useState("");
  const [models, setModels] = useState([]);
  const [actions, setActions] = useState([]);

  const handleLogout = async () => {
    try {
      await logout();
      navigate("/", { replace: true });
    } catch (err) {
      toast.error("Logout failed");
    }
  };

  const toggleSidebar = () => {
    setSidebarVisible(!sidebarVisible);
    window.dispatchEvent(new CustomEvent("toggle-admin-sidebar"));
  };

  // Fetch filters (models and actions)
  useEffect(() => {
    const fetchFilters = async () => {
      try {
        const [modelsRes, actionsRes] = await Promise.all([
          fetch("http://localhost:8000/activity-logs/models", {
            credentials: "include",
          }),
          fetch("http://localhost:8000/activity-logs/actions", {
            credentials: "include",
          }),
        ]);

        const modelsData = await modelsRes.json();
        const actionsData = await actionsRes.json();

        if (modelsData.success) setModels(modelsData.data);
        if (actionsData.success) setActions(actionsData.data);
      } catch (error) {
        console.error("Failed to fetch filters:", error);
      }
    };

    fetchFilters();
  }, []);

  // Fetch activity logs
  const fetchLogs = useCallback(
    async (page = 1) => {
      setLoading(true);
      try {
        const params = new URLSearchParams({
          page,
          per_page: pagination.perPage,
          search: searchTerm,
          ...(selectedModel && { model: selectedModel }),
          ...(selectedAction && { action: selectedAction }),
        });

        const response = await fetch(
          `http://localhost:8000/activity-logs?${params}`,
          {
            credentials: "include",
          },
        );

        const data = await response.json();

        if (data.success) {
          setLogs(data.data);
          setPagination({
            currentPage: data.pagination.current_page,
            lastPage: data.pagination.last_page,
            total: data.pagination.total,
            perPage: data.pagination.per_page,
          });
        }
      } catch (error) {
        console.error("Failed to fetch activity logs:", error);
        toast.error("Failed to fetch activity logs");
      } finally {
        setLoading(false);
      }
    },
    [searchTerm, selectedModel, selectedAction, pagination.perPage],
  );

  useEffect(() => {
    fetchLogs(1);
  }, [fetchLogs]);

  const handlePageChange = (page) => {
    if (page >= 1 && page <= pagination.lastPage) {
      fetchLogs(page);
    }
  };

  return (
    <>
      <Sidebar
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
            onClick={toggleSidebar}
            aria-label="Toggle sidebar"
          >
            <FiMenu size={20} />
          </button>
          <span className="fw-semibold">Activity Logs</span>
        </div>

        {/* Main Content */}
        <div className="container-fluid p-4">
          {/* Header */}
          <div className="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-2">
            <div>
              <h1 className="h3 mb-1">Activity Logs</h1>
              <p className="text-muted mb-0">
                View all actions performed by users in the system
              </p>
            </div>
          </div>

          {/* Filters */}
          <div className="card border-0 shadow-sm mb-4">
            <div className="card-body">
              <div className="row g-3">
                <div className="col-12 col-md-5">
                  <div className="input-group">
                    <span className="input-group-text bg-white">
                      <FiSearch size={16} />
                    </span>
                    <input
                      type="text"
                      className="form-control border-start-0"
                      placeholder="Search by model ID or model type..."
                      value={searchTerm}
                      onChange={(e) => {
                        setSearchTerm(e.target.value);
                        setPagination((p) => ({ ...p, currentPage: 1 }));
                      }}
                    />
                  </div>
                </div>

                <div className="col-12 col-md-3">
                  <select
                    className="form-select"
                    value={selectedModel}
                    onChange={(e) => {
                      setSelectedModel(e.target.value);
                      setPagination((p) => ({ ...p, currentPage: 1 }));
                    }}
                  >
                    <option value="">All Models</option>
                    {models.map((model) => (
                      <option key={model} value={model}>
                        {model}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="col-12 col-md-3">
                  <select
                    className="form-select"
                    value={selectedAction}
                    onChange={(e) => {
                      setSelectedAction(e.target.value);
                      setPagination((p) => ({ ...p, currentPage: 1 }));
                    }}
                  >
                    <option value="">All Actions</option>
                    {actions.map((action) => (
                      <option key={action} value={action}>
                        {action}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="col-auto ms-auto">
                  <span className="text-muted">
                    {pagination.total} log{pagination.total !== 1 && "s"} found
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Activity Logs Table */}
          <div className="card border-0 shadow-sm">
            <div className="card-body p-0">
              {loading ? (
                <div className="text-center py-5">
                  <div className="spinner-border text-success" role="status">
                    <span className="visually-hidden">Loading...</span>
                  </div>
                </div>
              ) : logs.length === 0 ? (
                <div className="text-center py-5">
                  <h5 className="text-muted">No activity logs found</h5>
                  <p className="text-muted">Try adjusting your filters</p>
                </div>
              ) : (
                <div className="table-responsive">
                  <table className="table table-hover align-middle mb-0">
                    <thead className="table-light">
                      <tr>
                        <th>Model</th>
                        <th>ID</th>
                        <th>Action</th>
                        <th>Date</th>
                      </tr>
                    </thead>
                    <tbody>
                      {logs.map((log) => (
                        <tr key={log.id}>
                          <td>
                            <span className="badge bg-primary">
                              {log.model}
                            </span>
                          </td>
                          <td>
                            <code>{log.model_id}</code>
                          </td>
                          <td>
                            <span
                              className={`badge ${
                                log.action === "created"
                                  ? "bg-success"
                                  : log.action === "updated"
                                    ? "bg-info"
                                    : log.action === "deleted"
                                      ? "bg-danger"
                                      : "bg-secondary"
                              }`}
                            >
                              {log.action}
                            </span>
                          </td>
                          <td>
                            <small className="text-muted">
                              {formatDate(log.created_at)}
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
                        onClick={() =>
                          handlePageChange(pagination.currentPage - 1)
                        }
                      >
                        Previous
                      </button>
                    </li>
                    {Array.from(
                      { length: pagination.lastPage },
                      (_, i) => i + 1,
                    )
                      .filter(
                        (page) =>
                          page === 1 ||
                          page === pagination.lastPage ||
                          Math.abs(page - pagination.currentPage) <= 1,
                      )
                      .map((page, idx, arr) => (
                        <li key={page}>
                          {idx > 0 && arr[idx - 1] !== page - 1 && (
                            <span className="page-link disabled">...</span>
                          )}
                          <button
                            className={`page-link ${page === pagination.currentPage ? "active" : ""}`}
                            onClick={() => handlePageChange(page)}
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
                        onClick={() =>
                          handlePageChange(pagination.currentPage + 1)
                        }
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
