import { useAuth } from "../contexts/AuthContext";
import { Navigate } from "react-router-dom";

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

  // For regular users, show a simple home page
  return (
    <div className="container mt-5">
      <div className="row justify-content-center">
        <div className="col-md-8">
          <div className="card shadow">
            <div className="card-body text-center p-5">
              <h1 className="card-title text-success mb-4">
                Welcome, {user.firstname}!
              </h1>
              <p className="card-text text-muted mb-4">
                You have successfully logged in to the Records Management
                System.
              </p>
              <div className="alert alert-info" role="alert">
                <strong>Note:</strong> This application is currently configured
                for administrative use. If you need to manage records, please
                contact your administrator.
              </div>
              <button
                className="btn btn-success"
                onClick={() => {
                  // You can add logout functionality here if needed
                  window.location.href = "/logout";
                }}
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Home;
