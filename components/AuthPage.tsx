
import React, { useState, useEffect } from 'react';
import { 
    signInWithEmailAndPassword, 
    createUserWithEmailAndPassword, 
    GoogleAuthProvider, 
    signInWithPopup, 
    linkWithCredential,
    sendEmailVerification
} from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { auth, db } from '../firebase';

const AuthPage = ({ onLogin, onSignUp, onAcceptInvitation, onGoToLanding }: { onLogin: () => void; onSignUp: () => void; onAcceptInvitation: (email: string) => void; onGoToLanding?: () => void; }) => {
    const [authMode, setAuthMode] = useState<'login' | 'signup' | 'verify' | 'accept_invite' | 'link_account'>('login');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [verificationCode, setVerificationCode] = useState('');
    const [error, setError] = useState('');
    const [invitedEmail, setInvitedEmail] = useState<string | null>(null);

    // State for linking existing manual accounts with Google
    const [collisionEmail, setCollisionEmail] = useState('');
    const [collisionCredential, setCollisionCredential] = useState<any>(null);
    const [linkPassword, setLinkPassword] = useState('');
    const [isLinking, setIsLinking] = useState(false);

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
        setAuthMode('verify');
    };

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        
        let resolvedEmail = email.trim();
        if (!resolvedEmail.includes('@')) {
            const lowercaseId = resolvedEmail.toLowerCase();
            const LOCAL_UNIQUE_ID_MAP: Record<string, string> = {
                'tap982101': 'john.doe@greenvalley.com',
                'tap439102': 'jane.smith@greenvalley.com',
                'tap712103': 'new.user@example.com',
            };
            
            if (LOCAL_UNIQUE_ID_MAP[lowercaseId]) {
                resolvedEmail = LOCAL_UNIQUE_ID_MAP[lowercaseId];
            } else {
                try {
                    const docRef = doc(db, 'unique_ids', lowercaseId);
                    const docSnap = await getDoc(docRef);
                    if (docSnap.exists() && docSnap.data()?.email) {
                        resolvedEmail = docSnap.data().email;
                    } else {
                        setError('Could not find any account associated with that Unique ID.');
                        return;
                    }
                } catch (lookupErr: any) {
                    console.error("Unique ID mapping lookup error:", lookupErr);
                    setError('Could not find any account associated with that Unique ID.');
                    return;
                }
            }
        }

        try {
            await signInWithEmailAndPassword(auth, resolvedEmail, password);
            onLogin();
        } catch (err: any) {
            console.error(err);
            if (err.code === 'auth/operation-not-allowed') {
                setError("Email/Password authentication is currently unavailable. Please contact the administrator or system support.");
            } else if (err.code === 'auth/user-not-found' || err.code === 'auth/wrong-password' || err.code === 'auth/invalid-credential') {
                setError('Invalid email/ID or password. Please try again.');
            } else if (err.code === 'auth/invalid-email') {
                setError('Please enter a valid email address or Unique ID.');
            } else {
                setError(err.message || 'An error occurred during log in.');
            }
        }
    };

    const handleVerify = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        if (verificationCode === '123456') {
            try {
                const userCredential = await createUserWithEmailAndPassword(auth, email, password);
                try {
                    await sendEmailVerification(userCredential.user);
                } catch (sendErr) {
                    console.error("Error sending initial verification email:", sendErr);
                }
                onSignUp(); // Success, proceed to onboarding
            } catch (err: any) {
                console.error(err);
                if (err.code === 'auth/operation-not-allowed') {
                    setError("Email/Password authentication is currently unavailable. Please contact the administrator or system support.");
                } else if (err.code === 'auth/email-already-in-use') {
                    setError('This email address is already in use.');
                } else {
                    setError(err.message || 'An error occurred during registration.');
                }
            }
        } else {
            setError('Invalid verification code. Please try again.');
        }
    };
    
    const handleAcceptInvite = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        if (password !== confirmPassword) {
            setError('Passwords do not match.');
            return;
        }
        if (invitedEmail) {
            try {
                const userCredential = await createUserWithEmailAndPassword(auth, invitedEmail, password);
                try {
                    await sendEmailVerification(userCredential.user);
                } catch (sendErr) {
                    console.error("Error sending initial verification email:", sendErr);
                }
                onAcceptInvitation(invitedEmail);
                onLogin();
            } catch (err: any) {
                console.error(err);
                if (err.code === 'auth/operation-not-allowed') {
                    setError("Email/Password authentication is currently unavailable. Please contact the administrator or system support.");
                } else if (err.code === 'auth/email-already-in-use') {
                    setError('This email is already registered. Please try logging in instead.');
                } else {
                    setError(err.message || 'An error occurred accepting the invitation.');
                }
            }
        } else {
            setError('An error occurred. The invitation is invalid.');
        }
    };

    const handleGoogleSignIn = async () => {
        setError('');
        const provider = new GoogleAuthProvider();
        try {
            const result = await signInWithPopup(auth, provider);
            const user = result.user;
            const isNewUser = user.metadata.creationTime === user.metadata.lastSignInTime;
            if (isNewUser) {
                onSignUp();
            } else {
                onLogin();
            }
        } catch (err: any) {
            console.error("Google sign in error:", err);
            if (err.code === 'auth/operation-not-allowed') {
                setError("Google sign-in is currently unavailable. Please contact system support or use email and password instead.");
            } else if (err.code === 'auth/popup-closed-by-user' || err.code === 'auth/cancelled-popup-request') {
                setError("Google sign-in popup was closed or cancelled. Please try again, or open the application in a new tab if you are using an embedded frame.");
            } else if (err.code === 'auth/popup-blocked') {
                setError("Google sign-in popup was blocked by your browser. Please allow popups for this site, or open the application in a new browser tab to sign in.");
            } else if (err.code === 'auth/unauthorized-domain') {
                setError("This domain is not authorized for Google Sign-In. Please add this website's domain to the authorized domains list in your Firebase configuration, or use email and password authentication instead.");
            } else if (err.code === 'auth/account-exists-with-different-credential') {
                const pendingCred = GoogleAuthProvider.credentialFromError(err);
                const emailVal = err.customData?.email || '';
                setCollisionEmail(emailVal);
                setCollisionCredential(pendingCred);
                setAuthMode('link_account');
            } else {
                setError(err.message || 'An error occurred during Google sign in.');
            }
        }
    };

    const handleLinkAccount = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setIsLinking(true);
        try {
            // 1. Sign in with the manual email & password
            const userCredential = await signInWithEmailAndPassword(auth, collisionEmail, linkPassword);
            // 2. Link the pending Google credential to this user
            if (collisionCredential) {
                await linkWithCredential(userCredential.user, collisionCredential);
            }
            // 3. Clear state and trigger success
            setLinkPassword('');
            onLogin();
        } catch (err: any) {
            console.error("Linking error:", err);
            if (err.code === 'auth/wrong-password' || err.code === 'auth/invalid-credential') {
                setError('Incorrect password. Please verify your existing password and try again.');
            } else {
                setError(err.message || 'An error occurred while linking your accounts.');
            }
        } finally {
            setIsLinking(false);
        }
    };
    
    const renderGoogleButton = () => (
        <div className="space-y-4">
            <div className="relative flex py-2 items-center">
                <div className="flex-grow border-t border-gray-200"></div>
                <span className="flex-shrink mx-4 text-gray-500 text-sm">Or continue with</span>
                <div className="flex-grow border-t border-gray-200"></div>
            </div>
            <button
                type="button"
                onClick={handleGoogleSignIn}
                className="w-full py-2.5 px-4 border border-gray-300 rounded-lg shadow-sm bg-white text-gray-700 font-medium hover:bg-gray-50 transition-colors flex items-center justify-center space-x-2"
            >
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.14-4.52z" />
                </svg>
                <span>Google</span>
            </button>
        </div>
    );
    
    const inputClasses = "w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500";
    const buttonClasses = "w-full py-3 px-4 bg-[#4C9A2A] text-white font-semibold rounded-lg hover:bg-[#1E5631] transition-colors shadow-md";

    const renderErrorMsg = (msg: string) => {
        if (!msg) return null;
        
        const isPopupBlocked = msg.includes('popup-closed-by-user') || 
                               msg.includes('cancelled-popup-request') || 
                               msg.includes('popup-blocked') || 
                               msg.includes('popup was closed') ||
                               msg.includes('assertion failed') ||
                               msg.includes('Pending promise') ||
                               msg.includes('aborted');

        return (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-sm text-red-700 space-y-1.5 text-left">
                <p className="font-semibold text-center flex items-center justify-center gap-1">
                    <span className="material-icons-outlined text-base text-red-600">error_outline</span>
                    <span>Sign In Error</span>
                </p>
                <p className="text-xs text-red-600 font-medium break-words text-center">{msg}</p>
                {isPopupBlocked && (
                    <p className="text-xs text-red-600 mt-1 leading-relaxed border-t border-red-100 pt-1.5 text-center">
                        <strong>Tip:</strong> If using social login within an embedded frame, please open the application in a new browser tab to complete authentication.
                    </p>
                )}
            </div>
        );
    };

    return (
        <div className="min-h-screen bg-[#1E5631] flex flex-col items-center justify-center p-4 font-sans">
            <div className="w-full max-w-md">
                <div 
                    onClick={onGoToLanding}
                    className={`flex items-center justify-center space-x-3 mb-8 ${onGoToLanding ? 'cursor-pointer hover:opacity-80 transition-opacity' : ''}`}
                >
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
                            {renderErrorMsg(error)}
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
                            {renderErrorMsg(error)}
                            <button type="submit" className={buttonClasses}>Verify & Continue</button>
                             <p className="text-center text-sm text-gray-500">
                                Didn't get a code? <a href="#" className="font-medium text-green-600 hover:underline">Resend</a>
                            </p>
                        </form>
                    ) : authMode === 'link_account' ? (
                        <form onSubmit={handleLinkAccount} className="space-y-6">
                            <h2 className="text-2xl font-bold text-center text-gray-800">Link Google Account</h2>
                            <p className="text-center text-gray-600 text-sm">
                                An account already exists under <strong>{collisionEmail}</strong>. 
                                Please enter your password to securely link your Google sign-in.
                            </p>
                            <div>
                                <label htmlFor="linkPassword" className="block text-sm font-medium text-gray-700">Enter Password</label>
                                <input
                                    id="linkPassword"
                                    type="password"
                                    value={linkPassword}
                                    onChange={e => setLinkPassword(e.target.value)}
                                    className={`${inputClasses} mt-1`}
                                    required
                                    placeholder="Your existing account password"
                                />
                            </div>
                            {renderErrorMsg(error)}
                            <button 
                                type="submit" 
                                className={`${buttonClasses} flex items-center justify-center space-x-2`}
                                disabled={isLinking}
                            >
                                {isLinking ? (
                                    <>
                                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                        <span>Linking Accounts...</span>
                                    </>
                                ) : (
                                    <span>Link & Log In</span>
                                )}
                            </button>
                            <p className="text-center text-sm text-gray-500">
                                <button type="button" onClick={() => { setAuthMode('login'); setError(''); }} className="font-medium text-green-600 hover:underline">Cancel</button>
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
                            {renderErrorMsg(error)}
                            <button type="submit" className={buttonClasses}>Sign Up</button>
                            {renderGoogleButton()}

                             <p className="text-center text-sm text-gray-500 mt-4">
                                Already have an account?{' '}
                                <button type="button" onClick={() => { setAuthMode('login'); setError(''); }} className="font-medium text-green-600 hover:underline">Log in</button>
                            </p>
                        </form>
                    ) : (
                         <form onSubmit={handleLogin} className="space-y-6">
                            <h2 className="text-2xl font-bold text-center text-gray-800">Welcome Back!</h2>
                            <div>
                                <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email Address or Unique ID</label>
                                <input id="email" type="text" value={email} onChange={e => setEmail(e.target.value)} className={`${inputClasses} mt-1`} required placeholder="e.g. TAP982101 or john.doe@greenvalley.com" />
                            </div>
                            <div>
                                <label htmlFor="password" className="block text-sm font-medium text-gray-700">Password</label>
                                <input id="password" type="password" value={password} onChange={e => setPassword(e.target.value)} className={`${inputClasses} mt-1`} required />
                            </div>
                            {renderErrorMsg(error)}
                            <button type="submit" className={buttonClasses}>Log In</button>
                            {renderGoogleButton()}

                             <p className="text-center text-sm text-gray-500 mt-4">
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
