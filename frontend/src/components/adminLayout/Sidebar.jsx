import { useState, useCallback, memo } from "react";
import { FiX, FiLogOut, FiChevronDown, FiChevronRight } from "react-icons/fi";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import { toast } from "react-toastify";
import { useSidebar, NAV_ITEMS, isPathActive, ICONS } from "./sidebarUtils.jsx";
import "./Sidebar.css";

// Collapsible Menu Item Component
const CollapsibleMenuItem = memo(function CollapsibleMenuItem({
  label,
  icon: Icon,
  items,
  pathname,
  navigate,
  level = 0,
}) {
  const checkItemActive = (item) => {
    if (item.match && isPathActive(pathname, item.match)) return true;
    if (item.subItems) return item.subItems.some(checkItemActive);
    return false;
  };

  const [expanded, setExpanded] = useState(() => items.some(checkItemActive));
  const hasActiveChild = items.some(checkItemActive);

  return (
    <li className="nav-item">
      <button
        type="button"
        className={`btn w-100 text-start d-flex align-items-center justify-content-between gap-2 ${
          hasActiveChild ? "btn-success" : "btn-outline-light border-0"
        }`}
        onClick={() => setExpanded(!expanded)}
        style={{ paddingLeft: `${12 + level * 12}px` }}
      >
        <span className="d-flex align-items-center gap-2">
          {Icon && <Icon size={18} />}
          {label}
        </span>
        {expanded ? <FiChevronDown size={16} /> : <FiChevronRight size={16} />}
      </button>
      {expanded && (
        <ul className="nav flex-column ms-2 mt-1 gap-1">
          {items.map((item, idx) => {
            if (item.subItems && !item.path) {
              return (
                <NestedCollapsible
                  key={idx}
                  label={item.label}
                  items={item.subItems}
                  pathname={pathname}
                  navigate={navigate}
                  level={level + 1}
                />
              );
            }
            if (item.subItems && item.path) {
              return (
                <CollapsibleWithLink
                  key={item.path}
                  item={item}
                  pathname={pathname}
                  navigate={navigate}
                  level={level + 1}
                />
              );
            }
            const active = item.match && isPathActive(pathname, item.match);
            return (
              <li key={item.path} className="nav-item">
                <button
                  type="button"
                  className={`btn btn-sm w-100 text-start d-flex align-items-center gap-2 ${
                    active ? "btn-success" : "btn-outline-light border-0"
                  }`}
                  onClick={() => navigate(item.path)}
                  style={{
                    paddingLeft: `${12 + (level + 1) * 12}px`,
                    fontSize: "0.875rem",
                  }}
                >
                  {item.label}
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </li>
  );
});

// Nested collapsible for categories like "Academic Track"
function NestedCollapsible({ label, items, pathname, navigate, level }) {
  const [expanded, setExpanded] = useState(() => {
    return items.some(
      (item) => item.match && isPathActive(pathname, item.match),
    );
  });

  const hasActiveChild = items.some(
    (item) => item.match && isPathActive(pathname, item.match),
  );

  return (
    <li className="nav-item">
      <button
        type="button"
        className={`btn btn-sm w-100 text-start d-flex align-items-center justify-content-between gap-2 ${
          hasActiveChild ? "text-success" : "btn-outline-light border-0"
        }`}
        onClick={() => setExpanded(!expanded)}
        style={{ paddingLeft: `${12 + level * 12}px`, fontSize: "0.875rem" }}
      >
        <span>{label}</span>
        {expanded ? <FiChevronDown size={14} /> : <FiChevronRight size={14} />}
      </button>
      {expanded && (
        <ul className="nav flex-column ms-2 mt-1 gap-1">
          {items.map((item) => {
            const active = item.match && isPathActive(pathname, item.match);
            return (
              <li key={item.path} className="nav-item">
                <button
                  type="button"
                  className={`btn btn-sm w-100 text-start ${
                    active ? "btn-success" : "btn-outline-light border-0"
                  }`}
                  onClick={() => navigate(item.path)}
                  style={{
                    paddingLeft: `${12 + (level + 1) * 12}px`,
                    fontSize: "0.8rem",
                  }}
                >
                  {item.label}
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </li>
  );
}

// Collapsible item that also has a direct link
function CollapsibleWithLink({ item, pathname, navigate, level }) {
  const [expanded, setExpanded] = useState(() => {
    return item.subItems.some(
      (sub) => sub.match && isPathActive(pathname, sub.match),
    );
  });

  const active = item.match && isPathActive(pathname, item.match);
  const hasActiveChild = item.subItems.some(
    (sub) => sub.match && isPathActive(pathname, sub.match),
  );

  return (
    <li className="nav-item">
      <div className="d-flex align-items-center">
        <button
          type="button"
          className={`btn btn-sm flex-grow-1 text-start d-flex align-items-center gap-2 ${
            active || hasActiveChild
              ? "btn-success"
              : "btn-outline-light border-0"
          }`}
          onClick={() => navigate(item.path)}
          style={{ paddingLeft: `${12 + level * 12}px`, fontSize: "0.875rem" }}
        >
          {item.label}
        </button>
        <button
          type="button"
          className="btn btn-sm btn-outline-light border-0 px-2"
          onClick={() => setExpanded(!expanded)}
        >
          {expanded ? (
            <FiChevronDown size={14} />
          ) : (
            <FiChevronRight size={14} />
          )}
        </button>
      </div>
      {expanded && (
        <ul className="nav flex-column ms-2 mt-1 gap-1">
          {item.subItems.map((sub) => {
            const subActive = sub.match && isPathActive(pathname, sub.match);
            return (
              <li key={sub.path} className="nav-item">
                <button
                  type="button"
                  className={`btn btn-sm w-100 text-start ${
                    subActive ? "btn-success" : "btn-outline-light border-0"
                  }`}
                  onClick={() => navigate(sub.path)}
                  style={{
                    paddingLeft: `${12 + (level + 1) * 12}px`,
                    fontSize: "0.8rem",
                  }}
                >
                  {sub.label}
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </li>
  );
}

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
          {user?.firstname || "Admin"} {user?.lastname || ""}
        </span>
        <span className="text-white-50 small text-capitalize">
          {user?.role || "Administrator"}
        </span>
      </div>
    </div>
  );
}

// UserAvatar component (kept for backward compatibility if needed)
function UserAvatar({ user }) {
  return (
    <div className="d-flex align-items-center gap-2">
      <div className="d-flex flex-column">
        <span className="text-white fw-semibold" style={{ fontSize: "1.1rem" }}>
          {user?.firstname || "Admin"} {user?.lastname || ""}
        </span>
        <span className="text-white-50 small text-capitalize">
          {user?.roles?.[0] || "Administrator"}
        </span>
      </div>
    </div>
  );
}

export default function Sidebar({ visible, onClose, user, onLogout }) {
  const [open, setOpen] = useSidebar(visible);
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const { logout } = useAuth();
  const [loggingOut, setLoggingOut] = useState(false);

  const handleClose = useCallback(() => {
    setOpen(false);
    onClose?.();
  }, [setOpen, onClose]);

  const handleLogout = useCallback(async () => {
    if (loggingOut) return;
    setLoggingOut(true);
    try {
      const res = await (onLogout?.() ?? logout?.());
      toast.success(res?.message ?? "Logged out");
      navigate("/", { replace: true });
    } catch (error) {
      console.error(error);
      toast.error(error?.message || "Failed to logout");
    } finally {
      setLoggingOut(false);
    }
  }, [loggingOut, onLogout, logout, navigate]);

  return (
    <div
      className={`admin-sidebar bg-dark text-white d-flex flex-column ${open ? "open" : ""}`}
    >
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

      <nav
        className="flex-grow-1 p-3 overflow-auto"
        aria-label="Admin navigation"
      >
        <ul className="nav flex-column gap-1">
          {NAV_ITEMS.map((item) => {
            const Icon = ICONS[item.iconName];
            const active = isPathActive(pathname, item.match);
            if (!Icon) {
              console.warn(`Icon not found for: ${item.iconName}`);
              return null;
            }
            return (
              <li key={item.path} className="nav-item">
                <button
                  type="button"
                  className={`btn w-100 text-start d-flex align-items-center gap-2 ${
                    active ? "btn-success" : "btn-outline-light border-0"
                  }`}
                  onClick={() => navigate(item.path)}
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

      <div className="p-3 border-top border-secondary mt-auto">
        <button
          type="button"
          className="btn btn-outline-danger w-100 d-flex align-items-center justify-content-center gap-2"
          onClick={handleLogout}
          disabled={loggingOut}
        >
          <FiLogOut size={18} />
          {loggingOut ? "Signing out..." : "Logout"}
        </button>
      </div>
    </div>
  );
}
