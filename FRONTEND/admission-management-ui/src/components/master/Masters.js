

// import React, { useState, useEffect, useRef } from "react";
// import axios from "axios";
// import { toast } from "react-toastify";
// import { useSelector } from "react-redux";
// const config = require("../../services/config.json");

// function Masters() {
//   const personalInfo = useSelector((state) => state.personalInformationReducer);
//   const [masters, setMasters] = useState({});
//   const [selectedMaster, setSelectedMaster] = useState("");
//   const [newMasterName, setNewMasterName] = useState("");
//   const [masterValue, setMasterValue] = useState("");
//   const [editId, setEditId] = useState(null);

//   // Validation state
//   const [errors, setErrors] = useState({ masterName: "", masterValue: "" });

//   // Input refs
//   const masterNameRef = useRef(null);
//   const masterValueRef = useRef(null);

//   // Pagination & sorting
//   const [page, setPage] = useState(1);
//   const [pageSize, setPageSize] = useState(5);
//   const [sortConfig, setSortConfig] = useState({ key: null, direction: "asc" });
//   const [searchValues, setSearchValues] = useState({ master: "", value: "" });
//   const masterList = Object.keys(masters);
//   const flattenedData = masterList.flatMap((master) =>
//     masters[master].map((item) => ({ master, ...item }))
//   );

//   let filteredData = flattenedData.filter(
//     (item) =>
//       (!selectedMaster || item.master === selectedMaster) &&
//       item.master.toLowerCase().includes(searchValues.master.toLowerCase()) &&
//       item.value.toLowerCase().includes(searchValues.value.toLowerCase())
//   );

//   if (sortConfig.key) {
//     filteredData = [...filteredData].sort((a, b) => {
//       const aa = a[sortConfig.key];
//       const bb = b[sortConfig.key];
//       if (aa < bb) return sortConfig.direction === "asc" ? -1 : 1;
//       if (aa > bb) return sortConfig.direction === "asc" ? 1 : -1;
//       return 0;
//     });
//   }

//   const totalRecords = filteredData.length;
//   const totalPages = pageSize === -1 ? 1 : Math.ceil(totalRecords / pageSize);
//   const paginatedData =
//     pageSize === -1
//       ? filteredData
//       : filteredData.slice((page - 1) * pageSize, page * pageSize);

//   useEffect(() => {
//     fetchMasters();
//   }, []);

//   useEffect(() => {
//     setPage(1);
//   }, [selectedMaster, pageSize, searchValues, sortConfig]);

//   const fetchMasters = async () => {
//     try {
//       const res = await axios.get(
//         `${config.API_URL}MasterController/GetAllMasters`
//       );
//       if (res.data.success) {
//         const grouped = {};
//         res.data.data.forEach((item) => {
//           if (item.isActive) {
//             const key = item.masterName;
//             if (!grouped[key]) grouped[key] = [];
//             grouped[key].push({
//               id: item.id,
//               value: item.masterValue,
//               isActive: item.isActive,
//               createdBy: item.createdBy,
//               createdOn: item.createdOn,
//               modifiedBy: item.modifiedBy,
//               modifiedOn: item.modifiedOn,
//             });
//           }
//         });
//         setMasters(grouped);
//       } else {
//         toast.error(res.data.message);
//       }
//     } catch (err) {
//       toast.error("Error fetching masters");
//     }
//   };

//   const findEntryById = (id) => {
//     for (let master in masters) {
//       const found = masters[master].find((it) => it.id === id);
//       if (found) return { master, ...found };
//     }
//     return null;
//   };


//   const validateInputs = () => {
//     if (!newMasterName.trim()) {
//       toast.error("Master Name is required");
//       masterNameRef.current.classList.add("is-invalid");
//       masterNameRef.current.focus();
//       return false; 
//     } else {
//       masterNameRef.current.classList.remove("is-invalid");
//     }

//     if (!masterValue.trim()) {
//       toast.error("Master Value is required");
//       masterValueRef.current.classList.add("is-invalid");
//       masterValueRef.current.focus();
//       return false;
//     } else {
//       masterValueRef.current.classList.remove("is-invalid");
//     }

//     return true; 
//   };

//   const handleAddMaster = async () => {
//     if (!validateInputs()) return;

//     const masterKey = newMasterName.trim() || selectedMaster;
//     const now = new Date().toISOString();
//     let body;

//     if (editId) {
//       const original = findEntryById(editId);
//       if (!original) return;
//       body = {
//         id: editId,
//         masterName: masterKey,
//         masterValue: masterValue.trim(),
//         isActive: true,
//         createdBy: original.createdBy,
//         createdOn: original.createdOn,
//         modifiedBy: personalInfo.userID,
//         modifiedOn: now,
//       };
//     } else {
//       body = {
//         id: 0,
//         masterName: masterKey,
//         masterValue: masterValue.trim(),
//         isActive: true,
//         createdBy: personalInfo.userID,
//         createdOn: now,
//         modifiedBy: personalInfo.userID,
//         modifiedOn: now,
//       };
//     }

//     try {
//       let res;
//       if (editId) {
//         res = await axios.put(
//           `${config.API_URL}MasterController/UpdateMaster`,
//           body
//         );
//       } else {
//         res = await axios.post(
//           `${config.API_URL}MasterController/CreateMaster`,
//           body
//         );
//       }
//       if (res.data.success) {
//         toast.success(editId ? "Updated successfully" : "Created successfully");
//         await fetchMasters();
//         setSelectedMaster(masterKey);
//         setNewMasterName(masterKey);
//         setMasterValue("");
//         setEditId(null);
//         setErrors({ masterName: "", masterValue: "" });
//       } else {
//         toast.error(res.data.message || "Update failed");
//       }
//     } catch (err) {
//       toast.error(
//         err.response?.data?.message || err.message || "Something went wrong"
//       );
//     }
//   };

//   const handleEdit = (item) => {
//     setMasterValue(item.value);
//     setEditId(item.id);
//     setNewMasterName(item.master);
//     setSelectedMaster(item.master);
//   };
// const handleDelete = async (item) => {
//   try {
  
//     const url = `${config.API_URL}MasterController/DeleteMasterById?id=${item.id}&UserId=${personalInfo.userID}`;

    
//     const res = await axios.post(url);

//     if (res.data.success) {
//       toast.success("Deleted successfully");
//       await fetchMasters();
//     } else {
//       toast.error(res.data.message || "Delete failed");
//     }
//   } catch (err) {
//     toast.error(err.response?.data?.message || "Error deleting");
//   }
// };

//   const handlePageChange = (newPage) => {
//     if (newPage >= 1 && newPage <= totalPages) setPage(newPage);
//   };

//   const handleSort = (key) => {
//     let direction = "asc";
//     if (sortConfig.key === key && sortConfig.direction === "asc") {
//       direction = "desc";
//     }
//     setSortConfig({ key, direction });
//   };

//   return (
//     <section className="content ">
//       <div className="card">
//         <div className="card-header">
//           <h5 className="card-title mb-0">Create Master</h5>
//         </div>

//         <div className="card-body">
//           <div className="row g-3 align-items-end">
//             <div className="col-md-3">
//               <label className="form-label">Master Name</label>
//               <input
//                 type="text"
//                 className="form-control"
//                 ref={masterNameRef}
//                 value={newMasterName}
//                 onChange={(e) => {
//                   setNewMasterName(e.target.value);
//                   if (e.target.value.trim())
//                     masterNameRef.current.classList.remove("is-invalid");
//                 }}
//                 placeholder="Enter Master Name"
//               />
//             </div>

//             <div className="col-md-3">
//               <label className="form-label">Master Value</label>
//               <input
//                 type="text"
//                 className="form-control"
//                 ref={masterValueRef}
//                 value={masterValue}
//                 onChange={(e) => {
//                   setMasterValue(e.target.value);
//                   if (e.target.value.trim())
//                     masterValueRef.current.classList.remove("is-invalid");
//                 }}
//                 placeholder="Enter Value"
//               />
//             </div>

//             <div
//               className="col-md-2"
//               style={{ display: "flex", justifyItems: "center" }}
//             >
//               <button
//                 className="custom-success-button"
//                 onClick={handleAddMaster}
//               >
//                 {editId ? "Update" : "Save & Submit"}
//               </button>
//             </div>
//           </div>
//         </div>
//       </div>

//       <div className="card mt-3">
//         <div className="card-header">
//           <h5 className="card-title mb-0">Master Data</h5>
//         </div>
//         <div className="card-body">
//           <div className="row g-3">
//             <div className="col-md-4 d-flex align-items-center">
//               <label className=" text-nowrap mr-2 ">Select Master :</label>
//               <select
//                 className="custom-select"
//                 value={selectedMaster}
//                 onChange={(e) => {
//                   setSelectedMaster(e.target.value);
//                   setNewMasterName(e.target.value);
//                   setMasterValue("");
//                   setEditId(null);
//                 }}
//               >
//                 <option value="">All Masters</option>
//                 {masterList.map((m) => (
//                   <option key={m} value={m}>
//                     {m}
//                   </option>
//                 ))}
//               </select>
//             </div>
//           </div>

//           <div className="d-flex justify-content-between align-items-center mb-2 mt-3">
//             <h6 className="mb-0">
//               {selectedMaster || "All Masters"} List ({totalRecords})
//             </h6>
//           </div>

//           <div className="table-container">
//             <div className="scroll-wrapper">
//               <table className="improved-table" style={{ width: "100%" }}>
//                 <thead>
//                   <tr>
//                     <th>Sr. No.</th>
//                     <th
//                       onClick={() => handleSort("master")}
//                       style={{ cursor: "pointer" }}
//                     >
//                       Master Name
//                       {sortConfig.key === "master" && (
//                         <span>
//                           {sortConfig.direction === "asc" ? " ↑" : " ↓"}
//                         </span>
//                       )}
//                     </th>
//                     <th
//                       onClick={() => handleSort("value")}
//                       style={{ cursor: "pointer" }}
//                     >
//                       Value
//                       {sortConfig.key === "value" && (
//                         <span>
//                           {sortConfig.direction === "asc" ? " ↑" : " ↓"}
//                         </span>
//                       )}
//                     </th>
//                     <th className="sticky-action">Action</th>
//                   </tr>
//                 </thead>
//                 <tbody>
//                   {paginatedData.length > 0 ? (
//                     paginatedData.map((item, index) => (
//                       <tr key={item.id}>
//                         <td>{(page - 1) * pageSize + index + 1}</td>
//                         <td>{item.master}</td>
//                         <td>{item.value}</td>
//                         <td className="sticky-action">
//                           <button
//                             className="custom-success-button mr-2"
//                             onClick={() => handleEdit(item)}
//                           >
//                             <i className="fas fa-pen"></i>
//                           </button>
//                           <button
//                             className="custom-primary-button"
//                             onClick={() => handleDelete(item)}
//                           >
//                             <i className="fas fa-trash"></i>
//                           </button>
//                         </td>
//                       </tr>
//                     ))
//                   ) : (
//                     <tr>
//                       <td colSpan={4} className="text-center py-3 text-muted">
//                         No data available
//                       </td>
//                     </tr>
//                   )}
//                 </tbody>
//               </table>
//             </div>
//           </div>

//           {totalPages > 1 && (
//             <div
//               style={{
//                 position: "relative",
//                 width: "100%",
//                 padding: "12px 16px",
//                 borderTop: "1px solid #ddd",
//                 backgroundColor: "#f9f9f9",
//                 marginTop: "20px",
//                 fontSize: "15px",
//                 minHeight: "48px",
//               }}
//             >
           
//               <div
//                 style={{
//                   position: "absolute",
//                   left: "50%",
//                   top: "50%",
//                   transform: "translate(-50%, -50%)",
//                   display: "flex",
//                   alignItems: "center",
//                   gap: "6px",
//                 }}
//               >
//                 <button
//                   className="page-nav"
//                   onClick={() => handlePageChange(1)}
//                   disabled={page === 1}
//                   title="First"
//                 >
//                   «
//                 </button>
//                 <button
//                   className="page-nav"
//                   onClick={() => handlePageChange(page - 1)}
//                   disabled={page === 1}
//                   title="Previous"
//                 >
//                   ‹
//                 </button>
//                 <span>Page</span>
//                 <input
//                   type="number"
//                   min="1"
//                   max={totalPages}
//                   value={page}
//                   onChange={(e) => {
//                     const newPage = parseInt(e.target.value, 10);
//                     if (!isNaN(newPage)) handlePageChange(newPage);
//                   }}
//                   style={{
//                     width: "60px",
//                     height: "36px",
//                     textAlign: "center",
//                     border: "1px solid #ccc",
//                     borderRadius: "6px",
//                   }}
//                 />
//                 <span>of {totalPages}</span>
//                 <button
//                   className="page-nav"
//                   onClick={() => handlePageChange(page + 1)}
//                   disabled={page === totalPages}
//                   title="Next"
//                 >
//                   ›
//                 </button>
//                 <button
//                   className="page-nav"
//                   onClick={() => handlePageChange(totalPages)}
//                   disabled={page === totalPages}
//                   title="Last"
//                 >
//                   »
//                 </button>
//               </div>
//               <div
//                 style={{
//                   position: "absolute",
//                   right: "16px",
//                   top: "50%",
//                   transform: "translateY(-50%)",
//                   fontSize: "14px",
//                   color: "#555",
//                   whiteSpace: "nowrap",
//                 }}
//               >
//                 Rows {(page - 1) * pageSize + 1} -{" "}
//                 {pageSize === -1
//                   ? totalRecords
//                   : Math.min(page * pageSize, totalRecords)}{" "}
//                 of {totalRecords}
//               </div>
//             </div>
//           )}
//         </div>
//       </div>
//     </section>
//   );
// }

// export default Masters;



import React, { useState, useEffect, useRef, useMemo } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { useSelector } from "react-redux";
import CustomDataTable from "../../common/customdatable";
const config = require("../../services/config.json");

function Masters() {
  const personalInfo = useSelector((state) => state.personalInformationReducer);
  const [masters, setMasters] = useState({});
  const [selectedMaster, setSelectedMaster] = useState("");
  const [newMasterName, setNewMasterName] = useState("");
  const [masterValue, setMasterValue] = useState("");
  const [editId, setEditId] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  // Validation state
  const [errors, setErrors] = useState({ masterName: "", masterValue: "" });

  // Input refs
  const masterNameRef = useRef(null);
  const masterValueRef = useRef(null);

  // Search
  const [searchValues, setSearchValues] = useState({ master: "", value: "" });

  const masterList = Object.keys(masters);
  const flattenedData = masterList.flatMap((master) =>
    masters[master].map((item) => ({ master, ...item }))
  );

  let filteredData = flattenedData.filter(
    (item) =>
      (!selectedMaster || item.master === selectedMaster) &&
      item.master.toLowerCase().includes(searchValues.master.toLowerCase()) &&
      item.value.toLowerCase().includes(searchValues.value.toLowerCase())
  );

  useEffect(() => {
    fetchMasters();
  }, []);

  const fetchMasters = async () => {
    setIsLoading(true);
    try {
      const res = await axios.get(
        `${config.API_URL}MasterController/GetAllMasters`
      );
      if (res.data.success) {
        const grouped = {};
        res.data.data.forEach((item) => {
          if (item.isActive) {
            const key = item.masterName;
            if (!grouped[key]) grouped[key] = [];
            grouped[key].push({
              id: item.id,
              value: item.masterValue,
              isActive: item.isActive,
              createdBy: item.createdBy,
              createdOn: item.createdOn,
              modifiedBy: item.modifiedBy,
              modifiedOn: item.modifiedOn,
            });
          }
        });
        setMasters(grouped);
      } else {
        toast.error(res.data.message);
      }
    } catch (err) {
      toast.error("Error fetching masters");
    } finally {
      setIsLoading(false);
    }
  };

  const findEntryById = (id) => {
    for (let master in masters) {
      const found = masters[master].find((it) => it.id === id);
      if (found) return { master, ...found };
    }
    return null;
  };

  const validateInputs = () => {
    if (!newMasterName.trim()) {
      toast.error("Master Name is required");
      masterNameRef.current.classList.add("is-invalid");
      masterNameRef.current.focus();
      return false;
    } else {
      masterNameRef.current.classList.remove("is-invalid");
    }

    if (!masterValue.trim()) {
      toast.error("Master Value is required");
      masterValueRef.current.classList.add("is-invalid");
      masterValueRef.current.focus();
      return false;
    } else {
      masterValueRef.current.classList.remove("is-invalid");
    }

    return true;
  };

  const handleAddMaster = async () => {
    if (!validateInputs()) return;

    const masterKey = newMasterName.trim() || selectedMaster;
    const now = new Date().toISOString();
    let body;

    if (editId) {
      const original = findEntryById(editId);
      if (!original) return;
      body = {
        id: editId,
        masterName: masterKey,
        masterValue: masterValue.trim(),
        isActive: true,
        createdBy: original.createdBy,
        createdOn: original.createdOn,
        modifiedBy: personalInfo.userID,
        modifiedOn: now,
      };
    } else {
      body = {
        id: 0,
        masterName: masterKey,
        masterValue: masterValue.trim(),
        isActive: true,
        createdBy: personalInfo.userID,
        createdOn: now,
        modifiedBy: personalInfo.userID,
        modifiedOn: now,
      };
    }

    setIsLoading(true);
    try {
      let res;
      if (editId) {
        res = await axios.put(
          `${config.API_URL}MasterController/UpdateMaster`,
          body
        );
      } else {
        res = await axios.post(
          `${config.API_URL}MasterController/CreateMaster`,
          body
        );
      }
      if (res.data.success) {
        toast.success(editId ? "Updated successfully" : "Created successfully");
        await fetchMasters();
        setSelectedMaster(masterKey);
        setNewMasterName(masterKey);
        setMasterValue("");
        setEditId(null);
        setErrors({ masterName: "", masterValue: "" });
      } else {
        toast.error(res.data.message || "Update failed");
      }
    } catch (err) {
      toast.error(
        err.response?.data?.message || err.message || "Something went wrong"
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleEdit = (item) => {
    setMasterValue(item.value);
    setEditId(item.id);
    setNewMasterName(item.master);
    setSelectedMaster(item.master);
  };

  const handleDelete = async (item) => {
    setIsLoading(true);
    try {
      const url = `${config.API_URL}MasterController/DeleteMasterById?id=${item.id}&UserId=${personalInfo.userID}`;
      const res = await axios.post(url);
      if (res.data.success) {
        toast.success("Deleted successfully");
        await fetchMasters();
      } else {
        toast.error(res.data.message || "Delete failed");
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Error deleting");
    } finally {
      setIsLoading(false);
    }
  };

  const columns = useMemo(
    () => [
      {
        name: "S.No",
        selector: (row, index) => index + 1,
        width: "60px",
      },
      {
        name: "Master Name",
        selector: (row) => row.master,
        sortable: true,
      },
      {
        name: "Value",
        selector: (row) => row.value,
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
    []
  );

  return (
    <section className="content">
      <div className="card">
        <div className="card-header">
          <h5 className="card-title mb-0">Create Master</h5>
        </div>

        <div className="card-body">
          <div className="row g-3 align-items-end">
            <div className="col-md-3">
              <label className="form-label">Master Name</label>
              <input
                type="text"
                className="form-control"
                ref={masterNameRef}
                value={newMasterName}
                onChange={(e) => {
                  setNewMasterName(e.target.value);
                  if (e.target.value.trim())
                    masterNameRef.current.classList.remove("is-invalid");
                }}
                placeholder="Enter Master Name"
              />
            </div>

            <div className="col-md-3">
              <label className="form-label">Master Value</label>
              <input
                type="text"
                className="form-control"
                ref={masterValueRef}
                value={masterValue}
                onChange={(e) => {
                  setMasterValue(e.target.value);
                  if (e.target.value.trim())
                    masterValueRef.current.classList.remove("is-invalid");
                }}
                placeholder="Enter Value"
              />
            </div>

            <div
              className="col-md-2"
              style={{ display: "flex", justifyItems: "center" }}
            >
              <button
                className="custom-btn custom-primary-button"
                onClick={handleAddMaster}
              >
                {editId ? "Update" : "Save & Submit"}
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="card mt-3">
        <div className="card-header">
          <h5 className="card-title mb-0">Master Data</h5>
        </div>
        <div className="card-body">
          <div className="row g-3">
            <div className="col-md-4 d-flex align-items-center">
              <label className="text-nowrap mr-2">Select Master :</label>
              <select
                className="custom-select"
                value={selectedMaster}
                onChange={(e) => {
                  setSelectedMaster(e.target.value);
                  setNewMasterName(e.target.value);
                  setMasterValue("");
                  setEditId(null);
                }}
              >
                <option value="">All Masters</option>
                {masterList.map((m) => (
                  <option key={m} value={m}>
                    {m}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="d-flex justify-content-between align-items-center mb-2 mt-3">
            <h6 className="mb-0">
              {selectedMaster || "All Masters"} List ({filteredData.length})
            </h6>
          </div>

          <CustomDataTable
            columns={columns}
            data={filteredData}
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

export default Masters;