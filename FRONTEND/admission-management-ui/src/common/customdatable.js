
// import React, { useState, useRef, useMemo, useEffect } from "react";
// import * as XLSX from "xlsx";
// import PropTypes from "prop-types";
// import { jsPDF } from "jspdf";
// import autoTable from "jspdf-autotable";
// import { toast } from "react-toastify"; // Import react-toastify for error notifications

// const CustomDataTable = ({
//   columns,
//   data,
//   onActionClick,
//   loading = false,
//   itemsPerPageOptions = [5, 10, 20, 30],
//   defaultItemsPerPage = 5,
//   exportable = true,
//   printable = true,
//   pdfExportable = true,
//   showGlobalSearch = true,
//   showColumnToggle = true,
// }) => {
//   const [currentPage, setCurrentPage] = useState(1);
//   const [itemsPerPage, setItemsPerPage] = useState(defaultItemsPerPage);
//   const [globalSearchTerm, setGlobalSearchTerm] = useState("");
//   const [visibleColumns, setVisibleColumns] = useState(
//     columns.reduce((acc, col) => ({ ...acc, [col.name]: true }), {})
//   );
//   const tableRef = useRef(null);
//   const globalSearchRef = useRef(null);
//   const columnToggleRef = useRef(null);

//   // Force boolean conversion for props
//   const isExportable = exportable === true || exportable === "true";
//   const isPrintable = printable === true || printable === "true";
//   const isPdfExportable = pdfExportable === true || pdfExportable === "true";
//   const isGlobalSearchEnabled = showGlobalSearch === true || showGlobalSearch === "true";
//   const isColumnToggleEnabled = showColumnToggle === true || showColumnToggle === "true";

//   // Debug: Log prop values and types
//   useEffect(() => {
//     console.log("CustomDataTable Props:", {
//       exportable: { value: exportable, type: typeof exportable, used: isExportable },
//       printable: { value: printable, type: typeof printable, used: isPrintable },
//       pdfExportable: { value: pdfExportable, type: typeof pdfExportable, used: isPdfExportable },
//       showGlobalSearch: { value: showGlobalSearch, type: typeof showGlobalSearch, used: isGlobalSearchEnabled },
//       showColumnToggle: { value: showColumnToggle, type: typeof showColumnToggle, used: isColumnToggleEnabled },
//       columns: columns.map((col) => col.name),
//     });
//   }, [exportable, printable, pdfExportable, showGlobalSearch, showColumnToggle, columns]);

//   // Debug: Check DOM presence after render
//   useEffect(() => {
//     console.log("DOM Check:", {
//       globalSearch: globalSearchRef.current ? "Present" : "Not Present",
//       columnToggle: columnToggleRef.current ? "Present" : "Not Present",
//     });
//   }, [isGlobalSearchEnabled, isColumnToggleEnabled]);

//   // Validate columns for missing selectors
//   useEffect(() => {
//     columns.forEach((col) => {
//       if (col.name !== "Action" && !col.selector && !col.cell) {
//         console.warn(`Column "${col.name}" is missing both selector and cell properties, which may cause issues in rendering or exporting.`);
//       } else if (col.name !== "Action" && !col.selector) {
//         console.warn(`Column "${col.name}" is missing a selector function, which may cause issues in PDF or Excel export.`);
//       }
//     });
//   }, [columns]);

//   // Column visibility toggle
//   const handleColumnToggle = (columnName) => {
//     setVisibleColumns((prev) => ({
//       ...prev,
//       [columnName]: !prev[columnName],
//     }));
//   };

//   // Clear global search
//   const handleClearGlobalSearch = () => {
//     setGlobalSearchTerm("");
//     setCurrentPage(1);
//   };

//   // Filter data (global search only)
//   const filteredData = useMemo(() => {
//     let result = [...data];
//     if (globalSearchTerm && isGlobalSearchEnabled) {
//       const searchLower = globalSearchTerm.toLowerCase();
//       result = result.filter((item) =>
//         columns.some((col) =>
//           col.selector && col.name !== "Action"
//             ? String(col.selector(item, -1) || "").toLowerCase().includes(searchLower)
//             : false
//         )
//       );
//     }
//     return result;
//   }, [data, globalSearchTerm, columns, isGlobalSearchEnabled]);

//   // Paginate data
//   const totalPages = Math.ceil(filteredData.length / itemsPerPage);
//   const paginatedData = useMemo(() => {
//     const start = (currentPage - 1) * itemsPerPage;
//     return filteredData.slice(start, start + itemsPerPage);
//   }, [filteredData, currentPage, itemsPerPage]);

//   // Export current page to Excel
//   const handleExportCurrentPage = () => {
//     try {
//       const exportData = paginatedData.map((item, index) =>
//         columns.reduce((acc, col) => {
//           if (visibleColumns[col.name] && col.selector && col.name !== "Action") {
//             acc[col.name] = col.selector(item, index) || "";
//           }
//           return acc;
//         }, {})
//       );
//       const ws = XLSX.utils.json_to_sheet(exportData);
//       const wb = XLSX.utils.book_new();
//       XLSX.utils.book_append_sheet(wb, ws, "CurrentPage");
//       XLSX.writeFile(wb, `DataTable_CurrentPage_${new Date().toISOString().split("T")[0]}.xlsx`);
//     } catch (error) {
//       console.error("Error exporting Excel:", error);
//       toast.error("Failed to export Excel. Please check the console for details.");
//     }
//   };

//   // Export full data to Excel
//   const handleExportFullData = () => {
//     try {
//       const exportData = filteredData.map((item, index) =>
//         columns.reduce((acc, col) => {
//           if (visibleColumns[col.name] && col.selector && col.name !== "Action") {
//             acc[col.name] = col.selector(item, index) || "";
//           }
//           return acc;
//         }, {})
//       );
//       const ws = XLSX.utils.json_to_sheet(exportData);
//       const wb = XLSX.utils.book_new();
//       XLSX.utils.book_append_sheet(wb, ws, "FullData");
//       XLSX.writeFile(wb, `DataTable_FullData_${new Date().toISOString().split("T")[0]}.xlsx`);
//     } catch (error) {
//       console.error("Error exporting Excel:", error);
//       toast.error("Failed to export Excel. Please check the console for details.");
//     }
//   };

//   // Export current page to PDF
//   const handleExportPDFCurrentPage = () => {
//     try {
//       const doc = new jsPDF();
//       const tableColumn = columns
//         .filter((col) => visibleColumns[col.name] && col.name !== "Action" && typeof col.selector === "function")
//         .map((col) => col.name);
//       const tableRows = paginatedData.map((item, index) =>
//         columns
//           .filter((col) => visibleColumns[col.name] && col.name !== "Action" && typeof col.selector === "function")
//           .map((col) => col.selector(item, index) || "")
//       );

//       if (tableColumn.length === 0) {
//         toast.error("No valid columns available for PDF export.");
//         return;
//       }

//       autoTable(doc, {
//         head: [tableColumn],
//         body: tableRows,
//         theme: "striped",
//         styles: { fontSize: 10 },
//         headStyles: { fillColor: [22, 160, 133] },
//       });

//       doc.save(`DataTable_CurrentPage_${new Date().toISOString().split("T")[0]}.pdf`);
//     } catch (error) {
//       console.error("Error exporting PDF:", error);
//       toast.error("Failed to export PDF. Please check the console for details.");
//     }
//   };

//   // Export full data to PDF
//   const handleExportPDFFullData = () => {
//     try {
//       const doc = new jsPDF();
//       const tableColumn = columns
//         .filter((col) => visibleColumns[col.name] && col.name !== "Action" && typeof col.selector === "function")
//         .map((col) => col.name);
//       const tableRows = filteredData.map((item, index) =>
//         columns
//           .filter((col) => visibleColumns[col.name] && col.name !== "Action" && typeof col.selector === "function")
//           .map((col) => col.selector(item, index) || "")
//       );

//       if (tableColumn.length === 0) {
//         toast.error("No valid columns available for PDF export.");
//         return;
//       }

//       autoTable(doc, {
//         head: [tableColumn],
//         body: tableRows,
//         theme: "striped",
//         styles: { fontSize: 10 },
//         headStyles: { fillColor: [22, 160, 133] },
//       });

//       doc.save(`DataTable_FullData_${new Date().toISOString().split("T")[0]}.pdf`);
//     } catch (error) {
//       console.error("Error exporting PDF:", error);
//       toast.error("Failed to export PDF. Please check the console for details.");
//     }
//   };

//   // Print table
//   const handlePrint = () => {
//     window.print();
//   };

//   // Pagination component
//   const Pagination = () => {
//     const pageNumbers = [];
//     const maxVisiblePages = 5;
//     let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
//     let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);
//     if (endPage - startPage + 1 < maxVisiblePages) {
//       startPage = Math.max(1, endPage - maxVisiblePages + 1);
//     }
//     for (let i = startPage; i <= endPage; i++) {
//       pageNumbers.push(i);
//     }
//     return (
//       <nav aria-label="Page navigation">
//         <ul className="pagination">
//           <li className={`page-item ${currentPage === 1 ? "disabled" : ""}`}>
//             <button
//               className="page-link"
//               onClick={() => setCurrentPage(currentPage - 1)}
//               aria-label="Previous"
//             >
//               Previous
//             </button>
//           </li>
//           {pageNumbers.map((page) => (
//             <li
//               key={page}
//               className={`page-item ${currentPage === page ? "active" : ""}`}
//             >
//               <button className="page-link" onClick={() => setCurrentPage(page)}>
//                 {page}
//               </button>
//             </li>
//           ))}
//           <li className={`page-item ${currentPage === totalPages ? "disabled" : ""}`}>
//             <button
//               className="page-link"
//               onClick={() => setCurrentPage(currentPage + 1)}
//               aria-label="Next"
//             >
//               Next
//             </button>
//           </li>
//         </ul>
//       </nav>
//     );
//   };

  

//   return (
//   <div ref={tableRef} >
//  <style>
//   {`
//   :root {
//     /* Approver tile gradient colors you specified */
//     --print-start: #0090ad;
//     --print-end: #4fc3dc;

//     --pdf-start: #e74c3c;
//     --pdf-end: #ff6b6b;

//     --xls-start: #27ae60;
//     --xls-end: #55efc4;
//  --column-toggle-start: #6c757d; /* original gray */
//   --column-toggle-end: #7d868c;   /* slightly lighter/different gray */
//     /* Other existing colors */
//     --custom-column-toggle-color: #6c757d;
//     --custom-border-color: #dee2e6;
//   }

//   .custom-control-group {
//     display: flex;
//     justify-content: space-between;
//     align-items: center;
//     flex-wrap: nowrap;
//     width: 100%;
//     margin-bottom: 10px !important;
//     margin-top: 35px;
//   }

//   .custom-control-group > div:first-child {
//     display: flex;
//     align-items: center;
//     gap: 0.3rem;
//     flex-wrap: nowrap;
//   }

//   .btn-custom {
//     font-size: 0.700rem;
//     padding: 0.275rem 0.75rem;
//     display: flex;
//     align-items: center;
//     gap: 0.25rem;
//     border-radius: 3px;
//     box-shadow: 0 2px 6px rgba(0,0,0,0.1);
//     color: #fff;
//     border: none;
//     cursor: pointer;
//     transition: background 0.3s ease-in-out;
//   }

//   /* Updated buttons using linear-gradient backgrounds */

//   .custom-print-btn {
//     background: linear-gradient(135deg, var(--print-start), var(--print-end));
//     border: 1px solid var(--print-start);
//   }
//   .custom-print-btn:hover {
//     background: linear-gradient(135deg, var(--print-end), var(--print-start));
//   }
//   .custom-xls-btn {
//     background: linear-gradient(135deg, var(--xls-start), var(--xls-end));
//     border: 1px solid var(--xls-start);
//   }
//   .custom-xls-btn:hover {
//     background: linear-gradient(135deg, var(--xls-end), var(--xls-start));
//   }

//   .custom-pdf-btn {
//     background: linear-gradient(135deg, var(--pdf-start), var(--pdf-end));
//     border: 1px solid var(--pdf-start);
//   }
//   .custom-pdf-btn:hover {
//     background: linear-gradient(135deg, var(--pdf-end), var(--pdf-start));
//   }

  

//   .custom-dropdown-item,
//   .dropdown-item {
//     background-color: #fff !important;
//     color: #000 !important;
//     border: none !important;
//     padding: 0.5rem 1rem !important;
//     font-size: 0.875rem !important;
//     text-align: left !important;
//     width: 100% !important;
//     cursor: pointer !important;
//     transition: background 0.2s ease-in-out !important;
//   }

//   .custom-dropdown-item:hover,
//   .dropdown-item:hover {
//     background-color: #f1f1f1 !important;
//     color: #000 !important;
//   }

// .custom-column-toggle-btn {
//   background: linear-gradient(135deg, var(--column-toggle-start), var(--column-toggle-end));
//   color: #fff;
//   border: 1px solid var(--column-toggle-start);
// }

// .custom-column-toggle-btn:hover {
//   background: linear-gradient(135deg, var(--column-toggle-end), var(--column-toggle-start));
//   color: #fff;
// }


//   .custom-input-group {
//     display: flex;
//     align-items: center;
//     gap: 1rem;
//     flex: 1;
//     min-width: 250px;
//   }

//   .search-select-wrapper {
//     display: flex;
//     align-items: center;
//     gap: 0.5rem;
//     flex: 1;
//     min-width: 200px;
//   }

//   .search-wrapper {
//     position: relative;
//     flex: 1;
//   }

//   .custom-search {
//     width: 100%;
//     min-width:"400px"
//     padding: 0.5rem 2rem 0.5rem 0.75rem;
//     font-size: 14px;
//     border: 1px solid #d9dffc;
//     border-radius: 6px;
//     outline: none;
//     transition: all 0.2s ease-in-out;
//     box-shadow: 0 2px 6px rgba(0,0,0,0.05);
//   }

//   .custom-search:focus {
//     border-color: #6c63ff;
//     box-shadow: 0 0 8px rgba(108,99,255,0.3);
//   }

//   .clear-btn {
//     position: absolute;
//     right: 5px;
//     top: 50%;
//     transform: translateY(-50%);
//     border: none;
//     background: transparent;
//     color: #ff4d4f;
//     cursor: pointer;
//     font-size: 14px;
//     display: flex;
//     align-items: center;
//     justify-content: center;
//   }

//   .clear-btn:hover {
//     color: #ff1a1a;
//   }

//   .custom-select {
//     width: 100px;
//     padding: 0.45rem 0.5rem;
//     border-radius: 6px;
//     border: 1px solid #d9dffc;
//     outline: none;
//     font-size: 14px;
//     transition: all 0.2s ease-in-out;
//   }

//   .custom-select:focus {
//     border-color: #6c63ff;
//     box-shadow: 0 0 8px rgba(108,99,255,0.3);
//   }

//   .custom-hidden {
//     display: none !important;
//   }

//   .custom-column-toggle-item {
//     background-color: #fff !important;
//     color: #000 !important;
//     border: none !important;
//     padding: 0.5rem 1rem !important;
//     font-size: 0.875rem !important;
//     text-align: left !important;
//     width: 100% !important;
//     cursor: pointer !important;
//     transition: background 0.2s ease-in-out, color 0.2s ease-in-out !important;
//   }

//   .custom-column-show {
//     background-color: #28a745 !important; /* Green for visible columns */
//     color: #fff !important;
//   }

//   .custom-column-show:hover {
//     background-color: #218838 !important; /* Darker green on hover */
//     color: #fff !important;
//   }

//   .custom-column-hide {
//     background-color: #6c757d !important; /* Gray for hidden columns */
//     color: #fff !important;
//   }

//   .custom-column-hide:hover {
//     background-color: #5a6268 !important; /* Darker gray on hover */
//     color: #fff !important;
//   }

//   .custom-column-dropdown {
//     min-width: 200px; /* Adjust as needed */
//   }

//    .custom-data-table-loader {
//     width: 50px;
//     height: 50px;
//     border: 6px solid #e0e0e0; /* light gray fallback border */
//     border-top: 6px solid #e74c3c;  /* red */
//     border-right: 6px solid #0090ad; /* blue */
//     border-radius: 50%;
//     animation: spin 1s linear infinite;
//     margin: auto; /* center inside container */
//   }

//   .visually-hidden {
//     position: absolute;
//     width: 1px;
//     height: 1px;
//     padding: 0;
//     margin: -1px;
//     overflow: hidden;
//     clip: rect(0, 0, 0, 0);
//     border: 0;
//   }

//   @keyframes spin {
//     0% { transform: rotate(0deg); }
//     100% { transform: rotate(360deg); }
//   }
//   `}
// </style>

//   <div className="custom-control-group">
//     <div>
//         {isExportable && (
//       <div className="btn-group">
//         <button
//        className="btn btn-custom custom-xls-btn dropdown-toggle"
//           type="button"
//           data-bs-toggle="dropdown"
//           aria-expanded="false"
//         >
//           <i className="bi bi-file-earmark-excel me-1"></i>
//           Export to Excel
//         </button>
//         <ul className="dropdown-menu">
//           <li>
//             <button className="dropdown-item" onClick={handleExportCurrentPage}>
//               Export Current Page
//             </button>
//           </li>
//           <li>
//             <button className="dropdown-item" onClick={handleExportFullData}>
//               Export Full Data
//             </button>
//           </li>
//         </ul>
//       </div>
//     )}
//     {isPrintable && (
//       <button className="btn btn-custom custom-print-btn" onClick={handlePrint}>
//         <i className="bx bx-printer me-1"></i> Print
//       </button>
//     )}
//     {isPdfExportable && (
//       <div className="btn-group">
//         <button
//           className="btn btn-custom custom-pdf-btn dropdown-toggle"
//           type="button"
//           data-bs-toggle="dropdown"
//           aria-expanded="false"
//         >
//           <i className="bi bi-file-earmark-pdf me-1"></i>
//           Export to PDF
//         </button>
//         <ul className="dropdown-menu">
//           <li>
//             <button className="dropdown-item" onClick={handleExportPDFCurrentPage}>
//               Export Current Page
//             </button>
//           </li>
//           <li>
//             <button className="dropdown-item" onClick={handleExportPDFFullData}>
//               Export Full Data
//             </button>
//           </li>
//         </ul>
//       </div>
//     )}
//     {isColumnToggleEnabled && (
//       <div className="btn-group" ref={columnToggleRef}>
//         <button
//           className="btn btn-custom custom-column-toggle-btn dropdown-toggle"
//           type="button"
//           data-bs-toggle="dropdown"
//           aria-expanded="false"
//         >
//           Show/Hide Columns
//         </button>
//         <ul className="dropdown-menu">
//           {columns.map((col) => (
//             <li key={col.name}>
//               <label className="dropdown-item">
//                 <input
//                   type="checkbox"
//                   checked={visibleColumns[col.name]}
//                   onChange={() => handleColumnToggle(col.name)}
//                 />{" "}
//                 {col.name}
//               </label>
//             </li>
//           ))}
//         </ul>
//       </div>
//     )}

//   {/* {isColumnToggleEnabled && (
//   <div className="btn-group" ref={columnToggleRef}>
//     <button
//       className="btn btn-custom custom-column-toggle-btn dropdown-toggle"
//       type="button"
//       data-bs-toggle="dropdown"
//       aria-expanded="false"
//       id="columnToggleDropdown"
//     >
//       Show/Hide Columns
//     </button>
//     <ul className="dropdown-menu custom-column-dropdown">
//       {columns.map((col) => (
//         <li key={col.name}>
//           <button
//             className={`dropdown-item custom-column-toggle-item ${
//               visibleColumns[col.name]
//                 ? "custom-column-show"
//                 : "custom-column-hide"
//             }`}
//             onClick={() => handleColumnToggle(col.name)}
//             data-column={col.name}
//           >
//             {col.name} {visibleColumns[col.name] ? "(Hide)" : "(Show)"}
//           </button>
//         </li>
//       ))}
//     </ul>
//   </div>
// )} */}
//     </div>
//    <div className={`custom-input-group ${isGlobalSearchEnabled ? "" : "custom-hidden"}`}>
//   <div className="search-select-wrapper">
//     <div className="search-wrapper">
//       <input
//         type="text"
//         className="custom-search"
//         placeholder="Search..."
//         value={globalSearchTerm}
//         onChange={(e) => {
//           setGlobalSearchTerm(e.target.value);
//           setCurrentPage(1);
//         }}
//       />
//       {globalSearchTerm && (
//         <button
//           className="clear-btn"
//           type="button"
//           onClick={handleClearGlobalSearch}
//         >
//           <i className="fa-solid fa-xmark"></i>
//         </button>
//       )}
//     </div>

//     <select
//       className="form-select custom-select"
//       value={itemsPerPage}
//       onChange={(e) => {
//         setItemsPerPage(Number(e.target.value));
//         setCurrentPage(1);
//       }}
//     >
//       {itemsPerPageOptions.map((option) => (
//         <option key={option} value={option}>
//           {option}
//         </option>
//       ))}
//     </select>
//   </div>
// </div>


//   </div>



//       {/* Table */}
//       {loading ? (
//         <div className="text-center">
//          <div className="custom-data-table-loader" role="status">
//   <span className="visually-hidden">Loading...</span>
// </div>

//         </div>
//       ) : (
//         <>
//           <div className="table-wrapper">
//             <table className="table">
//               <thead>
//                 <tr>
//                   {columns.map((col) =>
//                     visibleColumns[col.name] && (
//                       <th key={col.name}>{col.name}</th>
//                     )
//                   )}
//                 </tr>
//               </thead>
//               <tbody>
//                 {paginatedData.length === 0 ? (
//                   <tr>
//                     <td
//                       colSpan={
//                         columns.filter((col) => visibleColumns[col.name]).length
//                       }
//                       className="text-center"
//                     >
//                       No data available
//                     </td>
//                   </tr>
//                 ) : (
//                   paginatedData.map((row, index) => (
//                     <tr key={row.id}>
//                       {columns.map((col) =>
//                         visibleColumns[col.name] && (
//                           <td
//                             key={`${row.id}-${col.name}`}
//                             title={
//                               col.name === "Reason for Destruction" ||
//                               col.name === "Nature of Capital Expenditure"
//                                 ? col.selector
//                                   ? col.selector(row, index) || ""
//                                   : ""
//                                 : ""
//                             }
//                           >
//                             {col.cell
//                               ? col.cell(row, index)
//                               : col.selector
//                               ? col.selector(row, index)
//                               : ""}
//                           </td>
//                         )
//                       )}
//                     </tr>
//                   ))
//                 )}
//               </tbody>
//             </table>
//           </div>
//           <div className="d-flex justify-content-between align-items-center mt-2">
//             <div className="pagination-entries">
//               Showing{" "}
//               {paginatedData.length > 0
//                 ? (currentPage - 1) * itemsPerPage + 1
//                 : 0}{" "}
//               to {Math.min(currentPage * itemsPerPage, filteredData.length)} of{" "}
//               {filteredData.length} entries (filtered from {data.length} total
//               entries)
//             </div>
//             <Pagination />
//           </div>
//         </>
//       )}
//     </div>

    
//   );
// };

// CustomDataTable.propTypes = {
//   columns: PropTypes.arrayOf(
//     PropTypes.shape({
//       name: PropTypes.string.isRequired,
//       selector: PropTypes.func,
//       cell: PropTypes.func,
//     })
//   ).isRequired,
//   data: PropTypes.array.isRequired,
//   onActionClick: PropTypes.func,
//   loading: PropTypes.bool,
//   itemsPerPageOptions: PropTypes.arrayOf(PropTypes.number),
//   defaultItemsPerPage: PropTypes.number,
//   exportable: PropTypes.bool,
//   printable: PropTypes.bool,
//   pdfExportable: PropTypes.bool,
//   showGlobalSearch: PropTypes.bool,
//   showColumnToggle: PropTypes.bool,
// };

// export default CustomDataTable;



// import React, { useState, useRef, useMemo, useEffect } from "react";
// import * as XLSX from "xlsx";
// import PropTypes from "prop-types";
// import { jsPDF } from "jspdf";
// import autoTable from "jspdf-autotable";
// import { toast } from "react-toastify";

// const CustomDataTable = ({
//   columns,
//   data,
//   onActionClick,
//   loading = false,
//   itemsPerPageOptions = [5, 10, 20, 30],
//   defaultItemsPerPage = 5,
//   exportable = true,
//   printable = true,
//   pdfExportable = true,
//   showGlobalSearch = true,
//   showColumnToggle = true,
// }) => {
//   const [currentPage, setCurrentPage] = useState(1);
//   const [itemsPerPage, setItemsPerPage] = useState(defaultItemsPerPage);
//   const [globalSearchTerm, setGlobalSearchTerm] = useState("");
//   const [visibleColumns, setVisibleColumns] = useState(
//     columns.reduce((acc, col) => ({ ...acc, [col.name]: true }), {})
//   );
//   const tableRef = useRef(null);
//   const globalSearchRef = useRef(null);
//   const columnToggleRef = useRef(null);

//   // Force boolean conversion for props
//   const isExportable = exportable === true || exportable === "true";
//   const isPrintable = printable === true || printable === "true";
//   const isPdfExportable = pdfExportable === true || pdfExportable === "true";
//   const isGlobalSearchEnabled = showGlobalSearch === true || showGlobalSearch === "true";
//   const isColumnToggleEnabled = showColumnToggle === true || showColumnToggle === "true";

//   // Debug: Log prop values and types
//   useEffect(() => {
//     console.log("CustomDataTable Props:", {
//       exportable: { value: exportable, type: typeof exportable, used: isExportable },
//       printable: { value: printable, type: typeof printable, used: isPrintable },
//       pdfExportable: { value: pdfExportable, type: typeof pdfExportable, used: isPdfExportable },
//       showGlobalSearch: { value: showGlobalSearch, type: typeof showGlobalSearch, used: isGlobalSearchEnabled },
//       showColumnToggle: { value: showColumnToggle, type: typeof showColumnToggle, used: isColumnToggleEnabled },
//       columns: columns.map((col) => col.name),
//     });
//   }, [exportable, printable, pdfExportable, showGlobalSearch, showColumnToggle, columns]);

//   // Debug: Check DOM presence after render
//   useEffect(() => {
//     console.log("DOM Check:", {
//       globalSearch: globalSearchRef.current ? "Present" : "Not Present",
//       columnToggle: columnToggleRef.current ? "Present" : "Not Present",
//     });
//   }, [isGlobalSearchEnabled, isColumnToggleEnabled]);

//   // Validate columns for missing selectors
//   useEffect(() => {
//     columns.forEach((col) => {
//       if (col.name !== "Action" && !col.selector && !col.cell) {
//         console.warn(`Column "${col.name}" is missing both selector and cell properties, which may cause issues in rendering or exporting.`);
//       } else if (col.name !== "Action" && !col.selector) {
//         console.warn(`Column "${col.name}" is missing a selector function, which may cause issues in PDF or Excel export.`);
//       }
//     });
//   }, [columns]);

//   // Column visibility toggle
//   const handleColumnToggle = (columnName) => {
//     setVisibleColumns((prev) => ({
//       ...prev,
//       [columnName]: !prev[columnName],
//     }));
//   };

//   // Clear global search
//   const handleClearGlobalSearch = () => {
//     setGlobalSearchTerm("");
//     setCurrentPage(1);
//   };

//   // Filter data (global search only)
//   const filteredData = useMemo(() => {
//     let result = [...data];
//     if (globalSearchTerm && isGlobalSearchEnabled) {
//       const searchLower = globalSearchTerm.toLowerCase();
//       result = result.filter((item) =>
//         columns.some((col) =>
//           col.selector && col.name !== "Action"
//             ? String(col.selector(item, -1) || "").toLowerCase().includes(searchLower)
//             : false
//         )
//       );
//     }
//     return result;
//   }, [data, globalSearchTerm, columns, isGlobalSearchEnabled]);

//   // Paginate data
//   const totalPages = Math.ceil(filteredData.length / itemsPerPage);
//   const paginatedData = useMemo(() => {
//     const start = (currentPage - 1) * itemsPerPage;
//     return filteredData.slice(start, start + itemsPerPage);
//   }, [filteredData, currentPage, itemsPerPage]);

//   // Export current page to Excel
//   const handleExportCurrentPage = () => {
//     try {
//       const exportData = paginatedData.map((item, index) =>
//         columns.reduce((acc, col) => {
//           if (visibleColumns[col.name] && col.selector && col.name !== "Action") {
//             acc[col.name] = col.selector(item, index) || "";
//           }
//           return acc;
//         }, {})
//       );
//       const ws = XLSX.utils.json_to_sheet(exportData);
//       const wb = XLSX.utils.book_new();
//       XLSX.utils.book_append_sheet(wb, ws, "CurrentPage");
//       XLSX.writeFile(wb, `DataTable_CurrentPage_${new Date().toISOString().split("T")[0]}.xlsx`);
//     } catch (error) {
//       console.error("Error exporting Excel:", error);
//       toast.error("Failed to export Excel. Please check the console for details.");
//     }
//   };

//   // Export full data to Excel
//   const handleExportFullData = () => {
//     try {
//       const exportData = filteredData.map((item, index) =>
//         columns.reduce((acc, col) => {
//           if (visibleColumns[col.name] && col.selector && col.name !== "Action") {
//             acc[col.name] = col.selector(item, index) || "";
//           }
//           return acc;
//         }, {})
//       );
//       const ws = XLSX.utils.json_to_sheet(exportData);
//       const wb = XLSX.utils.book_new();
//       XLSX.utils.book_append_sheet(wb, ws, "FullData");
//       XLSX.writeFile(wb, `DataTable_FullData_${new Date().toISOString().split("T")[0]}.xlsx`);
//     } catch (error) {
//       console.error("Error exporting Excel:", error);
//       toast.error("Failed to export Excel. Please check the console for details.");
//     }
//   };

//   // Export current page to PDF
//   const handleExportPDFCurrentPage = () => {
//     try {
//       const doc = new jsPDF();
//       const tableColumn = columns
//         .filter((col) => visibleColumns[col.name] && col.name !== "Action" && typeof col.selector === "function")
//         .map((col) => col.name);
//       const tableRows = paginatedData.map((item, index) =>
//         columns
//           .filter((col) => visibleColumns[col.name] && col.name !== "Action" && typeof col.selector === "function")
//           .map((col) => col.selector(item, index) || "")
//       );

//       if (tableColumn.length === 0) {
//         toast.error("No valid columns available for PDF export.");
//         return;
//       }

//       autoTable(doc, {
//         head: [tableColumn],
//         body: tableRows,
//         theme: "striped",
//         styles: { fontSize: 10 },
//         headStyles: { fillColor: [22, 160, 133] },
//       });

//       doc.save(`DataTable_CurrentPage_${new Date().toISOString().split("T")[0]}.pdf`);
//     } catch (error) {
//       console.error("Error exporting PDF:", error);
//       toast.error("Failed to export PDF. Please check the console for details.");
//     }
//   };

//   // Export full data to PDF
//   const handleExportPDFFullData = () => {
//     try {
//       const doc = new jsPDF();
//       const tableColumn = columns
//         .filter((col) => visibleColumns[col.name] && col.name !== "Action" && typeof col.selector === "function")
//         .map((col) => col.name);
//       const tableRows = filteredData.map((item, index) =>
//         columns
//           .filter((col) => visibleColumns[col.name] && col.name !== "Action" && typeof col.selector === "function")
//           .map((col) => col.selector(item, index) || "")
//       );

//       if (tableColumn.length === 0) {
//         toast.error("No valid columns available for PDF export.");
//         return;
//       }

//       autoTable(doc, {
//         head: [tableColumn],
//         body: tableRows,
//         theme: "striped",
//         styles: { fontSize: 10 },
//         headStyles: { fillColor: [22, 160, 133] },
//       });

//       doc.save(`DataTable_FullData_${new Date().toISOString().split("T")[0]}.pdf`);
//     } catch (error) {
//       console.error("Error exporting PDF:", error);
//       toast.error("Failed to export PDF. Please check the console for details.");
//     }
//   };

//   // Print table
//   const handlePrint = () => {
//     window.print();
//   };

//   // Pagination component
//   const Pagination = () => {
//     const pageNumbers = [];
//     const maxVisiblePages = 5;
//     let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
//     let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);
//     if (endPage - startPage + 1 < maxVisiblePages) {
//       startPage = Math.max(1, endPage - maxVisiblePages + 1);
//     }
//     for (let i = startPage; i <= endPage; i++) {
//       pageNumbers.push(i);
//     }
//     return (
//       <nav aria-label="Page navigation">
//         <ul className="pagination">
//           <li className={`page-item ${currentPage === 1 ? "disabled" : ""}`}>
//             <button
//               className="page-link"
//               onClick={() => setCurrentPage(currentPage - 1)}
//               aria-label="Previous"
//             >
//               Previous
//             </button>
//           </li>
//           {pageNumbers.map((page) => (
//             <li
//               key={page}
//               className={`page-item ${currentPage === page ? "active" : ""}`}
//             >
//               <button className="page-link" onClick={() => setCurrentPage(page)}>
//                 {page}
//               </button>
//             </li>
//           ))}
//           <li className={`page-item ${currentPage === totalPages ? "disabled" : ""}`}>
//             <button
//               className="page-link"
//               onClick={() => setCurrentPage(currentPage + 1)}
//               aria-label="Next"
//             >
//               Next
//             </button>
//           </li>
//         </ul>
//       </nav>
//     );
//   };

//   return (
//     <div ref={tableRef}>
//       <style>
//         {`
//           :root {
//             --print-start: #0090ad;
//             --print-end: #4fc3dc;
//             --pdf-start: #e74c3c;
//             --pdf-end: #ff6b6b;
//             --xls-start: #27ae60;
//             --xls-end: #55efc4;
//             --column-toggle-start: #6c757d;
//             --column-toggle-end: #7d868c;
//             --border-color: #dee2e6;
//             --primary-color: #6c63ff;
//             --background-light: #f8f9fa;
//             --text-color: #333;
//           }

//           .custom-data-table-container {
//             padding: 1rem;
//             background: var(--background-light);
//             border-radius: 8px;
//             box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
//             max-width: 100%;
//             overflow-x: auto;
//           }

//           .custom-control-group {
//             display: flex;
//             flex-wrap: wrap;
//             gap: 1rem;
//             align-items: center;
//             justify-content: space-between;
//             // margin-bottom: 1.5rem;
//           }

//           .custom-control-group > div:first-child {
//             display: flex;
//             flex-wrap: wrap;
//             gap: 0.5rem;
//             align-items: center;
//           }

//           .btn-custom {
//             font-size: 0.875rem;
//             padding: 0.5rem 1rem;
//             border-radius: 6px;
//             color: #fff;
//             border: none;
//             cursor: pointer;
//             transition: background 0.3s ease, transform 0.2s ease;
//             display: flex;
//             align-items: center;
//             gap: 0.25rem;
//             box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
//           }

//           .btn-custom:hover {
//             transform: translateY(-2px);
//           }

//           .custom-print-btn {
//             background: linear-gradient(135deg, var(--print-start), var(--print-end));
//           }
//           .custom-print-btn:hover {
//             background: linear-gradient(135deg, var(--print-end), var(--print-start));
//           }

//           .custom-xls-btn {
//             background: linear-gradient(135deg, var(--xls-start), var(--xls-end));
//           }
//           .custom-xls-btn:hover {
//             background: linear-gradient(135deg, var(--xls-end), var(--xls-start));
//           }

//           .custom-pdf-btn {
//             background: linear-gradient(135deg, var(--pdf-start), var(--pdf-end));
//           }
//           .custom-pdf-btn:hover {
//             background: linear-gradient(135deg, var(--pdf-end), var(--pdf-start));
//           }

//           .custom-column-toggle-btn {
//             background: linear-gradient(135deg, var(--column-toggle-start), var(--column-toggle-end));
//           }
//           .custom-column-toggle-btn:hover {
//             background: linear-gradient(135deg, var(--column-toggle-end), var(--column-toggle-start));
//           }

//           .custom-input-group {
//             display: flex;
//             flex: 1;
//             max-width: 500px;
//             gap: 0.5rem;
//             align-items: center;
//           }

//           .search-select-wrapper {
//             display: flex;
//             flex: 1;
//             gap: 0.5rem;
//             align-items: center;
//             max-width: 100%;
//           }

//           .search-wrapper {
//             position: relative;
//             flex: 1;
//             max-width: 350px;
//           }

//           .custom-search {
//             width: 100%;
//             padding: 0.5rem 2.5rem 0.5rem 1rem;
//             font-size: 0.875rem;
//             border: 1px solid var(--border-color);
//             border-radius: 6px;
//             outline: none;
//             transition: border-color 0.2s ease, box-shadow 0.2s ease;
//           }

//           .custom-search:focus {
//             border-color: var(--primary-color);
//             box-shadow: 0 0 6px rgba(108, 99, 255, 0.2);
//           }

//           .clear-btn {
//             position: absolute;
//             right: 10px;
//             top: 50%;
//             transform: translateY(-50%);
//             background: transparent;
//             border: none;
//             color: #ff4d4f;
//             cursor: pointer;
//             font-size: 1rem;
//           }

//           .clear-btn:hover {
//             color: #e63946;
//           }

//           .custom-select {
//             width: 100px;
//             padding: 0.5rem;
//             border-radius: 6px;
//             border: 1px solid var(--border-color);
//             font-size: 0.875rem;
//             outline: none;
//             transition: border-color 0.2s ease, box-shadow 0.2s ease;
//           }

//           .custom-select:focus {
//             border-color: var(--primary-color);
//             box-shadow: 0 0 6px rgba(108, 99, 255, 0.2);
//           }

//           .custom-hidden {
//             display: none;
//           }

//           .dropdown-menu {
//             border-radius: 6px;
//             box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
//             padding: 0.5rem 0;
//           }

//           .dropdown-item {
//             font-size: 0.875rem;
//             padding: 0.5rem 1rem;
//             color: var(--text-color);
//             transition: background 0.2s ease;
//           }

//           .dropdown-item:hover {
//             background: #f1f1f1;
//           }

//           .custom-column-toggle-item {
//             display: flex;
//             align-items: center;
//             gap: 0.5rem;
//             padding: 0.5rem 1rem;
//           }

//           .custom-column-show {
//             background: #28a745;
//             color: #fff;
//           }

//           .custom-column-show:hover {
//             background: #218838;
//           }

//           .custom-column-hide {
//             background: #6c757d;
//             color: #fff;
//           }

//           .custom-column-hide:hover {
//             background: #5a6268;
//           }

//           .table-wrapper {
//             overflow-x: auto;
//           }

//           .table {
//             width: 100%;
//             border-collapse: collapse;
//             background: #fff;
//             border-radius: 6px;
//             overflow: hidden;
//             box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
//           }

//           .table th,
//           .table td {
//             padding: 0.75rem;
//             text-align: left;
//             border-bottom: 1px solid var(--border-color);
//           }

       

//           .table tbody tr:hover {
//             background: #f8f9fa;
//           }

//           .custom-data-table-loader {
//             width: 40px;
//             height: 40px;
//             border: 5px solid #e0e0e0;
//             border-top: 5px solid var(--primary-color);
//             border-radius: 50%;
//             animation: spin 1s linear infinite;
//             margin: 2rem auto;
//           }

//           .pagination-entries {
//             font-size: 0.875rem;
//             color: var(--text-color);
//           }

//           .pagination {
//             margin: 0;
//           }

//           .page-link {
//             border-radius: 4px;
//             margin: 0 2px;
          
//           }

          

//           .visually-hidden {
//             position: absolute;
//             width: 1px;
//             height: 1px;
//             padding: 0;
//             margin: -1px;
//             overflow: hidden;
//             clip: rect(0, 0, 0, 0);
//             border: 0;
//           }

//           @keyframes spin {
//             0% { transform: rotate(0deg); }
//             100% { transform: rotate(360deg); }
//           }

//           @media (max-width: 768px) {
//             .custom-control-group {
//               flex-direction: column;
//               align-items: flex-start;
//             }

//             .custom-input-group {
//               max-width: 100%;
//             }

//             .search-wrapper {
//               max-width: 100%;
//             }

//             .custom-select {
//               width: 80px;
//             }
//           }
//         `}
//       </style>

//       <div className="custom-data-table-container">
//         <div className="custom-control-group">
//           <div>
//             {isExportable && (
//               <div className="btn-group">
//                 <button
//                   className="btn btn-custom custom-xls-btn dropdown-toggle"
//                   type="button"
//                   data-bs-toggle="dropdown"
//                   aria-expanded="false"
//                 >
//                   <i className="bi bi-file-earmark-excel me-1"></i>
//                   Export to Excel
//                 </button>
//                 <ul className="dropdown-menu">
//                   <li>
//                     <button className="dropdown-item" onClick={handleExportCurrentPage}>
//                       Export Current Page
//                     </button>
//                   </li>
//                   <li>
//                     <button className="dropdown-item" onClick={handleExportFullData}>
//                       Export Full Data
//                     </button>
//                   </li>
//                 </ul>
//               </div>
//             )}
//             {isPrintable && (
//               <button className="btn btn-custom custom-print-btn" onClick={handlePrint}>
//                 <i className="bx bx-printer me-1"></i> Print
//               </button>
//             )}
//             {isPdfExportable && (
//               <div className="btn-group">
//                 <button
//                   className="btn btn-custom custom-pdf-btn dropdown-toggle"
//                   type="button"
//                   data-bs-toggle="dropdown"
//                   aria-expanded="false"
//                 >
//                   <i className="bi bi-file-earmark-pdf me-1"></i>
//                   Export to PDF
//                 </button>
//                 <ul className="dropdown-menu">
//                   <li>
//                     <button className="dropdown-item" onClick={handleExportPDFCurrentPage}>
//                       Export Current Page
//                     </button>
//                   </li>
//                   <li>
//                     <button className="dropdown-item" onClick={handleExportPDFFullData}>
//                       Export Full Data
//                     </button>
//                   </li>
//                 </ul>
//               </div>
//             )}
//             {isColumnToggleEnabled && (
//               <div className="btn-group" ref={columnToggleRef}>
//                 <button
//                   className="btn btn-custom custom-column-toggle-btn dropdown-toggle"
//                   type="button"
//                   data-bs-toggle="dropdown"
//                   aria-expanded="false"
//                 >
//                   Show/Hide Columns
//                 </button>
//                 <ul className="dropdown-menu">
//                   {columns.map((col) => (
//                     <li key={col.name}>
//                       <label className="dropdown-item custom-column-toggle-item">
//                         <input
//                           type="checkbox"
//                           checked={visibleColumns[col.name]}
//                           onChange={() => handleColumnToggle(col.name)}
//                         />{" "}
//                         {col.name}
//                       </label>
//                     </li>
//                   ))}
//                 </ul>
//               </div>
//             )}
//           </div>
//           {isGlobalSearchEnabled && (
//             <div className="custom-input-group">
//               <div className="search-select-wrapper">
//                 <div className="search-wrapper">
//                   <input
//                     type="text"
//                     className="custom-search"
//                     placeholder="Search..."
//                     value={globalSearchTerm}
//                     onChange={(e) => {
//                       setGlobalSearchTerm(e.target.value);
//                       setCurrentPage(1);
//                     }}
//                     ref={globalSearchRef}
//                   />
//                   {globalSearchTerm && (
//                     <button
//                       className="clear-btn"
//                       type="button"
//                       onClick={handleClearGlobalSearch}
//                     >
//                       <i className="fa-solid fa-xmark"></i>
//                     </button>
//                   )}
//                 </div>
//                 <select
//                   className="form-select custom-select"
//                   value={itemsPerPage}
//                   onChange={(e) => {
//                     setItemsPerPage(Number(e.target.value));
//                     setCurrentPage(1);
//                   }}
//                 >
//                   {itemsPerPageOptions.map((option) => (
//                     <option key={option} value={option}>
//                       {option}
//                     </option>
//                   ))}
//                 </select>
//               </div>
//             </div>
//           )}
//         </div>

//         {loading ? (
//           <div className="text-center">
//             <div className="custom-data-table-loader" role="status">
//               <span className="visually-hidden">Loading...</span>
//             </div>
//           </div>
//         ) : (
//           <>
//             <div className="table-wrapper">
//               <table className="table">
//                 <thead>
//                   <tr>
//                     {columns.map((col) =>
//                       visibleColumns[col.name] && (
//                         <th key={col.name}>{col.name}</th>
//                       )
//                     )}
//                   </tr>
//                 </thead>
//                 <tbody>
//                   {paginatedData.length === 0 ? (
//                     <tr>
//                       <td
//                         colSpan={
//                           columns.filter((col) => visibleColumns[col.name]).length
//                         }
//                         className="text-center"
//                       >
//                         No data available
//                       </td>
//                     </tr>
//                   ) : (
//                     paginatedData.map((row, index) => (
//                       <tr key={row.id}>
//                         {columns.map((col) =>
//                           visibleColumns[col.name] && (
//                             <td
//                               key={`${row.id}-${col.name}`}
//                               title={
//                                 col.name === "Reason for Destruction" ||
//                                 col.name === "Nature of Capital Expenditure"
//                                   ? col.selector
//                                     ? col.selector(row, index) || ""
//                                     : ""
//                                   : ""
//                               }
//                             >
//                               {col.cell
//                                 ? col.cell(row, index)
//                                 : col.selector
//                                 ? col.selector(row, index)
//                                 : ""}
//                             </td>
//                           )
//                         )}
//                       </tr>
//                     ))
//                   )}
//                 </tbody>
//               </table>
//             </div>
//             <div className="d-flex justify-content-between align-items-center mt-2">
//               <div className="pagination-entries">
//                 Showing{" "}
//                 {paginatedData.length > 0
//                   ? (currentPage - 1) * itemsPerPage + 1
//                   : 0}{" "}
//                 to {Math.min(currentPage * itemsPerPage, filteredData.length)} of{" "}
//                 {filteredData.length} entries (filtered from {data.length} total
//                 entries)
//               </div>
//               <Pagination />
//             </div>
//           </>
//         )}
//       </div>
//     </div>
//   );
// };

// CustomDataTable.propTypes = {
//   columns: PropTypes.arrayOf(
//     PropTypes.shape({
//       name: PropTypes.string.isRequired,
//       selector: PropTypes.func,
//       cell: PropTypes.func,
//     })
//   ).isRequired,
//   data: PropTypes.array.isRequired,
//   onActionClick: PropTypes.func,
//   loading: PropTypes.bool,
//   itemsPerPageOptions: PropTypes.arrayOf(PropTypes.number),
//   defaultItemsPerPage: PropTypes.number,
//   exportable: PropTypes.bool,
//   printable: PropTypes.bool,
//   pdfExportable: PropTypes.bool,
//   showGlobalSearch: PropTypes.bool,
//   showColumnToggle: PropTypes.bool,
// };

// export default CustomDataTable;













import React, { useState, useRef, useMemo, useEffect } from "react";
import * as XLSX from "xlsx";
import PropTypes from "prop-types";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import { toast } from "react-toastify";

const CustomDataTable = ({
  columns,
  data,
  onActionClick,
  loading = false,
  itemsPerPageOptions = [5, 10, 20, 30],
  defaultItemsPerPage = 5,
  exportable = true,
  printable = true,
  pdfExportable = true,
  showGlobalSearch = true,
  showColumnToggle = true,
}) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(defaultItemsPerPage);
  const [globalSearchTerm, setGlobalSearchTerm] = useState("");
  const [visibleColumns, setVisibleColumns] = useState(
    columns.reduce((acc, col) => ({ ...acc, [col.name]: true }), {})
  );
  const tableRef = useRef(null);
  const globalSearchRef = useRef(null);
  const columnToggleRef = useRef(null);
  const dropdownRef = useRef(null); // Ref for the dropdown menu

  // Force boolean conversion for props
  const isExportable = exportable === true || exportable === "true";
  const isPrintable = printable === true || printable === "true";
  const isPdfExportable = pdfExportable === true || pdfExportable === "true";
  const isGlobalSearchEnabled = showGlobalSearch === true || showGlobalSearch === "true";
  const isColumnToggleEnabled = showColumnToggle === true || showColumnToggle === "true";

  // Debug: Log prop values and types
  useEffect(() => {
    console.log("CustomDataTable Props:", {
      exportable: { value: exportable, type: typeof exportable, used: isExportable },
      printable: { value: printable, type: typeof printable, used: isPrintable },
      pdfExportable: { value: pdfExportable, type: typeof pdfExportable, used: isPdfExportable },
      showGlobalSearch: { value: showGlobalSearch, type: typeof showGlobalSearch, used: isGlobalSearchEnabled },
      showColumnToggle: { value: showColumnToggle, type: typeof showColumnToggle, used: isColumnToggleEnabled },
      columns: columns.map((col) => col.name),
    });
  }, [exportable, printable, pdfExportable, showGlobalSearch, showColumnToggle, columns]);

  // Debug: Check DOM presence after render
  useEffect(() => {
    console.log("DOM Check:", {
      globalSearch: globalSearchRef.current ? "Present" : "Not Present",
      columnToggle: columnToggleRef.current ? "Present" : "Not Present",
    });
  }, [isGlobalSearchEnabled, isColumnToggleEnabled]);

  // Validate columns for missing selectors
  useEffect(() => {
    columns.forEach((col) => {
      if (col.name !== "Action" && !col.selector && !col.cell) {
        console.warn(`Column "${col.name}" is missing both selector and cell properties, which may cause issues in rendering or exporting.`);
      } else if (col.name !== "Action" && !col.selector) {
        console.warn(`Column "${col.name}" is missing a selector function, which may cause issues in PDF or Excel export.`);
      }
    });
  }, [columns]);

  // Handle column toggle
  const handleColumnToggle = (columnName, e) => {
    e.stopPropagation(); // Prevent dropdown from closing
    setVisibleColumns((prev) => ({
      ...prev,
      [columnName]: !prev[columnName],
    }));
  };

  // Handle outside click to close dropdown
  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (
        columnToggleRef.current &&
        dropdownRef.current &&
        !columnToggleRef.current.contains(e.target) &&
        !dropdownRef.current.contains(e.target)
      ) {
        const dropdownMenu = dropdownRef.current;
        if (dropdownMenu.classList.contains("show")) {
          dropdownMenu.classList.remove("show");
        }
      }
    };

    document.addEventListener("click", handleOutsideClick);
    return () => {
      document.removeEventListener("click", handleOutsideClick);
    };
  }, [isColumnToggleEnabled]);

  // Clear global search
  const handleClearGlobalSearch = () => {
    setGlobalSearchTerm("");
    setCurrentPage(1);
  };

  // Filter data (global search only)
  const filteredData = useMemo(() => {
    let result = [...data];
    if (globalSearchTerm && isGlobalSearchEnabled) {
      const searchLower = globalSearchTerm.toLowerCase();
      result = result.filter((item) =>
        columns.some((col) =>
          col.selector && col.name !== "Action"
            ? String(col.selector(item, -1) || "").toLowerCase().includes(searchLower)
            : false
        )
      );
    }
    return result;
  }, [data, globalSearchTerm, columns, isGlobalSearchEnabled]);

  // Paginate data
  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredData.slice(start, start + itemsPerPage);
  }, [filteredData, currentPage, itemsPerPage]);

  // Export current page to Excel
  const handleExportCurrentPage = () => {
    try {
      const exportData = paginatedData.map((item, index) =>
        columns.reduce((acc, col) => {
          if (visibleColumns[col.name] && col.selector && col.name !== "Action") {
            acc[col.name] = col.selector(item, index) || "";
          }
          return acc;
        }, {})
      );
      const ws = XLSX.utils.json_to_sheet(exportData);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "CurrentPage");
      XLSX.writeFile(wb, `DataTable_CurrentPage_${new Date().toISOString().split("T")[0]}.xlsx`);
    } catch (error) {
      console.error("Error exporting Excel:", error);
      toast.error("Failed to export Excel. Please check the console for details.");
    }
  };

  // Export full data to Excel
  const handleExportFullData = () => {
    try {
      const exportData = filteredData.map((item, index) =>
        columns.reduce((acc, col) => {
          if (visibleColumns[col.name] && col.selector && col.name !== "Action") {
            acc[col.name] = col.selector(item, index) || "";
          }
          return acc;
        }, {})
      );
      const ws = XLSX.utils.json_to_sheet(exportData);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "FullData");
      XLSX.writeFile(wb, `DataTable_FullData_${new Date().toISOString().split("T")[0]}.xlsx`);
    } catch (error) {
      console.error("Error exporting Excel:", error);
      toast.error("Failed to export Excel. Please check the console for details.");
    }
  };

  // Export current page to PDF
  const handleExportPDFCurrentPage = () => {
    try {
      const doc = new jsPDF();
      const tableColumn = columns
        .filter((col) => visibleColumns[col.name] && col.name !== "Action" && typeof col.selector === "function")
        .map((col) => col.name);
      const tableRows = paginatedData.map((item, index) =>
        columns
          .filter((col) => visibleColumns[col.name] && col.name !== "Action" && typeof col.selector === "function")
          .map((col) => col.selector(item, index) || "")
      );

      if (tableColumn.length === 0) {
        toast.error("No valid columns available for PDF export.");
        return;
      }

      autoTable(doc, {
        head: [tableColumn],
        body: tableRows,
        theme: "striped",
        styles: { fontSize: 10 },
        headStyles: { fillColor: [22, 160, 133] },
      });

      doc.save(`DataTable_CurrentPage_${new Date().toISOString().split("T")[0]}.pdf`);
    } catch (error) {
      console.error("Error exporting PDF:", error);
      toast.error("Failed to export PDF. Please check the console for details.");
    }
  };

  // Export full data to PDF
  const handleExportPDFFullData = () => {
    try {
      const doc = new jsPDF();
      const tableColumn = columns
        .filter((col) => visibleColumns[col.name] && col.name !== "Action" && typeof col.selector === "function")
        .map((col) => col.name);
      const tableRows = filteredData.map((item, index) =>
        columns
          .filter((col) => visibleColumns[col.name] && col.name !== "Action" && typeof col.selector === "function")
          .map((col) => col.selector(item, index) || "")
      );

      if (tableColumn.length === 0) {
        toast.error("No valid columns available for PDF export.");
        return;
      }

      autoTable(doc, {
        head: [tableColumn],
        body: tableRows,
        theme: "striped",
        styles: { fontSize: 10 },
        headStyles: { fillColor: [22, 160, 133] },
      });

      doc.save(`DataTable_FullData_${new Date().toISOString().split("T")[0]}.pdf`);
    } catch (error) {
      console.error("Error exporting PDF:", error);
      toast.error("Failed to export PDF. Please check the console for details.");
    }
  };

  // Print table
  const handlePrint = () => {
    window.print();
  };

  // Pagination component
  const Pagination = () => {
    const pageNumbers = [];
    const maxVisiblePages = 5;
    let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
    let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);
    if (endPage - startPage + 1 < maxVisiblePages) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }
    for (let i = startPage; i <= endPage; i++) {
      pageNumbers.push(i);
    }
    return (
      <nav aria-label="Page navigation">
        <ul className="pagination">
          <li className={`page-item ${currentPage === 1 ? "disabled" : ""}`}>
            <button
              className="page-link"
              onClick={() => setCurrentPage(currentPage - 1)}
              aria-label="Previous"
            >
              Previous
            </button>
          </li>
          {pageNumbers.map((page) => (
            <li
              key={page}
              className={`page-item ${currentPage === page ? "active" : ""}`}
            >
              <button className="page-link" onClick={() => setCurrentPage(page)}>
                {page}
              </button>
            </li>
          ))}
          <li className={`page-item ${currentPage === totalPages ? "disabled" : ""}`}>
            <button
              className="page-link"
              onClick={() => setCurrentPage(currentPage + 1)}
              aria-label="Next"
            >
              Next
            </button>
          </li>
        </ul>
      </nav>
    );
  };

  return (
    <div ref={tableRef}>
     

      <div className="custom-data-table-container">
        <div className="custom-control-group">
          <div>
            {isExportable && (
              <div className="btn-group">
                <button
                  className=" btn-custom custom-xls-btn dropdown-toggle"
                  type="button"
                  data-bs-toggle="dropdown"
                  aria-expanded="false"
                >
                  <i className="bi bi-file-earmark-excel me-1"></i>
                  Export to Excel
                </button>
                <ul className="dropdown-menu xls-dropdown-menu">
                  <li>
                    <button className="dropdown-item" onClick={handleExportCurrentPage}>
                      Export Current Page
                    </button>
                  </li>
                  <li>
                    <button className="dropdown-item" onClick={handleExportFullData}>
                      Export Full Data
                    </button>
                  </li>
                </ul>
              </div>
            )}
            {isPrintable && (
              <button className=" btn-custom custom-print-btn" onClick={handlePrint}>
                <i className="bx bx-printer me-1"></i> Print
              </button>
            )}
            {isPdfExportable && (
              <div className="btn-group">
                <button
                  className="btn-custom custom-pdf-btn dropdown-toggle"
                  type="button"
                  data-bs-toggle="dropdown"
                  aria-expanded="false"
                >
                  <i className="bi bi-file-earmark-pdf me-1"></i>
                  Export to PDF
                </button>
                <ul className="dropdown-menu pdf-dropdown-menu">
                  <li>
                    <button className="dropdown-item" onClick={handleExportPDFCurrentPage}>
                      Export Current Page
                    </button>
                  </li>
                  <li>
                    <button className="dropdown-item" onClick={handleExportPDFFullData}>
                      Export Full Data
                    </button>
                  </li>
                </ul>
              </div>
            )}
            {isColumnToggleEnabled && (
              <div className="btn-group" ref={columnToggleRef}>
                <button
                  className=" btn-custom custom-column-toggle-btn dropdown-toggle"
                  type="button"
                  data-bs-toggle="dropdown"
                  aria-expanded="false"
                >
                  Show/Hide Columns
                </button>
                <ul className="dropdown-menu" ref={dropdownRef}>
                  {columns.map((col) => (
                    <li
                      key={col.name}
                      className={`custom-column-toggle-item ${
                        visibleColumns[col.name] ? "custom-column-show" : "custom-column-hide"
                      }`}
                      onClick={(e) => handleColumnToggle(col.name, e)}
                      role="button"
                      aria-checked={visibleColumns[col.name]}
                      tabIndex={0}
                    >
                      {col.name}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
          {isGlobalSearchEnabled && (
            <div className="custom-input-group">
              <div className="search-select-wrapper">
                <div className="search-wrapper">
                  <input
                    type="text"
                    className="custom-search"
                    placeholder="Search..."
                    value={globalSearchTerm}
                    onChange={(e) => {
                      setGlobalSearchTerm(e.target.value);
                      setCurrentPage(1);
                    }}
                    ref={globalSearchRef}
                  />
                  {globalSearchTerm && (
                    <button
                      className="clear-btn"
                      type="button"
                      onClick={handleClearGlobalSearch}
                    >
                      <i className="fa-solid fa-xmark"></i>
                    </button>
                  )}
                </div>
                <select
                  className="form-select custom-select"
                  value={itemsPerPage}
                  onChange={(e) => {
                    setItemsPerPage(Number(e.target.value));
                    setCurrentPage(1);
                  }}
                >
                  {itemsPerPageOptions.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          )}
        </div>

        {loading ? (
          <div className="text-center">
            <div className="custom-data-table-loader" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
          </div>
        ) : (
          <>
            <div className="table-wrapper">
              <table className="table">
                <thead>
                  <tr>
                    {columns.map((col) =>
                      visibleColumns[col.name] && (
                        <th key={col.name}>{col.name}</th>
                      )
                    )}
                  </tr>
                </thead>
                <tbody>
                  {paginatedData.length === 0 ? (
                    <tr>
                      <td
                        colSpan={
                          columns.filter((col) => visibleColumns[col.name]).length
                        }
                        className="text-center"
                      >
                        No data available
                      </td>
                    </tr>
                  ) : (
                    paginatedData.map((row, index) => (
                      <tr key={row.id}>
                        {columns.map((col) =>
                          visibleColumns[col.name] && (
                            <td
                              key={`${row.id}-${col.name}`}
                              title={
                                col.name === "Reason for Destruction" ||
                                col.name === "Nature of Capital Expenditure"
                                  ? col.selector
                                    ? col.selector(row, index) || ""
                                    : ""
                                  : ""
                              }
                            >
                              {col.cell
                                ? col.cell(row, index)
                                : col.selector
                                ? col.selector(row, index)
                                : ""}
                            </td>
                          )
                        )}
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
            <div className="d-flex justify-content-between align-items-center mt-2">
              <div className="pagination-entries">
                Showing{" "}
                {paginatedData.length > 0
                  ? (currentPage - 1) * itemsPerPage + 1
                  : 0}{" "}
                to {Math.min(currentPage * itemsPerPage, filteredData.length)} of{" "}
                {filteredData.length} entries (filtered from {data.length} total
                entries)
              </div>
              <Pagination />
            </div>
          </>
        )}
      </div>
    </div>
  );
};

CustomDataTable.propTypes = {
  columns: PropTypes.arrayOf(
    PropTypes.shape({
      name: PropTypes.string.isRequired,
      selector: PropTypes.func,
      cell: PropTypes.func,
    })
  ).isRequired,
  data: PropTypes.array.isRequired,
  onActionClick: PropTypes.func,
  loading: PropTypes.bool,
  itemsPerPageOptions: PropTypes.arrayOf(PropTypes.number),
  defaultItemsPerPage: PropTypes.number,
  exportable: PropTypes.bool,
  printable: PropTypes.bool,
  pdfExportable: PropTypes.bool,
  showGlobalSearch: PropTypes.bool,
  showColumnToggle: PropTypes.bool,
};

export default CustomDataTable;