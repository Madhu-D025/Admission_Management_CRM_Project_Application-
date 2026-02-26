import React, { useState, useEffect, useRef, useMemo } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { useSelector } from "react-redux";
import CustomDataTable from "../../common/customdatable";
const config = require("../../services/config.json");

/**
 * ApplicantForm
 *
 * Handles Create + Update of applicant records.
 * Five API-driven dropdowns + static Category dropdown.
 * DocumentStatus and FeeStatus are hidden and auto-set.
 * Multiple file upload via FormData.
 * Table shows FirstName, LastName, ProgramName, QuotaName only.
 */

const CATEGORY_OPTIONS = ["GM", "SC", "ST", "OBC", "VJ", "NT"];

// ── Utility: safely extract array from various API response shapes ──────────
const extractArray = (data) => {
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.result)) return data.result;
  return [];
};

function ApplicantForm() {
  const personalInfo = useSelector((state) => state.personalInformationReducer);

  // ─── Table data ───────────────────────────────────────────────────────────
  const [applicants, setApplicants] = useState([]);

  // ─── Dropdown sources ─────────────────────────────────────────────────────
  const [entryTypes,     setEntryTypes]     = useState([]);
  const [admissionModes, setAdmissionModes] = useState([]);
  const [programs,       setPrograms]       = useState([]);
  const [academicYears,  setAcademicYears]  = useState([]);
  const [quotas,         setQuotas]         = useState([]);

  // ─── Form state ───────────────────────────────────────────────────────────
  const [firstName,       setFirstName]       = useState("");
  const [lastName,        setLastName]        = useState("");
  const [dob,             setDob]             = useState("");
  const [category,        setCategory]        = useState("");
  const [entryTypeId,     setEntryTypeId]     = useState("");
  const [admissionModeId, setAdmissionModeId] = useState("");
  const [programId,       setProgramId]       = useState("");
  const [academicYearId,  setAcademicYearId]  = useState("");
  const [quotaId,         setQuotaId]         = useState("");
  const [marks,           setMarks]           = useState("");
  const [documents,       setDocuments]       = useState([]);   // FileList → array

  // Hidden — never shown in UI
  const DOCUMENT_STATUS = "Submitted";
  const FEE_STATUS      = "Pending";

  const [editId,     setEditId]     = useState(null);
  const [isLoading,  setIsLoading]  = useState(false);
  const [showForm,   setShowForm]   = useState(false);

  // ─── Refs (validation UI) ─────────────────────────────────────────────────
  const firstNameRef       = useRef(null);
  const lastNameRef        = useRef(null);
  const dobRef             = useRef(null);
  const categoryRef        = useRef(null);
  const entryTypeRef       = useRef(null);
  const admissionModeRef   = useRef(null);
  const programRef         = useRef(null);
  const academicYearRef    = useRef(null);
  const quotaRef           = useRef(null);
  const marksRef           = useRef(null);
  const documentsRef       = useRef(null);

  // ─── Lifecycle ────────────────────────────────────────────────────────────
  useEffect(() => {
    fetchApplicants();
    fetchEntryTypes();
    fetchAdmissionModes();
    fetchPrograms();
    fetchAcademicYears();
    fetchQuotas();
  }, []);

  // ─── API: Get All Applicants ──────────────────────────────────────────────
  const fetchApplicants = async () => {
    setIsLoading(true);
    try {
      const res = await axios.get(
        `${config.API_URL}ApplicantForm/GetAllApplicantFormDetails`
      );
      if (res.data.success) {
        setApplicants(extractArray(res.data.data));
      } else {
        toast.error(res.data.message);
        setApplicants([]);
      }
    } catch (err) {
      toast.error("Error fetching applicants");
      setApplicants([]);
    } finally {
      setIsLoading(false);
    }
  };

  // ─── API: Dropdowns (all parallel on mount) ───────────────────────────────
  const fetchEntryTypes = async () => {
    try {
      const res = await axios.get(`${config.API_URL}MasterController/GetAllEntryType`);
      if (res.data.success) setEntryTypes(extractArray(res.data.data));
    } catch { toast.error("Error fetching entry types"); }
  };

  const fetchAdmissionModes = async () => {
    try {
      const res = await axios.get(`${config.API_URL}MasterController/GetAllAdmissionMode`);
      if (res.data.success) setAdmissionModes(extractArray(res.data.data));
    } catch { toast.error("Error fetching admission modes"); }
  };

  const fetchPrograms = async () => {
    try {
      const res = await axios.get(`${config.API_URL}MasterController/GetAllProgramBranch`);
      if (res.data.success) {
        // ProgramBranch nests under data.result
        const raw = res.data.data;
        setPrograms(Array.isArray(raw?.result) ? raw.result : extractArray(raw));
      }
    } catch { toast.error("Error fetching programs"); }
  };

  const fetchAcademicYears = async () => {
    try {
      const res = await axios.get(`${config.API_URL}MasterController/GetAllAcademicYear`);
      if (res.data.success) setAcademicYears(extractArray(res.data.data));
    } catch { toast.error("Error fetching academic years"); }
  };

  const fetchQuotas = async () => {
    try {
      const res = await axios.get(`${config.API_URL}Quota/GetAllQuota`);
      if (res.data.success) setQuotas(extractArray(res.data.data));
    } catch { toast.error("Error fetching quotas"); }
  };

  // ─── Validation ───────────────────────────────────────────────────────────
  const clearInvalid = (refs) =>
    refs.forEach((r) => r.current?.classList.remove("is-invalid"));

  const setInvalid = (ref, message) => {
    toast.error(message);
    ref.current.classList.add("is-invalid");
    ref.current.focus();
  };

  const validateInputs = () => {
    clearInvalid([
      firstNameRef, lastNameRef, dobRef, categoryRef,
      entryTypeRef, admissionModeRef, programRef,
      academicYearRef, quotaRef, marksRef,
    ]);

    if (!firstName.trim()) { setInvalid(firstNameRef, "First Name is required"); return false; }
    if (!lastName.trim())  { setInvalid(lastNameRef,  "Last Name is required");  return false; }
    if (!dob)              { setInvalid(dobRef,        "Date of Birth is required"); return false; }
    if (!category)         { setInvalid(categoryRef,   "Category is required");  return false; }
    if (!entryTypeId)      { setInvalid(entryTypeRef,  "Entry Type is required"); return false; }
    if (!admissionModeId)  { setInvalid(admissionModeRef, "Admission Type is required"); return false; }
    if (!programId)        { setInvalid(programRef,    "Program is required");    return false; }
    if (!academicYearId)   { setInvalid(academicYearRef, "Academic Year is required"); return false; }
    if (!quotaId)          { setInvalid(quotaRef,      "Quota is required");      return false; }

    if (!marks.trim()) {
      setInvalid(marksRef, "Marks is required");
      return false;
    }
    if (!/^\d+(\.\d+)?$/.test(marks.trim())) {
      setInvalid(marksRef, "Marks must be a valid decimal number");
      return false;
    }

    return true;
  };

  // ─── API: Create / Update ─────────────────────────────────────────────────
  const handleSave = async () => {
    if (!validateInputs()) return;

    const formData = new FormData();
    formData.append("applicantId",    editId ?? 0);
    formData.append("firstName",      firstName.trim());
    formData.append("lastName",       lastName.trim());
    formData.append("dob",            dob);
    formData.append("category",       category);
    formData.append("entryTypeId",    Number(entryTypeId));
    formData.append("admissionModeId", Number(admissionModeId));
    formData.append("programId",      Number(programId));
    formData.append("academicYearId", Number(academicYearId));
    formData.append("quotaId",        Number(quotaId));
    formData.append("marks",          parseFloat(marks));
    formData.append("documentStatus", DOCUMENT_STATUS);
    formData.append("feeStatus",      FEE_STATUS);
    formData.append("isActive",       true);
    formData.append("userId",         personalInfo.userID);

    // Append each file individually
    documents.forEach((file) => formData.append("documents", file));

    const endpoint = editId
      ? "ApplicantForm/UpdateApplicantFormDetails"
      : "ApplicantForm/CreateApplicantFormDetails";

    setIsLoading(true);
    try {
      const res = await axios.post(`${config.API_URL}${endpoint}`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      if (res.data.success) {
        toast.success(
          res.data.message || (editId ? "Updated successfully" : "Created successfully")
        );
        await fetchApplicants();
        resetForm();
        setShowForm(false);
      } else {
        toast.error(res.data.message || "Operation failed");
      }
    } catch (err) {
      toast.error(err.response?.data?.message || err.message || "Something went wrong");
    } finally {
      setIsLoading(false);
    }
  };

  // ─── API: Get By ID → populate edit form ─────────────────────────────────
  const handleEdit = async (item) => {
    setIsLoading(true);
    try {
      const res = await axios.get(
        `${config.API_URL}ApplicantForm/GetApplicantFormDetailsByApplicantId?id=${item.applicantId}`
      );
      if (res.data.success) {
        const raw = res.data.data;
        const d   = raw?.result ?? raw;
        setFirstName(d.firstName || "");
        setLastName(d.lastName || "");
        setDob(d.dob ? d.dob.substring(0, 10) : "");
        setCategory(d.category || "");
        setEntryTypeId(String(d.entryTypeId || ""));
        setAdmissionModeId(String(d.admissionModeId || ""));
        setProgramId(String(d.programId || ""));
        setAcademicYearId(String(d.academicYearId || ""));
        setQuotaId(String(d.quotaId || ""));
        setMarks(d.marks !== undefined ? String(d.marks) : "");
        setDocuments([]);
        setEditId(d.applicantId);
        setShowForm(true);
        window.scrollTo({ top: 0, behavior: "smooth" });
      } else {
        toast.error(res.data.message || "Failed to fetch applicant");
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Error fetching applicant");
    } finally {
      setIsLoading(false);
    }
  };

  // ─── Helpers ──────────────────────────────────────────────────────────────
  const resetForm = () => {
    setFirstName("");
    setLastName("");
    setDob("");
    setCategory("");
    setEntryTypeId("");
    setAdmissionModeId("");
    setProgramId("");
    setAcademicYearId("");
    setQuotaId("");
    setMarks("");
    setDocuments([]);
    setEditId(null);
    if (documentsRef.current) documentsRef.current.value = "";
  };

  const handleCancel = () => {
    resetForm();
    setShowForm(false);
  };

  // Decimal-only marks input
  const handleMarksChange = (e) => {
    const val = e.target.value;
    if (/^(\d+\.?\d*)?$/.test(val)) {
      setMarks(val);
      if (val.trim()) marksRef.current?.classList.remove("is-invalid");
    }
  };

  // File input handler
  const handleDocumentsChange = (e) => {
    setDocuments(Array.from(e.target.files));
  };

  // ─── Table Columns ────────────────────────────────────────────────────────
  const columns = useMemo(
    () => [
      { name: "S.No",         selector: (row, index) => index + 1, width: "60px" },
      { name: "First Name",   selector: (row) => row.firstName,   sortable: true },
      { name: "Last Name",    selector: (row) => row.lastName,    sortable: true },
      { name: "Program Name", selector: (row) => row.programName, sortable: true },
      { name: "Quota Name",   selector: (row) => row.quotaName,   sortable: true },
      {
        name: "Action",
        cell: (row) => (
          <div className="d-flex gap-2">
            <button className="edit-icon mr-2" onClick={() => handleEdit(row)}>
              <i className="fas fa-pen"></i>
            </button>
          </div>
        ),
        width: "80px",
      },
    ],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );

  // ─── Inline label helper ──────────────────────────────────────────────────
  const RequiredLabel = ({ children }) => (
    <label className="form-label">
      {children}<sup style={{ color: "red" }}>*</sup>
    </label>
  );

  // ─── Render ───────────────────────────────────────────────────────────────
  return (
    <section className="content">

      {/* ── Create / Edit Form Card ── */}
      {showForm && (
        <div className="card">
          <div className="card-header">
            <h5 className="card-title mb-0">
              {editId ? "Edit Applicant" : "Create Applicant"}
            </h5>
          </div>

          <div className="card-body">
            <div className="row g-3">

              {/* First Name */}
              <div className="col-md-3">
                <RequiredLabel>First Name</RequiredLabel>
                <input
                  type="text"
                  className="form-control"
                  ref={firstNameRef}
                  value={firstName}
                  onChange={(e) => {
                    setFirstName(e.target.value);
                    if (e.target.value.trim()) firstNameRef.current.classList.remove("is-invalid");
                  }}
                  placeholder="First Name"
                />
              </div>

              {/* Last Name */}
              <div className="col-md-3">
                <RequiredLabel>Last Name</RequiredLabel>
                <input
                  type="text"
                  className="form-control"
                  ref={lastNameRef}
                  value={lastName}
                  onChange={(e) => {
                    setLastName(e.target.value);
                    if (e.target.value.trim()) lastNameRef.current.classList.remove("is-invalid");
                  }}
                  placeholder="Last Name"
                />
              </div>

              {/* Date of Birth */}
              <div className="col-md-3">
                <RequiredLabel>Date of Birth</RequiredLabel>
                <input
                  type="date"
                  className="form-control"
                  ref={dobRef}
                  value={dob}
                  onChange={(e) => {
                    setDob(e.target.value);
                    if (e.target.value) dobRef.current.classList.remove("is-invalid");
                  }}
                />
              </div>

              {/* Category */}
              <div className="col-md-3">
                <RequiredLabel>Category</RequiredLabel>
                <select
                  className="form-control"
                  ref={categoryRef}
                  value={category}
                  onChange={(e) => {
                    setCategory(e.target.value);
                    if (e.target.value) categoryRef.current.classList.remove("is-invalid");
                  }}
                >
                  <option value="">Select Category</option>
                  {CATEGORY_OPTIONS.map((cat) => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>

              {/* Entry Type */}
              <div className="col-md-3">
                <RequiredLabel>Entry Type</RequiredLabel>
                <select
                  className="form-control"
                  ref={entryTypeRef}
                  value={entryTypeId}
                  onChange={(e) => {
                    setEntryTypeId(e.target.value);
                    if (e.target.value) entryTypeRef.current.classList.remove("is-invalid");
                  }}
                >
                  <option value="">Select Entry Type</option>
                  {entryTypes.map((et) => (
                    <option key={et.entryTypeId} value={et.entryTypeId}>{et.name}</option>
                  ))}
                </select>
              </div>

              {/* Admission Mode */}
              <div className="col-md-3">
                <RequiredLabel>Admission Type</RequiredLabel>
                <select
                  className="form-control"
                  ref={admissionModeRef}
                  value={admissionModeId}
                  onChange={(e) => {
                    setAdmissionModeId(e.target.value);
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

              {/* Program */}
              <div className="col-md-3">
                <RequiredLabel>Program</RequiredLabel>
                <select
                  className="form-control"
                  ref={programRef}
                  value={programId}
                  onChange={(e) => {
                    setProgramId(e.target.value);
                    if (e.target.value) programRef.current.classList.remove("is-invalid");
                  }}
                >
                  <option value="">Select Program</option>
                  {programs.map((p) => (
                    <option key={p.programId} value={p.programId}>
                      {p.programName} - {p.courseType}
                    </option>
                  ))}
                </select>
              </div>

              {/* Academic Year */}
              <div className="col-md-3">
                <RequiredLabel>Academic Year</RequiredLabel>
                <select
                  className="form-control"
                  ref={academicYearRef}
                  value={academicYearId}
                  onChange={(e) => {
                    setAcademicYearId(e.target.value);
                    if (e.target.value) academicYearRef.current.classList.remove("is-invalid");
                  }}
                >
                  <option value="">Select Academic Year</option>
                  {academicYears.map((y) => (
                    <option key={y.academicYearId} value={y.academicYearId}>
                      {y.yearLabel}
                    </option>
                  ))}
                </select>
              </div>

              {/* Quota */}
              <div className="col-md-3">
                <RequiredLabel>Quota</RequiredLabel>
                <select
                  className="form-control"
                  ref={quotaRef}
                  value={quotaId}
                  onChange={(e) => {
                    setQuotaId(e.target.value);
                    if (e.target.value) quotaRef.current.classList.remove("is-invalid");
                  }}
                >
                  <option value="">Select Quota</option>
                  {quotas.map((q) => (
                    <option key={q.quotaId} value={q.quotaId}>{q.name}</option>
                  ))}
                </select>
              </div>

              {/* Marks */}
              <div className="col-md-3">
                <RequiredLabel>Marks</RequiredLabel>
                <input
                  type="text"
                  inputMode="decimal"
                  className="form-control"
                  ref={marksRef}
                  value={marks}
                  onChange={handleMarksChange}
                  placeholder="e.g. 87.5"
                />
              </div>

              {/* Documents — multiple file upload */}
              <div className="col-md-6">
                <label className="form-label">Documents</label>
                <input
                  type="file"
                  className="form-control"
                  ref={documentsRef}
                  multiple
                  onChange={handleDocumentsChange}
                />
                {documents.length > 0 && (
                  <small className="text-muted">
                    {documents.length} file(s) selected:{" "}
                    {documents.map((f) => f.name).join(", ")}
                  </small>
                )}
              </div>

            </div>

            {/* Buttons */}
            <div className="mt-3 d-flex gap-2">
              <button
                className="custom-btn custom-primary-button"
                onClick={handleSave}
                disabled={isLoading}
              >
                {editId ? "Update" : "Save & Submit"}
              </button>
              <button
                className="custom-btn custom-secondary-button"
                onClick={handleCancel}
                disabled={isLoading}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Data Table Card ── */}
      <div className="card mt-3">
        <div className="card-header d-flex justify-content-between align-items-center">
          <h5 className="card-title mb-0">Applicant Details</h5>
          {!showForm && (
            <button
              className="custom-btn custom-primary-button"
              onClick={() => { resetForm(); setShowForm(true); }}
            >
              <i className="fas fa-plus mr-1"></i> Add Applicant
            </button>
          )}
        </div>
        <div className="card-body">
          <div className="d-flex justify-content-between align-items-center mb-2">
            <h6 className="mb-0">Applicant List ({applicants.length})</h6>
          </div>

          <CustomDataTable
            columns={columns}
            data={applicants}
            loading={isLoading}
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
    </section>
  );
}

export default ApplicantForm;