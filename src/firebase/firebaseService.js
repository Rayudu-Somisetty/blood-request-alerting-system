// Firebase service for Blood Alert
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged,
  updateProfile as updateFirebaseProfile,
  updatePassword,
  sendPasswordResetEmail
} from 'firebase/auth';
import { 
  doc, 
  setDoc, 
  getDoc, 
  updateDoc, 
  deleteDoc, 
  collection, 
  getDocs, 
  addDoc, 
  serverTimestamp,
  writeBatch,
  query,
  where,
  or
} from 'firebase/firestore';
import { auth, db } from './config';

class FirebaseService {
  // Helper method to convert username to Firebase-compatible email
  generateAuthEmail(username) {
    return `${username.toLowerCase()}@bloodalert.internal`;
  }

  // Helper method to check if username exists
  async isUsernameAvailable(username) {
    try {
      const usersRef = collection(db, 'users');
      const usersSnapshot = await getDocs(usersRef);
      
      for (const doc of usersSnapshot.docs) {
        if (doc.data().username === username.toLowerCase()) {
          return false;
        }
      }
      return true;
    } catch (error) {
      console.error('Error checking username:', error);
      throw new Error('Unable to verify username availability');
    }
  }

  // Authentication Methods
  async login(username, password) {
    try {
      // Convert username to internal auth email
      const authEmail = this.generateAuthEmail(username);
      
      const userCredential = await signInWithEmailAndPassword(auth, authEmail, password);
      const user = userCredential.user;
      
      // Get additional user data from Firestore
      const userDocRef = doc(db, 'users', user.uid);
      const userDoc = await getDoc(userDocRef);
      
      if (userDoc.exists()) {
        const userData = { ...userDoc.data(), uid: user.uid };
        return {
          success: true,
          message: 'Login successful',
          data: {
            token: await user.getIdToken(),
            user: userData
          }
        };
      } else {
        throw new Error('User profile not found');
      }
    } catch (error) {
      console.error('Login error:', error);
      throw new Error(this.getErrorMessage(error));
    }
  }

  async loginWithEmail(email, password) {
    try {
      // First, check if this is a direct email login (admin accounts)
      let userCredential;
      try {
        userCredential = await signInWithEmailAndPassword(auth, email, password);
      } catch (directEmailError) {
        // If direct email fails, check if there's a user with this email in Firestore
        // and try with their username-based auth
        const usersRef = collection(db, 'users');
        const usersSnapshot = await getDocs(usersRef);
        
        let foundUser = null;
        usersSnapshot.forEach((doc) => {
          const userData = doc.data();
          if (userData.email === email && userData.username) {
            foundUser = userData;
          }
        });
        
        if (foundUser && foundUser.username) {
          // Try logging in with username
          const authEmail = this.generateAuthEmail(foundUser.username);
          userCredential = await signInWithEmailAndPassword(auth, authEmail, password);
        } else {
          throw directEmailError;
        }
      }
      
      const user = userCredential.user;
      
      // Get additional user data from Firestore
      try {
        const userDocRef = doc(db, 'users', user.uid);
        const userDoc = await getDoc(userDocRef);
        
        if (userDoc.exists()) {
          const userData = { ...userDoc.data(), uid: user.uid };
          return {
            success: true,
            message: 'Login successful',
            data: {
              token: await user.getIdToken(),
              user: userData
            }
          };
        } else {
          // User authenticated but no Firestore profile - this is OK for some users
          console.warn('User authenticated but no Firestore profile found, using basic auth data');
          return {
            success: true,
            message: 'Login successful',
            data: {
              token: await user.getIdToken(),
              user: {
                uid: user.uid,
                email: user.email,
                displayName: user.displayName,
                role: 'user'
              }
            }
          };
        }
      } catch (firestoreError) {
        console.warn('Firestore read error during login, using basic auth data:', firestoreError);
        // If Firestore read fails, still return successful login with basic user data
        return {
          success: true,
          message: 'Login successful',
          data: {
            token: await user.getIdToken(),
            user: {
              uid: user.uid,
              email: user.email,
              displayName: user.displayName,
              role: 'user'
            }
          }
        };
      }
    } catch (error) {
      console.error('Login with email error:', error);
      throw new Error(this.getErrorMessage(error));
    }
  }

  async register(userData) {
    try {
      const { email, password, username, ...profileData } = userData;
      
      // Check if username is available
      if (username) {
        const isAvailable = await this.isUsernameAvailable(username);
        if (!isAvailable) {
          throw new Error('Username is already taken. Please choose another one.');
        }
      }
      
      let user;
      let userCredential;
      
      // Create user with username/password
      // Generate internal email from username for Firebase Auth
      const authEmail = username ? this.generateAuthEmail(username) : email;
      userCredential = await createUserWithEmailAndPassword(auth, authEmail, password);
      user = userCredential.user;
      
      // Create user profile in Firestore
      const userProfile = {
        ...profileData,
        email: email, // Real email for communication
        username: username ? username.toLowerCase() : null, // Username for login
        uid: user.uid,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        isActive: true,
        isVerified: true, // Email verified via OTP
        totalDonations: 0,
        totalRequests: 0,
        role: profileData.role || 'user',
        userType: 'user', // All users are universal (can donate and request)
        canDonate: true,
        canRequest: true,
        authMethod: 'username'
      };
      
      await setDoc(doc(db, 'users', user.uid), userProfile);
      
      // Update Firebase profile
      await updateFirebaseProfile(user, {
        displayName: `${profileData.firstName} ${profileData.lastName}`
      });
      
      return {
        success: true,
        message: 'Registration successful',
        data: {
          token: await user.getIdToken(),
          user: userProfile
        }
      };
    } catch (error) {
      console.error('Registration error:', error);
      throw new Error(this.getErrorMessage(error));
    }
  }

  async logout() {
    try {
      await signOut(auth);
      return { success: true };
    } catch (error) {
      console.error('Logout error:', error);
      throw new Error(this.getErrorMessage(error));
    }
  }

  async getCurrentUser() {
    try {
      const user = auth.currentUser;
      if (!user) {
        throw new Error('No authenticated user');
      }
      
      const userDocRef = doc(db, 'users', user.uid);
      const userDoc = await getDoc(userDocRef);
      
      if (userDoc.exists()) {
        const userData = { ...userDoc.data(), uid: user.uid, email: user.email };
        
        // Determine admin type based on role
        if (userData.role === 'admin') {
          userData.adminType = 'admin';
          userData.canModifyData = true;
          userData.canAddAdmins = true;
        }
        
        return userData;
      } else {
        // User authenticated but profile not created - log them out
        console.warn('User authenticated but profile not found. Logging out...');
        await signOut(auth);
        throw new Error('User profile not found. Please register again.');
      }
    } catch (error) {
      console.error('Get current user error:', error);
      throw new Error(this.getErrorMessage(error));
    }
  }

  async updateProfile(profileData) {
    try {
      const user = auth.currentUser;
      if (!user) {
        throw new Error('No authenticated user');
      }
      
      console.log('Updating user profile in Firestore for UID:', user.uid);
      console.log('Profile data to update:', profileData);
      
      const userDocRef = doc(db, 'users', user.uid);
      const updateData = {
        ...profileData,
        updatedAt: serverTimestamp()
      };
      
      await updateDoc(userDocRef, updateData);
      console.log('✅ Profile successfully updated in Firestore database');
      
      // Update Firebase profile if name changed
      if (profileData.firstName || profileData.lastName) {
        await updateFirebaseProfile(user, {
          displayName: `${profileData.firstName || ''} ${profileData.lastName || ''}`.trim()
        });
        console.log('✅ Firebase Auth display name updated');
      }
      
      const updatedUser = await this.getCurrentUser();
      console.log('✅ Retrieved updated user data from database:', updatedUser);
      return updatedUser;
    } catch (error) {
      console.error('Update profile error:', error);
      throw new Error(this.getErrorMessage(error));
    }
  }

  async changePassword(newPassword) {
    try {
      const user = auth.currentUser;
      if (!user) {
        throw new Error('No authenticated user');
      }
      
      await updatePassword(user, newPassword);
      return { success: true };
    } catch (error) {
      console.error('Change password error:', error);
      throw new Error(this.getErrorMessage(error));
    }
  }

  async resetPassword(email) {
    try {
      await sendPasswordResetEmail(auth, email);
      return { success: true };
    } catch (error) {
      console.error('Reset password error:', error);
      throw new Error(this.getErrorMessage(error));
    }
  }

  // Phone Authentication Support Methods
  async createUserProfile(uid, profileData) {
    try {
      const userProfile = {
        ...profileData,
        uid,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        isActive: true,
        isVerified: true, // Phone verified users are considered verified
        totalDonations: 0,
        totalRequests: 0,
        role: profileData.role || 'user',
        userType: 'user',
        canDonate: true,
        canRequest: true
      };
      
      await setDoc(doc(db, 'users', uid), userProfile);
      return userProfile;
    } catch (error) {
      console.error('Create user profile error:', error);
      throw new Error(this.getErrorMessage(error));
    }
  }

  async getUserProfile(uid) {
    try {
      const userDocRef = doc(db, 'users', uid);
      const userDoc = await getDoc(userDocRef);
      
      if (userDoc.exists()) {
        return { ...userDoc.data(), uid };
      } else {
        throw new Error('User profile not found');
      }
    } catch (error) {
      console.error('Get user profile error:', error);
      throw new Error(this.getErrorMessage(error));
    }
  }

  async updateUserLastLogin(uid) {
    try {
      const userDocRef = doc(db, 'users', uid);
      await updateDoc(userDocRef, {
        lastLoginAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
    } catch (error) {
      console.error('Update last login error:', error);
      throw new Error(this.getErrorMessage(error));
    }
  }

  // User Management Methods (Admin)
  async getUsers(filters = {}) {
    try {
      const usersRef = collection(db, 'users');
      
      // Get all users first to avoid index issues
      const querySnapshot = await getDocs(usersRef);
      let users = [];
      
      querySnapshot.forEach((doc) => {
        users.push({ id: doc.id, ...doc.data() });
      });
      
      // Apply filters in JavaScript
      // Note: userType filter removed since all users are now universal
      
      if (filters.bloodGroup) {
        users = users.filter(user => user.bloodGroup === filters.bloodGroup);
      }
      
      // Sort by createdAt (newest first)
      users.sort((a, b) => {
        const aDate = a.createdAt?.toDate?.() || new Date(a.createdAt || 0);
        const bDate = b.createdAt?.toDate?.() || new Date(b.createdAt || 0);
        return bDate - aDate;
      });
      
      // Apply limit after sorting
      if (filters.limit) {
        users = users.slice(0, filters.limit);
      }
      
      return {
        success: true,
        data: users,
        total: users.length
      };
    } catch (error) {
      console.error('Get users error:', error);
      throw new Error(this.getErrorMessage(error));
    }
  }

  async getUserById(userId) {
    try {
      const userDocRef = doc(db, 'users', userId);
      const userDoc = await getDoc(userDocRef);
      
      if (userDoc.exists()) {
        return { id: userDoc.id, ...userDoc.data() };
      } else {
        throw new Error('User not found');
      }
    } catch (error) {
      console.error('Get user by ID error:', error);
      throw new Error(this.getErrorMessage(error));
    }
  }

  async updateUser(userId, userData) {
    try {
      console.log('Updating user in Firestore database:', userId);
      console.log('Update data:', userData);
      
      const userDocRef = doc(db, 'users', userId);
      const updateData = {
        ...userData,
        updatedAt: serverTimestamp()
      };
      
      await updateDoc(userDocRef, updateData);
      console.log('✅ User successfully updated in database');
      
      const updatedUser = await this.getUserById(userId);
      console.log('✅ Retrieved updated user from database:', updatedUser);
      return updatedUser;
    } catch (error) {
      console.error('❌ Update user error:', error);
      throw new Error(this.getErrorMessage(error));
    }
  }

  async deleteUser(userId) {
    try {
      console.log('Deleting user from Firestore database:', userId);
      
      const userDocRef = doc(db, 'users', userId);
      await deleteDoc(userDocRef);
      
      console.log('✅ User successfully deleted from database');
      return { success: true };
    } catch (error) {
      console.error('❌ Delete user error:', error);
      throw new Error(this.getErrorMessage(error));
    }
  }

  // Donations Methods
  async createDonation(donationData) {
    try {
      const user = auth.currentUser;
      if (!user) {
        throw new Error('No authenticated user');
      }
      
      console.log('Creating new donation in Firestore database');
      console.log('Donation data:', donationData);
      
      const donation = {
        ...donationData,
        donorId: user.uid,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        status: 'scheduled'
      };
      
      const docRef = await addDoc(collection(db, 'donations'), donation);
      console.log('✅ Donation successfully created in database with ID:', docRef.id);
      
      // Update user's donation count
      const userDocRef = doc(db, 'users', user.uid);
      const userDoc = await getDoc(userDocRef);
      if (userDoc.exists()) {
        const currentDonations = userDoc.data().totalDonations || 0;
        await updateDoc(userDocRef, {
          totalDonations: currentDonations + 1,
          lastDonationDate: serverTimestamp(),
          updatedAt: serverTimestamp()
        });
        console.log('✅ User donation count updated in database');
      }
      
      return { id: docRef.id, ...donation };
    } catch (error) {
      console.error('❌ Create donation error:', error);
      throw new Error(this.getErrorMessage(error));
    }
  }

  async getDonations(filters = {}) {
    try {
      const donationsRef = collection(db, 'donations');
      
      // Get all donations first to avoid index issues
      const querySnapshot = await getDocs(donationsRef);
      let donations = [];
      
      querySnapshot.forEach((doc) => {
        donations.push({ id: doc.id, ...doc.data() });
      });
      
      // Apply filters in JavaScript
      if (filters.donorId) {
        donations = donations.filter(donation => donation.donorId === filters.donorId);
      }
      
      if (filters.status) {
        donations = donations.filter(donation => donation.status === filters.status);
      }
      
      // Sort by createdAt (newest first)
      donations.sort((a, b) => {
        const aDate = a.createdAt?.toDate?.() || new Date(a.createdAt || 0);
        const bDate = b.createdAt?.toDate?.() || new Date(b.createdAt || 0);
        return bDate - aDate;
      });
      
      // Apply limit after sorting
      if (filters.limit) {
        donations = donations.slice(0, filters.limit);
      }
      
      return {
        success: true,
        data: donations,
        total: donations.length
      };
    } catch (error) {
      console.error('Get donations error:', error);
      throw new Error(this.getErrorMessage(error));
    }
  }

  async updateDonation(donationId, donationData) {
    try {
      console.log('Updating donation in Firestore database:', donationId);
      console.log('Donation update data:', donationData);
      
      const donationDocRef = doc(db, 'donations', donationId);
      const updateData = {
        ...donationData,
        updatedAt: serverTimestamp()
      };
      
      await updateDoc(donationDocRef, updateData);
      console.log('✅ Donation successfully updated in database');
      
      const updatedDoc = await getDoc(donationDocRef);
      const result = { id: updatedDoc.id, ...updatedDoc.data() };
      console.log('✅ Retrieved updated donation from database:', result);
      return result;
    } catch (error) {
      console.error('❌ Update donation error:', error);
      throw new Error(this.getErrorMessage(error));
    }
  }

  // Blood Requests Methods
  async createBloodRequest(requestData) {
    try {
      const user = auth.currentUser;
      const requesterId = user ? user.uid : null;
      
      console.log('Creating new blood request in Firestore database');
      console.log('Blood request data:', requestData);
      
      const request = {
        ...requestData,
        requesterId: requesterId, // Store who made the request
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        status: 'active',
        fulfilled: false,
        donorResponses: []
      };
      
      const docRef = await addDoc(collection(db, 'bloodRequests'), request);
      console.log('✅ Blood request successfully created in database with ID:', docRef.id);
      
      const requestWithId = { 
        id: docRef.id, 
        ...request,
        requesterId: requesterId // Ensure requesterId is included
      };
      
      // Immediately send notifications to compatible donors
      await this.sendBloodRequestNotifications(requestWithId);
      
      return requestWithId;
    } catch (error) {
      console.error('❌ Create blood request error:', error);
      throw new Error(this.getErrorMessage(error));
    }
  }

  async getBloodRequests(filters = {}) {
    try {
      const requestsRef = collection(db, 'bloodRequests');
      
      // Get all requests first to avoid index issues
      const querySnapshot = await getDocs(requestsRef);
      let requests = [];
      
      querySnapshot.forEach((doc) => {
        requests.push({ id: doc.id, ...doc.data() });
      });
      
      // Apply filters in JavaScript
      if (filters.bloodGroup) {
        requests = requests.filter(request => request.bloodGroup === filters.bloodGroup);
      }
      
      if (filters.status) {
        requests = requests.filter(request => request.status === filters.status);
      }
      
      // Sort by createdAt (newest first)
      requests.sort((a, b) => {
        const aDate = a.createdAt?.toDate?.() || new Date(a.createdAt || 0);
        const bDate = b.createdAt?.toDate?.() || new Date(b.createdAt || 0);
        return bDate - aDate;
      });
      
      // Apply limit after sorting
      if (filters.limit) {
        requests = requests.slice(0, filters.limit);
      }
      
      return {
        success: true,
        data: requests,
        total: requests.length
      };
    } catch (error) {
      console.error('Get blood requests error:', error);
      throw new Error(this.getErrorMessage(error));
    }
  }

  // Admin Management Methods
  async getAdminUsers() {
    try {
      console.log('Fetching admin users...');
      const usersRef = collection(db, 'users');
      
      // Get all users without any filters to avoid index requirements
      const querySnapshot = await getDocs(usersRef);
      const admins = [];
      
      querySnapshot.forEach((doc) => {
        const userData = { id: doc.id, ...doc.data() };
        
        // Filter for admin users in JavaScript
        const isAdminRole = userData.role === 'admin';
        const hasAdminType = userData.adminType === 'admin';
        
        if (isAdminRole || hasAdminType) {
          // Set admin type
          userData.adminType = 'admin';
          userData.canModifyData = true;
          userData.canAddAdmins = true;
          
          // Ensure role is set correctly
          if (!userData.role || userData.role === 'user') {
            userData.role = 'admin';
          }
          
          admins.push(userData);
        }
      });
      
      // Sort by createdAt in JavaScript (newest first)
      admins.sort((a, b) => {
        const aDate = a.createdAt?.toDate?.() || new Date(a.createdAt || 0);
        const bDate = b.createdAt?.toDate?.() || new Date(b.createdAt || 0);
        return bDate - aDate;
      });
      
      console.log(`Found ${admins.length} admin users:`, admins.map(a => ({ email: a.email, type: a.adminType })));
      
      return {
        success: true,
        data: admins,
        total: admins.length
      };
    } catch (error) {
      console.error('Get admin users error:', error);
      throw new Error(this.getErrorMessage(error));
    }
  }

  async createAdminUser(adminData) {
    try {
      const currentUser = await this.getCurrentUser();
      if (currentUser.adminType !== 'admin') {
        throw new Error('Only Admins can create new admin users');
      }

      const { email, password, ...profileData } = adminData;
      
      // Create user account
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      
      // Create admin profile in Firestore
      const adminProfile = {
        ...profileData,
        email: user.email,
        uid: user.uid,
        role: 'admin', // Regular admin by default
        userType: 'admin',
        department: 'Blood Bank',
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        isActive: true,
        isVerified: true,
        totalDonations: 0,
        totalRequests: 0,
        adminType: 'admin',
        canModifyData: false,
        canAddAdmins: false
      };
      
      await setDoc(doc(db, 'users', user.uid), adminProfile);
      
      return {
        success: true,
        message: 'Admin user created successfully',
        data: {
          user: adminProfile
        }
      };
    } catch (error) {
      console.error('Create admin user error:', error);
      throw new Error(this.getErrorMessage(error));
    }
  }

  async updateAdminUser(adminId, adminData) {
    try {
      const currentUser = await this.getCurrentUser();
      if (currentUser.adminType !== 'admin') {
        throw new Error('Only Admins can update admin users');
      }

      const adminDocRef = doc(db, 'users', adminId);
      const updateData = {
        ...adminData,
        updatedAt: serverTimestamp()
      };
      
      await updateDoc(adminDocRef, updateData);
      return await this.getUserById(adminId);
    } catch (error) {
      console.error('Update admin user error:', error);
      throw new Error(this.getErrorMessage(error));
    }
  }

  async deleteAdminUser(adminId) {
    try {
      const currentUser = await this.getCurrentUser();
      if (currentUser.adminType !== 'admin') {
        throw new Error('Only Admins can delete admin users');
      }

      // Get admin to delete
      const adminToDelete = await this.getUserById(adminId);

      const adminDocRef = doc(db, 'users', adminId);
      await deleteDoc(adminDocRef);
      return { success: true };
    } catch (error) {
      console.error('Delete admin user error:', error);
      throw new Error(this.getErrorMessage(error));
    }
  }

  // Notifications Methods
  async getNotifications(userId = null) {
    try {
      const notificationsRef = collection(db, 'notifications');
      let notifications = [];
      
      if (userId) {
        // Query for user-specific and global notifications
        const userQuery = query(
          notificationsRef,
          or(
            where('userId', '==', userId),
            where('isGlobal', '==', true)
          )
        );
        
        const querySnapshot = await getDocs(userQuery);
        querySnapshot.forEach((doc) => {
          notifications.push({ id: doc.id, ...doc.data() });
        });
      } else {
        // If no userId provided, get all notifications (admin only)
        const querySnapshot = await getDocs(notificationsRef);
        querySnapshot.forEach((doc) => {
          notifications.push({ id: doc.id, ...doc.data() });
        });
      }
      
      // Sort by createdAt (newest first)
      notifications.sort((a, b) => {
        const aDate = a.createdAt?.toDate?.() || new Date(a.createdAt || 0);
        const bDate = b.createdAt?.toDate?.() || new Date(b.createdAt || 0);
        return bDate - aDate;
      });
      
      return {
        success: true,
        data: notifications,
        total: notifications.length,
        unreadCount: notifications.filter(n => !n.read).length
      };
    } catch (error) {
      console.error('Get notifications error:', error);
      throw new Error(this.getErrorMessage(error));
    }
  }

  async createNotification(notificationData) {
    try {
      const notification = {
        ...notificationData,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        read: false
      };
      
      const docRef = await addDoc(collection(db, 'notifications'), notification);
      return { id: docRef.id, ...notification };
    } catch (error) {
      console.error('Create notification error:', error);
      throw new Error(this.getErrorMessage(error));
    }
  }

  async markNotificationAsRead(notificationId) {
    try {
      console.log('Marking notification as read in Firestore database:', notificationId);
      
      const notificationRef = doc(db, 'notifications', notificationId);
      await updateDoc(notificationRef, {
        read: true,
        readAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
      
      console.log('✅ Notification successfully marked as read in database');
      return { success: true };
    } catch (error) {
      console.error('❌ Mark notification as read error:', error);
      throw new Error(this.getErrorMessage(error));
    }
  }

  async markAllNotificationsAsRead(userId) {
    try {
      const notificationsRef = collection(db, 'notifications');
      const querySnapshot = await getDocs(notificationsRef);
      
      const batch = writeBatch(db);
      
      querySnapshot.forEach((docSnapshot) => {
        const notificationData = docSnapshot.data();
        // Mark as read if it's for this user or is global
        if (notificationData.userId === userId || notificationData.isGlobal === true) {
          if (!notificationData.read) {
            batch.update(docSnapshot.ref, {
              read: true,
              readAt: serverTimestamp(),
              updatedAt: serverTimestamp()
            });
          }
        }
      });
      
      await batch.commit();
      return { success: true };
    } catch (error) {
      console.error('Mark all notifications as read error:', error);
      throw new Error(this.getErrorMessage(error));
    }
  }

  // Statistics Methods
  async getStats() {
    try {
      const [usersSnapshot, donationsSnapshot, requestsSnapshot] = await Promise.all([
        getDocs(collection(db, 'users')),
        getDocs(collection(db, 'donations')),
        getDocs(collection(db, 'bloodRequests'))
      ]);
      
      const stats = {
        totalUsers: usersSnapshot.size,
        totalDonations: donationsSnapshot.size,
        totalRequests: requestsSnapshot.size,
        activeRequests: 0,
        completedDonations: 0
      };
      
      // Calculate additional stats
      donationsSnapshot.forEach((doc) => {
        const donation = doc.data();
        if (donation.status === 'completed') {
          stats.completedDonations++;
        }
      });
      
      requestsSnapshot.forEach((doc) => {
        const request = doc.data();
        if (request.status === 'active') {
          stats.activeRequests++;
        }
      });
      
      return {
        success: true,
        data: stats
      };
    } catch (error) {
      console.error('Get stats error:', error);
      throw new Error(this.getErrorMessage(error));
    }
  }

  // Auth state listener
  onAuthStateChanged(callback) {
    return onAuthStateChanged(auth, callback);
  }

  // Utility Methods
  getErrorMessage(error) {
    switch (error.code) {
      case 'auth/user-not-found':
        return 'Username not found. Please check your username or register.';
      case 'auth/wrong-password':
        return 'Incorrect password. Please try again.';
      case 'auth/email-already-in-use':
        return 'This username is already registered.';
      case 'auth/weak-password':
        return 'Password should be at least 6 characters.';
      case 'auth/invalid-email':
        return 'Invalid username format.';
      case 'auth/invalid-credential':
        return 'Invalid username or password. Please try again.';
      case 'auth/too-many-requests':
        return 'Too many login attempts. Please try again later.';
      case 'permission-denied':
      case 'firestore/permission-denied':
        return 'Database permission error. Please contact support.';
      default:
        return error.message || 'An unexpected error occurred.';
    }
  }

  // Blood Campaign Management
  async createBloodCampaign(campaignData) {
    try {
      const docRef = await addDoc(collection(db, 'bloodCampaigns'), {
        ...campaignData,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
      return docRef.id;
    } catch (error) {
      console.error('Error creating blood campaign:', error);
      throw error;
    }
  }

  async getBloodCampaigns() {
    try {
      const snapshot = await getDocs(collection(db, 'bloodCampaigns'));
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate(),
        updatedAt: doc.data().updatedAt?.toDate()
      }));
    } catch (error) {
      console.error('Error fetching blood campaigns:', error);
      throw error;
    }
  }

  async updateBloodCampaign(campaignId, updateData) {
    try {
      const campaignRef = doc(db, 'bloodCampaigns', campaignId);
      await updateDoc(campaignRef, {
        ...updateData,
        updatedAt: serverTimestamp()
      });
    } catch (error) {
      console.error('Error updating blood campaign:', error);
      throw error;
    }
  }

  async deleteBloodCampaign(campaignId) {
    try {
      await deleteDoc(doc(db, 'bloodCampaigns', campaignId));
    } catch (error) {
      console.error('Error deleting blood campaign:', error);
      throw error;
    }
  }

  async getBloodCampaign(campaignId) {
    try {
      const campaignDoc = await getDoc(doc(db, 'bloodCampaigns', campaignId));
      if (campaignDoc.exists()) {
        const data = campaignDoc.data();
        return {
          id: campaignDoc.id,
          ...data,
          createdAt: data.createdAt?.toDate(),
          updatedAt: data.updatedAt?.toDate()
        };
      }
      return null;
    } catch (error) {
      console.error('Error fetching blood campaign:', error);
      throw error;
    }
  }

  // Blood Request Notification System
  async sendBloodRequestNotifications(request) {
    try {
      const { getCompatibleDonorBloodGroups, getBloodRequestNotificationMessage } = await import('../utils/bloodCompatibility');
      
      // Get compatible blood groups for this request
      const compatibleBloodGroups = getCompatibleDonorBloodGroups(request.bloodGroup);
      
      // Get all users with compatible blood groups
      const usersRef = collection(db, 'users');
      const querySnapshot = await getDocs(usersRef);
      
      const compatibleDonors = [];
      querySnapshot.forEach((doc) => {
        const userData = { id: doc.id, ...doc.data() };
        
        // Debug logging
        const isCompatibleBlood = compatibleBloodGroups.includes(userData.bloodGroup);
        const isRequester = userData.id === request.requesterId || userData.uid === request.requesterId;
        
        // Check if user has compatible blood group and can donate
        // EXCLUDE the requester from receiving notifications about their own request
        if (compatibleBloodGroups.includes(userData.bloodGroup) &&
            userData.isActive &&
            userData.canDonate !== false && // Allow donation unless explicitly disabled
            userData.bloodGroup && // Must have blood group specified
            !isRequester) { // Don't notify the person who made the request
          compatibleDonors.push(userData);
        } else if (isRequester && isCompatibleBlood) {
          console.log(`Excluding requester from notifications: ${userData.id} (matches requesterId: ${request.requesterId})`);
        }
      });

      console.log(`Found ${compatibleDonors.length} compatible donors for blood group ${request.bloodGroup}`);
      console.log(`Requester ID: ${request.requesterId}`);

      // Create notifications for each compatible donor
      const notifications = [];
      for (const donor of compatibleDonors) {
        const notificationMessage = getBloodRequestNotificationMessage(request, donor);
        
        const notification = {
          userId: donor.id,
          type: 'blood_request',
          title: `🩸 Blood Donation Needed - ${request.bloodGroup}`,
          message: notificationMessage,
          bloodRequestId: request.id,
          recipientBloodGroup: request.bloodGroup,
          donorBloodGroup: donor.bloodGroup,
          urgencyLevel: request.urgencyLevel,
          hospitalName: request.hospitalName,
          unitsRequired: request.unitsRequired,
          patientName: request.patientName,
          createdAt: serverTimestamp(),
          read: false,
          responded: false,
          isGlobal: false
        };

        notifications.push(notification);
      }

      // Batch write all notifications
      if (notifications.length > 0) {
        const batch = writeBatch(db);
        notifications.forEach(notification => {
          const docRef = doc(collection(db, 'notifications'));
          batch.set(docRef, notification);
        });
        
        await batch.commit();
        console.log(`Sent ${notifications.length} notifications for blood request ${request.id}`);
      }

      return {
        success: true,
        notificationsSent: notifications.length,
        compatibleDonors: compatibleDonors.length
      };
    } catch (error) {
      console.error('Error sending blood request notifications:', error);
      throw new Error(this.getErrorMessage(error));
    }
  }

  // Donor Response Methods
  async respondToBloodRequest(requestId, donorId, response, donorMessage = '') {
    try {
      const user = auth.currentUser;
      if (!user || user.uid !== donorId) {
        throw new Error('Unauthorized: You can only respond as yourself');
      }

      // Get the blood request
      const requestRef = doc(db, 'bloodRequests', requestId);
      const requestDoc = await getDoc(requestRef);
      
      if (!requestDoc.exists()) {
        throw new Error('Blood request not found');
      }

      const requestData = requestDoc.data();
      
      // Get donor details
      const donorData = await this.getUserById(donorId);
      
      // Create donor response (use Date object instead of serverTimestamp for arrays)
      const donorResponse = {
        donorId: donorId,
        donorName: donorData.firstName + ' ' + donorData.lastName,
        donorEmail: donorData.email,
        donorPhone: donorData.phone,
        donorBloodGroup: donorData.bloodGroup,
        response: response, // 'accepted', 'declined', 'maybe'
        message: donorMessage,
        respondedAt: new Date().toISOString(), // Use ISO string instead of serverTimestamp
        contactShared: response === 'accepted' // Automatically share contact if accepted
      };

      // Update the blood request with donor response
      const currentResponses = requestData.donorResponses || [];
      const existingResponseIndex = currentResponses.findIndex(r => r.donorId === donorId);
      
      if (existingResponseIndex >= 0) {
        currentResponses[existingResponseIndex] = donorResponse;
      } else {
        currentResponses.push(donorResponse);
      }

      await updateDoc(requestRef, {
        donorResponses: currentResponses,
        updatedAt: serverTimestamp()
      });

      // Mark notification as responded
      await this.markNotificationAsResponded(requestId, donorId);

      // If donor accepted, create notification for requester and reminder for donor
      if (response === 'accepted') {
        await this.notifyRequesterOfDonorAcceptance(requestData, donorResponse);
        // Create reminder notification for donor
        await this.createDonorReminderNotification(requestData, donorResponse);
        // Delete the blood request notification from donor's notifications
        await this.deleteBloodRequestNotification(requestId, donorId);
      }

      return {
        success: true,
        message: response === 'accepted' ? 
          'Thank you for accepting! Your contact details have been shared with the requester.' :
          'Your response has been recorded. Thank you for your time.',
        donorResponse
      };
    } catch (error) {
      console.error('Error responding to blood request:', error);
      throw new Error(this.getErrorMessage(error));
    }
  }

  async markNotificationAsResponded(requestId, donorId) {
    try {
      const notificationsRef = collection(db, 'notifications');
      const querySnapshot = await getDocs(notificationsRef);
      
      const batch = writeBatch(db);
      
      querySnapshot.forEach((docSnapshot) => {
        const notificationData = docSnapshot.data();
        if (notificationData.bloodRequestId === requestId && 
            notificationData.userId === donorId &&
            notificationData.type === 'blood_request') {
          batch.update(docSnapshot.ref, {
            responded: true,
            respondedAt: serverTimestamp(),
            read: true,
            updatedAt: serverTimestamp()
          });
        }
      });
      
      await batch.commit();
      return { success: true };
    } catch (error) {
      console.error('Error marking notification as responded:', error);
      throw new Error(this.getErrorMessage(error));
    }
  }

  async deleteBloodRequestNotification(requestId, donorId) {
    try {
      const notificationsRef = collection(db, 'notifications');
      const querySnapshot = await getDocs(notificationsRef);
      
      const batch = writeBatch(db);
      let deletedCount = 0;
      
      querySnapshot.forEach((docSnapshot) => {
        const notificationData = docSnapshot.data();
        if (notificationData.bloodRequestId === requestId && 
            notificationData.userId === donorId &&
            notificationData.type === 'blood_request') {
          batch.delete(docSnapshot.ref);
          deletedCount++;
        }
      });
      
      await batch.commit();
      console.log(`Deleted ${deletedCount} notification(s) for request ${requestId} and donor ${donorId}`);
      return { success: true, deletedCount };
    } catch (error) {
      console.error('Error deleting blood request notification:', error);
      throw new Error(this.getErrorMessage(error));
    }
  }

  async deleteNotification(notificationId) {
    try {
      const notificationRef = doc(db, 'notifications', notificationId);
      await deleteDoc(notificationRef);
      return { 
        success: true, 
        message: 'Notification deleted successfully' 
      };
    } catch (error) {
      console.error('Error deleting notification:', error);
      throw new Error(this.getErrorMessage(error));
    }
  }

  async notifyRequesterOfDonorAcceptance(requestData, donorResponse) {
    try {
      // Create notification for the requester (if they have a user account)
      // For now, we'll create an admin notification since requests might come from non-users
      const notification = {
        type: 'donor_accepted',
        title: '🎉 Donor Found for Blood Request',
        message: `Great news! ${donorResponse.donorName} (${donorResponse.donorBloodGroup}) has accepted to donate blood for ${requestData.patientName}.

Contact Details:
📧 Email: ${donorResponse.donorEmail}
📞 Phone: ${donorResponse.donorPhone}

Hospital: ${requestData.hospitalName}
Units Needed: ${requestData.unitsRequired}
Urgency: ${requestData.urgencyLevel}

${donorResponse.message ? `Donor Message: ${donorResponse.message}` : ''}

Please contact the donor directly to coordinate the donation.`,
        bloodRequestId: requestData.id || 'unknown',
        donorId: donorResponse.donorId,
        urgencyLevel: requestData.urgencyLevel,
        createdAt: serverTimestamp(),
        read: false,
        isGlobal: true, // Make it visible to admins
        contactDetails: {
          donorName: donorResponse.donorName,
          donorEmail: donorResponse.donorEmail,
          donorPhone: donorResponse.donorPhone,
          donorBloodGroup: donorResponse.donorBloodGroup
        }
      };

      const docRef = await addDoc(collection(db, 'notifications'), notification);
      return { id: docRef.id, ...notification };
    } catch (error) {
      console.error('Error notifying requester of donor acceptance:', error);
      throw new Error(this.getErrorMessage(error));
    }
  }

  async createDonorReminderNotification(requestData, donorResponse) {
    try {
      // Create notification for the donor as a reminder
      const notification = {
        type: 'donation_reminder',
        title: '❤️ Blood Donation Reminder',
        message: `Thank you for accepting to donate blood for ${requestData.patientName}!

Request Details:
🩸 Blood Group: ${requestData.bloodGroup}
🏥 Hospital: ${requestData.hospitalName}
📍 Location: ${requestData.city}
⏰ Urgency: ${requestData.urgencyLevel}
💉 Units Needed: ${requestData.unitsRequired}

${requestData.contactPerson ? `Contact Person: ${requestData.contactPerson}` : ''}
${requestData.contactNumber ? `Contact Number: ${requestData.contactNumber}` : ''}

Please visit the hospital at your earliest convenience to complete the donation. Your contribution can save a life!`,
        bloodRequestId: requestData.id || 'unknown',
        userId: donorResponse.donorId,
        urgencyLevel: requestData.urgencyLevel,
        createdAt: serverTimestamp(),
        read: false,
        isGlobal: false, // Personal notification for the donor
        requestDetails: {
          patientName: requestData.patientName,
          bloodGroup: requestData.bloodGroup,
          hospitalName: requestData.hospitalName,
          city: requestData.city,
          urgencyLevel: requestData.urgencyLevel,
          unitsRequired: requestData.unitsRequired,
          contactPerson: requestData.contactPerson,
          contactNumber: requestData.contactNumber
        }
      };

      const docRef = await addDoc(collection(db, 'notifications'), notification);
      return { id: docRef.id, ...notification };
    } catch (error) {
      console.error('Error creating donor reminder notification:', error);
      throw new Error(this.getErrorMessage(error));
    }
  }

  // Get blood requests with donor responses
  async getBloodRequestById(requestId) {
    try {
      const requestRef = doc(db, 'bloodRequests', requestId);
      const requestDoc = await getDoc(requestRef);
      
      if (!requestDoc.exists()) {
        throw new Error('Blood request not found');
      }

      return { id: requestDoc.id, ...requestDoc.data() };
    } catch (error) {
      console.error('Error fetching blood request:', error);
      throw new Error(this.getErrorMessage(error));
    }
  }

  async updateBloodRequest(requestId, updateData) {
    try {
      console.log('Updating blood request in Firestore database:', requestId);
      console.log('Blood request update data:', updateData);
      
      const requestRef = doc(db, 'bloodRequests', requestId);
      const updatePayload = {
        ...updateData,
        updatedAt: serverTimestamp()
      };
      
      await updateDoc(requestRef, updatePayload);
      console.log('✅ Blood request successfully updated in database');
      
      const result = await this.getBloodRequestById(requestId);
      console.log('✅ Retrieved updated blood request from database:', result);
      return result;
    } catch (error) {
      console.error('❌ Update blood request error:', error);
      throw new Error(this.getErrorMessage(error));
    }
  }

  async deleteBloodRequest(requestId) {
    try {
      console.log('Deleting blood request from Firestore database:', requestId);
      
      const requestRef = doc(db, 'bloodRequests', requestId);
      await deleteDoc(requestRef);
      
      console.log('✅ Blood request successfully deleted from database');
      return { success: true };
    } catch (error) {
      console.error('❌ Delete blood request error:', error);
      throw new Error(this.getErrorMessage(error));
    }
  }

  // Get notifications for a specific user with blood request details
  async getUserNotificationsWithDetails(userId) {
    try {
      const notifications = await this.getNotifications(userId);
      
      // Enhance blood request notifications with current request status
      for (let notification of notifications.data) {
        if (notification.type === 'blood_request' && notification.bloodRequestId) {
          try {
            const requestData = await this.getBloodRequestById(notification.bloodRequestId);
            notification.requestStatus = requestData.status;
            notification.requestFulfilled = requestData.fulfilled;
            
            // Check if this user has already responded
            const userResponse = requestData.donorResponses?.find(r => r.donorId === userId);
            notification.userResponse = userResponse;
            notification.hasResponded = !!userResponse;
          } catch (error) {
            console.log(`Could not fetch details for blood request ${notification.bloodRequestId}:`, error.message);
          }
        }
      }
      
      return notifications;
    } catch (error) {
      console.error('Error fetching user notifications with details:', error);
      throw new Error(this.getErrorMessage(error));
    }
  }
}

const firebaseService = new FirebaseService();
export default firebaseService;
