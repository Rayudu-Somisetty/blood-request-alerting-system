import api from './api';

const donationService = {
    getAllDonations: async () => {
        const response = await api.get('/donations');
        return response.data;
    },

    getDonationById: async (id) => {
        const response = await api.get(`/donations/${id}`);
        return response.data;
    },

    createDonation: async (donationData) => {
        const response = await api.post('/donations', donationData);
        return response.data;
    },

    updateDonation: async (id, donationData) => {
        const response = await api.put(`/donations/${id}`, donationData);
        return response.data;
    },

    deleteDonation: async (id) => {
        const response = await api.delete(`/donations/${id}`);
        return response.data;
    }
};

export default donationService;