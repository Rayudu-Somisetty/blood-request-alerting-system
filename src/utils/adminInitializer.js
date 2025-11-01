// Admin initialization utility
import { getAuth, createUserWithEmailAndPassword } from 'firebase/auth';
import { getFirestore, doc, setDoc, getDoc, collection, getDocs } from 'firebase/firestore';

export const initializeAdmins = async () => {
  const auth = getAuth();
  const db = getFirestore();
  
  const adminsToCreate = [
    {
      email: 'admin@bloodalert.com',
      password: 'admin123',
      userData: {
        firstName: 'Blood',
        lastName: 'Alert Admin',
        phone: '+91-9999999999',
        dateOfBirth: '1990-01-01',
        gender: 'male',
        bloodGroup: 'O+',
        address: 'Blood Alert Headquarters',
        city: 'Visakhapatnam',
        state: 'Andhra Pradesh',
        pincode: '530001',
        role: 'admin',
        userType: 'staff',
        department: 'Administration',
        isActive: true,
        isVerified: true,
        adminType: 'admin',
        canModifyData: true,
        canAddAdmins: true
      }
    },
    {
      email: 'admin@gimsr.edu.in',
      password: 'admin123',
      userData: {
        firstName: 'GIMSR',
        lastName: 'Admin',
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
      }
    }
  ];

  const results = [];

  for (const adminData of adminsToCreate) {
    try {
      console.log(`Creating admin: ${adminData.email}`);
      
      // Try to create the user account
      const userCredential = await createUserWithEmailAndPassword(
        auth, 
        adminData.email, 
        adminData.password
      );
      
      const user = userCredential.user;
      
      // Create user profile in Firestore
      const userProfile = {
        ...adminData.userData,
        email: user.email,
        uid: user.uid,
        createdAt: new Date(),
        updatedAt: new Date(),
        totalDonations: 0,
        totalRequests: 0
      };
      
      await setDoc(doc(db, 'users', user.uid), userProfile);
      
      results.push({
        email: adminData.email,
        success: true,
        message: 'Admin created successfully'
      });
      
      console.log(`✅ Created admin: ${adminData.email}`);
      
    } catch (error) {
      console.log(`Error creating admin ${adminData.email}:`, error.message);
      
      if (error.code === 'auth/email-already-in-use') {
        results.push({
          email: adminData.email,
          success: true,
          message: 'Admin already exists'
        });
        console.log(`ℹ️ Admin already exists: ${adminData.email}`);
      } else {
        results.push({
          email: adminData.email,
          success: false,
          message: error.message
        });
        console.log(`❌ Failed to create admin: ${adminData.email} - ${error.message}`);
      }
    }
  }

  return results;
};

export const checkAdminExists = async (email) => {
  try {
    const db = getFirestore();
    
    // This is a simple way to check without complex queries
    // We'll get all users and filter
    const usersRef = collection(db, 'users');
    const querySnapshot = await getDocs(usersRef);
    
    let adminExists = false;
    querySnapshot.forEach((doc) => {
      const userData = doc.data();
      if (userData.email === email) {
        adminExists = true;
      }
    });
    
    return adminExists;
  } catch (error) {
    console.error('Error checking admin existence:', error);
    return false;
  }
};
