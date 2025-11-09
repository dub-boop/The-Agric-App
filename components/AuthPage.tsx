
import React, { useState, useEffect } from 'react';

const AuthPage = ({ onLogin, onSignUp, onAcceptInvitation }: { onLogin: () => void; onSignUp: () => void; onAcceptInvitation: (email: string) => void; }) => {
    const [authMode, setAuthMode] = useState<'login' | 'signup' | 'verify' | 'accept_invite'>('login');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [verificationCode, setVerificationCode] = useState('');
    const [error, setError] = useState('');
    const [invitedEmail, setInvitedEmail] = useState<string | null>(null);

    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        const token = params.get('invite_token');
        if (token && token.startsWith('MOCK_TOKEN_FOR_')) {
            const emailFromToken = token.split('_FOR_')[1].replace(/_AT_/g, '@');
            if (emailFromToken) {
                setInvitedEmail(emailFromToken);
                setAuthMode('accept_invite');
                // Clean the URL
                window.history.replaceState({}, document.title, window.location.pathname);
            }
        }
    }, []);

    const handleSignUp = (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        if (password !== confirmPassword) {
            setError('Passwords do not match.');
            return;
        }
        // In a real app, you would trigger an API call to send an email here.
        // For this demo, we just switch to the verification screen.
        setAuthMode('verify');
    };

    const handleLogin = (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        // In a real app, you'd verify credentials here.
        // For this demo, we'll just log in successfully.
        onLogin();
    };

    const handleVerify = (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        if (verificationCode === '123456') {
            onSignUp(); // Success, proceed to onboarding
        } else {
            setError('Invalid verification code. Please try again.');
        }
    };
    
    const handleAcceptInvite = (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        if (password !== confirmPassword) {
            setError('Passwords do not match.');
            return;
        }
        if (invitedEmail) {
            onAcceptInvitation(invitedEmail);
            // After accepting, log them in
            onLogin();
        } else {
            setError('An error occurred. The invitation is invalid.');
        }
    };
    
    const inputClasses = "w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500";
    const buttonClasses = "w-full py-3 px-4 bg-[#4C9A2A] text-white font-semibold rounded-lg hover:bg-[#1E5631] transition-colors shadow-md";

    return (
        <div className="min-h-screen bg-[#1E5631] flex flex-col items-center justify-center p-4 font-sans">
            <div className="w-full max-w-md">
                <div className="flex items-center justify-center space-x-3 mb-8">
                    {/* Replicating sidebar logo */}
                    <div className="relative flex-shrink-0">
                        <div className="w-12 h-12 bg-white/10 rounded-full flex items-center justify-center">
                            <div className="w-8 h-8 bg-white/20 rounded-full"></div>
                        </div>
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-4 h-4 bg-green-300 rounded-full shadow-[0_0_12px_4px] shadow-green-400/80"></div>
                    </div>
                    <h1 className="text-2xl font-bold tracking-wider text-white">THE AGRIC APP</h1>
                </div>

                <div className="bg-white rounded-2xl shadow-2xl p-8">
                    {authMode === 'accept_invite' ? (
                         <form onSubmit={handleAcceptInvite} className="space-y-6">
                             <h2 className="text-2xl font-bold text-center text-gray-800">Create Your Account</h2>
                             <p className="text-center text-gray-600 text-sm">
                                You've been invited to join the team. Set up your password to continue.
                             </p>
                            <div>
                                <label htmlFor="invitedEmail" className="block text-sm font-medium text-gray-700">Email Address</label>
                                <input id="invitedEmail" type="email" value={invitedEmail || ''} className={`${inputClasses} mt-1 bg-gray-100 cursor-not-allowed`} readOnly />
                            </div>
                             <div>
                                <label htmlFor="password" className="block text-sm font-medium text-gray-700">Create Password</label>
                                <input id="password" type="password" value={password} onChange={e => setPassword(e.target.value)} className={`${inputClasses} mt-1`} required />
                            </div>
                              <div>
                                <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">Confirm Password</label>
                                <input id="confirmPassword" type="password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} className={`${inputClasses} mt-1`} required />
                            </div>
                            {error && <p className="text-red-500 text-sm text-center">{error}</p>}
                            <button type="submit" className={buttonClasses}>Create Account & Join</button>
                        </form>
                    ) : authMode === 'verify' ? (
                        <form onSubmit={handleVerify} className="space-y-6">
                            <h2 className="text-2xl font-bold text-center text-gray-800">Verify Your Email</h2>
                            <p className="text-center text-gray-600 text-sm">
                                A verification code has been sent to <strong>{email}</strong>. Please enter it below. (Hint: it's 123456)
                            </p>
                            <div>
                                <label htmlFor="verificationCode" className="block text-sm font-medium text-gray-700">Verification Code</label>
                                <input
                                    id="verificationCode"
                                    type="text"
                                    value={verificationCode}
                                    onChange={(e) => setVerificationCode(e.target.value)}
                                    className={`${inputClasses} mt-1 text-center tracking-[0.5em]`}
                                    required
                                />
                            </div>
                             {error && <p className="text-red-500 text-sm text-center">{error}</p>}
                            <button type="submit" className={buttonClasses}>Verify & Continue</button>
                             <p className="text-center text-sm text-gray-500">
                                Didn't get a code? <a href="#" className="font-medium text-green-600 hover:underline">Resend</a>
                            </p>
                        </form>
                    ) : authMode === 'signup' ? (
                         <form onSubmit={handleSignUp} className="space-y-6">
                             <h2 className="text-2xl font-bold text-center text-gray-800">Create Your Account</h2>
                            <div>
                                <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email Address</label>
                                <input id="email" type="email" value={email} onChange={e => setEmail(e.target.value)} className={`${inputClasses} mt-1`} required />
                            </div>
                             <div>
                                <label htmlFor="password" className="block text-sm font-medium text-gray-700">Password</label>
                                <input id="password" type="password" value={password} onChange={e => setPassword(e.target.value)} className={`${inputClasses} mt-1`} required />
                            </div>
                              <div>
                                <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">Confirm Password</label>
                                <input id="confirmPassword" type="password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} className={`${inputClasses} mt-1`} required />
                            </div>
                            {error && <p className="text-red-500 text-sm text-center">{error}</p>}
                            <button type="submit" className={buttonClasses}>Sign Up</button>
                             <p className="text-center text-sm text-gray-500">
                                Already have an account?{' '}
                                <button type="button" onClick={() => { setAuthMode('login'); setError(''); }} className="font-medium text-green-600 hover:underline">Log in</button>
                            </p>
                        </form>
                    ) : (
                         <form onSubmit={handleLogin} className="space-y-6">
                            <h2 className="text-2xl font-bold text-center text-gray-800">Welcome Back!</h2>
                            <div>
                                <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email Address</label>
                                <input id="email" type="email" value={email} onChange={e => setEmail(e.target.value)} className={`${inputClasses} mt-1`} required />
                            </div>
                            <div>
                                <label htmlFor="password" className="block text-sm font-medium text-gray-700">Password</label>
                                <input id="password" type="password" value={password} onChange={e => setPassword(e.target.value)} className={`${inputClasses} mt-1`} required />
                            </div>
                             {error && <p className="text-red-500 text-sm text-center">{error}</p>}
                            <button type="submit" className={buttonClasses}>Log In</button>
                             <p className="text-center text-sm text-gray-500">
                                Don't have an account?{' '}
                                <button type="button" onClick={() => { setAuthMode('signup'); setError(''); }} className="font-medium text-green-600 hover:underline">Sign up</button>
                            </p>
                        </form>
                    )}
                </div>
            </div>
        </div>
    );
};

export default AuthPage;
