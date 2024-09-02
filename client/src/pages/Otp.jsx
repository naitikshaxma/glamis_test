import * as React from 'react';
import axios from 'axios'; // Import axios for API calls
import Button from '@mui/material/Button';
import CssBaseline from '@mui/material/CssBaseline';
import TextField from '@mui/material/TextField';
import Link from '@mui/material/Link';
import Paper from '@mui/material/Paper';
import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import SidePic from '../assets/SidePic.png';
import { useLocation, useNavigate } from 'react-router-dom'; // Import useLocation and useNavigate
import { toast } from 'react-toastify';

const defaultTheme = createTheme();

export default function Otp() {
    const [isLoading, setIsLoading] = React.useState(false);
    const [otp, setOtp] = React.useState(Array(6).fill(''));
    const location = useLocation(); // Use useLocation hook to access route location
    const navigate = useNavigate(); // Use useNavigate hook for navigation

    const handleChange = (e, index) => {
        const { value } = e.target;
        const newOtp = [...otp];
        newOtp[index] = value;
        setOtp(newOtp);

        if (value.length === 1 && index < 5) {
            const nextSibling = document.getElementById(`otp${index + 2}`);
            if (nextSibling) {
                nextSibling.focus();
            }
        }

        if (value.length === 0 && e.nativeEvent.inputType === 'deleteContentBackward' && index > 0) {
            const previousSibling = document.getElementById(`otp${index}`);
            if (previousSibling) {
                previousSibling.focus();
            }
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);

        if (otp.includes('')) {
            toast.error('Please fill all the fields');
            setIsLoading(false);
            return;
        }


        const enteredOtp = otp.join(''); // Combine OTP array into a single string
        console.log(enteredOtp);
        const emailId = location.state?.email_id; // Use location.state to get email ID
        console.log(emailId);

        try {
            const response = await axios.post(`${import.meta.env.VITE_BACKEND_URL}/api/v1/users/verify-email`, {
                email: emailId,
                otp: enteredOtp,
            });

            if (response.data.success) {
                toast.success('OTP verified successfully');
                navigate('/login'); // Redirect to login page on success
            } else {
                toast.error('Invalid OTP. Please try again.');
            }
        } catch (error) {
            console.error('Error verifying OTP:', error);
            toast.error('Something went wrong. Please try again.');
        }

        setIsLoading(false);
    };

    const resendOtp = async () => {
        const emailId = location.state?.email_id; // Use location.state to get email ID
        console.log(emailId);

        try {
            const response = await axios.post(`${import.meta.env.VITE_BACKEND_URL}/api/v1/users/resend-otp`, {
                email: emailId,
            });

            if (response.data.success) {
                toast.success('OTP Re-Sent successfully');
            } else {
                toast.error('Failed to resend OTP. Please try again.');
            }
        } catch (error) {
            console.error('Error resending OTP:', error);
            toast.error('Something went wrong. Please try again')
        }
    }

    return (
        <ThemeProvider theme={defaultTheme}>
            <Grid container component="main" sx={{ height: '100vh' }}>
                <CssBaseline />
                <Grid
                    item
                    xs={false}
                    sm={4}
                    md={5}
                    sx={{
                        backgroundColor: '#2b6030',
                        backgroundRepeat: 'no-repeat',
                        backgroundSize: 'cover',
                        backgroundPosition: 'center',
                    }}
                >
                    <img src={SidePic} className='mt-10 p-20' alt="Side Illustration" />
                </Grid>
                <Grid item xs={12} sm={8} md={7} component={Paper} elevation={6} square>
                    <Box
                        sx={{
                            my: 8,
                            mx: 4,
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                        }}
                    >
                        <img src="https://www.gla.ac.in/info/common/images/mobilelogo.png" alt="GLAMIS" className="h-32 mb-7" />
                        <Typography component="h1" variant="h5" className='font-bold'>
                            Welcome to GLA Mock Interview System
                        </Typography>
                        <Box component="form" noValidate sx={{ mt: 1 }} onSubmit={handleSubmit}>
                            <Grid container spacing={2} justifyContent="center" sx={{ mt: 5, mb: 5 }}>
                                {Array.from({ length: 6 }).map((_, index) => (
                                    <Grid item xs={2} key={index}>
                                        <TextField
                                            variant="outlined"
                                            required
                                            fullWidth
                                            id={`otp${index + 1}`}
                                            name={`otp${index + 1}`}
                                            inputProps={{ maxLength: 1, style: { textAlign: 'center', fontSize: '1.5rem' } }}
                                            autoFocus={index === 0}
                                            onChange={(e) => handleChange(e, index)}
                                            value={otp[index]}
                                        />
                                    </Grid>
                                ))}
                            </Grid>

                            <Button
                                type="submit"
                                fullWidth
                                variant="contained"
                                sx={{ mt: 3, mb: 2, backgroundColor: "#2b6030", '&:hover': { backgroundColor: "#1c3d1f" } }}
                                disabled={isLoading}
                            >
                                {!isLoading ? "Verify OTP" : "Verifying..."}
                            </Button>

                            <div className="flex justify-center">
                                <span>OTP not received? </span>
                                <Button onClick={resendOtp} sx={{ ml: 1 }}>
                                    {"Resend OTP"}
                                </Button>
                            </div>
                        </Box>
                    </Box>
                </Grid>
            </Grid>
        </ThemeProvider>
    );
}
