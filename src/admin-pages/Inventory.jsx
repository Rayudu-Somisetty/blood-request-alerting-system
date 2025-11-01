import React, { useState, useEffect } from 'react';
import firebaseService from '../firebase/firebaseService';

const Inventory = () => {
  const [inventory, setInventory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalUnits: 0,
    totalDonors: 0,
    availableGroups: 0
  });

  useEffect(() => {
    fetchInventoryData();
  }, []);

  const fetchInventoryData = async () => {
    try {
      setLoading(true);
      
      // Fetch donations and users to simulate inventory
      const [donationsResult, usersResult] = await Promise.all([
        firebaseService.getDonations(),
        firebaseService.getUsers()
      ]);

      const bloodGroups = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];
      const inventoryData = [];

      // Calculate inventory based on completed donations and available donors
      for (const group of bloodGroups) {
        // Count completed donations for this blood group
        const groupDonations = donationsResult?.filter(donation => 
          donation.bloodGroup === group && 
          donation.status === 'completed'
        ) || [];

        // Count available donors for this blood group
        const groupDonors = usersResult?.filter(user => 
          user.bloodGroup === group && 
          user.role !== 'admin' && 
          user.isActive !== false
        ) || [];

        // Simulate inventory units based on donations and donors
        const unitsFromDonations = groupDonations.length;
        const potentialUnits = groupDonors.length;
        const totalUnits = unitsFromDonations + Math.floor(potentialUnits * 0.3); // Assume 30% of donors have donated recently

        // Determine status based on units available
        let status = 'low';
        if (totalUnits >= 10) status = 'high';
        else if (totalUnits >= 5) status = 'medium';

        // Generate sample expiry dates for batches
        const expiryDates = [];
        if (unitsFromDonations > 0) {
          const batches = Math.ceil(unitsFromDonations / 3);
          for (let i = 0; i < batches; i++) {
            const batchUnits = i === batches - 1 ? 
              (unitsFromDonations % 3) || 3 : 3;
            const expiryDate = new Date();
            expiryDate.setDate(expiryDate.getDate() + (35 - i * 7)); // Blood expires in ~35 days, stagger batches
            
            expiryDates.push({
              units: batchUnits,
              expiry: expiryDate.toISOString().split('T')[0]
            });
          }
        }

        if (totalUnits > 0 || groupDonors.length > 0) {
          inventoryData.push({
            bloodGroup: group,
            units: totalUnits,
            donors: groupDonors.length,
            donations: unitsFromDonations,
            status: status,
            expiryDates: expiryDates.length > 0 ? expiryDates : [{
              units: totalUnits,
              expiry: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0] // 30 days from now
            }]
          });
        }
      }

      setInventory(inventoryData);
      
      // Calculate summary stats
      const statsData = {
        totalUnits: inventoryData.reduce((total, item) => total + item.units, 0),
        totalDonors: inventoryData.reduce((total, item) => total + item.donors, 0),
        availableGroups: inventoryData.length
      };
      setStats(statsData);

    } catch (error) {
      console.error('Error fetching inventory data:', error);
      setInventory([]);
      setStats({ totalUnits: 0, totalDonors: 0, availableGroups: 0 });
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'high': return 'bg-success text-white';
      case 'medium': return 'bg-warning text-dark';
      case 'low': return 'bg-danger text-white';
      default: return 'bg-secondary text-white';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'high': return 'High Reserve';
      case 'medium': return 'Medium Reserve';
      case 'low': return 'Low Reserve';
      default: return 'Unknown';
    }
  };

  const isExpiringSoon = (expiryDate) => {
    const today = new Date();
    const expiry = new Date(expiryDate);
    const diffTime = expiry - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays <= 7;
  };

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ height: '400px' }}>
        <div className="loading-spinner"></div>
      </div>
    );
  }

  return (
    <div className="container-fluid p-4">
      {/* Header */}
      <div className="row mb-4">
        <div className="col">
          <h2 className="h3 text-black fw-bold mb-2">Blood Inventory Management</h2>
          <p className="text-muted">Monitor blood stock levels and expiry dates</p>
        </div>
      </div>

      {/* Inventory Grid */}
      <div className="row">
        {inventory.length === 0 ? (
          <div className="col-12">
            <div className="card border-0 shadow-sm">
              <div className="card-body text-center py-5">
                <i className="bi bi-droplet text-muted" style={{fontSize: '3rem'}}></i>
                <h5 className="text-muted mt-3">No inventory data available</h5>
                <p className="text-muted">Blood inventory information will appear here when you start managing stock</p>
                <button className="btn btn-primary">
                  <i className="bi bi-plus-circle me-2"></i>
                  Add First Stock Entry
                </button>
              </div>
            </div>
          </div>
        ) : (
          inventory.map((item) => (
            <div key={item.bloodGroup} className="col-lg-3 col-md-6 mb-4">
              <div className="card border-0 shadow-sm h-100">
                <div className="card-header bg-white border-bottom">
                  <div className="d-flex justify-content-between align-items-center">
                    <div className="d-flex align-items-center">
                      <div className="bg-red-100 p-2 rounded me-2">
                        <i className="bi bi-droplet-fill text-red-600"></i>
                      </div>
                      <h5 className="text-black mb-0 fw-bold">{item.bloodGroup}</h5>
                    </div>
                    <span className={`badge ${getStatusColor(item.status)}`}>
                      {getStatusText(item.status)}
                    </span>
                  </div>
                </div>
                <div className="card-body">
                  <div className="text-center mb-3">
                    <h2 className="text-black mb-1">{item.units}</h2>
                    <small className="text-muted">Total Units Available</small>
                    <div className="mt-2">
                      <span className="badge bg-info text-white me-2">
                        {item.donors} Donors
                      </span>
                      <span className="badge bg-success text-white">
                        {item.donations} Donated
                      </span>
                    </div>
                  </div>
                  
                  <div className="border-top pt-3">
                    <h6 className="text-black mb-3">Expiry Details:</h6>
                    <div className="small">
                      {item.expiryDates.map((batch, index) => (
                        <div key={index} className={`d-flex justify-content-between align-items-center mb-2 p-2 rounded ${
                          isExpiringSoon(batch.expiry) ? 'bg-danger bg-opacity-10 border border-danger' : 'bg-light'
                        }`}>
                          <span className="text-black">
                            {batch.units} units
                            {isExpiringSoon(batch.expiry) && (
                              <i className="bi bi-exclamation-triangle-fill text-danger ms-1"></i>
                            )}
                          </span>
                          <span className={isExpiringSoon(batch.expiry) ? 'text-danger fw-bold' : 'text-muted'}>
                            {new Date(batch.expiry).toLocaleDateString()}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
                <div className="card-footer bg-white border-top">
                  <div className="d-grid gap-2">
                    <button className="btn btn-outline-red btn-sm">
                      <i className="bi bi-plus-circle me-1"></i>
                      Add Stock
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Summary Statistics */}
      <div className="row mt-4">
        <div className="col-12">
          <div className="card border-0 shadow-sm">
            <div className="card-header bg-white border-bottom">
              <h5 className="card-title mb-0 text-black">Inventory Summary</h5>
            </div>
            <div className="card-body">
              <div className="row text-center">
                <div className="col-md-3">
                  <div className="border-end pe-3">
                    <h3 className="text-success mb-1">{inventory.filter(item => item.status === 'high').length}</h3>
                    <small className="text-muted">High Reserve Groups</small>
                  </div>
                </div>
                <div className="col-md-3">
                  <div className="border-end pe-3">
                    <h3 className="text-warning mb-1">{inventory.filter(item => item.status === 'medium').length}</h3>
                    <small className="text-muted">Medium Reserve Groups</small>
                  </div>
                </div>
                <div className="col-md-3">
                  <div className="border-end pe-3">
                    <h3 className="text-danger mb-1">{inventory.filter(item => item.status === 'low').length}</h3>
                    <small className="text-muted">Low Reserve Groups</small>
                  </div>
                </div>
                <div className="col-md-3">
                  <h3 className="text-black mb-1">{stats.totalUnits}</h3>
                  <small className="text-muted">Total Units Available</small>
                  <div className="mt-1">
                    <small className="text-info">{stats.totalDonors} Total Donors</small>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Inventory;
