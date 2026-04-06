import { useState, useEffect } from "react";
import { useAuth } from "../../contexts/AuthContext";

import StudentSidebar from "../studentLayout/StudentSidebar";
import UserServices from "../../services/UserServices";
import "./StudentPages.css";

function EditProfile() {
  const { user, setUser } = useAuth();
  const [formData, setFormData] = useState({
    firstname: "",
    middlename: "",
    lastname: "",
    suffix: "",
    email: "",
    birthdate: "",
    age: "",
    gender: "",
    address: "",
    contact_number: "",
  });
  const [formErrors, setFormErrors] = useState({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // Load user data on mount and when user changes
  useEffect(() => {
    if (user) {
      const newFormData = {
        firstname: user.firstname || "",
        middlename: user.middlename || "",
        lastname: user.lastname || "",
        suffix: user.suffix || "",
        email: user.email || "",
        birthdate: user.birthdate || "",
        age: user.age || "",
        gender: user.gender
          ? user.gender.charAt(0).toUpperCase() + user.gender.slice(1)
          : "",
        address: user.address || "",
        contact_number: user.contact_number || "",
      };

      setFormData(newFormData);
      setLoading(false);
    }
  }, [user]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
    // Clear error for this field
    if (formErrors[name]) {
      setFormErrors({
        ...formErrors,
        [name]: "",
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!user?.id) {
      toast.error("User information not available");
      return;
    }

    setSubmitting(true);
    try {
      const response = await UserServices.updateUser(user.id, formData);

      if (response.success) {
        // Update the auth context with new user data, preserving roles and permissions
        if (setUser && response.data) {
          const updatedUser = {
            ...response.data,
            roles: user?.roles,
            permissions: user?.permissions,
            account_status: user?.account_status,
          };
          setUser(updatedUser);
        }
        toast.success(response.message || "Profile updated successfully");
      } else {
        toast.error(response.message || "Failed to update profile");
      }
    } catch (error) {
      const message =
        error.response?.data?.message ||
        error.message ||
        "Failed to update profile";
      toast.error(message);

      // Handle validation errors
      if (error.response?.data?.errors) {
        setFormErrors(error.response.data.errors);
      }
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="student-layout">
        <StudentSidebar />
        <main className="student-main-content">
          <div className="container-fluid p-4">
            <div
              className="d-flex justify-content-center align-items-center"
              style={{ height: "400px" }}
            >
              <div className="spinner-border text-success" role="status">
                <span className="visually-hidden">Loading...</span>
              </div>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="student-layout">
      <StudentSidebar />
      <main className="student-main-content">
        <div className="container-fluid p-4">
          <div className="d-flex align-items-center justify-content-between mb-4">
            <h2 className="mb-0">Edit Profile</h2>
          </div>

          <div className="card shadow-sm">
            <div className="card-body">
              <form onSubmit={handleSubmit}>
                <div className="row">
                  {/* First Name */}
                  <div className="col-md-6 mb-3">
                    <label htmlFor="firstname" className="form-label">
                      First Name <span className="text-danger">*</span>
                    </label>
                    <input
                      type="text"
                      className={`form-control ${
                        formErrors.firstname ? "is-invalid" : ""
                      }`}
                      id="firstname"
                      name="firstname"
                      value={formData.firstname}
                      onChange={handleInputChange}
                      required
                      disabled={submitting}
                    />
                    {formErrors.firstname && (
                      <div className="invalid-feedback d-block">
                        {Array.isArray(formErrors.firstname)
                          ? formErrors.firstname[0]
                          : formErrors.firstname}
                      </div>
                    )}
                  </div>

                  {/* Middle Name */}
                  <div className="col-md-6 mb-3">
                    <label htmlFor="middlename" className="form-label">
                      Middle Name
                    </label>
                    <input
                      type="text"
                      className={`form-control ${
                        formErrors.middlename ? "is-invalid" : ""
                      }`}
                      id="middlename"
                      name="middlename"
                      value={formData.middlename}
                      onChange={handleInputChange}
                      disabled={submitting}
                    />
                    {formErrors.middlename && (
                      <div className="invalid-feedback d-block">
                        {Array.isArray(formErrors.middlename)
                          ? formErrors.middlename[0]
                          : formErrors.middlename}
                      </div>
                    )}
                  </div>

                  {/* Last Name */}
                  <div className="col-md-6 mb-3">
                    <label htmlFor="lastname" className="form-label">
                      Last Name <span className="text-danger">*</span>
                    </label>
                    <input
                      type="text"
                      className={`form-control ${
                        formErrors.lastname ? "is-invalid" : ""
                      }`}
                      id="lastname"
                      name="lastname"
                      value={formData.lastname}
                      onChange={handleInputChange}
                      required
                      disabled={submitting}
                    />
                    {formErrors.lastname && (
                      <div className="invalid-feedback d-block">
                        {Array.isArray(formErrors.lastname)
                          ? formErrors.lastname[0]
                          : formErrors.lastname}
                      </div>
                    )}
                  </div>

                  {/* Suffix */}
                  <div className="col-md-6 mb-3">
                    <label htmlFor="suffix" className="form-label">
                      Suffix
                    </label>
                    <input
                      type="text"
                      className={`form-control ${
                        formErrors.suffix ? "is-invalid" : ""
                      }`}
                      id="suffix"
                      name="suffix"
                      placeholder="Jr., Sr., III, etc."
                      value={formData.suffix}
                      onChange={handleInputChange}
                      disabled={submitting}
                    />
                    {formErrors.suffix && (
                      <div className="invalid-feedback d-block">
                        {Array.isArray(formErrors.suffix)
                          ? formErrors.suffix[0]
                          : formErrors.suffix}
                      </div>
                    )}
                  </div>

                  {/* Email */}
                  <div className="col-md-6 mb-3">
                    <label htmlFor="email" className="form-label">
                      Email <span className="text-danger">*</span>
                    </label>
                    <input
                      type="email"
                      className={`form-control ${
                        formErrors.email ? "is-invalid" : ""
                      }`}
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      required
                      disabled={submitting}
                    />
                    {formErrors.email && (
                      <div className="invalid-feedback d-block">
                        {Array.isArray(formErrors.email)
                          ? formErrors.email[0]
                          : formErrors.email}
                      </div>
                    )}
                  </div>

                  {/* Birthdate */}
                  <div className="col-md-6 mb-3">
                    <label htmlFor="birthdate" className="form-label">
                      Birthdate
                    </label>
                    <input
                      type="date"
                      className={`form-control ${
                        formErrors.birthdate ? "is-invalid" : ""
                      }`}
                      id="birthdate"
                      name="birthdate"
                      value={formData.birthdate}
                      onChange={handleInputChange}
                      disabled={submitting}
                    />
                    {formErrors.birthdate && (
                      <div className="invalid-feedback d-block">
                        {Array.isArray(formErrors.birthdate)
                          ? formErrors.birthdate[0]
                          : formErrors.birthdate}
                      </div>
                    )}
                  </div>

                  {/* Age */}
                  <div className="col-md-6 mb-3">
                    <label htmlFor="age" className="form-label">
                      Age
                    </label>
                    <input
                      type="number"
                      className={`form-control ${
                        formErrors.age ? "is-invalid" : ""
                      }`}
                      id="age"
                      name="age"
                      min="1"
                      max="120"
                      value={formData.age}
                      onChange={handleInputChange}
                      disabled={submitting}
                    />
                    {formErrors.age && (
                      <div className="invalid-feedback d-block">
                        {Array.isArray(formErrors.age)
                          ? formErrors.age[0]
                          : formErrors.age}
                      </div>
                    )}
                  </div>

                  {/* Gender */}
                  <div className="col-md-6 mb-3">
                    <label htmlFor="gender" className="form-label">
                      Gender
                    </label>
                    <select
                      className={`form-select ${
                        formErrors.gender ? "is-invalid" : ""
                      }`}
                      id="gender"
                      name="gender"
                      value={formData.gender}
                      onChange={handleInputChange}
                      disabled={submitting}
                    >
                      <option value="">Select Gender</option>
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                      <option value="Other">Other</option>
                      <option value="Prefer not to say">
                        Prefer not to say
                      </option>
                    </select>
                    {formErrors.gender && (
                      <div className="invalid-feedback d-block">
                        {Array.isArray(formErrors.gender)
                          ? formErrors.gender[0]
                          : formErrors.gender}
                      </div>
                    )}
                  </div>

                  {/* Contact Number */}
                  <div className="col-md-6 mb-3">
                    <label htmlFor="contact_number" className="form-label">
                      Contact Number
                    </label>
                    <input
                      type="tel"
                      className={`form-control ${
                        formErrors.contact_number ? "is-invalid" : ""
                      }`}
                      id="contact_number"
                      name="contact_number"
                      placeholder="Enter contact number (0XXXXXXXXXX)"
                      value={formData.contact_number}
                      onChange={handleInputChange}
                      disabled={submitting}
                    />
                    {formErrors.contact_number && (
                      <div className="invalid-feedback d-block">
                        {Array.isArray(formErrors.contact_number)
                          ? formErrors.contact_number[0]
                          : formErrors.contact_number}
                      </div>
                    )}
                  </div>

                  {/* Address */}
                  <div className="col-12 mb-3">
                    <label htmlFor="address" className="form-label">
                      Address
                    </label>
                    <textarea
                      className={`form-control ${
                        formErrors.address ? "is-invalid" : ""
                      }`}
                      id="address"
                      name="address"
                      rows="3"
                      value={formData.address}
                      onChange={handleInputChange}
                      disabled={submitting}
                    />
                    {formErrors.address && (
                      <div className="invalid-feedback d-block">
                        {Array.isArray(formErrors.address)
                          ? formErrors.address[0]
                          : formErrors.address}
                      </div>
                    )}
                  </div>
                </div>

                {/* Submit Button */}
                <div className="d-flex gap-2">
                  <button
                    type="submit"
                    className="btn btn-success"
                    disabled={submitting}
                  >
                    {submitting ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-2"></span>
                        Saving...
                      </>
                    ) : (
                      "Save Changes"
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default EditProfile;
