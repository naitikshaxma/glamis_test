import React, { useState } from 'react';
import { TextField, Button, Box, Alert, CircularProgress, Snackbar,Typography } from '@mui/material';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, type: '', message: '' });
  const navigate = useNavigate();

  const handleForgotPassword = async (e) => {
    e.preventDefault();

    if (!email) {
      setSnackbar({ open: true, type: 'error', message: 'Please enter your email.' });
      return;
    }

    setLoading(true);
    try {
      const response = await axios.post(`${import.meta.env.VITE_BACKEND_URL}/api/v1/users/forgot-password`, { email });
      setSnackbar({ open: true, type: 'success', message: response.data.message || 'OTP sent successfully.' });

      // Redirect to Reset Password after a short delay
      setTimeout(() => {
        navigate('/reset');
      }, 2000);
    } catch (error) {
      setSnackbar({
        open: true,
        type: 'error',
        message: error.response?.data?.message || 'Error sending OTP.',
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
 onSubmit={handleForgotPassword}
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
 fullWidth
 required
 value={email}
 onChange={(e) => setEmail(e.target.value)}
 sx={{ mb: 2 }}
 />
 <Button
 variant="contained"
 fullWidth
 type="submit"
 disabled={loading}
 sx={{
 backgroundColor: 'darkgreen', 
 '&:hover': {
 backgroundColor: 'green', 
 },
 }}
 >
 {loading ? <CircularProgress size={24} color="inherit" /> : 'Send OTP'}
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

export default ForgotPassword;
