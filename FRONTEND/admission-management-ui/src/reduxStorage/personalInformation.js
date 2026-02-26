import { createSlice } from '@reduxjs/toolkit';
import { capitalizeText } from '../common/textOperations';

export const personalInformation = createSlice({
  name: "Personal Information",
  initialState: {
    userID: "",
    roleID: "",
    clientId: "",
    userRole: "",
    userName: "",
    displayName: "",
    emailAddress: "",
    menuItemNames: [],
    token: "",
    profilePic: "",
    firstName: "",
    lastName: "",
    department: "",
  },

  reducers: {
    setUserPersonalInformation: (state, action) => {
      console.log("Dispatching setUserPersonalInformation with payload:", action.payload);
      return {
        ...state,
        userID: action.payload.userID,
        userName: capitalizeText(action.payload.userName),
        userRole: action.payload.userRole,
        displayName: action.payload.displayName,
        emailAddress: action.payload.emailAddress,
        menuItemNames: action.payload.menuItemNames,
        token: action.payload.token,
        profilePic: action.payload.profilePic,
        firstName: action.payload.firstName,
        lastName: action.payload.lastName,
        clientId: action.payload.clientId,
        department: action.payload.department,
      };
    },

    changePersonalInfo: (state, action) => {
      return {
        ...state,
        profilePic: action.payload.profilePic,
      };
    },

    changeApplicationClientIdAndMenuItems: (state, action) => {
      return {
        ...state,
        clientId: action.payload.clientId,
        menuItemNames: action.payload.menuItemNames,
      };
    },
  },
});

export const { setUserPersonalInformation, changePersonalInfo, changeApplicationClientIdAndMenuItems } = personalInformation.actions;

export default personalInformation.reducer;