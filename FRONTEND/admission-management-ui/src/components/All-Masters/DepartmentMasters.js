import React, { useState, useEffect, useRef, useMemo } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { useSelector } from "react-redux";
import CustomDataTable from "../../common/customdatable";
const config = require("../../services/config.json");

function DepartmentMasters() {
  const personalInfo = useSelector((state) => state.personalInformationReducer);

  const [departments, setDepartments] = useState([]);
  const [campuses, setCampuses] = useState([]);
  const [selectedCampusId, setSelectedCampusId] = useState("");
  const [departmentName, setDepartmentName] = useState("");
  const [editId, setEditId] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const campusRef = useRef(null);
  const departmentNameRef = useRef(null);

  useEffect(() => {
    fetchDepartments();
    fetchCampuses();
  }, []);

  const fetchDepartments = async () => {
    setIsLoading(true);
    try {
      const res = await axios.get(`${config.API_URL}MasterController/GetAllDepartment`);
      if (res.data.success) {
        setDepartments(res.data.data);
      } else {
        toast.error(res.data.message);
      }
    } catch (err) {
      toast.error("Error fetching departments");
    } finally {
      setIsLoading(false);
    }
  };

  const fetchCampuses = async () => {
    try {
      const res = await axios.get(`${config.API_URL}MasterController/GetAllCampus`);
      if (res.data.success) {
        setCampuses(res.data.data);
      } else {
        toast.error(res.data.message);
      }
    } catch (err) {
      toast.error("Error fetching campuses");
    }
  };

  const validateInputs = () => {
    if (!selectedCampusId) {
      toast.error("Campus Name is required");
      campusRef.current.classList.add("is-invalid");
      campusRef.current.focus();
      return false;
    } else {
      campusRef.current.classList.remove("is-invalid");
    }

    if (!departmentName.trim()) {
      toast.error("Department Name is required");
      departmentNameRef.current.classList.add("is-invalid");
      departmentNameRef.current.focus();
      return false;
    } else {
      departmentNameRef.current.classList.remove("is-invalid");
    }

    return true;
  };

  const handleSave = async () => {
    if (!validateInputs()) return;

    const body = {
      departmentId: editId ?? 0,
      campusId: Number(selectedCampusId),
      departmentName: departmentName.trim(),
      isActive: true,
      userId: personalInfo.userID,
    };

    setIsLoading(true);
    try {
      const res = await axios.post(
        `${config.API_URL}MasterController/CreateOrUpdateDepartment`,
        body
      );
      if (res.data.success) {
        toast.success(res.data.message || (editId ? "Updated successfully" : "Created successfully"));
        await fetchDepartments();
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
        `${config.API_URL}MasterController/GetDepartmentById?id=${item.departmentId}`
      );
      if (res.data.success) {
        const d = res.data.data;
        setSelectedCampusId(String(d.campusId));
        setDepartmentName(d.departmentName);
        setEditId(d.departmentId);
      } else {
        toast.error(res.data.message || "Failed to fetch department");
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Error fetching department");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (item) => {
    setIsLoading(true);
    try {
      const url = `${config.API_URL}MasterController/DeleteDepartmentById?id=${item.departmentId}&UserId=${personalInfo.userID}`;
      const res = await axios.post(url);
      if (res.data.success) {
        toast.success(res.data.message || "Deleted successfully");
        await fetchDepartments();
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
    setSelectedCampusId("");
    setDepartmentName("");
    setEditId(null);
  };

  const columns = useMemo(
    () => [
      { name: "S.No", selector: (row, index) => index + 1, width: "60px" },
      { name: "Campus Name", selector: (row) => row.campusName, sortable: true },
      { name: "Department Name", selector: (row) => row.departmentName, sortable: true },
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
          <h5 className="card-title mb-0">{editId ? "Edit Department" : "Create Department"}</h5>
        </div>
        <div className="card-body">
          <div className="row g-3 align-items-end">
            <div className="col-md-3">
              <label className="form-label">Campus Name</label>
              <select
                className="form-control"
                ref={campusRef}
                value={selectedCampusId}
                onChange={(e) => {
                  setSelectedCampusId(e.target.value);
                  if (e.target.value) campusRef.current.classList.remove("is-invalid");
                }}
              >
                <option value="">Select Campus</option>
                {campuses.map((c) => (
                  <option key={c.campusId} value={c.campusId}>{c.campusName}</option>
                ))}
              </select>
            </div>

            <div className="col-md-4">
              <label className="form-label">Department Name</label>
              <input
                type="text"
                className="form-control"
                ref={departmentNameRef}
                value={departmentName}
                onChange={(e) => {
                  setDepartmentName(e.target.value);
                  if (e.target.value.trim()) departmentNameRef.current.classList.remove("is-invalid");
                }}
                placeholder="Enter Department Name"
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
          <h5 className="card-title mb-0">Department Data</h5>
        </div>
        <div className="card-body">
          <div className="d-flex justify-content-between align-items-center mb-2">
            <h6 className="mb-0">Department List ({departments.length})</h6>
          </div>
          <CustomDataTable
            columns={columns}
            data={departments}
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

export default DepartmentMasters;