const { db, auth } = require('../config/firebase');
const bcrypt = require('bcryptjs');

class UserService {
  /**
   * Find user by email
   */
  static async findByEmail(email) {
    try {
      const usersRef = db.collection('users');
      const snapshot = await usersRef.where('email', '==', email.toLowerCase()).limit(1).get();
      
      if (snapshot.empty) {
        return null;
      }
      
      const doc = snapshot.docs[0];
      return { id: doc.id, ...doc.data() };
    } catch (error) {
      console.error('Error finding user by email:', error);
      throw error;
    }
  }

  /**
   * Find user by ID
   */
  static async findById(id) {
    try {
      const doc = await db.collection('users').doc(id).get();
      
      if (!doc.exists) {
        return null;
      }
      
      return { id: doc.id, ...doc.data() };
    } catch (error) {
      console.error('Error finding user by ID:', error);
      throw error;
    }
  }

  /**
   * Create new user
   */
  static async create(userData) {
    try {
      const { email, password, ...otherData } = userData;

      // Check if user already exists
      const existingUser = await UserService.findByEmail(email);
      if (existingUser) {
        throw new Error('User with this email already exists');
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(password, 12);

      // Create user document in Firestore
      const userRef = db.collection('users').doc();
      const finalUserData = {
        ...otherData,
        email: email.toLowerCase().trim(),
        password: hashedPassword,
        isActive: true,
        isVerified: false,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      await userRef.set(finalUserData);

      return { id: userRef.id, ...finalUserData };
    } catch (error) {
      console.error('Error creating user:', error);
      throw error;
    }
  }

  /**
   * Update user
   */
  static async update(userId, updateData) {
    try {
      const { password, ...otherData } = updateData;
      
      const updatePayload = {
        ...otherData,
        updatedAt: new Date()
      };

      // Hash password if provided
      if (password) {
        updatePayload.password = await bcrypt.hash(password, 12);
      }

      await db.collection('users').doc(userId).update(updatePayload);

      // Return updated user
      return UserService.findById(userId);
    } catch (error) {
      console.error('Error updating user:', error);
      throw error;
    }
  }

  /**
   * Get all users
   */
  static async getAll(options = {}) {
    try {
      const { limit = 10, offset = 0, where = {} } = options;

      let query = db.collection('users');

      // Apply filters
      if (where.isActive !== undefined) {
        query = query.where('isActive', '==', where.isActive);
      }
      if (where.userType) {
        query = query.where('userType', '==', where.userType);
      }

      // Get total count
      const snapshot = await query.get();
      const total = snapshot.size;

      // Get paginated results
      const paginatedQuery = query.orderBy('createdAt', 'desc').limit(limit).offset(offset);
      const docs = await paginatedQuery.get();

      const users = [];
      docs.forEach(doc => {
        users.push({ id: doc.id, ...doc.data() });
      });

      return { users, total };
    } catch (error) {
      console.error('Error getting all users:', error);
      throw error;
    }
  }

  /**
   * Get user stats
   */
  static async getStats() {
    try {
      const usersRef = db.collection('users');
      
      const allUsers = await usersRef.get();
      const activeUsers = await usersRef.where('isActive', '==', true).get();
      const verifiedUsers = await usersRef.where('isVerified', '==', true).get();
      const donors = await usersRef.where('userType', '==', 'donor').get();
      const admins = await usersRef.where('userType', '==', 'admin').get();

      return {
        totalUsers: allUsers.size,
        activeUsers: activeUsers.size,
        verifiedUsers: verifiedUsers.size,
        donors: donors.size,
        admins: admins.size
      };
    } catch (error) {
      console.error('Error getting user stats:', error);
      throw error;
    }
  }

  /**
   * Delete user (soft delete)
   */
  static async delete(userId) {
    try {
      await db.collection('users').doc(userId).update({
        isActive: false,
        updatedAt: new Date()
      });

      return UserService.findById(userId);
    } catch (error) {
      console.error('Error deleting user:', error);
      throw error;
    }
  }

  static async comparePassword(plainPassword, hashedPassword) {
    if (!hashedPassword) return false;
    return await bcrypt.compare(plainPassword, hashedPassword);
  }
}

module.exports = UserService;
