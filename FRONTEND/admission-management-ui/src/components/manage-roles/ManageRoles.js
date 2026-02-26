
import React, { useRef, useEffect, useState, useMemo,  } from "react";
import { useSelector } from "react-redux";
import { toast } from "react-toastify";
import PleaseWaitButton from "../../shared/PleaseWaitButton";
import axios from "axios";
import Select from "react-select";
import CustomDataTable from "../../common/customdatable";
const config = require("../../services/config.json");

const customStyles = {
  control: (provided, state) => ({
    ...provided,
    borderColor: state.selectProps.isInvalid ? "red" : provided.borderColor,
    "&:hover": {
      borderColor: state.selectProps.isInvalid ? "red" : provided.borderColor,
    },
  }),
  multiValue: (styles) => ({
    ...styles,
    background: "#ff7a59",
    color: "#fff",
    fontSize: "10px",
    borderRadius: "15px",
    textAlign: "center",
    padding: "4px 8px",
    boxShadow: "0 2px 4px rgba(0, 0, 0, 0.2)",
    marginBottom: "4px",
  }),
  multiValueLabel: (styles) => ({
    ...styles,
    color: "#fff",
    fontWeight: "bold",
    fontSize: "10px",
  }),
  multiValueRemove: (styles) => ({
    ...styles,
    color: "#ffffff",
    ":hover": {
      color: "#fff",
    },
  }),
};

const ManageRoles = () => {
  const inputRoleNameReference = useRef(null);
  const selectAppsReference = useRef(null);
  const personalInfo = useSelector((state) => state.personalInformationReducer);
  const [roleName, setRoleName] = useState("");
  const [appId, setAppId] = useState([]);
  const [isLoaderActive, setIsLoaderActive] = useState(false);
  const [allRolesList, setAllRolesList] = useState([]);
  const [allAppsList, setAllAppsList] = useState([]);
  const [updateOrDeleteId, setUpdateOrDeleteId] = useState("");
  const [isRoleNameInvalid, setIsRoleNameInvalid] = useState(false);
  const [isAppsInvalid, setIsAppsInvalid] = useState(false);

  useEffect(() => {
    getAllAppsList();
    window.initMultiSelectFuncation && window.initMultiSelectFuncation();
  }, []);

  const getAllAppsList = () => {
    axios
      .get(`${config.API_URL}AuthMasterController/GetAllApps`, {
        headers: config.headers2,
      })
      .then((response) => {
        if (response.status === 200 && response.data.success === "success") {
          setAllAppsList(response.data.data);
          getAllRolesList();
        } else {
          toast.error(response.data.message);
        }
      })
      .catch((error) => {
        toast.error("Oops, something went wrong. Please try again later.");
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
        if (response.status === 200 && response.data.success === "success") {
          setAllRolesList(response.data.data);
        } else {
          toast.error(response.data.message);
        }
      })
      .catch((error) => {
        toast.error("Oops, something went wrong. Please try again later.");
      });
  };



  const handleEditRoleDetails = (roleObj) => {
    setUpdateOrDeleteId(roleObj.roleID);
    setRoleName(roleObj.roleName);
    const appOptions = roleObj.appIDList.map((appID) => ({
      value: appID,
      label: allAppsList.find((app) => app.appID === appID)?.appName,
    }));
    setAppId(appOptions);
    // listOfProjectsHeaderExpandButtionClick();
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleRemoveRole = (roleObj) => {
    setUpdateOrDeleteId(roleObj.roleID);
    window.confirmModalShow && window.confirmModalShow();
  };

  const yesConfirmSubmitRequest = () => {
    setIsLoaderActive(true);
    axios
      .post(
        `${config.API_URL}AuthMasterController/DeleteRole?roleId=${updateOrDeleteId}`,
        {},
        {
          headers: config.headers2,
        }
      )
      .then((response) => {
        if (response.data.success === "success") {
          toast.success("Role deleted successfully...");
          window.confirmModalHide && window.confirmModalHide();
          clearAllFields();
          getAllAppsList();
        } else {
          toast.error(response.data.message);
        }
      })
      .catch((error) => {
        toast.error(
          error.response?.data?.message ||
            "Oops, something went wrong. Please try again later."
        );
      })
      .finally(() => {
        setIsLoaderActive(false);
      });
  };

  const clearAllFields = () => {
    setRoleName("");
    setAppId([]);
    setUpdateOrDeleteId("");
    setIsRoleNameInvalid(false);
    setIsAppsInvalid(false);
  };

  const handleCancelClick = () => {
    clearAllFields();
    // addProjectCardHeaderButtonClick();
  };

  const handleRoleSubmit = (e) => {
    e.preventDefault();

    if (!roleName.trim()) {
      toast.error("Please enter role name.");
      setIsRoleNameInvalid(true);
      inputRoleNameReference.current.focus();
      return;
    }
    setIsRoleNameInvalid(false);

    if (appId.length === 0) {
      toast.error("Select at least one app.");
      setIsAppsInvalid(true);
      selectAppsReference.current.focus();
      return;
    }
    setIsAppsInvalid(false);

    setIsLoaderActive(true);

    const APIMethodName = updateOrDeleteId
      ? "AuthMasterController/UpdateRole"
      : "AuthMasterController/CreateRole";
    const successMessage = updateOrDeleteId
      ? "Role updated successfully."
      : "Role created successfully.";

    axios
      .post(
        `${config.API_URL}${APIMethodName}`,
        {
          roleID: updateOrDeleteId || "00000000-0000-0000-0000-000000000000",
          createdBy: personalInfo.userID,
          clientId: config.clientId,
          modifiedBy: personalInfo.userID,
          roleName: roleName,
          appIDList: appId.map((app) => app.value),
          isActive: true,
        },
        {
          headers: config.headers2,
        }
      )
      .then((response) => {
        if (response.data.success === "success") {
          toast.success(successMessage);
          clearAllFields();
          // addProjectCardHeaderButtonClick();
          getAllRolesList();
        } else {
          toast.error(response.data.message);
        }
      })
      .catch((error) => {
        toast.error(
          error.response?.data?.message ||
            "Oops, something went wrong. Please try again later."
        );
      })
      .finally(() => {
        setIsLoaderActive(false);
      });
  };

  const handleRoleNameChange = (e) => {
    setRoleName(e.target.value);
    if (e.target.value.trim()) {
      setIsRoleNameInvalid(false);
    }
  };

  const handleAppChange = (selectedOptions) => {
    setAppId(selectedOptions || []);
    if (selectedOptions && selectedOptions.length > 0) {
      setIsAppsInvalid(false);
    }
  };

  const columns = useMemo(
    () => [
      {
        name: "S.No",
        selector: (row, index) => index + 1,
        sortable: true,
        width: "60px",
      },
      {
        name: "Role Name",
        selector: (row) => row.roleName || "N/A",
        sortable: true,
      },
      {
  name: "App Names",
  selector: (row) =>
    row.appIDList.map((appID, index) => {
      const appName =
        allAppsList.find((app) => app.appID === appID)?.appName || "N/A";

      return (
        <span key={index} className="app-name-badge">
          {appName}
        </span>
      );
    }),
  sortable: true,
},

      {
        name: "Action",
        cell: (row) => (
          <div className="d-flex gap-2">
            <button
              type="button"
              className="edit-icon mr-1"
              onClick={() => handleEditRoleDetails(row)}
            >
              <i className="fas fa-pen"></i>
            </button>
            <button
              type="button"
              className="delete-icon"
              onClick={() => handleRemoveRole(row)}
            >
              <i className="fas fa-trash"></i>
            </button>
          </div>
        ),
        width: "120px",
      },
    ],
    [allAppsList]
  );

  const appOptions = allAppsList.map((app) => ({
    value: app.appID,
    label: app.appName,
  }));

  return (
    <section className="content scroll-content">
      <div className="row">
        <div className="col-md-12">
          <div className="card">
            <div className="card-header">
              <h3 className="card-title text-sm">Create New Role</h3>
            </div>
            <div className="card-body text-sm">
              <div className="row">
                <div className="form-group col-md-6">
                  <label htmlFor="userRoleNameInput">
                    Role Name<sup style={{ color: "red" }}>*</sup>
                  </label>
                  <input
                    type="text"
                    className={`form-control form-control-md ${isRoleNameInvalid ? "is-invalid" : ""}`}
                    id="userRoleNameInput"
                    ref={inputRoleNameReference}
                    value={roleName}
                    onChange={handleRoleNameChange}
                    placeholder="Role Name"
                  />
                </div>
                <div className="form-group col-md-6">
                  <label>
                    Select Apps<sup style={{ color: "red" }}>*</sup>
                  </label>
                  <Select
                    isMulti
                    options={appOptions}
                    className="roles-custom-select"
                    value={appId}
                    onChange={handleAppChange}
                    ref={selectAppsReference}
                    placeholder="Select Apps.."
                    styles={customStyles}
                    isInvalid={isAppsInvalid}
                  />
                </div>
              </div>
              <div className="card-footer mt-3">
                {isLoaderActive ? (
                  <PleaseWaitButton className="btn-sm pl-3 pr-3 ml-2 font-weight-medium auth-form-btn" />
                ) : (
                  <button
                    type="submit"
                    className="custom-btn custom-primary-button mr-2"
                    onClick={handleRoleSubmit}
                  >
                    {updateOrDeleteId ? "Update & Submit" : "Save & Submit"}
                  </button>
                )}
                <button
                  type="submit"
                  className="custom-btn custom-secondary-button"
                  onClick={handleCancelClick}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="row">
        <div className="col-md-12">
          <div className="card">
            <div className="card-header">
              <h3 className="card-title">
                Roles List ( {allRolesList.length} )
              </h3>
            </div>
            <div className="card-body text-sm">
              <CustomDataTable
                columns={columns}
                data={allRolesList}
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
                By clicking on Yes, all the role details will be deleted. Once
                deleted, it cannot be recovered.
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
                <PleaseWaitButton className="" />
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
};

export default ManageRoles;