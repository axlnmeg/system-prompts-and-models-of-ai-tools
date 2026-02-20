# MyAppGym - Gym Management System

A comprehensive gym management system for gym owners to manage members, classes, equipment, payments, staff, and attendance.

![MyAppGym](https://img.shields.io/badge/version-1.0.0-blue.svg)
![License](https://img.shields.io/badge/license-MIT-green.svg)

## Features

### 🏋️ Member Management
- Add, edit, and delete members
- Track membership plans and status
- Member profiles with health information
- QR code generation for quick check-ins
- Membership freezing and renewal

### 📅 Class Scheduling
- Create and manage fitness classes
- Schedule recurring sessions
- Manage class capacity and enrollment
- Assign instructors to classes
- Waitlist management for full classes

### 🔧 Equipment Tracking
- Track all gym equipment
- Monitor equipment condition
- Schedule maintenance
- Location tracking within the gym

### 💳 Payment Processing
- Track membership payments
- Payment history and invoices
- Revenue analytics and reporting
- Refund management

### 👨‍💼 Staff Management
- Manage trainers and instructors
- Staff schedules and availability
- Specialization tracking
- Performance ratings

### 📊 Dashboard & Analytics
- Real-time statistics
- Revenue charts
- Attendance tracking
- Member growth analytics
- Alerts and notifications

### ✅ Attendance Tracking
- Member check-in/check-out
- QR code scanning
- Attendance history
- Duration tracking

## Tech Stack

### Backend
- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **MongoDB** - Database
- **Mongoose** - ODM
- **JWT** - Authentication

### Frontend
- **React** - UI library
- **React Router** - Routing
- **Chart.js** - Charts and graphs
- **Axios** - HTTP client
- **React Hot Toast** - Notifications

## Installation

### Prerequisites
- Node.js (v14 or higher)
- MongoDB (v4.4 or higher)
- npm or yarn

### Setup

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/myappgym.git
   cd myappgym
   ```

2. **Install dependencies**
   ```bash
   # Install root dependencies
   npm install
   
   # Install backend dependencies
   cd backend
   npm install
   
   # Install frontend dependencies
   cd ../frontend
   npm install
   ```

3. **Configure environment variables**
   
   Create a `.env` file in the backend directory:
   ```env
   PORT=5000
   NODE_ENV=development
   MONGODB_URI=mongodb://localhost:27017/myappgym
   JWT_SECRET=your-super-secret-jwt-key-change-in-production
   JWT_EXPIRE=30d
   ```

4. **Start MongoDB**
   ```bash
   mongod
   ```

5. **Seed the database** (optional)
   ```bash
   cd backend
   npm run seed
   ```

6. **Start the application**
   ```bash
   # From root directory
   npm run dev
   ```
   
   Or start backend and frontend separately:
   ```bash
   # Terminal 1 - Backend
   cd backend
   npm run dev
   
   # Terminal 2 - Frontend
   cd frontend
   npm start
   ```

## Usage

### Demo Credentials

After running the seed script, you can use these credentials:

- **Owner**: owner@gym.com / password123
- **Admin**: admin@gym.com / password123

### User Roles

| Role | Permissions |
|------|-------------|
| Owner | Full access to all features |
| Admin | Most features except critical operations |
| Staff | Limited access to basic features |

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user
- `PUT /api/auth/profile` - Update profile
- `PUT /api/auth/password` - Change password

### Members
- `GET /api/members` - Get all members
- `GET /api/members/:id` - Get member details
- `POST /api/members` - Create member
- `PUT /api/members/:id` - Update member
- `DELETE /api/members/:id` - Delete member
- `PUT /api/members/:id/membership` - Update membership
- `POST /api/members/:id/freeze` - Freeze membership

### Classes
- `GET /api/classes` - Get all classes
- `GET /api/classes/schedule` - Get class schedule
- `GET /api/classes/:id` - Get class details
- `POST /api/classes` - Create class
- `PUT /api/classes/:id` - Update class
- `DELETE /api/classes/:id` - Delete class
- `POST /api/classes/:id/enroll` - Enroll member
- `POST /api/classes/:id/cancel` - Cancel enrollment

### Equipment
- `GET /api/equipment` - Get all equipment
- `POST /api/equipment` - Add equipment
- `PUT /api/equipment/:id` - Update equipment
- `DELETE /api/equipment/:id` - Delete equipment
- `POST /api/equipment/:id/maintenance` - Add maintenance record

### Payments
- `GET /api/payments` - Get all payments
- `GET /api/payments/stats` - Get payment statistics
- `POST /api/payments` - Create payment
- `POST /api/payments/:id/refund` - Refund payment

### Staff
- `GET /api/staff` - Get all staff
- `GET /api/staff/instructors` - Get instructors
- `POST /api/staff` - Add staff member
- `PUT /api/staff/:id` - Update staff
- `DELETE /api/staff/:id` - Delete staff

### Attendance
- `GET /api/attendance/today` - Get today's attendance
- `POST /api/attendance/check-in` - Check in member
- `POST /api/attendance/check-out` - Check out member
- `POST /api/attendance/scan-qr` - QR code scan

### Dashboard
- `GET /api/dashboard/stats` - Get dashboard statistics
- `GET /api/dashboard/revenue` - Get revenue data
- `GET /api/dashboard/attendance` - Get attendance data
- `GET /api/dashboard/member-growth` - Get member growth data

## Project Structure

```
myappgym/
├── backend/
│   ├── src/
│   │   ├── models/         # Mongoose models
│   │   ├── routes/         # API routes
│   │   ├── middleware/     # Custom middleware
│   │   ├── config/         # Configuration files
│   │   └── server.js       # Entry point
│   ├── tests/
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── components/     # React components
│   │   ├── pages/          # Page components
│   │   ├── context/        # React context
│   │   ├── hooks/          # Custom hooks
│   │   ├── utils/          # Utility functions
│   │   ├── styles/         # CSS files
│   │   ├── App.js
│   │   └── index.js
│   ├── public/
│   └── package.json
└── package.json
```

## Screenshots

### Dashboard
View real-time statistics, revenue charts, and alerts.

### Member Management
Add, edit, and manage gym members with detailed profiles.

### Class Scheduling
Create and schedule fitness classes with instructor assignments.

### Attendance Tracking
Track member check-ins with QR code scanning support.

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Support

For support, email support@myappgym.com or open an issue in the repository.

## Roadmap

- [ ] Mobile application
- [ ] Integration with payment gateways
- [ ] Email notifications
- [ ] SMS notifications
- [ ] Advanced reporting
- [ ] Multi-location support
- [ ] Online class booking
- [ ] Personal training scheduling
- [ ] Inventory management
- [ ] Member mobile app

---

Built with ❤️ by MyAppGym Team
