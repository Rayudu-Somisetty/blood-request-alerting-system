// Permission checking utilities for admin roles
export const AdminPermissions = {
  // Check if user is any type of admin
  isAdmin: (user) => {
    return user?.role === 'admin' || user?.adminType === 'admin';
  },

  // Check if user can modify data (all admins can modify data)
  canModifyData: (user) => {
    return AdminPermissions.isAdmin(user);
  },

  // Check if user can add/remove admins (all admins can manage other admins)
  canManageAdmins: (user) => {
    return AdminPermissions.isAdmin(user);
  },

  // Check if user can view admin settings
  canViewAdminSettings: (user) => {
    return AdminPermissions.isAdmin(user);
  },

  // Check if user can edit specific admin
  canEditAdmin: (currentUser, targetAdmin) => {
    if (!AdminPermissions.isAdmin(currentUser)) {
      return false;
    }
    
    // Admin cannot edit themselves
    if (currentUser?.uid === targetAdmin?.uid) {
      return false;
    }
    
    return true;
  },

  // Check if user can delete specific admin
  canDeleteAdmin: (currentUser, targetAdmin) => {
    if (!AdminPermissions.isAdmin(currentUser)) {
      return false;
    }
    
    // Admin cannot delete themselves
    if (currentUser?.uid === targetAdmin?.uid) {
      return false;
    }
    
    return true;
  },

  // Get user permissions list
  getUserPermissions: (user) => {
    if (AdminPermissions.isAdmin(user)) {
      return [
        'Full System Access',
        'Modify All Data',
        'Add/Remove Admin Users',
        'System Configuration',
        'Database Management',
        'Generate Reports',
        'User Management',
        'Blood Bank Operations',
        'Inventory Management'
      ];
    } else {
      return ['Basic User Access'];
    }
  },

  // Get admin type display name
  getAdminTypeDisplay: (user) => {
    if (AdminPermissions.isAdmin(user)) {
      return 'Admin';
    } else {
      return 'User';
    }
  },

  // Get admin type badge class
  getAdminTypeBadgeClass: (user) => {
    if (AdminPermissions.isAdmin(user)) {
      return 'bg-primary';
    } else {
      return 'bg-secondary';
    }
  }
};
