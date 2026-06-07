import { Navigate, Outlet } from "react-router-dom";
import FullPageLoader from "../components/FullPageLoader.jsx";
import { useAuth } from "../context/AuthContext.jsx";

const GuestRoute = () => {
  const { isAuthenticated, isBootstrapping } = useAuth();

  if (isBootstrapping) {
    return <FullPageLoader />;
  }

  if (isAuthenticated) {
    return <Navigate replace to="/" />;
  }

  return <Outlet />;
};

export default GuestRoute;
