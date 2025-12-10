import { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { doc, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from './AuthProvider';

interface MaintenanceWrapperProps {
  children: React.ReactNode;
}

export default function MaintenanceWrapper({ children }: MaintenanceWrapperProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);

  // Default config just in case
  const [config, setConfig] = useState({
    user: false,
    dashAdmin: false,
    adminCentral: false
  });

  useEffect(() => {
    // Subscribe to maintenance settings
    const unsubscribe = onSnapshot(doc(db, 'settings', 'maintenance'), (doc) => {
      if (doc.exists()) {
        setConfig(doc.data() as any);
      }
      setLoading(false);
    }, (error) => {
        console.error("Error fetching maintenance settings:", error);
        setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (loading) return;

    const path = location.pathname;
    let isMaintenance = false;

    // Determine if current route is under maintenance based on role/path
    if (path.startsWith('/admin/central')) {
        if (config.adminCentral) isMaintenance = true;
    } else if (path.startsWith('/DashAdmin')) {
        if (config.dashAdmin) isMaintenance = true;
    } else {
        // General user routes (exclude login/register/maintenance to avoid loops)
        const publicRoutes = ['/login', '/register', '/maintenance', '/'];
        // Allow landing page usually? The user said "pengunjung situs website", usually implies the main app.
        // Let's assume general user maintenance blocks everything except landing? Or maybe just the app parts.
        // For safety, let's block everything except auth if maintenance is on.
        // Actually, usually Landing is open, but App is closed.
        // Let's assume if it's NOT a special admin route, it's "user" scope.
        if (config.user && !path.startsWith('/maintenance') && !path.startsWith('/admin') && !path.startsWith('/DashAdmin')) {
            // Allow login/register even in maintenance? Maybe not.
            // Usually maintenance means "Site Down".
            // Let's allow admins to bypass if they are logged in maybe?
            // The request didn't specify bypass logic, just "block".
            // We will redirect to /maintenance.
            isMaintenance = true;
        }
    }

    // Redirect to maintenance page if needed
    if (isMaintenance && location.pathname !== '/maintenance') {
      navigate('/maintenance');
    }
    
    // Redirect OUT of maintenance page if maintenance is OFF
    if (!isMaintenance && location.pathname === '/maintenance') {
        navigate('/');
    }

  }, [config, location.pathname, loading, navigate]);

  if (loading) return null; // Or a spinner

  return <>{children}</>;
}
