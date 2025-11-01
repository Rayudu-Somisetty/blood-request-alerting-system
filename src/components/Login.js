import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { toast } from 'react-toastify';
import { useAuth } from '../context/AuthContext';

const Login = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const { login } = useAuth();
  
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();

  const onSubmit = async (data) => {
    setIsLoading(true);
    
    try {
      const result = await login(data);
      if (result && result.success) {
        // Success message will be shown via the PublicRoute redirect logic
        // No need to manually navigate here, PublicRoute will handle the redirect
        toast.success('Login successful!');
      } else {
        toast.error('Invalid credentials. Please try again.');
      }
    } catch (error) {
      console.error('Login error:', error);
      toast.error('Login failed. Please check your credentials.');
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
                  <i className="bi bi-heart-pulse-fill" style={{ fontSize: '3rem' }}></i>
                </div>
                <h2 className="mb-0 fw-bold">Blood Alert</h2>
                <p className="mb-0 opacity-75">User Portal</p>
              </div>

              {/* Login Form */}
              <div className="card-body p-4">
                <h4 className="text-center mb-4 text-red fw-bold">Welcome Back</h4>
                
                <form onSubmit={handleSubmit(onSubmit)}>
                  {/* Email Field */}
                  <div className="form-group mb-3">
                    <label className="form-label text-dark fw-semibold">
                      <i className="bi bi-envelope me-2 text-red"></i>
                      Email Address
                    </label>
                    <input
                      type="email"
                      className={`form-control custom-form-control ${errors.email ? 'is-invalid' : ''}`}
                      placeholder="Enter your email"
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

                  {/* Password Field */}
                  <div className="form-group mb-3">
                    <label className="form-label text-dark fw-semibold">
                      <i className="bi bi-lock me-2 text-red"></i>
                      Password
                    </label>
                    <div className="input-group">
                      <input
                        type={showPassword ? 'text' : 'password'}
                        className={`form-control custom-form-control ${errors.password ? 'is-invalid' : ''}`}
                        placeholder="Enter your password"
                        {...register('password', {
                          required: 'Password is required',
                          minLength: {
                            value: 6,
                            message: 'Password must be at least 6 characters'
                          }
                        })}
                      />
                      <button
                        type="button"
                        className="btn btn-outline-secondary"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        <i className={`bi bi-eye${showPassword ? '-slash' : ''}`}></i>
                      </button>
                      {errors.password && (
                        <div className="invalid-feedback">
                          {errors.password.message}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Remember Me */}
                  <div className="form-check mb-3">
                    <input
                      className="form-check-input"
                      type="checkbox"
                      id="rememberMe"
                      {...register('rememberMe')}
                    />
                    <label className="form-check-label text-secondary" htmlFor="rememberMe">
                      Remember me
                    </label>
                  </div>

                  {/* Login Button */}
                  <button
                    type="submit"
                    className="btn btn-primary w-100 py-2 fw-bold"
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                        Signing In...
                      </>
                    ) : (
                      <>
                        <i className="bi bi-box-arrow-in-right me-2"></i>
                        Sign In
                      </>
                    )}
                  </button>

                  {/* Register Link */}
                  <div className="text-center mt-3">
                    <Link 
                      to="/register" 
                      className="text-decoration-none text-red fw-semibold"
                    >
                      <i className="bi bi-person-plus me-1"></i>
                      Don't have an account? Register here
                    </Link>
                  </div>

                  {/* Forgot Password Link */}
                  <div className="text-center mt-2">
                    <Link 
                      to="/forgot-password" 
                      className="text-decoration-none text-muted"
                    >
                      <i className="bi bi-question-circle me-1"></i>
                      Forgot your password?
                    </Link>
                  </div>
                </form>
              </div>

              {/* Footer */}
              <div className="card-footer bg-light text-center py-3">
                <small className="text-muted">
                  <i className="bi bi-shield-check me-1 text-red"></i>
                  Secure Access Portal
                </small>
              </div>
            </div>


          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
