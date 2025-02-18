import { Navigate } from "react-router-dom";
import { useSelector } from "react-redux";

const PublicRoute = ({ children }) => {
  const role = useSelector((state) => state.userDetails?.is_admin);
  const isAuthenticated = useSelector((state) => state.userDetails?.access_token);

  // ✅ Show nothing until authentication state is determined
  if (isAuthenticated === undefined) {
    return null; // or a loading spinner
  }

  if (role === true) {
    return <Navigate to="/salesReport" />;
  } else if (role === false) {
    return <Navigate to="/HomePage" />;
  }

  return children;
};

export default PublicRoute;
