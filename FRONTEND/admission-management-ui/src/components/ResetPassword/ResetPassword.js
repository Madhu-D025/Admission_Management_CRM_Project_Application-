import React, { useRef, useState } from "react";
import { toast } from "react-toastify";
import axios from "axios";
import { removeExtraSpaces } from "../../common/textOperations";
import { useLocation, useNavigate } from "react-router-dom";
import "./ResetPassword.css";
import PleaseWaitButton from "../../shared/PleaseWaitButton";
const config = require("../../services/config.json");

const ResetPassword = () => {
  const location = useLocation();
  const inputNewPasswordReference = useRef(null);
  const inputConfirmPasswordReference = useRef(null);
  const navigate = useNavigate();
  const token = new URLSearchParams(location.search).get("token");
  const userID = new URLSearchParams(location.search).get("Id");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isNewPasswordVisible, setIsNewPasswordVisible] = useState(false);
  const [isConfirmPasswordVisible, setIsConfirmPasswordVisible] = useState(false);
  const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
  const [errorField, setErrorField] = useState(null);
  const [isLoaderActive, setIsLoaderActive] = useState(false);

  const resetChangePassword = () => {
    setConfirmPassword("");
    setNewPassword("");
    setErrorField(null);
  };

  const toggleNewPasswordVisibility = () => {
    setIsNewPasswordVisible(!isNewPasswordVisible);
  };

  const toggleConfirmPasswordVisibility = () => {
    setIsConfirmPasswordVisible(!isConfirmPasswordVisible);
  };

  const handleClear = () => { 
    setConfirmPassword("");
    setNewPassword("");
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === "newPassword") {
      setNewPassword(value);
      if (errorField === "newPassword") {
        setErrorField(null);
      }
    } else if (name === "confirmPassword") {
      setConfirmPassword(value);
      if (errorField === "confirmPassword") {
        setErrorField(null);
      }
    }
  };

  const handleChangePassSubmit = (e) => {
    e.preventDefault();

    let errorMessage = "";
    let fieldWithError = null;

    if (!removeExtraSpaces(newPassword)) {
      fieldWithError = "newPassword";
      errorMessage = "Please enter new password.";
    } else if (!passwordRegex.test(newPassword)) {
      fieldWithError = "newPassword";
      errorMessage =
        "New password must be at least 8 characters long, contain uppercase letters, lowercase letters, numbers, and special characters.";
    } else if (!removeExtraSpaces(confirmPassword)) {
      fieldWithError = "confirmPassword";
      errorMessage = "Please enter confirm password.";
    } else if (removeExtraSpaces(newPassword) !== removeExtraSpaces(confirmPassword)) {
      fieldWithError = "confirmPassword";
      errorMessage = "New password and confirm password should be the same.";
    }

    if (errorMessage) {
      setErrorField(fieldWithError);
      toast.error(errorMessage);
      switch (fieldWithError) {
        case "newPassword":
          inputNewPasswordReference.current.focus();
          break;
        case "confirmPassword":
          inputConfirmPasswordReference.current.focus();
          break;
        default:
          break;
      }
      setIsLoaderActive(false); 
      return; 
    }

    setIsLoaderActive(true);
    setErrorField(null);

    axios
      .post(
        config.API_URL + "AuthMasterController/ForgotPassword",
        {
          userID: userID,
          emailAddress: "",
          newPassword: newPassword,
          token: token,
        },
        {
          headers: config.headers2,
        }
      )
      .then((response) => {
        setIsLoaderActive(false);
        if (response.data.success === "success") {
          toast.success(response.data.message);
          resetChangePassword();
          localStorage.clear();
          setTimeout(() => {
            navigate("/login");
          }, 2000);
        } else {
          resetChangePassword();
          toast.error(response.data.message);
        }
        handleClear();
      })
      .catch((error) => {
        setIsLoaderActive(false);
        if (error.response && error.response.data && error.response.data.message) {
          toast.error(error.response.data.message);
        } else {
          toast.error("Oops! Something went wrong. Please try again later.");
        }
      });
  };

  const getInputClassName = (fieldName) => {
    return errorField === fieldName
      ? "form-control is-invalid"
      : "form-control";
  };

  return (
    <div className="reset-password-wrapper">
      <div className="reset-password-container">
        <div className="reset-password-right">
          <img
            alt="Company logo"
            height={40}
            src={require("../../assets/images/iteosLogo.png")}
            width={100}
          />
          <h2>Reset your password</h2>
          <p>Enter a new password below to change your password</p>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleChangePassSubmit(e);
            }}
          >
            <div className="mb-3">
              <div className="input-container">
                <input
                  type={isNewPasswordVisible ? "text" : "password"}
                  className={getInputClassName("newPassword")}
                  placeholder="New Password"
                  name="newPassword"
                  value={newPassword}
                  onChange={handleChange}
                  ref={inputNewPasswordReference}
                />
                <i
                  className={`fa ${
                    isNewPasswordVisible ? "fa-eye" : "fa-eye-slash"
                  }`}
                  onClick={toggleNewPasswordVisibility}
                ></i>
              </div>
            </div>
            <div className="mb-3">
              <div className="input-container">
                <input
                  type={isConfirmPasswordVisible ? "text" : "password"}
                  className={getInputClassName("confirmPassword")}
                  placeholder="Confirm Password"
                  name="confirmPassword"
                  value={confirmPassword}
                  onChange={handleChange}
                  ref={inputConfirmPasswordReference}
                />
                <i
                  className={`fa ${
                    isConfirmPasswordVisible ? "fa-eye" : "fa-eye-slash"
                  }`}
                  onClick={toggleConfirmPasswordVisibility}
                ></i>
              </div>
            </div>
            {isLoaderActive ? (
              <PleaseWaitButton className="btn btn-primary w-100" />
            ) : (
              <button className="btn btn-primary w-100" type="submit">
                Reset Password
              </button>
            )}
          </form>
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;