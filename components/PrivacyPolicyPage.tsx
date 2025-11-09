import React from 'react';

const Section = ({ title, children }: { title: string, children: React.ReactNode }) => (
    <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-800 mb-3">{title}</h2>
        <div className="space-y-4 text-gray-600 leading-relaxed">
            {children}
        </div>
    </div>
);

const PrivacyPolicyPage = ({ onBack }: { onBack: () => void }) => {
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
                    <h1 className="text-4xl font-extrabold text-gray-900 mb-6">Privacy Policy</h1>
                    <p className="text-sm text-gray-500 mb-8">Last updated: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>

                    <Section title="1. Introduction">
                        <p>
                            Welcome to The Agric App ("we," "our," "us"). We are committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our application. By using The Agric App, you agree to the collection and use of information in accordance with this policy.
                        </p>
                    </Section>

                    <Section title="2. Information We Collect">
                        <p>We may collect information about you in a variety of ways. The information we may collect includes:</p>
                        <h3 className="text-lg font-semibold text-gray-700 mt-4">Personal Data</h3>
                        <p>
                            Personally identifiable information, such as your name, email address, and telephone number, that you voluntarily give to us when you register with the application or when you choose to participate in various activities related to the application.
                        </p>
                        <h3 className="text-lg font-semibold text-gray-700 mt-4">Farm & Operational Data</h3>
                        <p>
                            All data you input into the application, including but not limited to crop plans, livestock records, health events, inventory details, financial records, and farm locations (including GPS coordinates). This data is essential for the functionality of the app.
                        </p>
                         <h3 className="text-lg font-semibold text-gray-700 mt-4">Image & Camera Data</h3>
                        <p>
                            We request access to your device's camera and photo library for specific features like the "Talk to Farmr" AI analysis. When you upload an image of a crop or animal, we process this image to provide a diagnosis or advice. We do not access your camera or photos without your explicit action.
                        </p>
                         <h3 className="text-lg font-semibold text-gray-700 mt-4">Usage Data</h3>
                        <p>
                           Information our servers automatically collect when you access the application, such as your IP address, browser type, operating system, access times, and the pages you have viewed directly before and after accessing the application.
                        </p>
                    </Section>
                    
                     <Section title="3. How We Use Your Information">
                        <p>Having accurate information about you permits us to provide you with a smooth, efficient, and customized experience. Specifically, we may use information collected about you via the application to:</p>
                        <ul className="list-disc list-inside space-y-2">
                            <li>Create and manage your account.</li>
                            <li>Provide the core functionalities of farm management (planning, record-keeping, etc.).</li>
                            <li>Power AI features like crop and livestock analysis.</li>
                            <li>Generate analytics and reports about your farm's performance.</li>
                            <li>Notify you of relevant Government/NGO support programs.</li>
                            <li>Monitor and analyze usage and trends to improve your experience.</li>
                            <li>Respond to your support requests.</li>
                        </ul>
                    </Section>
                    
                    <Section title="4. Disclosure of Your Information">
                        <p>We do not share your personal or farm data with third parties except in the following situations:</p>
                         <ul className="list-disc list-inside space-y-2">
                            <li><strong>With Your Consent:</strong> We may share your information with your explicit consent.</li>
                            <li><strong>By Law or to Protect Rights:</strong> If we believe the release of information about you is necessary to respond to legal process, to investigate or remedy potential violations of our policies, or to protect the rights, property, and safety of others.</li>
                            <li><strong>Third-Party Service Providers:</strong> We may share your information with third parties that perform services for us or on our behalf, such as data analysis, cloud hosting, and AI model providers (e.g., Google Gemini API). These providers are contractually obligated to protect your data.</li>
                        </ul>
                    </Section>

                    <Section title="5. Data Security">
                        <p>
                           We use administrative, technical, and physical security measures to help protect your personal information. While we have taken reasonable steps to secure the personal information you provide to us, please be aware that despite our efforts, no security measures are perfect or impenetrable, and no method of data transmission can be guaranteed against any interception or other type of misuse.
                        </p>
                    </Section>
                    
                    <Section title="6. Your Rights and Choices">
                        <p>You have the right to:</p>
                         <ul className="list-disc list-inside space-y-2">
                            <li><strong>Access and Update Your Information:</strong> You may review, change, or terminate your account at any time through the app's settings.</li>
                            <li><strong>Data Portability:</strong> You can export your data from various modules within the app (e.g., as CSV files).</li>
                            <li><strong>Opt-Out:</strong> You can opt-out of future marketing communications by following the unsubscribe links in our emails.</li>
                        </ul>
                    </Section>
                    
                     <Section title="7. Changes to This Privacy Policy">
                        <p>
                           We may update this Privacy Policy from time to time in order to reflect, for example, changes to our practices or for other operational, legal, or regulatory reasons. We will notify you of any changes by posting the new Privacy Policy on this page.
                        </p>
                    </Section>
                    
                    <Section title="8. Contact Us">
                        <p>
                           If you have questions or comments about this Privacy Policy, please contact us at: <a href="mailto:privacy@agricapp.com" className="text-green-600 font-semibold hover:underline">privacy@agricapp.com</a>
                        </p>
                    </Section>
                </div>
            </main>
        </div>
    );
};

export default PrivacyPolicyPage;