import { useAuth } from "../contexts/AuthContext";
import { Navigate } from "react-router-dom";
import StudentSidebar from "./studentLayout/StudentSidebar";

function Home() {
  const { user, loading } = useAuth();

  // If loading, show spinner
  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center vh-100">
        <div className="spinner-border text-success" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  // If not authenticated, redirect to login
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // If admin, redirect to admin dashboard
  const roles = user?.roles || [];
  if (roles.includes("admin") || roles.includes("administrator")) {
    return <Navigate to="/admin/dashboard" replace />;
  }

  // If staff, redirect to staff dashboard
  if (roles.includes("staff")) {
    return <Navigate to="/staff/dashboard" replace />;
  }

  // For regular student users, show home page with sidebar
  return (
    <div className="student-layout">
      <StudentSidebar />
      <main className="student-main-content">
        <div className="container-fluid p-4">
          <div className="row justify-content-center">
            <div className="col-lg-8">
              <div className="card shadow">
                <div className="card-body text-center p-5">
                  <h1 className="card-title text-success mb-4">
                    Welcome, {user.firstname}!
                  </h1>
                  <p className="card-text text-muted mb-4">
                    You have successfully logged in to the Records Management
                    System.
                  </p>
                  <p className="card-text mb-4">
                    Use the sidebar to navigate and manage your academic
                    records.
                  </p>
                  <div className="alert alert-info" role="alert">
                    <strong>Getting Started:</strong> Click on "My Records" to
                    view your uploaded documents or "Upload a Record" to submit
                    new files.
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default Home;
