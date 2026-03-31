import { FiFileText, FiUploadCloud } from "react-icons/fi";

// Icon mapping
export const ICONS = {
  FiFileText,
  FiUploadCloud,
};

// Navigation items for the student sidebar
export const MENU_ITEMS = [
  {
    label: "My Records",
    path: "/student/records",
    iconName: "FiFileText",
  },
  {
    label: "Upload a Record",
    path: "/student/upload",
    iconName: "FiUploadCloud",
  },
];

// Check if a path is active (matches current pathname)
export function isPathActive(pathname, path) {
  return pathname === path;
}
