import React from 'react';
import {
  MDBBtn,
  MDBContainer,
  MDBRow,
  MDBCol,
  MDBInput
} from 'mdb-react-ui-kit';
import { Link } from 'react-router-dom';
import './login.css';

function LoginPage() {
  return (
    <MDBContainer fluid className="gradient-form no-margin-padding full-height">
      <MDBRow className="no-margin-padding full-height">
        <MDBCol md='8' className="no-margin-padding order-2 order-md-1">
          <div className="d-flex flex-column justify-content-center gradient-custom-2 h-100">
            <div className="text-white px-3 py-4 p-md-5 mx-md-4">
              <h4 className="mb-4">We do more than Interviews</h4>
              <p className="small mb-0">Welcome to the GLA Mock Interview System login page, where our AI interviewer swiftly assesses your skills. Upon logging in, our advanced system evaluates your technical abilities and problem-solving skills, providing instant feedback to ensure you're ready for project success. Join us and experience how GLA revolutionizes skill assessment, guiding you towards peak performance from day one.
              </p>
            </div>
          </div>
        </MDBCol>

        <MDBCol md='4' className="no-margin-padding order-1 order-md-2 full-height">
          <div className="d-flex flex-column center-content">
            <div className="text-center">
              <img src="https://www.gla.ac.in/info/common/images/mobilelogo.png"
                style={{ width: '185px' }} alt="logo" />
              <h4 className="mt-1 mb-5 pb-1">Welcome to GLA Mock Interview System</h4>
            </div>

            <p>Please login to your account</p>

            <MDBInput wrapperClass='mb-4' label='Email address' id='form1' type='email' />
            <MDBInput wrapperClass='mb-4' label='Password' id='form2' type='password' />

            <div className="text-center pt-1 mb-5 pb-1 w-100">
              <MDBBtn className="mb-4 w-100 gradient-custom-2">Sign in</MDBBtn>
              <a className="text-muted" href="#!">Forgot password?</a>
            </div>

            <div className="d-flex flex-row align-items-center justify-content-center pb-4 mb-4 w-100">
              <p className="mb-0">Don't have an account?</p>
              <Link to="/">
                <MDBBtn outline className='mx-2' color='danger'>
                  Create New Account
                </MDBBtn>
              </Link>
            </div>
          </div>
        </MDBCol>
      </MDBRow>
    </MDBContainer>
  );
}

export default LoginPage;
