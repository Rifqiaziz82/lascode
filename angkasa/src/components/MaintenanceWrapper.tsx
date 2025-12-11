import { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useMaintenance } from '../config/maintenance';
import { useAuth } from './AuthProvider';

interface MaintenanceWrapperProps {
  children: React.ReactNode;
}

export default function MaintenanceWrapper({ children }: MaintenanceWrapperProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const { config, loading } = useMaintenance();

  useEffect(() => {
    if (loading) return;

    const path = location.pathname;
    let isMaintenance = false;

    // Define whitelist paths (Always accessible)
    const whitelist = [
        '/maintenance', 
        '/admin/central/login', 
        '/admin/provider/login', 
        '/login', 
        '/register' // Optional: decide if registration is allowed during maintenance
    ];

    // If current path is in whitelist, skip checks
    if (whitelist.some(p => path === p || path.startsWith(p + '/'))) { // Basic whitelist check
         // Double check if we are on maintenance page but maintenance is OFF -> redirect to home
         if (path === '/maintenance' && !config.user && !config.dashAdmin && !config.adminCentral) {
             navigate('/');
         }
         return;
    }

    // Determine if current route is under maintenance based on role/path
    if (path.startsWith('/admin/central')) {
        if (config.adminCentral) isMaintenance = true;
    } else if (path.startsWith('/DashAdmin')) {
        if (config.dashAdmin) isMaintenance = true;
    } else if (path.startsWith('/admin/provider')) {
         // Assuming provider might have its own or share one? 
         // For now, let's treat provider as DashAdmin or add a new key if needed.
         // Based on UI, there isn't a "Provider" toggle, only DashAdmin.
         // Let's assume Provider is safe or falls under DashAdmin? 
         // Safety: If no specific toggle, maybe it's open.
    } else {
        // General user routes (everything else)
        if (config.user) {
            isMaintenance = true;
        }
    }

    // Redirect to maintenance page if needed
    if (isMaintenance) {
      console.log(`Access denied to ${path} due to maintenance mode.`);
      navigate('/maintenance');
    }
    
  }, [config, location.pathname, loading, navigate]);

  if (loading) return null; // Or a spinner

  return <>{children}</>;
}
