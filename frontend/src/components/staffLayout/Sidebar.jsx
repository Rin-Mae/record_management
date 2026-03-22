import { useState, useCallback } from "react";
import {
  FiX,
  FiLogOut,
  FiHome,
  FiUsers,
  FiBook,
  FiFolder,
} from "react-icons/fi";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import { toast } from "react-toastify";
import { useSidebar, STAFF_NAV_ITEMS, isPathActive } from "./staffUtils.jsx";
import "../adminLayout/Sidebar.css";

const ICONS = {
  FiHome,
  FiUsers,
  FiBook,
  FiFolder,
};

function UserAvatar({ user }) {
  const initials = user
    ? `${user.firstname?.charAt(0) || ""}${user.lastname?.charAt(0) || ""}`.toUpperCase()
    : "ST";

  return (
    <div className="d-flex align-items-center gap-2">
      <div
        className="rounded-circle bg-info d-flex align-items-center justify-content-center text-white fw-bold"
        style={{ width: "45px", height: "45px" }}
      >
        {initials}
      </div>
      <div className="d-none d-lg-flex flex-column">
        <span className="text-white fw-semibold small">
          {user?.firstname || "Staff"} {user?.lastname || ""}
        </span>
        <span className="text-white-50 small text-capitalize">
          {user?.roles?.[0] || "Staff"}
        </span>
      </div>
    </div>
  );
}

export default function StaffSidebar({ visible, onClose, user, onLogout }) {
  const [open, setOpen] = useSidebar(visible);
  const navigate = useNavigate();
  const location = useLocation();
  const { logout } = useAuth();
  const [loggingOut, setLoggingOut] = useState(false);
  const pathname = location?.pathname || "";

  const handleClose = useCallback(() => {
    setOpen(false);
    if (typeof onClose === "function") onClose();
  }, [setOpen, onClose]);

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
      const msg = res?.message ?? "Logged out";
      toast.success(msg);
      navigate("/", { replace: true });
    } catch (e) {
      console.error(e);
      toast.error(e?.message || "Failed to logout");
    } finally {
      setLoggingOut(false);
    }
  }, [loggingOut, onLogout, logout, navigate]);

  return (
    <div
      className={`admin-sidebar bg-dark text-white d-flex flex-column ${open ? "open" : ""}`}
    >
      {/* Header */}
      <div className="d-flex align-items-center justify-content-between px-3 py-3 border-bottom border-secondary">
        <UserAvatar user={user} />
        <button
          type="button"
          className="btn btn-outline-light btn-sm d-lg-none"
          aria-label="Close sidebar"
          onClick={handleClose}
        >
          <FiX size={20} />
        </button>
      </div>

      {/* Navigation */}
      <nav
        className="flex-grow-1 p-3 overflow-auto"
        aria-label="Staff navigation"
      >
        <ul className="nav flex-column gap-1">
          {STAFF_NAV_ITEMS.map((item) => {
            const Icon = ICONS[item.iconName];
            const active = isPathActive(pathname, item.match);

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

      {/* Footer - Logout */}
      <div className="border-top border-secondary p-3">
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
  );
}
