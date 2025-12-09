import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { toast } from 'react-toastify';
import firebaseService from '../firebase/firebaseService';

const ForgotPassword = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  
  const {
    register,
    handleSubmit,
    formState: { errors },
    getValues
  } = useForm();

  const onSubmit = async (data) => {
    setIsLoading(true);
    
    try {
      await firebaseService.resetPassword(data.email);
      setEmailSent(true);
      toast.success('Password reset email sent! Check your inbox.');
    } catch (error) {
      console.error('Password reset error:', error);
      toast.error(error.message || 'Failed to send reset email. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-vh-100 d-flex align-items-center" style={{ background: 'linear-gradient(135deg, #1f2937 0%, #374151 100%)' }}>
      <div className="container">
        <div className="row justify-content-center">
          <div className="col-md-6 col-lg-5">
            <div className="custom-card shadow-lg">
              {/* Header */}
              <div className="custom-card-header text-center">
                <div className="mb-3">
                  <i className="bi bi-key-fill" style={{ fontSize: '3rem' }}></i>
                </div>
                <h2 className="mb-0 fw-bold">Reset Password</h2>
                <p className="mb-0 opacity-75">Blood Alert System</p>
              </div>

              {/* Reset Form */}
              <div className="card-body p-4">
                {!emailSent ? (
                  <>
                    <h5 className="text-center mb-3 text-dark">Forgot Your Password?</h5>
                    <p className="text-muted text-center mb-4">
                      Enter your email address and we'll send you a link to reset your password.
                    </p>
                    
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
                        className="btn btn-primary w-100 py-2 fw-bold"
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
              <div className="card-footer bg-light text-center py-3">
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
