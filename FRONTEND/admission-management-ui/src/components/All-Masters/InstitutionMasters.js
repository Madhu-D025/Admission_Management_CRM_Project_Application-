import React, { useState, useEffect, useRef, useMemo } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { useSelector } from "react-redux";
import CustomDataTable from "../../common/customdatable";
const config = require("../../services/config.json");

/**
 * InstitutionMasters
 *
 * Architecture: Mirrors OrganizationMasters 1-to-1.
 * State: All state is local (useState). No external state manager needed.
 * API layer: inline axios calls (same pattern as reference component).
 * Table: CustomDataTable with useMemo columns.
 * Form: Controlled inputs with ref-based validation UI.
 */
function InstitutionMasters() {
  const personalInfo = useSelector((state) => state.personalInformationReducer);

  // ─── State ───────────────────────────────────────────────────────────────
  const [institutions, setInstitutions] = useState([]); // flat list from API
  const [institutionName, setInstitutionName] = useState("");
  const [institutionCode, setInstitutionCode] = useState("");
  const [editId, setEditId] = useState(null); // null = create, number = update
  const [isLoading, setIsLoading] = useState(false);

  // ─── Refs (for validation UI — identical pattern to OrganizationMasters) ──
  const institutionNameRef = useRef(null);
  const institutionCodeRef = useRef(null);

  // ─── Lifecycle ────────────────────────────────────────────────────────────
  useEffect(() => {
    fetchInstitutions();
  }, []);

  // ─── API: Get All ─────────────────────────────────────────────────────────
  const fetchInstitutions = async () => {
    setIsLoading(true);
    try {
      const res = await axios.get(
        `${config.API_URL}MasterController/GetAllInstitutions`
      );
      if (res.data.success) {
        setInstitutions(res.data.data);
      } else {
        toast.error(res.data.message);
      }
    } catch (err) {
      toast.error("Error fetching institutions");
    } finally {
      setIsLoading(false);
    }
  };

  // ─── Validation ───────────────────────────────────────────────────────────
  const validateInputs = () => {
    if (!institutionName.trim()) {
      toast.error("Institution Name is required");
      institutionNameRef.current.classList.add("is-invalid");
      institutionNameRef.current.focus();
      return false;
    } else {
      institutionNameRef.current.classList.remove("is-invalid");
    }

    if (!institutionCode.trim()) {
      toast.error("Institution Code is required");
      institutionCodeRef.current.classList.add("is-invalid");
      institutionCodeRef.current.focus();
      return false;
    } else {
      institutionCodeRef.current.classList.remove("is-invalid");
    }

    return true;
  };

  // ─── API: Create / Update ─────────────────────────────────────────────────
  const handleSave = async () => {
    if (!validateInputs()) return;

    const body = {
      institutionId: editId ?? 0,
      institutionName: institutionName.trim(),
      institutionCode: institutionCode.trim(),
      isActive: true,
      userId: personalInfo.userID,
    };

    setIsLoading(true);
    try {
      const res = await axios.post(
        `${config.API_URL}MasterController/CreateOrUpdateInstitution`,
        body
      );

      if (res.data.success) {
        toast.success(
          res.data.message || (editId ? "Updated successfully" : "Created successfully")
        );
        await fetchInstitutions();
        resetForm();
      } else {
        toast.error(res.data.message || "Operation failed");
      }
    } catch (err) {
      toast.error(
        err.response?.data?.message || err.message || "Something went wrong"
      );
    } finally {
      setIsLoading(false);
    }
  };

  // ─── API: Get By ID → populate edit form ─────────────────────────────────
  const handleEdit = async (item) => {
    setIsLoading(true);
    try {
      const res = await axios.get(
        `${config.API_URL}MasterController/GetInstitutionById?id=${item.institutionId}`
      );
      if (res.data.success) {
        const d = res.data.data;
        setInstitutionName(d.institutionName);
        setInstitutionCode(d.institutionCode);
        setEditId(d.institutionId);
      } else {
        toast.error(res.data.message || "Failed to fetch institution");
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Error fetching institution");
    } finally {
      setIsLoading(false);
    }
  };

  // ─── API: Delete ──────────────────────────────────────────────────────────
  const handleDelete = async (item) => {
    setIsLoading(true);
    try {
      const url = `${config.API_URL}MasterController/DeleteInstitutionById?id=${item.institutionId}&UserId=${personalInfo.userID}`;
      const res = await axios.post(url);
      if (res.data.success) {
        toast.success(res.data.message || "Deleted successfully");
        await fetchInstitutions();
      } else {
        toast.error(res.data.message || "Delete failed");
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Error deleting");
    } finally {
      setIsLoading(false);
    }
  };

  // ─── Helpers ──────────────────────────────────────────────────────────────
  const resetForm = () => {
    setInstitutionName("");
    setInstitutionCode("");
    setEditId(null);
  };

  // ─── Table Columns (mirrors OrganizationMasters column structure) ─────────
  const columns = useMemo(
    () => [
      {
        name: "S.No",
        selector: (row, index) => index + 1,
        width: "60px",
      },
      {
        name: "Institution Name",
        selector: (row) => row.institutionName,
        sortable: true,
      },
      {
        name: "Institution Code",
        selector: (row) => row.institutionCode,
        sortable: true,
      },
      {
        name: "Action",
        cell: (row) => (
          <div className="d-flex gap-2">
            <button
              className="edit-icon mr-2"
              onClick={() => handleEdit(row)}
            >
              <i className="fas fa-pen"></i>
            </button>
            <button
              className="delete-icon"
              onClick={() => handleDelete(row)}
            >
              <i className="fas fa-trash"></i>
            </button>
          </div>
        ),
        width: "120px",
      },
    ],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );

  // ─── Render ───────────────────────────────────────────────────────────────
  return (
    <section className="content">
      {/* ── Create / Edit Form Card ── */}
      <div className="card">
        <div className="card-header">
          <h5 className="card-title mb-0">
            {editId ? "Edit Institution" : "Create Institution"}
          </h5>
        </div>

        <div className="card-body">
          <div className="row g-3 align-items-end">
            {/* Institution Name */}
            <div className="col-md-3">
              <label className="form-label">Institution Name</label>
              <input
                type="text"
                className="form-control"
                ref={institutionNameRef}
                value={institutionName}
                onChange={(e) => {
                  setInstitutionName(e.target.value);
                  if (e.target.value.trim())
                    institutionNameRef.current.classList.remove("is-invalid");
                }}
                placeholder="Enter Institution Name"
              />
            </div>

            {/* Institution Code */}
            <div className="col-md-3">
              <label className="form-label">Institution Code</label>
              <input
                type="text"
                className="form-control"
                ref={institutionCodeRef}
                value={institutionCode}
                onChange={(e) => {
                  setInstitutionCode(e.target.value);
                  if (e.target.value.trim())
                    institutionCodeRef.current.classList.remove("is-invalid");
                }}
                placeholder="Enter Institution Code"
              />
            </div>

            {/* Action Button */}
            <div
              className="col-md-2"
              style={{ display: "flex", justifyContent: "center" }}
            >
              <button
                className="custom-btn custom-primary-button"
                onClick={handleSave}
                disabled={isLoading}
              >
                {editId ? "Update" : "Save & Submit"}
              </button>
            </div>

            {/* Cancel Edit (only visible during edit mode) */}
            {editId && (
              <div
                className="col-md-2"
                style={{ display: "flex", justifyContent: "center" }}
              >
                <button
                  className="custom-btn custom-secondary-button"
                  onClick={resetForm}
                  disabled={isLoading}
                >
                  Cancel
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── Data Table Card ── */}
      <div className="card mt-3">
        <div className="card-header">
          <h5 className="card-title mb-0">Institution Data</h5>
        </div>
        <div className="card-body">
          <div className="d-flex justify-content-between align-items-center mb-2">
            <h6 className="mb-0">
              Institutions List ({institutions.length})
            </h6>
          </div>

          <CustomDataTable
            columns={columns}
            data={institutions}
            loading={isLoading}
            itemsPerPageOptions={[5, 10, 25, 50]}
            defaultItemsPerPage={5}
            exportable={true}
            printable={true}
            pdfExportable={true}
            showGlobalSearch={true}
            showColumnToggle={true}
          />
        </div>
      </div>
    </section>
  );
}

export default InstitutionMasters;