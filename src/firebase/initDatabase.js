// Firebase Database Initialization Script for Blood Alert
import { initializeApp } from 'firebase/app';
import { getFirestore, collection, addDoc, doc, setDoc, writeBatch } from 'firebase/firestore';
import { getAuth, createUserWithEmailAndPassword } from 'firebase/auth';

// Your Firebase config (replace with actual values)
const firebaseConfig = {
  apiKey: "AIzaSyArJH2CV_Llg8jEYy3s1ruhSzyuLbNOjuk",
  authDomain: "blood-alert-4912.firebaseapp.com",
  projectId: "blood-alert-4912",
  storageBucket: "blood-alert-4912.firebasestorage.app",
  messagingSenderId: "1057362162762",
  appId: "1:1057362162762:web:246cb590201b1727a322b3",
  measurementId: "G-FNRHEMH4TX"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

// Sample data to seed the database
const sampleUsers = [
  {
    email: 'admin@gimsr.edu.in',
    password: 'admin123',
    firstName: 'Admin',
    lastName: 'User',
    phone: '+91-9876543211',
    dateOfBirth: '1992-01-01',
    gender: 'male',
    bloodGroup: 'A+',
    address: 'GIMSR Blood Bank, Visakhapatnam',
    city: 'Visakhapatnam',
    state: 'Andhra Pradesh',
    pincode: '530045',
    role: 'admin',
    userType: 'staff',
    department: 'Blood Bank',
    isActive: true,
    isVerified: true,
    adminType: 'admin',
    canModifyData: true,
    canAddAdmins: true
  },
  {
    email: 'donor1@example.com',
    password: 'donor123',
    firstName: 'John',
    lastName: 'Doe',
    phone: '+91-9876543211',
    dateOfBirth: '1995-05-15',
    gender: 'male',
    bloodGroup: 'A+',
    address: '123 Main Street',
    city: 'Visakhapatnam',
    state: 'Andhra Pradesh',
    pincode: '530001',
    role: 'user',
    userType: 'donor',
    isActive: true,
    isVerified: true
  },
  {
    email: 'recipient1@example.com',
    password: 'recipient123',
    firstName: 'Jane',
    lastName: 'Smith',
    phone: '+91-9876543212',
    dateOfBirth: '1988-08-20',
    gender: 'female',
    bloodGroup: 'B+',
    address: '456 Oak Avenue',
    city: 'Visakhapatnam',
    state: 'Andhra Pradesh',
    pincode: '530002',
    role: 'user',
    userType: 'recipient',
    isActive: true,
    isVerified: true
  }
];

const sampleNotifications = [
  {
    title: 'New Blood Donation Request',
    message: 'Emergency request for O+ blood type at City Hospital. 2 units needed urgently.',
    type: 'urgent',
    icon: 'bi-droplet-fill',
    read: false,
    isGlobal: true,
    createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
    updatedAt: new Date()
  },
  {
    title: 'New User Registration',
    message: 'John Doe has registered as a blood donor (O+ blood type).',
    type: 'info',
    icon: 'bi-person-plus',
    read: false,
    isGlobal: true,
    createdAt: new Date(Date.now() - 4 * 60 * 60 * 1000), // 4 hours ago
    updatedAt: new Date()
  },
  {
    title: 'Blood Drive Scheduled',
    message: 'Community blood drive scheduled for next weekend at Central Park.',
    type: 'info',
    icon: 'bi-calendar-event',
    read: true,
    isGlobal: true,
    createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000), // 1 day ago
    updatedAt: new Date()
  },
  {
    title: 'System Maintenance',
    message: 'Scheduled system maintenance will occur tomorrow from 2 AM to 4 AM.',
    type: 'warning',
    icon: 'bi-tools',
    read: true,
    isGlobal: true,
    createdAt: new Date(Date.now() - 48 * 60 * 60 * 1000), // 2 days ago
    updatedAt: new Date()
  }
];

const sampleBloodRequests = [
  {
    patientName: 'Emergency Patient',
    bloodGroup: 'O+',
    unitsRequired: 2,
    urgency: 'urgent',
    hospitalName: 'Blood Alert Partner Hospital',
    contactPerson: 'Dr. Kumar',
    contactPhone: '+91-9876543220',
    contactEmail: 'dr.kumar@bloodalert.com',
    requiredDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000), // 2 days from now
    medicalReason: 'Surgery requirement',
    additionalNotes: 'Patient scheduled for emergency surgery',
    status: 'active',
    fulfilled: false
  },
  {
    patientName: 'Chronic Patient',
    bloodGroup: 'A+',
    unitsRequired: 1,
    urgency: 'medium',
    hospitalName: 'Blood Alert Partner Hospital',
    contactPerson: 'Dr. Patel',
    contactPhone: '+91-9876543221',
    contactEmail: 'dr.patel@bloodalert.com',
    requiredDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
    medicalReason: 'Anemia treatment',
    additionalNotes: 'Regular patient, monthly requirement',
    status: 'active',
    fulfilled: false
  }
];

const sampleDonations = [
  {
    donationType: 'whole_blood',
    donationDate: new Date().toISOString().split('T')[0],
    donationTime: '10:00',
    location: 'Blood Alert Blood Center',
    isFirstTime: false,
    lastDonationDate: '2023-10-15',
    medicalHistory: {
      hasChronicIllness: false,
      hasRecentSurgery: false,
      isOnMedication: false,
      hasAllergies: false
    },
    lifestyle: {
      smokingStatus: 'never',
      alcoholConsumption: 'never',
      recentTravel: false
    },
    additionalNotes: 'Regular donor',
    status: 'scheduled'
  }
];

// Function to initialize the database with sample data
export async function initializeDatabase() {
  try {
    console.log('Starting database initialization...');
    
    const batch = writeBatch(db);
    
    // Create sample users
    console.log('Creating sample users...');
    for (const userData of sampleUsers) {
      try {
        const { email, password, ...profileData } = userData;
        
        // Create user account
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;
        
        // Create user profile in Firestore
        const userProfile = {
          ...profileData,
          uid: user.uid,
          email: user.email,
          createdAt: new Date(),
          updatedAt: new Date(),
          totalDonations: 0,
          totalRequests: 0
        };
        
        batch.set(doc(db, 'users', user.uid), userProfile);
        console.log(`Created user: ${email}`);
        
        // Add sample donation for donors
        if (userData.userType === 'donor' && sampleDonations.length > 0) {
          const donationData = {
            ...sampleDonations[0],
            donorId: user.uid,
            createdAt: new Date(),
            updatedAt: new Date()
          };
          
          const donationRef = doc(collection(db, 'donations'));
          batch.set(donationRef, donationData);
        }
        
      } catch (error) {
        console.error(`Error creating user ${userData.email}:`, error);
      }
    }
    
    // Create sample notifications
    console.log('Creating sample notifications...');
    for (const notificationData of sampleNotifications) {
      const notificationRef = doc(collection(db, 'notifications'));
      batch.set(notificationRef, notificationData);
    }
    
    // Create sample blood requests
    console.log('Creating sample blood requests...');
    for (const requestData of sampleBloodRequests) {
      const requestRef = doc(collection(db, 'bloodRequests'));
      batch.set(requestRef, {
        ...requestData,
        createdAt: new Date(),
        updatedAt: new Date()
      });
    }
    
    // Commit all operations
    await batch.commit();
    console.log('Database initialization completed successfully!');
    
    return {
      success: true,
      message: 'Database initialized with sample data'
    };
    
  } catch (error) {
    console.error('Database initialization failed:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

// Function to clear all collections (use with caution)
export async function clearDatabase() {
  try {
    console.log('Clearing database...');
    
    const collections = ['users', 'donations', 'bloodRequests', 'components', 'documents', 'notes'];
    
    for (const collectionName of collections) {
      const querySnapshot = await getDocs(collection(db, collectionName));
      const batch = writeBatch(db);
      
      querySnapshot.docs.forEach((doc) => {
        batch.delete(doc.ref);
      });
      
      await batch.commit();
      console.log(`Cleared collection: ${collectionName}`);
    }
    
    console.log('Database cleared successfully!');
    return { success: true };
    
  } catch (error) {
    console.error('Database clearing failed:', error);
    return { success: false, error: error.message };
  }
}

// Export the database and auth instances for use in other parts of the app
export { db, auth };
