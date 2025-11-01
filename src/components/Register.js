import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { toast } from 'react-toastify';
import { useAuth } from '../context/AuthContext';
import emailOtpService from '../services/emailOtpService';
import { Container, Row, Col, Card, Form, Button, Spinner, InputGroup } from 'react-bootstrap';

const Register = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [step, setStep] = useState(1); // 1: Form, 2: OTP Verification
  const [registrationData, setRegistrationData] = useState(null);
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [resendTimer, setResendTimer] = useState(0);
  const [otpSent, setOtpSent] = useState(false);
  
  const { register: registerUser } = useAuth();
  const navigate = useNavigate();
  const otpInputRefs = useRef([]);
  
  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    reset
  } = useForm();

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

  const password = watch('password');

  // Auto-send OTP when step changes to 2
  useEffect(() => {
    if (step === 2 && registrationData && !otpSent) {
      handleSendOTP();
    }
  }, [step, registrationData, otpSent]);

  // Resend timer effect
  useEffect(() => {
    let interval;
    if (resendTimer > 0) {
      interval = setInterval(() => {
        setResendTimer(prev => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [resendTimer]);

  // Handle OTP input changes
  const handleOtpChange = (index, value) => {
    if (value.length > 1) {
      // Handle paste
      const pastedOtp = value.slice(0, 6).split('');
      const newOtp = [...otp];
      pastedOtp.forEach((digit, i) => {
        if (i < 6) newOtp[i] = digit;
      });
      setOtp(newOtp);
      
      // Focus last filled input or last input
      const lastFilledIndex = Math.min(pastedOtp.length - 1, 5);
      otpInputRefs.current[lastFilledIndex]?.focus();
      return;
    }

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // Auto-focus next input
    if (value && index < 5) {
      otpInputRefs.current[index + 1]?.focus();
    }
  };

  // Handle OTP key events
  const handleOtpKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      otpInputRefs.current[index - 1]?.focus();
    }
  };

  // Send OTP to email
  const handleSendOTP = async () => {
    if (!registrationData?.email) {
      toast.error('Email address is required');
      return;
    }

    setIsLoading(true);
    
    try {
      console.log('Sending OTP to email:', registrationData.email);
      
      const result = await emailOtpService.sendOTP(registrationData.email);
      console.log('OTP send result:', result);
      
      if (result.success) {
        toast.success('OTP sent to your email! Please check.');
        setResendTimer(60); // 60 seconds resend timer
        setOtpSent(true); // Enable OTP inputs
      } else {
        toast.error(result.error || 'Failed to send OTP. Please try again.');
        console.error('OTP send failed:', result);
      }
    } catch (error) {
      console.error('Error sending OTP:', error);
      toast.error('Failed to send OTP. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Handle OTP verification and complete registration
  const handleOtpVerification = async () => {
    const otpString = otp.join('');
    
    if (otpString.length !== 6) {
      toast.error('Please enter the complete 6-digit OTP');
      return;
    }

    setIsLoading(true);
    
    try {
      console.log('Verifying OTP:', otpString);
      
      // Verify OTP with email
      const verificationResult = emailOtpService.verifyOTP(registrationData.email, otpString);
      console.log('OTP verification result:', verificationResult);
      
      if (verificationResult.success) {
        console.log('OTP verified, creating user account...');
        
        try {
          // OTP verified - now create user with email/password auth
          const result = await registerUser(registrationData);
          
          console.log('User registration result:', result);
          
          if (result && result.success) {
            toast.success('Registration successful! Email verified!');
            reset();
            navigate('/user/dashboard');
          } else {
            throw new Error(result?.message || 'Registration failed. Please try again.');
          }
        } catch (registrationError) {
          console.error('Error during registration:', registrationError);
          toast.error(registrationError.message || 'Registration failed. Please try again.');
        }
      } else {
        toast.error(verificationResult.error || 'Invalid OTP. Please try again.');
        console.error('OTP verification failed:', verificationResult);
        // Clear OTP on error
        setOtp(['', '', '', '', '', '']);
        setTimeout(() => otpInputRefs.current[0]?.focus(), 100);
      }
    } catch (error) {
      console.error('Error verifying OTP:', error);
      toast.error('Failed to verify OTP. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Handle resend OTP
  const handleResendOtp = async () => {
    if (resendTimer > 0) return;
    
    setIsLoading(true);
    setOtpSent(false);
    setOtp(['', '', '', '', '', '']);
    
    try {
      console.log('Resending OTP to email:', registrationData.email);
      
      const result = await emailOtpService.sendOTP(registrationData.email);
      
      if (result.success) {
        toast.success('OTP resent successfully!');
        setResendTimer(60);
        setOtpSent(true);
        setTimeout(() => otpInputRefs.current[0]?.focus(), 100);
      } else {
        toast.error(result.error || 'Failed to resend OTP');
      }
    } catch (error) {
      console.error('Error resending OTP:', error);
      toast.error('Failed to resend OTP. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const onSubmit = async (data) => {
    setIsLoading(true);
    
    try {
      // Format the data for registration
      const formattedData = {
        email: data.email,
        password: data.password,
        firstName: data.firstName,
        lastName: data.lastName,
        phone: data.phone,
        birthYear: data.birthYear,
        gender: data.gender,
        bloodGroup: data.bloodGroup,
        weight: data.weight,
        height: data.height,
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

      // Store registration data and move to OTP verification
      setRegistrationData(formattedData);
      setStep(2);
      toast.info('Please verify your phone number to complete registration');
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
                  <i className={`bi ${step === 1 ? 'bi-heart-pulse-fill' : 'bi-envelope-fill'}`} style={{ fontSize: '3rem' }}></i>
                </div>
                <h2 className="mb-0 fw-bold">
                  {step === 1 ? 'Join Blood Alert' : 'Verify Your Email'}
                </h2>
                <p className="mb-0 opacity-75">
                  {step === 1 ? 'Be a Life Saver - Register Today' : 'Complete your registration with email OTP verification'}
                </p>
              </Card.Header>

              {/* Registration Form */}
              <Card.Body className="p-4">
                {step === 1 ? (
                  // Step 1: Registration Form
                  <Form onSubmit={handleSubmit(onSubmit)}>
                  <Row>
                    {/* Personal Information Section */}
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
                    <Col md={12} className="mb-3">
                      <Form.Label className="fw-semibold">
                        Email Address <span className="text-danger">*</span>
                      </Form.Label>
                      <Form.Control
                        type="email"
                        placeholder="Enter your email (for information only)"
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
                        Email is used for communication only, not for login
                      </Form.Text>
                    </Col>

                    {/* Username */}
                    <Col md={6} className="mb-3">
                      <Form.Label className="fw-semibold">
                        Username <span className="text-danger">*</span>
                      </Form.Label>
                      <Form.Control
                        type="text"
                        placeholder="Choose a unique username"
                        {...register('username', {
                          required: 'Username is required',
                          minLength: { value: 4, message: 'Username must be at least 4 characters' },
                          maxLength: { value: 20, message: 'Username must be less than 20 characters' },
                          pattern: {
                            value: /^[a-zA-Z0-9_]+$/,
                            message: 'Username can only contain letters, numbers, and underscores'
                          }
                        })}
                        isInvalid={!!errors.username}
                      />
                      <Form.Control.Feedback type="invalid">
                        {errors.username?.message}
                      </Form.Control.Feedback>
                      <Form.Text className="text-muted">
                        <i className="bi bi-info-circle me-1"></i>
                        You'll use this username to login
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
                      <Form.Text className="text-muted">
                        <i className="bi bi-info-circle me-1"></i>
                        You'll receive OTP on this number for verification
                      </Form.Text>
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

                    {/* Weight */}
                    <Col md={6} className="mb-3">
                      <Form.Label className="fw-semibold">
                        Weight (kg) <span className="text-danger">*</span>
                      </Form.Label>
                      <Form.Control
                        type="number"
                        min="30"
                        max="300"
                        placeholder="e.g., 70"
                        {...register('weight', {
                          required: 'Weight is required',
                          min: { value: 30, message: 'Weight must be at least 30 kg' },
                          max: { value: 300, message: 'Weight must be less than 300 kg' }
                        })}
                        isInvalid={!!errors.weight}
                      />
                      <Form.Control.Feedback type="invalid">
                        {errors.weight?.message}
                      </Form.Control.Feedback>
                    </Col>

                    {/* Height */}
                    <Col md={6} className="mb-3">
                      <Form.Label className="fw-semibold">
                        Height (cm) <span className="text-danger">*</span>
                      </Form.Label>
                      <Form.Control
                        type="number"
                        min="100"
                        max="250"
                        placeholder="e.g., 175"
                        {...register('height', {
                          required: 'Height is required',
                          min: { value: 100, message: 'Height must be at least 100 cm' },
                          max: { value: 250, message: 'Height must be less than 250 cm' }
                        })}
                        isInvalid={!!errors.height}
                      />
                      <Form.Control.Feedback type="invalid">
                        {errors.height?.message}
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

                    {/* User Type */}
                    <Col md={12} className="mt-4">
                      <h5 className="text-danger fw-bold mb-3 border-bottom pb-2">
                        <i className="bi bi-person-badge-fill me-2"></i>Registration Type
                      </h5>
                    </Col>

                    <Col md={6} className="mb-3">
                      <div className="alert alert-info">
                        <i className="bi bi-info-circle me-2"></i>
                        <strong>Note:</strong> You can both donate and request blood as needed.
                      </div>
                    </Col>

                    {/* Emergency Contact Section */}
                    <Col md={12} className="mt-4">
                      <h5 className="text-danger fw-bold mb-3 border-bottom pb-2">
                        <i className="bi bi-telephone-fill me-2"></i>Emergency Contact
                      </h5>
                    </Col>

                    {/* Emergency Contact Name */}
                    <Col md={6} className="mb-3">
                      <Form.Label className="fw-semibold">Emergency Contact Name</Form.Label>
                      <Form.Control
                        type="text"
                        placeholder="Enter emergency contact name"
                        {...register('emergencyContact')}
                      />
                    </Col>

                    {/* Emergency Contact Phone */}
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
                    <Col md={12} className="mt-4">
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
                              value: 6,
                              message: 'Password must be at least 6 characters'
                            },
                            pattern: {
                              value: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
                              message: 'Password must contain at least one uppercase letter, one lowercase letter, and one number'
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
                    <Col md={12} className="mt-4">
                      <h5 className="text-danger fw-bold mb-3 border-bottom pb-2">
                        <i className="bi bi-info-circle-fill me-2"></i>Additional Information
                      </h5>
                    </Col>

                    {/* Medical Conditions */}
                    <Col md={6} className="mb-3">
                      <Form.Label className="fw-semibold">Medical Conditions (if any)</Form.Label>
                      <Form.Control
                        as="textarea"
                        rows={2}
                        placeholder="Enter any medical conditions or medications"
                        {...register('medicalConditions')}
                      />
                    </Col>

                    {/* Last Donation Date */}
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
                    <Col md={12} className="mt-4">
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

                    {/* Login Link */}
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
                  // Step 2: OTP Verification
                  <div>
                    <div className="text-center mb-4">
                      <div className="text-success mb-2">
                        <i className="bi bi-phone-fill" style={{ fontSize: '2rem' }}></i>
                      </div>
                      <h5>Verify Your Phone Number</h5>
                      <p className="text-muted">
                        We've sent a 6-digit code to <strong>{registrationData?.phone}</strong>
                      </p>
                    </div>

                    {/* OTP Input */}
                    <div className="d-flex justify-content-center gap-2 mb-4">
                      {otp.map((digit, index) => (
                        <Form.Control
                          key={index}
                          ref={(ref) => (otpInputRefs.current[index] = ref)}
                          type="text"
                          value={digit}
                          onChange={(e) => handleOtpChange(index, e.target.value)}
                          onKeyDown={(e) => handleOtpKeyDown(index, e)}
                          className="text-center fw-bold"
                          style={{ width: '50px', height: '50px', fontSize: '20px' }}
                          maxLength={6}
                          disabled={!otpSent}
                        />
                      ))}
                    </div>

                    <Button
                      variant="danger"
                      size="lg"
                      className="w-100 mb-3"
                      onClick={handleOtpVerification}
                      disabled={isLoading || otp.join('').length !== 6 || !otpSent}
                    >
                      {isLoading ? (
                        <>
                          <Spinner animation="border" size="sm" className="me-2" />
                          Verifying & Creating Account...
                        </>
                      ) : (
                        <>
                          <i className="bi bi-check-circle me-2"></i>
                          Verify & Complete Registration
                        </>
                      )}
                    </Button>

                    {/* Resend OTP */}
                    <div className="text-center">
                      {resendTimer > 0 ? (
                        <p className="text-muted">
                          Resend code in {resendTimer} seconds
                        </p>
                      ) : (
                        <>
                          <p className="text-muted mb-2">Didn't receive the code?</p>
                          <Button
                            variant="outline-danger"
                            size="sm"
                            onClick={handleResendOtp}
                            disabled={isLoading}
                          >
                            <i className="bi bi-arrow-clockwise me-1"></i>
                            Resend Code
                          </Button>
                        </>
                      )}
                    </div>

                    <div className="text-center mt-3">
                      <Button
                        variant="link"
                        onClick={() => {
                          setStep(1);
                          setOtp(['', '', '', '', '', '']);
                          setOtpSent(false);
                        }}
                        className="text-decoration-none"
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
