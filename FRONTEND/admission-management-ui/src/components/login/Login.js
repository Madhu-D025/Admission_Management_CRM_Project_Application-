import React, { useState, useRef, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { toast } from "react-toastify";
import axios from "axios";
import { useDispatch } from "react-redux";
import { setUserPersonalInformation } from "../../reduxStorage/personalInformation";
import { removeExtraSpaces } from "../../common/textOperations";
import logo from "../../assets/images/warehouselogo.png";
import "./login.css";

const config = require("../../services/config.json");

const Login = () => {
  const inputUserEmailReference = useRef(null);
  const inputUserPasswordReference = useRef(null);
  const inputForgotEmailReference = useRef(null);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [forgotPasswordClick, setForgotPasswordClick] = useState(false);
  const [userEmail, setUserEmail] = useState("");
  const [userPassword, setUserPassword] = useState("");
  const [userForgotEmail, setUserForgotEmail] = useState("");
  const [isLoaderActive, setIsLoaderActive] = useState(false);
  const [inputErrors, setInputErrors] = useState({
    userEmail: false,
    userPassword: false,
    userForgotEmail: false,
  });
  const urlPath = window.location.origin;

  const handleForgotPassword = (e) => {
    e.preventDefault();
    setUserEmail("");
    setUserPassword("");
    setForgotPasswordClick(true);
    localStorage.setItem("formType", "forgotPassword");
  };

  const handleSignIn = () => {
    setUserForgotEmail("");
    setForgotPasswordClick(false);
    localStorage.setItem("formType", "login");
  };

  const clearFormFields = () => {
    setUserEmail("");
    setUserPassword("");
    setUserForgotEmail("");
  };

  const validateInputs = () => {
    let valid = true;
    const errors = {
      userEmail: false,
      userPassword: false,
      userForgotEmail: false,
    };

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!removeExtraSpaces(userEmail)) {
      errors.userEmail = true;
      valid = false;
      inputUserEmailReference.current.focus();
      toast.error("Please enter your email address.");
    } else if (!emailRegex.test(userEmail)) {
      errors.userEmail = true;
      valid = false;
      inputUserEmailReference.current.focus();
      toast.error("Please enter a valid email address.");
    } else if (!userPassword) {
      errors.userPassword = true;
      valid = false;
      inputUserPasswordReference.current.focus();
      toast.error("Please enter your password.");
    }

    setInputErrors(errors);
    return valid;
  };

  const validateForgotPasswordInputs = () => {
    let valid = true;
    const errors = {
      userEmail: false,
      userPassword: false,
      userForgotEmail: false,
    };

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!removeExtraSpaces(userForgotEmail)) {
      errors.userForgotEmail = true;
      valid = false;
      inputForgotEmailReference.current.focus();
      toast.error("Please enter your email address.");
    } else if (!emailRegex.test(userForgotEmail)) {
      errors.userForgotEmail = true;
      valid = false;
      inputForgotEmailReference.current.focus();
      toast.error("Please enter a valid email address.");
    }

    setInputErrors(errors);
    return valid;
  };

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
    return null;
  };

  const handleSignInAccount = async () => {
    if (validateInputs()) {
      setIsLoaderActive(true);
      try {
        const response = await axios.post(
          `${config.API_URL}AuthController/token`,
          {
            emailId: userEmail,
            password: userPassword,
            clientId: config.clientId,
          },
          {
            headers: {
              "Content-Type": "application/json",
              Accept: "*/*",
            },
          }
        );

        if (response.status === 200 && response.data.success === "success") {
          toast.success(response.data.message);
          const responseData = response.data.data;
          localStorage.setItem("user_id", responseData.userID);
          localStorage.setItem("isDomsUserAuthenticated", "true");
          localStorage.setItem("persist:doms_user", "true");
          localStorage.removeItem("formType");

          dispatch(
            setUserPersonalInformation({
              userID: responseData.userID,
              userName: responseData.userName,
              userRole: responseData.userRole,
              displayName: responseData.displayName,
              emailAddress: responseData.emailAddress,
              menuItemNames: responseData.menuItemNames,
              token: responseData.token,
              profilePic: responseData.profilePic,
              firstName: responseData.firstName,
              lastName: responseData.lastName,
              clientId: "",
              department: responseData.accountGroup,
            })
          );
          const firstRoute = getFirstRouteFromMenu(responseData.menuItemNames);
          const redirectRoute = firstRoute || "/dashboard" || "/login";
          // const redirectRoute =
          //   responseData.menuItemNames?.[0]?.appRoute ||
          //   "/dashboard" ||
          //   "/login";

          setTimeout(() => {
            navigate(redirectRoute);
            clearFormFields();
            setIsLoaderActive(false);
          }, 1000);
        } else {
          toast.error(response.data.message);
          setIsLoaderActive(false);
        }
      } catch (error) {
        setIsLoaderActive(false);
        toast.error("Oops! Something went wrong. Please try again later.");
      }
    }
  };

  const handleForgotPasswordSubmit = async () => {
    if (validateForgotPasswordInputs()) {
      setIsLoaderActive(true);
      try {
        const response = await axios.post(
          `${config.API_URL}AuthMasterController/SendResetLinkToMail`,
          {
            emailAddress: userForgotEmail,
            siteURL: urlPath + "/wms/reset-password",
          },
          {
            headers: config.headers2,
          }
        );

        if (response.status === 200 && response.data.success === "success") {
          toast.success("Password reset link has been sent successfully");
          localStorage.removeItem("formType");
          clearFormFields();
          setIsLoaderActive(false);
          // setTimeout(() => {
          //   handleSignIn();
          //   navigate("/login");
          //   setIsLoaderActive(false);
          // }, 2000);
        } else {
          toast.error(response.data.message);
          setIsLoaderActive(false);
        }
      } catch (error) {
        setIsLoaderActive(false);
        const statusCode = error.response?.status;
        const errorMessages = {
          400: "Bad request",
          401: "You are not an authorized person",
          403: "Forbidden",
          404: "Not found",
          500: "Internal server error",
          502: "Bad gateway",
          503: "Service unavailable",
          504: "Gateway timeout",
        };
        toast.error(errorMessages[statusCode] || "An error occurred.");
      }
    }
  };

  const toggleNewPasswordVisibility = () => {
    setPasswordVisible(!passwordVisible);
  };

  const onEnterKeyPress = (event) => {
    if (event.keyCode === 13) {
      if (forgotPasswordClick) {
        handleForgotPasswordSubmit();
        clearFormFields();
      } else {
        handleSignInAccount();
        clearFormFields();
      }
    }
  };

  useEffect(() => {
    if (
      location.pathname === "/login" &&
      localStorage.getItem("formType") === "forgotPassword"
    ) {
      setForgotPasswordClick(true);
    } else if (
      location.pathname === "/login" &&
      !localStorage.getItem("formType")
    ) {
      localStorage.setItem("formType", "login");
    }
  }, [location.pathname]);

  return (
    <div className="login-page">
      <div className="login-container">
        <div className="login-info-section">
          <h2 className="login-info-title">Welcome to Admission Management</h2>
          <img
            src={logo}
            alt="Warehouse Icon"
            className="login-warehouse-icon"
          />
          <p className="login-p">
            Manage admissions, applicants, and seat allocation with real-time quota control.
          </p>
          <div className="login-banner-overlay"></div>
        </div>
        <div className="login-content">
          <div className="login-sub-content">
            {forgotPasswordClick ? (
              <div className="login-forgot-password-form">
                <h2 className="login-form-title">Forgot Password</h2>
                <div className="login-input-group">
                  <label htmlFor="forgotEmail">Email ID</label>
                  <input
                    id="forgotEmail"
                    ref={inputForgotEmailReference}
                    className={`login-input-field ${
                      inputErrors.userForgotEmail ? "login-input-error" : ""
                    }`}
                    placeholder="Enter your email"
                    type="email"
                    value={userForgotEmail}
                    onChange={(e) => {
                      setUserForgotEmail(e.target.value);
                      setInputErrors((prevErrors) => ({
                        ...prevErrors,
                        userForgotEmail: false,
                      }));
                    }}
                    onKeyUp={onEnterKeyPress}
                  />
                </div>
                <div className="login-form-actions">
                  <button
                    className="login-button"
                    type="button"
                    disabled={isLoaderActive}
                    onClick={handleForgotPasswordSubmit}
                  >
                    {isLoaderActive ? (
                      <span className="login-please-wait">Please wait...</span>
                    ) : (
                      "Send Reset Link"
                    )}
                  </button>
                </div>
                <div className="login-back-link">
                  <Link
                    className="login-link-secondary"
                    to="/login"
                    onClick={(e) => {
                      e.preventDefault();
                      handleSignIn();
                    }}
                  >
                    Back to Sign In
                  </Link>
                </div>
              </div>
            ) : (
              <div className="login-form">
                <h2 className="login-form-title">Sign In</h2>
                <div className="login-input-group">
                  <label htmlFor="email">Email ID</label>
                  <input
                    id="email"
                    ref={inputUserEmailReference}
                    className={`login-input-field ${
                      inputErrors.userEmail ? "login-input-error" : ""
                    }`}
                    placeholder="Enter your email"
                    type="email"
                    value={userEmail}
                    onChange={(e) => {
                      setUserEmail(e.target.value);
                      setInputErrors((prevErrors) => ({
                        ...prevErrors,
                        userEmail: false,
                      }));
                    }}
                    onKeyUp={onEnterKeyPress}
                  />
                </div>
                <div className="login-input-group login-password-group">
                  <label htmlFor="password">Password</label>
                  <input
                    id="password"
                    ref={inputUserPasswordReference}
                    className={`login-input-field ${
                      inputErrors.userPassword ? "login-input-error" : ""
                    }`}
                    placeholder="Enter your password"
                    type={passwordVisible ? "text" : "password"}
                    value={userPassword}
                    onChange={(e) => {
                      setUserPassword(e.target.value);
                      setInputErrors((prevErrors) => ({
                        ...prevErrors,
                        userPassword: false,
                      }));
                    }}
                    onKeyUp={onEnterKeyPress}
                  />
                  <i
                    className={`fa ${
                      passwordVisible
                        ? "fa-lock-open login-password-toggle-open"
                        : "fa-lock login-password-toggle-close"
                    } login-password-toggle`}
                    onClick={toggleNewPasswordVisibility}
                  ></i>
                </div>
                {/* <div className="login-keep-signed">
                  <input 
                    type="checkbox" 
                    id="keep-signed" 
                    checked={keepSignedIn}
                    onChange={(e) => setKeepSignedIn(e.target.checked)}
                  />
                  <label htmlFor="keep-signed">Keep me signed in</label>
                </div> */}
                <div className="login-forgot-password-link">
                  <a
                    className="login-forgot-password"
                    href="#"
                    onClick={handleForgotPassword}
                  >
                    Forgot Password?
                  </a>
                </div>
                <div className="login-form-actions">
                  <button
                    className="login-button"
                    type="button"
                    disabled={isLoaderActive}
                    onClick={handleSignInAccount}
                  >
                    {isLoaderActive ? (
                      <span className="login-please-wait">Please wait...</span>
                    ) : (
                      "Sign In"
                    )}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
