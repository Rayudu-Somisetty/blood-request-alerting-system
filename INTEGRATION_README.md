# Blood Alert Website - Integrated Admin Portal

This project combines the main blood bank website with a comprehensive admin interface.

## Project Structure

```
blood-bank-website/
├── src/
│   ├── components/              # Main website components
│   ├── admin-components/        # Admin interface components
│   ├── admin-pages/            # Admin pages (Dashboard, Users, etc.)
│   ├── admin-services/         # Admin API services
│   ├── admin-styles/           # Admin CSS/styling
│   ├── context/                # Authentication context
│   ├── hooks/                  # Custom React hooks
│   ├── utils/                  # Utility functions
│   └── App.js                  # Main app with integrated routing
├── backend/                    # Express.js backend server
└── admin/                      # Original admin code (can be removed)
```

## Features

### Main Website
- **Home Page**: Hero section, quick links, live stats, features
- **About Us**: Information about the organization
- **Campaigns**: Blood donation campaigns
- **Donate Blood**: Blood donation form
- **Request Blood**: Blood request form
- **Contact**: Contact information and form

### Admin Portal
- **Dashboard**: Overview with statistics and charts
- **User Management**: CRUD operations for users
- **Blood Requests**: Manage blood requests
- **Blood Donations**: Track and manage donations
- **Blood Campaigns**: Manage blood donation campaigns
- **Real-time Notifications**: Socket.IO integration
- **Authentication**: Secure login system

## Getting Started

### Prerequisites
- Node.js (v14 or higher)
- npm or yarn

### Installation

1. **Install dependencies for frontend:**
   ```bash
   npm install
   ```

2. **Install dependencies for backend:**
   ```bash
   cd backend
   npm install
   ```

3. **Set up environment variables:**
   - Frontend: `.env` file in root directory
   - Backend: `.env` file in backend directory

### Running the Application

1. **Start the backend server:**
   ```bash
   cd backend
   npm start
   ```
   The backend will run on `http://localhost:5001`

2. **Start the frontend (in a new terminal):**
   ```bash
   npm start
   ```
   The frontend will run on `http://localhost:3000`

## Access Points

### Main Website
- **Home**: `http://localhost:3000/`
- **About**: `http://localhost:3000/about`
- **Campaigns**: `http://localhost:3000/campaigns`
- **Donate**: `http://localhost:3000/donate`
- **Request**: `http://localhost:3000/request`
- **Contact**: `http://localhost:3000/contact`

### Admin Portal
- **Login**: `http://localhost:3000/admin/login`
- **Dashboard**: `http://localhost:3000/admin/dashboard`
- **Users**: `http://localhost:3000/admin/users`
- **Blood Requests**: `http://localhost:3000/admin/blood-requests`
- **Blood Donations**: `http://localhost:3000/admin/blood-donations`
- **Blood Campaigns**: `http://localhost:3000/admin/blood-drives`

## Demo Credentials
- **Email**: `admin@gimsr.edu.in`
- **Password**: `admin123`

## Key Integration Points

### Routing
The main `App.js` now includes:
- Public routes for the main website
- Protected admin routes with authentication
- Automatic redirects for authenticated/unauthenticated users

### Authentication
- JWT-based authentication
- Persistent sessions with localStorage
- Protected route components
- Automatic token refresh handling

### API Integration
- Backend API running on port 5001
- Frontend configured to use the admin API
- Real-time notifications via Socket.IO
- Database integration with Prisma ORM

### Navigation
- Main website navigation includes "Admin Portal" link
- Separate admin layout with sidebar navigation
- Responsive design for both interfaces

## Technologies Used

### Frontend
- React 18
- React Router DOM
- Bootstrap 5
- React Bootstrap
- Axios for API calls
- React Hook Form
- React Toastify
- Chart.js for admin dashboard
- Socket.IO client

### Backend
- Node.js
- Express.js
- Prisma ORM
- SQLite/PostgreSQL
- JWT authentication
- Socket.IO for real-time features
- Bcrypt for password hashing

## Development Notes

1. **Environment Configuration**: Make sure both frontend and backend have their respective `.env` files configured
2. **Database Setup**: The backend includes Prisma setup scripts for database initialization
3. **CORS**: Backend is configured to allow requests from the frontend
4. **File Structure**: Admin components are organized separately to maintain clean separation
5. **Styling**: Both Bootstrap themes are included and scoped appropriately

## Deployment

For production deployment:
1. Build the frontend: `npm run build`
2. Configure production environment variables
3. Set up database (PostgreSQL recommended for production)
4. Deploy backend and frontend to your hosting platform

## Support

For any issues or questions:
1. Check the terminal output for error messages
2. Verify all environment variables are set correctly
3. Ensure both frontend and backend servers are running
4. Check browser console for any client-side errors

## Next Steps

1. **Database Migration**: Move from SQLite to PostgreSQL for production
2. **Email Integration**: Configure email notifications for the admin portal
3. **Security**: Implement additional security measures (rate limiting, input validation)
4. **Testing**: Add comprehensive test suites for both frontend and backend
5. **Monitoring**: Add logging and monitoring for production environment
