import * as React from 'react';
import Avatar from '@mui/material/Avatar';
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
import { InputAdornment } from '@mui/material';
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import axios from 'axios';
import { useNavigate } from 'react-router-dom'; // Import useNavigate
import { toast } from 'react-toastify';

const defaultTheme = createTheme();

export default function Signup() {
    const [showPassword, setShowPassword] = React.useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = React.useState(false);
    const [signupData, setSignupData] = React.useState({
        name: '',
        email_id: '',
        phone: '',
        password: '',
        confirm_password: ''
    });
    const [isLoading, setIsLoading] = React.useState(false);
    const navigate = useNavigate(); // Initialize useNavigate

    const handleClickShowPassword = () => setShowPassword((show) => !show);
    const handleClickShowConfirmPassword = () => setShowConfirmPassword((show) => !show);

    const handleSubmit = async (event) => {
        event.preventDefault();
        setIsLoading(true);

        if (signupData.name === '' || signupData.email_id === '' || signupData.phone === '' || signupData.password === '' || signupData.confirm_password === '') {
            toast.error("Please fill all the fields");
            setIsLoading(false);
            return;
        }

        if (signupData.password !== signupData.confirm_password) {
            toast.error("Passwords do not match");
            setIsLoading(false);
            return;
        }

        // email regexx

        const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/;
        if (!emailRegex.test(signupData.email_id)) {
            toast.error("Please enter a valid email");
            setIsLoading(false);
            return;
        }


        try {
            const response = await axios.post(`${import.meta.env.VITE_BACKEND_URL}/api/v1/users/signup`, signupData, {
                headers: {
                    'Content-Type': 'application/json'
                }
            });
            console.log(response.data);
            // Redirect to /account/verification with email_id
            console.log(signupData.email_id);
            setIsLoading(false);
            toast.success("OTP sent successfully on your registered mail id!");
            navigate('/account/verification', { state: { email_id: signupData.email_id } });
        } catch (error) {
            console.error(error);
            setIsLoading(false);
        }
    };

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
                    <img src={SidePic} className='mt-10 p-20' />
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
                        <Box component="form" noValidate onSubmit={handleSubmit} sx={{ mt: 1 }}>
                            <TextField
                                margin='normal'
                                required
                                fullWidth
                                id='name'
                                label='Name'
                                name='name'
                                autoComplete='name'
                                sx={{
                                    '& .MuiInput-underline:after': {
                                        borderBottomColor: '#2b6030',
                                    },
                                    '& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline': {
                                        borderColor: '#2b6030',
                                    },
                                    '& .MuiInputLabel-root.Mui-focused': {
                                        color: '#2b6030',
                                    },
                                }}
                                onChange={(e) => setSignupData({ ...signupData, name: e.target.value })}
                            />
                            <TextField
                                margin="normal"
                                required
                                fullWidth
                                id="email_id"
                                label="Email Address"
                                name="email_id"
                                autoComplete="email"
                                sx={{
                                    '& .MuiInput-underline:after': {
                                        borderBottomColor: '#2b6030',
                                    },
                                    '& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline': {
                                        borderColor: '#2b6030',
                                    },
                                    '& .MuiInputLabel-root.Mui-focused': {
                                        color: '#2b6030',
                                    },
                                }}
                                onChange={(e) => setSignupData({ ...signupData, email_id: e.target.value })}
                            />
                            <TextField
                                margin="normal"
                                required
                                fullWidth
                                id="phone"
                                label="Phone"
                                name="phone"
                                autoComplete="phone"
                                sx={{
                                    '& .MuiInput-underline:after': {
                                        borderBottomColor: '#2b6030',
                                    },
                                    '& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline': {
                                        borderColor: '#2b6030',
                                    },
                                    '& .MuiInputLabel-root.Mui-focused': {
                                        color: '#2b6030',
                                    },
                                }}
                                onChange={(e) => setSignupData({ ...signupData, phone: e.target.value })}
                            />
                            <div className="flex">
                                <TextField
                                    margin="normal"
                                    required
                                    className='w-1/2'
                                    name="password"
                                    label="Password"
                                    type={showPassword ? 'text' : 'password'}
                                    id="password"
                                    autoComplete="current-password"
                                    InputProps={{
                                        endAdornment: <InputAdornment position="end">
                                            {showPassword ? <VisibilityOff className='cursor-pointer' onClick={handleClickShowPassword} /> : <VisibilityIcon className='cursor-pointer' onClick={handleClickShowPassword} />}
                                        </InputAdornment>,
                                    }}
                                    sx={{
                                        '& .MuiInput-underline:after': {
                                            borderBottomColor: '#2b6030',
                                        },
                                        '& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline': {
                                            borderColor: '#2b6030',
                                        },
                                        '& .MuiInputLabel-root.Mui-focused': {
                                            color: '#2b6030',
                                        },
                                        marginRight: '0.5rem'
                                    }}
                                    onChange={(e) => setSignupData({ ...signupData, password: e.target.value })}
                                />
                                <TextField
                                    margin="normal"
                                    required
                                    className='w-1/2'
                                    name="confirm_password"
                                    label="Confirm Password"
                                    type={showConfirmPassword ? 'text' : 'password'}
                                    id="confirm_password"
                                    autoComplete="current-password"
                                    InputProps={{
                                        endAdornment: <InputAdornment position="end">
                                            {showConfirmPassword ? <VisibilityOff className='cursor-pointer' onClick={handleClickShowConfirmPassword} /> : <VisibilityIcon className='cursor-pointer' onClick={handleClickShowConfirmPassword} />}
                                        </InputAdornment>,
                                    }}
                                    sx={{
                                        '& .MuiInput-underline:after': {
                                            borderBottomColor: '#2b6030',
                                        },
                                        '& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline': {
                                            borderColor: '#2b6030',
                                        },
                                        '& .MuiInputLabel-root.Mui-focused': {
                                            color: '#2b6030',
                                        },
                                        marginRight: '0.5rem'
                                    }}
                                    onChange={(e) => setSignupData({ ...signupData, confirm_password: e.target.value })}
                                />
                            </div>
                            <Button
                                type="submit"
                                fullWidth
                                variant="contained"
                                sx={{ mt: 3, mb: 2, backgroundColor: "#2b6030", '&:hover': { backgroundColor: "#1c3d1f" } }}
                                disabled={isLoading}
                            >
                                <span  className={isLoading ? 'loader' : ''}>

                                {!isLoading ? "Sign Up" : ""}
                                </span>
                            </Button>
                            <div className="flex justify-center">
                                <span>Already have an account?&nbsp;</span>
                                <Link href="/login">
                                    {"Sign In"}
                                </Link>
                            </div>
                        </Box>
                    </Box>
                </Grid>
            </Grid>
        </ThemeProvider>
    );
}
