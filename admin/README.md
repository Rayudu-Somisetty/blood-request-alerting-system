# GIMSR Blood Bank Admin Portal

## Overview
The GIMSR Blood Bank Admin Portal is a web application designed to manage blood donation activities, user accounts, and email notifications. It consists of a backend built with Node.js and Express.js, and a frontend developed using React.js.

## Features
- **User Management**: Admins can view, add, edit, and delete user accounts.
- **Donation Tracking**: Track blood donations, including adding and updating donation records.
- **Email Notifications**: Send email notifications for various events using Nodemailer.

## Project Structure
```
gimsr-blood-bank-admin
├── backend
│   ├── src
│   │   ├── app.js
│   │   ├── controllers
│   │   │   ├── authController.js
│   │   │   ├── userController.js
│   │   │   ├── donationController.js
│   │   │   └── emailController.js
│   │   ├── routes
│   │   │   ├── auth.js
│   │   │   ├── users.js
│   │   │   ├── donations.js
│   │   │   └── notifications.js
│   │   ├── middleware
│   │   │   ├── auth.js
│   │   │   └── validation.js
│   │   ├── models
│   │   │   ├── User.js
│   │   │   └── Donation.js
│   │   ├── config
│   │   │   └── database.js
│   │   └── utils
│   │       └── emailService.js
│   ├── package.json
│   └── server.js
├── frontend
│   ├── public
│   │   └── index.html
│   ├── src
│   │   ├── components
│   │   │   ├── common
│   │   │   │   ├── Header.jsx
│   │   │   │   ├── Sidebar.jsx
│   │   │   │   └── Layout.jsx
│   │   │   ├── users
│   │   │   │   ├── UserList.jsx
│   │   │   │   ├── UserForm.jsx
│   │   │   │   └── UserProfile.jsx
│   │   │   ├── donations
│   │   │   │   ├── DonationList.jsx
│   │   │   │   ├── DonationForm.jsx
│   │   │   │   └── DonationStats.jsx
│   │   │   └── notifications
│   │   │       ├── EmailTemplates.jsx
│   │   │       └── NotificationCenter.jsx
│   │   ├── pages
│   │   │   ├── Dashboard.jsx
│   │   │   ├── Users.jsx
│   │   │   ├── Donations.jsx
│   │   │   ├── Notifications.jsx
│   │   │   └── Login.jsx
│   │   ├── services
│   │   │   ├── api.js
│   │   │   ├── authService.js
│   │   │   └── donationService.js
│   │   ├── utils
│   │   │   └── helpers.js
│   │   ├── App.jsx
│   │   └── index.js
│   └── package.json
└── README.md
```

## Getting Started

### Prerequisites
- Node.js
- MongoDB (for database)

### Installation
1. Clone the repository:
   ```
   git clone <repository-url>
   ```
2. Navigate to the backend directory and install dependencies:
   ```
   cd backend
   npm install
   ```
3. Navigate to the frontend directory and install dependencies:
   ```
   cd frontend
   npm install
   ```

### Running the Application
1. Start the backend server:
   ```
   cd backend
   node server.js
   ```
2. Start the frontend application:
   ```
   cd frontend
   npm start
   ```

### API Documentation
Refer to the backend code for detailed API endpoints and their usage.

### Contributing
Contributions are welcome! Please submit a pull request or open an issue for any suggestions or improvements.

### License
This project is licensed under the MIT License.