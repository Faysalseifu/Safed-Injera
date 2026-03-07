# Safed Injera Backend API

Backend API for Safed Injera - Stock management, orders, and analytics.

## Features

- **Authentication**: JWT-based admin authentication
- **Stock Management**: CRUD operations for inventory
- **Order Processing**: Receive and manage customer orders
- **Sales Analytics**: Daily/weekly/monthly reports
- **Data Export**: CSV, PDF, and Excel exports
- **Email Notifications**: Order alerts via email

## Technology Stack

- Node.js with Express.js
- TypeScript
- PostgreSQL (via `pg`)
- JWT Authentication
- Nodemailer for emails
- PDFKit, XLSX for exports
- Winston for logging

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn
- PostgreSQL (local or hosted)

### Installation

1. Install dependencies:
```bash
npm install
```

2. Configure environment variables:
```bash
# Copy .env.example to .env and update values
# (On Windows PowerShell)
Copy-Item .env.example .env
```

3. Update `.env` with your PostgreSQL connection string and other settings.

4. Start development server:
```bash
npm run dev
```

5. For production build:
```bash
npm run build
npm start
```

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register admin user
- `POST /api/auth/login` - Login and get JWT token
- `GET /api/auth/me` - Get current user (protected)

### Stock Management (Protected)
- `GET /api/stocks` - List all stock items
- `POST /api/stocks` - Create stock item
- `GET /api/stocks/:id` - Get single stock item
- `PUT /api/stocks/:id` - Update stock item
- `DELETE /api/stocks/:id` - Delete stock item (admin only)

### Orders
- `POST /api/orders` - Create order (public - from frontend)
- `GET /api/orders` - List all orders (protected)
- `GET /api/orders/:id` - Get single order (protected)
- `PUT /api/orders/:id` - Update order (protected)
- `DELETE /api/orders/:id` - Delete order (admin only)

### Analytics (Protected)
- `GET /api/analytics/dashboard` - Dashboard overview
- `GET /api/analytics/sales?period=daily` - Sales analysis
- `GET /api/analytics/export?format=csv&type=orders` - Export data

## Environment Variables

```
DATABASE_URL=postgresql://USER:PASSWORD@HOST:PORT/DATABASE
JWT_SECRET=your-secret-key
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password
PORT=5000
FRONTEND_URL=http://localhost:3001
ADMIN_URL=http://localhost:5173
```

## License

All rights reserved. Safed Injera © 2024


