import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { toast } from 'react-toastify';
import firebaseService from '../firebase/firebaseService';

const ForgotPassword = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const [notRegisteredError, setNotRegisteredError] = useState(false);
  
  const {
    register,
    handleSubmit,
    formState: { errors },
    getValues
  } = useForm();

  const onSubmit = async (data) => {
    setIsLoading(true);
    setNotRegisteredError(false);
    
    try {
      await firebaseService.resetPassword(data.email);
      setEmailSent(true);
      toast.success('Password reset email sent! Check your inbox.');
    } catch (error) {
      console.error('Password reset error:', error);
      if (error.message && error.message.includes('not registered')) {
        setNotRegisteredError(true);
      }
      toast.error(error.message || 'Failed to send reset email. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-vh-100 d-flex align-items-center py-4" style={{ background: 'linear-gradient(135deg, #fff5f5 0%, #f8fafc 52%, #fee2e2 100%)' }}>
      <div className="container">
        <div className="row justify-content-center align-items-stretch g-0 shadow-lg rounded-4 overflow-hidden bg-white" style={{ maxWidth: '980px', margin: '0 auto' }}>
          <div className="col-lg-5 d-none d-lg-flex flex-column justify-content-between text-white p-5" style={{ background: 'linear-gradient(150deg, #991b1b 0%, #dc2626 55%, #f87171 100%)' }}>
            <div>
              <div className="d-flex align-items-center gap-2 mb-4">
                <div className="bg-white text-danger rounded-circle d-inline-flex align-items-center justify-content-center" style={{ width: 42, height: 42 }}>
                  <i className="bi bi-heart-pulse-fill fs-4"></i>
                </div>
                <span className="fw-bold fs-5">Blood Request Alerting System</span>
              </div>
              <h1 className="h2 fw-bold">Your account is safe with us.</h1>
              <p className="opacity-75 mb-4">Reset your password securely, then get back to helping save lives.</p>
            </div>
            <img src="/images/blood-donation-reset-illustration.png" alt="A blood donor being cared for by a healthcare professional" className="img-fluid rounded-4 bg-white" style={{ maxHeight: '400px', objectFit: 'cover', objectPosition: 'center top' }} />
            <small className="opacity-75 mt-4"><i className="bi bi-shield-check me-1"></i>Secure, private, and verified</small>
          </div>
          <div className="col-lg-7">
            <div className="h-100">
              {/* Header */}
              <div className="text-center pt-5 px-4">
                <div className="mb-3">
                  <span className="rounded-circle bg-danger-subtle text-danger d-inline-flex align-items-center justify-content-center" style={{ width: 64, height: 64 }}>
                    <i className="bi bi-key-fill fs-2"></i>
                  </span>
                </div>
                <h2 className="mb-1 fw-bold text-dark">Reset your password</h2>
                <p className="mb-0 text-muted">Blood Request Alerting System</p>
              </div>

              {/* Reset Form */}
              <div className="card-body p-4 p-md-5">
                {!emailSent ? (
                  <>
                    <h5 className="text-center mb-3 text-dark">Forgot Your Password?</h5>
                    <p className="text-muted text-center mb-4">
                      Enter your email address and we'll send you a link to reset your password.
                    </p>
                    
                    {notRegisteredError && (
                      <div className="alert alert-warning border border-warning shadow-sm mb-4 d-flex flex-column align-items-center text-center p-3">
                        <i className="bi bi-person-exclamation text-warning mb-2" style={{ fontSize: '2rem' }}></i>
                        <h6 className="fw-bold mb-1 text-dark">Account Not Found</h6>
                        <p className="small text-muted mb-3">
                          The email address you entered is not registered in our system yet.
                        </p>
                        <Link to="/register" className="btn btn-warning btn-sm w-100 fw-bold py-2 text-dark">
                          <i className="bi bi-person-plus-fill me-2"></i>Create New Account
                        </Link>
                      </div>
                    )}
                    
                    <form onSubmit={handleSubmit(onSubmit)}>
                      {/* Email Field */}
                      <div className="form-group mb-4">
                        <label className="form-label text-dark fw-semibold">
                          <i className="bi bi-envelope me-2 text-red"></i>
                          Email Address
                        </label>
                        <input
                          type="email"
                          className={`form-control custom-form-control ${errors.email ? 'is-invalid' : ''}`}
                          placeholder="Enter your registered email"
                          {...register('email', {
                            required: 'Email is required',
                            pattern: {
                              value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                              message: 'Invalid email address'
                            }
                          })}
                        />
                        {errors.email && (
                          <div className="invalid-feedback">
                            {errors.email.message}
                          </div>
                        )}
                      </div>

                      {/* Submit Button */}
                      <button
                        type="submit"
                        className="btn btn-danger w-100 py-3 fw-bold"
                        disabled={isLoading}
                      >
                        {isLoading ? (
                          <>
                            <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                            Sending Reset Link...
                          </>
                        ) : (
                          <>
                            <i className="bi bi-send me-2"></i>
                            Send Reset Link
                          </>
                        )}
                      </button>

                      {/* Back to Login */}
                      <div className="text-center mt-3">
                        <Link 
                          to="/login" 
                          className="text-decoration-none text-muted"
                        >
                          <i className="bi bi-arrow-left me-1"></i>
                          Back to Login
                        </Link>
                      </div>
                    </form>
                  </>
                ) : (
                  <div className="text-center py-4">
                    <div className="mb-4">
                      <i className="bi bi-check-circle-fill text-success" style={{ fontSize: '4rem' }}></i>
                    </div>
                    <h5 className="text-success mb-3">Email Sent Successfully!</h5>
                    <p className="text-muted mb-4">
                      We've sent a password reset link to <strong>{getValues('email')}</strong>
                    </p>
                    <div className="alert alert-info">
                      <i className="bi bi-info-circle me-2"></i>
                      <small>
                        <strong>Next Steps:</strong>
                        <ol className="mb-0 mt-2 text-start">
                          <li>Check your email inbox</li>
                          <li>Click the password reset link</li>
                          <li>Enter your new password</li>
                          <li>Login with your new password</li>
                        </ol>
                      </small>
                    </div>
                    <p className="text-muted small mt-3">
                      Didn't receive the email? Check your spam folder or 
                      <button 
                        className="btn btn-link p-0 ms-1" 
                        onClick={() => setEmailSent(false)}
                      >
                        try again
                      </button>
                    </p>
                    <div className="mt-4">
                      <Link 
                        to="/login" 
                        className="btn btn-outline-primary"
                      >
                        <i className="bi bi-arrow-left me-2"></i>
                        Back to Login
                      </Link>
                    </div>
                  </div>
                )}
              </div>

              {/* Footer */}
              <div className="border-top text-center py-3">
                <small className="text-muted">
                  <i className="bi bi-shield-check me-1 text-red"></i>
                  Secure Password Reset
                </small>
              </div>
            </div>
            </div>
          </div>
        </div>
      </div>
  );
};

export default ForgotPassword;
