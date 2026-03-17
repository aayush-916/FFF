// import { useState } from 'react';
// import { useNavigate } from 'react-router-dom';
// import { useAuth } from '../../context/AuthContext';
// import { BookOpen, AlertCircle, Loader2 } from 'lucide-react';

// const Login = () => {
//   const [username, setUsername] = useState('');
//   const [password, setPassword] = useState('');
//   const [error, setError] = useState('');
//   const [isSubmitting, setIsSubmitting] = useState(false);
  
//   const { login } = useAuth();
//   const navigate = useNavigate();

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     setError('');
//     setIsSubmitting(true);

//     try {
//       // Calls POST /auth/login with username and password
//       await login(username, password);
//       // Redirect to dashboard on success
//       navigate('/');
//     } catch (err) {
//       setError(
//         err.response?.data?.message || 'Login failed. Please check your credentials.'
//       );
//     } finally {
//       setIsSubmitting(false);
//     }
//   };

//   return (
//     <div className="flex min-h-screen flex-col justify-center bg-gray-50 px-6 py-12 lg:px-8">
//       <div className="sm:mx-auto sm:w-full sm:max-w-md">
//         <div className="flex justify-center">
//           <div className="rounded-full bg-blue-100 p-3">
//             <BookOpen className="h-10 w-10 text-blue-600" />
//           </div>
//         </div>
//         <h2 className="mt-6 text-center text-2xl font-bold tracking-tight text-gray-900">
//           School Wellbeing Portal
//         </h2>
//         <p className="mt-2 text-center text-sm text-gray-600">
//           Sign in to manage your classes and lessons
//         </p>
//       </div>

//       <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
//         <div className="bg-white px-6 py-8 shadow-sm ring-1 ring-gray-900/5 sm:rounded-xl sm:px-10">
//           <form className="space-y-6" onSubmit={handleSubmit}>
//             {error && (
//               <div className="flex items-center gap-2 rounded-lg bg-red-50 p-3 text-sm text-red-600">
//                 <AlertCircle className="h-5 w-5 shrink-0" />
//                 <p>{error}</p>
//               </div>
//             )}

//             <div>
//               <label htmlFor="username" className="block text-sm font-medium leading-6 text-gray-900">
//                 Username
//               </label>
//               <div className="mt-2">
//                 <input
//                   id="username"
//                   name="username"
//                   type="text"
//                   required
//                   value={username}
//                   onChange={(e) => setUsername(e.target.value)}
//                   className="block w-full rounded-xl border-0 py-3 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-blue-600 sm:text-sm sm:leading-6"
//                   placeholder="Enter your username"
//                 />
//               </div>
//             </div>

//             <div>
//               <label htmlFor="password" className="block text-sm font-medium leading-6 text-gray-900">
//                 Password
//               </label>
//               <div className="mt-2">
//                 <input
//                   id="password"
//                   name="password"
//                   type="password"
//                   required
//                   value={password}
//                   onChange={(e) => setPassword(e.target.value)}
//                   className="block w-full rounded-xl border-0 py-3 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-blue-600 sm:text-sm sm:leading-6"
//                   placeholder="Enter your password"
//                 />
//               </div>
//             </div>

//             <div>
//               <button
//                 type="submit"
//                 disabled={isSubmitting}
//                 className="flex w-full w-full justify-center rounded-xl bg-blue-600 px-3 py-3.5 text-sm font-semibold leading-6 text-white shadow-sm hover:bg-blue-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 disabled:opacity-70"
//               >
//                 {isSubmitting ? (
//                   <Loader2 className="h-5 w-5 animate-spin" />
//                 ) : (
//                   'Sign in'
//                 )}
//               </button>
//             </div>
//           </form>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default Login;




import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { BookOpen, AlertCircle, Loader2, Eye, EyeOff } from 'lucide-react';

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);
    try {
      await login(username, password);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed. Please check your credentials.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;600;700&family=DM+Sans:wght@300;400;500&display=swap');

        * { box-sizing: border-box; margin: 0; padding: 0; }

        .login-root {
          min-height: 100vh;
          background-color: #0d1117;
          display: flex;
          font-family: 'DM Sans', sans-serif;
          overflow: hidden;
          position: relative;
        }

        /* ── Decorative background ── */
        .bg-orb {
          position: absolute;
          border-radius: 50%;
          filter: blur(80px);
          pointer-events: none;
        }
        .bg-orb-1 {
          width: 520px; height: 520px;
          background: radial-gradient(circle, rgba(201,155,87,0.18) 0%, transparent 70%);
          top: -120px; left: -120px;
          animation: drift1 12s ease-in-out infinite alternate;
        }
        .bg-orb-2 {
          width: 400px; height: 400px;
          background: radial-gradient(circle, rgba(99,140,200,0.14) 0%, transparent 70%);
          bottom: -80px; right: -80px;
          animation: drift2 15s ease-in-out infinite alternate;
        }
        .bg-orb-3 {
          width: 260px; height: 260px;
          background: radial-gradient(circle, rgba(201,155,87,0.1) 0%, transparent 70%);
          bottom: 30%; left: 10%;
          animation: drift1 18s ease-in-out infinite alternate-reverse;
        }
        @keyframes drift1 { from { transform: translate(0,0); } to { transform: translate(40px, 30px); } }
        @keyframes drift2 { from { transform: translate(0,0); } to { transform: translate(-30px, -40px); } }

        /* Grid lines */
        .bg-grid {
          position: absolute; inset: 0;
          background-image:
            linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px);
          background-size: 60px 60px;
          pointer-events: none;
        }

        /* ── Right panel / form ── */
        .right-panel {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 100%;
          padding: 32px 20px;
          position: relative;
          z-index: 1;
        }

        .form-card {
          width: 100%;
          max-width: 400px;
          animation: fadeUp 0.6s ease both;
        }

        .form-logo {
          display: flex;
          align-items: center;
          gap: 12px;
          margin-bottom: 40px;
        }
        .form-logo-icon {
          width: 44px; height: 44px;
          background: linear-gradient(135deg, #c99b57 0%, #e8c070 100%);
          border-radius: 12px;
          display: flex; align-items: center; justify-content: center;
          box-shadow: 0 4px 20px rgba(201,155,87,0.4);
        }
        .form-logo-text {
          font-family: 'Playfair Display', serif;
          font-size: 18px;
          font-weight: 600;
          color: #f0ebe2;
        }

        .form-heading {
          font-family: 'Playfair Display', serif;
          font-size: 28px;
          font-weight: 700;
          color: #f0ebe2;
          margin-bottom: 8px;
        }
        .form-subheading {
          font-size: 14px;
          color: rgba(240,235,226,0.4);
          margin-bottom: 36px;
          font-weight: 300;
        }

        .error-box {
          display: flex;
          align-items: center;
          gap: 10px;
          background: rgba(239,68,68,0.1);
          border: 1px solid rgba(239,68,68,0.25);
          border-radius: 10px;
          padding: 12px 14px;
          margin-bottom: 20px;
          font-size: 13px;
          color: #f87171;
          animation: shake 0.4s ease;
        }
        @keyframes shake {
          0%,100%{transform:translateX(0)}
          20%,60%{transform:translateX(-6px)}
          40%,80%{transform:translateX(6px)}
        }

        .field { margin-bottom: 20px; }
        .field label {
          display: block;
          font-size: 12px;
          font-weight: 500;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          color: rgba(240,235,226,0.5);
          margin-bottom: 8px;
        }
        .input-wrap { position: relative; }
        .field input {
          width: 100%;
          background: rgba(255,255,255,0.05);
          border: 1px solid rgba(255,255,255,0.1);
          border-radius: 12px;
          padding: 14px 16px;
          font-size: 15px;
          color: #f0ebe2;
          font-family: 'DM Sans', sans-serif;
          outline: none;
          transition: border-color 0.2s, background 0.2s, box-shadow 0.2s;
        }
        .field input::placeholder { color: rgba(240,235,226,0.2); }
        .field input:focus {
          border-color: rgba(201,155,87,0.6);
          background: rgba(201,155,87,0.06);
          box-shadow: 0 0 0 3px rgba(201,155,87,0.1);
        }
        .field input.has-toggle { padding-right: 48px; }

        .toggle-btn {
          position: absolute;
          right: 14px; top: 50%;
          transform: translateY(-50%);
          background: none; border: none; cursor: pointer;
          color: rgba(240,235,226,0.3);
          display: flex; align-items: center;
          transition: color 0.2s;
          padding: 4px;
        }
        .toggle-btn:hover { color: rgba(201,155,87,0.8); }

        .submit-btn {
          width: 100%;
          background: linear-gradient(135deg, #c99b57 0%, #e8c070 100%);
          color: #0d1117;
          border: none;
          border-radius: 12px;
          padding: 15px;
          font-size: 15px;
          font-weight: 600;
          font-family: 'DM Sans', sans-serif;
          cursor: pointer;
          letter-spacing: 0.03em;
          margin-top: 8px;
          transition: opacity 0.2s, transform 0.15s, box-shadow 0.2s;
          box-shadow: 0 4px 20px rgba(201,155,87,0.35);
          display: flex; align-items: center; justify-content: center; gap: 8px;
        }
        .submit-btn:hover:not(:disabled) {
          opacity: 0.92;
          transform: translateY(-1px);
          box-shadow: 0 6px 28px rgba(201,155,87,0.45);
        }
        .submit-btn:active:not(:disabled) { transform: translateY(0); }
        .submit-btn:disabled { opacity: 0.55; cursor: not-allowed; }

        .divider {
          display: flex; align-items: center; gap: 12px;
          margin: 28px 0 20px;
        }
        .divider-line { flex: 1; height: 1px; background: rgba(255,255,255,0.07); }
        .divider span { font-size: 11px; color: rgba(240,235,226,0.25); letter-spacing: 0.06em; text-transform: uppercase; }

        .footer-note {
          text-align: center;
          font-size: 12px;
          color: rgba(240,235,226,0.25);
          margin-top: 28px;
          line-height: 1.6;
        }
        .footer-note a { color: rgba(201,155,87,0.7); text-decoration: none; }
        .footer-note a:hover { color: #c99b57; }

        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(18px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>

      <div className="login-root">
        <div className="bg-grid" />
        <div className="bg-orb bg-orb-1" />
        <div className="bg-orb bg-orb-2" />
        <div className="bg-orb bg-orb-3" />



        {/* Right form panel */}
        <div className="right-panel">
          <div className="form-card">

            <div className="form-logo">
              <div className="form-logo-icon">
                <BookOpen size={22} color="#0d1117" strokeWidth={2.5} />
              </div>
              <span className="form-logo-text">Wellbeing Portal</span>
            </div>

            <h2 className="form-heading">Welcome back</h2>
            <p className="form-subheading">Sign in to continue to your dashboard</p>

            {error && (
              <div className="error-box">
                <AlertCircle size={16} style={{ flexShrink: 0 }} />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit}>
              <div className="field">
                <label htmlFor="username">Username</label>
                <div className="input-wrap">
                  <input
                    id="username"
                    name="username"
                    type="text"
                    required
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="Enter your username"
                    autoComplete="username"
                  />
                </div>
              </div>

              <div className="field">
                <label htmlFor="password">Password</label>
                <div className="input-wrap">
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your password"
                    className="has-toggle"
                    autoComplete="current-password"
                  />
                  <button
                    type="button"
                    className="toggle-btn"
                    onClick={() => setShowPassword(v => !v)}
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="submit-btn"
              >
                {isSubmitting ? (
                  <><Loader2 size={18} style={{ animation: 'spin 1s linear infinite' }} /> Signing in…</>
                ) : (
                  'Sign in'
                )}
              </button>
            </form>

            <div className="divider">
              <div className="divider-line" />
              <span>secure access</span>
              <div className="divider-line" />
            </div>

            <p className="footer-note">
              Having trouble signing in?{' '}
              <a href="mailto:support@school.edu">Contact your administrator</a>
            </p>
          </div>
        </div>
      </div>
    </>
  );
};

export default Login;