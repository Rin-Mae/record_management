import { lazy, Suspense } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import { CoursesProvider } from "./contexts/CoursesContext";

// Lazy load components for better initial load performance
const Login = lazy(() => import("./components/Login"));
const Register = lazy(() => import("./components/Register"));
const VerifyEmail = lazy(() => import("./components/VerifyEmail"));
const RegistrarOfficeMessage = lazy(
  () => import("./components/RegistrarOfficeMessage"),
);
const Home = lazy(() => import("./components/Home"));
const AdminDashboard = lazy(() => import("./components/admin/AdminDashboard"));
const Students = lazy(() => import("./components/admin/Students"));
const Users = lazy(() => import("./components/admin/Users"));
const Courses = lazy(() => import("./components/admin/Courses"));
const CourseStudents = lazy(() => import("./components/admin/CourseStudents"));
const RecordManagement = lazy(
  () => import("./components/admin/RecordManagement"),
);
const RecordTypeManagement = lazy(
  () => import("./components/admin/RecordTypeManagement"),
);
const ActivityLogs = lazy(() => import("./components/admin/ActivityLogs"));
const StudentVerification = lazy(
  () => import("./components/admin/StudentVerification"),
);
const PendingVerification = lazy(
  () => import("./components/admin/PendingVerification"),
);
const MyRecords = lazy(() => import("./components/student/MyRecords"));
const UploadRecord = lazy(() => import("./components/student/UploadRecord"));
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

// Protected route component for students
function StudentRoute({ children }) {
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

  // Allow students to access (anyone who is not admin/administrator/staff)
  const roles = user?.roles || [];
  if (
    roles.includes("admin") ||
    roles.includes("administrator") ||
    roles.includes("staff")
  ) {
    return <Navigate to="/" replace />;
  }

  return children;
}

function App() {
  return (
    <AuthProvider>
      <CoursesProvider>
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
              <Route path="/register" element={<Register />} />
              <Route path="/verify-email" element={<VerifyEmail />} />
              <Route
                path="/registrar-message"
                element={<RegistrarOfficeMessage />}
              />
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

              {/* Record Type Management */}
              <Route
                path="/admin/record-types"
                element={
                  <AdminRoute>
                    <RecordTypeManagement />
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

              {/* Pending Record Verification */}
              <Route
                path="/admin/pending-verification"
                element={
                  <AdminRoute>
                    <PendingVerification />
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

              {/* Student Verification */}
              <Route
                path="/admin/student-verification"
                element={
                  <AdminRoute>
                    <StudentVerification />
                  </AdminRoute>
                }
              />

              {/* Student Routes */}
              <Route
                path="/student/records"
                element={
                  <StudentRoute>
                    <MyRecords />
                  </StudentRoute>
                }
              />
              <Route
                path="/student/upload"
                element={
                  <StudentRoute>
                    <UploadRecord />
                  </StudentRoute>
                }
              />

              <Route path="*" element={<Navigate to="/login" replace />} />
            </Routes>
          </Suspense>
        </BrowserRouter>
      </CoursesProvider>
    </AuthProvider>
  );
}

export default App;
