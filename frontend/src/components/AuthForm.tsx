'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useToastContext } from '@/components/ToastProvider';
import { Button, LoadingSpinner } from '@/components/ui';
import { 
  PhoneIcon, 
  EnvelopeIcon, 
  EyeIcon, 
  EyeSlashIcon,
  ArrowLeftIcon
} from '@heroicons/react/24/outline';

interface AuthFormProps {
  onSuccess?: () => void;
  redirectTo?: string;
}

type AuthMode = 'mobile' | 'email';
type AuthStep = 'input' | 'otp' | 'email-password';

export default function AuthForm({ onSuccess, redirectTo = '/' }: AuthFormProps) {
  const router = useRouter();
  const { success, error } = useToastContext();
  
  // Form state
  const [mode, setMode] = useState<AuthMode>('mobile');
  const [step, setStep] = useState<AuthStep>('input');
  const [loading, setLoading] = useState(false);
  const [otpTimer, setOtpTimer] = useState(0);
  
  // Form data
  const [formData, setFormData] = useState({
    mobileNumber: '',
    email: '',
    password: '',
    confirmPassword: '',
    firstName: '',
    lastName: '',
    otp: ''
  });
  const [countryCode, setCountryCode] = useState<string>('+1');

  const countryOptions = [
    { code: 'US', dial: '+1' },
    { code: 'IN', dial: '+91' },
    { code: 'GB', dial: '+44' },
    { code: 'AE', dial: '+971' },
    { code: 'AU', dial: '+61' },
    { code: 'JP', dial: '+81' },
    { code: 'DE', dial: '+49' },
    { code: 'FR', dial: '+33' },
  ];
  
  // UI state
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // OTP timer effect
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (otpTimer > 0) {
      interval = setInterval(() => {
        setOtpTimer(prev => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [otpTimer]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleMobileNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const digitsOnly = e.target.value.replace(/\D/g, '');
    setFormData(prev => ({ ...prev, mobileNumber: digitsOnly }));
  };

  const validateForm = () => {
    if (mode === 'mobile') {
      if (!formData.mobileNumber || formData.mobileNumber.length < 10) {
        error('Validation Error', 'Please enter a valid mobile number');
        return false;
      }
      if (step === 'input' && (!formData.firstName || !formData.lastName)) {
        error('Validation Error', 'First name and last name are required');
        return false;
      }
      if (step === 'otp' && formData.otp.length !== 6) {
        error('Validation Error', 'Please enter the 6-digit OTP');
        return false;
      }
    } else {
      if (!formData.email || !formData.password) {
        error('Validation Error', 'Email and password are required');
        return false;
      }
      if (step === 'input' && formData.password !== formData.confirmPassword) {
        error('Validation Error', 'Passwords do not match');
        return false;
      }
      if (formData.password.length < 6) {
        error('Validation Error', 'Password must be at least 6 characters');
        return false;
      }
    }
    return true;
  };

  const handleSendOTP = async () => {
    if (!validateForm()) return;
    
    setLoading(true);
    try {
      const response = await fetch('/api/auth/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          mobileNumber: formData.mobileNumber,
          // countryCode will be concatenated on server or here if needed
          firstName: formData.firstName,
          lastName: formData.lastName
        })
      });

      const data = await response.json();
      
      if (response.ok) {
        setStep('otp');
        setOtpTimer(300); // 5 minutes
        success('OTP Sent', 'Please check your phone for the verification code');
      } else {
        error('Error', data.message || 'Failed to send OTP');
      }
    } catch (err) {
      error('Network Error', 'Failed to connect to server');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTP = async () => {
    if (!validateForm()) return;
    
    setLoading(true);
    try {
      const response = await fetch('/api/auth/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          mobileNumber: `${countryCode}${formData.mobileNumber}`,
          otp: formData.otp
        })
      });

      const data = await response.json();
      
      if (response.ok) {
        localStorage.setItem('auth_token', data.data.token);
        success('Welcome!', data.data.isNewUser ? 'Account created successfully' : 'Login successful');
        onSuccess?.();
        router.push(redirectTo);
      } else {
        error('Error', data.message || 'Invalid OTP');
      }
    } catch (err) {
      error('Network Error', 'Failed to connect to server');
    } finally {
      setLoading(false);
    }
  };

  const handleEmailAuth = async () => {
    if (!validateForm()) return;
    
    setLoading(true);
    try {
      const endpoint = step === 'input' ? '/api/auth/register' : '/api/auth/login';
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password,
          firstName: formData.firstName,
          lastName: formData.lastName
        })
      });

      const data = await response.json();
      
      if (response.ok) {
        localStorage.setItem('auth_token', data.data.token);
        success('Welcome!', step === 'input' ? 'Account created successfully' : 'Login successful');
        onSuccess?.();
        router.push(redirectTo);
      } else {
        if (response.status === 400 && data.message?.includes('already exists')) {
          // User exists, switch to login
          setStep('email-password');
          error('Account Exists', 'Please log in with your password');
        } else {
          error('Error', data.message || 'Authentication failed');
        }
      }
    } catch (err) {
      error('Network Error', 'Failed to connect to server');
    } finally {
      setLoading(false);
    }
  };

  const handleResendOTP = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/auth/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          mobileNumber: `${countryCode}${formData.mobileNumber}`,
          firstName: formData.firstName,
          lastName: formData.lastName
        })
      });

      if (response.ok) {
        setOtpTimer(300);
        success('OTP Sent', 'New verification code sent');
      } else {
        error('Error', 'Failed to resend OTP');
      }
    } catch (err) {
      error('Network Error', 'Failed to connect to server');
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    if (step === 'otp') {
      setStep('input');
      setOtpTimer(0);
    } else if (step === 'email-password') {
      setStep('input');
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="min-h-screen bg-netflix-black flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="mx-auto mb-4 flex items-center justify-center">
            {typeof window !== 'undefined' && localStorage.getItem('platform_settings') && JSON.parse(localStorage.getItem('platform_settings') as string)?.logoUrl ? (
              <img
                src={JSON.parse(localStorage.getItem('platform_settings') as string)?.logoUrl}
                alt="Logo"
                className="h-12 w-auto object-contain"
                onError={(e) => { (e.target as HTMLImageElement).style.display='none'; }}
              />
            ) : (
              <div className="w-16 h-16 bg-netflix-red rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-2xl">O</span>
              </div>
            )}
          </div>
          <h1 className="text-heading-3 text-white mb-2">
            {step === 'otp' ? 'Verify Your Phone' : 
             step === 'email-password' ? 'Welcome Back' :
             mode === 'mobile' ? 'Get Started' : 'Create Account'}
          </h1>
          <p className="text-body text-netflix-text-gray">
            {step === 'otp' ? `Enter the 6-digit code sent to ${formData.mobileNumber}` :
             step === 'email-password' ? 'Enter your password to continue' :
             mode === 'mobile' ? 'Enter your mobile number to continue' : 
             'Enter your details to create an account'}
          </p>
        </div>

        {/* Back Button */}
        {(step === 'otp' || step === 'email-password') && (
          <button
            onClick={handleBack}
            className="flex items-center text-netflix-text-gray hover:text-white mb-6 transition-colors"
          >
            <ArrowLeftIcon className="w-5 h-5 mr-2" />
            Back
          </button>
        )}

        {/* Mode Toggle */}
        {step === 'input' && (
          <div className="flex bg-netflix-gray rounded-lg p-1 mb-6">
            <button
              onClick={() => setMode('mobile')}
              className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                mode === 'mobile' 
                  ? 'bg-netflix-red text-white' 
                  : 'text-netflix-text-gray hover:text-white'
              }`}
            >
              <PhoneIcon className="w-4 h-4 inline mr-2" />
              Mobile
            </button>
            <button
              onClick={() => setMode('email')}
              className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                mode === 'email' 
                  ? 'bg-netflix-red text-white' 
                  : 'text-netflix-text-gray hover:text-white'
              }`}
            >
              <EnvelopeIcon className="w-4 h-4 inline mr-2" />
              Email
            </button>
          </div>
        )}

        {/* Form */}
        <form onSubmit={(e) => e.preventDefault()} className="space-y-4">
          {/* Mobile Number Input */}
          {mode === 'mobile' && step === 'input' && (
            <>
              <div>
                <label className="form-label">Mobile Number</label>
                <div className="flex gap-2">
                  <select
                    aria-label="Country code"
                    className="form-input bg-white text-black w-28"
                    value={countryCode}
                    onChange={(e) => setCountryCode(e.target.value)}
                  >
                    {countryOptions.map((c) => (
                      <option key={c.code} value={c.dial}>{c.code} {c.dial}</option>
                    ))}
                  </select>
                  <input
                    type="tel"
                    name="mobileNumber"
                    value={formData.mobileNumber}
                    onChange={handleMobileNumberChange}
                    placeholder="5551234567"
                    className="form-input flex-1 bg-white text-black placeholder:text-gray-500"
                    maxLength={15}
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="form-label">First Name</label>
                  <input
                    type="text"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleInputChange}
                    placeholder="John"
                    className="form-input bg-white text-black placeholder:text-gray-500"
                  />
                </div>
                <div>
                  <label className="form-label">Last Name</label>
                  <input
                    type="text"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleInputChange}
                    placeholder="Doe"
                    className="form-input bg-white text-black placeholder:text-gray-500"
                  />
                </div>
              </div>
            </>
          )}

          {/* OTP Input */}
          {step === 'otp' && (
            <div>
              <label className="form-label">Verification Code</label>
              <input
                type="text"
                name="otp"
                value={formData.otp}
                onChange={handleInputChange}
                placeholder="123456"
                className="form-input bg-white text-black text-center text-2xl tracking-widest placeholder:text-gray-500"
                maxLength={6}
              />
              {otpTimer > 0 && (
                <p className="text-caption text-netflix-text-gray mt-2 text-center">
                  Resend code in {formatTime(otpTimer)}
                </p>
              )}
            </div>
          )}

          {/* Email Input */}
          {mode === 'email' && (
            <div>
              <label className="form-label">Email Address</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                placeholder="john@example.com"
                className="form-input bg-white text-black placeholder:text-gray-500"
              />
            </div>
          )}

          {/* Password Input */}
          {mode === 'email' && (
            <div>
              <label className="form-label">Password</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  placeholder="Enter your password"
                  className="form-input bg-white text-black placeholder:text-gray-500 pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-netflix-text-gray hover:text-white"
                >
                  {showPassword ? <EyeSlashIcon className="w-5 h-5" /> : <EyeIcon className="w-5 h-5" />}
                </button>
              </div>
            </div>
          )}

          {/* Confirm Password (only for new email accounts) */}
          {mode === 'email' && step === 'input' && (
            <div>
              <label className="form-label">Confirm Password</label>
              <div className="relative">
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  placeholder="Confirm your password"
                  className="form-input bg-white text-black placeholder:text-gray-500 pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-netflix-text-gray hover:text-white"
                >
                  {showConfirmPassword ? <EyeSlashIcon className="w-5 h-5" /> : <EyeIcon className="w-5 h-5" />}
                </button>
              </div>
            </div>
          )}

          {/* Name fields for email registration */}
          {mode === 'email' && step === 'input' && (
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="form-label">First Name</label>
                <input
                  type="text"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleInputChange}
                  placeholder="John"
                  className="form-input"
                />
              </div>
              <div>
                <label className="form-label">Last Name</label>
                <input
                  type="text"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleInputChange}
                  placeholder="Doe"
                  className="form-input"
                />
              </div>
            </div>
          )}

          {/* Submit Button */}
          <Button
            type="submit"
            variant="primary"
            size="lg"
            className="w-full"
            onClick={mode === 'mobile' ? 
              (step === 'otp' ? handleVerifyOTP : handleSendOTP) : 
              handleEmailAuth
            }
            loading={loading}
            disabled={loading}
          >
            {loading ? (
              <LoadingSpinner size="sm" />
            ) : (
              <>
                {step === 'otp' ? 'Verify & Continue' :
                 mode === 'mobile' ? 'Send Verification Code' :
                 step === 'email-password' ? 'Sign In' : 'Create Account'}
              </>
            )}
          </Button>

          {/* Resend OTP */}
          {step === 'otp' && otpTimer === 0 && (
            <button
              type="button"
              onClick={handleResendOTP}
              className="w-full text-center text-netflix-text-gray hover:text-white transition-colors"
              disabled={loading}
            >
              Didn't receive the code? Resend
            </button>
          )}
        </form>

        {/* Footer */}
        <div className="text-center mt-8">
          <p className="text-caption text-netflix-text-gray">
            By continuing, you agree to our Terms of Service and Privacy Policy
          </p>
        </div>
      </div>
    </div>
  );
}
