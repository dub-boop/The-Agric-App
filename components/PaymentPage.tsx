import React, { useState } from 'react';

interface PaymentPageProps {
  selectedPlan: 'Pro' | 'Premium';
  onPaymentSuccess: (plan: 'Pro' | 'Premium') => void;
  onCancel: () => void;
}

const PaymentPage = ({ selectedPlan, onPaymentSuccess, onCancel }: PaymentPageProps) => {
  const [billingPeriod, setBillingPeriod] = useState<'monthly' | 'annually'>('monthly');
  const [numberOfUsers, setNumberOfUsers] = useState<number>(5); // Default for premium
  const [cardName, setCardName] = useState('');
  const [cardNumber, setCardNumber] = useState('');
  const [expiry, setExpiry] = useState('');
  const [cvv, setCvv] = useState('');
  const [postalCode, setPostalCode] = useState('');
  const [error, setError] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState(false);

  // Auto format card number with spaces every 4 digits
  const handleCardNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value.replace(/\D/g, '');
    if (value.length > 16) value = value.slice(0, 16);
    
    const formatted = value.match(/.{1,4}/g)?.join(' ') || value;
    setCardNumber(formatted);
  };

  // Auto format expiry date as MM/YY
  const handleExpiryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value.replace(/\D/g, '');
    if (value.length > 4) value = value.slice(0, 4);
    
    if (value.length >= 3) {
      value = `${value.slice(0, 2)}/${value.slice(2)}`;
    }
    setExpiry(value);
  };

  // Auto format CVV (max 4 digits)
  const handleCvvChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, '');
    if (value.length <= 4) {
      setCvv(value);
    }
  };

  // Detect card type based on number prefix
  const getCardType = () => {
    const cleanNumber = cardNumber.replace(/\s/g, '');
    if (cleanNumber.startsWith('4')) return 'Visa';
    if (/^5[1-5]/.test(cleanNumber)) return 'Mastercard';
    if (/^3[47]/.test(cleanNumber)) return 'American Express';
    return 'Generic';
  };

  // Calculate pricing based on selection
  const getPricingDetails = () => {
    if (selectedPlan === 'Pro') {
      const price = billingPeriod === 'monthly' ? 19 : 15.83; // $190/yr is $15.83/mo
      const total = billingPeriod === 'monthly' ? 19 : 190;
      const billingText = billingPeriod === 'monthly' ? 'Billed monthly' : 'Billed annually (Save 17%)';
      return { price, total, billingText };
    } else {
      // Premium is $10/user/month
      const price = 10;
      const total = 10 * numberOfUsers;
      const billingText = `Billed monthly for ${numberOfUsers} active team members`;
      return { price, total, billingText };
    }
  };

  const { total, billingText } = getPricingDetails();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Validations
    if (!cardName.trim()) {
      setError('Please enter the cardholder name.');
      return;
    }
    const cleanCard = cardNumber.replace(/\s/g, '');
    if (cleanCard.length < 15) {
      setError('Please enter a valid credit card number.');
      return;
    }
    if (expiry.length < 5) {
      setError('Please enter a valid expiry date (MM/YY).');
      return;
    }
    const [month, year] = expiry.split('/');
    const m = parseInt(month, 10);
    if (m < 1 || m > 12) {
      setError('Please enter a valid month (01-12).');
      return;
    }
    if (cvv.length < 3) {
      setError('Please enter a valid CVV code.');
      return;
    }
    if (!postalCode.trim()) {
      setError('Please enter your billing ZIP or Postal Code.');
      return;
    }

    // Process secure billing payment
    setIsProcessing(true);
    setTimeout(() => {
      setIsProcessing(false);
      setPaymentSuccess(true);
      // Wait for 1.5 seconds to transition to successfully complete
      setTimeout(() => {
        onPaymentSuccess(selectedPlan);
      }, 1600);
    }, 2000);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-between font-sans">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 py-4 px-6 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-[#1E5631] rounded-full flex items-center justify-center">
            <div className="w-6 h-6 bg-white/20 rounded-full"></div>
          </div>
          <span className="text-lg font-bold tracking-wider text-gray-800">THE AGRIC APP</span>
        </div>
        <button
          onClick={onCancel}
          className="text-gray-500 hover:text-gray-800 text-sm font-semibold flex items-center space-x-1"
        >
          <span className="material-icons-outlined text-lg leading-none">arrow_back</span>
          <span>Cancel & Back</span>
        </button>
      </header>

      {/* Main Content */}
      <main className="max-w-5xl w-full mx-auto p-4 md:p-8 flex-grow grid md:grid-cols-12 gap-8 items-start">
        {paymentSuccess ? (
          <div className="md:col-span-12 bg-white rounded-2xl shadow-xl border border-gray-100 p-12 text-center max-w-lg mx-auto mt-12 animate-fade-in">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6 text-green-600 animate-bounce">
              <span className="material-icons-outlined text-4xl font-bold">check</span>
            </div>
            <h2 className="text-3xl font-extrabold text-gray-900 mb-2">Payment Authorized!</h2>
            <p className="text-gray-600 mb-6">
              Thank you! Your payment of <strong className="text-gray-900">${total.toFixed(2)}</strong> has been successfully processed.
            </p>
            <div className="flex items-center justify-center space-x-2 text-[#1E5631] font-semibold">
              <div className="w-5 h-5 border-2 border-[#1E5631] border-t-transparent rounded-full animate-spin"></div>
              <span>Configuring your {selectedPlan} workspace...</span>
            </div>
          </div>
        ) : (
          <>
            {/* Left: Order Summary */}
            <div className="md:col-span-5 bg-white rounded-2xl shadow-sm border border-gray-200/80 p-6 space-y-6">
              <div>
                <span className="text-xs font-bold text-[#1E5631] tracking-wider uppercase bg-green-50 px-2.5 py-1 rounded-full">Selected Plan</span>
                <h2 className="text-2xl font-extrabold text-gray-900 mt-2">{selectedPlan} Tier</h2>
                <p className="text-sm text-gray-500 mt-1">Unlock superior tools for modern farm operations.</p>
              </div>

              {/* Billing Toggle (Pro only) */}
              {selectedPlan === 'Pro' && (
                <div className="bg-gray-50 p-1 rounded-xl flex">
                  <button
                    type="button"
                    onClick={() => setBillingPeriod('monthly')}
                    className={`flex-1 py-2 text-center text-sm font-semibold rounded-lg transition-all ${
                      billingPeriod === 'monthly' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-900'
                    }`}
                  >
                    Monthly ($19/mo)
                  </button>
                  <button
                    type="button"
                    onClick={() => setBillingPeriod('annually')}
                    className={`flex-1 py-2 text-center text-sm font-semibold rounded-lg transition-all flex items-center justify-center space-x-1.5 ${
                      billingPeriod === 'annually' ? 'bg-white text-[#1E5631] shadow-sm' : 'text-gray-500 hover:text-gray-900'
                    }`}
                  >
                    <span>Annually ($190/yr)</span>
                    <span className="bg-green-100 text-[#1E5631] text-[10px] font-bold px-1.5 py-0.5 rounded-full uppercase">Save 17%</span>
                  </button>
                </div>
              )}

              {/* User Counter (Premium only) */}
              {selectedPlan === 'Premium' && (
                <div className="bg-gray-50 p-4 rounded-xl space-y-3">
                  <div className="flex justify-between items-center">
                    <label className="text-sm font-semibold text-gray-700">Team Members</label>
                    <span className="bg-green-100 text-[#1E5631] text-xs font-bold px-2 py-0.5 rounded-full">
                      $10/user/mo
                    </span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <button
                      type="button"
                      disabled={numberOfUsers <= 1}
                      onClick={() => setNumberOfUsers(prev => Math.max(1, prev - 1))}
                      className="w-9 h-9 border border-gray-300 rounded-lg flex items-center justify-center hover:bg-white disabled:opacity-40 transition-colors"
                    >
                      <span className="material-icons-outlined text-lg">remove</span>
                    </button>
                    <input
                      type="number"
                      min="1"
                      max="100"
                      value={numberOfUsers}
                      onChange={(e) => setNumberOfUsers(Math.max(1, parseInt(e.target.value) || 1))}
                      className="w-16 h-9 border border-gray-300 rounded-lg text-center font-bold text-gray-800"
                    />
                    <button
                      type="button"
                      onClick={() => setNumberOfUsers(prev => prev + 1)}
                      className="w-9 h-9 border border-gray-300 rounded-lg flex items-center justify-center hover:bg-white transition-colors"
                    >
                      <span className="material-icons-outlined text-lg">add</span>
                    </button>
                    <span className="text-xs text-gray-500">Includes full permission controls</span>
                  </div>
                </div>
              )}

              {/* Price Breakdown */}
              <div className="border-t border-gray-100 pt-6 space-y-3">
                <div className="flex justify-between text-sm text-gray-600">
                  <span>{selectedPlan} Subscription</span>
                  <span>
                    {selectedPlan === 'Pro' 
                      ? (billingPeriod === 'monthly' ? '$19.00' : '$190.00') 
                      : `$${(numberOfUsers * 10).toFixed(2)}`
                    }
                  </span>
                </div>
                <div className="flex justify-between text-sm text-gray-600">
                  <span>SSL Secure Gateway Charge</span>
                  <span className="text-green-600 font-semibold">Free</span>
                </div>
                <div className="flex justify-between text-sm text-gray-600">
                  <span>Taxes / VAT</span>
                  <span>$0.00</span>
                </div>
                <div className="border-t border-gray-100 pt-3 flex justify-between items-end">
                  <div>
                    <span className="text-base font-bold text-gray-900 block">Total Due</span>
                    <span className="text-xs text-gray-500">{billingText}</span>
                  </div>
                  <span className="text-3xl font-extrabold text-gray-900">${total.toFixed(2)}</span>
                </div>
              </div>

              {/* Bullet Features */}
              <div className="border-t border-gray-100 pt-6 space-y-4">
                <h4 className="text-sm font-bold text-gray-800">Included with your subscription:</h4>
                <div className="space-y-2.5">
                  {selectedPlan === 'Pro' ? (
                    <>
                      <div className="flex items-start text-sm text-gray-600">
                        <span className="material-icons-outlined text-green-600 mr-2 text-lg">check_circle</span>
                        <span>Unlimited crop and livestock schedules</span>
                      </div>
                      <div className="flex items-start text-sm text-gray-600">
                        <span className="material-icons-outlined text-green-600 mr-2 text-lg">check_circle</span>
                        <span>Track government support and applications</span>
                      </div>
                      <div className="flex items-start text-sm text-gray-600">
                        <span className="material-icons-outlined text-green-600 mr-2 text-lg">check_circle</span>
                        <span>75 high-precision agronomy AI queries monthly</span>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="flex items-start text-sm text-gray-600">
                        <span className="material-icons-outlined text-green-600 mr-2 text-lg">check_circle</span>
                        <span>All features of the Pro tier</span>
                      </div>
                      <div className="flex items-start text-sm text-gray-600">
                        <span className="material-icons-outlined text-green-600 mr-2 text-lg">check_circle</span>
                        <span>Unlimited farm locations & team members</span>
                      </div>
                      <div className="flex items-start text-sm text-gray-600">
                        <span className="material-icons-outlined text-green-600 mr-2 text-lg">check_circle</span>
                        <span>Unlimited AI assistant disease-diagnosis queries</span>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* Right: Payment Form */}
            <form onSubmit={handleSubmit} className="md:col-span-7 bg-white rounded-2xl shadow-sm border border-gray-200/80 p-6 md:p-8 space-y-6">
              <div>
                <h2 className="text-xl font-bold text-gray-800">Secure Billing Details</h2>
                <p className="text-sm text-gray-500 mt-1">Payments are encrypted with industry-standard AES-256 protocols.</p>
              </div>

              {error && (
                <div className="bg-red-50 text-red-700 p-3.5 rounded-xl text-sm font-medium border border-red-100 flex items-start space-x-2">
                  <span className="material-icons-outlined text-lg leading-none">error_outline</span>
                  <span>{error}</span>
                </div>
              )}

              <div className="space-y-4">
                {/* Cardholder Name */}
                <div>
                  <label htmlFor="cardName" className="block text-sm font-medium text-gray-700 mb-1.5">
                    Cardholder Name
                  </label>
                  <input
                    id="cardName"
                    type="text"
                    required
                    value={cardName}
                    onChange={(e) => setCardName(e.target.value)}
                    placeholder="e.g. Aisha Bello"
                    className="w-full px-4 py-2.5 bg-white border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all text-gray-800 outline-none"
                  />
                </div>

                {/* Card Number */}
                <div>
                  <div className="flex justify-between items-center mb-1.5">
                    <label htmlFor="cardNumber" className="block text-sm font-medium text-gray-700">
                      Card Number
                    </label>
                    <span className="text-xs text-[#1E5631] font-bold bg-green-50 px-2 py-0.5 rounded-md">
                      {getCardType() !== 'Generic' ? getCardType() : 'Secure'}
                    </span>
                  </div>
                  <div className="relative">
                    <input
                      id="cardNumber"
                      type="text"
                      required
                      value={cardNumber}
                      onChange={handleCardNumberChange}
                      placeholder="4000 1234 5678 9010"
                      className="w-full pl-4 pr-11 py-2.5 bg-white border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all text-gray-800 outline-none font-mono"
                    />
                    <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 material-icons-outlined">
                      credit_card
                    </span>
                  </div>
                </div>

                {/* Expiry & CVV */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="expiry" className="block text-sm font-medium text-gray-700 mb-1.5">
                      Expiry Date
                    </label>
                    <input
                      id="expiry"
                      type="text"
                      required
                      value={expiry}
                      onChange={handleExpiryChange}
                      placeholder="MM/YY"
                      className="w-full px-4 py-2.5 bg-white border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all text-gray-800 outline-none text-center font-mono"
                    />
                  </div>
                  <div>
                    <label htmlFor="cvv" className="block text-sm font-medium text-gray-700 mb-1.5">
                      CVV / Code
                    </label>
                    <input
                      id="cvv"
                      type="password"
                      required
                      value={cvv}
                      onChange={handleCvvChange}
                      placeholder="123"
                      maxLength={4}
                      className="w-full px-4 py-2.5 bg-white border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all text-gray-800 outline-none text-center font-mono"
                    />
                  </div>
                </div>

                {/* Billing Zip/Postal Code */}
                <div>
                  <label htmlFor="postalCode" className="block text-sm font-medium text-gray-700 mb-1.5">
                    ZIP / Postal Code
                  </label>
                  <input
                    id="postalCode"
                    type="text"
                    required
                    value={postalCode}
                    onChange={(e) => setPostalCode(e.target.value)}
                    placeholder="e.g. 100001"
                    className="w-full px-4 py-2.5 bg-white border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all text-gray-800 outline-none"
                  />
                </div>
              </div>

              {/* Lock notice */}
              <div className="bg-gray-50 rounded-xl p-3.5 flex items-center space-x-3 border border-gray-100">
                <span className="material-icons-outlined text-green-600 text-xl leading-none">lock</span>
                <span className="text-xs text-gray-500">
                  Your billing info is verified by PCI-DSS certified gateway systems. The Agric App never retains full credit card details.
                </span>
              </div>

              {/* Pay Button */}
              <button
                type="submit"
                disabled={isProcessing}
                className="w-full py-3.5 rounded-xl bg-[#4C9A2A] hover:bg-[#1E5631] text-white font-bold text-base shadow-md transition-all flex items-center justify-center space-x-2.5 disabled:opacity-50"
              >
                {isProcessing ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Authorizing Secured Transaction...</span>
                  </>
                ) : (
                  <>
                    <span className="material-icons-outlined text-lg leading-none">payment</span>
                    <span>Pay ${total.toFixed(2)} & Continue</span>
                  </>
                )}
              </button>
            </form>
          </>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 py-6 text-center text-xs text-gray-400">
        &copy; {new Date().getFullYear()} The Agric App Inc. All rights reserved. SECURE BILLING GATEWAY v1.42
      </footer>
    </div>
  );
};

export default PaymentPage;
