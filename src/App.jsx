import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { auth, db } from './config/firebase';
import { doc, getDoc } from 'firebase/firestore';
import Header from './components/Header';
import Auth from './components/Auth/Auth';
import Dashboard from './components/App/Dashboard';
import PendingApproval from './components/Auth/PendingApproval';
import Profile from './components/Profile/Profile';
import './App.css';

function App() {
  const [user, setUser] = useState(null);
  const [isApproved, setIsApproved] = useState(false);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      setUser(user);
      
      if (user) {
        const userDoc = await getDoc(doc(db, "users", user.uid));
        if (userDoc.exists()) {
          setIsApproved(userDoc.data().isApproved || false);
        }
      }
    });

    return () => unsubscribe();
  }, []);

  return (
    <Router>
      <div className="min-h-screen bg-background">
        <Header user={user} isApproved={isApproved} />
        <div className="pt-10">
          <Routes>
            <Route
              path="/"
              element={user ? (
                isApproved ? (
                  <Navigate to="/dashboard" />
                ) : (
                  <PendingApproval />
                )
              ) : (
                <Auth />
              )}
            />
            <Route
              path="/dashboard/*"
              element={
                user ? (
                  isApproved ? (
                    <Dashboard user={user} />
                  ) : (
                    <Navigate to="/" />
                  )
                ) : (
                  <Navigate to="/" />
                )
              }
            />
            <Route
              path="/dashboard/profile"
              element={user ? <Profile /> : <Navigate to="/" />}
            />
            <Route
              path="/dashboard/profile/:userId"
              element={user ? <Profile /> : <Navigate to="/" />}
            />
          </Routes>
        </div>
      </div>
    </Router>
  );
}

export default App;
