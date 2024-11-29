import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/layout/Navbar';
import Home from './components/pages/Home';
import Login from './components/pages/Login';
import UsersAndLabs from './components/pages/UsersAndLabs';
import ProtocolStandards from './components/pages/ProtocolStandards';
import UserProfile from './components/pages/UserProfile';
import AdminDashboard from './components/pages/AdminDashboard';
import ProtocolList from './components/pages/ProtocolList';
import Search from './components/pages/Search';
import { AuthProvider } from './context/AuthContext';
import './App.css';

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="App">
          <Navbar />
          <main>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/login" element={<Login />} />
              <Route path="/admin/dashboard" element={<AdminDashboard />} />
              <Route path="/admin/users-and-labs" element={<UsersAndLabs />} />
              <Route path="/standards" element={<ProtocolStandards />} />
              <Route path="/protocols" element={<ProtocolList />} />
              <Route path="/researcher/protocols" element={<ProtocolList />} />
              <Route path="/search" element={<Search />} />
              <Route path="/profile" element={<UserProfile />} />
            </Routes>
          </main>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
