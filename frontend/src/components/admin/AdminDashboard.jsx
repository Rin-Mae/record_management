import { useAuth } from "../../contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { FiMenu, FiUsers, FiBook, FiFileText } from "react-icons/fi";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
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
  const [recordStats, setRecordStats] = useState({
    total: 0,
    daily: [],
    byType: {},
    recordTypes: [],
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && user) {
      fetchStatistics();
      fetchRecordStatistics();
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
    }
  };

  const fetchRecordStatistics = async () => {
    try {
      const response = await StudentServices.getRecordStatistics();
      if (response.success) {
        console.log("Record statistics data:", response.data);
        setRecordStats(response.data);
      }
    } catch (error) {
      console.error("Failed to fetch record statistics:", error);
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

  // Get colors for record types
  const getRecordTypeColor = (index) => {
    const colors = [
      "#dc3545",
      "#fd7e14",
      "#ffc107",
      "#28a745",
      "#17a2b8",
      "#007bff",
      "#6f42c1",
      "#e83e8c",
    ];
    return colors[index % colors.length];
  };

  // Format record type name for display
  const formatRecordTypeName = (key) => {
    return key
      .replace(/_/g, " ")
      .split(" ")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
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
            <div className="col-md-4 col-sm-6">
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

            {/* Total Paper Submissions Card */}
            <div className="col-md-4 col-sm-6">
              <div className="card border-0 shadow-sm h-100">
                <div className="card-body bg-danger bg-opacity-10">
                  <div className="d-flex align-items-center">
                    <div className="flex-shrink-0">
                      <div
                        className="rounded-circle bg-danger bg-opacity-10 d-flex align-items-center justify-content-center"
                        style={{ width: "48px", height: "48px" }}
                      >
                        <FiFileText className="text-danger" size={24} />
                      </div>
                    </div>
                    <div className="flex-grow-1 ms-3">
                      <h6 className="text-muted mb-1">Total Submissions</h6>
                      <h3 className="mb-0">
                        {loading ? (
                          <span className="spinner-border spinner-border-sm" />
                        ) : (
                          recordStats.total
                        )}
                      </h3>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Dynamic Department Cards */}
            {departmentKeys.map((deptKey, idx) => (
              <div key={deptKey} className="col-md-4 col-sm-6 ">
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
            {/* College chart - full width */}
            {departmentKeys.includes("college_degree") && (
              <div key="college_degree" className="col-12">
                {(() => {
                  const idx = departmentKeys.indexOf("college_degree");
                  return (
                    <div className="card border-0 shadow-sm">
                      <div
                        className="card-header border-0 py-3"
                        style={{
                          backgroundColor: getDeptColor(idx) + "15",
                        }}
                      >
                        <h5
                          className="mb-0"
                          style={{ color: getDeptColor(idx) }}
                        >
                          <FiBook
                            className="me-2"
                            style={{ display: "inline" }}
                          />
                          {getDeptDisplayName("college_degree")}
                        </h5>
                        <small className="text-muted">
                          Students per course
                        </small>
                      </div>
                      <div className="card-body">
                        {loading ? (
                          <div className="text-center py-5">
                            <div
                              className="spinner-border"
                              style={{ color: getDeptColor(idx) }}
                              role="status"
                            >
                              <span className="visually-hidden">
                                Loading...
                              </span>
                            </div>
                          </div>
                        ) : (
                          <div style={{ width: "100%", height: 300 }}>
                            <ResponsiveContainer>
                              <AreaChart
                                data={stats.departments["college_degree"] || []}
                                margin={{
                                  top: 10,
                                  right: 30,
                                  left: 0,
                                  bottom: 60,
                                }}
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
                  );
                })()}
              </div>
            )}

            {/* Basic Education and Graduate side by side */}
            {["basic_education_center", "graduate_program"].map((deptKey) => {
              if (!departmentKeys.includes(deptKey)) return null;
              const idx = departmentKeys.indexOf(deptKey);
              return (
                <div key={deptKey} className="col-md-6">
                  <div className="card border-0 shadow-sm">
                    <div
                      className="card-header border-0 py-3"
                      style={{
                        backgroundColor: getDeptColor(idx) + "15",
                      }}
                    >
                      <h5 className="mb-0" style={{ color: getDeptColor(idx) }}>
                        <FiBook
                          className="me-2"
                          style={{ display: "inline" }}
                        />
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
                              margin={{
                                top: 10,
                                right: 30,
                                left: 0,
                                bottom: 60,
                              }}
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
              );
            })}
          </div>

          {/* Paper Submissions Analytics Chart */}
          <div className="row mt-4">
            <div className="col-12">
              <div className="card border-0 shadow-sm">
                <div
                  className="card-header border-0 py-3"
                  style={{
                    backgroundColor: "#dc354515",
                  }}
                >
                  <h5 className="mb-0" style={{ color: "#dc3545" }}>
                    <FiFileText
                      className="me-2"
                      style={{ display: "inline" }}
                    />
                    Paper Submissions Analytics
                  </h5>
                  <small className="text-muted">
                    Submissions per day by type (Last 30 days)
                  </small>
                </div>
                <div className="card-body">
                  {loading && (
                    <div className="text-center py-5">
                      <div
                        className="spinner-border"
                        style={{ color: "#dc3545" }}
                        role="status"
                      >
                        <span className="visually-hidden">Loading...</span>
                      </div>
                    </div>
                  )}
                  {!loading &&
                    recordStats.daily &&
                    recordStats.daily.length > 0 && (
                      <>
                        <div style={{ width: "100%", height: 350 }}>
                          <ResponsiveContainer>
                            <AreaChart
                              data={recordStats.daily}
                              margin={{
                                top: 10,
                                right: 30,
                                left: 0,
                                bottom: 60,
                              }}
                            >
                              <defs>
                                {recordStats.recordTypes.map((type, idx) => {
                                  const typeKey = type
                                    .replace(/ /g, "_")
                                    .toLowerCase();
                                  return (
                                    <linearGradient
                                      key={typeKey}
                                      id={`color-${typeKey}`}
                                      x1="0"
                                      y1="0"
                                      x2="0"
                                      y2="1"
                                    >
                                      <stop
                                        offset="5%"
                                        stopColor={getRecordTypeColor(idx)}
                                        stopOpacity={0.8}
                                      />
                                      <stop
                                        offset="95%"
                                        stopColor={getRecordTypeColor(idx)}
                                        stopOpacity={0}
                                      />
                                    </linearGradient>
                                  );
                                })}
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
                              />
                              <Legend />
                              {recordStats.recordTypes.map((type, idx) => {
                                const typeKey = type
                                  .replace(/ /g, "_")
                                  .toLowerCase();
                                return (
                                  <Area
                                    key={typeKey}
                                    type="linear"
                                    dataKey={typeKey}
                                    stroke={getRecordTypeColor(idx)}
                                    strokeWidth={2}
                                    fillOpacity={0.6}
                                    fill={`url(#color-${typeKey})`}
                                    name={formatRecordTypeName(typeKey)}
                                    stackId="submissions"
                                  />
                                );
                              })}
                            </AreaChart>
                          </ResponsiveContainer>
                        </div>

                        {/* Submission Breakdown Cards */}
                        <div className="row mt-4">
                          {Object.entries(recordStats.byType).map(
                            ([typeKey, count], idx) => (
                              <div
                                key={typeKey}
                                className="col-md-3 col-sm-6 mb-3"
                              >
                                <div className="card border-0 shadow-sm h-100">
                                  <div
                                    className="card-body bg-opacity-10"
                                    style={{
                                      backgroundColor:
                                        getRecordTypeColor(idx) + "20",
                                    }}
                                  >
                                    <div className="d-flex align-items-center">
                                      <div className="flex-shrink-0">
                                        <div
                                          className="rounded-circle d-flex align-items-center justify-content-center"
                                          style={{
                                            width: "12px",
                                            height: "12px",
                                            backgroundColor:
                                              getRecordTypeColor(idx),
                                          }}
                                        />
                                      </div>
                                      <div className="flex-grow-1 ms-3">
                                        <h6 className="text-muted mb-1">
                                          {formatRecordTypeName(typeKey)}
                                        </h6>
                                        <h4
                                          className="mb-0"
                                          style={{
                                            color: getRecordTypeColor(idx),
                                          }}
                                        >
                                          {count}
                                        </h4>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            ),
                          )}
                        </div>
                      </>
                    )}
                  {!loading &&
                    (!recordStats.daily || recordStats.daily.length === 0) && (
                      <div className="alert alert-info">
                        No submission data available
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
