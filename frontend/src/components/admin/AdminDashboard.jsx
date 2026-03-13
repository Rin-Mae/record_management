import { useAuth } from "../../contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { FiMenu, FiUsers, FiBook, FiBookOpen, FiAward } from "react-icons/fi";
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
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [sidebarVisible, setSidebarVisible] = useState(true);
  const [stats, setStats] = useState({
    total: 0,
    bec: 0,
    college: 0,
    graduate: 0,
    becCourses: [],
    collegeCourses: [],
    graduateCourses: [],
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStatistics();
  }, []);

  const fetchStatistics = async () => {
    try {
      const response = await StudentServices.getStatistics();
      if (response.success) {
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

          {/* Stats Cards */}
          <div className="row g-4">
            <div className="col-md-3 col-sm-6">
              <div className="card border-0 shadow-sm h-100">
                <div className="card-body">
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
            <div className="col-md-3 col-sm-6">
              <div className="card border-0 shadow-sm h-100">
                <div className="card-body">
                  <div className="d-flex align-items-center">
                    <div className="flex-shrink-0">
                      <div
                        className="rounded-circle bg-success bg-opacity-10 d-flex align-items-center justify-content-center"
                        style={{ width: "48px", height: "48px" }}
                      >
                        <FiBook className="text-success" size={24} />
                      </div>
                    </div>
                    <div className="flex-grow-1 ms-3">
                      <h6 className="text-muted mb-1">Basic Education</h6>
                      <h3 className="mb-0">
                        {loading ? (
                          <span className="spinner-border spinner-border-sm" />
                        ) : (
                          stats.bec
                        )}
                      </h3>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="col-md-3 col-sm-6">
              <div className="card border-0 shadow-sm h-100">
                <div className="card-body">
                  <div className="d-flex align-items-center">
                    <div className="flex-shrink-0">
                      <div
                        className="rounded-circle bg-info bg-opacity-10 d-flex align-items-center justify-content-center"
                        style={{ width: "48px", height: "48px" }}
                      >
                        <FiBookOpen className="text-info" size={24} />
                      </div>
                    </div>
                    <div className="flex-grow-1 ms-3">
                      <h6 className="text-muted mb-1">College</h6>
                      <h3 className="mb-0">
                        {loading ? (
                          <span className="spinner-border spinner-border-sm" />
                        ) : (
                          stats.college
                        )}
                      </h3>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="col-md-3 col-sm-6">
              <div className="card border-0 shadow-sm h-100">
                <div className="card-body">
                  <div className="d-flex align-items-center">
                    <div className="flex-shrink-0">
                      <div
                        className="rounded-circle bg-warning bg-opacity-10 d-flex align-items-center justify-content-center"
                        style={{ width: "48px", height: "48px" }}
                      >
                        <FiAward className="text-warning" size={24} />
                      </div>
                    </div>
                    <div className="flex-grow-1 ms-3">
                      <h6 className="text-muted mb-1">Graduate</h6>
                      <h3 className="mb-0">
                        {loading ? (
                          <span className="spinner-border spinner-border-sm" />
                        ) : (
                          stats.graduate
                        )}
                      </h3>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Students Chart */}
          <div className="row mt-4 g-4">
            {/* Basic Education Chart */}
            <div className="col-12">
              <div className="card border-0 shadow-sm">
                <div className="card-header bg-white border-0 py-3">
                  <h5 className="mb-0 text-success">
                    <FiBook className="me-2" />
                    Basic Education Center
                  </h5>
                  <small className="text-muted">
                    Students per course/track
                  </small>
                </div>
                <div className="card-body">
                  {loading ? (
                    <div className="text-center py-5">
                      <div
                        className="spinner-border text-success"
                        role="status"
                      >
                        <span className="visually-hidden">Loading...</span>
                      </div>
                    </div>
                  ) : (
                    <div style={{ width: "100%", height: 250 }}>
                      <ResponsiveContainer>
                        <AreaChart
                          data={stats.becCourses}
                          margin={{ top: 10, right: 30, left: 0, bottom: 5 }}
                        >
                          <defs>
                            <linearGradient
                              id="colorBEC"
                              x1="0"
                              y1="0"
                              x2="0"
                              y2="1"
                            >
                              <stop
                                offset="5%"
                                stopColor="#198754"
                                stopOpacity={0.8}
                              />
                              <stop
                                offset="95%"
                                stopColor="#198754"
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
                            tick={{ fontSize: 11 }}
                            tickLine={false}
                            axisLine={false}
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
                            stroke="#198754"
                            strokeWidth={2}
                            fillOpacity={1}
                            fill="url(#colorBEC)"
                          />
                        </AreaChart>
                      </ResponsiveContainer>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* College Chart */}
            <div className="col-12">
              <div className="card border-0 shadow-sm">
                <div className="card-header bg-white border-0 py-3">
                  <h5 className="mb-0 text-info">
                    <FiBookOpen className="me-2" />
                    College
                  </h5>
                  <small className="text-muted">
                    Students per degree program
                  </small>
                </div>
                <div className="card-body">
                  {loading ? (
                    <div className="text-center py-5">
                      <div className="spinner-border text-info" role="status">
                        <span className="visually-hidden">Loading...</span>
                      </div>
                    </div>
                  ) : (
                    <div style={{ width: "100%", height: 300 }}>
                      <ResponsiveContainer>
                        <AreaChart
                          data={stats.collegeCourses}
                          margin={{ top: 10, right: 30, left: 0, bottom: 60 }}
                        >
                          <defs>
                            <linearGradient
                              id="colorCollege"
                              x1="0"
                              y1="0"
                              x2="0"
                              y2="1"
                            >
                              <stop
                                offset="5%"
                                stopColor="#0dcaf0"
                                stopOpacity={0.8}
                              />
                              <stop
                                offset="95%"
                                stopColor="#0dcaf0"
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
                            stroke="#0dcaf0"
                            strokeWidth={2}
                            fillOpacity={1}
                            fill="url(#colorCollege)"
                          />
                        </AreaChart>
                      </ResponsiveContainer>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Graduate Chart */}
            <div className="col-12">
              <div className="card border-0 shadow-sm">
                <div className="card-header bg-white border-0 py-3">
                  <h5 className="mb-0 text-warning">
                    <FiAward className="me-2" />
                    Graduate
                  </h5>
                  <small className="text-muted">Students per program</small>
                </div>
                <div className="card-body">
                  {loading ? (
                    <div className="text-center py-5">
                      <div
                        className="spinner-border text-warning"
                        role="status"
                      >
                        <span className="visually-hidden">Loading...</span>
                      </div>
                    </div>
                  ) : (
                    <div style={{ width: "100%", height: 250 }}>
                      <ResponsiveContainer>
                        <AreaChart
                          data={stats.graduateCourses}
                          margin={{ top: 10, right: 30, left: 0, bottom: 5 }}
                        >
                          <defs>
                            <linearGradient
                              id="colorGraduate"
                              x1="0"
                              y1="0"
                              x2="0"
                              y2="1"
                            >
                              <stop
                                offset="5%"
                                stopColor="#ffc107"
                                stopOpacity={0.8}
                              />
                              <stop
                                offset="95%"
                                stopColor="#ffc107"
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
                            tick={{ fontSize: 11 }}
                            tickLine={false}
                            axisLine={false}
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
                            stroke="#ffc107"
                            strokeWidth={2}
                            fillOpacity={1}
                            fill="url(#colorGraduate)"
                          />
                        </AreaChart>
                      </ResponsiveContainer>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default AdminDashboard;
