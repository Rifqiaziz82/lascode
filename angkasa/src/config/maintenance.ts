import { useState, useEffect } from 'react';
import { doc, onSnapshot, updateDoc, setDoc } from 'firebase/firestore';
import { db } from '../firebase';

export interface MaintenanceConfig {
  user: boolean;
  dashAdmin: boolean;
  adminCentral: boolean;
}

const DEFAULT_CONFIG: MaintenanceConfig = {
  user: false,
  dashAdmin: false,
  adminCentral: false
};

export function useMaintenance() {
  const [config, setConfig] = useState<MaintenanceConfig>(DEFAULT_CONFIG);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onSnapshot(doc(db, 'settings', 'maintenance'), (docSnap) => {
      if (docSnap.exists()) {
        setConfig(docSnap.data() as MaintenanceConfig);
      } else {
        // Create default if not exists
        setDoc(doc(db, 'settings', 'maintenance'), DEFAULT_CONFIG);
        setConfig(DEFAULT_CONFIG);
      }
      setLoading(false);
    }, (error) => {
      console.error("Error fetching maintenance settings:", error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const toggleMaintenance = async (key: keyof MaintenanceConfig) => {
    try {
      await updateDoc(doc(db, 'settings', 'maintenance'), {
        [key]: !config[key]
      });
    } catch (err) {
      console.error("Failed to update maintenance:", err);
      throw err;
    }
  };

  return { config, loading, toggleMaintenance };
}