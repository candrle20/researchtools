import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { ThemeProvider } from '@mui/material/styles';
import { AuthProvider, useAuth } from './components/auth/AuthContext';
import theme from './theme';
import { Box, CssBaseline, CircularProgress } from '@mui/material';

// Layout Components
import Navbar from './components/common/Navbar';
import Sidebar from './components/common/Sidebar';

// Pages
import Home from './components/common/Home';
import Login from './components/auth/Login';
import DeveloperLogin from './components/auth/DeveloperLogin';
import Register from './components/common/Register';
import Search from './components/common/Search';
import SearchResults from './components/common/SearchResults';

// Developer Portal Components
import DeveloperLayout from './components/developer/DeveloperLayout';
import DeveloperDashboard from './components/developer/DeveloperDashboard';
import UserManagement from './components/developer/UserManagement';
import LabManagement from './components/developer/LabManagement';
import InstitutionManagement from './components/developer/InstitutionManagement';
import UserProfile from './components/common/UserProfile';

// Protocol Components
import ProtocolList from './components/common/ProtocolList';
import ProtocolDetail from './components/common/ProtocolDetail';
import ProtocolForm from './components/common/ProtocolForm';

function AppRoutes() {
  const { isAuthenticated, loading, user } = useAuth();
  const location = useLocation();
  
  // Define public paths where sidebar should not appear
  const publicPaths = ['/login', '/register', '/developer/login'];
  const isPublicPath = publicPaths.some(path => location.pathname === path);
  const isDeveloperPath = location.pathname.startsWith('/developer');
  const isDeveloperUser = user?.portal === 'developer';

  // Show loading spinner while checking auth
  if (loading) {
    return <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
      <CircularProgress />
    </Box>;
  }

  // Redirect developer users to developer dashboard if they try to access regular routes
  if (isDeveloperUser && !isDeveloperPath && !isPublicPath) {
    return <Navigate to="/developer/dashboard" replace />;
  }

  // Redirect regular users to home if they try to access developer routes
  if (!isDeveloperUser && isDeveloperPath && !isPublicPath) {
    return <Navigate to="/developer/login" replace />;
  }

  return (
    <Box sx={{ display: 'flex' }}>
      <CssBaseline />
      <Navbar />
      {isAuthenticated && !isPublicPath && !isDeveloperPath && <Sidebar />}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          mt: 8,
          ml: (isAuthenticated && !isPublicPath && !isDeveloperPath) ? '240px' : 0,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          maxWidth: (isAuthenticated && !isPublicPath && !isDeveloperPath) ? 'calc(100% - 240px)' : '100%',
          position: 'relative',
          margin: '0 auto',
          boxSizing: 'border-box',
          minHeight: '100vh',
        }}
      >
        <Box 
          sx={{ 
            width: '100%', 
            maxWidth: '1200px',
            pt: 4,
            pb: 6,
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
          }}
        > 
          <Routes>
            {/* Public Routes */}
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/developer/login" element={<DeveloperLogin />} />

            {/* Developer Routes */}
            <Route path="/developer/*" element={
              isAuthenticated && isDeveloperUser ? (
                <DeveloperLayout />
              ) : (
                <Navigate to="/developer/login" replace />
              )
            }>
              <Route path="dashboard" element={<DeveloperDashboard />} />
              <Route path="users" element={<UserManagement />} />
              <Route path="institutions" element={<InstitutionManagement />} />
              <Route path="labs" element={<LabManagement />} />
              <Route path="profile" element={<UserProfile />} />
              <Route index element={<Navigate to="dashboard" replace />} />
            </Route>

            {/* Regular User Routes */}
            {isAuthenticated && !isDeveloperUser && (
              <>
                <Route path="/" element={<Home />} />
                <Route path="/protocols" element={<ProtocolList />} />
                <Route path="/protocols/new" element={<ProtocolForm />} />
                <Route path="/protocols/:id" element={<ProtocolDetail />} />
                <Route path="/protocols/:id/edit" element={<ProtocolForm />} />
                <Route path="/search" element={<Search />} />
                <Route path="/search/results" element={<SearchResults />} />
                <Route path="/profile" element={<UserProfile />} />

                {/* Admin Routes */}
                <Route path="/admin" element={<Home />} />
                <Route path="/admin/users" element={<UserManagement />} />
                <Route path="/admin/protocols" element={<ProtocolList />} />
                <Route path="/admin/search" element={<Search />} />
              </>
            )}

            {/* Catch-all redirect */}
            <Route path="*" element={
              <Navigate to={isDeveloperUser ? "/developer/dashboard" : "/login"} replace />
            } />
          </Routes>
        </Box>
      </Box>
    </Box>
  );
}

function App() {
  return (
    <Router>
      <ThemeProvider theme={theme}>
        <AuthProvider>
          <AppRoutes />
        </AuthProvider>
      </ThemeProvider>
    </Router>
  );
}

export default App;
