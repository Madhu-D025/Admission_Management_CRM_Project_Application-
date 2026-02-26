import React, { useState, useEffect, useRef, useMemo } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { useSelector } from "react-redux";
import CustomDataTable from "../../common/customdatable";
const config = require("../../services/config.json");

function AcademicYearMasters() {
  const personalInfo = useSelector((state) => state.personalInformationReducer);

  const [academicYears, setAcademicYears] = useState([]);
  const [yearLabel, setYearLabel] = useState("");
  const [editId, setEditId] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const yearLabelRef = useRef(null);

  useEffect(() => {
    fetchAcademicYears();
  }, []);

  const fetchAcademicYears = async () => {
    setIsLoading(true);
    try {
      const res = await axios.get(`${config.API_URL}MasterController/GetAllAcademicYear`);
      if (res.data.success) {
        setAcademicYears(res.data.data);
      } else {
        toast.error(res.data.message);
      }
    } catch (err) {
      toast.error("Error fetching academic years");
    } finally {
      setIsLoading(false);
    }
  };

  const validateInputs = () => {
    if (!yearLabel.trim()) {
      toast.error("Academic Year is required");
      yearLabelRef.current.classList.add("is-invalid");
      yearLabelRef.current.focus();
      return false;
    } else {
      yearLabelRef.current.classList.remove("is-invalid");
    }
    return true;
  };

  const handleSave = async () => {
    if (!validateInputs()) return;

    const body = {
      academicYearId: editId ?? 0,
      yearLabel: yearLabel.trim(),
      isActive: true,
      userId: personalInfo.userID,
    };

    setIsLoading(true);
    try {
      const res = await axios.post(
        `${config.API_URL}MasterController/CreateOrUpdateAcademicYear`,
        body
      );
      if (res.data.success) {
        toast.success(res.data.message || (editId ? "Updated successfully" : "Created successfully"));
        await fetchAcademicYears();
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
        `${config.API_URL}MasterController/GetAcademicYearById?id=${item.academicYearId}`
      );
      if (res.data.success) {
        const d = res.data.data;
        setYearLabel(d.yearLabel);
        setEditId(d.academicYearId);
      } else {
        toast.error(res.data.message || "Failed to fetch academic year");
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Error fetching academic year");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (item) => {
    setIsLoading(true);
    try {
      const url = `${config.API_URL}MasterController/DeleteAcademicYearById?id=${item.academicYearId}&UserId=${personalInfo.userID}`;
      const res = await axios.post(url);
      if (res.data.success) {
        toast.success(res.data.message || "Deleted successfully");
        await fetchAcademicYears();
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
    setYearLabel("");
    setEditId(null);
  };

  const columns = useMemo(
    () => [
      { name: "S.No", selector: (row, index) => index + 1, width: "60px" },
      { name: "Academic Year", selector: (row) => row.yearLabel, sortable: true },
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
          <h5 className="card-title mb-0">{editId ? "Edit Academic Year" : "Create Academic Year"}</h5>
        </div>
        <div className="card-body">
          <div className="row g-3 align-items-end">
            <div className="col-md-4">
              <label className="form-label">Academic Year</label>
              <input
                type="text"
                className="form-control"
                ref={yearLabelRef}
                value={yearLabel}
                onChange={(e) => {
                  setYearLabel(e.target.value);
                  if (e.target.value.trim()) yearLabelRef.current.classList.remove("is-invalid");
                }}
                placeholder="e.g. 2024-2025"
              />
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
          <h5 className="card-title mb-0">Academic Year Data</h5>
        </div>
        <div className="card-body">
          <div className="d-flex justify-content-between align-items-center mb-2">
            <h6 className="mb-0">Academic Year List ({academicYears.length})</h6>
          </div>
          <CustomDataTable
            columns={columns}
            data={academicYears}
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

export default AcademicYearMasters;