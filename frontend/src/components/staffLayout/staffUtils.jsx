import { useState, useEffect, useCallback } from "react";

// Navigation items for staff sidebar - no users, read-only courses
export const STAFF_NAV_ITEMS = [
  {
    path: "/staff/dashboard",
    label: "Dashboard",
    iconName: "FiHome",
    match: /^\/staff\/dashboard$/,
  },
  {
    path: "/staff/students",
    label: "Students",
    iconName: "FiUsers",
    match: /^\/staff\/students$/,
  },
  {
    path: "/staff/courses",
    label: "Courses",
    iconName: "FiBook",
    match: /^\/staff\/courses$/,
  },
  {
    path: "/staff/records",
    label: "Records",
    iconName: "FiFolder",
    match: /^\/staff\/records$/,
  },
];

export function isPathActive(pathname, pattern) {
  return pattern.test(pathname);
}

export function useSidebar(initialVisible = true) {
  const [open, setOpen] = useState(() => {
    const stored = localStorage.getItem("staffSidebarOpen");
    if (stored !== null) return JSON.parse(stored);
    return initialVisible;
  });

  useEffect(() => {
    localStorage.setItem("staffSidebarOpen", JSON.stringify(open));
  }, [open]);

  return [open, setOpen];
}
