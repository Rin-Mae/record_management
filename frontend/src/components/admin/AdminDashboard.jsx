import { useAuth } from "../../contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { FiMenu, FiUsers, FiBook } from "react-icons/fi";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import Sidebar from "../adminLayout/Sidebar";
import StudentServices from "../../services/StudentServices.jsx";

function AdminDashboard() {
  const { user, logout, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [sidebarVisible, setSidebarVisible] = useState(true);
  const [stats, setStats] = useState({
    total: 0,
    departments: {},
    departmentTotals: {},
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && user) {
      fetchStatistics();
    }
  }, [authLoading, user]);

  const fetchStatistics = async () => {
    try {
      const response = await StudentServices.getStatistics();
      if (response.success) {
        console.log("Statistics data:", response.data);
        setStats(response.data);
      }
    } catch (error) {
      console.error("Failed to fetch statistics:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      navigate("/login");
    } catch (err) {
      console.error("Logout failed:", err);
    }
  };

  const toggleSidebar = () => {
    setSidebarVisible(!sidebarVisible);
    window.dispatchEvent(new CustomEvent("toggle-admin-sidebar"));
  };

  // Get department display name
  const getDeptDisplayName = (deptKey) => {
    const names = {
      basic_education_center: "Basic Education",
      college_degree: "College",
      graduate_program: "Graduate",
    };
    return names[deptKey] || deptKey.replace(/_/g, " ").toUpperCase();
  };

  // Get colors for departments
  const getDeptColor = (index) => {
    const colors = ["#198754", "#0dcaf0", "#ffc107", "#6f42c1", "#fd7e14"];
    return colors[index % colors.length];
  };

  const departmentKeys = Object.keys(stats.departments || {});

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
          <span className="fw-semibold">Admin Panel</span>
        </div>

        {/* Main Content */}
        <div className="container-fluid p-4">
          <div className="row">
            <div className="col-12">
              <h1 className="mb-4">Dashboard</h1>
            </div>
          </div>

          {/* Total Students Card */}
          <div className="row g-4 mb-4">
            <div className="col-md-3 col-sm-6">
              <div className="card border-0 shadow-sm h-100">
                <div className="card-body bg-info bg-opacity-10">
                  <div className="d-flex align-items-center">
                    <div className="flex-shrink-0">
                      <div
                        className="rounded-circle bg-primary bg-opacity-10 d-flex align-items-center justify-content-center"
                        style={{ width: "48px", height: "48px" }}
                      >
                        <FiUsers className="text-primary" size={24} />
                      </div>
                    </div>
                    <div className="flex-grow-1 ms-3">
                      <h6 className="text-muted mb-1">Total Students</h6>
                      <h3 className="mb-0">
                        {loading ? (
                          <span className="spinner-border spinner-border-sm" />
                        ) : (
                          stats.total
                        )}
                      </h3>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Dynamic Department Cards */}
            {departmentKeys.map((deptKey, idx) => (
              <div key={deptKey} className="col-md-3 col-sm-6">
                <div className="card border-0 shadow-sm h-100">
                  <div
                    className="card-body bg-opacity-10"
                    style={{
                      backgroundColor: getDeptColor(idx) + "20",
                    }}
                  >
                    <div className="d-flex align-items-center">
                      <div className="flex-shrink-0">
                        <div
                          className="rounded-circle d-flex align-items-center justify-content-center"
                          style={{
                            width: "48px",
                            height: "48px",
                            backgroundColor: getDeptColor(idx) + "20",
                          }}
                        >
                          <FiBook
                            style={{ color: getDeptColor(idx) }}
                            size={24}
                          />
                        </div>
                      </div>
                      <div className="flex-grow-1 ms-3">
                        <h6 className="text-muted mb-1">
                          {getDeptDisplayName(deptKey)}
                        </h6>
                        <h3 className="mb-0">
                          {loading ? (
                            <span className="spinner-border spinner-border-sm" />
                          ) : (
                            stats.departmentTotals[deptKey] || 0
                          )}
                        </h3>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Charts for each department */}
          <div className="row mt-4 g-4">
            {departmentKeys.map((deptKey, idx) => (
              <div key={deptKey} className="col-12">
                <div className="card border-0 shadow-sm">
                  <div
                    className="card-header border-0 py-3"
                    style={{
                      backgroundColor: getDeptColor(idx) + "15",
                    }}
                  >
                    <h5 className="mb-0" style={{ color: getDeptColor(idx) }}>
                      <FiBook className="me-2" style={{ display: "inline" }} />
                      {getDeptDisplayName(deptKey)}
                    </h5>
                    <small className="text-muted">Students per course</small>
                  </div>
                  <div className="card-body">
                    {loading ? (
                      <div className="text-center py-5">
                        <div
                          className="spinner-border"
                          style={{ color: getDeptColor(idx) }}
                          role="status"
                        >
                          <span className="visually-hidden">Loading...</span>
                        </div>
                      </div>
                    ) : (
                      <div style={{ width: "100%", height: 300 }}>
                        <ResponsiveContainer>
                          <AreaChart
                            data={stats.departments[deptKey] || []}
                            margin={{ top: 10, right: 30, left: 0, bottom: 60 }}
                          >
                            <defs>
                              <linearGradient
                                id={`color${idx}`}
                                x1="0"
                                y1="0"
                                x2="0"
                                y2="1"
                              >
                                <stop
                                  offset="5%"
                                  stopColor={getDeptColor(idx)}
                                  stopOpacity={0.8}
                                />
                                <stop
                                  offset="95%"
                                  stopColor={getDeptColor(idx)}
                                  stopOpacity={0}
                                />
                              </linearGradient>
                            </defs>
                            <CartesianGrid
                              strokeDasharray="3 3"
                              vertical={false}
                            />
                            <XAxis
                              dataKey="name"
                              tick={{ fontSize: 9 }}
                              tickLine={false}
                              axisLine={false}
                              angle={-45}
                              textAnchor="end"
                              height={60}
                            />
                            <YAxis
                              tick={{ fontSize: 12 }}
                              tickLine={false}
                              axisLine={false}
                              allowDecimals={false}
                            />
                            <Tooltip
                              contentStyle={{
                                backgroundColor: "#fff",
                                border: "1px solid #e9ecef",
                                borderRadius: "8px",
                                boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
                              }}
                              formatter={(value) => [value, "Students"]}
                            />
                            <Area
                              type="linear"
                              dataKey="count"
                              stroke={getDeptColor(idx)}
                              strokeWidth={2}
                              fillOpacity={1}
                              fill={`url(#color${idx})`}
                            />
                          </AreaChart>
                        </ResponsiveContainer>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}

export default AdminDashboard;
