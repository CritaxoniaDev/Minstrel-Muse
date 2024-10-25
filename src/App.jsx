import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { auth } from './config/firebase';
import Header from './components/Header';
import Auth from './components/Auth/Auth';
import Dashboard from './components/App/Dashboard';
import PrivacyPolicy from './components/PrivacyPolicy';
import './App.css';

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      setUser(user);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  return (
    <Router>
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50">
        <Header user={user} />
        <main className="container mx-auto px-4 py-8 flex items-center justify-center min-h-[calc(100vh-3.5rem)]">
          <Routes>
            <Route path="/" element={user ? <Navigate to="/dashboard" /> : <Auth />} />
            <Route path="/dashboard/*" element={user ? <Dashboard user={user} /> : <Navigate to="/" />} />
            <Route path="/privacy" element={<PrivacyPolicy />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
