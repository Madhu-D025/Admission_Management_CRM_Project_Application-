import React from "react";
import { useNavigate } from "react-router-dom";

const NotFound = () => {
  const navigate = useNavigate();

  const handleGoHome = () => {
    navigate("/dashbaord");
  };

  return (
    <div className="content">
      <div className="card">
        <div className="notfound-container card-body">
          <h1 className="notfound-code">404</h1>
          <h2 className="notfound-title">Page Unavailable</h2>
          <p className="notfound-message">
            The page you’re trying to access hasn’t been created yet.
          </p>
          <button className="notfound-btn" onClick={handleGoHome}>
            Return to Home
          </button>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
