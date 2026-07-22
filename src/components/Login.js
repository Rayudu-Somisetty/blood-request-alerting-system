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
    <div className="min-vh-100 d-flex align-items-stretch" style={{ background: '#f4f6f9' }}>
      <div className="row g-0 w-100">
        {/* Left Visual Column - Hidden on mobile, visible on desktop (md and up) */}
        <div className="col-md-6 d-none d-md-flex flex-column justify-content-between p-5 text-white"
          style={{
            background: 'linear-gradient(135deg, #b31010 0%, #800a0a 100%)',
            position: 'relative',
            overflow: 'hidden'
          }}>
          {/* Decorative Background Pattern */}
          <div style={{
            position: 'absolute',
            top: 0, left: 0, right: 0, bottom: 0,
            backgroundImage: 'radial-gradient(circle at 20% 30%, rgba(255,255,255,0.08) 0%, transparent 50%), radial-gradient(circle at 80% 70%, rgba(255,255,255,0.05) 0%, transparent 40%)',
            pointerEvents: 'none'
          }}></div>

          {/* Top Logo */}
          <div className="d-flex align-items-center mb-5" style={{ zIndex: 2 }}>
            <div className="bg-white rounded-circle p-2 d-flex align-items-center justify-content-center me-3 shadow-sm" style={{ width: '45px', height: '45px' }}>
              <i className="bi bi-heart-pulse-fill text-danger fs-4"></i>
            </div>
            <span className="fs-4 fw-bold tracking-wider">BLOOD ALERT</span>
          </div>

          <div className="my-auto" style={{ zIndex: 2, maxWidth: '420px' }}>
            <span className="badge rounded-pill bg-white bg-opacity-15 px-3 py-2 mb-4">Welcome back</span>
            <h1 className="display-5 fw-bold mb-3" style={{ lineHeight: '1.2' }}>
              Help is only a<br /><span style={{ color: '#ffcdd2' }}>few clicks away.</span>
            </h1>
            <p className="lead opacity-75 mb-0">
              Sign in to manage blood requests and respond when your community needs you.
            </p>
          </div>

          {/* Bottom Footer */}
          <div className="mt-5 opacity-75" style={{ zIndex: 2 }}>
            <small>© 2026 Blood Alert System. All rights reserved.</small>
          </div>
        </div>

        {/* Right Form Column */}
        <div className="col-md-6 d-flex align-items-center justify-content-center p-4 p-md-5 bg-white">
          <div className="w-100" style={{ maxWidth: '420px' }}>
            {/* Mobile Header - Visible only on mobile */}
            <div className="d-md-none text-center mb-4">
              <div className="bg-danger rounded-circle p-3 d-inline-flex align-items-center justify-content-center mb-3 shadow" style={{ width: '70px', height: '70px' }}>
                <i className="bi bi-heart-pulse-fill text-white fs-2"></i>
              </div>
              <h2 className="fw-bold text-dark mb-1">Blood Alert</h2>
              <p className="text-muted mb-0">Blood Request Alerting System</p>
            </div>

            <div className="mb-4 d-none d-md-block">
              <h2 className="fw-bold text-dark mb-1">Welcome Back</h2>
              <p className="text-muted mb-0">Sign in to continue.</p>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="mt-2">
              {/* Email Field */}
              <div className="form-group mb-4">
                <label className="form-label text-secondary fw-semibold mb-2">
                  <i className="bi bi-envelope me-2 text-danger"></i>
                  Email Address
                </label>
                <input
                  type="email"
                  className={`form-control form-control-lg border-2 ${errors.email ? 'is-invalid' : ''}`}
                  style={{ borderRadius: '10px', fontSize: '1rem', transition: 'all 0.2s' }}
                  placeholder="name@example.com"
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
              <div className="form-group mb-4">
                <div className="d-flex justify-content-between mb-2">
                  <label className="form-label text-secondary fw-semibold mb-0">
                    <i className="bi bi-lock me-2 text-danger"></i>
                    Password
                  </label>
                  <Link to="/forgot-password" className="small text-decoration-none text-danger fw-semibold">
                    Forgot Password?
                  </Link>
                </div>
                <div className="input-group">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    className={`form-control form-control-lg border-2 ${errors.password ? 'is-invalid' : ''}`}
                    style={{ borderRadius: '10px 0 0 10px', fontSize: '1rem', borderRight: '0' }}
                    placeholder="••••••••"
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
                    className="btn btn-outline-secondary border-2 px-3"
                    style={{ borderRadius: '0 10px 10px 0' }}
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
              <div className="form-check mb-4 d-flex align-items-center">
                <input
                  className="form-check-input me-2"
                  type="checkbox"
                  id="rememberMe"
                  style={{ width: '18px', height: '18px', cursor: 'pointer' }}
                  {...register('rememberMe')}
                />
                <label className="form-check-label text-secondary" htmlFor="rememberMe" style={{ cursor: 'pointer', userSelect: 'none' }}>
                  Keep me signed in
                </label>
              </div>

              {/* Login Button */}
              <button
                type="submit"
                className="btn btn-danger btn-lg w-100 py-3 fw-bold mb-4"
                style={{ borderRadius: '10px', transition: 'all 0.2s', boxShadow: '0 4px 15px rgba(220, 53, 69, 0.2)' }}
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
              <div className="text-center">
                <span className="text-secondary">Don't have an account? </span>
                <Link
                  to="/register"
                  className="text-decoration-none text-danger fw-bold ms-1"
                >
                  Register here
                </Link>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
