import * as React from 'react';
import Button from '@mui/material/Button';
import CssBaseline from '@mui/material/CssBaseline';
import TextField from '@mui/material/TextField';
import FormControlLabel from '@mui/material/FormControlLabel';
import Checkbox from '@mui/material/Checkbox';
import LinkText from '@mui/material/Link';
import Paper from '@mui/material/Paper';
import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import SidePic from '../assets/SidePic.png';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import Cookies from "js-cookie";
import { toast } from 'react-toastify';

function Copyright(props) {
    return (
        <Typography variant="body2" color="text.secondary" align="center" {...props}>
            {'Copyright © '}
            <Link color="inherit" to="https://Glamis.in/">
                Glamis.in
            </Link>{' '}
            {new Date().getFullYear()}
            {'.'}
        </Typography>
    );
}

// TODO remove, this demo shouldn't need to reset the theme.

const defaultTheme = createTheme();

export default function SignInSide() {
    const navigate = useNavigate();
    const [isLoading, setIsLoading] = React.useState(false);
    const [login, setLogin] = React.useState({
        email: '',
        password: '',
        role: "student"
    });

    const handleSubmit = async (event) => {
        event.preventDefault();
        setIsLoading(true);
        if (login.email === '' || login.password === '') {
            toast.error("Please fill all the fields");
            setIsLoading(false);
            return;
        }
        console.log(login);

        // email regexx

        const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/;
        if (!emailRegex.test(login.email)) {
            toast.error("Please enter a valid email");
            setIsLoading(false);
            return;
        }

        try{
            const response = await axios.post(`${import.meta.env.VITE_BACKEND_URL}/api/v1/users/login`, login,
                {
                    headers: {
                        'Content-Type': 'application/json'
                    }
                }
            )

            console.log(response.data);

            if (response.status == 201) {
                Cookies.set('accessToken', response.data.data.accessToken);
                Cookies.set('fullName', response.data.data.userData.name);
                navigate('/dashboard')
                toast.success("Login Successful");
                return;
            }
            else{
                setIsLoading(false);
                console.log(response.status)
                toast.error("USer may be exist");
            }
        }
        catch (error) {
            setIsLoading(false);
            toast.error(error.response.data.message);
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
                                margin="normal"
                                required
                                fullWidth
                                id="email"
                                onChange={(e) => setLogin({ ...login, email: e.target.value })}
                                label="Email Address"
                                name="email"
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
                            />


                            <TextField
                                margin="normal"
                                required
                                fullWidth
                                name="password"
                                onChange={(e) => setLogin({ ...login, password: e.target.value })}
                                label="Password"
                                type="password"
                                id="password"
                                autoComplete="current-password"
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
                            />
                            <FormControlLabel
                                control={<Checkbox value="remember" color="primary" />}
                                label="Remember me"
                            />
                            <Button
                                disabled={isLoading}
                                onClick={handleSubmit}
                                fullWidth
                                variant="contained"
                                sx={{
                                    mt: 3,
                                    mb: 2,
                                    backgroundColor: "#2b6030",
                                    '&:hover': {
                                        backgroundColor: "#17371a"
                                    }
                                }}
                                className='hover:bg-green-800'
                            >
                            <span  className={isLoading ? 'loader' : ''}>{!isLoading ? "Sign In" : ""}</span>
                            </Button>
                            <Grid container className='flex justify-between items-center'>
                                <Grid item>
                                    <Link to="/forgot">
                                      <LinkText>Forgot password?</LinkText>
                                    </Link>
                                </Grid>
                                <Grid item className='text-sm'>
                                    <span>Don't have an account? </span>
                                    <Link to="/">
                                      <LinkText>Sign Up</LinkText>
                                    </Link>
                                </Grid>
                            </Grid>
                            <Copyright sx={{ mt: 5 }} />
                        </Box>
                    </Box>
                </Grid>
            </Grid>
        </ThemeProvider >
    );
}
