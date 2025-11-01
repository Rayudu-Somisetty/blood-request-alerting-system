# Blood Bank Admin API Integration Guide

## 🎯 **Overview**

This guide shows how to integrate your main website forms with the Blood Bank Admin Portal API. The admin portal provides public endpoints that accept form submissions without authentication.

## 🔗 **API Base URL**

```
Development: http://localhost:5001/api/public
Production: https://your-domain.com/api/public
```

## 📋 **Available Public Endpoints**

### 1. Donation Request Submission

**Endpoint:** `POST /api/public/donation-request`

**Use Case:** When someone fills out a "Donate Blood" form on your main website

**Request Body:**
```json
{
  "donorName": "John Doe",
  "email": "john.doe@example.com",
  "phone": "+919876543210",
  "bloodType": "O+",
  "preferredDate": "2025-08-15",
  "location": "GIMSR Hospital",
  "medicalConditions": "None",
  "consentGiven": true
}
```

**Response:**
```json
{
  "success": true,
  "message": "Donation request submitted successfully",
  "requestId": "66b1234567890abcdef12345"
}
```

### 2. Donor Registration

**Endpoint:** `POST /api/public/donor-registration`

**Use Case:** When someone registers as a new donor

**Request Body:**
```json
{
  "firstName": "John",
  "lastName": "Doe",
  "email": "john.doe@example.com",
  "phone": "+919876543210",
  "bloodGroup": "O+",
  "dateOfBirth": "1990-01-15",
  "address": {
    "street": "123 Main Street",
    "city": "Visakhapatnam",
    "state": "Andhra Pradesh",
    "pincode": "530001"
  },
  "emergencyContact": {
    "name": "Jane Doe",
    "phone": "+919876543211"
  },
  "medicalHistory": "No major medical conditions",
  "consentGiven": true
}
```

### 3. Blood Request (Urgent Need)

**Endpoint:** `POST /api/public/blood-request`

**Use Case:** When someone needs blood urgently

**Request Body:**
```json
{
  "patientName": "Patient Name",
  "bloodType": "A+",
  "unitsNeeded": 2,
  "urgencyLevel": "critical",
  "hospitalName": "GIMSR Hospital",
  "contactPerson": "Dr. Smith",
  "contactPhone": "+919876543210",
  "requiredBy": "2025-08-10",
  "medicalReason": "Surgery"
}
```

### 4. Campaign Participation

**Endpoint:** `POST /api/public/campaign-participation`

**Use Case:** When someone registers for a blood drive/campaign

**Request Body:**
```json
{
  "participantName": "John Doe",
  "email": "john.doe@example.com",
  "phone": "+919876543210",
  "bloodType": "O+",
  "campaignId": "blood-drive-2025",
  "preferredTimeSlot": "10:00 AM - 12:00 PM"
}
```

### 5. Get Available Blood Types

**Endpoint:** `GET /api/public/blood-types`

**Use Case:** Populate dropdown options in forms

**Response:**
```json
{
  "success": true,
  "bloodTypes": ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"]
}
```

### 6. Get Upcoming Blood Drives

**Endpoint:** `GET /api/public/blood-drives`

**Use Case:** Display upcoming events on main website

**Response:**
```json
{
  "success": true,
  "drives": [
    {
      "id": 1,
      "title": "GIMSR Blood Drive 2025",
      "date": "2025-08-15",
      "location": "GIMSR Hospital",
      "description": "Annual blood donation drive"
    }
  ]
}
```

## 💻 **Integration Examples**

### JavaScript/jQuery Example

```javascript
// Donation Request Form Submission
function submitDonationRequest(formData) {
    $.ajax({
        url: 'http://localhost:5001/api/public/donation-request',
        method: 'POST',
        contentType: 'application/json',
        data: JSON.stringify(formData),
        success: function(response) {
            if (response.success) {
                alert('Thank you! Your donation request has been submitted.');
                // Redirect or show success message
                window.location.href = '/thank-you';
            }
        },
        error: function(xhr, status, error) {
            const response = JSON.parse(xhr.responseText);
            alert('Error: ' + response.message);
        }
    });
}

// Usage
$('#donation-form').submit(function(e) {
    e.preventDefault();
    
    const formData = {
        donorName: $('#donor-name').val(),
        email: $('#email').val(),
        phone: $('#phone').val(),
        bloodType: $('#blood-type').val(),
        preferredDate: $('#preferred-date').val(),
        location: $('#location').val(),
        medicalConditions: $('#medical-conditions').val(),
        consentGiven: $('#consent').is(':checked')
    };
    
    submitDonationRequest(formData);
});
```

### React Example

```jsx
import React, { useState } from 'react';
import axios from 'axios';

const DonationForm = () => {
    const [formData, setFormData] = useState({
        donorName: '',
        email: '',
        phone: '',
        bloodType: '',
        preferredDate: '',
        location: '',
        medicalConditions: '',
        consentGiven: false
    });

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        try {
            const response = await axios.post(
                'http://localhost:5001/api/public/donation-request',
                formData
            );
            
            if (response.data.success) {
                alert('Thank you! Your donation request has been submitted.');
                // Reset form or redirect
            }
        } catch (error) {
            alert('Error: ' + error.response.data.message);
        }
    };

    return (
        <form onSubmit={handleSubmit}>
            {/* Form fields */}
            <input
                type="text"
                placeholder="Full Name"
                value={formData.donorName}
                onChange={(e) => setFormData({...formData, donorName: e.target.value})}
                required
            />
            {/* Add other fields */}
            <button type="submit">Submit Donation Request</button>
        </form>
    );
};
```

### PHP Example

```php
<?php
// Handle form submission
if ($_POST['submit']) {
    $formData = [
        'donorName' => $_POST['donor_name'],
        'email' => $_POST['email'],
        'phone' => $_POST['phone'],
        'bloodType' => $_POST['blood_type'],
        'preferredDate' => $_POST['preferred_date'],
        'location' => $_POST['location'],
        'medicalConditions' => $_POST['medical_conditions'],
        'consentGiven' => isset($_POST['consent'])
    ];
    
    $curl = curl_init();
    curl_setopt_array($curl, [
        CURLOPT_URL => 'http://localhost:5001/api/public/donation-request',
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_POST => true,
        CURLOPT_POSTFIELDS => json_encode($formData),
        CURLOPT_HTTPHEADER => [
            'Content-Type: application/json'
        ]
    ]);
    
    $response = curl_exec($curl);
    $httpCode = curl_getinfo($curl, CURLINFO_HTTP_CODE);
    curl_close($curl);
    
    if ($httpCode === 201) {
        $result = json_decode($response, true);
        echo "Success: " . $result['message'];
    } else {
        $error = json_decode($response, true);
        echo "Error: " . $error['message'];
    }
}
?>
```

## 🔒 **Security Considerations**

1. **Rate Limiting**: The API has rate limiting enabled (100 requests per 15 minutes per IP)
2. **Input Validation**: All input is validated server-side
3. **CORS**: Configure CORS settings for your domain
4. **Data Sanitization**: All input is sanitized to prevent XSS attacks

## 📊 **Admin Portal Integration**

Once data is submitted through public endpoints:

1. **Admin Notifications**: Admins receive notifications about new submissions
2. **Review Process**: Admins can review and approve/reject requests
3. **Status Updates**: Status changes can trigger email notifications to users
4. **Analytics**: All submissions are tracked for reporting

## 🚀 **Next Steps**

1. Set up your main website forms to call these endpoints
2. Configure email notifications in the admin portal
3. Set up MongoDB for data persistence
4. Test the complete flow from form submission to admin approval
5. Deploy to production environment

## 📞 **Support**

For integration support or questions, refer to the admin portal documentation or contact the development team.
