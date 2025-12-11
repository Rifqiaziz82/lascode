import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './components/AuthProvider';
import Particles from './components/Particles'; 
import VerifyEmailPage from './components/VerifyEmail';
import { ProtectedRoute } from './components/ProtectedRoute';
import { PublicRoute } from './components/PublicRoute';
import Landing from './pages/Landing';
import LoginPage from './pages/LoginPage';
import Forum from './pages/Forum';
import Email from './pages/Email';
import EmailDetail from './pages/EmailDetail';
import Notifikasi from './pages/Notifikasi';
import Register from './pages/Register';
import Profil from './pages/Profil';
import AIAgent from './components/AIAgent';
import CentralDashboard from './pages/admin/CentralDashboard';
import CentralUsers from './pages/admin/CentralUsers';
import CentralReports from './pages/admin/CentralReports';
import MaintenanceWrapper from './components/MaintenanceWrapper';
import MaintenancePage from './pages/MaintenancePage';
import PublicProfile from './pages/PublicProfile';
import DashAdminApp from './pages/DashAdmin/AdminDash';
import CentralLogin from './pages/admin/CentralLogin';
import CentralGuard from './components/CentralGuard';


function App() {
  return (
    <BrowserRouter>
      <AuthProvider> 
        {/* Background layers */}
        <div className="fixed inset-0 z-[-2] bg-black"></div>
        <div className="fixed inset-0 z-[-1] pointer-events-none">
          <Particles
            particleCount={150}
            particleSpread={8}
            speed={0.08}
            particleColors={['#ffffff']}
            moveParticlesOnHover={true}
            alphaParticles={false}
            particleBaseSize={60}
            disableRotation={false}
            className="w-full h-full"
          />
        </div>

        {/* Main layout */}
        <div className="relative z-10 flex flex-col min-h-screen">
          <main className="flex-grow">
            <MaintenanceWrapper>
              <Routes>
                {/* Public Routes */}
                <Route path="/" element={<Landing />} />
                <Route path="/user/:id" element={<PublicProfile />} />
                
                <Route element={<PublicRoute />}>
                  <Route path="/login" element={<LoginPage />} />
                  <Route path="/daftar" element={<Register />} />
                </Route>
                
                {/* Separate Login for Admin Central (Accessible even if logged in as user) */}
                <Route path="/admin/central/login" element={<CentralLogin />} /> 
                
                {/* Admin Central Routes - Protected by CentralGuard & Maintenance */}
                <Route element={<CentralGuard />}>
                  <Route path="/admin/central" element={<CentralDashboard />} />
                  <Route path="/admin/central/users" element={<CentralUsers />} />
                  <Route path="/admin/central/reports" element={<CentralReports />} />
                </Route>

                {/* Protected Routes */}
                <Route element={<ProtectedRoute />}>
                  <Route path="/forum" element={<Forum />} />
                  <Route path="/profile" element={<Profil />} />
                  <Route path="/verify-email" element={<VerifyEmailPage />} />
                  <Route path="/email" element={<Email />} />
                  <Route path="/email/:id" element={<EmailDetail />} />
                
                  <Route path="/email/accepted/:id" element={<EmailDetail />} />
                  <Route path="/notifications" element={<Notifikasi />} />
                </Route>

                {/* DashAdmin Routes */}
                <Route path="/DashAdmin" element={<DashAdminApp />} />
                <Route path="/DashAdmin/AdminDash" element={<DashAdminApp />} />
                
                {/* Maintenance Page Route */}
                <Route path="/maintenance" element={<MaintenancePage />} />
              </Routes>
            </MaintenanceWrapper>
          </main>
          <AIAgent />
        </div>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;