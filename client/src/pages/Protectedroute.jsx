import React from 'react';
import { Navigate } from 'react-router-dom';
import Cookies from 'js-cookie'; // You can use any library to handle cookies, like js-cookie

const ProtectedRoute = ({ children }) => {
  const accessToken = Cookies.get('accessToken'); // Get the access token from the cookie

  // send a request to the server to verify the token

  const verifyToken = async () => {
    try {
      const response = await axios.post(`${VITE_BACKEND_URL}/api/v1/users/verifyToken`, {
        accessToken,
      },{
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if(response.data.status){
        return children;
      }
        else{
            return <Navigate to="/login" replace />;
        }
    }
    catch (error) {
      // If the token is invalid, redirect to the login page
      return <Navigate to="/login" replace />;
    }
};

  if (!accessToken) {
    // If the token doesn't exist, redirect to the login page
    return <Navigate to="/login" replace />;
  }

  // Optionally, you can verify the token's validity by making an API call

  return children;
};

export default ProtectedRoute;
