import { lazy, Suspense } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import { AuthProvider, useAuth } from "./contexts/AuthContext";

// Lazy load components for better initial load performance
const Login = lazy(() => import("./components/Login"));
const AdminDashboard = lazy(() => import("./components/admin/AdminDashboard"));
const Students = lazy(() => import("./components/admin/Students"));
const Users = lazy(() => import("./components/admin/Users"));
const CourseStudents = lazy(() => import("./components/admin/CourseStudents"));
const RecordManagement = lazy(
  () => import("./components/admin/RecordManagement"),
);
const EnrollmentListManagement = lazy(
  () => import("./components/admin/EnrollmentListManagement"),
);

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

            {/* Enrollment List (separate component) */}
            <Route
              path="/admin/records/enrollment-list"
              element={
                <AdminRoute>
                  <EnrollmentListManagement />
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

            <Route path="*" element={<Navigate to="/login" replace />} />
          </Routes>
        </Suspense>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
