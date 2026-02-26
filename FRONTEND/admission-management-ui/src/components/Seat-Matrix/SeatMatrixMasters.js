import React, { useState, useEffect, useRef, useMemo } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { useSelector } from "react-redux";
import CustomDataTable from "../../common/customdatable";
const config = require("../../services/config.json");

/**
 * SeatMatrixMasters
 *
 * Architecture: Mirrors InstitutionMasters / CampusMasters 1-to-1.
 * Four dependent dropdowns (Program, Academic Year, Entry Type, Admission Mode)
 * all hydrated in parallel on mount.
 * remainingSeats is auto-set equal to totalSeats on create/update — never shown in form.
 *
 * Key backend observations carried forward from ProgramBranchMasters fix:
 *   - GetAllProgramBranch returns data nested at res.data.data.result
 *   - GetAllAcademicYear / GetAllEntryType / GetAllAdmissionMode assumed flat: res.data.data
 *   - GetAllSeatMatrix assumed flat: res.data.data
 *   All are guarded with Array.isArray + optional chaining so the component
 *   never crashes regardless of response shape.
 */
function SeatMatrixMasters() {
  const personalInfo = useSelector((state) => state.personalInformationReducer);

  // ─── Table data ───────────────────────────────────────────────────────────
  const [seatMatrixList, setSeatMatrixList] = useState([]);

  // ─── Dropdown sources ─────────────────────────────────────────────────────
  const [programs, setPrograms] = useState([]);
  const [academicYears, setAcademicYears] = useState([]);
  const [entryTypes, setEntryTypes] = useState([]);
  const [admissionModes, setAdmissionModes] = useState([]);

  // ─── Form state ───────────────────────────────────────────────────────────
  const [selectedProgramId, setSelectedProgramId] = useState("");
  const [selectedAcademicYearId, setSelectedAcademicYearId] = useState("");
  const [selectedEntryTypeId, setSelectedEntryTypeId] = useState("");
  const [selectedAdmissionModeId, setSelectedAdmissionModeId] = useState("");
  const [totalSeats, setTotalSeats] = useState("");

  const [editId, setEditId] = useState(null); // null = create, number = update
  const [isLoading, setIsLoading] = useState(false);

  // ─── Refs (validation UI — same pattern as reference components) ──────────
  const programRef       = useRef(null);
  const academicYearRef  = useRef(null);
  const entryTypeRef     = useRef(null);
  const admissionModeRef = useRef(null);
  const totalSeatsRef    = useRef(null);

  // ─── Lifecycle ────────────────────────────────────────────────────────────
  useEffect(() => {
    // All four dropdown sources fetched in parallel — no waterfall
    fetchSeatMatrix();
    fetchPrograms();
    fetchAcademicYears();
    fetchEntryTypes();
    fetchAdmissionModes();
  }, []);

  // ─── API: Get All Seat Matrix ─────────────────────────────────────────────
  const fetchSeatMatrix = async () => {
    setIsLoading(true);
    try {
      const res = await axios.get(`${config.API_URL}SeatMatrix/GetAllSeatMatrix`);
      if (res.data.success) {
        // Guard: handle both flat array and nested result shapes
        const raw = res.data.data;
        const list = Array.isArray(raw)
          ? raw
          : Array.isArray(raw?.result)
          ? raw.result
          : [];
        setSeatMatrixList(list);
      } else {
        toast.error(res.data.message);
        setSeatMatrixList([]);
      }
    } catch (err) {
      toast.error("Error fetching seat matrix data");
      setSeatMatrixList([]);
    } finally {
      setIsLoading(false);
    }
  };

  // ─── API: Dropdown — Programs ─────────────────────────────────────────────
  const fetchPrograms = async () => {
    try {
      const res = await axios.get(`${config.API_URL}MasterController/GetAllProgramBranch`);
      if (res.data.success) {
        // ProgramBranch API nests array under data.result (confirmed from fix)
        const raw = res.data.data;
        const list = Array.isArray(raw?.result)
          ? raw.result
          : Array.isArray(raw)
          ? raw
          : [];
        setPrograms(list);
      } else {
        toast.error(res.data.message);
        setPrograms([]);
      }
    } catch (err) {
      toast.error("Error fetching programs");
      setPrograms([]);
    }
  };

  // ─── API: Dropdown — Academic Years ───────────────────────────────────────
  const fetchAcademicYears = async () => {
    try {
      const res = await axios.get(`${config.API_URL}MasterController/GetAllAcademicYear`);
      if (res.data.success) {
        const raw = res.data.data;
        setAcademicYears(
          Array.isArray(raw) ? raw : Array.isArray(raw?.result) ? raw.result : []
        );
      } else {
        toast.error(res.data.message);
        setAcademicYears([]);
      }
    } catch (err) {
      toast.error("Error fetching academic years");
      setAcademicYears([]);
    }
  };

  // ─── API: Dropdown — Entry Types ──────────────────────────────────────────
  const fetchEntryTypes = async () => {
    try {
      const res = await axios.get(`${config.API_URL}MasterController/GetAllEntryType`);
      if (res.data.success) {
        const raw = res.data.data;
        setEntryTypes(
          Array.isArray(raw) ? raw : Array.isArray(raw?.result) ? raw.result : []
        );
      } else {
        toast.error(res.data.message);
        setEntryTypes([]);
      }
    } catch (err) {
      toast.error("Error fetching entry types");
      setEntryTypes([]);
    }
  };

  // ─── API: Dropdown — Admission Modes ─────────────────────────────────────
  const fetchAdmissionModes = async () => {
    try {
      const res = await axios.get(`${config.API_URL}MasterController/GetAllAdmissionMode`);
      if (res.data.success) {
        const raw = res.data.data;
        setAdmissionModes(
          Array.isArray(raw) ? raw : Array.isArray(raw?.result) ? raw.result : []
        );
      } else {
        toast.error(res.data.message);
        setAdmissionModes([]);
      }
    } catch (err) {
      toast.error("Error fetching admission modes");
      setAdmissionModes([]);
    }
  };

  // ─── Validation ───────────────────────────────────────────────────────────
  const validateInputs = () => {
    if (!selectedProgramId) {
      toast.error("Program Name is required");
      programRef.current.classList.add("is-invalid");
      programRef.current.focus();
      return false;
    } else {
      programRef.current.classList.remove("is-invalid");
    }

    if (!selectedAcademicYearId) {
      toast.error("Year Label is required");
      academicYearRef.current.classList.add("is-invalid");
      academicYearRef.current.focus();
      return false;
    } else {
      academicYearRef.current.classList.remove("is-invalid");
    }

    if (!selectedEntryTypeId) {
      toast.error("Entry Type is required");
      entryTypeRef.current.classList.add("is-invalid");
      entryTypeRef.current.focus();
      return false;
    } else {
      entryTypeRef.current.classList.remove("is-invalid");
    }

    if (!selectedAdmissionModeId) {
      toast.error("Admission Type is required");
      admissionModeRef.current.classList.add("is-invalid");
      admissionModeRef.current.focus();
      return false;
    } else {
      admissionModeRef.current.classList.remove("is-invalid");
    }

    if (!totalSeats.toString().trim()) {
      toast.error("Total Seats is required");
      totalSeatsRef.current.classList.add("is-invalid");
      totalSeatsRef.current.focus();
      return false;
    }

    const parsed = Number(totalSeats);
    if (!Number.isInteger(parsed) || parsed <= 0) {
      toast.error("Total Seats must be a positive integer");
      totalSeatsRef.current.classList.add("is-invalid");
      totalSeatsRef.current.focus();
      return false;
    } else {
      totalSeatsRef.current.classList.remove("is-invalid");
    }

    return true;
  };

  // ─── API: Create / Update ─────────────────────────────────────────────────
  const handleSave = async () => {
    if (!validateInputs()) return;

    const seats = Number(totalSeats);

    const body = {
      seatMatrixId:     editId ?? 0,
      programId:        Number(selectedProgramId),
      academicYearId:   Number(selectedAcademicYearId),
      entryTypeId:      Number(selectedEntryTypeId),
      admissionModeId:  Number(selectedAdmissionModeId),
      totalSeats:       seats,
      remainingSeats:   seats,   // auto-set equal to totalSeats
      isActive:         true,
      userId:           personalInfo.userID,
    };

    setIsLoading(true);
    try {
      const res = await axios.post(
        `${config.API_URL}MasterController/CreateOrUpdateSeatMatrix`,
        body
      );
      if (res.data.success) {
        toast.success(
          res.data.message || (editId ? "Updated successfully" : "Created successfully")
        );
        await fetchSeatMatrix();
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
        `${config.API_URL}SeatMatrix/GetSeatMatrixById?id=${item.seatMatrixId}`
      );
      if (res.data.success) {
        const d = res.data.data;
        // Safely unwrap if nested
        const record = d?.result ?? d;
        setSelectedProgramId(String(record.programId));
        setSelectedAcademicYearId(String(record.academicYearId));
        setSelectedEntryTypeId(String(record.entryTypeId));
        setSelectedAdmissionModeId(String(record.admissionModeId));
        setTotalSeats(String(record.totalSeats));
        setEditId(record.seatMatrixId);
      } else {
        toast.error(res.data.message || "Failed to fetch seat matrix");
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Error fetching seat matrix");
    } finally {
      setIsLoading(false);
    }
  };

  // ─── API: Delete ──────────────────────────────────────────────────────────
  const handleDelete = async (item) => {
    setIsLoading(true);
    try {
      const url = `${config.API_URL}MasterController/DeleteSeatMatrixById?id=${item.seatMatrixId}&UserId=${personalInfo.userID}`;
      const res = await axios.post(url);
      if (res.data.success) {
        toast.success(res.data.message || "Deleted successfully");
        await fetchSeatMatrix();
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
    setSelectedProgramId("");
    setSelectedAcademicYearId("");
    setSelectedEntryTypeId("");
    setSelectedAdmissionModeId("");
    setTotalSeats("");
    setEditId(null);
  };

  // Only allow numeric keystrokes in Total Seats
  const handleTotalSeatsChange = (e) => {
    const val = e.target.value;
    if (/^\d*$/.test(val)) {
      setTotalSeats(val);
      if (val.trim()) totalSeatsRef.current.classList.remove("is-invalid");
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
        name: "Program Name",
        selector: (row) => row.programName,
        sortable: true,
      },
      {
        name: "Year Label",
        selector: (row) => row.academicYear,
        sortable: true,
      },
      {
        name: "Entry Type",
        selector: (row) => row.entryType,
        sortable: true,
      },
      {
        name: "Admission Type",
        selector: (row) => row.admissionMode,
        sortable: true,
      },
      {
        name: "Total Seats",
        selector: (row) => row.totalSeats,
        sortable: true,
        width: "110px",
      },
      {
        name: "Remaining Seats",
        selector: (row) => row.remainingSeats,
        sortable: true,
        width: "140px",
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
            {editId ? "Edit Seat Matrix" : "Create Seat Matrix"}
          </h5>
        </div>

        <div className="card-body">
          <div className="row g-3 align-items-end">

            {/* Program Name Dropdown */}
            <div className="col-md-3">
              <label className="form-label">Program Name</label>
              <select
                className="form-control"
                ref={programRef}
                value={selectedProgramId}
                onChange={(e) => {
                  setSelectedProgramId(e.target.value);
                  if (e.target.value) programRef.current.classList.remove("is-invalid");
                }}
              >
                <option value="">Select Program</option>
                {programs.map((p) => (
                  <option key={p.programId} value={p.programId}>
                    {p.programName}
                  </option>
                ))}
              </select>
            </div>

            {/* Academic Year Dropdown */}
            <div className="col-md-2">
              <label className="form-label">Year Label</label>
              <select
                className="form-control"
                ref={academicYearRef}
                value={selectedAcademicYearId}
                onChange={(e) => {
                  setSelectedAcademicYearId(e.target.value);
                  if (e.target.value) academicYearRef.current.classList.remove("is-invalid");
                }}
              >
                <option value="">Select Year</option>
                {academicYears.map((y) => (
                  <option key={y.academicYearId} value={y.academicYearId}>
                    {y.yearLabel}
                  </option>
                ))}
              </select>
            </div>

            {/* Entry Type Dropdown */}
            <div className="col-md-2">
              <label className="form-label">Entry Type</label>
              <select
                className="form-control"
                ref={entryTypeRef}
                value={selectedEntryTypeId}
                onChange={(e) => {
                  setSelectedEntryTypeId(e.target.value);
                  if (e.target.value) entryTypeRef.current.classList.remove("is-invalid");
                }}
              >
                <option value="">Select Entry Type</option>
                {entryTypes.map((et) => (
                  <option key={et.entryTypeId} value={et.entryTypeId}>
                    {et.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Admission Mode Dropdown */}
            <div className="col-md-2">
              <label className="form-label">Admission Type</label>
              <select
                className="form-control"
                ref={admissionModeRef}
                value={selectedAdmissionModeId}
                onChange={(e) => {
                  setSelectedAdmissionModeId(e.target.value);
                  if (e.target.value) admissionModeRef.current.classList.remove("is-invalid");
                }}
              >
                <option value="">Select Admission Type</option>
                {admissionModes.map((am) => (
                  <option key={am.admissionModeId} value={am.admissionModeId}>
                    {am.admissionType}
                  </option>
                ))}
              </select>
            </div>

            {/* Total Seats — numeric only */}
            <div className="col-md-1">
              <label className="form-label">Total Seats</label>
              <input
                type="text"
                inputMode="numeric"
                className="form-control"
                ref={totalSeatsRef}
                value={totalSeats}
                onChange={handleTotalSeatsChange}
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
          <h5 className="card-title mb-0">Seat Matrix Data</h5>
        </div>
        <div className="card-body">
          <div className="d-flex justify-content-between align-items-center mb-2">
            <h6 className="mb-0">Seat Matrix List ({seatMatrixList.length})</h6>
          </div>

          <CustomDataTable
            columns={columns}
            data={seatMatrixList}
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

export default SeatMatrixMasters;