import React, { useState, useEffect } from 'react';
import { Mail, CheckCircle, RefreshCw, LogOut, AlertCircle, ShieldAlert } from 'lucide-react';
import { auth } from '../firebase';
import { sendEmailVerification, signOut } from 'firebase/auth';

interface EmailVerificationProps {
  currentUserAuth: any;
  onVerified: () => void;
  onLogout: () => void;
}

export default function EmailVerification({ currentUserAuth, onVerified, onLogout }: EmailVerificationProps) {
  const [isResending, setIsResending] = useState(false);
  const [resendMessage, setResendMessage] = useState('');
  const [resendError, setResendError] = useState('');
  const [isChecking, setIsChecking] = useState(false);
  const [checkError, setCheckError] = useState('');
  const [isSandbox, setIsSandbox] = useState(false);

  useEffect(() => {
    // Determine if we are in a sandbox session
    if (currentUserAuth?.uid && currentUserAuth.uid.startsWith('sandbox_user_')) {
      setIsSandbox(true);
    }
  }, [currentUserAuth]);

  // Handle Resend Verification Email
  const handleResend = async () => {
    if (isSandbox) {
      setIsResending(true);
      setTimeout(() => {
        setIsResending(false);
        setResendMessage('Sandbox Mode: Mock verification email sent successfully!');
        setResendError('');
      }, 800);
      return;
    }

    setIsResending(true);
    setResendMessage('');
    setResendError('');
    try {
      const user = auth.currentUser;
      if (user) {
        await sendEmailVerification(user);
        setResendMessage(`A fresh verification link has been sent to ${user.email}.`);
      } else {
        setResendError('No active user session found. Please log in again.');
      }
    } catch (err: any) {
      console.error(err);
      setResendError(err.message || 'Failed to send verification email. Please try again.');
    } finally {
      setIsResending(false);
    }
  };

  // Check if the email has been verified
  const handleCheckStatus = async () => {
    setCheckError('');
    setIsChecking(true);

    if (isSandbox) {
      setTimeout(() => {
        setIsChecking(false);
        setCheckError('To proceed in Sandbox Mode, click the "Simulate Sandbox Verification" option below.');
      }, 500);
      return;
    }

    try {
      const user = auth.currentUser;
      if (user) {
        await user.reload();
        if (user.emailVerified) {
          onVerified();
        } else {
          setCheckError('Email not verified yet. Please check your inbox and click the verification link.');
        }
      } else {
        setCheckError('No active user session found. Please log in again.');
      }
    } catch (err: any) {
      console.error(err);
      setCheckError(err.message || 'Failed to refresh verification status.');
    } finally {
      setIsChecking(false);
    }
  };

  // Simulate Sandbox Verification
  const handleSimulateSandboxVerify = () => {
    if (currentUserAuth?.uid) {
      localStorage.setItem(`sandbox_email_verified_${currentUserAuth.uid}`, 'true');
      onVerified();
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6 font-sans">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl border border-slate-100 overflow-hidden">
        {/* Header decoration */}
        <div className="bg-[#1E5631] px-6 py-8 text-center text-white relative">
          <div className="absolute top-4 right-4 bg-white/10 px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider">
            Phase 1 of 2
          </div>
          <div className="w-16 h-16 bg-white/10 rounded-full flex items-center justify-center mx-auto mb-4 border border-white/20">
            <Mail className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-2xl font-bold tracking-tight">Account Opening</h2>
          <p className="text-green-100 text-sm mt-1">Please verify your email address</p>
        </div>

        <div className="p-6 md:p-8 space-y-6">
          {isSandbox && (
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-start space-x-3 text-amber-800">
              <ShieldAlert className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
              <div className="text-xs">
                <span className="font-bold block mb-1">Sandbox Environment active</span>
                You are currently logged in with a demo / sandbox farmer profile. Use the simulator control below to easily bypass or mock-verify this step.
              </div>
            </div>
          )}

          <div className="text-center space-y-2">
            <p className="text-gray-600 text-sm leading-relaxed">
              We've sent an email verification link to:
            </p>
            <p className="text-gray-900 font-semibold text-base break-all bg-slate-50 px-4 py-2 rounded-lg border border-slate-100">
              {currentUserAuth?.email || 'your-email@example.com'}
            </p>
            <p className="text-gray-500 text-xs mt-2">
              Please check your spam or promotions folder if you don't receive it within a couple of minutes.
            </p>
          </div>

          {/* Verification Messages */}
          {resendMessage && (
            <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl p-4 text-xs flex items-center space-x-2">
              <CheckCircle className="w-4 h-4 text-emerald-600 flex-shrink-0" />
              <span>{resendMessage}</span>
            </div>
          )}

          {resendError && (
            <div className="bg-rose-50 border border-rose-200 text-rose-800 rounded-xl p-4 text-xs flex items-center space-x-2">
              <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0" />
              <span>{resendError}</span>
            </div>
          )}

          {checkError && (
            <div className="bg-amber-50 border border-amber-200 text-amber-800 rounded-xl p-4 text-xs flex items-center space-x-2">
              <AlertCircle className="w-4 h-4 text-amber-600 flex-shrink-0" />
              <span>{checkError}</span>
            </div>
          )}

          {/* Action Buttons */}
          <div className="space-y-3 pt-2">
            <button
              onClick={handleCheckStatus}
              disabled={isChecking}
              className="w-full bg-[#1E5631] hover:bg-[#153e22] text-white py-3 px-4 rounded-xl font-medium transition-all shadow-md hover:shadow-lg flex items-center justify-center space-x-2 disabled:opacity-50 cursor-pointer border-0"
            >
              {isChecking ? (
                <RefreshCw className="w-5 h-5 animate-spin" />
              ) : (
                <>
                  <CheckCircle className="w-5 h-5" />
                  <span>I've Clicked the Verification Link</span>
                </>
              )}
            </button>

            <button
              onClick={handleResend}
              disabled={isResending}
              className="w-full bg-slate-100 hover:bg-slate-200 text-slate-700 py-2.5 px-4 rounded-xl font-medium transition-all flex items-center justify-center space-x-2 disabled:opacity-50 cursor-pointer border-0 text-sm"
            >
              <RefreshCw className={`w-4 h-4 ${isResending ? 'animate-spin' : ''}`} />
              <span>{isResending ? 'Sending...' : 'Resend Verification Email'}</span>
            </button>
          </div>

          {/* Sandbox Specific Bypass button */}
          {isSandbox && (
            <div className="pt-2 border-t border-dashed border-slate-100">
              <button
                onClick={handleSimulateSandboxVerify}
                className="w-full bg-amber-600 hover:bg-amber-700 text-white py-3 px-4 rounded-xl font-semibold transition-all shadow flex items-center justify-center space-x-2 cursor-pointer border-0 text-sm"
              >
                <span>Simulate Sandbox Verification</span>
              </button>
            </div>
          )}

          <div className="pt-4 border-t border-slate-100 flex items-center justify-center">
            <button
              onClick={onLogout}
              className="text-gray-500 hover:text-gray-800 font-medium text-sm flex items-center space-x-1 cursor-pointer bg-transparent border-0 py-1 px-3 rounded-lg hover:bg-slate-50 transition-colors"
            >
              <LogOut className="w-4 h-4" />
              <span>Cancel & Sign Out</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
