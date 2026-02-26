import React from "react";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useSelector } from "react-redux";

const ProtectedRoute = () => {
  const location = useLocation();
  const isAuthenticated =
    localStorage.getItem("isDomsUserAuthenticated") === "true";
  const persist = localStorage.getItem("persist:doms_user");
  const personalInformation = useSelector(
    (state) => state.personalInformationReducer
  );

  const menuItemNames = personalInformation?.menuItemNames || [];

  const allowedRoutes = menuItemNames.map((item) => item.appRoute);

  const isRouteAllowed = allowedRoutes.some(
    (route) =>
      location.pathname === route || location.pathname.startsWith(`${route}/`)
  );

  if (!isAuthenticated || !persist || !personalInformation) {
    localStorage.clear();
    return <Navigate to="/login" replace />;
  }

  if (!isRouteAllowed) {
    return <Navigate to="/not-authorized" replace />;
  }

  return <Outlet />;
};

export default ProtectedRoute;
