import { useState, useEffect, useCallback } from "react";

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
];

// Basic Education submenu items
export const BASIC_EDUCATION_ITEMS = [
  {
    path: "/admin/basic-education/elementary",
    label: "Elementary",
    match: /^\/admin\/basic-education\/elementary$/,
  },
  {
    path: "/admin/basic-education/junior-highschool",
    label: "Junior High School",
    match: /^\/admin\/basic-education\/junior-highschool$/,
  },
  {
    path: "/admin/basic-education/senior-highschool",
    label: "Senior High School",
    match: /^\/admin\/basic-education\/senior-highschool/,
    subItems: [
      {
        label: "Academic Track",
        subItems: [
          {
            path: "/admin/basic-education/senior-highschool/abm",
            label: "ABM",
            match: /^\/admin\/basic-education\/senior-highschool\/abm$/,
          },
          {
            path: "/admin/basic-education/senior-highschool/stem",
            label: "STEM",
            match: /^\/admin\/basic-education\/senior-highschool\/stem$/,
          },
          {
            path: "/admin/basic-education/senior-highschool/humss",
            label: "HUMSS",
            match: /^\/admin\/basic-education\/senior-highschool\/humss$/,
          },
        ],
      },
      {
        label: "Technical-Vocational Track",
        subItems: [
          {
            path: "/admin/basic-education/senior-highschool/he",
            label: "Home Economics",
            match: /^\/admin\/basic-education\/senior-highschool\/he$/,
          },
          {
            path: "/admin/basic-education/senior-highschool/ict",
            label: "ICT",
            match: /^\/admin\/basic-education\/senior-highschool\/ict$/,
          },
        ],
      },
    ],
  },
];

// College submenu items
export const COLLEGE_ITEMS = [
  {
    path: "/admin/college/bsge",
    label: "BSGE",
    match: /^\/admin\/college\/bsge$/,
  },
  {
    path: "/admin/college/bsa",
    label: "BSA",
    match: /^\/admin\/college\/bsa$/,
  },
  {
    path: "/admin/college/beed",
    label: "BEEd",
    match: /^\/admin\/college\/beed$/,
  },
  {
    path: "/admin/college/bsed",
    label: "BSEd",
    match: /^\/admin\/college\/bsed/,
    subItems: [
      {
        path: "/admin/college/bsed/math",
        label: "Major in Math",
        match: /^\/admin\/college\/bsed\/math$/,
      },
      {
        path: "/admin/college/bsed/english",
        label: "Major in English",
        match: /^\/admin\/college\/bsed\/english$/,
      },
      {
        path: "/admin/college/bsed/filipino",
        label: "Major in Filipino",
        match: /^\/admin\/college\/bsed\/filipino$/,
      },
      {
        path: "/admin/college/bsed/science",
        label: "Major in Science",
        match: /^\/admin\/college\/bsed\/science$/,
      },
    ],
  },
  {
    path: "/admin/college/bscrim",
    label: "BSCrim",
    match: /^\/admin\/college\/bscrim$/,
  },
  {
    path: "/admin/college/bsn",
    label: "BSN",
    match: /^\/admin\/college\/bsn$/,
  },
  {
    path: "/admin/college/ab-polsci",
    label: "AB PolSci",
    match: /^\/admin\/college\/ab-polsci$/,
  },
  {
    path: "/admin/college/ab-english",
    label: "AB English",
    match: /^\/admin\/college\/ab-english$/,
  },
  {
    path: "/admin/college/abcom",
    label: "ABCom",
    match: /^\/admin\/college\/abcom$/,
  },
  {
    path: "/admin/college/bsba",
    label: "BSBA",
    match: /^\/admin\/college\/bsba/,
    subItems: [
      {
        path: "/admin/college/bsba/financial-management",
        label: "Financial Management",
        match: /^\/admin\/college\/bsba\/financial-management$/,
      },
      {
        path: "/admin/college/bsba/marketing-management",
        label: "Marketing Management",
        match: /^\/admin\/college\/bsba\/marketing-management$/,
      },
      {
        path: "/admin/college/bsba/human-resource-management",
        label: "Human Resource Management",
        match: /^\/admin\/college\/bsba\/human-resource-management$/,
      },
    ],
  },
  {
    path: "/admin/college/bsma",
    label: "BSMA",
    match: /^\/admin\/college\/bsma$/,
  },
  {
    path: "/admin/college/bsit",
    label: "BSIT",
    match: /^\/admin\/college\/bsit$/,
  },
  {
    path: "/admin/college/bshm",
    label: "BSHM",
    match: /^\/admin\/college\/bshm$/,
  },
];

// Graduate submenu items
export const GRADUATE_ITEMS = [
  {
    path: "/admin/graduate/phd",
    label: "Ph.D",
    match: /^\/admin\/graduate\/phd$/,
  },
  {
    path: "/admin/graduate/edd",
    label: "Ed.D",
    match: /^\/admin\/graduate\/edd$/,
  },
  {
    path: "/admin/graduate/maed",
    label: "MA.Ed",
    match: /^\/admin\/graduate\/maed$/,
  },
  {
    path: "/admin/graduate/maed-ll",
    label: "MA.Ed - L.L",
    match: /^\/admin\/graduate\/maed-ll$/,
  },
  {
    path: "/admin/graduate/mpa",
    label: "MPA",
    match: /^\/admin\/graduate\/mpa$/,
  },
  {
    path: "/admin/graduate/mba",
    label: "MBA",
    match: /^\/admin\/graduate\/mba$/,
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
  {
    path: "/admin/records/enrollment-list",
    label: "Enrollment List",
    match: /^\/admin\/records\/enrollment-list$/,
  },
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
