import React, { useState, useEffect } from 'react';
import { Container, Row, Col } from 'react-bootstrap';
import firebaseService from '../firebase/firebaseService';

const LiveStats = () => {
  const [stats, setStats] = useState({
    unitsThisMonth: 0,
    activeUsers: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLiveStats();
    
    // Refresh stats every 30 seconds to show real-time updates
    const interval = setInterval(fetchLiveStats, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchLiveStats = async () => {
    try {
      setLoading(true);
      
      // Fetch donations and users
      const [donationsResult, usersResult] = await Promise.all([
        firebaseService.getDonations(),
        firebaseService.getUsers()
      ]);

      // Calculate donations this month
      const currentMonth = new Date().getMonth();
      const currentYear = new Date().getFullYear();
      
      let unitsThisMonth = 0;
      if (donationsResult && donationsResult.length > 0) {
        unitsThisMonth = donationsResult.filter(donation => {
          if (!donation.createdAt) return false;
          const donationDate = new Date(donation.createdAt);
          return donationDate.getMonth() === currentMonth && 
                 donationDate.getFullYear() === currentYear &&
                 (donation.status === 'completed' || donation.status === 'scheduled');
        }).length;
      }

      // Calculate active users (all non-admin users who are active)
      let activeUsers = 0;
      if (usersResult && usersResult.data && usersResult.data.length > 0) {
        activeUsers = usersResult.data.filter(user => 
          user.role !== 'admin' && 
          user.userType !== 'admin' && 
          user.isActive !== false
        ).length;
      } else if (usersResult && usersResult.length > 0) {
        // Handle case where result is just an array
        activeUsers = usersResult.filter(user => 
          user.role !== 'admin' && 
          user.userType !== 'admin' && 
          user.isActive !== false
        ).length;
      }

      setStats({
        unitsThisMonth,
        activeUsers
      });

    } catch (error) {
      console.error('Error fetching live stats:', error);
      setStats({
        unitsThisMonth: 0,
        activeUsers: 0
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="live-stats py-4 bg-danger text-white">
        <Container>
          <Row className="text-center">
            <Col md={6}>
              <div className="spinner-border text-white" role="status">
                <span className="visually-hidden">Loading...</span>
              </div>
              <p className="display-4 fw mt-2">Loading Stats...</p>
            </Col>
          </Row>
        </Container>
      </div>
    );
  }

  return (
    <div className="live-stats py-4 bg-danger text-white">
      <Container>
        <Row className="text-center justify-content-center">
          <Col md={6}>
            <h3 className="display-4 fw-bold">{stats.activeUsers}</h3>
            <p className="display-4 fw">Active Users</p>
          </Col>
        </Row>
      </Container>
    </div>
  );
};

export default LiveStats;
