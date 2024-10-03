import React, { useState } from 'react';
import { TextField, Button, Box, Alert, CircularProgress, Snackbar,Typography } from '@mui/material';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const ResetPassword = () => {
  const [formData, setFormData] = useState({
    email: '',
    otp: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [loading, setLoading] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, type: '', message: '' });
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();

    const { email, otp, newPassword, confirmPassword } = formData;

    if (!email || !otp || !newPassword || !confirmPassword) {
      setSnackbar({ open: true, type: 'error', message: 'Please fill in all fields.' });
      return;
    }

    if (newPassword !== confirmPassword) {
      setSnackbar({ open: true, type: 'error', message: 'Passwords do not match.' });
      return;
    }

    setLoading(true);
    try {
      const response = await axios.post(`${import.meta.env.VITE_BACKEND_URL}/api/v1/users/reset-password`, {
        email,
        otp,
        newPassword,
        confirmPassword,
      });
      setSnackbar({ open: true, type: 'success', message: response.data.message || 'Password reset successfully.' });

      // Optionally, redirect to login page after a short delay
      setTimeout(() => {
        navigate('/login'); // Ensure you have a login route
      }, 2000);
    } catch (error) {
      setSnackbar({
        open: true,
        type: 'error',
        message: error.response?.data?.message || 'Error resetting password.',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  return (
    

<Box
 component="form"
 onSubmit={handleResetPassword}
 sx={{
 mt: 4,
 display: 'flex',
 flexDirection: 'column',
 alignItems: 'center',
 justifyContent: 'center',
 width: '50%',  
 mx: 'auto',  
 p: 3,  
 border: '1px solid #ddd', 
 borderRadius: '8px', 
 boxShadow: 3, 
 }}
>
<img src="https://www.gla.ac.in/info/common/images/mobilelogo.png" alt="GLAMIS" className="h-32 mb-7" />
<Typography variant="h5" sx={{ mb: 3 }}>
    Welcome to GLA Mock Interview System
  </Typography>
 <TextField
 label="Email"
 variant="outlined"
 type="email"
 name="email"
 fullWidth
 required
 value={formData.email}
 onChange={handleChange}
 sx={{ mb: 2 }}
 />
 <TextField
 label="OTP"
 variant="outlined"
 type="text"
 name="otp"
 fullWidth
 required
 value={formData.otp}
 onChange={handleChange}
 sx={{ mb: 2 }}
 />
 <TextField
 label="New Password"
 variant="outlined"
 type="password"
 name="newPassword"
 fullWidth
 required
 value={formData.newPassword}
 onChange={handleChange}
 sx={{ mb: 2 }}
 />
 <TextField
 label="Confirm Password"
 variant="outlined"
 type="password"
 name="confirmPassword"
 fullWidth
 required
 value={formData.confirmPassword}
 onChange={handleChange}
 sx={{ mb: 2 }}
 />
 <Button
 variant="contained"
 fullWidth
 type="submit"
 disabled={loading}
 sx={{
 backgroundColor: 'darkgreen',  // Dark green color for the button
 '&:hover': {
 backgroundColor: 'green',  // Lighter green on hover
 },
 }}
 >
 {loading ? <CircularProgress size={24} color="inherit" /> : 'Reset Password'}
 </Button>
 <Snackbar
 open={snackbar.open}
 autoHideDuration={6000}
 onClose={handleCloseSnackbar}
 anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
 >
 <Alert onClose={handleCloseSnackbar} severity={snackbar.type} sx={{ width: '100%' }}>
 {snackbar.message}
 </Alert>
 </Snackbar>
</Box>

  );
};

export default ResetPassword;
