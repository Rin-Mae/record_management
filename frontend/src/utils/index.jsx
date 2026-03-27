// Shared utility functions

// Get gender display string
export function getGenderDisplay(gender) {
  if (!gender) return "-";
  return gender.charAt(0).toUpperCase() + gender.slice(1).toLowerCase();
}

// Format date for display
export function formatDate(dateString) {
  if (!dateString) return "-";
  try {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  } catch {
    return dateString;
  }
}

// Get role badge class
export function getRoleBadge(role) {
  switch (role?.toLowerCase()) {
    case "admin":
    case "administrator":
      return "bg-danger";
    case "staff":
      return "bg-info";
    default:
      return "bg-secondary";
  }
}

// Initial student form data
export const initialStudentForm = {
  student_id: "",
  firstname: "",
  middlename: "",
  lastname: "",
  suffix: "",
  birthdate: "",
  age: "",
  gender: "",
  address: "",
  contact_number: "",
  email: "",
  course: "",
  year_level: "",
  section: "",
  guardian_name: "",
  guardian_contact: "",
};

// Initial user form data
export const initialUserForm = {
  firstname: "",
  middlename: "",
  lastname: "",
  username: "",
  email: "",
  password: "",
  password_confirmation: "",
  role: "staff",
};
