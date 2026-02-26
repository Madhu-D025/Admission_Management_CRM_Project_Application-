import React, { useState, useEffect, useRef, useMemo } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { useSelector } from "react-redux";
import CustomDataTable from "../../common/customdatable";
const config = require("../../services/config.json");

const ENTRY_TYPES = ["Transfer", "Lateral", "Regular"];

function EntryTypeMasters() {
  const personalInfo = useSelector((state) => state.personalInformationReducer);

  const [entryTypes, setEntryTypes] = useState([]);
  const [name, setName] = useState("");
  const [editId, setEditId] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const nameRef = useRef(null);

  useEffect(() => {
    fetchEntryTypes();
  }, []);

  const fetchEntryTypes = async () => {
    setIsLoading(true);
    try {
      const res = await axios.get(`${config.API_URL}MasterController/GetAllEntryType`);
      if (res.data.success) {
        setEntryTypes(res.data.data);
      } else {
        toast.error(res.data.message);
      }
    } catch (err) {
      toast.error("Error fetching entry types");
    } finally {
      setIsLoading(false);
    }
  };

  const validateInputs = () => {
    if (!name) {
      toast.error("Entry Type is required");
      nameRef.current.classList.add("is-invalid");
      nameRef.current.focus();
      return false;
    } else {
      nameRef.current.classList.remove("is-invalid");
    }
    return true;
  };

  const handleSave = async () => {
    if (!validateInputs()) return;

    const body = {
      entryTypeId: editId ?? 0,
      name: name,
      isActive: true,
      userId: personalInfo.userID,
    };

    setIsLoading(true);
    try {
      const res = await axios.post(
        `${config.API_URL}MasterController/CreateOrUpdateEntryType`,
        body
      );
      if (res.data.success) {
        toast.success(res.data.message || (editId ? "Updated successfully" : "Created successfully"));
        await fetchEntryTypes();
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
        `${config.API_URL}MasterController/GetEntryTypeById?id=${item.entryTypeId}`
      );
      if (res.data.success) {
        const d = res.data.data;
        setName(d.name);
        setEditId(d.entryTypeId);
      } else {
        toast.error(res.data.message || "Failed to fetch entry type");
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Error fetching entry type");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (item) => {
    setIsLoading(true);
    try {
      const url = `${config.API_URL}MasterController/DeleteEntryTypeById?id=${item.entryTypeId}&UserId=${personalInfo.userID}`;
      const res = await axios.post(url);
      if (res.data.success) {
        toast.success(res.data.message || "Deleted successfully");
        await fetchEntryTypes();
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
    setName("");
    setEditId(null);
  };

  const columns = useMemo(
    () => [
      { name: "S.No", selector: (row, index) => index + 1, width: "60px" },
      { name: "Entry Type", selector: (row) => row.name, sortable: true },
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
          <h5 className="card-title mb-0">{editId ? "Edit Entry Type" : "Create Entry Type"}</h5>
        </div>
        <div className="card-body">
          <div className="row g-3 align-items-end">
            <div className="col-md-4">
              <label className="form-label">Entry Type</label>
              <select
                className="form-control"
                ref={nameRef}
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                  if (e.target.value) nameRef.current.classList.remove("is-invalid");
                }}
              >
                <option value="">Select Entry Type</option>
                {ENTRY_TYPES.map((et) => (
                  <option key={et} value={et}>{et}</option>
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
          <h5 className="card-title mb-0">Entry Type Data</h5>
        </div>
        <div className="card-body">
          <div className="d-flex justify-content-between align-items-center mb-2">
            <h6 className="mb-0">Entry Type List ({entryTypes.length})</h6>
          </div>
          <CustomDataTable
            columns={columns}
            data={entryTypes}
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

export default EntryTypeMasters;