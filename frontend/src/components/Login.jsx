import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { toast } from "react-toastify";
import { useAuth } from "../contexts/AuthContext";
import NCLogo from "../assets/NC Logo.png";

function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const onSubmit = async (ev) => {
    ev.preventDefault();
    setLoading(true);
    try {
      const user = await login({ email, password });
      toast.success("Login successful!");
      // Redirect admin users to admin dashboard, others to home
      const roles = user?.roles || [];
      if (roles.includes("admin") || roles.includes("administrator")) {
        navigate("/admin/dashboard");
      } else {
        navigate("/");
      }
    } catch (err) {
      const msg = err?.response?.data?.message || "Login failed";
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="d-flex justify-content-center align-items-center vh-100 bg-light">
      <div className="card shadow p-4" style={{ width: "400px" }}>
        {/* Logo and Title */}
        <div className="text-center mb-4">
          <img
            src={NCLogo}
            alt="NC Logo"
            style={{ width: "120px", height: "120px", objectFit: "contain" }}
          />
          <h4 className="mt-3 mb-0 fw-bold text-success">
            Records Management System
          </h4>
        </div>

        <h5 className="text-center mb-4 text-muted">Login to your Account</h5>

        <form onSubmit={onSubmit}>
          <div className="mb-3">
            <input
              type="email"
              className="form-control"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="mb-3">
            <input
              type="password"
              className="form-control"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <button className="btn btn-success w-100" disabled={loading}>
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>
      </div>
    </div>
  );
}

export default Login;
