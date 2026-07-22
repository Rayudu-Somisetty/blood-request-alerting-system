import React, { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { toast } from 'react-toastify';
import { useAuth } from '../context/AuthContext';
import emailVerificationService from '../firebase/emailVerificationService';

import { Container, Row, Col, Card, Form, Button, Spinner } from 'react-bootstrap';


const Register = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [step, setStep] = useState(1); // 1: Form, 2: Email Verification
  const [registrationData, setRegistrationData] = useState(null);
  const [resendTimer, setResendTimer] = useState(0);
  const [verificationSent, setVerificationSent] = useState(false);

  const { register: registerUser } = useAuth();
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    reset,
    trigger
  } = useForm({
    mode: 'onChange',
    reValidateMode: 'onChange'
  });

  // Blood groups for dropdown
  const bloodGroups = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

  // Indian states for dropdown
  const indianStates = [
    'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh',
    'Goa', 'Gujarat', 'Haryana', 'Himachal Pradesh', 'Jharkhand', 'Karnataka',
    'Kerala', 'Madhya Pradesh', 'Maharashtra', 'Manipur', 'Meghalaya', 'Mizoram',
    'Nagaland', 'Odisha', 'Punjab', 'Rajasthan', 'Sikkim', 'Tamil Nadu',
    'Telangana', 'Tripura', 'Uttar Pradesh', 'Uttarakhand', 'West Bengal',
    'Delhi', 'Jammu and Kashmir', 'Ladakh', 'Puducherry', 'Chandigarh',
    'Dadra and Nagar Haveli and Daman and Diu', 'Lakshadweep', 'Andaman and Nicobar Islands'
  ];

  const password = watch('password', '');
  const passwordRequirements = [
    { label: 'At least 8 characters', met: password.length >= 8 },
    { label: 'One uppercase letter', met: /[A-Z]/.test(password) },
    { label: 'One lowercase letter', met: /[a-z]/.test(password) },
    { label: 'One number', met: /\d/.test(password) },
    { label: 'One special character', met: /[^A-Za-z0-9]/.test(password) }
  ];

  useEffect(() => {
    if (password) trigger('confirmPassword');
  }, [password, trigger]);

  // Countdown timer for resend button
  useEffect(() => {
    let interval;
    if (resendTimer > 0) {
      interval = setInterval(() => {
        setResendTimer(prev => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [resendTimer]);

  // Send Firebase email verification to the user's real email
  const handleSendVerificationEmail = useCallback(async () => {
    if (!registrationData?.email) {
      toast.error('Email address is required');
      return;
    }

    setIsLoading(true);
    try {
      // Create the Firebase Auth account with the real email and sign in
      await registerUser(registrationData);

      // Send Firebase's built-in verification email to the user's real email
      await emailVerificationService.sendVerificationEmail();

      toast.success(`Verification email sent to ${registrationData.email}. Please check your inbox.`);
      setResendTimer(60);
      setVerificationSent(true);
    } catch (error) {
      console.error('Error sending email verification:', error);
      toast.error(error.message || 'Failed to send verification email. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }, [registrationData, registerUser]);

  // Auto-send verification email when entering step 2
  useEffect(() => {
    if (step === 2 && registrationData && !verificationSent) {
      handleSendVerificationEmail();
    }
  }, [step, registrationData, verificationSent, handleSendVerificationEmail]);

  // Poll / check if user has clicked the verification link in their email
  const handleCheckVerification = async () => {
    setIsLoading(true);
    try {
      // Reload the Firebase user to get the latest emailVerified flag
      await emailVerificationService.reloadCurrentUser();
      const verified = await emailVerificationService.isEmailVerified();

      if (!verified) {
        toast.warning('Email not verified yet. Please click the link in the email we sent you, then try again.');
        return;
      }

      toast.success('Email verified! Registration complete 🎉');
      reset();
      navigate('/user/dashboard');
    } catch (error) {
      console.error('Email verification check error:', error);
      toast.error(error.message || 'Failed to check verification status. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Resend verification email
  const handleResendEmail = async () => {
    if (resendTimer > 0) return;

    setIsLoading(true);
    try {
      await emailVerificationService.sendVerificationEmail();
      toast.success('Verification email resent! Please check your inbox.');
      setResendTimer(60);
    } catch (error) {
      console.error('Error resending verification email:', error);
      toast.error('Failed to resend verification email. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const onSubmit = async (data) => {
    setIsLoading(true);

    try {
      // Format registration data (no username)
      const formattedData = {
        email: data.email,
        password: data.password,
        firstName: data.firstName,
        lastName: data.lastName,
        phone: data.phone,
        birthYear: data.birthYear,
        gender: data.gender,
        bloodGroup: data.bloodGroup,
        address: data.address,
        city: data.city,
        state: data.state,
        pincode: data.pincode,
        userType: 'user',
        role: 'user',
        emergencyContact: data.emergencyContact,
        emergencyPhone: data.emergencyPhone,
        medicalConditions: data.medicalConditions || '',
        lastDonationDate: data.lastDonationDate || null,
        consentToContact: data.consentToContact || false,
        termsAccepted: data.termsAccepted
      };

      // Store registration data and move to email verification step
      setRegistrationData(formattedData);
      setStep(2);
    } catch (error) {
      console.error('Form submission error:', error);
      toast.error('Please check your information and try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-vh-100 py-5" style={{ background: 'linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)' }}>
      <Container>
        <Row className="justify-content-center">
          <Col lg={8} md={10}>
            <Card className="shadow-lg border-0">
              {/* Header */}
              <Card.Header className="bg-danger text-white text-center py-4">
                <div className="mb-3">
                  <i className={`bi ${step === 1 ? 'bi-heart-pulse-fill' : 'bi-envelope-check-fill'}`} style={{ fontSize: '3rem' }}></i>
                </div>
                <h2 className="mb-0 fw-bold">
                  {step === 1 ? 'Join Blood Alert' : 'Verify Your Email'}
                </h2>
                <p className="mb-0 opacity-75">
                  {step === 1 ? 'Be a Life Saver — Register Today' : 'One last step to complete your registration'}
                </p>
              </Card.Header>

              <Card.Body className="p-4">
                {step === 1 ? (
                  // ─── Step 1: Registration Form ──────────────────────────────────
                  <Form onSubmit={handleSubmit(onSubmit)}>
                    <Row>
                      {/* Personal Information */}
                      <Col md={12}>
                        <h5 className="text-danger fw-bold mb-3 border-bottom pb-2">
                          <i className="bi bi-person-fill me-2"></i>Personal Information
                        </h5>
                      </Col>

                      {/* First Name */}
                      <Col md={6} className="mb-3">
                        <Form.Label className="fw-semibold">
                          First Name <span className="text-danger">*</span>
                        </Form.Label>
                        <Form.Control
                          type="text"
                          placeholder="Enter your first name"
                          {...register('firstName', {
                            required: 'First name is required',
                            minLength: { value: 2, message: 'First name must be at least 2 characters' }
                          })}
                          isInvalid={!!errors.firstName}
                        />
                        <Form.Control.Feedback type="invalid">
                          {errors.firstName?.message}
                        </Form.Control.Feedback>
                      </Col>

                      {/* Last Name */}
                      <Col md={6} className="mb-3">
                        <Form.Label className="fw-semibold">
                          Last Name <span className="text-danger">*</span>
                        </Form.Label>
                        <Form.Control
                          type="text"
                          placeholder="Enter your last name"
                          {...register('lastName', {
                            required: 'Last name is required',
                            minLength: { value: 2, message: 'Last name must be at least 2 characters' }
                          })}
                          isInvalid={!!errors.lastName}
                        />
                        <Form.Control.Feedback type="invalid">
                          {errors.lastName?.message}
                        </Form.Control.Feedback>
                      </Col>

                      {/* Email */}
                      <Col md={6} className="mb-3">
                        <Form.Label className="fw-semibold">
                          Email Address <span className="text-danger">*</span>
                        </Form.Label>
                        <Form.Control
                          type="email"
                          placeholder="Enter your email address"
                          {...register('email', {
                            required: 'Email is required',
                            pattern: {
                              value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                              message: 'Invalid email address'
                            }
                          })}
                          isInvalid={!!errors.email}
                        />
                        <Form.Control.Feedback type="invalid">
                          {errors.email?.message}
                        </Form.Control.Feedback>
                        <Form.Text className="text-muted">
                          <i className="bi bi-info-circle me-1"></i>
                          Used for login and email verification
                        </Form.Text>
                      </Col>

                      {/* Phone */}
                      <Col md={6} className="mb-3">
                        <Form.Label className="fw-semibold">
                          Phone Number <span className="text-danger">*</span>
                        </Form.Label>
                        <Form.Control
                          type="tel"
                          placeholder="Enter 10-digit mobile number"
                          {...register('phone', {
                            required: 'Phone number is required',
                            pattern: {
                              value: /^[0-9]{10}$/,
                              message: 'Please enter a valid 10-digit mobile number'
                            }
                          })}
                          isInvalid={!!errors.phone}
                        />
                        <Form.Control.Feedback type="invalid">
                          {errors.phone?.message}
                        </Form.Control.Feedback>
                      </Col>

                      {/* Birth Year */}
                      <Col md={4} className="mb-3">
                        <Form.Label className="fw-semibold">
                          Birth Year <span className="text-danger">*</span>
                        </Form.Label>
                        <Form.Control
                          type="number"
                          min="1924"
                          max="2006"
                          placeholder="e.g., 1990"
                          {...register('birthYear', {
                            required: 'Birth year is required',
                            validate: (value) => {
                              const age = new Date().getFullYear() - parseInt(value);
                              return age >= 18 || 'You must be at least 18 years old';
                            }
                          })}
                          isInvalid={!!errors.birthYear}
                        />
                        <Form.Control.Feedback type="invalid">
                          {errors.birthYear?.message}
                        </Form.Control.Feedback>
                      </Col>

                      {/* Gender */}
                      <Col md={4} className="mb-3">
                        <Form.Label className="fw-semibold">
                          Gender <span className="text-danger">*</span>
                        </Form.Label>
                        <Form.Select
                          {...register('gender', { required: 'Gender is required' })}
                          isInvalid={!!errors.gender}
                        >
                          <option value="">Select Gender</option>
                          <option value="male">Male</option>
                          <option value="female">Female</option>
                          <option value="other">Other</option>
                        </Form.Select>
                        <Form.Control.Feedback type="invalid">
                          {errors.gender?.message}
                        </Form.Control.Feedback>
                      </Col>

                      {/* Blood Group */}
                      <Col md={4} className="mb-3">
                        <Form.Label className="fw-semibold">
                          Blood Group <span className="text-danger">*</span>
                        </Form.Label>
                        <Form.Select
                          {...register('bloodGroup', { required: 'Blood group is required' })}
                          isInvalid={!!errors.bloodGroup}
                        >
                          <option value="">Select Blood Group</option>
                          {bloodGroups.map((group) => (
                            <option key={group} value={group}>
                              {group}
                            </option>
                          ))}
                        </Form.Select>
                        <Form.Control.Feedback type="invalid">
                          {errors.bloodGroup?.message}
                        </Form.Control.Feedback>
                      </Col>

                      {/* Address Section */}
                      <Col md={12} className="mt-4">
                        <h5 className="text-danger fw-bold mb-3 border-bottom pb-2">
                          <i className="bi bi-house-fill me-2"></i>Address Information
                        </h5>
                      </Col>

                      {/* Address */}
                      <Col md={12} className="mb-3">
                        <Form.Label className="fw-semibold">
                          Address <span className="text-danger">*</span>
                        </Form.Label>
                        <Form.Control
                          as="textarea"
                          rows={2}
                          placeholder="Enter your complete address"
                          {...register('address', { required: 'Address is required' })}
                          isInvalid={!!errors.address}
                        />
                        <Form.Control.Feedback type="invalid">
                          {errors.address?.message}
                        </Form.Control.Feedback>
                      </Col>

                      {/* City */}
                      <Col md={4} className="mb-3">
                        <Form.Label className="fw-semibold">
                          City <span className="text-danger">*</span>
                        </Form.Label>
                        <Form.Control
                          type="text"
                          placeholder="Enter your city"
                          {...register('city', { required: 'City is required' })}
                          isInvalid={!!errors.city}
                        />
                        <Form.Control.Feedback type="invalid">
                          {errors.city?.message}
                        </Form.Control.Feedback>
                      </Col>

                      {/* State */}
                      <Col md={4} className="mb-3">
                        <Form.Label className="fw-semibold">
                          State <span className="text-danger">*</span>
                        </Form.Label>
                        <Form.Select
                          {...register('state', { required: 'State is required' })}
                          isInvalid={!!errors.state}
                        >
                          <option value="">Select State</option>
                          {indianStates.map((state) => (
                            <option key={state} value={state}>
                              {state}
                            </option>
                          ))}
                        </Form.Select>
                        <Form.Control.Feedback type="invalid">
                          {errors.state?.message}
                        </Form.Control.Feedback>
                      </Col>

                      {/* PIN Code */}
                      <Col md={4} className="mb-3">
                        <Form.Label className="fw-semibold">
                          PIN Code <span className="text-danger">*</span>
                        </Form.Label>
                        <Form.Control
                          type="text"
                          placeholder="Enter PIN code"
                          {...register('pincode', {
                            required: 'PIN code is required',
                            pattern: {
                              value: /^[1-9][0-9]{5}$/,
                              message: 'Invalid PIN code'
                            }
                          })}
                          isInvalid={!!errors.pincode}
                        />
                        <Form.Control.Feedback type="invalid">
                          {errors.pincode?.message}
                        </Form.Control.Feedback>
                      </Col>

                      {/* Info note */}
                      <Col md={12} className="mt-2 mb-2">
                        <div className="alert alert-info py-2">
                          <i className="bi bi-info-circle me-2"></i>
                          <strong>Note:</strong> You can both donate and request blood as needed.
                        </div>
                      </Col>

                      {/* Emergency Contact Section */}
                      <Col md={12} className="mt-3">
                        <h5 className="text-danger fw-bold mb-3 border-bottom pb-2">
                          <i className="bi bi-telephone-fill me-2"></i>Emergency Contact
                        </h5>
                      </Col>

                      <Col md={6} className="mb-3">
                        <Form.Label className="fw-semibold">Emergency Contact Name</Form.Label>
                        <Form.Control
                          type="text"
                          placeholder="Enter emergency contact name"
                          {...register('emergencyContact')}
                        />
                      </Col>

                      <Col md={6} className="mb-3">
                        <Form.Label className="fw-semibold">Emergency Contact Phone</Form.Label>
                        <Form.Control
                          type="tel"
                          placeholder="Enter emergency contact phone"
                          {...register('emergencyPhone', {
                            pattern: {
                              value: /^[+]?[0-9]{10,15}$/,
                              message: 'Invalid phone number'
                            }
                          })}
                          isInvalid={!!errors.emergencyPhone}
                        />
                        <Form.Control.Feedback type="invalid">
                          {errors.emergencyPhone?.message}
                        </Form.Control.Feedback>
                      </Col>

                      {/* Password Section */}
                      <Col md={12} className="mt-3">
                        <h5 className="text-danger fw-bold mb-3 border-bottom pb-2">
                          <i className="bi bi-shield-lock-fill me-2"></i>Account Security
                        </h5>
                      </Col>

                      {/* Password */}
                      <Col md={6} className="mb-3">
                        <Form.Label className="fw-semibold">
                          Password <span className="text-danger">*</span>
                        </Form.Label>
                        <div className="input-group">
                          <Form.Control
                            type={showPassword ? 'text' : 'password'}
                            placeholder="Enter your password"
                            {...register('password', {
                              required: 'Password is required',
                              minLength: {
                                value: 8,
                                message: 'Password must be at least 8 characters'
                              },
                              pattern: {
                                value: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}$/,
                                message: 'Password does not meet all security requirements'
                              }
                            })}
                            isInvalid={!!errors.password}
                          />
                          <Button
                            variant="outline-secondary"
                            onClick={() => setShowPassword(!showPassword)}
                          >
                            <i className={`bi bi-eye${showPassword ? '-slash' : ''}`}></i>
                          </Button>
                          <Form.Control.Feedback type="invalid">
                            {errors.password?.message}
                          </Form.Control.Feedback>
                        </div>
                        <div className="mt-2 small" aria-live="polite">
                          {passwordRequirements.map((requirement) => (
                            <div key={requirement.label} className={requirement.met ? 'text-success' : 'text-muted'}>
                              <i className={`bi ${requirement.met ? 'bi-check-circle-fill' : 'bi-circle'} me-2`}></i>
                              {requirement.label}
                            </div>
                          ))}
                        </div>
                      </Col>

                      {/* Confirm Password */}
                      <Col md={6} className="mb-3">
                        <Form.Label className="fw-semibold">
                          Confirm Password <span className="text-danger">*</span>
                        </Form.Label>
                        <div className="input-group">
                          <Form.Control
                            type={showConfirmPassword ? 'text' : 'password'}
                            placeholder="Confirm your password"
                            {...register('confirmPassword', {
                              required: 'Please confirm your password',
                              validate: (value) => value === password || 'Passwords do not match'
                            })}
                            isInvalid={!!errors.confirmPassword}
                          />
                          <Button
                            variant="outline-secondary"
                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          >
                            <i className={`bi bi-eye${showConfirmPassword ? '-slash' : ''}`}></i>
                          </Button>
                          <Form.Control.Feedback type="invalid">
                            {errors.confirmPassword?.message}
                          </Form.Control.Feedback>
                        </div>
                      </Col>

                      {/* Additional Information */}
                      <Col md={12} className="mt-3">
                        <h5 className="text-danger fw-bold mb-3 border-bottom pb-2">
                          <i className="bi bi-info-circle-fill me-2"></i>Additional Information
                        </h5>
                      </Col>

                      <Col md={6} className="mb-3">
                        <Form.Label className="fw-semibold">Medical Conditions (if any)</Form.Label>
                        <Form.Control
                          as="textarea"
                          rows={2}
                          placeholder="Enter any medical conditions or medications"
                          {...register('medicalConditions')}
                        />
                      </Col>

                      <Col md={6} className="mb-3">
                        <Form.Label className="fw-semibold">Last Donation Date</Form.Label>
                        <Form.Control
                          type="date"
                          {...register('lastDonationDate')}
                        />
                        <Form.Text className="text-muted">
                          Leave blank if you haven't donated before
                        </Form.Text>
                      </Col>

                      {/* Consent and Terms */}
                      <Col md={12} className="mt-3">
                        <Form.Check
                          type="checkbox"
                          {...register('consentToContact')}
                          label="I consent to be contacted for blood donation requests"
                          className="mb-3"
                        />

                        <Form.Check
                          type="checkbox"
                          {...register('termsAccepted', { required: 'You must accept the terms and conditions' })}
                          label={
                            <>
                              I agree to the{' '}
                              <Link to="/terms" className="text-decoration-none">
                                Terms and Conditions
                              </Link>{' '}
                              and{' '}
                              <Link to="/privacy" className="text-decoration-none">
                                Privacy Policy
                              </Link>
                              <span className="text-danger"> *</span>
                            </>
                          }
                          isInvalid={!!errors.termsAccepted}
                          className="mb-3"
                        />
                        {errors.termsAccepted && (
                          <div className="text-danger small">
                            {errors.termsAccepted.message}
                          </div>
                        )}
                      </Col>

                      {/* Submit Button */}
                      <Col md={12} className="mt-4">
                        <Button
                          type="submit"
                          variant="danger"
                          size="lg"
                          className="w-100 py-3 fw-bold"
                          disabled={isLoading}
                        >
                          {isLoading ? (
                            <>
                              <Spinner animation="border" size="sm" className="me-2" />
                              Creating Your Account...
                            </>
                          ) : (
                            <>
                              <i className="bi bi-person-plus me-2"></i>
                              Create Account
                            </>
                          )}
                        </Button>
                      </Col>

                      <Col md={12} className="mt-3 text-center">
                        <p className="mb-0">
                          Already have an account?{' '}
                          <Link to="/login" className="text-decoration-none fw-bold">
                            Sign In Here
                          </Link>
                        </p>
                      </Col>
                    </Row>
                  </Form>
                ) : (
                  // ─── Step 2: Email Verification ────────────────────────────────
                  <div className="text-center py-3">

                    {/* Icon */}
                    <div className="mb-4">
                      <div
                        style={{
                          width: 80,
                          height: 80,
                          borderRadius: '50%',
                          background: 'linear-gradient(135deg, #dc3545, #c0392b)',
                          display: 'inline-flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          boxShadow: '0 4px 20px rgba(220,53,69,0.35)'
                        }}
                      >
                        <i className="bi bi-envelope-at-fill text-white" style={{ fontSize: '2.2rem' }}></i>
                      </div>
                    </div>

                    <h4 className="fw-bold mb-2">Check Your Email</h4>
                    <p className="text-muted mb-1">We've sent a verification link to:</p>
                    <p className="fw-semibold fs-6 text-danger mb-4">
                      {registrationData?.email}
                    </p>

                    {/* Instructions */}
                    <div className="alert alert-light border text-start mb-4">
                      <ol className="mb-0 ps-3">
                        <li className="mb-2">Open the email from <strong>Blood Alert</strong> in your inbox</li>
                        <li className="mb-2">Click the <strong>"Verify Email"</strong> link in the email</li>
                        <li>Come back here and click <strong>"I've Verified My Email"</strong></li>
                      </ol>
                    </div>

                    {/* Check spam note */}
                    <p className="text-muted small mb-4">
                      <i className="bi bi-exclamation-triangle me-1 text-warning"></i>
                      Can't find the email? Check your <strong>spam / junk</strong> folder.
                    </p>

                    {/* Verify button */}
                    <Button
                      variant="danger"
                      size="lg"
                      className="w-100 mb-3 py-3 fw-bold"
                      onClick={handleCheckVerification}
                      disabled={isLoading || !verificationSent}
                    >
                      {isLoading ? (
                        <>
                          <Spinner animation="border" size="sm" className="me-2" />
                          Checking Verification...
                        </>
                      ) : (
                        <>
                          <i className="bi bi-check-circle me-2"></i>
                          I've Verified My Email
                        </>
                      )}
                    </Button>

                    {/* Resend button */}
                    {resendTimer > 0 ? (
                      <p className="text-muted small">
                        Resend available in <strong>{resendTimer}s</strong>
                      </p>
                    ) : (
                      <Button
                        variant="outline-secondary"
                        size="sm"
                        onClick={handleResendEmail}
                        disabled={isLoading}
                      >
                        <i className="bi bi-arrow-clockwise me-1"></i>
                        Resend Verification Email
                      </Button>
                    )}

                    {/* Back link */}
                    <div className="mt-4">
                      <Button
                        variant="link"
                        className="text-muted text-decoration-none small"
                        onClick={() => {
                          setStep(1);
                          setVerificationSent(false);
                        }}
                      >
                        <i className="bi bi-arrow-left me-1"></i>
                        Back to Registration Form
                      </Button>
                    </div>
                  </div>
                )}
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>
    </div>
  );
};

export default Register;
