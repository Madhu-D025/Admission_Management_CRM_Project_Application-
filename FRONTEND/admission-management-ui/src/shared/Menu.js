// import React, { useEffect, useState, useRef } from "react";
// import { useSelector } from "react-redux";
// import { Link, useLocation } from "react-router-dom";
// import Logo from "../assets/images/shortLogo.png";
// import "../shared/menu.css";

// const ICON_MAP = {
//   dashboard: "fa-tachometer-alt",
//   inbound: "fa-truck-loading",
//   outbound: "fa-truck",
//   inventory: "fa-warehouse",
//   "purchase-order": "fa-shopping-bag",
//   "gate-entry": "fa-archway",
//   grn: "fa-receipt",
//   putaway: "fa-dolly",

//   "sales-orders": "fa-shopping-cart",
//   picking: "fa-people-carry",
//   packing: "fa-box-open",
//   dispatch: "fa-shipping-fast",

//   "stock-overview": "fa-chart-bar",
//   "stock-bin": "fa-th-large",
//   adjustment: "fa-balance-scale",
//   "cycle-count": "fa-redo",
//   "create-user": "fa-user-plus",
//   "manage-roles": "fa-user-shield",
//   "manage-profile": "fa-id-badge",
//   "all-masters": "fa-database",
//   "master-data": "fa-database",
// };

// const getIcon = (key) => ICON_MAP[key] || "fa-folder";

// const Menu = () => {
//   const { menuItemNames = [] } = useSelector(
//     (state) => state.personalInformationReducer
//   );

//   const [menuList, setMenuList] = useState([]);
//   const [activeParent, setActiveParent] = useState(null);
//   const [isMobileOpen, setIsMobileOpen] = useState(false);

//   const sidebarRef = useRef(null);
//   const togglerRef = useRef(null);
//   const location = useLocation();

//   useEffect(() => {
//     const parents = menuItemNames
//       .filter((m) => m.isActive && m.showInsideBar && m.parentId === 0)
//       .sort((a, b) => a.sequence - b.sequence)
//       .map((parent) => ({
//         id: parent.id,
//         title: parent.appName,
//         path: parent.routePath,
//         icon: getIcon(parent.icon),
//         items: parent.subMenuItems
//           ?.filter((s) => s.isActive)
//           .sort((a, b) => a.sequence - b.sequence)
//           .map((sub) => ({
//             label: sub.appName,
//             path: sub.routePath,
//             icon: getIcon(sub.icon),
//           })),
//       }));

//     setMenuList(parents);
//   }, [menuItemNames]);

//   useEffect(() => {
//     menuList.forEach((menu) => {
//       menu.items?.forEach((sub) => {
//         if (sub.path === location.pathname) {
//           setActiveParent(menu.id);
//         }
//       });
//     });
//   }, [location.pathname, menuList]);

//   useEffect(() => {
//     const handleOutside = (e) => {
//       if (
//         window.innerWidth < 768 &&
//         isMobileOpen &&
//         sidebarRef.current &&
//         !sidebarRef.current.contains(e.target) &&
//         !togglerRef.current.contains(e.target)
//       ) {
//         setIsMobileOpen(false);
//         document.body.classList.remove("sidebar-open");
//         document.body.classList.add("sidebar-close");
//       }
//     };

//     document.addEventListener("mousedown", handleOutside);
//     return () => document.removeEventListener("mousedown", handleOutside);
//   }, [isMobileOpen]);

//   const openSidebar = () => {
//     setIsMobileOpen(true);
//     document.body.classList.add("sidebar-open");
//     document.body.classList.remove("sidebar-close");
//   };

//   const closeSidebar = () => {
//     setIsMobileOpen(false);
//     document.body.classList.remove("sidebar-open");
//     document.body.classList.add("sidebar-close");
//   };

//   return (
//     <>
//       <button
//         ref={togglerRef}
//         className="navbar-toggler d-md-none"
//         onClick={openSidebar}
//       >
//         <i className="fas fa-bars"></i>
//       </button>

//       <aside
//         ref={sidebarRef}
//         className={`main-sidebar ${isMobileOpen ? "sidebar-open" : ""}`}
//       >
//         <Link to="/dashboard" className="brand-link">
//           <img src={Logo} className="brand-image mr-4" alt="Logo" />
//           <span className="brand-text">Iteos</span>
//         </Link>

//         <div className="sidebar">
//           <button className="sidebar-close-btn" onClick={closeSidebar}>
//             <i className="fas fa-times"></i>
//           </button>

//           <nav className="mt-2">
//             <ul className="nav nav-pills nav-sidebar flex-column text-sm">
//               {menuList.map((menu) => {
//                 const isOpen = activeParent === menu.id;
//                 const hasSub = menu.items?.length > 0;

//                 return (
//                   <li
//                     key={menu.id}
//                     className={`nav-item ${
//                       hasSub ? "has-treeview level-1" : ""
//                     } ${isOpen ? "menu-open" : ""}`}
//                   >
//                     {!hasSub ? (
//                       <Link
//                         to={menu.path}
//                         className={`nav-link ${
//                           location.pathname === menu.path ? "active" : ""
//                         }`}
//                       >
//                         <i className={`nav-icon fas ${menu.icon}`}></i>
//                         <span>{menu.title}</span>
//                       </Link>
//                     ) : (
//                       <>
//                         <div
//                           className="nav-link d-flex align-items-center justify-content-between"
//                           onClick={() =>
//                             setActiveParent(isOpen ? null : menu.id)
//                           }
//                           style={{ cursor: "pointer" }}
//                         >
//                           <div className="d-flex align-items-center gap-2">
//                             <i className={`nav-icon fas ${menu.icon}`}></i>
//                             <span>{menu.title}</span>
//                           </div>

//                           <i
//                             className={`fas fa-angle-left itoes-submenu-arrow ${
//                               isOpen ? "rotate" : ""
//                             }`}
//                           ></i>
//                         </div>

//                         <ul
//                           className={`nav nav-treeview ${
//                             isOpen ? "d-block" : "d-none"
//                           }`}
//                         >
//                           {menu.items.map((sub) => (
//                             <li key={sub.path} className="nav-item level-2">
//                               <Link
//                                 to={sub.path}
//                                 className={`nav-link ${
//                                   location.pathname === sub.path ? "active" : ""
//                                 }`}
//                               >
//                                 <i className={`nav-icon fas ${sub.icon}`}></i>
//                                 <span>{sub.label}</span>
//                               </Link>
//                             </li>
//                           ))}
//                         </ul>
//                       </>
//                     )}
//                   </li>
//                 );
//               })}
//             </ul>
//           </nav>
//         </div>
//       </aside>
//     </>
//   );
// };

// export default Menu;


import React, { useEffect, useState, useRef } from "react";
import { useSelector } from "react-redux";
import { Link, useLocation } from "react-router-dom";
import Logo from "../assets/images/shortLogo.png";
import "../shared/menu.css";

/* ============================
   ICON MAPPING FOR AMCRM
============================ */

const ICON_MAP = {
  dashboard: "fa-chart-line",

  "institution-master": "fa-university",
  "campus-master": "fa-building",
  "department-master": "fa-sitemap",
  "program-master": "fa-book",
  "academic-year-master": "fa-calendar-alt",
  "entry-type-master": "fa-sign-in-alt",
  "admission-mode-master": "fa-layer-group",
  "seat-matrix-management": "fa-th",
  "quota-management": "fa-percentage",

  "applicant-management": "fa-user-graduate",
  "document-verification": "fa-file-alt",
  "fee-management": "fa-money-bill-wave",
  "admission-allocation": "fa-check-circle",

  "manage-roles": "fa-user-shield",
  "create-user": "fa-user-plus",
};

const getIcon = (route) => {
  const key = route?.replace("/", "");
  return ICON_MAP[key] || "fa-folder";
};

const Menu = () => {
  const { menuItemNames = [] } = useSelector(
    (state) => state.personalInformationReducer
  );

  const [menuList, setMenuList] = useState([]);
  const [activeParent, setActiveParent] = useState(null);
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  const sidebarRef = useRef(null);
  const togglerRef = useRef(null);
  const location = useLocation();

  /* ============================
     BUILD MENU FROM RBAC TOKEN
  ============================ */

  useEffect(() => {
    const parents = menuItemNames
      .filter((m) => m.isActive)
      .map((parent) => ({
        id: parent.appID,
        title: parent.appName,
        path: parent.appRoute,
        icon: getIcon(parent.appRoute),
        items: [], // No nested submenu in AMCRM for now
      }));

    setMenuList(parents);
  }, [menuItemNames]);

  /* ============================
     ACTIVE ROUTE HIGHLIGHT
  ============================ */

  useEffect(() => {
    menuList.forEach((menu) => {
      if (menu.path === location.pathname) {
        setActiveParent(menu.id);
      }
    });
  }, [location.pathname, menuList]);

  /* ============================
     OUTSIDE CLICK MOBILE CLOSE
  ============================ */

  useEffect(() => {
    const handleOutside = (e) => {
      if (
        window.innerWidth < 768 &&
        isMobileOpen &&
        sidebarRef.current &&
        !sidebarRef.current.contains(e.target) &&
        !togglerRef.current.contains(e.target)
      ) {
        setIsMobileOpen(false);
        document.body.classList.remove("sidebar-open");
        document.body.classList.add("sidebar-close");
      }
    };

    document.addEventListener("mousedown", handleOutside);
    return () => document.removeEventListener("mousedown", handleOutside);
  }, [isMobileOpen]);

  const openSidebar = () => {
    setIsMobileOpen(true);
    document.body.classList.add("sidebar-open");
    document.body.classList.remove("sidebar-close");
  };

  const closeSidebar = () => {
    setIsMobileOpen(false);
    document.body.classList.remove("sidebar-open");
    document.body.classList.add("sidebar-close");
  };

  return (
    <>
      <button
        ref={togglerRef}
        className="navbar-toggler d-md-none"
        onClick={openSidebar}
      >
        <i className="fas fa-bars"></i>
      </button>

      <aside
        ref={sidebarRef}
        className={`main-sidebar ${isMobileOpen ? "sidebar-open" : ""}`}
      >
        <Link to="/dashboard" className="brand-link">
          <img src={Logo} className="brand-image mr-4" alt="Logo" />
          <span className="brand-text">Admission CRM</span>
        </Link>

        <div className="sidebar">
          <button className="sidebar-close-btn" onClick={closeSidebar}>
            <i className="fas fa-times"></i>
          </button>

          <nav className="mt-2">
            <ul className="nav nav-pills nav-sidebar flex-column text-sm">
              {menuList.map((menu) => (
                <li
                  key={menu.id}
                  className={`nav-item ${
                    location.pathname === menu.path ? "menu-open" : ""
                  }`}
                >
                  <Link
                    to={menu.path}
                    className={`nav-link ${
                      location.pathname === menu.path ? "active" : ""
                    }`}
                  >
                    <i className={`nav-icon fas ${menu.icon}`}></i>
                    <span>{menu.title}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </div>
      </aside>
    </>
  );
};

export default Menu;