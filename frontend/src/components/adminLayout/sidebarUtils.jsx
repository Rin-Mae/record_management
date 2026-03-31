import { useState, useEffect, useCallback } from "react";
import {
  FiHome,
  FiUsers,
  FiChevronDown,
  FiChevronRight,
  FiFolder,
  FiBook,
  FiActivity,
  FiCheckCircle,
  FiClock,
  FiList,
} from "react-icons/fi";

// Icon mapping
export const ICONS = {
  FiHome,
  FiUsers,
  FiChevronDown,
  FiChevronRight,
  FiFolder,
  FiBook,
  FiActivity,
  FiCheckCircle,
  FiClock,
  FiList,
};

// Navigation items for the sidebar
export const NAV_ITEMS = [
  {
    path: "/admin/dashboard",
    label: "Dashboard",
    iconName: "FiHome",
    match: /^\/admin\/dashboard$/,
  },
  {
    path: "/admin/users",
    label: "Users",
    iconName: "FiUsers",
    match: /^\/admin\/users$/,
  },
  {
    path: "/admin/students",
    label: "Students",
    iconName: "FiUsers",
    match: /^\/admin\/students$/,
  },
  {
    path: "/admin/student-verification",
    label: "Student Verification",
    iconName: "FiCheckCircle",
    match: /^\/admin\/student-verification$/,
  },
  {
    path: "/admin/records-checklist",
    label: "Records Checklist",
    iconName: "FiList",
    match: /^\/admin\/records-checklist$/,
  },
  {
    path: "/admin/courses",
    label: "Courses",
    iconName: "FiBook",
    match: /^\/admin\/courses$/,
  },
  {
    path: "/admin/record-types",
    label: "Record Types",
    iconName: "FiFolder",
    match: /^\/admin\/record-types$/,
  },
  {
    path: "/admin/records",
    label: "Records",
    iconName: "FiFolder",
    match: /^\/admin\/records$/,
  },
  {
    path: "/admin/pending-verification",
    label: "Record Verification",
    iconName: "FiClock",
    match: /^\/admin\/pending-verification$/,
  },
  {
    path: "/admin/activity-logs",
    label: "Activity Logs",
    iconName: "FiActivity",
    match: /^\/admin\/activity-logs$/,
  },
];
// Records management submenu items
export const RECORDS_MANAGEMENT_ITEMS = [
  {
    path: "/admin/records/tor",
    label: "Transcript of Records (TOR)",
    match: /^\/admin\/records\/tor$/,
  },
  {
    path: "/admin/records/special-order",
    label: "Special Order",
    match: /^\/admin\/records\/special-order$/,
  },
  {
    path: "/admin/records/psa",
    label: "PSA",
    match: /^\/admin\/records\/psa$/,
  },
  {
    path: "/admin/records/comprehensive-exam",
    label: "Comprehensive Exam",
    match: /^\/admin\/records\/comprehensive-exam$/,
  },
  {
    path: "/admin/records/diploma",
    label: "Diploma",
    match: /^\/admin\/records\/diploma$/,
  },
  // Enrollment list removed
];

// Check if a path matches the current location
export function isPathActive(pathname, match) {
  if (!match) return false;
  if (match instanceof RegExp) return match.test(pathname);
  return pathname === match;
}

// Custom hook for sidebar state management
export function useSidebar(initialVisible = true) {
  const [isOpen, setIsOpen] = useState(initialVisible);

  useEffect(() => {
    const handleToggle = () => setIsOpen((prev) => !prev);
    window.addEventListener("toggle-admin-sidebar", handleToggle);
    return () =>
      window.removeEventListener("toggle-admin-sidebar", handleToggle);
  }, []);

  useEffect(() => {
    setIsOpen(initialVisible);
  }, [initialVisible]);

  return [isOpen, setIsOpen];
}
