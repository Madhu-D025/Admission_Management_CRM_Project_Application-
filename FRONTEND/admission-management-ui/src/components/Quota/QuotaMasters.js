import React, { useState, useEffect, useRef, useMemo } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { useSelector } from "react-redux";
import CustomDataTable from "../../common/customdatable";
const config = require("../../services/config.json");

/**
 * QuotaMasters
 *
 * Architecture: Mirrors SeatMatrixMasters 1-to-1.
 * Two dropdowns:
 *   1. Seat Matrix — hydrated from GetAllSeatMatrix (API)
 *   2. Quota Name  — static list [KCET, COMEDK, Management, Supernumerary]
 *
 * remainingQuota is auto-set equal to totalQuota in the payload.
 * It is never rendered in the form — only visible in the table.
 *
 * All response shapes guarded with Array.isArray + optional chaining
 * to handle both flat (data: [...]) and nested (data: { result: [...] }) shapes.
 */

const QUOTA_NAMES = ["KCET", "COMEDK", "Management", "Supernumerary"];

function QuotaMasters() {
  const personalInfo = useSelector((state) => state.personalInformationReducer);

  // ─── Table data ───────────────────────────────────────────────────────────
  const [quotaList, setQuotaList] = useState([]);

  // ─── Dropdown sources ─────────────────────────────────────────────────────
  const [seatMatrices, setSeatMatrices] = useState([]);

  // ─── Form state ───────────────────────────────────────────────────────────
  const [selectedSeatMatrixId, setSelectedSeatMatrixId] = useState("");
  const [name, setName] = useState("");
  const [totalQuota, setTotalQuota] = useState("");

  const [editId, setEditId] = useState(null); // null = create, number = update
  const [isLoading, setIsLoading] = useState(false);

  // ─── Refs (validation UI — identical pattern to reference components) ──────
  const seatMatrixRef  = useRef(null);
  const nameRef        = useRef(null);
  const totalQuotaRef  = useRef(null);

  // ─── Lifecycle ────────────────────────────────────────────────────────────
  useEffect(() => {
    fetchQuotas();
    fetchSeatMatrices();
  }, []);

  // ─── API: Get All Quota ───────────────────────────────────────────────────
  const fetchQuotas = async () => {
    setIsLoading(true);
    try {
      const res = await axios.get(`${config.API_URL}Quota/GetAllQuota`);
      if (res.data.success) {
        const raw = res.data.data;
        const list = Array.isArray(raw)
          ? raw
          : Array.isArray(raw?.result)
          ? raw.result
          : [];
        setQuotaList(list);
      } else {
        toast.error(res.data.message);
        setQuotaList([]);
      }
    } catch (err) {
      toast.error("Error fetching quota data");
      setQuotaList([]);
    } finally {
      setIsLoading(false);
    }
  };

  // ─── API: Dropdown — Seat Matrix ──────────────────────────────────────────
  const fetchSeatMatrices = async () => {
    try {
      const res = await axios.get(`${config.API_URL}SeatMatrix/GetAllSeatMatrix`);
      if (res.data.success) {
        const raw = res.data.data;
        const list = Array.isArray(raw)
          ? raw
          : Array.isArray(raw?.result)
          ? raw.result
          : [];
        setSeatMatrices(list);
      } else {
        toast.error(res.data.message);
        setSeatMatrices([]);
      }
    } catch (err) {
      toast.error("Error fetching seat matrix list");
      setSeatMatrices([]);
    }
  };

  // ─── Validation ───────────────────────────────────────────────────────────
  const validateInputs = () => {
    if (!selectedSeatMatrixId) {
      toast.error("Seat Matrix Details is required");
      seatMatrixRef.current.classList.add("is-invalid");
      seatMatrixRef.current.focus();
      return false;
    } else {
      seatMatrixRef.current.classList.remove("is-invalid");
    }

    if (!name) {
      toast.error("Quota Name is required");
      nameRef.current.classList.add("is-invalid");
      nameRef.current.focus();
      return false;
    } else {
      nameRef.current.classList.remove("is-invalid");
    }

    if (!totalQuota.toString().trim()) {
      toast.error("Total Quota is required");
      totalQuotaRef.current.classList.add("is-invalid");
      totalQuotaRef.current.focus();
      return false;
    }

    const parsed = Number(totalQuota);
    if (!Number.isInteger(parsed) || parsed <= 0) {
      toast.error("Total Quota must be a positive integer");
      totalQuotaRef.current.classList.add("is-invalid");
      totalQuotaRef.current.focus();
      return false;
    } else {
      totalQuotaRef.current.classList.remove("is-invalid");
    }

    return true;
  };

  // ─── API: Create / Update ─────────────────────────────────────────────────
  const handleSave = async () => {
    if (!validateInputs()) return;

    const quota = Number(totalQuota);

    const body = {
      quotaId:        editId ?? 0,
      seatMatrixId:   Number(selectedSeatMatrixId),
      name:           name,
      totalQuota:     quota,
      remainingQuota: quota,   // auto-set equal to totalQuota
      isActive:       true,
      userId:         personalInfo.userID,
    };

    setIsLoading(true);
    try {
      const res = await axios.post(
        `${config.API_URL}Quota/CreateOrUpdateQuota`,
        body
      );
      if (res.data.success) {
        toast.success(
          res.data.message || (editId ? "Updated successfully" : "Created successfully")
        );
        await fetchQuotas();
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
        `${config.API_URL}Quota/GetQuotaById?id=${item.quotaId}`
      );
      if (res.data.success) {
        const raw = res.data.data;
        // Safely unwrap nested result if present
        const d = raw?.result ?? raw;
        setSelectedSeatMatrixId(String(d.seatMatrixId));
        setName(d.name);
        setTotalQuota(String(d.totalQuota));
        setEditId(d.quotaId);
      } else {
        toast.error(res.data.message || "Failed to fetch quota");
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Error fetching quota");
    } finally {
      setIsLoading(false);
    }
  };

  // ─── API: Delete ──────────────────────────────────────────────────────────
  const handleDelete = async (item) => {
    setIsLoading(true);
    try {
      const url = `${config.API_URL}Quota/DeleteQuotaById?id=${item.quotaId}&UserId=${personalInfo.userID}`;
      const res = await axios.post(url);
      if (res.data.success) {
        toast.success(res.data.message || "Deleted successfully");
        await fetchQuotas();
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
    setSelectedSeatMatrixId("");
    setName("");
    setTotalQuota("");
    setEditId(null);
  };

  // Numeric-only input handler for Total Quota
  const handleTotalQuotaChange = (e) => {
    const val = e.target.value;
    if (/^\d*$/.test(val)) {
      setTotalQuota(val);
      if (val.trim()) totalQuotaRef.current.classList.remove("is-invalid");
    }
  };

  // ─── Table Columns ────────────────────────────────────────────────────────
  const columns = useMemo(
    () => [
      {
        name: "S.No",
        selector: (row, index) => index + 1,
        width: "60px",
      },
      {
        name: "Seat Matrix Details",
        selector: (row) => row.seatMatrixInfo,
        sortable: true,
      },
      {
        name: "Name",
        selector: (row) => row.name,
        sortable: true,
        width: "150px",
      },
      {
        name: "Total Quota",
        selector: (row) => row.totalQuota,
        sortable: true,
        width: "120px",
      },
      {
        name: "Remaining Quota",
        selector: (row) => row.remainingQuota,
        sortable: true,
        width: "150px",
      },
      {
        name: "Action",
        cell: (row) => (
          <div className="d-flex gap-2">
            <button className="edit-icon mr-2" onClick={() => handleEdit(row)}>
              <i className="fas fa-pen"></i>
            </button>
            <button className="delete-icon" onClick={() => handleDelete(row)}>
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
            {editId ? "Edit Quota" : "Create Quota"}
          </h5>
        </div>

        <div className="card-body">
          <div className="row g-3 align-items-end">

            {/* Seat Matrix Dropdown */}
            <div className="col-md-4">
              <label className="form-label">Seat Matrix Details</label>
              <select
                className="form-control"
                ref={seatMatrixRef}
                value={selectedSeatMatrixId}
                onChange={(e) => {
                  setSelectedSeatMatrixId(e.target.value);
                  if (e.target.value)
                    seatMatrixRef.current.classList.remove("is-invalid");
                }}
              >
                <option value="">Select Seat Matrix</option>
                {seatMatrices.map((sm) => (
                  <option key={sm.seatMatrixId} value={sm.seatMatrixId}>
                    {sm.seatMatrixInfo}
                  </option>
                ))}
              </select>
            </div>

            {/* Quota Name — Static Dropdown */}
            <div className="col-md-3">
              <label className="form-label">Quota Name</label>
              <select
                className="form-control"
                ref={nameRef}
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                  if (e.target.value)
                    nameRef.current.classList.remove("is-invalid");
                }}
              >
                <option value="">Select Quota Name</option>
                {QUOTA_NAMES.map((qn) => (
                  <option key={qn} value={qn}>
                    {qn}
                  </option>
                ))}
              </select>
            </div>

            {/* Total Quota — Numeric only */}
            <div className="col-md-2">
              <label className="form-label">Total Quota</label>
              <input
                type="text"
                inputMode="numeric"
                className="form-control"
                ref={totalQuotaRef}
                value={totalQuota}
                onChange={handleTotalQuotaChange}
                placeholder="0"
              />
            </div>

            {/* Save / Update Button */}
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

            {/* Cancel — edit mode only */}
            {editId && (
              <div
                className="col-md-1"
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
          <h5 className="card-title mb-0">Quota Data</h5>
        </div>
        <div className="card-body">
          <div className="d-flex justify-content-between align-items-center mb-2">
            <h6 className="mb-0">Quota List ({quotaList.length})</h6>
          </div>

          <CustomDataTable
            columns={columns}
            data={quotaList}
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

export default QuotaMasters;