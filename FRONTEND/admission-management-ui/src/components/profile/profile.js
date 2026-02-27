import React, { useRef, useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { removeExtraSpaces } from "../../common/textOperations";
import { toast } from "react-toastify";
import { isValidPassword } from "../../common/validations";
import PleaseWaitButton from "../../shared/PleaseWaitButton";
import { changePersonalInfo } from "../../reduxStorage/personalInformation";
import { useDispatch } from "react-redux";
import axios from "axios";
import $ from "jquery";
import { useNavigate } from "react-router-dom";
import ProfileImg from "../../assets/images/user2-160x160.jpg"

const config = require("../../services/config.json");

const Profile = () => {
  const inputCurrentPasswordReference = useRef(null);
  const inputNewPasswordReference = useRef(null);
  const inputConfirmPasswordReference = useRef(null);

  const personalInfo = useSelector((state) => state.personalInformationReducer);

  const [fullName, setFullName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [instituteOrBranch, setInstituteOrBranch] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [profileDetails, setProfileDetails] = useState([]);
  const [isLoaderActive, setIsLoaderActive] = useState(false);
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  useEffect(() => {
    getProfileDetails();
    window.initDatePickerFuncation();
  }, []);

  const resetProfileUpdate = () => {
    setFullName("");
    setPhoneNumber("");
    setInstituteOrBranch("");
  };

  useEffect(() => {}, [profileDetails]);

  const handleChangePassSubmit = (e) => {
    e.preventDefault();
    if (!removeExtraSpaces(currentPassword)) {
      toast.error("Please enter current password.");
      inputCurrentPasswordReference.current.focus();
      inputCurrentPasswordReference.current.classList.add("is-invalid");
      return;
    }

    if (!removeExtraSpaces(newPassword)) {
      toast.error("Please enter new password.");
      inputNewPasswordReference.current.focus();
      inputNewPasswordReference.current.classList.add("is-invalid");
      return;
    }

    if (!isValidPassword(newPassword)) {
      toast.error(
        "Password must contain at least one uppercase letter, one special character, one number, and be at least 9 characters long."
      );
      inputNewPasswordReference.current.focus();
      inputNewPasswordReference.current.classList.add("is-invalid");
      return;
    }

    if (!removeExtraSpaces(confirmPassword)) {
      toast.error("Please enter confirm password.");
      inputConfirmPasswordReference.current.focus();
      inputConfirmPasswordReference.current.classList.add("is-invalid");
      return;
    }

    if (removeExtraSpaces(newPassword) !== removeExtraSpaces(confirmPassword)) {
      toast.error("New password and confirm password should be the same.");
      inputConfirmPasswordReference.current.focus();
      inputConfirmPasswordReference.current.classList.add("is-invalid");
      return;
    }
    setIsLoaderActive(true);
    var formData = new FormData();
    formData.append("UserID", personalInfo.userID);
    formData.append("CurrentPassword", currentPassword);
    formData.append("NewPassword", newPassword);
    formData.append("UserName", personalInfo.userName);

    axios
      .post(config.API_URL + "AuthMasterController/ChangePassword", formData, {
        headers: config.headers3,
      })
      .then((response) => {
        setIsLoaderActive(false);
        if (response.data.success === "success") {
          toast.success(response.data.message);
          localStorage.clear();
          sessionStorage.clear();
          setTimeout(() => {
            navigate("/login", { replace: true });
          }, 2000);
        } else {
          toast.error(response.data.message);

          if (response.data.message === "Current password is incorrect.") {
            inputCurrentPasswordReference.current.focus();
            inputCurrentPasswordReference.current.classList.add("is-invalid");
          }
        }
      })
      .catch((error) => {
        setIsLoaderActive(false);
        const errorMessage =
          error.response?.data?.message || "An error occurred.";
        toast.error(errorMessage);
        if (errorMessage === "Current password is incorrect.") {
          inputCurrentPasswordReference.current.focus();
          inputCurrentPasswordReference.current.classList.add("is-invalid");
        }
      });
  };

  const inputmobileNumberReference = useRef();
  const inputInstituteReference = useRef();

  const handleEditProfileDetails = (e) => {
    e.preventDefault();
    if (!phoneNumber) {
      toast.error("Please enter contact number.");
      inputmobileNumberReference.current.focus();
      inputmobileNumberReference.current.classList.add("is-invalid");
      return;
    }

    if (phoneNumber.length !== 10 || !/^\d+$/.test(phoneNumber)) {
      toast.error("Please enter a valid 10-digit contact number.");
      inputmobileNumberReference.current.focus();
      inputmobileNumberReference.current.classList.add("is-invalid");
      return;
    }

    setIsLoaderActive(true);
    const formData = new FormData();
    formData.append("UserID", personalInfo.userID);
    formData.append("fullName", fullName || profileDetails.fullName);
    formData.append("phoneNumber", phoneNumber || profileDetails.phoneNumber);
    formData.append("instituteOrBranch", instituteOrBranch || profileDetails.instituteOrBranch);
    formData.append("modifiedBy", personalInfo.userID);
    formData.append("ClientId", "wmsApp");

    axios
      .post(`${config.API_URL}AuthMasterController/UpdateUser`, formData, {
        headers: config.headers3,
      })
      .then((response) => {
        if (response.data.success) {
          toast.success(response.data.message);
          resetProfileUpdate();
          getProfileDetails();
          setIsLoaderActive(false);
        } else {
          toast.error(response.data.message);
          resetProfileUpdate();
        }
      })
      .catch((error) => {
        toast.error(error.response?.data?.message || "Please try again later.");
        setIsLoaderActive(false);
      });
  };

  const getProfileDetails = () => {
    axios
      .get(
        `${config.API_URL}AuthMasterController/GetUsersById?UserId=${personalInfo.userID}`,
        { headers: config.headers2 }
      )
      .then((response) => {
        if (response.status === 200 && response.data.success) {
          if (response.data.data && response.data.data.length > 0) {
            const user = response.data.data[0];

            const formattedProfileDetails = {
              ...user,
              dateOfBirth: user.dateOfBirth
                ? user.dateOfBirth.split("T")[0]
                : "",
              joiningDate: user.joiningDate,
            };

            setProfileDetails(formattedProfileDetails);
            setFullName(formattedProfileDetails.fullName || "");
            setPhoneNumber(formattedProfileDetails.phoneNumber || "");
            setInstituteOrBranch(formattedProfileDetails.instituteOrBranch || "");
          } else {
            setProfileDetails({});
          }
        } else {
          toast.error(response.data.message);
        }
      })
      .catch((error) => {
        console.error("Error fetching profile details:", error);
      });
  };

  const loadFile = (event) => {
    if (event.target.files && event.target.files[0]) {
      if (event.target.files[0].size > 8 * 1000 * 1024) {
        toast.error("File with maximum size of 8MB is allowed");
        return false;
      }
      var fileName = event.target.files[0].name;
      var fileNameExt = fileName.substr(fileName.lastIndexOf(".") + 1);
      if (!config._validImageFileExtensions.includes(fileNameExt)) {
        toast.error(
          "Please upload files having extensions: " +
            config._validImageFileExtensions.join(", ") +
            " only."
        );
        $(event).val("");
        return false;
      }
      var image = document.getElementById("output");
      image.src = URL.createObjectURL(event.target.files[0]);
      var formData = new FormData();
      formData.append("UserID", personalInfo.userID);
      formData.append("ModifiedBy", personalInfo.userID);
      formData.append("ProfilePic", event.target.files[0]);

      axios
        .post(
          config.API_URL + "AuthMasterController/ProfileUpdateUser",
          formData,
          {
            headers: config.headers3,
          }
        )
        .then((response) => {
          if (response.data.success === "success") {
            toast.success(response.data.message);
            dispatch(
              changePersonalInfo({
                profilePic: response.data.data,
              })
            );
          } else {
            setIsLoaderActive(false);
            toast.error(response.data.message);
          }
        })
        .catch((error) => {
          toast.error("oops something went wrong. please try again later.");
          setIsLoaderActive(false);
        });
    }
  };

  return (
    <>
      <section className="content">
        <div className="row">
          <div className="col-md-3">
            <div className="card card-primary card-outline">
              <div className="card-body box-profile">
                <div className="text-center">
                  <div className="profile-pic">
                    <label className="-label" htmlFor="file">
                      <span>
                        <i className="fas fa-camera mr-1"></i>
                        Change Image
                      </span>
                    </label>
                    <input
                      id="file"
                      type="file"
                      onChange={(e) => loadFile(e)}
                    />
                    <img
                      src={
                        personalInfo.profilePic == null
                          ? ProfileImg
                          : personalInfo.profilePic
                      }
                      alt=""
                      id="output"
                    />
                  </div>
                </div>

                <h5 className="profile-username text-center mt-3">
                  {profileDetails.fullName || personalInfo.userName}
                </h5>
              </div>
            </div>
            <div className="card ">
              <div className="card-header">
                <h3 className="card-title">ITeos LLP</h3>
              </div>

              <div className="card-body">
                <p>
                  <i className="fas fa-map-marker-alt mr-1"></i> Location
                </p>

                <p className="text-muted">
                  E210, HustleHub Tech Park, 1, 27th Main Rd, ITI Layout,
                  Sector-I, HSR Layout, Bengaluru, Karnataka 560102
                </p>

                <hr />

                <strong>
                  <i className="fa fa-globe mr-2"></i>
                  <span className="text-muted">
                    <a
                      target="_blank"
                      rel="noopener noreferrer"
                      href="https://www.iteos.in/"
                      className=" footer-link"
                    >
                      [https://www.iteos.in/](https://www.iteos.in/)
                    </a>
                  </span>
                </strong>
              </div>
            </div>
          </div>

          <div className="col-md-9">
            <div className="card">
              <div className="card-header">
                <ul className="nav nav-pills m-2">
                  <li className="custom-nav-item">
                    <a
                      className="custom-nav-link active btn-sm"
                      href="#activity"
                      data-toggle="tab"
                    >
                      Overview
                    </a>
                  </li>
                  <li className="custom-nav-item">
                    <a
                      className="custom-nav-link btn-sm"
                      href="#timeline"
                      data-toggle="tab"
                    >
                      Change Password
                    </a>
                  </li>
                  <li className="custom-nav-item ">
                    <a
                      className="custom-nav-link btn-sm"
                      href="#settings"
                      data-toggle="tab"
                    >
                      Profile Update
                    </a>
                  </li>
                </ul>
              </div>
              <div className="card-body">
                <div className="tab-content">
                  <div className="active tab-pane" id="activity">
                    <div className="tab-pane" id="activity">
                      <div className="from-group row">
                        <div className="col-sm-6">
                          <h5 className="m-20">Profile Details</h5>
                        </div>
                      </div>
                      <form className="form-horizontal mt-3">
                        <div className="row mb-2">
                          <label className="col-md-2 text-md-end">
                            Full Name :
                          </label>
                          <div className="col-md-10">
                            <p className="text-muted">
                              {profileDetails.fullName}
                            </p>
                          </div>
                        </div>

                        <div className="row mb-2">
                          <label className="col-md-2 text-md-end">
                            Phone Number :
                          </label>
                          <div className="col-md-10">
                            <p className="text-muted">
                              {profileDetails.phoneNumber}
                            </p>
                          </div>
                        </div>

                        <div className="row mb-2">
                          <label className="col-md-2 text-md-end">
                            Institute/Branch :
                          </label>
                          <div className="col-md-10">
                            <p className="text-muted">
                              {profileDetails.instituteOrBranch}
                            </p>
                          </div>
                        </div>

                        <div className="row mb-2">
                          <label className="col-md-2 text-md-end">
                            Email :
                          </label>
                          <div className="col-md-10">
                            <p className="text-muted">
                              {personalInfo.emailAddress}
                            </p>
                          </div>
                        </div>
                      </form>
                    </div>
                  </div>
                  <div className="tab-pane" id="timeline">
                    <div className="from-group row">
                      <div className="col-sm-6">
                        <h5 className="m-20">Change Password</h5>
                      </div>
                    </div>
                    <form className="form-horizontal mt-3">
                      {/* Current Password */}
                      <div className="form-group row">
                        <label
                          htmlFor="currentPassword"
                          className="col-sm-2 col-form-label"
                        >
                          Current Password
                        </label>
                        <div className="col-sm-10 position-relative">
                          <input
                            type={showCurrent ? "text" : "password"}
                            className="form-control form-control-sm"
                            id="currentPassword"
                            placeholder="Enter Current Password"
                            ref={inputCurrentPasswordReference}
                            value={currentPassword}
                            onChange={(e) => setCurrentPassword(e.target.value)}
                          />
                          <span
                            style={{
                              position: "absolute",
                              right: "20px",
                              top: "40%",
                              transform: "translateY(-50%)",
                              cursor: "pointer",
                              color: "#54678f",
                              zIndex: 1,
                            }}
                            onClick={() => setShowCurrent(!showCurrent)}
                          >
                            <i
                              className={`fa ${
                                showCurrent ? "fa-eye" : "fa-eye-slash"
                              }`}
                            ></i>
                          </span>
                        </div>
                      </div>

                      {/* New Password */}
                      <div className="form-group row">
                        <label
                          htmlFor="newPassword"
                          className="col-sm-2 col-form-label"
                        >
                          New Password
                        </label>
                        <div className="col-sm-10 position-relative">
                          <input
                            type={showNew ? "text" : "password"}
                            className="form-control form-control-sm"
                            id="newPassword"
                            placeholder="Enter New Password"
                            ref={inputNewPasswordReference}
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                          />
                          <span
                            style={{
                              position: "absolute",
                              right: "20px",
                              top: "40%",
                              transform: "translateY(-50%)",
                              cursor: "pointer",
                              color: "#54678f",
                              zIndex: 1,
                            }}
                            onClick={() => setShowNew(!showNew)}
                          >
                            <i
                              className={`fa ${
                                showNew ? "fa-eye" : "fa-eye-slash"
                              }`}
                            ></i>
                          </span>
                        </div>
                      </div>

                      {/* Confirm Password */}
                      <div className="form-group row">
                        <label
                          htmlFor="confirmPassword"
                          className="col-sm-2 col-form-label"
                        >
                          Confirm Password
                        </label>
                        <div className="col-sm-10 position-relative">
                          <input
                            type={showConfirm ? "text" : "password"}
                            className="form-control form-control-sm"
                            id="confirmPassword"
                            placeholder="Enter Confirm Password"
                            ref={inputConfirmPasswordReference}
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                          />
                          <span
                            style={{
                              position: "absolute",
                              right: "20px",
                              top: "40%",
                              transform: "translateY(-50%)",
                              cursor: "pointer",
                              color: "#54678f",
                              zIndex: 1,
                            }}
                            onClick={() => setShowConfirm(!showConfirm)}
                          >
                            <i
                              className={`fa ${
                                showConfirm ? "fa-eye" : "fa-eye-slash"
                              }`}
                            ></i>
                          </span>
                        </div>
                      </div>

                      {/* Submit Button */}
                      <div className="d-flex justify-content-end">
                        {isLoaderActive ? (
                          <PleaseWaitButton className="float-right btn-sm ml-2 font-weight-medium auth-form-btn" />
                        ) : (
                          <button
                            type="button"
                            className="custom-btn custom-primary-button"
                            onClick={handleChangePassSubmit}
                          >
                            Submit
                          </button>
                        )}
                      </div>
                    </form>
                  </div>
                  <div className="tab-pane" id="settings">
                    <div className="from-group row">
                      <div className="col-sm-6">
                        <h5 className="m-20">Update Profile</h5>
                      </div>
                    </div>
                    <form
                      className="form-horizontal mt-3"
                      onSubmit={handleEditProfileDetails}
                    >
                      <div className="form-group row">
                        <label
                          htmlFor="fullName"
                          className="col-sm-2 col-form-label"
                        >
                          Full Name
                        </label>
                        <div className="col-sm-10">
                          <input
                            type="text"
                            className="form-control form-control-sm"
                            id="fullName"
                            placeholder="Full Name"
                            value={fullName}
                            onChange={(e) => setFullName(e.target.value)}
                          />
                        </div>
                      </div>
                      <div className="form-group row">
                        <label
                          htmlFor="phoneNumber"
                          className="col-sm-2 col-form-label"
                        >
                          Phone Number
                        </label>
                        <div className="col-sm-10">
                          <input
                            type="text"
                            className="form-control form-control-sm"
                            id="phoneNumber"
                            placeholder="Phone Number"
                            ref={inputmobileNumberReference}
                            value={phoneNumber}
                            onChange={(e) => {
                              const inputValue = e.target.value;
                              const numericValue = inputValue.replace(/\D/g, "");
                              const limitedValue = numericValue.slice(0, 10);
                              setPhoneNumber(limitedValue);
                            }}
                          />
                        </div>
                      </div>
                      <div className="form-group row">
                        <label
                          htmlFor="instituteOrBranch"
                          className="col-sm-2 col-form-label"
                        >
                          Institute/Branch
                        </label>
                        <div className="col-sm-10">
                          <input
                            className="form-control form-control-sm"
                            id="instituteOrBranch"
                            placeholder="Institute/Branch"
                            ref={inputInstituteReference}
                            value={instituteOrBranch}
                            onChange={(e) => setInstituteOrBranch(e.target.value)}
                          />
                        </div>
                      </div>
                      <div className="form-group">
                        <div className="d-flex justify-content-end">
                          {isLoaderActive ? (
                            <PleaseWaitButton className="float-right btn-sm ml-2 font-weight-medium auth-form-btn" />
                          ) : (
                            <button
                              type="submit"
                              className="custom-btn custom-primary-button"
                            >
                              Update
                            </button>
                          )}
                        </div>
                      </div>
                    </form>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

export default Profile;
