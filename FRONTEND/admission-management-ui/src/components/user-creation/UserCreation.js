import React, {
  useEffect,
  useState,
  useMemo,
  useCallback,
  useRef,
} from "react";
import { useSelector } from "react-redux";
import { toast } from "react-toastify";
import PleaseWaitButton from "../../shared/PleaseWaitButton";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import Switch from "react-switch";
import CustomDataTable from "../../common/customdatable";
import { removeExtraSpaces } from "../../common/textOperations";
import { isValidEmail } from "../../common/validations";
import $ from "jquery";

const config = require("../../services/config.json");

const UserCreation = () => {
  const personalInfo = useSelector((state) => state.personalInformationReducer);
  const [isLoaderActive, setIsLoaderActive] = useState(false);
  const [allRolesList, setAllRolesList] = useState([]);
  const [allUsersList, setAllUsersList] = useState([]);
  const [updateOrDeleteId, setUpdateOrDeleteId] = useState("");
  const [showActiveUsers, setShowActiveUsers] = useState(true);
  const [viewMode, setViewMode] = useState("list"); // 'list', 'create', 'edit'
  const [currentUserID, setCurrentUserID] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [departments, setDepartments] = useState([]);
  const [showPassword, setShowPassword] = useState(false);

  const togglePassword = () => {
    setShowPassword((prev) => !prev);
  };

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [userEmail, setUserEmail] = useState("");
  const [roleId, setRoleId] = useState("");
  const [password, setPassword] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [isActive, setIsActive] = useState("true");
  const [emailStatus, setEmailStatus] = useState("true");
  const [userName, setUserName] = useState("");
  const [instituteOrBranch, setInstituteOrBranch] = useState("");

  const inputFirstNameReference = useRef(null);
  const inputLastNameReference = useRef(null);
  const inputEmailReference = useRef(null);
  const inputRoleReference = useRef(null);
  const inputPasswordReference = useRef(null);
  const inputContactNumberReference = useRef(null);
  const inputUserNameReference = useRef(null);
  const inputDepartmentReference = useRef(null);

  const navigate = useNavigate();

  useEffect(() => {
    getAllRolesList();
    getUsersList();
    getAllDepartments();
  }, []);

  useEffect(() => {
    if (viewMode === "edit" && currentUserID && allUsersList.length > 0) {
      loadUserData();
    }
  }, [viewMode, currentUserID, allUsersList]);

  const getUsersList = () => {
    setIsLoaderActive(true);
    axios
      .get(
        `${config.API_URL}AuthMasterController/GetAllUsers?ClientId=${config.clientId}`,
        {
          headers: config.headers2,
        }
      )
      .then((response) => {
        if (response.status === 200) {
          if (response.data.success === "success") {
            if (response.data.data.length > 0) {
              setAllUsersList(response.data.data);
            }
          } else {
            toast.error(response.data.message);
          }
        } else if (response.data.status?.status === 500) {
          toast.error("Invalid username or password");
        }
      })
      .catch((error) => {
        toast.error("Please try again later.");
      })
      .finally(() => {
        setIsLoaderActive(false);
      });
  };

  const getAllRolesList = () => {
    axios
      .get(
        `${config.API_URL}AuthMasterController/GetAllRoles?ClientId=${config.clientId}`,
        {
          headers: config.headers2,
        }
      )
      .then((response) => {
        if (response.status === 200) {
          if (response.data.success === "success") {
            if (response.data.data.length > 0) {
              const sortedRoles = response.data.data.sort((a, b) =>
                a.roleName.localeCompare(b.roleName)
              );
              setAllRolesList(sortedRoles);
            }
          } else {
            toast.error(response.data.message);
          }
        } else if (response.data.status?.status === 500) {
          toast.error("Invalid username or password");
        }
      })
      .catch((error) => {
        toast.error("Oops, something went wrong. Please try again later.");
      });
  };

  const getAllDepartments = () => {
    axios
      .get(
        config.API_URL +
          "MasterController/GetAllMasters?ClientId=" +
          config.clientId,
        { headers: config.headers2 }
      )
      .then((response) => {
        if (response.status === 200 && response.data.success === true) {
          const departmentList = response.data.data
            .filter((item) => item.masterName === "Department")
            .sort((a, b) => a.masterValue.localeCompare(b.masterValue));
          setDepartments(departmentList);
        } else {
          toast.error(response.data.message);
        }
      })
      .catch(() => {
        toast.error("Oops, something went wrong. Please try again later.");
      });
  };

  const loadUserData = () => {
    const user = allUsersList.find((u) => u.userID === currentUserID);
    if (user) {
      setUserName(user.userName || "");
      setUserEmail(user.email || "");
      setRoleId(user.roleID || "");
      setPassword(user.password || "");
      // Split fullName into firstName & lastName
      const nameParts = (user.fullName || "").trim().split(" ");
      setFirstName(nameParts[0] || "");
      setLastName(nameParts.slice(1).join(" ") || "");
      setPhoneNumber(user.phoneNumber || "");
      setInstituteOrBranch(user.instituteOrBranch || "");
      // Map status string to dropdown value
      setIsActive(user.status === "Active" ? "true" : "false");
      setEmailStatus(user.emailStatus === "Active" ? "true" : "false");
      setIsEditing(false);
    } else {
      toast.error("User not found.");
    }
  };

  const handleViewTaskDetails = (userID) => {
    setCurrentUserID(userID);
    setViewMode("edit");
  };

  const handleNavigateToCreateUser = () => {
    setViewMode("create");
    setCurrentUserID(null);
    clearAllFields();
  };

  const handleRemoveUser = (userObj) => {
    setUpdateOrDeleteId(userObj.userID);
    window.confirmModalShow();
  };

  const yesConfirmSubmitRequest = () => {
    setIsLoaderActive(true);
    const APIMethodName = `AuthMasterController/DeleteUser?ClientId=${config.clientId}&UserID=${updateOrDeleteId}`;
    axios
      .post(
        `${config.API_URL}${APIMethodName}`,
        {},
        {
          headers: config.headers2,
        }
      )
      .then((response) => {
        if (response.data.success === "success") {
          toast.success("User deleted successfully...");
          window.confirmModalHide();
          clearAllFields();
          getUsersList();
          setIsLoaderActive(false);
        } else {
          setIsLoaderActive(false);
          toast.error(response.data.message);
        }
      })
      .catch((error) => {
        if (error.response && !error.response.data.success) {
          toast.error(error.response.data.message);
        } else {
          toast.error("Oops, something went wrong. Please try again later.");
        }
        setIsLoaderActive(false);
      });
  };

  const clearAllFields = () => {
    setUserEmail("");
    setRoleId("");
    setPassword("");
    setPhoneNumber("");
    setFirstName("");
    setLastName("");
    setIsActive("true");
    setEmailStatus("true");
    setUserName("");
    setInstituteOrBranch("");
  };

  const handleToggleUserStatus = async (userObj) => {
    setIsLoaderActive(true);
    try {
      const url = `${config.API_URL}AuthMasterController/UpdateUser`;
      const fullName = `${userObj.fullName}`.trim();
      const statusValue = userObj.status === "Active" ? "Inactive" : "Active";
      const data = {
        userID: userObj.userID,
        roleID: userObj.roleID,
        userName: userObj.userName,
        email: userObj.email,
        password: userObj.password,
        phoneNumber: userObj.phoneNumber,
        instituteOrBranch: userObj.instituteOrBranch,
        fullName: fullName,
        status: statusValue,
        emailStatus: statusValue,
        roleName: userObj.roleName,
        createdBy: personalInfo.userID,
        clientId: config.clientId,
        modifiedBy: personalInfo.userID,
      };

      const response = await axios.post(url, data, {
        headers: config.headers3,
      });

      if (response.data.success) {
        toast.success("User status updated successfully!");
        getUsersList();
      } else {
        toast.error("Failed to update user status");
      }
    } catch (error) {
      toast.error("An error occurred while updating user status");
    } finally {
      setIsLoaderActive(false);
    }
  };

  const handleShowActive = () => {
    setShowActiveUsers(true);
  };

  const handleShowInactive = () => {
    setShowActiveUsers(false);
  };

  const handleUserSubmit = (e) => {
    e.preventDefault();

    const inputs = [
      inputFirstNameReference,
      inputLastNameReference,
      inputUserNameReference,
      inputEmailReference,
      inputContactNumberReference,
      inputPasswordReference,
      inputRoleReference,
      inputDepartmentReference,
    ];
    inputs.forEach((ref) => ref.current?.classList.remove("is-invalid"));

    if (!removeExtraSpaces(firstName)) {
      toast.error("Please enter first name.");
      inputFirstNameReference.current.focus();
      inputFirstNameReference.current.classList.add("is-invalid");
      return;
    }

    if (!removeExtraSpaces(lastName)) {
      toast.error("Please enter last name.");
      inputLastNameReference.current.focus();
      inputLastNameReference.current.classList.add("is-invalid");
      return;
    }

    if (!removeExtraSpaces(userName)) {
      toast.error("Please enter user name.");
      inputUserNameReference.current.focus();
      inputUserNameReference.current.classList.add("is-invalid");
      return;
    }

    if (!removeExtraSpaces(userEmail)) {
      toast.error("Please enter email.");
      inputEmailReference.current.focus();
      inputEmailReference.current.classList.add("is-invalid");
      return;
    }

    if (!isValidEmail(userEmail)) {
      toast.error("Please enter valid email.");
      inputEmailReference.current.focus();
      inputEmailReference.current.classList.add("is-invalid");
      return;
    }

    if (!phoneNumber) {
      toast.error("Please enter contact number.");
      inputContactNumberReference.current.focus();
      inputContactNumberReference.current.classList.add("is-invalid");
      return;
    }

    if (phoneNumber.length !== 10 || !/^\d+$/.test(phoneNumber)) {
      toast.error("Please enter a valid 10-digit contact number.");
      inputContactNumberReference.current.focus();
      inputContactNumberReference.current.classList.add("is-invalid");
      return;
    }

    if (!password) {
      toast.error("Please enter password.");
      inputPasswordReference.current.focus();
      inputPasswordReference.current.classList.add("is-invalid");
      return;
    }

    const passwordRegex =
      /^(?=.*[A-Z])(?=.*[!@#$%^&*])(?=.*[0-9])(?=.*[a-z]).{9,}$/;
    if (!passwordRegex.test(password)) {
      toast.error(
        "Password must contain at least one uppercase letter, one special character, one number, and be at least 9 characters long."
      );
      inputPasswordReference.current.focus();
      inputPasswordReference.current.classList.add("is-invalid");
      return;
    }

    if (!instituteOrBranch || instituteOrBranch === "") {
      toast.error("Please enter institute/branch.");
      inputDepartmentReference.current.focus();
      inputDepartmentReference.current.classList.add("is-invalid");
      return;
    }

    if (!roleId || roleId === "") {
      toast.error("Please select role.");
      inputRoleReference.current.focus();
      inputRoleReference.current.classList.add("is-invalid");
      return;
    }

    setIsLoaderActive(true);
    const APIMethodName = currentUserID
      ? "AuthMasterController/UpdateUser"
      : "AuthMasterController/CreateUser";
    const getRoleName = allRolesList.find((x) => x.roleID === roleId);
    const fullName = `${firstName} ${lastName}`.trim();
    const statusValue = isActive === "true" ? "Active" : "Inactive";
    const emailStatusValue = emailStatus === "true" ? "Active" : "Inactive";

    axios
      .post(
        config.API_URL + APIMethodName,
        {
          createdBy: personalInfo.userID,
          clientId: config.clientId,
          modifiedBy: personalInfo.userID,
          userID: currentUserID || "00000000-0000-0000-0000-000000000000",
          roleID: roleId,
          userName: userName,
          email: userEmail,
          password: password,
          phoneNumber: phoneNumber,
          fullName: fullName,
          instituteOrBranch: instituteOrBranch,
          status: statusValue,
          emailStatus: emailStatusValue,
          roleName: getRoleName?.roleName,
        },
        { headers: config.headers3 }
      )
      .then((response) => {
        if (response.data.success === "success") {
          toast.success(
            currentUserID
              ? "User Updated Successfully!"
              : "User Created Successfully!"
          );
          getUsersList();
          if (currentUserID) {
            setIsEditing(false);
            loadUserData();
          } else {
            clearAllFields();
          }
        } else {
          toast.error(response.data.message);
        }
        setIsLoaderActive(false);
      })
      .catch((error) => {
        setIsLoaderActive(false);
        toast.error(
          error.response?.data?.message ||
            "Oops, something went wrong. Please try again later."
        );
      });
  };

  const handleBackClick = () => {
    setViewMode("list");
    setCurrentUserID(null);
    setIsEditing(false);
  };

  const isFormDisabled = currentUserID && !isEditing;

  const columns = useMemo(
    () => [
      {
        name: "S.No",
        selector: (row, index) => index + 1,
        sortable: true,
        width: "60px",
      },
      {
        name: "UserName",
        selector: (row) => row.userName || "",
        sortable: true,
      },
      {
        name: "FullName",
        selector: (row) => row.fullName || "",
        sortable: true,
      },
      {
        name: "Email",
        selector: (row) => row.email || "",
        sortable: true,
      },
      {
        name: "PhoneNumber",
        selector: (row) => row.phoneNumber || "",
        sortable: true,
      },
      {
        name: "InstituteOrBranch",
        selector: (row) => row.instituteOrBranch || "",
        sortable: true,
      },
      {
        name: "AccountStatus",
        selector: (row) => row.status || "",
        sortable: true,
        cell: (row) => (
          <div
            className={`d-flex align-items-center ${
              row.roleName === "Admin" ? "disabled" : ""
            }`}
            style={{
              opacity: row.roleName === "Admin" ? 0.5 : 1,
              pointerEvents: row.roleName === "Admin" ? "none" : "auto",
            }}
          >
            <label
              className={`user-status-label ${
                row.status === "Active" ? "active" : "inactive"
              }`}
            >
              {row.status}
            </label>

            <Switch
              checked={row.status === "Active"}
              width={30}
              height={15}
              onColor="#11ba82"
              offColor="#ff6060"
              onChange={() => handleToggleUserStatus(row)}
            />
          </div>
        ),
      },
      {
        name: "Email Status",
        selector: (row) => row.emailStatus || "",
        sortable: true,
        cell: (row) => (
          <div
            className={`d-flex align-items-center ${
              row.roleName === "Admin" ? "disabled" : ""
            }`}
            style={{
              opacity: row.roleName === "Admin" ? 0.5 : 1,
              pointerEvents: row.roleName === "Admin" ? "none" : "auto",
            }}
          >
            <label
              className={`user-status-label ${
                row.emailStatus === "Active" ? "active" : "inactive"
              }`}
            >
              {row.emailStatus}
            </label>

            <Switch
              checked={row.emailStatus === "Active"}
              width={30}
              height={15}
              onColor="#11ba82"
              offColor="#ff6060"
              onChange={() => handleToggleUserStatus(row)}
            />
          </div>
        ),
      },
      {
        name: "Action",
        cell: (row) => (
          <div className="d-flex gap-2">
            <button
              type="button"
              className="view-icon mr-1"
              onClick={() => handleViewTaskDetails(row.userID)}
            >
              <i className="fas fa-eye"></i>
            </button>
            {row.roleName !== "Admin" ? (
              <button
                type="button"
                className="delete-icon"
                onClick={() => handleRemoveUser(row)}
              >
                <i className="fas fa-trash"></i>
              </button>
            ) : (
              <button type="button" className="delete-icon" disabled>
                {/* <i className="fas fa-trash"></i> */}
              </button>
            )}
          </div>
        ),
        width: "120px",
      },
    ],
    []
  );

  const filteredData = useMemo(() => {
    return allUsersList.filter((user) => user.status === (showActiveUsers ? "Active" : "Inactive"));
  }, [allUsersList, showActiveUsers]);

  if (viewMode === "list") {
    return (
      <section className="content">
        <div className="card">
          <div className="card-header">
            <h3 className="card-title text-sm">
              Users List ( {filteredData.length} )
            </h3>
            <div className="card-tools">
              {showActiveUsers ? (
                <button
                  className="custom-btn custom-danger-button mr-2"
                  onClick={handleShowInactive}
                >
                  Show Inactive
                </button>
              ) : (
                <button
                  className="custom-btn custom-success-button mr-2"
                  onClick={handleShowActive}
                >
                  Show Active
                </button>
              )}
              <button
                className="btn-custom custom-primary-button"
                onClick={handleNavigateToCreateUser}
              >
                Create User
              </button>
            </div>
          </div>
          <div className="card-body text-sm">
            <CustomDataTable
              columns={columns}
              data={filteredData}
              loading={isLoaderActive}
              itemsPerPageOptions={[5, 10, 25, 50]}
              defaultItemsPerPage={10}
              exportable={true}
              printable={true}
              pdfExportable={true}
              showGlobalSearch={true}
              showColumnToggle={true}
            />
          </div>
        </div>

        <div
          id="confirmCommonModal"
          className="modal fade confirmCommonModal"
          data-backdrop="static"
          tabIndex="-1"
          role="dialog"
          aria-labelledby="staticBackdropLabel"
          aria-hidden="true"
        >
          <div className="modal-dialog modal-confirm">
            <div className="modal-content">
              <div className="modal-header">
                <div className="icon-box">
                  <i className="fas fa-info"></i>
                </div>
                <h5 className="modal-title w-100">Are you sure?</h5>
              </div>
              <div className="modal-body">
                <p className="text-center">
                  By clicking on Yes delete all the user details. Once you
                  deleted it can not be recovered.
                </p>
              </div>
              <div className="modal-footer col-md-12">
                <button
                  className="custom-btn custom-secondary-button "
                  data-bs-dismiss="modal"
                >
                  Cancel
                </button>
                {isLoaderActive ? (
                  <PleaseWaitButton />
                ) : (
                  <button
                    className="custom-btn custom-primary-button "
                    onClick={yesConfirmSubmitRequest}
                  >
                    Yes
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>
    );
  }

  // Form render
  return (
    <section className="content">
      <div className="card">
        <div className="card-header">
          <h3 className="card-title text-sm">
            <i
              onClick={handleBackClick}
              className="fas fa-arrow-left cursor-pointer mr-2"
              style={{ cursor: "pointer" }}
            ></i>
            {currentUserID ? "Edit User" : "Create New User"}
          </h3>
          {currentUserID && (
            <div className="card-tools">
              {isLoaderActive ? (
                <PleaseWaitButton className="font-weight-medium auth-form-btn" />
              ) : isEditing ? (
                <button
                  className="custom-btn custom-danger-button"
                  onClick={() => setIsEditing(false)}
                >
                  <i className="fa fa-times pr-2"></i>
                  Cancel Edit
                </button>
              ) : (
                <button
                  className="custom-btn custom-success-button"
                  onClick={() => setIsEditing(true)}
                >
                  <i className="fa fa-edit pr-2"></i>
                  Edit User
                </button>
              )}
            </div>
          )}
        </div>
        <div className="card-body text-sm">
          <div className="row">
            <div className="form-group col-md-4">
              <label htmlFor="firstNameInput">
                First Name<sup style={{ color: "red" }}>*</sup>
              </label>
              <input
                type="text"
                className="form-control form-control-sm"
                id="firstNameInput"
                ref={inputFirstNameReference}
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                placeholder="First Name"
                disabled={isFormDisabled}
              />
            </div>
            <div className="form-group col-md-4">
              <label htmlFor="lastNameInput">
                Last Name<sup style={{ color: "red" }}>*</sup>
              </label>
              <input
                type="text"
                className="form-control form-control-sm"
                id="lastNameInput"
                ref={inputLastNameReference}
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                placeholder="Last Name"
                disabled={isFormDisabled}
              />
            </div>
            <div className="form-group col-md-4">
              <label htmlFor="userNameInput">
                User Name<sup style={{ color: "red" }}>*</sup>
              </label>
              <input
                type="text"
                className="form-control form-control-sm"
                id="userNameInput"
                ref={inputUserNameReference}
                value={userName}
                onChange={(e) => setUserName(e.target.value)}
                placeholder="User Name"
                disabled={isFormDisabled}
              />
            </div>
            <div className="form-group col-md-4">
              <label htmlFor="userEmailInput">
                Email<sup style={{ color: "red" }}>*</sup>
              </label>
              <input
                type="text"
                className="form-control form-control-sm"
                id="userEmailInput"
                ref={inputEmailReference}
                value={userEmail}
                onChange={(e) => setUserEmail(e.target.value)}
                placeholder="Email"
                disabled={isFormDisabled}
              />
            </div>
            <div className="form-group col-md-4">
              <label htmlFor="contactNumberInput">
                Contact Number<sup style={{ color: "red" }}>*</sup>
              </label>
              <input
                type="text"
                className="form-control form-control-sm"
                id="contactNumberInput"
                ref={inputContactNumberReference}
                value={phoneNumber}
                onChange={(e) => {
                  const inputValue = e.target.value;
                  const numericValue = inputValue.replace(/\D/g, "");
                  const limitedValue = numericValue.slice(0, 10);
                  setPhoneNumber(limitedValue);
                }}
                placeholder="Contact Number"
                inputMode="numeric"
                maxLength={10}
                disabled={isFormDisabled}
              />
            </div>
            <div className="form-group col-md-4 position-relative">
              <label htmlFor="passwordInput">
                Password<sup style={{ color: "red" }}>*</sup>
              </label>
              <input
                type={showPassword ? "text" : "password"}
                className="form-control form-control-sm pr-5"
                id="passwordInput"
                ref={inputPasswordReference}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Password"
                disabled={isFormDisabled}
              />
              <span
                onClick={togglePassword}
                style={{
                  position: "absolute",
                  right: "15px",
                  top: "70%",
                  transform: "translateY(-50%)",
                  cursor: "pointer",
                  color: "#6c757d",
                  zIndex: 2,
                }}
              >
                <i
                  className={`fa ${showPassword ? "fa-eye" : "fa-eye-slash"}`}
                />
              </span>
            </div>
            <div className="form-group col-md-4">
              <label htmlFor="instituteOrBranchInput">
                Institute/Branch <sup style={{ color: "red" }}>*</sup>
              </label>
              <input
                type="text"
                className="form-control form-control-sm"
                id="instituteOrBranchInput"
                ref={inputDepartmentReference}
                value={instituteOrBranch}
                onChange={(e) => setInstituteOrBranch(e.target.value)}
                placeholder="Enter Institute/Branch"
                disabled={isFormDisabled}
              />
            </div>
            <div className="form-group col-md-4">
              <label>
                Select Role<sup style={{ color: "red" }}>*</sup>
              </label>
              <select
                className="form-control form-control-sm"
                ref={inputRoleReference}
                value={roleId}
                onChange={(e) => setRoleId(e.target.value)}
                disabled={isFormDisabled}
              >
                <option value="">--Select--</option>
                {allRolesList.map((role) => (
                  <option key={"Mana_" + role.roleID} value={role.roleID}>
                    {role.roleName}
                  </option>
                ))}
              </select>
            </div>
            <div className="form-group col-md-4">
              <label htmlFor="isActiveInput">Account Status</label>
              <select
                className="form-control form-control-sm"
                id="isActiveInput"
                value={isActive}
                onChange={(e) => setIsActive(e.target.value)}
                placeholder="Select Status"
                disabled={isFormDisabled}
              >
                <option value="true">Active</option>
                <option value="false">Inactive</option>
              </select>
            </div>
            <div className="form-group col-md-4">
              <label htmlFor="emailStatusInput">Email Status</label>
              <select
                className="form-control form-control-sm"
                id="emailStatusInput"
                value={emailStatus}
                onChange={(e) => setEmailStatus(e.target.value)}
                placeholder="Select Email Status"
                disabled={isFormDisabled}
              >
                <option value="true">Active</option>
                <option value="false">Inactive</option>
              </select>
            </div>
          </div>
          <div className="card-footer mt-2">
            {isLoaderActive ? (
              <PleaseWaitButton className="font-weight-medium auth-form-btn mr-2" />
            ) : (
              <button
                type="submit"
                className="custom-btn custom-primary-button mr-2"
                onClick={handleUserSubmit}
                disabled={currentUserID && !isEditing}
              >
                {currentUserID ? "Update & Submit" : "Save & Submit"}
              </button>
            )}
            {!currentUserID && (
              <button
                type="button"
                className="custom-btn custom-secondary-button mr-2"
                onClick={clearAllFields}
              >
                Clear
              </button>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};

export default UserCreation;
