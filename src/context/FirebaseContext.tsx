import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { getData, onValue, ref } from '../firebase/database';
import { onAuthStateChange } from '../firebase/auth';
import { database } from '../firebase/firebase';
import { User } from 'firebase/auth';

interface FirebaseData {
  navigation?: any;
  hero?: any;
  about?: any;
  skills?: any;
  services?: any;
  projects?: any[];
  testimonials?: any;
  resume?: any;
  socials?: any;
  contact?: any;
  footer?: any;
  seo?: any;
  theme?: any;
  analytics?: any;
  messages?: any[];
}

interface FirebaseContextType {
  data: FirebaseData;
  loading: boolean;
  user: User | null;
  refreshData: () => void;
}

const FirebaseContext = createContext<FirebaseContextType | undefined>(undefined);

export const useFirebase = () => {
  const context = useContext(FirebaseContext);
  if (!context) {
    throw new Error('useFirebase must be used within a FirebaseProvider');
  }
  return context;
};

interface FirebaseProviderProps {
  children: ReactNode;
}

export const FirebaseProvider: React.FC<FirebaseProviderProps> = ({ children }) => {
  const [data, setData] = useState<FirebaseData>({});
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<User | null>(null);

  const setupRealtimeListeners = () => {
    const paths = [
      'siteConfig/navigation',
      'siteConfig/hero',
      'siteConfig/about',
      'siteConfig/skills',
      'siteConfig/services',
      'siteConfig/projects',
      'siteConfig/testimonials',
      'siteConfig/resume',
      'siteConfig/socials',
      'siteConfig/contact',
      'siteConfig/footer',
      'siteConfig/seo',
      'siteConfig/theme',
      'siteConfig/analytics',
      'messages'
    ];

    const listeners: any[] = [];

    paths.forEach((path) => {
      const dataRef = ref(database, path);
      const unsubscribe = onValue(dataRef, (snapshot) => {
        const value = snapshot.val();
        setData(prevData => ({
          ...prevData,
          [path.split('/').pop() || path]: value
        }));
      });
      listeners.push(unsubscribe);
    });

    return () => {
      listeners.forEach(unsubscribe => unsubscribe());
    };
  };

  useEffect(() => {
    // Initial data fetch
    fetchData();

    // Setup real-time listeners
    const cleanup = setupRealtimeListeners();

    // Auth listener
    const unsubscribeAuth = onAuthStateChange(setUser);

    return () => {
      cleanup();
      unsubscribeAuth();
    };
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [
        navigation,
        hero,
        about,
        skills,
        services,
        projects,
        testimonials,
        resume,
        socials,
        contact,
        footer,
        seo,
        theme,
        analytics,
        messages
      ] = await Promise.all([
        getData('siteConfig/navigation'),
        getData('siteConfig/hero'),
        getData('siteConfig/about'),
        getData('siteConfig/skills'),
        getData('siteConfig/services'),
        getData('siteConfig/projects'),
        getData('siteConfig/testimonials'),
        getData('siteConfig/resume'),
        getData('siteConfig/socials'),
        getData('siteConfig/contact'),
        getData('siteConfig/footer'),
        getData('siteConfig/seo'),
        getData('siteConfig/theme'),
        getData('siteConfig/analytics'),
        getData('messages')
      ]);
      setData({
        navigation,
        hero,
        about,
        skills,
        services,
        projects,
        testimonials,
        resume,
        socials,
        contact,
        footer,
        seo,
        theme,
        analytics,
        messages
      });
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const refreshData = () => {
    fetchData();
  };

  return (
    <FirebaseContext.Provider value={{ data, loading, user, refreshData }}>
      {children}
    </FirebaseContext.Provider>
  );
};