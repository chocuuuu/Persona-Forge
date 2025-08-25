import React, { useState } from 'react';

// The "Home Page" component that appears after a successful login.
const HomePage = ({ onLogout }) => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-gray-50 text-center">
      <div className="p-8 bg-white rounded-2xl shadow-xl w-full max-w-md">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Welcome!</h1>
        <p className="text-lg text-gray-600">You have successfully logged in.</p>
        <p className="mt-4 text-sm text-gray-500">
          This is your personalized banking AI dashboard.
        </p>
        <button
          onClick={onLogout}
          className="mt-6 w-full h-11 text-white font-semibold rounded-lg hover:bg-red-900 transition-colors"
          style={{ backgroundColor: "#B91C1C" }}
        >
          Log Out
        </button>
      </div>
    </div>
  );
};

// The main application component that handles routing and state.
export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [activeTab, setActiveTab] = useState('login');

  // Hardcoded authentication function to act as a workaround.
  const authenticateUser = (email, password) => {
    // Only allow login for the specified demo user.
    if (email === "bpi@demo.com" && password === "bpi") {
      return { email: "bpi@demo.com" };
    }
    return null;
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    const formData = new FormData(e.currentTarget);
    const email = formData.get("email");
    const password = formData.get("password");

    try {
      const user = authenticateUser(email, password);
      if (!user) {
        throw new Error("Invalid email or password");
      }

      setSuccess("Login successful! Redirecting...");
      setTimeout(() => {
        setIsLoggedIn(true);
      }, 800);
    } catch (err) {
      setError(err.message || "Login failed. Please check your credentials.");
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = (e) => {
    e.preventDefault();
    setError("Registration is not available yet. Please use existing credentials to login.");
  };

  if (isLoggedIn) {
    return <HomePage onLogout={() => setIsLoggedIn(false)} />;
  }

  // Use a switch-like structure to handle different pages.
  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gray-50 font-[Inter] antialiased">
      <div className="w-full max-w-md">
        {/* Header section */}
        <div
          className="text-center mb-6 p-8 rounded-t-2xl shadow-lg"
          style={{ background: "linear-gradient(135deg, #B91C1C 0%, #7F1D1D 100%)" }}
        >
          <div className="inline-flex items-center gap-3 text-4xl font-bold text-white mb-2">
            {/* Crown Icon (inline SVG) */}
            <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-white">
              <path d="m12 5-8.5 7 3.5 10H17l3.5-10L12 5Z" />
              <path d="M2 19h20" />
            </svg>
            PersonaForge
          </div>
          <p className="text-white text-lg font-medium">For the People. Forged for You.</p>
          <p className="mt-2 text-white/90">Sign in to access your personalized banking AI</p>
        </div>

        {/* Card and Tabs section */}
        <div className="bg-white shadow-xl border-0 rounded-t-none rounded-b-2xl p-6">
          <div className="text-center pb-2 pt-2">
            <h2 className="text-3xl font-bold text-gray-900">Welcome Back</h2>
            <p className="text-base text-gray-600">
              Access your financial persona and personalized banking experience
            </p>
          </div>
          
          <div className="w-full">
            {/* Tabs List */}
            <div className="grid w-full grid-cols-2 p-1 mb-6 rounded-lg" style={{ backgroundColor: "#E5E7EB" }}>
              <button
                onClick={() => setActiveTab('login')}
                className={`flex-1 rounded-md font-semibold text-gray-700 p-2 transition-colors ${activeTab === 'login' ? 'bg-white text-[#B91C1C] shadow-sm' : ''}`}
              >
                Sign In
              </button>
              <button
                onClick={() => setActiveTab('register')}
                className={`flex-1 rounded-md font-semibold text-gray-700 p-2 transition-colors ${activeTab === 'register' ? 'bg-white text-[#B91C1C] shadow-sm' : ''}`}
              >
                Sign Up
              </button>
            </div>
            
            {/* Login Tab Content */}
            {activeTab === 'login' && (
              <form onSubmit={handleLogin} className="space-y-6">
                <div className="space-y-2">
                  <label htmlFor="login-email" className="text-sm font-medium text-gray-700">
                    Email Address
                  </label>
                  <input
                    id="login-email"
                    name="email"
                    type="email"
                    placeholder="bpi@demo.com"
                    required
                    disabled={loading}
                    className="w-full h-11 px-4 py-2 border border-gray-300 rounded-lg focus:border-[#B91C1C] focus-visible:ring-2 focus-visible:ring-[#B91C1C]/50"
                  />
                </div>
                <div className="space-y-2">
                  <label htmlFor="login-password" className="text-sm font-medium text-gray-700">
                    Password
                  </label>
                  <input
                    id="login-password"
                    name="password"
                    type="password"
                    placeholder="bpi"
                    required
                    disabled={loading}
                    className="w-full h-11 px-4 py-2 border border-gray-300 rounded-lg focus:border-[#B91C1C] focus-visible:ring-2 focus-visible:ring-[#B91C1C]/50"
                  />
                </div>
                <button
                  type="submit"
                  className="w-full h-11 text-white font-semibold rounded-lg hover:bg-[#7F1D1D] transition-colors flex items-center justify-center"
                  disabled={loading}
                  style={{ backgroundColor: "#B91C1C" }}
                >
                  {/* LogIn Icon (inline SVG) */}
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2">
                    <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4" />
                    <polyline points="10 17 15 12 10 7" />
                    <line x1="15" x2="3" y1="12" y2="12" />
                  </svg>
                  {loading ? "Signing in..." : "Sign In"}
                </button>
              </form>
            )}

            {/* Register Tab Content */}
            {activeTab === 'register' && (
              <form onSubmit={handleRegister} className="space-y-6">
                <div className="space-y-2">
                  <label htmlFor="register-name" className="text-sm font-medium text-gray-700">
                    Full Name
                  </label>
                  <input
                    id="register-name"
                    name="name"
                    type="text"
                    placeholder="John Doe"
                    disabled={true}
                    className="w-full h-11 px-4 py-2 border border-gray-300 rounded-lg opacity-50 cursor-not-allowed"
                  />
                </div>
                <div className="space-y-2">
                  <label htmlFor="register-email" className="text-sm font-medium text-gray-700">
                    Email Address
                  </label>
                  <input
                    id="register-email"
                    name="email"
                    type="email"
                    placeholder="your@email.com"
                    disabled={true}
                    className="w-full h-11 px-4 py-2 border border-gray-300 rounded-lg opacity-50 cursor-not-allowed"
                  />
                </div>
                <div className="space-y-2">
                  <label htmlFor="register-password" className="text-sm font-medium text-gray-700">
                    Password
                  </label>
                  <input
                    id="register-password"
                    name="password"
                    type="password"
                    placeholder="Create a password"
                    disabled={true}
                    className="w-full h-11 px-4 py-2 border border-gray-300 rounded-lg opacity-50 cursor-not-allowed"
                  />
                </div>
                <button
                  type="submit"
                  className="w-full h-11 text-white font-semibold rounded-lg opacity-50 flex items-center justify-center cursor-not-allowed"
                  disabled={true}
                  style={{ backgroundColor: "#B91C1C" }}
                >
                  {/* UserPlus Icon (inline SVG) */}
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2">
                    <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                    <circle cx="9" cy="7" r="4" />
                    <line x1="19" x2="19" y1="8" y2="14" />
                    <line x1="22" x2="16" y1="11" y2="11" />
                  </svg>
                  Registration Coming Soon
                </button>
              </form>
            )}

            {/* Alert Messages */}
            {error && (
              <div className="mt-6 p-4 rounded-lg bg-red-100 border border-red-200">
                <p className="text-red-800">{error}</p>
              </div>
            )}
            {success && (
              <div className="mt-6 p-4 rounded-lg bg-green-100 border border-green-200 flex items-center">
                {/* Sparkles Icon (inline SVG) */}
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-green-600 mr-2">
                  <path d="M12 2v20M17 5H9.5M3.5 8h.5M20 11.5h.5M5.5 14h.5M2.5 17h.5M20 19h.5M15 22h-1.5M14 10l-1.5-3-1.5 3L11 10zM17 17l-1.5-3-1.5 3L14 17z" />
                </svg>
                <p className="text-green-800">{success}</p>
              </div>
            )}

            {/* Features Preview */}
            <div className="mt-8 grid grid-cols-2 gap-4 text-xs">
              <div
                className="text-center p-4 rounded-xl border-2 transition-transform hover:scale-[1.02]"
                style={{ borderColor: "#FEF2F2", backgroundColor: "#FEF2F2" }}
              >
                {/* Crown Icon (inline SVG) */}
                <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mx-auto mb-2 text-red-700">
                  <path d="m12 5-8.5 7 3.5 10H17l3.5-10L12 5Z" />
                  <path d="M2 19h20" />
                </svg>
                <p className="font-semibold text-sm text-red-700">Real Personas</p>
                <p className="text-gray-600 mt-1">From backend data</p>
              </div>
              <div
                className="text-center p-4 rounded-xl border-2 transition-transform hover:scale-[1.02]"
                style={{ borderColor: "#FEF2F2", backgroundColor: "#FEF2F2" }}
              >
                {/* Sparkles Icon (inline SVG) */}
                <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mx-auto mb-2" style={{ color: "#7F1D1D" }}>
                  <path d="M12 2v20M17 5H9.5M3.5 8h.5M20 11.5h.5M5.5 14h.5M2.5 17h.5M20 19h.5M15 22h-1.5M14 10l-1.5-3-1.5 3L11 10zM17 17l-1.5-3-1.5 3L14 17z" />
                </svg>
                <p className="font-semibold text-sm" style={{ color: "#7F1D1D" }}>
                  Smart AI
                </p>
                <p className="text-gray-600 mt-1">Personalized responses</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
