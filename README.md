Restaurant Management System (RMS)

A comprehensive full-stack solution for restaurant operations management featuring role-based access control, real-time order processing, inventory management, and advanced reporting.

![GitHub](https://img.shields.io/github/license/Kostasanasta/restaurant-management-system)

Overview

This Restaurant Management System provides a complete solution for restaurants of all sizes to manage their daily operations efficiently. The system uses role-based access control to provide tailored interfaces for different staff members, from administrators to waiters, ensuring each role has access to the tools they need without unnecessary complexity.

Key Features

User Authentication & Authorization
- Secure JWT-based authentication system
- Role-based access control with four distinct roles:
  - Admin: Full system access including user management and system configuration
  - Manager: Access to reporting, staff management, and operational controls
  - Chef: Kitchen-facing interface focusing on order preparation and inventory
  - Waiter: Table management, order creation, and customer-facing operations
- Permission-based feature access
- Automatic session timeout for security

Order Management
- Intuitive order creation interface
- Real-time order status updates
- Kitchen display system for chefs
- Customizable items and special requests handling
- Order history and search functionality
- Table management integration

Reservation System
- Calendar-based reservation interface
- Automated conflict detection
- Customer information management
- Reservation confirmation notifications
- Table assignment optimization
- Waitlist functionality

Menu Management
- Dynamic menu categorization
- Seasonal menu capabilities
- Item availability toggles
- Pricing management
- Special offers and promotions
- Allergen and nutritional information

Reporting Dashboard
- Real-time sales analytics
- Revenue and profit tracking
- Popular product identification
- Staff performance metrics
- Inventory usage and waste analysis
- Customizable date ranges for reports

Inventory Management
- Stock level tracking
- Low stock alerts
- Automated reordering suggestions
- Supplier management
- Inventory usage reports
- Cost analysis tools

Staff Management
- Employee scheduling
- Time tracking
- Performance metrics
- Time-off requests
- Role assignment

Architecture

The application follows a modern client-server architecture:

```
┌─────────────────┐      ┌─────────────────┐      ┌─────────────────┐
│                 │      │                 │      │                 │
│  React Frontend │◄────►│  Express API    │◄────►│  MongoDB        │
│  (SPA)          │      │  Backend        │      │  Database       │
│                 │      │                 │      │                 │
└─────────────────┘      └─────────────────┘      └─────────────────┘
```

- Frontend: React application with Material UI components
- State Management: Context API with custom hooks
- Backend: RESTful API built with Express.js
- Database: MongoDB document storage
- Authentication: JWT token-based auth with role validation
- API Security: Request validation, rate limiting, and sanitization

Technologies Used

Frontend
- React 18 - Modern UI library
- Material UI - Component library with pre-built UI elements
- Context API - State management
- React Router - Navigation and routing
- Chart.js - Data visualization
- Axios - API communication

Backend
- Node.js - JavaScript runtime
- Express - Web framework
- MongoDB - NoSQL database
- Mongoose - ODM for MongoDB
- JWT - Authentication
- bcrypt - Password hashing
- Express Validator - Request validation

Getting Started

Prerequisites
- Node.js (v14+)
- MongoDB (local or Atlas)
- npm or yarn

Installation

1. Clone the repository
```bash
git clone https://github.com/Kostasanasta/restaurant-management-system.git
cd restaurant-management-system
```

2. Install backend dependencies
```bash
cd backend
npm install
```

3. Configure environment variables
Create a `.env` file in the backend directory:
```
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/restaurant-management
# Or use MongoDB Atlas
# MONGODB_URI=mongodb+srv://<username>:<password>@cluster0.mongodb.net/restaurant-management
JWT_SECRET=your-jwt-secret-key
JWT_EXPIRE=1d
```

4. Install frontend dependencies
```bash
cd ../frontend  # or the root directory if no frontend folder
npm install
```

5. Start the development servers

In the backend directory:
```bash
npm run dev
```

In the frontend directory:
```bash
npm start
```

Troubleshooting

MongoDB Connection Issues

If you encounter MongoDB connection errors:

1. Check if MongoDB is running locally
   ```bash
   # On macOS/Linux
   ps aux | grep mongod
   
   # On Windows
   tasklist | findstr mongod
   ```

2. Start MongoDB if it's not running
   ```bash
   # On macOS/Linux
   mongod --dbpath=/data/db
   
   # On Windows
   "C:\Program Files\MongoDB\Server\{version}\bin\mongod.exe"
   ```

3. Using MongoDB Atlas
   - Verify your IP address is whitelisted in the MongoDB Atlas dashboard
   - Check that username and password are correct
   - Ensure the connection string format is correct

4. Development Mode with Mock Database
   If you continue to have issues, the system can be run with a mock database:
   ```
   # In .env file
   USE_MOCK_DB=true
   ```

Port Already in Use (EADDRINUSE)

If you see `Error: listen EADDRINUSE: address already in use :::5000`:

```bash
# Find the process using port 5000
lsof -i :5000   # On macOS/Linux
netstat -ano | findstr :5000   # On Windows

# Kill the process
kill -9 <PID>   # On macOS/Linux
taskkill /F /PID <PID>   # On Windows
```

Demo Accounts

The system comes with pre-configured demo accounts for testing:

| Role    | Email               | Password  | Access Level                                      |
|---------|---------------------|-----------|---------------------------------------------------|
| Admin   | admin@example.com   | admin123  | Full system access                                |
| Manager | manager@example.com | password  | Reports, staff management, operations             |
| Chef    | chef@example.com    | password  | Kitchen display, inventory, menu management       |
| Waiter  | waiter@example.com  | password  | Orders, reservations, customer-facing operations  |

API Documentation

Authentication Endpoints

| Method | Endpoint       | Description           | Access        |
|--------|----------------|-----------------------|---------------|
| POST   | /api/auth/login | User login           | Public        |
| POST   | /api/auth/logout | User logout         | Authenticated |
| GET    | /api/auth/me    | Get current user     | Authenticated |

User Management Endpoints

| Method | Endpoint            | Description              | Access        |
|--------|---------------------|--------------------------|---------------|
| GET    | /api/users          | Get all users            | Admin         |
| GET    | /api/users/:id      | Get user by ID           | Admin         |
| POST   | /api/users          | Create new user          | Admin         |
| PUT    | /api/users/:id      | Update user              | Admin         |
| DELETE | /api/users/:id      | Delete user              | Admin         |

Order Endpoints

| Method | Endpoint              | Description              | Access                 |
|--------|-------------------|--------------------------|------------------------|
| GET    | /api/orders          | Get all orders            | Admin, Manager, Waiter |
| GET    | /api/orders/:id      | Get order by ID           | Admin, Manager, Waiter |
| POST   | /api/orders          | Create new order          | Admin, Manager, Waiter |
| PUT    | /api/orders/:id      | Update order              | Admin, Manager, Waiter |
| PUT    | /api/orders/:id/status | Update order status     | Admin, Manager, Chef   |
| DELETE | /api/orders/:id      | Delete order              | Admin, Manager         |

Menu Endpoints

| Method | Endpoint              | Description              | Access              |
|--------|-------------------|--------------------------|---------------------|
| GET    | /api/menu             | Get all menu items       | All authenticated   |
| GET    | /api/menu/:id         | Get menu item by ID      | All authenticated   |
| POST   | /api/menu             | Create new menu item     | Admin, Manager      |
| PUT    | /api/menu/:id         | Update menu item         | Admin, Manager      |
| DELETE | /api/menu/:id         | Delete menu item         | Admin, Manager      |

Reservation Endpoints

| Method | Endpoint              | Description              | Access              |
|--------|-------------------|--------------------------|---------------------|
| GET    | /api/reservations     | Get all reservations     | Admin, Manager, Waiter |
| GET    | /api/reservations/:id | Get reservation by ID    | Admin, Manager, Waiter |
| POST   | /api/reservations     | Create new reservation   | Admin, Manager, Waiter |
| PUT    | /api/reservations/:id | Update reservation       | Admin, Manager, Waiter |
| DELETE | /api/reservations/:id | Delete reservation       | Admin, Manager, Waiter |

Future Enhancements

- Mobile application for staff
- Customer-facing online ordering
- Integration with payment processors
- Loyalty program management
- Advanced analytics and AI-driven insights
- Multi-language support
- Multi-location support for restaurant chains

Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

License

This project is licensed under the MIT License - see the LICENSE file for details.

Acknowledgements

- [Material UI](https://mui.com/)
- [React](https://reactjs.org/)
- [Express](https://expressjs.com/)
- [MongoDB](https://www.mongodb.com/)
- [JWT](https://jwt.io/) 
