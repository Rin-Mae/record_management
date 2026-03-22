import { lazy, Suspense } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import { AuthProvider, useAuth } from "./contexts/AuthContext";

// Lazy load components for better initial load performance
const Login = lazy(() => import("./components/Login"));
const Home = lazy(() => import("./components/Home"));
const AdminDashboard = lazy(() => import("./components/admin/AdminDashboard"));
const Students = lazy(() => import("./components/admin/Students"));
const Users = lazy(() => import("./components/admin/Users"));
const Courses = lazy(() => import("./components/admin/Courses"));
const CourseStudents = lazy(() => import("./components/admin/CourseStudents"));
const RecordManagement = lazy(
  () => import("./components/admin/RecordManagement"),
);
const ActivityLogs = lazy(() => import("./components/admin/ActivityLogs"));
// Staff Components
const StaffDashboard = lazy(() => import("./components/staff/StaffDashboard"));
const StaffStudents = lazy(() => import("./components/staff/Students"));
const StaffCourses = lazy(() => import("./components/staff/Courses"));
const StaffRecordManagement = lazy(
  () => import("./components/staff/RecordManagement"),
);
// Enrollment list UI removed

// Loading spinner component
function LoadingSpinner() {
  return (
    <div className="d-flex justify-content-center align-items-center vh-100">
      <div className="spinner-border text-success" role="status">
        <span className="visually-hidden">Loading...</span>
      </div>
    </div>
  );
}

// Protected route component for admin
function AdminRoute({ children }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center vh-100">
        <div className="spinner-border" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  const roles = user?.roles || [];
  if (!roles.includes("admin") && !roles.includes("administrator")) {
    return <Navigate to="/" replace />;
  }

  return children;
}

// Protected route component for staff
function StaffRoute({ children }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center vh-100">
        <div className="spinner-border" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  const roles = user?.roles || [];
  if (!roles.includes("staff")) {
    return <Navigate to="/" replace />;
  }

  return children;
}

function App() {
  return (
    <AuthProvider>
      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        pauseOnHover
        limit={3}
      />
      <BrowserRouter>
        <Suspense fallback={<LoadingSpinner />}>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/" element={<Home />} />
            <Route
              path="/admin/dashboard"
              element={
                <AdminRoute>
                  <AdminDashboard />
                </AdminRoute>
              }
            />
            <Route
              path="/admin/students"
              element={
                <AdminRoute>
                  <Students />
                </AdminRoute>
              }
            />
            <Route
              path="/admin/users"
              element={
                <AdminRoute>
                  <Users />
                </AdminRoute>
              }
            />
            <Route
              path="/admin/courses"
              element={
                <AdminRoute>
                  <Courses />
                </AdminRoute>
              }
            />

            {/* Enrollment List UI removed */}

            {/* Records Management - Unified all records view */}
            <Route
              path="/admin/records"
              element={
                <AdminRoute>
                  <RecordManagement />
                </AdminRoute>
              }
            />

            {/* Records Management by Type */}
            <Route
              path="/admin/records/:recordType"
              element={
                <AdminRoute>
                  <RecordManagement />
                </AdminRoute>
              }
            />

            {/* Activity Logs */}
            <Route
              path="/admin/activity-logs"
              element={
                <AdminRoute>
                  <ActivityLogs />
                </AdminRoute>
              }
            />

            {/* Course-based Routes (must be before catch-all) */}
            <Route
              path="/admin/basic-education/:course/:specialization"
              element={
                <AdminRoute>
                  <CourseStudents />
                </AdminRoute>
              }
            />
            <Route
              path="/admin/basic-education/:course"
              element={
                <AdminRoute>
                  <CourseStudents />
                </AdminRoute>
              }
            />
            <Route
              path="/admin/college/:course/:specialization"
              element={
                <AdminRoute>
                  <CourseStudents />
                </AdminRoute>
              }
            />
            <Route
              path="/admin/college/:course"
              element={
                <AdminRoute>
                  <CourseStudents />
                </AdminRoute>
              }
            />
            <Route
              path="/admin/graduate/:course"
              element={
                <AdminRoute>
                  <CourseStudents />
                </AdminRoute>
              }
            />

            {/* Staff Routes */}
            <Route
              path="/staff/dashboard"
              element={
                <StaffRoute>
                  <StaffDashboard />
                </StaffRoute>
              }
            />
            <Route
              path="/staff/students"
              element={
                <StaffRoute>
                  <StaffStudents />
                </StaffRoute>
              }
            />
            <Route
              path="/staff/courses"
              element={
                <StaffRoute>
                  <StaffCourses />
                </StaffRoute>
              }
            />
            {/* Unified Records View */}
            <Route
              path="/staff/records"
              element={
                <StaffRoute>
                  <StaffRecordManagement />
                </StaffRoute>
              }
            />
            {/* Type-specific Records View */}
            <Route
              path="/staff/records/:recordType"
              element={
                <StaffRoute>
                  <StaffRecordManagement />
                </StaffRoute>
              }
            />

            <Route path="*" element={<Navigate to="/login" replace />} />
          </Routes>
        </Suspense>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
