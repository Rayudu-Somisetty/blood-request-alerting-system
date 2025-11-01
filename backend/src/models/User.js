const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  // Personal Information
  firstName: {
    type: String,
    required: [true, 'First name is required'],
    trim: true,
    maxlength: [50, 'First name cannot exceed 50 characters']
  },
  lastName: {
    type: String,
    required: [true, 'Last name is required'],
    trim: true,
    maxlength: [50, 'Last name cannot exceed 50 characters']
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [
      /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
      'Please enter a valid email address'
    ]
  },
  phone: {
    type: String,
    required: [true, 'Phone number is required'],
    trim: true,
    match: [/^[0-9]{10}$/, 'Please enter a valid 10-digit phone number']
  },
  
  // Authentication
  password: {
    type: String,
    required: function() {
      return this.userType === 'admin';
    },
    minlength: [6, 'Password must be at least 6 characters long']
  },
  
  // User Type and Role
  userType: {
    type: String,
    enum: ['admin', 'donor', 'patient'],
    required: [true, 'User type is required'],
    default: 'donor'
  },
  role: {
    type: String,
    enum: ['super_admin', 'admin', 'staff', 'user'],
    default: 'user'
  },
  isActive: {
    type: Boolean,
    default: true
  },
  
  // Personal Details
  dateOfBirth: {
    type: Date,
    required: function() {
      return this.userType !== 'admin';
    }
  },
  age: {
    type: Number,
    min: [18, 'Must be at least 18 years old'],
    max: [65, 'Must be under 65 years old']
  },
  gender: {
    type: String,
    enum: ['male', 'female', 'other'],
    required: function() {
      return this.userType !== 'admin';
    }
  },
  bloodGroup: {
    type: String,
    enum: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'],
    required: function() {
      return this.userType !== 'admin';
    }
  },
  weight: {
    type: Number,
    min: [45, 'Weight must be at least 45 kg'],
    required: function() {
      return this.userType === 'donor';
    }
  },
  
  // Address Information
  address: {
    street: {
      type: String,
      trim: true
    },
    city: {
      type: String,
      trim: true,
      required: function() {
        return this.userType !== 'admin';
      }
    },
    state: {
      type: String,
      trim: true,
      required: function() {
        return this.userType !== 'admin';
      }
    },
    pincode: {
      type: String,
      match: [/^[0-9]{6}$/, 'Please enter a valid 6-digit pincode']
    },
    country: {
      type: String,
      default: 'India'
    }
  },
  
  // Medical Information
  medicalHistory: {
    hasChronicDiseases: {
      type: Boolean,
      default: false
    },
    chronicDiseases: [{
      type: String,
      trim: true
    }],
    medications: [{
      name: String,
      dosage: String,
      frequency: String
    }],
    allergies: [{
      type: String,
      trim: true
    }],
    lastDonationDate: {
      type: Date
    },
    isEligibleToDonate: {
      type: Boolean,
      default: true
    }
  },
  
  // Emergency Contact
  emergencyContact: {
    name: {
      type: String,
      trim: true
    },
    relationship: {
      type: String,
      trim: true
    },
    phone: {
      type: String,
      match: [/^[0-9]{10}$/, 'Please enter a valid 10-digit phone number']
    }
  },
  
  // Documents
  documents: [{
    type: {
      type: String,
      enum: ['id_proof', 'medical_report', 'blood_test', 'other']
    },
    filename: String,
    url: String,
    uploadDate: {
      type: Date,
      default: Date.now
    }
  }],
  
  // Statistics
  totalDonations: {
    type: Number,
    default: 0
  },
  totalRequests: {
    type: Number,
    default: 0
  },
  
  // Verification and Status
  isVerified: {
    type: Boolean,
    default: false
  },
  verificationDate: Date,
  lastLogin: Date,
  loginAttempts: {
    type: Number,
    default: 0
  },
  lockUntil: Date,
  
  // Preferences
  preferences: {
    emailNotifications: {
      type: Boolean,
      default: true
    },
    smsNotifications: {
      type: Boolean,
      default: true
    },
    donationReminders: {
      type: Boolean,
      default: true
    }
  }
}, {
  timestamps: true,
  toJSON: {
    transform: function(doc, ret) {
      delete ret.password;
      delete ret.loginAttempts;
      delete ret.lockUntil;
      return ret;
    }
  }
});

// Virtual for full name
userSchema.virtual('fullName').get(function() {
  return `${this.firstName} ${this.lastName}`;
});

// Virtual for account lock status
userSchema.virtual('isLocked').get(function() {
  return !!(this.lockUntil && this.lockUntil > Date.now());
});

// Pre-save middleware to hash password
userSchema.pre('save', async function(next) {
  // Only hash password if it's modified and exists
  if (!this.isModified('password') || !this.password) return next();
  
  try {
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Pre-save middleware to calculate age from date of birth
userSchema.pre('save', function(next) {
  if (this.dateOfBirth && !this.age) {
    const today = new Date();
    const birthDate = new Date(this.dateOfBirth);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    
    this.age = age;
  }
  next();
});

// Instance method to compare password
userSchema.methods.comparePassword = async function(candidatePassword) {
  if (!this.password) return false;
  return await bcrypt.compare(candidatePassword, this.password);
};

// Instance method to increment login attempts
userSchema.methods.incLoginAttempts = function() {
  // If we have a previous lock that has expired, restart at 1
  if (this.lockUntil && this.lockUntil < Date.now()) {
    return this.updateOne({
      $unset: { lockUntil: 1 },
      $set: { loginAttempts: 1 }
    });
  }
  
  const updates = { $inc: { loginAttempts: 1 } };
  
  // Lock account after 5 failed attempts for 2 hours
  if (this.loginAttempts + 1 >= 5 && !this.isLocked) {
    updates.$set = { lockUntil: Date.now() + 2 * 60 * 60 * 1000 }; // 2 hours
  }
  
  return this.updateOne(updates);
};

// Instance method to reset login attempts
userSchema.methods.resetLoginAttempts = function() {
  return this.updateOne({
    $unset: { loginAttempts: 1, lockUntil: 1 }
  });
};

// Static method to find users by blood group
userSchema.statics.findByBloodGroup = function(bloodGroup) {
  return this.find({ 
    bloodGroup, 
    userType: 'donor', 
    isActive: true,
    'medicalHistory.isEligibleToDonate': true 
  });
};

// Static method to get dashboard statistics
userSchema.statics.getDashboardStats = async function() {
  const totalUsers = await this.countDocuments({ isActive: true });
  const totalDonors = await this.countDocuments({ userType: 'donor', isActive: true });
  const totalPatients = await this.countDocuments({ userType: 'patient', isActive: true });
  const verifiedUsers = await this.countDocuments({ isVerified: true, isActive: true });
  
  const bloodGroupStats = await this.aggregate([
    { $match: { userType: 'donor', isActive: true } },
    { $group: { _id: '$bloodGroup', count: { $sum: 1 } } },
    { $sort: { _id: 1 } }
  ]);
  
  return {
    totalUsers,
    totalDonors,
    totalPatients,
    verifiedUsers,
    bloodGroupStats
  };
};

// Index for better query performance
userSchema.index({ email: 1 });
userSchema.index({ phone: 1 });
userSchema.index({ bloodGroup: 1, userType: 1 });
userSchema.index({ userType: 1, isActive: 1 });
userSchema.index({ createdAt: -1 });

module.exports = mongoose.model('User', userSchema);