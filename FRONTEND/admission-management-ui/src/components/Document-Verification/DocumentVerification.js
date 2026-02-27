import React, { useState, useEffect, useMemo } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { useSelector } from "react-redux";
import CustomDataTable from "../../common/customdatable";
import ApplicantActionModal from "../Model/ApplicantActionModal";
const config = require("../../services/config.json");

/**
 * DocumentVerification
 *
 * Loads all applicants from GetAllApplicantFormDetails.
 * Eye icon opens a confirmation modal per row.
 * Approve calls UpdateApplicantFormDocumentStatusByApplicantId
 * with documentStatus = "Verified" — value never shown in UI.
 */

// ── Utility: safely extract array from various API response shapes ──────────
const extractArray = (data) => {
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.result)) return data.result;
  return [];
};

function DocumentVerification() {
  const personalInfo = useSelector((state) => state.personalInformationReducer);

  // ─── State ────────────────────────────────────────────────────────────────
  const [applicants,      setApplicants]      = useState([]);
  const [isTableLoading,  setIsTableLoading]  = useState(false);
  const [isApproving,     setIsApproving]     = useState(false);
  const [modalOpen,       setModalOpen]       = useState(false);
  const [selectedRow,     setSelectedRow]     = useState(null);

  // ─── Lifecycle ────────────────────────────────────────────────────────────
  useEffect(() => {
    fetchApplicants();
  }, []);

  // ─── API: Get All Applicants ──────────────────────────────────────────────
  const fetchApplicants = async () => {
    setIsTableLoading(true);
    try {
      const res = await axios.get(
        `${config.API_URL}ApplicantForm/GetAllApplicantFormDetailsForDocumentVerification`
      );
      if (res.data.success) {
        setApplicants(extractArray(res.data.data));
      } else {
        toast.error(res.data.message || "Failed to fetch applicants");
        setApplicants([]);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Error fetching applicants");
      setApplicants([]);
    } finally {
      setIsTableLoading(false);
    }
  };

  // ─── Modal: Open / Close ──────────────────────────────────────────────────
  const handleOpenModal = (row) => {
    setSelectedRow(row);
    setModalOpen(true);
  };

  const handleCloseModal = () => {
    if (isApproving) return; // prevent close during API call
    setModalOpen(false);
    setSelectedRow(null);
  };

  // ─── API: Approve (documentStatus = "Verified") ───────────────────────────
  const handleApprove = async () => {
    if (!selectedRow) return;

    // Prevent duplicate submission
    if (isApproving) return;

    setIsApproving(true);
    try {
      const payload = {
        applicantId:    selectedRow.applicantId,
        documentStatus: "Verified",           // hidden from UI — hardcoded as per spec
        userId:         personalInfo.userID,
      };

      const res = await axios.post(
        `${config.API_URL}ApplicantForm/UpdateApplicantFormDocumentStatusByApplicantId`,
        payload
      );

      if (res.data.success) {
        toast.success(res.data.message || "Document status updated successfully");
        handleCloseModal();
        await fetchApplicants();              // refresh table
      } else {
        toast.error(res.data.message || "Approval failed");
      }
    } catch (err) {
      toast.error(
        err.response?.data?.message || err.message || "Something went wrong"
      );
    } finally {
      setIsApproving(false);
    }
  };

  // ─── Table Columns ────────────────────────────────────────────────────────
  const columns = useMemo(
    () => [
      {
        name: "Sl No",
        selector: (row, index) => index + 1,
        width: "70px",
      },
      {
        name: "Name",
        selector: (row) => `${row.firstName} ${row.lastName}`,
        sortable: true,
      },
      {
        name: "Program Name",
        selector: (row) => row.programName,
        sortable: true,
      },
      {
        name: "Quota Name",
        selector: (row) => row.quotaName,
        sortable: true,
      },
      {
        name: "Action",
        cell: (row) => (
          <button
            className="edit-icon"
            title="View & Verify"
            onClick={() => handleOpenModal(row)}
          >
            <i className="fas fa-eye"></i>
          </button>
        ),
        width: "90px",
        ignoreRowClick: true,
      },
    ],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );

  // ─── Render ───────────────────────────────────────────────────────────────
  return (
    <section className="content">
      <div className="card">
        <div className="card-header">
          <h5 className="card-title mb-0">Document Verification</h5>
        </div>
        <div className="card-body">
          <div className="d-flex justify-content-between align-items-center mb-2">
            <h6 className="mb-0">Applicant List ({applicants.length})</h6>
          </div>

          <CustomDataTable
            columns={columns}
            data={applicants}
            loading={isTableLoading}
            itemsPerPageOptions={[5, 10, 25, 50]}
            defaultItemsPerPage={10}
            exportable={true}
            printable={true}
            pdfExportable={true}
            showGlobalSearch={true}
            showColumnToggle={true}
          />
        </div>
      </div>

      {/* Confirmation Modal */}
      <ApplicantActionModal
        isOpen={modalOpen}
        onApprove={handleApprove}
        onCancel={handleCloseModal}
        isLoading={isApproving}
        message="Are you verified the respective user documents?"
      />
    </section>
  );
}

export default DocumentVerification;