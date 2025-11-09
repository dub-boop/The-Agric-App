import React from 'react';

const Section = ({ title, children }: { title: string, children: React.ReactNode }) => (
    <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-800 mb-3">{title}</h2>
        <div className="space-y-4 text-gray-600 leading-relaxed">
            {children}
        </div>
    </div>
);

const TermsOfServicePage = ({ onBack }: { onBack: () => void }) => {
    return (
        <div className="bg-gray-50 min-h-screen font-sans">
            <header className="bg-white shadow-sm sticky top-0 z-10">
                <div className="container mx-auto px-6 py-4 flex justify-between items-center">
                    <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-[#1E5631]/80 rounded-full flex items-center justify-center">
                            <div className="w-6 h-6 bg-white/20 rounded-full"></div>
                        </div>
                        <h1 className="text-lg font-bold tracking-wider text-gray-800">THE AGRIC APP</h1>
                    </div>
                    <button onClick={onBack} className="px-4 py-2 bg-gray-200 text-gray-800 font-semibold rounded-lg hover:bg-gray-300 transition-colors">
                        Back to Home
                    </button>
                </div>
            </header>

            <main className="container mx-auto px-6 py-12">
                <div className="max-w-4xl mx-auto bg-white p-8 sm:p-12 rounded-lg shadow-md">
                    <h1 className="text-4xl font-extrabold text-gray-900 mb-6">Terms of Service</h1>
                    <p className="text-sm text-gray-500 mb-8">Last updated: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>

                    <Section title="1. Acceptance of Terms">
                        <p>
                            By accessing or using The Agric App (the "Service"), you agree to be bound by these Terms of Service ("Terms"). If you disagree with any part of the terms, then you may not access the Service.
                        </p>
                    </Section>

                    <Section title="2. Description of Service">
                        <p>
                            The Agric App provides a suite of farm management tools including, but not limited to, cropping and livestock planners, inventory management, financial record-keeping, AI-powered diagnostics ("Talk to Farmr"), and access to information about third-party support programs.
                        </p>
                    </Section>
                    
                     <Section title="3. User Accounts">
                        <p>
                            To use most features of the Service, you must register for an account. You agree to provide accurate, current, and complete information during the registration process and to update such information to keep it accurate, current, and complete. You are responsible for safeguarding your password and for any activities or actions under your account.
                        </p>
                    </Section>
                    
                    <Section title="4. User Content">
                        <p>
                           You retain all ownership rights to the data, information, and images you upload or enter into the Service ("User Content"). By submitting User Content, you grant us a worldwide, non-exclusive, royalty-free license to use, reproduce, modify, and process this data solely for the purpose of providing and improving the Service to you. We will not share your specific farm data with third parties for their marketing purposes.
                        </p>
                    </Section>

                    <Section title="5. Acceptable Use">
                        <p>You agree not to use the Service to:</p>
                         <ul className="list-disc list-inside space-y-2">
                            <li>Upload any content that is unlawful, harmful, or infringes on the rights of others.</li>
                            <li>Attempt to gain unauthorized access to the Service or its related systems or networks.</li>
                            <li>Use the Service in any manner that could disable, overburden, or impair the app.</li>
                            <li>Use any automated system to access the Service in a manner that sends more request messages to our servers than a human can reasonably produce in the same period by using a conventional web browser.</li>
                        </ul>
                    </Section>
                    
                    <Section title="6. AI-Powered Features">
                        <p>
                           The "Talk to Farmr" feature provides information and suggestions based on AI models. This information is for guidance purposes only and is not a substitute for professional veterinary or agronomic advice. You are solely responsible for any actions you take based on the AI's suggestions. We are not liable for any crop loss, animal harm, or financial damages resulting from reliance on this feature.
                        </p>
                    </Section>

                    <Section title="7. Subscription and Fees">
                        <p>
                           Certain features of the Service may be subject to payments now or in the future ("Paid Services"). Please see our pricing page for details. We reserve the right to change our pricing at any time, and we will provide you with reasonable notice of any price changes.
                        </p>
                    </Section>

                    <Section title="8. Termination">
                        <p>
                           We may terminate or suspend your account and bar access to the Service immediately, without prior notice or liability, for any reason whatsoever, including without limitation if you breach the Terms.
                        </p>
                    </Section>
                    
                    <Section title="9. Disclaimer of Warranties & Limitation of Liability">
                        <p>
                           The Service is provided on an "AS IS" and "AS AVAILABLE" basis. We make no warranties, express or implied, regarding the operation of the Service or the information, content, or materials included therein. You expressly agree that your use of the Service is at your sole risk.
                        </p>
                        <p>
                           In no event shall The Agric App, nor its directors, employees, partners, agents, suppliers, or affiliates, be liable for any indirect, incidental, special, consequential or punitive damages, including without limitation, loss of profits, data, use, goodwill, or other intangible losses, resulting from your access to or use of or inability to access or use the Service.
                        </p>
                    </Section>

                    <Section title="10. Changes to Terms">
                        <p>
                           We reserve the right, at our sole discretion, to modify or replace these Terms at any time. We will provide at least 30 days' notice before any new terms take effect. By continuing to access or use our Service after those revisions become effective, you agree to be bound by the revised terms.
                        </p>
                    </Section>

                     <Section title="11. Contact Us">
                        <p>
                           If you have any questions about these Terms, please contact us at: <a href="mailto:support@agricapp.com" className="text-green-600 font-semibold hover:underline">support@agricapp.com</a>
                        </p>
                    </Section>
                </div>
            </main>
        </div>
    );
};

export default TermsOfServicePage;