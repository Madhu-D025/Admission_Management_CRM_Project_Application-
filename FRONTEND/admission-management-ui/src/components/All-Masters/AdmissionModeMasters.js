import React, { useState, useEffect, useRef, useMemo } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { useSelector } from "react-redux";
import CustomDataTable from "../../common/customdatable";
const config = require("../../services/config.json");

const ADMISSION_TYPES = ["Government", "Management"];

function AdmissionModeMasters() {
  const personalInfo = useSelector((state) => state.personalInformationReducer);

  const [admissionModes, setAdmissionModes] = useState([]);
  const [admissionType, setAdmissionType] = useState("");
  const [editId, setEditId] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const admissionTypeRef = useRef(null);

  useEffect(() => {
    fetchAdmissionModes();
  }, []);

  const fetchAdmissionModes = async () => {
    setIsLoading(true);
    try {
      const res = await axios.get(`${config.API_URL}MasterController/GetAllAdmissionMode`);
      if (res.data.success) {
        setAdmissionModes(res.data.data);
      } else {
        toast.error(res.data.message);
      }
    } catch (err) {
      toast.error("Error fetching admission modes");
    } finally {
      setIsLoading(false);
    }
  };

  const validateInputs = () => {
    if (!admissionType) {
      toast.error("Admission Type is required");
      admissionTypeRef.current.classList.add("is-invalid");
      admissionTypeRef.current.focus();
      return false;
    } else {
      admissionTypeRef.current.classList.remove("is-invalid");
    }
    return true;
  };

  const handleSave = async () => {
    if (!validateInputs()) return;

    const body = {
      admissionModeId: editId ?? 0,
      admissionType: admissionType,
      isActive: true,
      userId: personalInfo.userID,
    };

    setIsLoading(true);
    try {
      const res = await axios.post(
        `${config.API_URL}MasterController/CreateOrUpdateAdmissionMode`,
        body
      );
      if (res.data.success) {
        toast.success(res.data.message || (editId ? "Updated successfully" : "Created successfully"));
        await fetchAdmissionModes();
        resetForm();
      } else {
        toast.error(res.data.message || "Operation failed");
      }
    } catch (err) {
      toast.error(err.response?.data?.message || err.message || "Something went wrong");
    } finally {
      setIsLoading(false);
    }
  };

  const handleEdit = async (item) => {
    setIsLoading(true);
    try {
      const res = await axios.get(
        `${config.API_URL}MasterController/GetAdmissionModeById?id=${item.admissionModeId}`
      );
      if (res.data.success) {
        const d = res.data.data;
        setAdmissionType(d.admissionType);
        setEditId(d.admissionModeId);
      } else {
        toast.error(res.data.message || "Failed to fetch admission mode");
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Error fetching admission mode");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (item) => {
    setIsLoading(true);
    try {
      const url = `${config.API_URL}MasterController/DeleteAdmissionModeById?id=${item.admissionModeId}&UserId=${personalInfo.userID}`;
      const res = await axios.post(url);
      if (res.data.success) {
        toast.success(res.data.message || "Deleted successfully");
        await fetchAdmissionModes();
      } else {
        toast.error(res.data.message || "Delete failed");
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Error deleting");
    } finally {
      setIsLoading(false);
    }
  };

  const resetForm = () => {
    setAdmissionType("");
    setEditId(null);
  };

  const columns = useMemo(
    () => [
      { name: "S.No", selector: (row, index) => index + 1, width: "60px" },
      { name: "Admission Type", selector: (row) => row.admissionType, sortable: true },
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

  return (
    <section className="content">
      <div className="card">
        <div className="card-header">
          <h5 className="card-title mb-0">{editId ? "Edit Admission Mode" : "Create Admission Mode"}</h5>
        </div>
        <div className="card-body">
          <div className="row g-3 align-items-end">
            <div className="col-md-4">
              <label className="form-label">Admission Type</label>
              <select
                className="form-control"
                ref={admissionTypeRef}
                value={admissionType}
                onChange={(e) => {
                  setAdmissionType(e.target.value);
                  if (e.target.value) admissionTypeRef.current.classList.remove("is-invalid");
                }}
              >
                <option value="">Select Admission Type</option>
                {ADMISSION_TYPES.map((at) => (
                  <option key={at} value={at}>{at}</option>
                ))}
              </select>
            </div>

            <div className="col-md-2" style={{ display: "flex", justifyContent: "center" }}>
              <button className="custom-btn custom-primary-button" onClick={handleSave} disabled={isLoading}>
                {editId ? "Update" : "Save & Submit"}
              </button>
            </div>

            {editId && (
              <div className="col-md-2" style={{ display: "flex", justifyContent: "center" }}>
                <button className="custom-btn custom-secondary-button" onClick={resetForm} disabled={isLoading}>
                  Cancel
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="card mt-3">
        <div className="card-header">
          <h5 className="card-title mb-0">Admission Mode Data</h5>
        </div>
        <div className="card-body">
          <div className="d-flex justify-content-between align-items-center mb-2">
            <h6 className="mb-0">Admission Mode List ({admissionModes.length})</h6>
          </div>
          <CustomDataTable
            columns={columns}
            data={admissionModes}
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

export default AdmissionModeMasters;