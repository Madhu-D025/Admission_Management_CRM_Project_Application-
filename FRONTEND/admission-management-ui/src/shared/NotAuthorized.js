import React from 'react';
import { Link } from 'react-router-dom';

const NotAuthorized = () => {
  return (
      <div className="container-fluid d-flex flex-column justify-content-center align-items-center vh-100 text-center bg-light">
     <h1 className="display-1 text-danger">403 - Not Authorized</h1>
      <h2>You do not have permission to access this page.</h2>
      <Link className="btn btn-primary btn-md" to="/manage-profile">Go to Profile</Link>
    </div>
  );
};

export default NotAuthorized;