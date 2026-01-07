# Safed Injera Admin Dashboard

Admin dashboard for managing Safed Injera orders, stock, and analytics.

## Features

- **Dashboard Overview**: Visual charts and statistics
- **Stock Management**: CRUD operations for inventory
- **Order Management**: View and update customer orders
- **Analytics & Reports**: Export data in CSV, PDF, Excel formats
- **Authentication**: Secure JWT-based login

## Technology Stack

- React 18 with Vite
- React Admin
- Material-UI
- Chart.js for visualizations
- TypeScript

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn
- Backend API running on port 5000

### Installation

1. Install dependencies:
```bash
npm install
```

2. Start development server:
```bash
npm run dev
```

3. Open http://localhost:5173 in your browser.

## First Time Setup

1. Start the backend server first.
2. Register an admin user via API:
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","email":"admin@safedinjera.com","password":"admin123"}'
```
3. Login with the credentials on the admin dashboard.

## Available Pages

- **Dashboard**: Overview with charts and recent activity
- **Stock**: Manage inventory items
- **Orders**: View and process customer orders
- **Analytics**: Export data in various formats

## License

All rights reserved. Safed Injera © 2024


