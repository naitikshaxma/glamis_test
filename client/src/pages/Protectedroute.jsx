import React from 'react';
import { Navigate } from 'react-router-dom';
import Cookies from 'js-cookie'; // You can use any library to handle cookies, like js-cookie

const ProtectedRoute = ({ children }) => {
  const accessToken = Cookies.get('accessToken'); // Get the access token from the cookie

  if (!accessToken) {
    // If the token doesn't exist, redirect to the login page
    return <Navigate to="/login" replace />;
  }

  // Optionally, you can verify the token's validity by making an API call

  return children;
};

export default ProtectedRoute;
