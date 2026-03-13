import { useState, useCallback, memo } from "react";
import {
  FiX,
  FiLogOut,
  FiHome,
  FiUsers,
  FiChevronDown,
  FiChevronRight,
  FiBook,
  FiAward,
  FiBookOpen,
  FiFolder,
} from "react-icons/fi";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import { toast } from "react-toastify";
import {
  useSidebar,
  NAV_ITEMS,
  BASIC_EDUCATION_ITEMS,
  COLLEGE_ITEMS,
  GRADUATE_ITEMS,
  RECORDS_MANAGEMENT_ITEMS,
  isPathActive,
} from "./sidebarUtils.jsx";
import "./Sidebar.css";

// Icon mapping - only icons actually used
const ICONS = {
  FiHome,
  FiUsers,
  FiBook,
  FiAward,
  FiBookOpen,
  FiFolder,
};

// Collapsible Menu Item Component
const CollapsibleMenuItem = memo(function CollapsibleMenuItem({
  label,
  icon: Icon,
  items,
  pathname,
  navigate,
  level = 0,
}) {
  const [expanded, setExpanded] = useState(() => {
    // Auto-expand if any child is active
    const checkActive = (items) => {
      return items.some((item) => {
        if (item.match && isPathActive(pathname, item.match)) return true;
        if (item.subItems) return checkActive(item.subItems);
        return false;
      });
    };
    return checkActive(items);
  });

  const hasActiveChild = items.some((item) => {
    if (item.match && isPathActive(pathname, item.match)) return true;
    if (item.subItems) {
      const checkNested = (subItems) =>
        subItems.some((sub) => {
          if (sub.match && isPathActive(pathname, sub.match)) return true;
          if (sub.subItems) return checkNested(sub.subItems);
          return false;
        });
      return checkNested(item.subItems);
    }
    return false;
  });

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
              // This is a category header with sub-items (like Academic Track)
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
            } else if (item.subItems && item.path) {
              // This has both a path and sub-items
              return (
                <CollapsibleWithLink
                  key={item.path}
                  item={item}
                  pathname={pathname}
                  navigate={navigate}
                  level={level + 1}
                />
              );
            } else {
              // Regular menu item
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
            }
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

// UserAvatar component
function UserAvatar({ user }) {
  const initials = user
    ? `${user.firstname?.charAt(0) || ""}${user.lastname?.charAt(0) || ""}`.toUpperCase()
    : "AD";

  return (
    <div className="d-flex align-items-center gap-2">
      <div
        className="rounded-circle bg-success d-flex align-items-center justify-content-center text-white fw-bold"
        style={{ width: "45px", height: "45px" }}
      >
        {initials}
      </div>
      <div className="d-none d-lg-flex flex-column">
        <span className="text-white fw-semibold small">
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
        aria-label="Admin navigation"
      >
        <ul className="nav flex-column gap-1">
          {NAV_ITEMS.map((item) => {
            const Icon = ICONS[item.iconName];
            const active = isPathActive(pathname, item.match);
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

          {/* Basic Education Center */}
          <CollapsibleMenuItem
            label="Basic Education"
            icon={FiBook}
            items={BASIC_EDUCATION_ITEMS}
            pathname={pathname}
            navigate={navigate}
          />

          {/* College Degree */}
          <CollapsibleMenuItem
            label="College"
            icon={FiBookOpen}
            items={COLLEGE_ITEMS}
            pathname={pathname}
            navigate={navigate}
          />

          {/* Post Graduate */}
          <CollapsibleMenuItem
            label="Graduate"
            icon={FiAward}
            items={GRADUATE_ITEMS}
            pathname={pathname}
            navigate={navigate}
          />

          {/* Records Management */}
          <CollapsibleMenuItem
            label="Records Management"
            icon={FiFolder}
            items={RECORDS_MANAGEMENT_ITEMS}
            pathname={pathname}
            navigate={navigate}
          />
        </ul>
      </nav>

      {/* Footer - Logout */}
      <div className="p-3 border-top border-secondary mt-auto">
        <button
          type="button"
          className="btn btn-outline-danger w-100 d-flex align-items-center justify-content-center gap-2"
          onClick={handleLogout}
          disabled={loggingOut}
        >
          {loggingOut ? (
            <span
              className="spinner-border spinner-border-sm"
              role="status"
              aria-hidden="true"
            />
          ) : (
            <FiLogOut size={18} />
          )}
          {loggingOut ? "Signing out..." : "Logout"}
        </button>
      </div>
    </div>
  );
}
