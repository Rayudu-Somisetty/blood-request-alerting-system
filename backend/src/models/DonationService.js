const { db } = require('../config/firebase');

class DonationService {
  /**
   * Generate unique bag number
   */
  static generateBagNumber() {
    const timestamp = Date.now().toString();
    const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
    return `BAG-${timestamp.slice(-6)}-${random}`;
  }

  /**
   * Create a new donation
   */
  static async create(donationData) {
    try {
      // Generate bag number if donation is completed
      if (donationData.donationStatus === 'completed' && !donationData.bagNumber) {
        donationData.bagNumber = DonationService.generateBagNumber();
      }

      const donationRef = db.collection('donations').doc();
      const finalData = {
        ...donationData,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      await donationRef.set(finalData);

      return { id: donationRef.id, ...finalData };
    } catch (error) {
      console.error('Error creating donation:', error);
      throw error;
    }
  }

  /**
   * Get donation by ID
   */
  static async getById(donationId) {
    try {
      const doc = await db.collection('donations').doc(donationId).get();
      
      if (!doc.exists) {
        return null;
      }
      
      return { id: doc.id, ...doc.data() };
    } catch (error) {
      console.error('Error getting donation:', error);
      throw error;
    }
  }

  /**
   * Get all donations with filters
   */
  static async getAll(options = {}) {
    try {
      const { limit = 10, offset = 0, where = {} } = options;

      let query = db.collection('donations');

      // Apply filters
      if (where.bloodType) {
        query = query.where('bloodType', '==', where.bloodType);
      }
      if (where.donationStatus) {
        query = query.where('donationStatus', '==', where.donationStatus);
      }
      if (where.donorId) {
        query = query.where('donorId', '==', where.donorId);
      }

      // Get total count
      const snapshot = await query.get();
      const total = snapshot.size;

      // Get paginated results
      const paginatedQuery = query.orderBy('createdAt', 'desc').limit(limit).offset(offset);
      const docs = await paginatedQuery.get();

      const donations = [];
      docs.forEach(doc => {
        donations.push({ id: doc.id, ...doc.data() });
      });

      return { donations, total };
    } catch (error) {
      console.error('Error getting donations:', error);
      throw error;
    }
  }

  /**
   * Update donation
   */
  static async update(donationId, updateData) {
    try {
      const updatePayload = {
        ...updateData,
        updatedAt: new Date()
      };

      await db.collection('donations').doc(donationId).update(updatePayload);

      return DonationService.getById(donationId);
    } catch (error) {
      console.error('Error updating donation:', error);
      throw error;
    }
  }

  /**
   * Get donation statistics
   */
  static async getStats() {
    try {
      const donationsRef = db.collection('donations');
      
      const allDonations = await donationsRef.get();
      const completedDonations = await donationsRef.where('donationStatus', '==', 'completed').get();
      
      // Get blood type distribution
      const bloodTypeStats = {};
      allDonations.forEach(doc => {
        const bloodType = doc.data().bloodType;
        bloodTypeStats[bloodType] = (bloodTypeStats[bloodType] || 0) + 1;
      });

      return {
        totalDonations: allDonations.size,
        completedDonations: completedDonations.size,
        bloodTypeStats
      };
    } catch (error) {
      console.error('Error getting donation stats:', error);
      throw error;
    }
  }

  /**
   * Delete donation
   */
  static async delete(donationId) {
    try {
      await db.collection('donations').doc(donationId).delete();
      return { success: true };
    } catch (error) {
      console.error('Error deleting donation:', error);
      throw error;
    }
  }
}

module.exports = DonationService;
