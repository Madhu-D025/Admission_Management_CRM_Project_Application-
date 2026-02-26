import React, { useState, useEffect, useRef, useMemo } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { useSelector } from "react-redux";
import CustomDataTable from "../../common/customdatable";
const config = require("../../services/config.json");

/**
 * CampusMasters
 *
 * Architecture: Mirrors InstitutionMasters 1-to-1.
 * Extra concern: Institution dropdown populated from GetAllInstitutions API.
 * State: All local via useState. No external state manager needed.
 * Table: CustomDataTable with useMemo columns.
 * Form: Controlled inputs + select with ref-based validation UI.
 */
function CampusMasters() {
  const personalInfo = useSelector((state) => state.personalInformationReducer);

  // ─── State ───────────────────────────────────────────────────────────────
  const [campuses, setCampuses] = useState([]);          // flat list for table
  const [institutions, setInstitutions] = useState([]);  // dropdown source

  // Form fields
  const [selectedInstitutionId, setSelectedInstitutionId] = useState("");
  const [campusName, setCampusName] = useState("");
  const [city, setCity] = useState("");
  const [editId, setEditId] = useState(null);            // null = create, number = update

  const [isLoading, setIsLoading] = useState(false);

  // ─── Refs (validation UI — identical pattern to reference components) ─────
  const institutionRef = useRef(null);
  const campusNameRef  = useRef(null);
  const cityRef        = useRef(null);

  // ─── Lifecycle ────────────────────────────────────────────────────────────
  useEffect(() => {
    fetchCampuses();
    fetchInstitutions();
  }, []);

  // ─── API: Get All Campus ──────────────────────────────────────────────────
  const fetchCampuses = async () => {
    setIsLoading(true);
    try {
      const res = await axios.get(
        `${config.API_URL}MasterController/GetAllCampus`
      );
      if (res.data.success) {
        setCampuses(res.data.data);
      } else {
        toast.error(res.data.message);
      }
    } catch (err) {
      toast.error("Error fetching campus data");
    } finally {
      setIsLoading(false);
    }
  };

  // ─── API: Get All Institutions (populates dropdown) ───────────────────────
  const fetchInstitutions = async () => {
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
    }
  };

  // ─── Validation ───────────────────────────────────────────────────────────
  const validateInputs = () => {
    if (!selectedInstitutionId) {
      toast.error("Institution Name is required");
      institutionRef.current.classList.add("is-invalid");
      institutionRef.current.focus();
      return false;
    } else {
      institutionRef.current.classList.remove("is-invalid");
    }

    if (!campusName.trim()) {
      toast.error("Campus Name is required");
      campusNameRef.current.classList.add("is-invalid");
      campusNameRef.current.focus();
      return false;
    } else {
      campusNameRef.current.classList.remove("is-invalid");
    }

    if (!city.trim()) {
      toast.error("City is required");
      cityRef.current.classList.add("is-invalid");
      cityRef.current.focus();
      return false;
    } else {
      cityRef.current.classList.remove("is-invalid");
    }

    return true;
  };

  // ─── API: Create / Update ─────────────────────────────────────────────────
  const handleSave = async () => {
    if (!validateInputs()) return;

    const body = {
      campusId:      editId ?? 0,
      institutionId: Number(selectedInstitutionId),
      campusName:    campusName.trim(),
      city:          city.trim(),
      isActive:      true,
      userId:        personalInfo.userID,
    };

    setIsLoading(true);
    try {
      const res = await axios.post(
        `${config.API_URL}MasterController/CreateOrUpdateCampus`,
        body
      );

      if (res.data.success) {
        toast.success(
          res.data.message ||
            (editId ? "Updated successfully" : "Created successfully")
        );
        await fetchCampuses();
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
        `${config.API_URL}MasterController/GetCampusById?id=${item.campusId}`
      );
      if (res.data.success) {
        const d = res.data.data;
        setSelectedInstitutionId(String(d.institutionId));
        setCampusName(d.campusName);
        setCity(d.city);
        setEditId(d.campusId);
      } else {
        toast.error(res.data.message || "Failed to fetch campus");
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Error fetching campus");
    } finally {
      setIsLoading(false);
    }
  };

  // ─── API: Delete ──────────────────────────────────────────────────────────
  const handleDelete = async (item) => {
    setIsLoading(true);
    try {
      const url = `${config.API_URL}MasterController/DeleteCampusById?id=${item.campusId}&UserId=${personalInfo.userID}`;
      const res = await axios.post(url);
      if (res.data.success) {
        toast.success(res.data.message || "Deleted successfully");
        await fetchCampuses();
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
    setSelectedInstitutionId("");
    setCampusName("");
    setCity("");
    setEditId(null);
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
        name: "Institution Name",
        selector: (row) => row.institutionName,
        sortable: true,
      },
      {
        name: "Campus Name",
        selector: (row) => row.campusName,
        sortable: true,
      },
      {
        name: "City",
        selector: (row) => row.city,
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
            {editId ? "Edit Campus" : "Create Campus"}
          </h5>
        </div>

        <div className="card-body">
          <div className="row g-3 align-items-end">

            {/* Institution Name Dropdown */}
            <div className="col-md-3">
              <label className="form-label">Institution Name</label>
              <select
                className="form-control"
                ref={institutionRef}
                value={selectedInstitutionId}
                onChange={(e) => {
                  setSelectedInstitutionId(e.target.value);
                  if (e.target.value)
                    institutionRef.current.classList.remove("is-invalid");
                }}
              >
                <option value="">Select Institution</option>
                {institutions.map((inst) => (
                  <option key={inst.institutionId} value={inst.institutionId}>
                    {inst.institutionName}
                  </option>
                ))}
              </select>
            </div>

            {/* Campus Name */}
            <div className="col-md-3">
              <label className="form-label">Campus Name</label>
              <input
                type="text"
                className="form-control"
                ref={campusNameRef}
                value={campusName}
                onChange={(e) => {
                  setCampusName(e.target.value);
                  if (e.target.value.trim())
                    campusNameRef.current.classList.remove("is-invalid");
                }}
                placeholder="Enter Campus Name"
              />
            </div>

            {/* City */}
            <div className="col-md-3">
              <label className="form-label">City</label>
              <input
                type="text"
                className="form-control"
                ref={cityRef}
                value={city}
                onChange={(e) => {
                  setCity(e.target.value);
                  if (e.target.value.trim())
                    cityRef.current.classList.remove("is-invalid");
                }}
                placeholder="Enter City"
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

            {/* Cancel (edit mode only) */}
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
          <h5 className="card-title mb-0">Campus Data</h5>
        </div>
        <div className="card-body">
          <div className="d-flex justify-content-between align-items-center mb-2">
            <h6 className="mb-0">Campus List ({campuses.length})</h6>
          </div>

          <CustomDataTable
            columns={columns}
            data={campuses}
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

export default CampusMasters;