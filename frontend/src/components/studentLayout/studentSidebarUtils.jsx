import {
  FiFileText,
  FiUploadCloud,
  FiSettings,
  FiCheckSquare,
} from "react-icons/fi";

// Icon mapping
export const ICONS = {
  FiFileText,
  FiUploadCloud,
  FiSettings,
  FiCheckSquare,
};

// Navigation items for the student sidebar
export const MENU_ITEMS = [
  {
    label: "My Records",
    path: "/student/records",
    iconName: "FiFileText",
  },
  {
    label: "Records Checklist",
    path: "/student/records-checklist",
    iconName: "FiCheckSquare",
  },
  {
    label: "Upload a Record",
    path: "/student/upload",
    iconName: "FiUploadCloud",
  },
  {
    label: "Edit Profile",
    path: "/student/profile",
    iconName: "FiSettings",
  },
];

// Check if a path is active (matches current pathname)
export function isPathActive(pathname, path) {
  return pathname === path;
}
