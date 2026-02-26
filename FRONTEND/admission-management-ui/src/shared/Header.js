import React, { useEffect, useState, useRef } from "react";
import { useSelector } from "react-redux";
import { useNavigate, useLocation } from "react-router-dom";
import { toast } from "react-toastify";
import "../shared/header.css";
import axios from "axios";
const config = require("../services/config.json");

const Header = () => {
  const location = useLocation();
  const personalInfo = useSelector((state) => state.personalInformationReducer);
  const [title, setTitle] = useState("");
  const [breadcrumbs, setBreadcrumbs] = useState([]);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [dropdownTimeout, setDropdownTimeout] = useState(null);

  const dropdownRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    const pathParts = location.pathname.split("/").filter(Boolean);
    const lastCrumb = pathParts[pathParts.length - 1] || "";
    const formattedTitle = lastCrumb
      .split("-")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
    setTitle(formattedTitle);
    setBreadcrumbs(pathParts);
  }, [location.pathname]);

  const toggleSidebar = () => {
    const body = document.body;
    const isMobile = window.innerWidth < 768;

    if (isMobile) {
      body.classList.toggle("sidebar-open");
      body.classList.toggle("sidebar-close");
    } else {
      body.classList.toggle("sidebar-collapse");
    }
  };

  const handleLogout = () => {
    axios
      .post(
        `${config.API_URL}AuthMasterController/SignOut?userID=${personalInfo.userID}`,
        {},
        { headers: config.headers2 }
      )
      .then(() => {
        localStorage.clear();
        toast.success("Logged out successfully.");
        setTimeout(() => navigate("/"), 1500);
      })
      .catch((error) => {
        toast.error(error.message || "Logout failed");
      });
  };
  const handleProfile = () => {
    setTimeout(() => navigate("/manage-profile"), 500);
  };

  const handleDropdownEnter = () => {
    if (dropdownTimeout) clearTimeout(dropdownTimeout);
    setIsDropdownOpen(true);
  };

  const handleDropdownLeave = () => {
    const timeout = setTimeout(() => setIsDropdownOpen(false), 200);
    setDropdownTimeout(timeout);
  };

  const handleDropdownMenuEnter = () => {
    if (dropdownTimeout) clearTimeout(dropdownTimeout);
  };

  const handleDropdownMenuLeave = () => {
    const timeout = setTimeout(() => setIsDropdownOpen(false), 200);
    setDropdownTimeout(timeout);
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <nav className="main-header navbar navbar-expand navbar-light fixed-top custom-navbar">
      <ul className="navbar-nav align-items-center">
        <li className="header-nav-item d-block d-md-none">
          <button
            className="nav-link btn btn-link text-primary p-0"
            onClick={toggleSidebar}
            aria-label="Toggle sidebar"
          >
            <i className="fas fa-bars"></i>
          </button>
        </li>
        <li className="header-nav-item ml-2">
          <span className="nav-title fw-bold">{title}</span>
        </li>
      </ul>

      <ul className="navbar-nav ml-auto align-items-center navbar-icons">
        <li
          className="header-nav-item signout-dropdown dropdown-li"
          ref={dropdownRef}
          onMouseEnter={handleDropdownEnter}
          onMouseLeave={handleDropdownLeave}
        >
          <span
            className="signout-nav-link nav-profile-header d-flex align-items-center profile-trigger"
            title="Profile"
          >
            <i className="bi bi-person"></i>
            <div className="profile-name text-primary ml-2">
              {personalInfo.firstName} {personalInfo.lastName}
            </div>
          </span>

          {isDropdownOpen && (
            <div
              className="signout-dropdown-menu"
              onMouseEnter={handleDropdownMenuEnter}
              onMouseLeave={handleDropdownMenuLeave}
            >
              <span
                onClick={handleProfile}
                className="signout-dropdown-item mb-2"
              >
                <i className="bi bi-person mr-2"></i>
                <span className="text-signout">Profile</span>
              </span>
              <span onClick={handleLogout} className="signout-dropdown-item">
                <i className="bi bi-box-arrow-right mr-2"></i>
                <span className="text-signout">Sign out</span>
              </span>
            </div>
          )}
        </li>
      </ul>
    </nav>
  );
};

export default Header;
