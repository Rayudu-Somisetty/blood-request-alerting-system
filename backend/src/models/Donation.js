const mongoose = require('mongoose');

const donationSchema = new mongoose.Schema({
  // Donor Information
  donor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Donor information is required']
  },
  donorDetails: {
    name: {
      type: String,
      required: true
    },
    bloodGroup: {
      type: String,
      enum: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'],
      required: true
    },
    age: {
      type: Number,
      required: true,
      min: 18,
      max: 65
    },
    weight: {
      type: Number,
      required: true,
      min: 45
    },
    phone: {
      type: String,
      required: true
    },
    email: {
      type: String,
      required: true
    }
  },
  
  // Donation Details
  donationDate: {
    type: Date,
    required: [true, 'Donation date is required'],
    default: Date.now
  },
  donationType: {
    type: String,
    enum: ['whole_blood', 'plasma', 'platelets', 'red_cells', 'double_red_cells'],
    default: 'whole_blood',
    required: true
  },
  donationCenter: {
    type: String,
    default: 'GIMSR Blood Bank',
    required: true
  },
  donationStatus: {
    type: String,
    enum: ['scheduled', 'in_progress', 'completed', 'cancelled', 'deferred'],
    default: 'scheduled',
    required: true
  },
  
  // Medical Information
  preScreening: {
    hemoglobin: {
      type: Number,
      min: 12.5,
      max: 20
    },
    bloodPressure: {
      systolic: {
        type: Number,
        min: 90,
        max: 180
      },
      diastolic: {
        type: Number,
        min: 50,
        max: 100
      }
    },
    pulse: {
      type: Number,
      min: 50,
      max: 100
    },
    temperature: {
      type: Number,
      min: 35,
      max: 37.5
    },
    weight: {
      type: Number,
      min: 45
    }
  },
  
  // Blood Collection Details
  bloodCollection: {
    volumeCollected: {
      type: Number, // in ml
      min: 350,
      max: 500
    },
    bagNumber: {
      type: String,
      unique: true,
      sparse: true
    },
    collectionStartTime: Date,
    collectionEndTime: Date,
    collectionDuration: Number, // in minutes
    complications: [{
      type: String,
      trim: true
    }]
  },
  
  // Blood Testing
  bloodTesting: {
    bloodGroupVerified: {
      type: String,
      enum: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-']
    },
    infectiousDiseaseTesting: {
      hiv: {
        result: {
          type: String,
          enum: ['positive', 'negative', 'pending']
        },
        testDate: Date
      },
      hepatitisB: {
        result: {
          type: String,
          enum: ['positive', 'negative', 'pending']
        },
        testDate: Date
      },
      hepatitisC: {
        result: {
          type: String,
          enum: ['positive', 'negative', 'pending']
        },
        testDate: Date
      },
      syphilis: {
        result: {
          type: String,
          enum: ['positive', 'negative', 'pending']
        },
        testDate: Date
      },
      malaria: {
        result: {
          type: String,
          enum: ['positive', 'negative', 'pending']
        },
        testDate: Date
      }
    },
    testingCompleted: {
      type: Boolean,
      default: false
    },
    testingDate: Date,
    testResults: {
      type: String,
      enum: ['safe', 'unsafe', 'pending'],
      default: 'pending'
    }
  },
  
  // Blood Storage and Components
  components: [{
    componentType: {
      type: String,
      enum: ['whole_blood', 'red_blood_cells', 'plasma', 'platelets', 'cryoprecipitate'],
      required: true
    },
    volume: {
      type: Number,
      required: true
    },
    unitNumber: {
      type: String,
      required: true
    },
    storageConditions: {
      temperature: Number,
      location: String
    },
    expiryDate: Date,
    status: {
      type: String,
      enum: ['available', 'reserved', 'used', 'expired', 'discarded'],
      default: 'available'
    }
  }],
  
  // Staff Information
  medicalStaff: {
    doctor: {
      name: String,
      license: String
    },
    nurse: {
      name: String,
      id: String
    },
    technician: {
      name: String,
      id: String
    }
  },
  
  // Administrative
  notes: [{
    note: String,
    addedBy: String,
    addedAt: {
      type: Date,
      default: Date.now
    }
  }]
}, {
  timestamps: true
});

// Virtual for donation age (days since donation)
donationSchema.virtual('donationAge').get(function() {
  return Math.floor((Date.now() - this.donationDate) / (1000 * 60 * 60 * 24));
});

// Pre-save middleware to generate bag number
donationSchema.pre('save', function(next) {
  if (!this.bloodCollection.bagNumber && this.donationStatus === 'completed') {
    const year = new Date().getFullYear();
    const month = String(new Date().getMonth() + 1).padStart(2, '0');
    const day = String(new Date().getDate()).padStart(2, '0');
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    
    this.bloodCollection.bagNumber = `GIMSR${year}${month}${day}${random}`;
  }
  next();
});

// Static method to get donation statistics
donationSchema.statics.getDonationStats = async function() {
  const totalDonations = await this.countDocuments({ donationStatus: 'completed' });
  const pendingDonations = await this.countDocuments({ donationStatus: 'scheduled' });
  const todayDonations = await this.countDocuments({
    donationDate: {
      $gte: new Date(new Date().setHours(0, 0, 0, 0)),
      $lt: new Date(new Date().setHours(23, 59, 59, 999))
    },
    donationStatus: 'completed'
  });
  
  const bloodGroupStats = await this.aggregate([
    { $match: { donationStatus: 'completed' } },
    { $group: { _id: '$donorDetails.bloodGroup', count: { $sum: 1 } } },
    { $sort: { _id: 1 } }
  ]);
  
  return {
    totalDonations,
    pendingDonations,
    todayDonations,
    bloodGroupStats
  };
};

// Indexes for better query performance
donationSchema.index({ donor: 1 });
donationSchema.index({ donationDate: -1 });
donationSchema.index({ donationStatus: 1 });
donationSchema.index({ 'donorDetails.bloodGroup': 1 });
donationSchema.index({ 'bloodCollection.bagNumber': 1 });

module.exports = mongoose.model('Donation', donationSchema);