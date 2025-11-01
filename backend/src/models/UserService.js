const { prisma } = require('../config/prisma');
const bcrypt = require('bcryptjs');

class UserService {
  // Create a new user
  static async create(userData) {
    try {
      // Hash password if provided
      if (userData.password) {
        const salt = await bcrypt.genSalt(12);
        userData.password = await bcrypt.hash(userData.password, salt);
      }

      // Calculate age from date of birth if provided
      if (userData.dateOfBirth && !userData.age) {
        const today = new Date();
        const birthDate = new Date(userData.dateOfBirth);
        let age = today.getFullYear() - birthDate.getFullYear();
        const monthDiff = today.getMonth() - birthDate.getMonth();
        
        if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
          age--;
        }
        userData.age = age;
      }

      const user = await prisma.user.create({
        data: userData,
        include: {
          documents: true,
          donations: true,
        }
      });

      return user;
    } catch (error) {
      throw new Error(`Failed to create user: ${error.message}`);
    }
  }

  // Find user by email
  static async findByEmail(email) {
    try {
      return await prisma.user.findUnique({
        where: { email },
        include: {
          documents: true,
          donations: {
            orderBy: { donationDate: 'desc' },
            take: 5 // Last 5 donations
          }
        }
      });
    } catch (error) {
      throw new Error(`Failed to find user by email: ${error.message}`);
    }
  }

  // Find user by ID
  static async findById(id) {
    try {
      return await prisma.user.findUnique({
        where: { id },
        include: {
          documents: true,
          donations: {
            orderBy: { donationDate: 'desc' },
            take: 10
          }
        }
      });
    } catch (error) {
      throw new Error(`Failed to find user by ID: ${error.message}`);
    }
  }

  // Compare password
  static async comparePassword(plainPassword, hashedPassword) {
    if (!hashedPassword) return false;
    return await bcrypt.compare(plainPassword, hashedPassword);
  }

  // Update user
  static async update(id, updateData) {
    try {
      // Hash password if being updated
      if (updateData.password) {
        const salt = await bcrypt.genSalt(12);
        updateData.password = await bcrypt.hash(updateData.password, salt);
      }

      return await prisma.user.update({
        where: { id },
        data: updateData,
        include: {
          documents: true,
          donations: true
        }
      });
    } catch (error) {
      throw new Error(`Failed to update user: ${error.message}`);
    }
  }

  // Delete user
  static async delete(id) {
    try {
      return await prisma.user.delete({
        where: { id }
      });
    } catch (error) {
      throw new Error(`Failed to delete user: ${error.message}`);
    }
  }

  // Find users by blood group
  static async findByBloodGroup(bloodGroup) {
    try {
      return await prisma.user.findMany({
        where: {
          bloodGroup,
          userType: 'donor',
          isActive: true,
          isEligibleToDonate: true
        },
        include: {
          donations: {
            orderBy: { donationDate: 'desc' },
            take: 1 // Last donation
          }
        }
      });
    } catch (error) {
      throw new Error(`Failed to find users by blood group: ${error.message}`);
    }
  }

  // Get all users with pagination
  static async findMany({ page = 1, limit = 10, userType, isActive = true }) {
    try {
      const skip = (page - 1) * limit;
      
      const where = { isActive };
      if (userType) where.userType = userType;

      const [users, total] = await Promise.all([
        prisma.user.findMany({
          where,
          skip,
          take: limit,
          orderBy: { createdAt: 'desc' },
          include: {
            donations: {
              take: 1,
              orderBy: { donationDate: 'desc' }
            }
          }
        }),
        prisma.user.count({ where })
      ]);

      return {
        users,
        total,
        page,
        totalPages: Math.ceil(total / limit)
      };
    } catch (error) {
      throw new Error(`Failed to fetch users: ${error.message}`);
    }
  }

  // Increment login attempts
  static async incLoginAttempts(id) {
    try {
      const user = await prisma.user.findUnique({ where: { id } });
      
      if (!user) throw new Error('User not found');

      // If lockUntil has expired, reset attempts
      if (user.lockUntil && user.lockUntil < new Date()) {
        return await prisma.user.update({
          where: { id },
          data: {
            loginAttempts: 1,
            lockUntil: null
          }
        });
      }

      const updates = { loginAttempts: user.loginAttempts + 1 };
      
      // Lock account after 5 failed attempts for 2 hours
      if (user.loginAttempts + 1 >= 5) {
        updates.lockUntil = new Date(Date.now() + 2 * 60 * 60 * 1000); // 2 hours
      }

      return await prisma.user.update({
        where: { id },
        data: updates
      });
    } catch (error) {
      throw new Error(`Failed to increment login attempts: ${error.message}`);
    }
  }

  // Reset login attempts
  static async resetLoginAttempts(id) {
    try {
      return await prisma.user.update({
        where: { id },
        data: {
          loginAttempts: 0,
          lockUntil: null,
          lastLogin: new Date()
        }
      });
    } catch (error) {
      throw new Error(`Failed to reset login attempts: ${error.message}`);
    }
  }

  // Get dashboard statistics
  static async getDashboardStats() {
    try {
      const [
        totalUsers,
        totalDonors,
        totalPatients,
        verifiedUsers,
        bloodGroupStats
      ] = await Promise.all([
        prisma.user.count({ where: { isActive: true } }),
        prisma.user.count({ where: { userType: 'donor', isActive: true } }),
        prisma.user.count({ where: { userType: 'patient', isActive: true } }),
        prisma.user.count({ where: { isVerified: true, isActive: true } }),
        prisma.user.groupBy({
          by: ['bloodGroup'],
          where: { userType: 'donor', isActive: true, bloodGroup: { not: null } },
          _count: { bloodGroup: true },
          orderBy: { bloodGroup: 'asc' }
        })
      ]);

      return {
        totalUsers,
        totalDonors,
        totalPatients,
        verifiedUsers,
        bloodGroupStats: bloodGroupStats.map(stat => ({
          _id: stat.bloodGroup,
          count: stat._count.bloodGroup
        }))
      };
    } catch (error) {
      throw new Error(`Failed to get dashboard stats: ${error.message}`);
    }
  }

  // Check if user account is locked
  static isLocked(user) {
    return !!(user.lockUntil && user.lockUntil > new Date());
  }

  // Get full name virtual field
  static getFullName(user) {
    return `${user.firstName} ${user.lastName}`;
  }
}

module.exports = UserService;
