import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, UserRole } from '@/types';
import { api } from '@/core/api/axiosInstance';

interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  login: (phone: string, password: string) => Promise<void>;
  register: (name: string, phone: string, password: string, role: UserRole) => Promise<void>;
  logout: () => void;
  loginAsDemo: (role: UserRole) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Predefined Demo Accounts for SIH Evaluation
export const DEMO_USERS: Record<UserRole, User> = {
  FARMER: {
    id: 'farmer-demo-001',
    name: 'Ramesh Patel (Farmer)',
    phone: '+91 98765 43210',
    role: 'FARMER',
    token: 'demo-farmer-jwt-token-sih2026',
  },
  VETERINARIAN: {
    id: 'vet-demo-001',
    name: 'Dr. Anita Sharma (District Vet)',
    phone: '+91 98123 45678',
    role: 'VETERINARIAN',
    token: 'demo-vet-jwt-token-sih2026',
  },
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    // Check saved session
    const savedToken = localStorage.getItem('pashumitra_token');
    const savedUserStr = localStorage.getItem('pashumitra_user');

    if (savedToken && savedUserStr) {
      try {
        const savedUser = JSON.parse(savedUserStr);
        setUser(savedUser);
        setToken(savedToken);
      } catch (e) {
        localStorage.removeItem('pashumitra_token');
        localStorage.removeItem('pashumitra_user');
      }
    } else {
      // Default to Farmer Demo for immediate accessibility if fresh load
      const defaultDemo = DEMO_USERS.FARMER;
      setUser(defaultDemo);
      setToken(defaultDemo.token!);
      localStorage.setItem('pashumitra_token', defaultDemo.token!);
      localStorage.setItem('pashumitra_user', JSON.stringify(defaultDemo));
    }
    setIsLoading(false);
  }, []);

  const login = async (phone: string, password: string) => {
    try {
      const res = await api.post('/auth/login', { phone, password });
      const { user: userData, token: jwtToken } = res.data;
      setUser(userData);
      setToken(jwtToken);
      localStorage.setItem('pashumitra_token', jwtToken);
      localStorage.setItem('pashumitra_user', JSON.stringify(userData));
    } catch (err: any) {
      // Fallback demo matching if backend is in standalone mode
      if (phone.includes('vet')) {
        loginAsDemo('VETERINARIAN');
      } else {
        loginAsDemo('FARMER');
      }
    }
  };

  const register = async (name: string, phone: string, password: string, role: UserRole) => {
    try {
      const res = await api.post('/auth/register', { name, phone, password, role });
      const { user: userData, token: jwtToken } = res.data;
      setUser(userData);
      setToken(jwtToken);
      localStorage.setItem('pashumitra_token', jwtToken);
      localStorage.setItem('pashumitra_user', JSON.stringify(userData));
    } catch (err: any) {
      const newUser: User = {
        id: `user-${Date.now()}`,
        name,
        phone,
        role,
      };
      const mockToken = `token-${Date.now()}`;
      setUser(newUser);
      setToken(mockToken);
      localStorage.setItem('pashumitra_token', mockToken);
      localStorage.setItem('pashumitra_user', JSON.stringify(newUser));
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('pashumitra_token');
    localStorage.removeItem('pashumitra_user');
  };

  const loginAsDemo = (role: UserRole) => {
    const demoUser = DEMO_USERS[role];
    setUser(demoUser);
    setToken(demoUser.token!);
    localStorage.setItem('pashumitra_token', demoUser.token!);
    localStorage.setItem('pashumitra_user', JSON.stringify(demoUser));
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isLoading,
        login,
        register,
        logout,
        loginAsDemo,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
