import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { toast } from 'react-toastify';
import { useAuth } from '../context/AuthContext';

const Login = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const { login } = useAuth();
  const { register, handleSubmit, formState: { errors } } = useForm({ mode: 'onBlur' });

  const onSubmit = async (data) => {
    setIsLoading(true);
    try {
      const result = await login(data);
      if (result?.success) {
        toast.success('Welcome back!');
      } else {
        toast.error('Invalid email or password.');
      }
    } catch (error) {
      console.error('Login error:', error);
      toast.error('Login failed. Please check your details and try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="min-vh-100">
      <div className="row g-0 min-vh-100">
          <section className="col-lg-5 d-none d-lg-flex flex-column p-5 text-white position-relative overflow-hidden" style={{ background: 'linear-gradient(145deg, #7f1d1d 0%, #b91c1c 48%, #ef4444 100%)' }}>
            <div className="position-absolute rounded-circle bg-white opacity-10" style={{ width: 360, height: 360, right: '-130px', top: '-130px' }}></div>
            <div className="position-absolute rounded-circle border border-white opacity-25" style={{ width: 250, height: 250, left: '-100px', bottom: '90px' }}></div>
            <div className="d-flex align-items-center gap-2 mb-5 position-relative">
              <span className="bg-white text-danger rounded-circle d-inline-flex align-items-center justify-content-center" style={{ width: 44, height: 44 }}>
                <i className="bi bi-heart-pulse-fill fs-4"></i>
              </span>
              <span className="fw-bold fs-4">Blood Alert</span>
            </div>
            <div className="my-auto position-relative" style={{ maxWidth: '460px' }}>
              <span className="badge bg-white bg-opacity-15 rounded-pill px-3 py-2 mb-4">Every donor matters</span>
              <h1 className="display-5 fw-bold mb-3">Be there when your community needs you.</h1>
              <p className="lead opacity-75 mb-4">Receive urgent blood alerts, respond quickly, and make a real difference.</p>
              <div className="d-flex gap-4 pt-2">
                <div><i className="bi bi-bell-fill fs-5 d-block mb-2"></i><small>Urgent alerts</small></div>
                <div><i className="bi bi-heart-pulse-fill fs-5 d-block mb-2"></i><small>Real impact</small></div>
                <div><i className="bi bi-shield-check fs-5 d-block mb-2"></i><small>Secure account</small></div>
              </div>
            </div>
            <div className="position-relative mt-4 text-center">
              <img src="/images/blood-donation-reset-illustration.png" alt="Blood donor and healthcare worker" className="img-fluid rounded-4 shadow" style={{ maxHeight: '245px', objectFit: 'cover', objectPosition: 'center 40%' }} />
            </div>
            <small className="opacity-75 mt-4 position-relative">Blood Request Alerting System</small>
          </section>

          <section className="col-lg-7 d-flex align-items-center justify-content-center p-4 p-md-5 bg-white">
            <div className="w-100" style={{ maxWidth: '450px' }}>
              <div className="d-lg-none text-center mb-4">
                <span className="bg-danger text-white rounded-circle d-inline-flex align-items-center justify-content-center mb-3" style={{ width: 56, height: 56 }}>
                  <i className="bi bi-heart-pulse-fill fs-3"></i>
                </span>
                <h1 className="h3 fw-bold mb-1">Blood Alert</h1>
                <p className="text-muted mb-0">Blood Request Alerting System</p>
              </div>

              <div className="mb-5">
                <p className="text-danger fw-semibold small text-uppercase mb-2">Welcome back</p>
                <h2 className="h2 fw-bold text-dark mb-2">Sign in to your account</h2>
                <p className="text-muted mb-0">Use your registered email address to continue.</p>
              </div>

              <form onSubmit={handleSubmit(onSubmit)} noValidate>
                <div className="mb-3">
                  <label htmlFor="email" className="form-label fw-semibold">Email address</label>
                  <div className="input-group">
                    <span className="input-group-text bg-white text-danger border-end-0"><i className="bi bi-envelope"></i></span>
                    <input
                      id="email"
                      type="email"
                      className={`form-control form-control-lg border-start-0 ${errors.email ? 'is-invalid' : ''}`}
                      placeholder="name@example.com"
                      {...register('email', { required: 'Email is required', pattern: { value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i, message: 'Enter a valid email address' } })}
                    />
                    {errors.email && <div className="invalid-feedback">{errors.email.message}</div>}
                  </div>
                </div>

                <div className="mb-2">
                  <div className="d-flex justify-content-between align-items-center mb-2">
                    <label htmlFor="password" className="form-label fw-semibold mb-0">Password</label>
                    <Link to="/forgot-password" className="small text-danger fw-semibold text-decoration-none">Forgot password?</Link>
                  </div>
                  <div className="input-group">
                    <span className="input-group-text bg-white text-danger border-end-0"><i className="bi bi-lock"></i></span>
                    <input
                      id="password"
                      type={showPassword ? 'text' : 'password'}
                      className={`form-control form-control-lg border-start-0 border-end-0 ${errors.password ? 'is-invalid' : ''}`}
                      placeholder="Enter your password"
                      {...register('password', { required: 'Password is required' })}
                    />
                    <button type="button" className="btn btn-outline-secondary border-start-0" onClick={() => setShowPassword(!showPassword)} aria-label={showPassword ? 'Hide password' : 'Show password'}>
                      <i className={`bi bi-eye${showPassword ? '-slash' : ''}`}></i>
                    </button>
                    {errors.password && <div className="invalid-feedback d-block">{errors.password.message}</div>}
                  </div>
                </div>

                <div className="form-check my-4">
                  <input className="form-check-input" type="checkbox" id="rememberMe" {...register('rememberMe')} />
                  <label className="form-check-label text-muted" htmlFor="rememberMe">Keep me signed in</label>
                </div>

                <button type="submit" className="btn btn-danger btn-lg w-100 py-3 fw-bold" disabled={isLoading}>
                  {isLoading ? <><span className="spinner-border spinner-border-sm me-2" role="status"></span>Signing in...</> : <><i className="bi bi-box-arrow-in-right me-2"></i>Sign in</>}
                </button>
              </form>

              <p className="text-center text-muted mt-4 mb-0">New here? <Link to="/register" className="text-danger fw-bold text-decoration-none">Create an account</Link></p>
            </div>
          </section>
      </div>
    </main>
  );
};

export default Login;
