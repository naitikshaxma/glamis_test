import React, { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import Cookies from 'js-cookie';
import axios from 'axios';

const ProtectedRoute = ({ children }) => {
  const [isVerified, setIsVerified] = useState(null); // Initialize state for verification status
  const accessToken = Cookies.get('accessToken'); // Get the access token from the cookie

  useEffect(() => {
    const verifyToken = async () => {
      if (!accessToken) {
        setIsVerified(false);
        return;
      }

      try {
        const response = await axios.post(`${import.meta.env.VITE_BACKEND_URL}/api/v1/users/verifyToken`, {
          accessToken,
        }, {
          headers: {
            'Content-Type': 'application/json',
          },
        });

        if (response.data.statusCode === 200) {
          setIsVerified(true);
        } else {
          setIsVerified(false);
        }
      } catch (error) {
        setIsVerified(false);
      }
    };

    verifyToken();
  }, [accessToken]);

  if (isVerified === null) {
    // While verifying the token, you might want to show a loading spinner or something similar
    return <div>Loading...</div>;
  }

  if (isVerified === false) {
    // If the token is not verified, redirect to the login page
    return <Navigate to="/login" replace />;
  }

  // If the token is verified, render the children
  return children;
};

export default ProtectedRoute;
