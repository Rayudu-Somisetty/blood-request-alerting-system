export const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
};

export const calculateDonationStats = (donations) => {
    const totalDonations = donations.length;
    const totalVolume = donations.reduce((acc, donation) => acc + donation.volume, 0);
    return { totalDonations, totalVolume };
};

export const validateEmail = (email) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(String(email).toLowerCase());
};

export const showAlert = (message, type = 'info') => {
    alert(`[${type.toUpperCase()}] ${message}`);
};