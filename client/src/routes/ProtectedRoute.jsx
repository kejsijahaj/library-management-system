import { Navigate, Outlet, useLocation } from "react-router-dom";
import FullPageLoader from "../components/FullPageLoader.jsx";
import { useAuth } from "../context/AuthContext.jsx";

const ProtectedRoute = ({ roles }) => {
  const location = useLocation();
  const { isAuthenticated, isBootstrapping, user } = useAuth();

  if (isBootstrapping) {
    return <FullPageLoader />;
  }

  if (!isAuthenticated) {
    return <Navigate replace state={{ from: location }} to="/login" />;
  }

  if (roles?.length && !roles.includes(user?.role)) {
    return <Navigate replace to="/" />;
  }

  return <Outlet />;
};

export default ProtectedRoute;
