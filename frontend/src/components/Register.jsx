import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { toast } from "react-toastify";
import NCLogo from "../assets/NC Logo.png";
import {
  validateName,
  validateEmail,
  validatePassword,
  validateSpecialCharacters,
} from "../utils/validation.js";
import UserServices from "../services/UserServices.jsx";
import { useCoursesContext } from "../contexts/CoursesContext.jsx";
import api from "../services/api.jsx";

function Register() {
  const navigate = useNavigate();
  const { courses, coursesLoading, coursesError } = useCoursesContext();
  const [registered, setRegistered] = useState(false);
  const [registeredEmail, setRegisteredEmail] = useState("");
  const [formData, setFormData] = useState({
    student_id: "",
    firstname: "",
    middlename: "",
    lastname: "",
    suffix: "",
    email: "",
    birthdate: "",
    address: "",
    contact_number: "",
    gender: "",
    course_id: "",
    password: "",
    password_confirmation: "",
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  // Initialize CSRF token on component mount
  useEffect(() => {
    const initializeCSRF = async () => {
      try {
        await api.get("/csrf-token");
        console.log("CSRF token initialized for registration form");
      } catch (error) {
        console.error("Failed to initialize CSRF token:", error.message);
      }
    };
    initializeCSRF();
  }, []);

  // Show error toast if courses failed to load
  useEffect(() => {
    if (coursesError) {
      toast.error(coursesError);
    }
  }, [coursesError]);

  const validateForm = () => {
    const newErrors = {};

    if (!formData.student_id.trim()) {
      newErrors.student_id = "Student ID is required";
    } else if (!/^\d{8}$/.test(formData.student_id)) {
      newErrors.student_id = "Student ID must be exactly 8 numbers";
    }

    if (!formData.firstname.trim()) {
      newErrors.firstname = "First name is required";
    } else {
      const nameValidation = validateName(formData.firstname);
      if (!nameValidation.isValid) {
        newErrors.firstname = nameValidation.message;
      }
    }

    if (!formData.lastname.trim()) {
      newErrors.lastname = "Last name is required";
    } else {
      const nameValidation = validateName(formData.lastname);
      if (!nameValidation.isValid) {
        newErrors.lastname = nameValidation.message;
      }
    }

    if (formData.middlename && formData.middlename.trim()) {
      const nameValidation = validateName(formData.middlename);
      if (!nameValidation.isValid) {
        newErrors.middlename = nameValidation.message;
      }
    }

    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else {
      const emailValidation = validateEmail(formData.email);
      if (!emailValidation.isValid) {
        newErrors.email = emailValidation.message;
      }
    }

    if (!formData.birthdate) {
      newErrors.birthdate = "Birthdate is required";
    } else {
      const birthDate = new Date(formData.birthdate);
      const today = new Date();
      if (birthDate >= today) {
        newErrors.birthdate = "Birthdate must be in the past";
      }
    }

    if (!formData.course_id) {
      newErrors.course_id = "Course is required";
    }

    if (!formData.address.trim()) {
      newErrors.address = "Address is required";
    }

    if (!formData.contact_number.trim()) {
      newErrors.contact_number = "Contact number is required";
    } else if (!/^0[0-9]{10}$/.test(formData.contact_number)) {
      newErrors.contact_number =
        "Contact number must be a valid Philippine number (0XXXXXXXXXX)";
    }

    if (!formData.gender) {
      newErrors.gender = "Gender is required";
    }

    if (!formData.password) {
      newErrors.password = "Password is required";
    } else {
      const passwordValidation = validatePassword(formData.password);
      if (!passwordValidation.isValid) {
        newErrors.password = passwordValidation.message;
      }
    }

    if (formData.password !== formData.password_confirmation) {
      newErrors.password_confirmation = "Passwords do not match";
    }

    return newErrors;
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const newErrors = validateForm();
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      toast.error("Please fix the errors in the form");
      return;
    }

    setLoading(true);
    try {
      const response = await UserServices.registerStudent(formData);

      if (response.status) {
        // Save email to session storage for verify-email page
        sessionStorage.setItem("registrationEmail", response.email);
        toast.success("Registration successful! Please verify your email.");
        // Redirect to verification page with email as query parameter
        setTimeout(() => {
          navigate(`/verify-email?email=${encodeURIComponent(response.email)}`);
        }, 500);
      } else {
        toast.error(response.message || "Registration failed");
      }
    } catch (error) {
      const msg = error?.response?.data?.message || "Registration failed";
      toast.error(msg);
      if (error?.response?.data?.errors) {
        setErrors(error.response.data.errors);
      }
    } finally {
      setLoading(false);
    }
  };

  if (registered) {
    return (
      <div className="d-flex justify-content-center align-items-center min-vh-100 bg-light py-5">
        <div className="card shadow p-4" style={{ width: "500px" }}>
          <div className="text-center mb-4">
            <img
              src={NCLogo}
              alt="NC Logo"
              style={{ width: "100px", height: "100px", objectFit: "contain" }}
            />
            <h4 className="mt-3 mb-0 fw-bold text-success">
              Records Management System
            </h4>
          </div>

          <div className="alert alert-success" role="alert">
            <h5 className="alert-heading">Registration Successful!</h5>
            <p className="mb-2">
              A verification email has been sent to{" "}
              <strong>{registeredEmail}</strong>
            </p>
            <hr />
            <p className="mb-2 text-muted">
              Please click the verification link in the email to confirm your
              account.
            </p>
          </div>

          <div className="text-center">
            <p className="mb-2 text-muted">
              Didn't receive the email?{" "}
              <button
                type="button"
                className="btn btn-link p-0"
                onClick={() => setRegistered(false)}
              >
                Try again
              </button>
            </p>
            <p className="mb-0 text-muted">
              Already have an account?{" "}
              <button
                type="button"
                className="btn btn-link p-0"
                onClick={() => navigate("/login")}
              >
                Login here
              </button>
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="d-flex justify-content-center align-items-center min-vh-100 bg-light py-5">
      <div className="card shadow p-4" style={{ width: "600px" }}>
        {/* Logo and Title */}
        <div className="text-center mb-4">
          <img
            src={NCLogo}
            alt="NC Logo"
            style={{ width: "100px", height: "100px", objectFit: "contain" }}
          />
          <h4 className="mt-3 mb-0 fw-bold text-success">
            Records Management System
          </h4>
        </div>

        <h5 className="text-center mb-4 text-muted">Register as Student</h5>

        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label className="form-label">
              ID Number <span style={{ color: "red" }}>*</span>
            </label>
            <input
              type="text"
              className={`form-control ${errors.student_id ? "is-invalid" : ""}`}
              placeholder="Enter ID Number"
              name="student_id"
              value={formData.student_id}
              onChange={handleInputChange}
              maxLength="8"
              inputMode="numeric"
              required
            />
            {errors.student_id && (
              <div className="invalid-feedback" style={{ display: "block" }}>
                {errors.student_id}
              </div>
            )}
          </div>

          <div className="row g-2">
            <div className="col-md-4">
              <div className="mb-3">
                <label className="form-label">
                  First Name <span style={{ color: "red" }}>*</span>
                </label>
                <input
                  type="text"
                  className={`form-control ${errors.firstname ? "is-invalid" : ""}`}
                  placeholder="Enter first name"
                  name="firstname"
                  value={formData.firstname}
                  onChange={handleInputChange}
                  required
                />
                {errors.firstname && (
                  <div
                    className="invalid-feedback"
                    style={{ display: "block" }}
                  >
                    {errors.firstname}
                  </div>
                )}
              </div>
            </div>

            <div className="col-md-4">
              <div className="mb-3">
                <label className="form-label">Middle Name</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="Enter middle name "
                  name="middlename"
                  value={formData.middlename}
                  onChange={handleInputChange}
                />
              </div>
            </div>

            <div className="col-md-4">
              <div className="mb-3">
                <label className="form-label">
                  Last Name <span style={{ color: "red" }}>*</span>
                </label>
                <input
                  type="text"
                  className={`form-control ${errors.lastname ? "is-invalid" : ""}`}
                  placeholder="Enter last name"
                  name="lastname"
                  value={formData.lastname}
                  onChange={handleInputChange}
                  required
                />
                {errors.lastname && (
                  <div
                    className="invalid-feedback"
                    style={{ display: "block" }}
                  >
                    {errors.lastname}
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="row g-2">
            <div className="col-md-6">
              <div className="mb-3">
                <label className="form-label">Suffix</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="e.g., Jr., Sr., III (optional)"
                  name="suffix"
                  value={formData.suffix}
                  onChange={handleInputChange}
                />
              </div>
            </div>
          </div>

          <div className="mb-3">
            <label className="form-label">
              Email <span style={{ color: "red" }}>*</span>
            </label>
            <input
              type="email"
              className={`form-control ${errors.email ? "is-invalid" : ""}`}
              placeholder="Enter email address"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              required
            />
            {errors.email && (
              <div className="invalid-feedback" style={{ display: "block" }}>
                {errors.email}
              </div>
            )}
          </div>

          <div className="row g-2">
            <div className="col-md-6">
              <div className="mb-3">
                <label className="form-label">
                  Birthdate <span style={{ color: "red" }}>*</span>
                </label>
                <input
                  type="date"
                  className={`form-control ${errors.birthdate ? "is-invalid" : ""}`}
                  name="birthdate"
                  value={formData.birthdate}
                  onChange={handleInputChange}
                  required
                />
                {errors.birthdate && (
                  <div
                    className="invalid-feedback"
                    style={{ display: "block" }}
                  >
                    {errors.birthdate}
                  </div>
                )}
              </div>
            </div>

            <div className="col-md-6">
              <div className="mb-3">
                <label className="form-label">
                  Gender <span style={{ color: "red" }}>*</span>
                </label>
                <select
                  className={`form-select ${errors.gender ? "is-invalid" : ""}`}
                  name="gender"
                  value={formData.gender}
                  onChange={handleInputChange}
                  required
                >
                  <option value="">Select Gender</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                </select>
                {errors.gender && (
                  <div
                    className="invalid-feedback"
                    style={{ display: "block" }}
                  >
                    {errors.gender}
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="mb-3">
            <label className="form-label">
              Course <span style={{ color: "red" }}>*</span>
            </label>
            <select
              className={`form-select ${errors.course_id ? "is-invalid" : ""}`}
              name="course_id"
              value={formData.course_id}
              onChange={handleInputChange}
              required
              disabled={coursesLoading}
            >
              <option value="">
                {coursesLoading ? "Loading courses..." : "Select Course"}
              </option>
              {courses.length > 0 ? (
                courses.map((course) => (
                  <option key={course.id} value={course.id}>
                    {course.code} - {course.name}
                  </option>
                ))
              ) : (
                <option disabled>No courses available</option>
              )}
            </select>
            {errors.course_id && (
              <div className="invalid-feedback" style={{ display: "block" }}>
                {errors.course_id}
              </div>
            )}
          </div>

          <div className="mb-3">
            <label className="form-label">
              Address <span style={{ color: "red" }}>*</span>
            </label>
            <input
              type="text"
              className={`form-control ${errors.address ? "is-invalid" : ""}`}
              placeholder="Enter address"
              name="address"
              value={formData.address}
              onChange={handleInputChange}
              required
            />
            {errors.address && (
              <div className="invalid-feedback" style={{ display: "block" }}>
                {errors.address}
              </div>
            )}
          </div>

          <div className="mb-3">
            <label className="form-label">
              Contact Number <span style={{ color: "red" }}>*</span>
            </label>
            <input
              type="text"
              className={`form-control ${errors.contact_number ? "is-invalid" : ""}`}
              placeholder="Enter contact number (0XXXXXXXXXX)"
              name="contact_number"
              value={formData.contact_number}
              onChange={handleInputChange}
              inputMode="numeric"
              required
            />
            {errors.contact_number && (
              <div className="invalid-feedback" style={{ display: "block" }}>
                {errors.contact_number}
              </div>
            )}
          </div>

          <div className="mb-3">
            <label className="form-label">
              Password <span style={{ color: "red" }}>*</span>
            </label>
            <input
              type="password"
              className={`form-control ${errors.password ? "is-invalid" : ""}`}
              placeholder="Enter password"
              name="password"
              value={formData.password}
              onChange={handleInputChange}
              required
            />
            {errors.password && (
              <div className="invalid-feedback" style={{ display: "block" }}>
                {errors.password}
              </div>
            )}
          </div>

          <div className="mb-3">
            <label className="form-label">
              Confirm Password <span style={{ color: "red" }}>*</span>
            </label>
            <input
              type="password"
              className={`form-control ${errors.password_confirmation ? "is-invalid" : ""}`}
              placeholder="Confirm password"
              name="password_confirmation"
              value={formData.password_confirmation}
              onChange={handleInputChange}
              required
            />
            {errors.password_confirmation && (
              <div className="invalid-feedback" style={{ display: "block" }}>
                {errors.password_confirmation}
              </div>
            )}
          </div>

          <button className="btn btn-success w-100 mb-3" disabled={loading}>
            {loading ? "Registering..." : "Register"}
          </button>
        </form>

        <div className="text-center">
          <p className="mb-0 text-muted">
            Already have an account?{" "}
            <button
              type="button"
              className="btn btn-link p-0"
              onClick={() => navigate("/login")}
            >
              Login here
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}

export default Register;
