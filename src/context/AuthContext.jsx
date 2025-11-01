import React, { createContext, useContext, useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import firebaseService from '../firebase/firebaseService';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Listen to Firebase auth state changes
  useEffect(() => {
    const unsubscribe = firebaseService.onAuthStateChanged(async (firebaseUser) => {
      try {
        if (firebaseUser) {
          // User is signed in, get the full user profile
          const userData = await firebaseService.getCurrentUser();
          setUser(userData);
          setIsAuthenticated(true);
        } else {
          // User is signed out
          setUser(null);
          setIsAuthenticated(false);
        }
      } catch (error) {
        console.error('Auth state change error:', error);
        // If user profile not found, they're logged out automatically
        setUser(null);
        setIsAuthenticated(false);
      } finally {
        setLoading(false);
      }
    });

    // Cleanup subscription on unmount
    return () => unsubscribe();
  }, []);

  const checkAuthStatus = async () => {
    try {
      setLoading(true);
      const userData = await firebaseService.getCurrentUser();
      setUser(userData);
      setIsAuthenticated(true);
    } catch (error) {
      console.error('Auth check failed:', error);
      setUser(null);
      setIsAuthenticated(false);
    } finally {
      setLoading(false);
    }
  };

  const login = async (credentials) => {
    try {
      setLoading(true);
      const response = await firebaseService.loginWithEmail(credentials.email, credentials.password);
      
      if (response.success) {
        setUser(response.data.user);
        setIsAuthenticated(true);
        toast.success(response.message || 'Login successful!');
        return { success: true, user: response.data.user };
      } else {
        toast.error(response.message || 'Login failed');
        return { success: false, error: response.message };
      }
    } catch (error) {
      console.error('Login failed:', error);
      const errorMessage = error.message || 'Login failed. Please try again.';
      toast.error(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      await firebaseService.logout();
      setUser(null);
      setIsAuthenticated(false);
      toast.info('Logged out successfully');
    } catch (error) {
      console.error('Logout error:', error);
      // Firebase auth state listener will handle clearing the user state
      toast.error('Logout failed');
    }
  };

  const updateProfile = async (profileData) => {
    try {
      const updatedUser = await firebaseService.updateProfile(profileData);
      setUser(updatedUser);
      toast.success('Profile updated successfully!');
      return { success: true };
    } catch (error) {
      console.error('Profile update failed:', error);
      const errorMessage = error.message || 'Failed to update profile';
      toast.error(errorMessage);
      return { success: false, error: errorMessage };
    }
  };

  const changePassword = async (passwordData) => {
    try {
      await firebaseService.changePassword(passwordData.newPassword);
      toast.success('Password changed successfully!');
      return { success: true };
    } catch (error) {
      console.error('Password change failed:', error);
      const errorMessage = error.message || 'Failed to change password';
      toast.error(errorMessage);
      return { success: false, error: errorMessage };
    }
  };

  const register = async (userData) => {
    try {
      setLoading(true);
      const response = await firebaseService.register(userData);
      
      if (response.success) {
        setUser(response.data.user);
        setIsAuthenticated(true);
        toast.success(response.message || 'Registration successful!');
        return { success: true, user: response.data.user };
      } else {
        toast.error(response.message || 'Registration failed');
        return { success: false, error: response.message };
      }
    } catch (error) {
      console.error('Registration failed:', error);
      const errorMessage = error.message || 'Registration failed. Please try again.';
      toast.error(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  const value = {
    user,
    loading,
    isAuthenticated,
    login,
    logout,
    register,
    updateProfile,
    changePassword,
    checkAuthStatus,
    firebaseService // Expose service for direct access when needed
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
