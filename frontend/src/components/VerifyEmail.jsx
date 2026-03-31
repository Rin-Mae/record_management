import { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import NCLogo from "../assets/NC Logo.png";
import UserServices from "../services/UserServices.jsx";

function VerifyEmail() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [otp, setOtp] = useState("");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [verified, setVerified] = useState(false);
  const [error, setError] = useState(null);
  const [otpSent, setOtpSent] = useState(true); // Assume OTP was sent during registration
  const [resending, setResending] = useState(false);

  useEffect(() => {
    // Get email from URL params or session storage
    const emailParam = searchParams.get("email");
    const sessionEmail = sessionStorage.getItem("registrationEmail");
    const finalEmail = emailParam || sessionEmail;

    if (!finalEmail) {
      setError("Email not found. Please register again.");
      navigate("/register");
      return;
    }

    setEmail(finalEmail);
  }, [searchParams, navigate]);

  const handleOtpChange = (e) => {
    // Only allow digits, max 6 characters
    const value = e.target.value.replace(/\D/g, "").slice(0, 6);
    setOtp(value);
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();

    if (!otp || otp.length !== 6) {
      toast.error("Please enter a valid 6-digit OTP");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await UserServices.verifyEmail({
        otp: otp.trim(),
        email: email,
      });

      if (response.status) {
        setVerified(true);
        toast.success(response.message || "Email verified successfully!");
        sessionStorage.removeItem("registrationEmail");
        // Delay redirect to ensure UI updates
        setTimeout(() => {
          navigate("/registrar-message");
        }, 2500);
      } else {
        const errorMsg = response.message || "OTP verification failed";
        setError(errorMsg);
        toast.error(errorMsg);
      }
    } catch (err) {
      console.error("Verification error:", err);
      const msg =
        err?.response?.data?.message || err?.message || "Verification failed";
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleResendOtp = async () => {
    if (!email) {
      toast.error("Email address not found");
      return;
    }

    setResending(true);
    try {
      const response = await UserServices.resendOtp({ email });
      if (response.status) {
        setOtp("");
        setOtpSent(true);
        setError(null);
        toast.success("New OTP sent to your email. Please check!");
      } else {
        toast.error(response.message || "Failed to resend OTP");
      }
    } catch (err) {
      console.error("Resend OTP error:", err);
      toast.error(
        err?.response?.data?.message ||
          "Failed to resend OTP. Please try again.",
      );
    } finally {
      setResending(false);
    }
  };

  return (
    <div className="d-flex justify-content-center align-items-center vh-100 bg-light">
      <div className="card shadow p-4" style={{ width: "450px" }}>
        <div className="text-center mb-4">
          <img
            src={NCLogo}
            alt="NC Logo"
            style={{ width: "120px", height: "120px", objectFit: "contain" }}
          />
          <h4 className="mt-3 mb-0 fw-bold text-success">
            Records Management System
          </h4>
        </div>

        {verified ? (
          <div className="alert alert-success" role="alert">
            <h5 className="alert-heading">✓ Email Verified!</h5>
            <p className="mb-0">
              Your email has been successfully verified. Redirecting...
            </p>
          </div>
        ) : (
          <>
            <div className="mb-4">
              <h5 className="mb-2">Verify Your Email</h5>
              <p className="text-muted mb-3">
                We've sent a 6-digit verification code to{" "}
                <strong>{email}</strong>
              </p>
            </div>

            {error && (
              <div
                className="alert alert-danger alert-dismissible fade show"
                role="alert"
              >
                {error}
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setError(null)}
                ></button>
              </div>
            )}

            <form onSubmit={handleVerifyOtp}>
              <div className="mb-3">
                <label htmlFor="otp" className="form-label">
                  Enter OTP Code
                </label>
                <input
                  type="text"
                  className="form-control form-control-lg text-center"
                  id="otp"
                  placeholder="000000"
                  value={otp}
                  onChange={handleOtpChange}
                  maxLength="6"
                  disabled={loading || resending}
                  style={{
                    fontSize: "28px",
                    letterSpacing: "8px",
                    fontWeight: "bold",
                    fontFamily: "monospace",
                  }}
                />
                <small className="text-muted d-block mt-2">
                  Enter the 6-digit code sent to your email. Code expires in 10
                  minutes.
                </small>
              </div>

              <button
                type="submit"
                className="btn btn-success w-100 mb-3"
                disabled={loading || resending || otp.length !== 6}
              >
                {loading ? (
                  <>
                    <span
                      className="spinner-border spinner-border-sm me-2"
                      role="status"
                      aria-hidden="true"
                    ></span>
                    Verifying...
                  </>
                ) : (
                  "Verify OTP"
                )}
              </button>

              <div className="text-center">
                <p className="text-muted mb-2">Didn't receive the code?</p>
                <button
                  type="button"
                  className="btn btn-link p-0"
                  onClick={handleResendOtp}
                  disabled={resending || loading}
                >
                  {resending ? "Sending..." : "Resend OTP"}
                </button>
              </div>
            </form>

            <hr className="my-4" />

            <div className="text-center">
              <p className="text-muted mb-2">Having issues?</p>
              <button
                type="button"
                className="btn btn-link p-0"
                onClick={() => navigate("/register")}
              >
                Go back to registration
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default VerifyEmail;
