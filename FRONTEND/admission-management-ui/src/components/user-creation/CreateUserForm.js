import { useRef, useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { removeExtraSpaces } from "../../common/textOperations";
import { isValidEmail } from "../../common/validations";
import { useNavigate, useLocation } from "react-router-dom";
import { toast } from "react-toastify";
import axios from "axios";
import $ from "jquery";
import PleaseWaitButton from "../../shared/PleaseWaitButton";
const config = require("../../services/config.json");

const CreateUserForm = () => {
  const inputFirstNameReference = useRef(null);
  const inputLastNameReference = useRef(null);
  const inputEmailReference = useRef(null);
  const inputRoleReference = useRef(null);
  const inputPasswordReference = useRef(null);
  const inputContactNumberReference = useRef(null);
  const inputUserNameReference = useRef(null);
  const inputDepartmentReference = useRef(null);

  const personalInfo = useSelector((state) => state.personalInformationReducer);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [userEmail, setUserEmail] = useState("");
  const [roleId, setRoleId] = useState("");
  const [password, setPassword] = useState("");
  const [contactNumber, setContactNumber] = useState("");
  const [isLoaderActive, setIsLoaderActive] = useState(false);
  const [allRolesList, setAllRolesList] = useState([]);
  const [allUsersList, setAllUsersList] = useState([]);
  const [isActive, setIsActive] = useState("");
  const [userName, setUserName] = useState("");
  const [department, setDepartment] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [departments, setDepartments] = useState([]);

  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const userID = queryParams.get("userID");

  useEffect(() => {
    getAllRolesList();
    getAllDepartments();
  }, []);

  useEffect(() => {
    if (userID) {
      getUsersList(userID);
      setIsEditing(false);
    }
  }, [userID]);

  const getUsersList = (userID) => {
    axios
      .get(
        `${config.API_URL}AuthMasterController/GetAllUsers?ClientId=${config.clientId}`,
        { headers: config.headers2 }
      )
      .then((response) => {
        if (response.status === 200 && response.data.success === "success") {
          const user = response.data.data.find(
            (user) => user.userID === userID
          );
          if (user) {
            setAllUsersList(response.data.data);
            setUserName(user.userName || "");
            setUserEmail(user.email || "");
            setRoleId(user.roleID || "");
            setPassword(user.password || "");
            setContactNumber(user.contactNumber || "");
            setFirstName(user.firstName || "");
            setLastName(user.lastName || "");
            setDepartment(user.department || "");
            setIsActive(user.isActive !== undefined ? user.isActive.toString() : "");
          } else {
            toast.error("User not found.");
          }
        } else {
          toast.error(response.data.message);
        }
      })
      .catch(() => {
        toast.error("Please try again later.");
      });
  };

  const getAllRolesList = () => {
    axios
      .get(
        config.API_URL +
          "AuthMasterController/GetAllRoles?ClientId=" +
          config.clientId,
        { headers: config.headers2 }
      )
      .then((response) => {
        if (response.status === 200 && response.data.success === "success") {
          const sortedRoles = response.data.data.sort((a, b) =>
            a.roleName.localeCompare(b.roleName)
          );
          setAllRolesList(sortedRoles);
        } else {
          toast.error(response.data.message);
        }
      })
      .catch(() => {
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



  const clearAllFields = () => {
    setUserEmail("");
    setRoleId("");
    setPassword("");
    setContactNumber("");
    setFirstName("");
    setLastName("");
    setIsActive("");
    setUserName("");
    setDepartment("");
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

    if (!contactNumber) {
      toast.error("Please enter contact number.");
      inputContactNumberReference.current.focus();
      inputContactNumberReference.current.classList.add("is-invalid");
      return;
    }

    if (contactNumber.length !== 10 || !/^\d+$/.test(contactNumber)) {
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

    if (!department || department === "") {
      toast.error("Please select department.");
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
    const APIMethodName = userID
      ? "AuthMasterController/UpdateUser"
      : "AuthMasterController/CreateUser";
    const getRoleName = allRolesList.find((x) => x.roleID === roleId);

    axios
      .post(
        config.API_URL + APIMethodName,
        {
          createdBy: personalInfo.userID,
          clientId: config.clientId,
          modifiedBy: personalInfo.userID,
          userID: userID || "00000000-0000-0000-0000-000000000000",
          roleID: roleId,
          userName: userName,
          email: userEmail,
          password: password,
          contactNumber: contactNumber,
          firstName: firstName,
          lastName: lastName,
          department: department,
          isActive: userID ? isActive : true,
          roleName: getRoleName?.roleName,
        },
        { headers: config.headers3 }
      )
      .then((response) => {
        if (response.data.success === "success") {
          toast.success(
            userID ? "User Updated Successfully!" : "User Created Successfully!"
          );
          if (userID) {
            setIsEditing(false);
            getUsersList(userID);
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

  const navigate = useNavigate();

  const handleBackClick = () => {
    navigate("/create-user");
  };

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
            {userID ? "Edit User" : "Create New User"}
          </h3>
          {userID && (
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
                disabled={userID && !isEditing}
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
                disabled={userID && !isEditing}
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
                disabled={userID && !isEditing}
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
                disabled={userID && !isEditing}
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
                value={contactNumber}
                onChange={(e) => {
                  const inputValue = e.target.value;
                  const numericValue = inputValue.replace(/\D/g, "");
                  const limitedValue = numericValue.slice(0, 10);
                  setContactNumber(limitedValue);
                }}
                placeholder="Contact Number"
                inputMode="numeric"
                maxLength={10}
                disabled={userID && !isEditing}
              />
            </div>
            <div className="form-group col-md-4">
              <label htmlFor="passwordInput">
                Password<sup style={{ color: "red" }}>*</sup>
              </label>
              <input
                type="password"
                className="form-control form-control-sm"
                id="passwordInput"
                ref={inputPasswordReference}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Password"
                disabled={userID && !isEditing}
              />
              <span
                toggle="#passwordInput"
                className="fa fa-fw fa-eye field-icon-password toggle-password"
              ></span>
            </div>
            <div className="form-group col-md-4">
              <label>
                Select Department <sup style={{ color: "red" }}>*</sup>
              </label>
              <select
                className="form-control form-control-sm"
                ref={inputDepartmentReference}
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
                disabled={userID && !isEditing}
              >
                <option value="">--Select Department--</option>
                {departments.map((department) => (
                  <option key={department.id} value={department.masterValue}>
                    {department.masterValue}
                  </option>
                ))}
              </select>
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
                disabled={userID && !isEditing}
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
              <label htmlFor="isActiveInput">isActive</label>
              <select
                className="form-control form-control-sm"
                id="isActiveInput"
                value={isActive}
                onChange={(e) => setIsActive(e.target.value)}
                placeholder="Select Status"
                disabled={userID && !isEditing}
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
                disabled={userID && !isEditing}
              >
                {userID ? "Update & Submit" : "Save & Submit"}
              </button>
            )}
            {!userID && (
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

export default CreateUserForm;