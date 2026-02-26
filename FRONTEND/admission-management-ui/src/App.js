import React, { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Provider, useSelector } from "react-redux";
import { PersistGate } from "redux-persist/integration/react";
import reduxStore, { persistor } from "./reduxStorage/combinedReducers";
import AppRoutes from "./AppRoutes";
import Header from "./shared/Header";
import Menu from "./shared/Menu";
import Footer from "./shared/Footer";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "./App.css";

const MainApp = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const personalInfo = useSelector((state) => state.personalInformationReducer);

  const isLoggedIn = !!(
    localStorage.getItem("isDomsUserAuthenticated") === "true" &&
    personalInfo?.token &&
    personalInfo?.userID
  );

  const fullPageRoutes = ["/login", "/reset-password"];
  const isAuthPage = fullPageRoutes.includes(location.pathname);

  const getFirstRouteFromMenu = (menuItems = []) => {
    for (const item of menuItems) {
      if (item.routePath) return item.routePath;

      if (Array.isArray(item.subMenuItems)) {
        const firstSubWithRoute = item.subMenuItems.find(
          (sub) => sub.routePath
        );
        if (firstSubWithRoute) return firstSubWithRoute.routePath;
      }
    }
    return "/dashboard";
  };

  useEffect(() => {
    if (isLoggedIn && isAuthPage) {
      // const firstMenu =
      //   personalInfo?.menuItemNames?.[0]?.appRoute;
      // navigate(firstMenu, { replace: true });
      const firstMenu = personalInfo?.menuItemNames?.[0]?.appRoute;
      navigate(firstMenu, { replace: true });
    }

    if (!isLoggedIn && !isAuthPage) {
      navigate("/login", { replace: true });
    }
  }, [isLoggedIn, isAuthPage, navigate, personalInfo]);

  const showFullPage = !isLoggedIn || isAuthPage;

  return (
    <>
      {showFullPage ? (
        <div className="full-page-layout">
          <AppRoutes />
        </div>
      ) : (
        <div className="wrapper">
          <Header />
          <Menu />
          <div className="content-wrapper">
            <AppRoutes />
          </div>
          <Footer />
        </div>
      )}

      <ToastContainer position="top-center" autoClose={3000} theme="light" />
    </>
  );
};

const App = () => (
  <Provider store={reduxStore}>
    <PersistGate loading={null} persistor={persistor}>
      <MainApp />
    </PersistGate>
  </Provider>
);

export default App;
