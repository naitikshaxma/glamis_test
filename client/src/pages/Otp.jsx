import * as React from 'react';
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


const defaultTheme = createTheme();
export default function Otp() {
    const [isLoading, setIsLoading] = React.useState(false);
    const [showPassword, setShowPassword] = React.useState(false);
    const [values, setValues] = React.useState({
        password: '',
        showPassword: false,
    });

    const handleChange = (prop) => (event) => {
        setValues({ ...values, [prop]: event.target.value });
    };

    const handleClickShowPassword = () => {
        setValues({ ...values, showPassword: !values.showPassword });
    };

    const handleMouseDownPassword = (event) => {
        event.preventDefault();
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
                        <Box component="form" noValidate  sx={{ mt: 1 }}>
                            {/* 6 boxes for otp in flex */}
                            <div className='flex justify-center my-5 space-x-2 mx-5'>
                                <TextField
                                    variant="outlined"
                                    margin="normal"
                                    required
                                    fullWidth
                                    id="otp1"
                                    name="otp1"
                                    autoFocus
                                    className='mx-2'
                                />
                                <TextField
                                    variant="outlined"
                                    margin="normal"
                                    required
                                    fullWidth
                                    id="otp2"
                                    name="otp2"
                                    className='mx-2'
                                />
                                <TextField
                                    variant="outlined"
                                    margin="normal"
                                    required
                                    fullWidth
                                    id="otp3"
                                    name="otp3"
                                    className='mx-2'
                                />
                                <TextField
                                    variant="outlined"
                                    margin="normal"
                                    required
                                    fullWidth
                                    id="otp4"
                                    name="otp4"
                                    className='mx-2'
                                />
                                <TextField
                                    variant="outlined"
                                    margin="normal"
                                    required
                                    fullWidth
                                    id="otp5"
                                    name="otp5"
                                    className='mx-2'
                                />
                                <TextField
                                    variant="outlined"
                                    margin="normal"
                                    required
                                    fullWidth
                                    id="otp6"
                                    name="otp6"
                                    className='mx-2'
                                />

                            </div>
                           
                            <Button
                                type="submit"
                                fullWidth
                                variant="contained"
                                sx={{ mt: 3, mb: 2, backgroundColor: "#2b6030", '&:hover': { backgroundColor: "#1c3d1f" } }}
                                disabled={isLoading}
                                className={isLoading ? 'loader' : ''}
                            >
                                {!isLoading ? "Verify OTP" : "Verifying..."}
                            </Button>
                            
                            <div className="flex justify-center">
                                <span>OTP not received? ;</span>
                                <Link href="/login">
                                    {"Resend OTP"}
                                </Link>
                            </div>
                        </Box>
                    </Box>
                </Grid>
            </Grid>
        </ThemeProvider>
  )
}
