import * as React from 'react';
import Avatar from '@mui/material/Avatar';
import Button from '@mui/material/Button';
import CssBaseline from '@mui/material/CssBaseline';
import TextField from '@mui/material/TextField';
import FormControlLabel from '@mui/material/FormControlLabel';
import Checkbox from '@mui/material/Checkbox';
import Link from '@mui/material/Link';
import Paper from '@mui/material/Paper';
import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import Typography from '@mui/material/Typography';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import SidePic from '../assets/SidePic.png';
import { InputAdornment } from '@mui/material';
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';


// TODO remove, this demo shouldn't need to reset the theme.

const defaultTheme = createTheme();

export default function Signup() {
    const [showPassword, setShowPassword] = React.useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = React.useState(false);

    const handleClickShowPassword = () => setShowPassword((show) => !show);
    const handleClickShowConfirmPassword = () => setShowConfirmPassword((show) => !show);

    const handleSubmit = (event) => {
        event.preventDefault();
        const data = new FormData(event.currentTarget);
        console.log({
            email: data.get('email'),
            password: data.get('password'),
        });
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
                            {/* name */}

                            <TextField
                                margin='normal'
                                required
                                fullWidth
                                id='name'
                                label='Name'
                                name='name'
                                autoComplete='name'
                                className='focus:outline-green-800'
                            />

                            {/* email */}


                            <TextField
                                margin="normal"
                                required
                                fullWidth
                                id="email"
                                label="Email Address"
                                name="email"
                                autoComplete="email"
                                className='focus:outline-green-800'
                            />
                            {/* phone */}
                            <TextField
                                margin="normal"
                                required
                                fullWidth
                                id="phone"
                                label="Phone"
                                name="phone"
                                autoComplete="phone"
                                className='focus:outline-green-800'
                            />
                            {/* password */}
                            <div className="flex">
                                <TextField
                                    margin="normal"
                                    required
                                    sx={{
                                        marginRight: '0.5rem'
                                    }}
                                    className='w-1/2'
                                    name="password"
                                    label="Password"
                                    type={setShowConfirmPassword ? 'text' : 'password'}
                                    id="password"
                                    autoComplete="current-password"
                                    InputProps={{
                                        endAdornment: <InputAdornment position="end">
                                            {showConfirmPassword ? <VisibilityOff className='cursor-pointer' onClick={handleClickShowPassword} /> : <VisibilityIcon className='cursor-pointer' onClick={handleClickShowConfirmPassword} />}
                                        </InputAdornment>,
                                    }}
                                />
                                {/* confirm password */}
                                <TextField
                                    margin="normal"
                                    required
                                    sx={{
                                        marginRight: '0.5rem'
                                    }}
                                    className='w-1/2'
                                    name="password"
                                    label="Password"
                                    type={showConfirmPassword ? 'text' : 'password'}
                                    id="password"
                                    autoComplete="current-password"
                                    InputProps={{
                                        endAdornment: <InputAdornment position="end">
                                            {showPassword ? <VisibilityOff className='cursor-pointer' onClick={handleClickShowPassword} /> : <VisibilityIcon className='cursor-pointer' onClick={handleClickShowPassword} />}
                                        </InputAdornment>,
                                    }}
                                />
                            </div>
                            <Button
                                type="submit"
                                fullWidth
                                variant="contained"
                                sx={{ mt: 3, mb: 2, backgroundColor: "#2b6030", '&:hover': { backgroundColor: "#1c3d1f" } }}
                            >
                                Sign Up
                            </Button>
                            <Grid container>
                                <Grid item>
                                    Already have an account?&nbsp;
                                    <Link href="/login">
                                        {"Sign In"}
                                    </Link>
                                </Grid>
                            </Grid>
                        </Box>
                    </Box>
                </Grid>
            </Grid>
        </ThemeProvider>
    );
}