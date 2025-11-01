// Mock authentication service for demo purposes
const mockAuthService = {
  // Mock users database
  users: [
    {
      id: 1,
      email: 'admin@gimsr.edu.in',
      password: 'admin123',
      name: 'Admin User',
      role: 'admin',
      isAdmin: true,
      bloodGroup: 'AB+',
      age: 35,
      phone: '+1 (555) 100-0001',
      address: 'Admin Office, GIMSR Campus',
      emergencyContact: '+1 (555) 100-0002'
    },
    {
      id: 2,
      email: 'user@example.com',
      password: 'user123',
      name: 'John Doe',
      role: 'user',
      isAdmin: false,
      bloodGroup: 'O+',
      age: 28,
      phone: '+1 (555) 123-4567',
      address: '123 Main Street, City, State 12345',
      emergencyContact: '+1 (555) 987-6543'
    }
  ],

  // Login function
  login: async (credentials) => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const user = mockAuthService.users.find(
          u => u.email === credentials.email && u.password === credentials.password
        );

        if (user) {
          const { password, ...userWithoutPassword } = user;
          const token = `mock-token-${user.id}-${Date.now()}`;
          
          resolve({
            success: true,
            message: 'Login successful',
            data: {
              token,
              user: userWithoutPassword
            }
          });
        } else {
          reject(new Error('Invalid credentials'));
        }
      }, 1000); // Simulate network delay
    });
  },

  // Get profile function
  getProfile: async () => {
    return new Promise((resolve, reject) => {
      const token = localStorage.getItem('token');
      if (token && token.startsWith('mock-token-')) {
        const userId = parseInt(token.split('-')[2]);
        const user = mockAuthService.users.find(u => u.id === userId);
        
        if (user) {
          const { password, ...userWithoutPassword } = user;
          resolve(userWithoutPassword);
        } else {
          reject(new Error('User not found'));
        }
      } else {
        reject(new Error('Invalid token'));
      }
    });
  },

  // Logout function
  logout: async () => {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({ success: true });
      }, 500);
    });
  },

  // Update profile (placeholder)
  updateProfile: async (profileData) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(profileData);
      }, 1000);
    });
  },

  // Change password (placeholder)
  changePassword: async (passwordData) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({ success: true });
      }, 1000);
    });
  }
};

export default mockAuthService;
