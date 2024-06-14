import React from 'react';
import {
    MDBBtn,
    MDBContainer,
    MDBRow,
    MDBCol,
    MDBInput
} from 'mdb-react-ui-kit';
import { Link } from 'react-router-dom';
import './signup.css';

function SignupPage() {
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

                        <MDBInput wrapperClass='mb-4' label='Full Name' id='form3' type='text' />
                        <MDBInput wrapperClass='mb-4' label='Email address' id='form4' type='email' />
                        <MDBInput wrapperClass='mb-4' label='Password' id='form5' type='password' />
                        <MDBInput wrapperClass='mb-4' label='Confirm Password' id='form6' type='password' />

                        <div className="text-center pt-1 mb-5 pb-1 w-100">
                            <MDBBtn className="mb-4 w-100 gradient-custom-2">Sign Up</MDBBtn>
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
