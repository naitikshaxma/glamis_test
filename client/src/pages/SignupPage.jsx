import React from 'react';
import {
    MDBBtn,
    MDBContainer,
    MDBRow,
    MDBCol,
    MDBInput
} from 'mdb-react-ui-kit';
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './signup.css';
import axios from 'axios';



function SignupPage() {
    const navigator = useNavigate();
    const [userDetails, setUserDetails] = useState({
        fullName: '',
        email: '',
        phone: '',
        password: '',
        confirmPassword: ''
    });

    const handelSumbit = async (e) => {
        e.preventDefault();
        if(userDetails.password !== userDetails.confirmPassword){
            alert('Password do not match');
            return;
        }
        if(userDetails.fullName === '' || userDetails.email === '' || userDetails.phone === '' || userDetails.password === '' || userDetails.confirmPassword === ''){
            alert('All fields are required');
            return;
        }
        document.getElementById('signup-btn').disabled = true;
        console.log(userDetails);

        const response = await axios.post('http://34.229.95.145:8000/api/v1/users/signup', {
            name: userDetails.fullName,
            email_id: userDetails.email,
            phone: userDetails.phone,
            password: userDetails.password,
            confirm_password: userDetails.confirmPassword
        }, 
        {
            headers: {
                'Content-Type': 'application/json'
            }
        }
        );

        if(response.status === 200){
            alert('Account Created Successfully');
            navigator('/login');
        }
        
    }

    return (
        <MDBContainer fluid className="gradient-form no-margin-padding full-height">
            <MDBRow className="no-margin-padding full-height">
                <MDBCol md='8' className="no-margin-padding order-2 order-md-1 full-height">
                    <div className="d-flex flex-column justify-content-center gradient-custom-2 h-100">
                        <div className="text-white px-3 py-4 p-md-5 mx-md-4">
                            <h4 className="mb-4">Join GLA Mock Interview System</h4>
                            <p className="small mb-0">Unlock your potential with GLA Mock Interview System. Experience personalized skill assessments and feedback to propel your career forward. Sign up now and embark on a journey towards success.</p>
                        </div>
                    </div>
                </MDBCol>

                <MDBCol md='4' className="no-margin-padding order-1 order-md-2">
                    <div className="d-flex flex-column center-content">
                        <div className="text-center">
                            <img src="https://www.gla.ac.in/info/common/images/mobilelogo.png"
                                style={{ width: '185px' }} alt="logo" />
                            <h4 className="mt-1 mb-5 pb-1">Create Your Account</h4>
                        </div>

                        <MDBInput wrapperClass='mb-4' label='Full Name' id='form3' type='text'
                        name='fullName' value={userDetails.fullName} onChange={(e) => setUserDetails({...userDetails, fullName: e.target.value})}
                        />
                        <MDBInput wrapperClass='mb-4' label='Email address' id='form4' type='email'
                        name='email' value={userDetails.email} onChange={(e) => setUserDetails({...userDetails, email: e.target.value})}
                        />
                        <MDBInput wrapperClass='mb-4' label='Phone Number' id='form4' type='tel' 
                        name='phone' value={userDetails.phone} onChange={(e) => setUserDetails({...userDetails, phone: e.target.value})}
                        />
                        <MDBInput wrapperClass='mb-4' label='Password' id='form5' type='password' 
                        name='password' value={userDetails.password} onChange={(e) => setUserDetails({...userDetails, password: e.target.value})}
                        />
                        <MDBInput wrapperClass='mb-4' label='Confirm Password' id='form6' type='password' 
                        name='confirmPassword' value={userDetails.confirmPassword} onChange={(e) => setUserDetails({...userDetails, confirmPassword: e.target.value})}
                        />



                        <div className="text-center pt-1 mb-5 pb-1 w-100">
                            <MDBBtn className="mb-4 w-100 gradient-custom-2"
                            onClick={handelSumbit} id='signup-btn'
                            >Sign Up</MDBBtn>
                        </div>

                        <div className="d-flex flex-row align-items-center justify-content-center pb-4 mb-4 w-100">
                            <p className="mb-0">Already have an account?</p>
                            <Link to='/login'>
                                <MDBBtn outline className='mx-2' color='danger'>
                                    Sign In
                                </MDBBtn>
                            </Link>
                        </div>
                    </div>
                </MDBCol>
            </MDBRow>
        </MDBContainer>
    );
}

export default SignupPage;
