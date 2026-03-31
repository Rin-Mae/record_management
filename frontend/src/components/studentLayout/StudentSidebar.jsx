import { useState, useCallback } from "react";
import { FiX, FiLogOut, FiMenu } from "react-icons/fi";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import { toast } from "react-toastify";
import { ICONS, MENU_ITEMS, isPathActive } from "./studentSidebarUtils.jsx";
import "./StudentSidebar.css";

// Sidebar Header Component with Logo and User Info
function SidebarHeader({ user }) {
  return (
    <div className="d-flex flex-column align-items-center gap-1 py-3">
      {/* Logo */}
      <img
        src="/NC Logo.png"
        alt="NC Logo"
        style={{ maxWidth: "110px", height: "auto" }}
      />
      {/* User Name */}
      <div className="d-flex flex-column align-items-center">
        <span
          className="text-white fw-semibold text-center"
          style={{ fontSize: "1.1rem" }}
        >
          {user?.firstname || "Student"} {user?.lastname || ""}
        </span>
        <span className="text-white-50 small text-capitalize">Student</span>
      </div>
    </div>
  );
}

function StudentSidebar({ visible = false, onClose, onLogout }) {
  const [open, setOpen] = useState(visible);
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();
  const [loggingOut, setLoggingOut] = useState(false);
  const pathname = location?.pathname || "";

  const handleClose = useCallback(() => {
    setOpen(false);
    if (typeof onClose === "function") onClose();
  }, [onClose]);

  const toggleSidebar = useCallback(() => {
    setOpen((prev) => !prev);
  }, []);

  const handleLogout = useCallback(async () => {
    if (loggingOut) return;
    setLoggingOut(true);
    try {
      let res;
      if (typeof onLogout === "function") {
        res = await onLogout();
      } else if (typeof logout === "function") {
        res = await logout();
      }
      const msg = res?.message ?? "Logged out successfully";
      toast.success(msg);
      navigate("/login", { replace: true });
    } catch (e) {
      console.error(e);
      toast.error(e?.message || "Failed to logout");
    } finally {
      setLoggingOut(false);
    }
  }, [loggingOut, onLogout, logout, navigate]);

  return (
    <>
      {/* Menu Button for Mobile */}
      <button
        className="btn btn-dark position-fixed d-lg-none"
        style={{ top: "1rem", left: "1rem", zIndex: 1039 }}
        onClick={toggleSidebar}
        aria-label="Toggle sidebar"
      >
        <FiMenu size={20} />
      </button>

      {/* Sidebar Overlay for Mobile */}
      {open && (
        <div
          className="student-sidebar-overlay d-lg-none"
          onClick={handleClose}
        />
      )}

      {/* Sidebar */}
      <div
        className={`student-sidebar bg-dark text-white d-flex flex-column ${
          open ? "open" : ""
        }`}
      >
        {/* Header */}
        <div className="position-relative px-3 border-bottom border-secondary">
          <div className="d-flex align-items-center justify-content-center">
            <SidebarHeader user={user} />
          </div>
          <button
            type="button"
            className="btn btn-outline-light btn-sm d-lg-none position-absolute"
            style={{ top: "1rem", right: "1rem" }}
            aria-label="Close sidebar"
            onClick={handleClose}
          >
            <FiX size={20} />
          </button>
        </div>

        {/* Navigation */}
        <nav
          className="flex-grow-1 p-3 overflow-auto"
          aria-label="Student navigation"
        >
          <ul className="nav flex-column gap-1">
            {MENU_ITEMS.map((item) => {
              const Icon = ICONS[item.iconName];
              const active = isPathActive(pathname, item.path);
              return (
                <li key={item.path} className="nav-item">
                  <button
                    type="button"
                    className={`btn w-100 text-start d-flex align-items-center gap-2 ${
                      active ? "btn-success" : "btn-outline-light border-0"
                    }`}
                    onClick={() => {
                      navigate(item.path);
                      handleClose();
                    }}
                    aria-current={active ? "page" : undefined}
                  >
                    <Icon size={18} />
                    {item.label}
                  </button>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* Footer - Logout Button */}
        <div className="px-3 py-3 border-top border-secondary">
          <button
            type="button"
            className="btn btn-outline-danger w-100 d-flex align-items-center justify-content-center gap-2"
            onClick={handleLogout}
            disabled={loggingOut}
          >
            <FiLogOut size={18} />
            {loggingOut ? "Logging out..." : "Logout"}
          </button>
        </div>
      </div>
    </>
  );
}

export default StudentSidebar;
