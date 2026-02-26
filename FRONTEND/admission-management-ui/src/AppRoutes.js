import React, { Suspense, lazy } from "react";
import { Route, Routes, useLocation } from "react-router-dom";
import Spinner from "./shared/Spinner";

const Login = lazy(() => import("./components/login/Login"));
const ResetPassword = lazy(() =>
  import("./components/ResetPassword/ResetPassword")
);
const CreateUserForm = lazy(() =>
  import("./components/user-creation/CreateUserForm")
);
const NotAuthorized = lazy(() => import("./shared/NotAuthorized"));
const NotFound = lazy(() => import("./components/404/NotFound"));
const UserCreation = lazy(() =>
  import("./components/user-creation/UserCreation")
);
const ManageRoles = lazy(() => import("./components/manage-roles/ManageRoles"));
const Profile = lazy(() => import("./components/profile/profile"));
const Masters = lazy(() => import("./components/master/Masters"));
// const OrganizationMasters = lazy(() =>
//   import("./components/organizationMasters/OrganizationMasters")
// );
const Dashboard = lazy(() => import("./components/Dashboard/Dashboard"));
const Institution = lazy(() => import("./components/All-Masters/InstitutionMasters"));
const Campus = lazy(() => import("./components/All-Masters/CampusMasters"));
const Department = lazy(() => import("./components/All-Masters/DepartmentMasters"));
const Programs = lazy(() => import("./components/All-Masters/ProgramMasters"));
const AcademicYear = lazy(() => import("./components/All-Masters/AcademicYearMasters"));
const EntryType = lazy(() => import("./components/All-Masters/EntryTypeMasters"));
const AdmissionMode = lazy(() => import("./components/All-Masters/AdmissionModeMasters"));
const SeatMatrix = lazy(() => import("./components/Seat-Matrix/SeatMatrixMasters"));
const Quota = lazy(() => import("./components/Quota/QuotaMasters"));
const ApplicantForm = lazy(() => import("./components/ApplicantForm/ApplicantForm"));



const AppRoutes = () => {
  const location = useLocation();

  return (
    <Suspense fallback={<Spinner />}>
      <div className="page-container">
        <Routes location={location}>
          <Route path="/login" element={<Login />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route path="/not-authorized" element={<NotAuthorized />} />
          <Route path="/" element={<Dashboard />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/create-user" element={<UserCreation />} />
          <Route path="/create-new-user" element={<CreateUserForm />} />
          <Route path="/manage-roles" element={<ManageRoles />} />
          <Route path="/manage-profile" element={<Profile />} />
          <Route path="/all-masters" element={<Masters />} />
          <Route path="/institution-master" element={<Institution />} />
          <Route path="/campus-master" element={<Campus />} />
          <Route path="/department-master" element={<Department />} />
          <Route path="/academic-year-master" element={<AcademicYear />} />
          <Route path="/entry-type-master" element={<EntryType />} />
          <Route path="/admission-mode-master" element={<AdmissionMode />} />
          <Route path="/program-master" element={<Programs />} />
          <Route path="/seat-matrix-management" element={<SeatMatrix />} />
          <Route path="/quota-management" element={<Quota />} />
          {/* <Route path="/inbound/gate-entry" element={<GateEntry />} />
          <Route path="/inbound/grn" element={<GRN />} />
          <Route path="/inbound/putaway" element={<Putaway />} />
          <Route path="/outbound/sales-orders" element={<SalesOrderList />} />
          <Route path="/outbound/picking" element={<Picking />} />
          <Route path="/outbound/packing" element={<Packing />} />
          <Route path="/outbound/dispatch" element={<Dispatch />} />
          <Route path="/inventory/stock-overview" element={<StockOverview />} />
          <Route path="/inventory/stock-bin" element={<StockByBin />} />
          <Route path="/inventory/adjustment" element={<StockAdjustment />} />
          <Route path="/inventory/cycle-count" element={<CycleCount />} />
          <Route path="/purchase-order" element={<PurchaseOrder />} /> */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </div>
    </Suspense>
  );
};

export default AppRoutes;
