import { useState } from "react";
import { FiCheckCircle, FiAlertCircle, FiX } from "react-icons/fi";

export default function AlertModal() {
  const [show, setShow] = useState(false);
  const [type, setType] = useState("success"); // success or error
  const [message, setMessage] = useState("");
  const [title, setTitle] = useState("");

  // Public API to show modal
  window.showAlert = (alertType, alertMessage, alertTitle = "") => {
    setType(alertType);
    setMessage(alertMessage);
    setTitle(alertTitle || (alertType === "success" ? "Success" : "Error"));
    setShow(true);
  };

  const handleClose = () => {
    setShow(false);
  };

  if (!show) return null;

  const isSuccess = type === "success";
  const bgColor = isSuccess ? "bg-success" : "bg-danger";
  const borderColor = isSuccess ? "border-success" : "border-danger";
  const iconColor = isSuccess ? "text-success" : "text-danger";

  return (
    <div
      className="modal d-block"
      style={{
        backgroundColor: "rgba(0, 0, 0, 0.5)",
        display: show ? "block" : "none",
      }}
      tabIndex="-1"
      role="dialog"
    >
      <div className="modal-dialog modal-dialog-centered" role="document">
        <div className={`modal-content border-2 ${borderColor}`}>
          {/* Header */}
          <div className={`modal-header ${bgColor} text-white border-0`}>
            <div className="d-flex align-items-center gap-2">
              {isSuccess ? (
                <FiCheckCircle size={24} />
              ) : (
                <FiAlertCircle size={24} />
              )}
              <h5 className="modal-title mb-0">{title}</h5>
            </div>
            <button
              type="button"
              className="btn-close btn-close-white"
              onClick={handleClose}
              aria-label="Close"
            />
          </div>

          {/* Body */}
          <div className="modal-body py-4">
            <p className="mb-0 text-dark">{message}</p>
          </div>

          {/* Footer */}
          <div className="modal-footer border-0">
            <button
              type="button"
              className={`btn btn-${isSuccess ? "success" : "danger"}`}
              onClick={handleClose}
            >
              OK
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
