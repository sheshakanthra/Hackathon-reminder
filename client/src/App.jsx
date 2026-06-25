import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useContext, useEffect } from 'react';
import { AuthContext, AuthProvider } from './context/AuthContext';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Dashboard from './pages/Dashboard';
import AddHackathon from './pages/AddHackathon';
import EditHackathon from './pages/EditHackathon';
import Workflow from './pages/Workflow';
import Navbar from './components/Navbar';
import { checkAndSendReminders } from './services/reminders';

// ── Route guards ───────────────────────────────────────────────

const ProtectedRoute = ({ children }) => {
  const { user } = useContext(AuthContext);
  if (!user) return <Navigate to="/login" replace />;
  return children;
};

const PublicRoute = ({ children }) => {
  const { user } = useContext(AuthContext);
  if (user) return <Navigate to="/" replace />;
  return children;
};

// ── Reminder checker (runs once per session after login) ───────
// Must live inside <AuthProvider> so it can read the user from context.

const ReminderChecker = () => {
  const { user } = useContext(AuthContext);

  useEffect(() => {
    // Only run when the user is logged in and has an email address
    if (!user?.email) return;

    // Small delay so the app finishes rendering before making network calls
    const timer = setTimeout(() => {
      checkAndSendReminders(user.email);
    }, 2000);

    return () => clearTimeout(timer);
  }, [user?.email]); // Re-run if the user changes (e.g. after login)

  return null; // renders nothing
};

// ── App ────────────────────────────────────────────────────────

function App() {
  return (
    <AuthProvider>
      <Router>
        {/* Check + fire overdue reminders silently on every load */}
        <ReminderChecker />

        <div className="min-h-screen bg-gray-50">
          <Navbar />
          <div className="container mx-auto px-4 py-8">
            <Routes>
              <Route path="/login"  element={<PublicRoute><Login /></PublicRoute>} />
              <Route path="/signup" element={<PublicRoute><Signup /></PublicRoute>} />
              <Route
                path="/"
                element={<ProtectedRoute><Dashboard /></ProtectedRoute>}
              />
              <Route
                path="/add"
                element={<ProtectedRoute><AddHackathon /></ProtectedRoute>}
              />
              <Route
                path="/edit/:id"
                element={<ProtectedRoute><EditHackathon /></ProtectedRoute>}
              />
              <Route
                path="/workflow"
                element={<ProtectedRoute><Workflow /></ProtectedRoute>}
              />
            </Routes>
          </div>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
