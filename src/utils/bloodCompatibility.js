// Blood compatibility logic for blood bank system
// Determines which donor blood groups can donate to specific recipient blood groups

/**
 * Blood compatibility mapping
 * Key: Recipient blood group
 * Value: Array of compatible donor blood groups
 */
const BLOOD_COMPATIBILITY = {
  'A+': ['A+', 'A-', 'O+', 'O-'],
  'A-': ['A-', 'O-'],
  'B+': ['B+', 'B-', 'O+', 'O-'],
  'B-': ['B-', 'O-'],
  'AB+': ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'], // Universal recipient
  'AB-': ['A-', 'B-', 'AB-', 'O-'],
  'O+': ['O+', 'O-'],
  'O-': ['O-'] // Universal donor can only receive O-
};

/**
 * Get all compatible donor blood groups for a recipient
 * @param {string} recipientBloodGroup - The blood group of the recipient
 * @returns {string[]} Array of compatible donor blood groups
 */
export const getCompatibleDonorBloodGroups = (recipientBloodGroup) => {
  if (!recipientBloodGroup || !BLOOD_COMPATIBILITY[recipientBloodGroup]) {
    throw new Error(`Invalid recipient blood group: ${recipientBloodGroup}`);
  }
  
  return BLOOD_COMPATIBILITY[recipientBloodGroup];
};

/**
 * Check if a donor blood group is compatible with a recipient blood group
 * @param {string} donorBloodGroup - The blood group of the donor
 * @param {string} recipientBloodGroup - The blood group of the recipient
 * @returns {boolean} True if compatible, false otherwise
 */
export const isBloodCompatible = (donorBloodGroup, recipientBloodGroup) => {
  try {
    const compatibleDonors = getCompatibleDonorBloodGroups(recipientBloodGroup);
    return compatibleDonors.includes(donorBloodGroup);
  } catch (error) {
    console.error('Blood compatibility check failed:', error);
    return false;
  }
};

/**
 * Get all blood groups that a specific donor blood group can donate to
 * @param {string} donorBloodGroup - The blood group of the donor
 * @returns {string[]} Array of recipient blood groups this donor can help
 */
export const getCompatibleRecipientBloodGroups = (donorBloodGroup) => {
  const compatibleRecipients = [];
  
  for (const [recipient, donors] of Object.entries(BLOOD_COMPATIBILITY)) {
    if (donors.includes(donorBloodGroup)) {
      compatibleRecipients.push(recipient);
    }
  }
  
  return compatibleRecipients;
};

/**
 * Get urgency-based priority multiplier
 * @param {string} urgencyLevel - 'critical', 'urgent', or 'normal'
 * @returns {number} Priority multiplier
 */
export const getUrgencyPriority = (urgencyLevel) => {
  switch (urgencyLevel) {
    case 'critical':
      return 3;
    case 'urgent':
      return 2;
    case 'normal':
    default:
      return 1;
  }
};

/**
 * Calculate compatibility score for notification prioritization
 * @param {string} donorBloodGroup - Donor's blood group
 * @param {string} recipientBloodGroup - Recipient's blood group
 * @param {string} urgencyLevel - Request urgency level
 * @returns {number} Compatibility score (higher = better match)
 */
export const calculateCompatibilityScore = (donorBloodGroup, recipientBloodGroup, urgencyLevel = 'normal') => {
  if (!isBloodCompatible(donorBloodGroup, recipientBloodGroup)) {
    return 0; // Not compatible
  }
  
  let score = 1; // Base compatibility score
  
  // Perfect match bonus
  if (donorBloodGroup === recipientBloodGroup) {
    score += 2;
  }
  
  // Universal donor bonus for critical cases
  if (donorBloodGroup === 'O-' && urgencyLevel === 'critical') {
    score += 1;
  }
  
  // Apply urgency multiplier
  score *= getUrgencyPriority(urgencyLevel);
  
  return score;
};

/**
 * Sort potential donors by compatibility score
 * @param {Array} donors - Array of donor objects with bloodGroup property
 * @param {string} recipientBloodGroup - Recipient's blood group
 * @param {string} urgencyLevel - Request urgency level
 * @returns {Array} Sorted donors array (highest score first)
 */
export const sortDonorsByCompatibility = (donors, recipientBloodGroup, urgencyLevel = 'normal') => {
  return donors
    .map(donor => ({
      ...donor,
      compatibilityScore: calculateCompatibilityScore(
        donor.bloodGroup,
        recipientBloodGroup,
        urgencyLevel
      )
    }))
    .filter(donor => donor.compatibilityScore > 0) // Only compatible donors
    .sort((a, b) => b.compatibilityScore - a.compatibilityScore);
};

/**
 * Get notification message for blood request
 * @param {Object} request - Blood request object
 * @param {Object} donor - Donor object
 * @returns {string} Formatted notification message
 */
export const getBloodRequestNotificationMessage = (request, donor) => {
  const isExactMatch = donor.bloodGroup === request.bloodGroup;
  const urgencyEmoji = {
    'critical': '🚨',
    'urgent': '⚠️',
    'normal': 'ℹ️'
  };
  
  const emoji = urgencyEmoji[request.urgencyLevel] || 'ℹ️';
  const matchType = isExactMatch ? 'EXACT MATCH' : 'COMPATIBLE';
  
  return `${emoji} BLOOD DONATION NEEDED - ${matchType}

Patient: ${request.patientName}
Blood Group Needed: ${request.bloodGroup}
Your Blood Group: ${donor.bloodGroup}
Units Required: ${request.unitsRequired}
Hospital: ${request.hospitalName}
Urgency: ${request.urgencyLevel.toUpperCase()}

${request.urgencyLevel === 'critical' ? 
  'CRITICAL: Immediate response needed!' : 
  request.urgencyLevel === 'urgent' ? 
  'URGENT: Response needed within 24-48 hours' : 
  'Your donation could save a life!'
}`;
};

/**
 * Validate blood group format
 * @param {string} bloodGroup - Blood group to validate
 * @returns {boolean} True if valid blood group format
 */
export const isValidBloodGroup = (bloodGroup) => {
  const validBloodGroups = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];
  return validBloodGroups.includes(bloodGroup);
};

export default {
  getCompatibleDonorBloodGroups,
  isBloodCompatible,
  getCompatibleRecipientBloodGroups,
  getUrgencyPriority,
  calculateCompatibilityScore,
  sortDonorsByCompatibility,
  getBloodRequestNotificationMessage,
  isValidBloodGroup
};