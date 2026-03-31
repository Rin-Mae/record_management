import { useNavigate } from "react-router-dom";
import NCLogo from "../assets/NC Logo.png";

function RegistrarOfficeMessage() {
  const navigate = useNavigate();

  return (
    <div className="d-flex justify-content-center align-items-center min-vh-100 bg-light py-5">
      <div className="card shadow p-4" style={{ width: "600px" }}>
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

        <div className="alert alert-info" role="alert">
          <h5 className="alert-heading">Email Verified Successfully!</h5>
          <hr />
          <p className="mb-3">
            Thank you for verifying your email address. Your registration is now
            pending admin approval.
          </p>
          <div className="alert alert-warning mb-3">
            <h6 className="mb-2 fw-bold">Next Step:</h6>
            <p className="mb-2">
              Please visit the <strong>Registrar's Office</strong> with the
              following document:
            </p>
            <div className="bg-light p-3 rounded">
              <p className="mb-0 fw-bold text-dark">Your Student ID or COR</p>
            </div>
            <p className="mb-2">
              or <strong>Send</strong> your <strong>Student ID or COR</strong> to our email for verification.
            </p>
            <div className="bg-light p-3 rounded">
              <p className="mb-0 fw-bold text-dark">ncregistrar@gmail.com</p>
            </div>
          </div>
          <p className="mb-0 text-muted text-sm">
            Once you've visited the registrar's office and the admin has
            verified your information, you will be able to log in to your
            account.
          </p>
        </div>

        <div className="text-center">
          <button
            type="button"
            className="btn btn-success"
            onClick={() => navigate("/login")}
          >
            Go to Login
          </button>
        </div>
      </div>
    </div>
  );
}

export default RegistrarOfficeMessage;
