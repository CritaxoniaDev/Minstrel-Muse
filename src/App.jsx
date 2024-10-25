import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { auth } from './config/firebase';
import Header from './components/Header';
import Auth from './components/Auth/Auth';
import Dashboard from './components/App/Dashboard';
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
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }

  return (
    <Router>
      <div className="min-h-screen bg-background">
        <Header user={user} />
        <div className="pt-10">
          <Routes>
            <Route
              path="/"
              element={user ? <Navigate to="/dashboard" /> : <Auth />}
            />
            <Route
              path="/dashboard/*"
              element={user ? <Dashboard user={user} /> : <Navigate to="/" />}
            />
          </Routes>
        </div>
      </div>
    </Router>
  );
}

export default App;
