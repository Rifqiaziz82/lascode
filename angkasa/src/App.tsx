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
          <main className="flex-grow pt-16">
            <Routes>
              {/* Public Routes */}
              // Di App.tsx
              <Route path="/" element={< Landing />} />
              
              <Route element={<PublicRoute />}>
                <Route path="/login" element={<LoginPage />} />
                <Route path="/daftar" element={<Register />} />
              </Route>

              {/* Protected Routes */}
              <Route element={<ProtectedRoute />}>
                <Route path="/forum" element={<Forum />} />
                <Route path="/profile" element={<Profil />} />
                <Route path="/verify-email" element={<VerifyEmailPage />} />
                <Route path="/email" element={<Email />} />
                <Route path="/email/:id" element={<EmailDetail />} />
              
                {/* <Route path="/email/:id" element={<EmailDetail />} /> */}
                <Route path="/email/accepted/:id" element={<EmailDetail />} />
                <Route path="/notifications" element={<Notifikasi />} />
              </Route>
            </Routes>
          </main>
        </div>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;