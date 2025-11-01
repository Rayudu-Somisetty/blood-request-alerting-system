const { prisma } = require('../config/prisma');

class DonationService {
  // Create a new donation
  static async create(donationData) {
    try {
      // Generate bag number if donation is completed
      if (donationData.donationStatus === 'completed' && !donationData.bagNumber) {
        donationData.bagNumber = this.generateBagNumber();
      }

      const donation = await prisma.donation.create({
        data: donationData,
        include: {
          donor: true,
          components: true,
          notes: true
        }
      });

      // Update donor's total donations count
      if (donationData.donationStatus === 'completed') {
        await prisma.user.update({
          where: { id: donationData.donorId },
          data: {
            totalDonations: { increment: 1 },
            lastDonationDate: donationData.donationDate
          }
        });
      }

      return donation;
    } catch (error) {
      throw new Error(`Failed to create donation: ${error.message}`);
    }
  }

  // Find donation by ID
  static async findById(id) {
    try {
      return await prisma.donation.findUnique({
        where: { id },
        include: {
          donor: true,
          components: true,
          notes: {
            orderBy: { createdAt: 'desc' }
          }
        }
      });
    } catch (error) {
      throw new Error(`Failed to find donation by ID: ${error.message}`);
    }
  }

  // Find donation by bag number
  static async findByBagNumber(bagNumber) {
    try {
      return await prisma.donation.findUnique({
        where: { bagNumber },
        include: {
          donor: true,
          components: true,
          notes: true
        }
      });
    } catch (error) {
      throw new Error(`Failed to find donation by bag number: ${error.message}`);
    }
  }

  // Get all donations with pagination and filters
  static async findMany({ 
    page = 1, 
    limit = 10, 
    donationStatus, 
    donorBloodGroup, 
    startDate, 
    endDate,
    donorId 
  }) {
    try {
      const skip = (page - 1) * limit;
      
      const where = {};
      if (donationStatus) where.donationStatus = donationStatus;
      if (donorBloodGroup) where.donorBloodGroup = donorBloodGroup;
      if (donorId) where.donorId = donorId;
      if (startDate || endDate) {
        where.donationDate = {};
        if (startDate) where.donationDate.gte = new Date(startDate);
        if (endDate) where.donationDate.lte = new Date(endDate);
      }

      const [donations, total] = await Promise.all([
        prisma.donation.findMany({
          where,
          skip,
          take: limit,
          orderBy: { donationDate: 'desc' },
          include: {
            donor: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true,
                phone: true,
                bloodGroup: true
              }
            },
            components: true
          }
        }),
        prisma.donation.count({ where })
      ]);

      return {
        donations,
        total,
        page,
        totalPages: Math.ceil(total / limit)
      };
    } catch (error) {
      throw new Error(`Failed to fetch donations: ${error.message}`);
    }
  }

  // Update donation
  static async update(id, updateData) {
    try {
      // Generate bag number if status changed to completed
      if (updateData.donationStatus === 'completed' && !updateData.bagNumber) {
        updateData.bagNumber = this.generateBagNumber();
      }

      const donation = await prisma.donation.update({
        where: { id },
        data: updateData,
        include: {
          donor: true,
          components: true,
          notes: true
        }
      });

      // Update donor's stats if status changed to completed
      if (updateData.donationStatus === 'completed') {
        await prisma.user.update({
          where: { id: donation.donorId },
          data: {
            totalDonations: { increment: 1 },
            lastDonationDate: donation.donationDate
          }
        });
      }

      return donation;
    } catch (error) {
      throw new Error(`Failed to update donation: ${error.message}`);
    }
  }

  // Delete donation
  static async delete(id) {
    try {
      // First get the donation to update donor stats
      const donation = await prisma.donation.findUnique({
        where: { id },
        include: { donor: true }
      });

      if (!donation) {
        throw new Error('Donation not found');
      }

      // Delete the donation (components and notes will cascade)
      await prisma.donation.delete({
        where: { id }
      });

      // Update donor's total donations if it was completed
      if (donation.donationStatus === 'completed') {
        await prisma.user.update({
          where: { id: donation.donorId },
          data: {
            totalDonations: { decrement: 1 }
          }
        });
      }

      return donation;
    } catch (error) {
      throw new Error(`Failed to delete donation: ${error.message}`);
    }
  }

  // Add component to donation
  static async addComponent(donationId, componentData) {
    try {
      return await prisma.component.create({
        data: {
          ...componentData,
          donationId
        }
      });
    } catch (error) {
      throw new Error(`Failed to add component: ${error.message}`);
    }
  }

  // Add note to donation
  static async addNote(donationId, noteData) {
    try {
      return await prisma.note.create({
        data: {
          ...noteData,
          donationId
        }
      });
    } catch (error) {
      throw new Error(`Failed to add note: ${error.message}`);
    }
  }

  // Get donation statistics
  static async getDonationStats() {
    try {
      const [
        totalDonations,
        pendingDonations,
        todayDonations,
        bloodGroupStats,
        monthlyStats
      ] = await Promise.all([
        prisma.donation.count({ where: { donationStatus: 'completed' } }),
        prisma.donation.count({ where: { donationStatus: 'scheduled' } }),
        prisma.donation.count({
          where: {
            donationDate: {
              gte: new Date(new Date().setHours(0, 0, 0, 0)),
              lt: new Date(new Date().setHours(23, 59, 59, 999))
            },
            donationStatus: 'completed'
          }
        }),
        prisma.donation.groupBy({
          by: ['donorBloodGroup'],
          where: { donationStatus: 'completed' },
          _count: { donorBloodGroup: true },
          orderBy: { donorBloodGroup: 'asc' }
        }),
        prisma.donation.groupBy({
          by: ['donationDate'],
          where: {
            donationStatus: 'completed',
            donationDate: {
              gte: new Date(new Date().getFullYear(), new Date().getMonth() - 6, 1)
            }
          },
          _count: { id: true },
          orderBy: { donationDate: 'asc' }
        })
      ]);

      return {
        totalDonations,
        pendingDonations,
        todayDonations,
        bloodGroupStats: bloodGroupStats.map(stat => ({
          _id: stat.donorBloodGroup,
          count: stat._count.donorBloodGroup
        })),
        monthlyStats
      };
    } catch (error) {
      throw new Error(`Failed to get donation stats: ${error.message}`);
    }
  }

  // Generate unique bag number
  static generateBagNumber() {
    const year = new Date().getFullYear();
    const month = String(new Date().getMonth() + 1).padStart(2, '0');
    const day = String(new Date().getDate()).padStart(2, '0');
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    
    return `GIMSR${year}${month}${day}${random}`;
  }

  // Calculate donation age in days
  static getDonationAge(donationDate) {
    return Math.floor((Date.now() - new Date(donationDate)) / (1000 * 60 * 60 * 24));
  }

  // Get available blood inventory
  static async getBloodInventory() {
    try {
      return await prisma.component.groupBy({
        by: ['componentType'],
        where: {
          status: 'available',
          expiryDate: { gt: new Date() }
        },
        _sum: { volume: true },
        _count: { id: true }
      });
    } catch (error) {
      throw new Error(`Failed to get blood inventory: ${error.message}`);
    }
  }

  // Search donations
  static async search(query) {
    try {
      return await prisma.donation.findMany({
        where: {
          OR: [
            { bagNumber: { contains: query, mode: 'insensitive' } },
            { donorName: { contains: query, mode: 'insensitive' } },
            { donorEmail: { contains: query, mode: 'insensitive' } },
            { donorPhone: { contains: query } }
          ]
        },
        include: {
          donor: true,
          components: true
        },
        orderBy: { donationDate: 'desc' },
        take: 20
      });
    } catch (error) {
      throw new Error(`Failed to search donations: ${error.message}`);
    }
  }
}

module.exports = DonationService;
