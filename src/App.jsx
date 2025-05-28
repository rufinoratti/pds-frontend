
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Layout from '@/components/Layout';
import Home from '@/pages/Home';
import AuthPage from '@/pages/AuthPage';
import FindMatchPage from '@/pages/FindMatchPage';
import CreateMatchPage from '@/pages/CreateMatchPage';
import MatchDetailsPage from '@/pages/MatchDetailsPage';
import UserProfilePage from '@/pages/UserProfilePage'; // Assuming you'll create this
import { Toaster } from '@/components/ui/toaster'; // Already exists

// Placeholder for EditMatchPage if you implement it
// import EditMatchPage from '@/pages/EditMatchPage'; 

function App() {
  return (
    <Router>
      <Toaster />
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Home />} />
          <Route path="auth" element={<AuthPage />} />
          <Route path="find-match" element={<FindMatchPage />} />
          <Route path="create-match" element={<CreateMatchPage />} />
          <Route path="match/:matchId" element={<MatchDetailsPage />} />
          <Route path="profile/:username" element={<UserProfilePage />} /> 
          {/* Example for a protected route or edit page */}
          {/* <Route path="edit-match/:matchId" element={<EditMatchPage />} /> */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
  