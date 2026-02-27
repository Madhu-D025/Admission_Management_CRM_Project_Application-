import React from "react";

/**
 * ApplicantActionModal
 *
 * Reusable modal shared by DocumentVerification and FeeManagement.
 * Renders confirmation message, Approve and Cancel buttons.
 * Parent controls open/close state and passes onApprove handler.
 */
function ApplicantActionModal({ isOpen, onApprove, onCancel, isLoading, message }) {
  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="modal-backdrop fade show"
        style={{ zIndex: 1040 }}
        onClick={onCancel}
      />

      {/* Modal */}
      <div
        className="modal fade show d-block"
        tabIndex="-1"
        role="dialog"
        style={{ zIndex: 1050 }}
      >
        <div className="modal-dialog modal-dialog-centered" role="document">
          <div className="modal-content">

            <div className="modal-header">
              <h5 className="modal-title">Confirmation</h5>
              <button
                type="button"
                className="close"
                onClick={onCancel}
                disabled={isLoading}
                aria-label="Close"
              >
                <span aria-hidden="true">&times;</span>
              </button>
            </div>

            <div className="modal-body">
              <p className="mb-0">
                {message || "Please confirm that you have verified the applicant’s documents and checked whether the fee has been paid?"}
              </p>
            </div>

            <div className="modal-footer">
              <button
                className="custom-btn custom-primary-button"
                onClick={onApprove}
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <span
                      className="spinner-border spinner-border-sm mr-1"
                      role="status"
                      aria-hidden="true"
                    />
                    Processing...
                  </>
                ) : (
                  "Approve"
                )}
              </button>
              <button
                className="custom-btn custom-secondary-button ml-2"
                onClick={onCancel}
                disabled={isLoading}
              >
                Cancel
              </button>
            </div>

          </div>
        </div>
      </div>
    </>
  );
}

export default ApplicantActionModal;