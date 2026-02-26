import React, { useState, useEffect, useRef, useMemo } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { useSelector } from "react-redux";
import CustomDataTable from "../../common/customdatable";
const config = require("../../services/config.json");

const COURSE_TYPES = ["UG", "PG"];

function ProgramBranchMasters() {
  const personalInfo = useSelector((state) => state.personalInformationReducer);

  const [programs, setPrograms] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [selectedDepartmentId, setSelectedDepartmentId] = useState("");
  const [programName, setProgramName] = useState("");
  const [courseType, setCourseType] = useState("");
  const [editId, setEditId] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const departmentRef = useRef(null);
  const programNameRef = useRef(null);
  const courseTypeRef = useRef(null);

  useEffect(() => {
    fetchPrograms();
    fetchDepartments();
  }, []);

  const fetchPrograms = async () => {
    setIsLoading(true);
    try {
      const res = await axios.get(`${config.API_URL}MasterController/GetAllProgramBranch`);
      if (res.data.success) {
        // API returns data.result (nested), not data directly
        const result = res.data.data?.result ?? res.data.data;
        setPrograms(Array.isArray(result) ? result : []);
      } else {
        toast.error(res.data.message);
        setPrograms([]);
      }
    } catch (err) {
      toast.error("Error fetching programs");
      setPrograms([]);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchDepartments = async () => {
    try {
      const res = await axios.get(`${config.API_URL}MasterController/GetAllDepartment`);
      if (res.data.success) {
        setDepartments(Array.isArray(res.data.data) ? res.data.data : []);
      } else {
        toast.error(res.data.message);
        setDepartments([]);
      }
    } catch (err) {
      toast.error("Error fetching departments");
      setDepartments([]);
    }
  };

  const validateInputs = () => {
    if (!selectedDepartmentId) {
      toast.error("Department Name is required");
      departmentRef.current.classList.add("is-invalid");
      departmentRef.current.focus();
      return false;
    } else {
      departmentRef.current.classList.remove("is-invalid");
    }

    if (!programName.trim()) {
      toast.error("Program Name is required");
      programNameRef.current.classList.add("is-invalid");
      programNameRef.current.focus();
      return false;
    } else {
      programNameRef.current.classList.remove("is-invalid");
    }

    if (!courseType) {
      toast.error("Course Type is required");
      courseTypeRef.current.classList.add("is-invalid");
      courseTypeRef.current.focus();
      return false;
    } else {
      courseTypeRef.current.classList.remove("is-invalid");
    }

    return true;
  };

  const handleSave = async () => {
    if (!validateInputs()) return;

    const body = {
      programId: editId ?? 0,
      departmentId: Number(selectedDepartmentId),
      programName: programName.trim(),
      courseType: courseType,
      isActive: true,
      userId: personalInfo.userID,
    };

    setIsLoading(true);
    try {
      const res = await axios.post(
        `${config.API_URL}MasterController/CreateOrUpdateProgramBranch`,
        body
      );
      if (res.data.success) {
        toast.success(res.data.message || (editId ? "Updated successfully" : "Created successfully"));
        await fetchPrograms();
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
        `${config.API_URL}MasterController/GetProgramBranchById?id=${item.programId}`
      );
      if (res.data.success) {
        const d = res.data.data;
        setSelectedDepartmentId(String(d.departmentId));
        setProgramName(d.programName);
        setCourseType(d.courseType);
        setEditId(d.programId);
      } else {
        toast.error(res.data.message || "Failed to fetch program");
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Error fetching program");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (item) => {
    setIsLoading(true);
    try {
      const url = `${config.API_URL}MasterController/DeleteProgramBranchById?id=${item.programId}&UserId=${personalInfo.userID}`;
      const res = await axios.post(url);
      if (res.data.success) {
        toast.success(res.data.message || "Deleted successfully");
        await fetchPrograms();
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
    setSelectedDepartmentId("");
    setProgramName("");
    setCourseType("");
    setEditId(null);
  };

  const columns = useMemo(
    () => [
      { name: "S.No", selector: (row, index) => index + 1, width: "60px" },
      { name: "Department Name", selector: (row) => row.departmentName, sortable: true },
      { name: "Program Name", selector: (row) => row.programName, sortable: true },
      { name: "Course Type", selector: (row) => row.courseType, sortable: true },
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
          <h5 className="card-title mb-0">{editId ? "Edit Program / Branch" : "Create Program / Branch"}</h5>
        </div>
        <div className="card-body">
          <div className="row g-3 align-items-end">
            <div className="col-md-3">
              <label className="form-label">Department Name</label>
              <select
                className="form-control"
                ref={departmentRef}
                value={selectedDepartmentId}
                onChange={(e) => {
                  setSelectedDepartmentId(e.target.value);
                  if (e.target.value) departmentRef.current.classList.remove("is-invalid");
                }}
              >
                <option value="">Select Department</option>
                {departments.map((d) => (
                  <option key={d.departmentId} value={d.departmentId}>{d.departmentName}</option>
                ))}
              </select>
            </div>

            <div className="col-md-3">
              <label className="form-label">Program Name</label>
              <input
                type="text"
                className="form-control"
                ref={programNameRef}
                value={programName}
                onChange={(e) => {
                  setProgramName(e.target.value);
                  if (e.target.value.trim()) programNameRef.current.classList.remove("is-invalid");
                }}
                placeholder="Enter Program Name"
              />
            </div>

            <div className="col-md-2">
              <label className="form-label">Course Type</label>
              <select
                className="form-control"
                ref={courseTypeRef}
                value={courseType}
                onChange={(e) => {
                  setCourseType(e.target.value);
                  if (e.target.value) courseTypeRef.current.classList.remove("is-invalid");
                }}
              >
                <option value="">Select Course Type</option>
                {COURSE_TYPES.map((ct) => (
                  <option key={ct} value={ct}>{ct}</option>
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
          <h5 className="card-title mb-0">Program / Branch Data</h5>
        </div>
        <div className="card-body">
          <div className="d-flex justify-content-between align-items-center mb-2">
            <h6 className="mb-0">Program / Branch List ({programs.length})</h6>
          </div>
          <CustomDataTable
            columns={columns}
            data={programs}
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

export default ProgramBranchMasters;