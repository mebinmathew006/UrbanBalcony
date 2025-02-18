import React from "react";
import { Navigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { toast } from "react-toastify";
const ProtectedRoute = ({ children }) => {
  const isAuthenticated = useSelector(
    (state) => state.userDetails.access_token
  );
  if (isAuthenticated) {
    return children;
  } else {
    toast.error('Please Login',{position:'bottom-center'})
    return <Navigate to="/login" />;
  }
};

export default ProtectedRoute;
