# Timber Mart CRM

> Offline-first business management system for timber/lumber businesses

A comprehensive CRM system with offline capabilities, featuring customer management, order tracking, project management, payment processing, check tracking, and custom print templates with QR code generation.

## 🚀 Quick Start

### Prerequisites
- Node.js 16+ and npm
- PostgreSQL 12+
- Git

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd timber-mart-crm
   ```

2. **Set up environment files**
   ```bash
   # Backend
   cp backend/.env.example backend/.env
   # Edit backend/.env with your database credentials

   # Frontend
   cp frontend/.env.example frontend/.env
   # Edit frontend/.env if needed (default: http://localhost:5001)
   ```

3. **Install dependencies**
   ```bash
   # Backend
   cd backend
   npm install

   # Frontend
   cd ../frontend
   npm install
   ```

4. **Set up database**
   ```bash
   # Create PostgreSQL database
   createdb timber_mart_dev

   # Database will be auto-seeded on first run
   ```

5. **Start development servers**
   ```bash
   # From project root
   ./start-dev.sh

   # Or start individually:
   # Backend: cd backend && npm run dev
   # Frontend: cd frontend && npm run dev
   ```

6. **Access the application**
   - Frontend: http://localhost:5173
   - Backend API: http://localhost:5001
   - Default login: `admin` / `admin123`

## 📚 Documentation

- **[CLAUDE.md](./CLAUDE.md)** - Complete development guide, architecture, and commands
- **[README.md](./README.md)** - This file - Quick start and overview

## 🏗️ Architecture

### Backend (Express.js + PostgreSQL)
- RESTful API with JWT authentication
- Role-based access control (RBAC)
- Rate limiting and input validation
- Sequelize ORM for database operations
- Winston logging

### Frontend (React + Vite)
- Material UI (MUI) components
- Offline-first with IndexedDB
- Background sync when online
- React Context for state management

## 🔑 Key Features

- **Offline-First**: Works without internet, syncs when online
- **Customer Management**: CRUD operations with balance tracking
- **Order Management**: Create orders with items, track status
- **Project Management**: Link orders to projects, track progress
- **Payment Processing**: Handle loans, advances, deposits
- **Check Tracking**: Track check status (pending/cleared/bounced)
- **Token System**: Generate delivery tokens with QR codes
- **Print Templates**: Custom HTML/CSS templates for printing
- **User Management**: Role-based permissions and activity logging
- **Reports**: Dashboard with key metrics and analytics

## 🛠️ Development Commands

```bash
# Backend
npm run dev              # Start with auto-reload
npm start                # Production mode
npm test                 # Run tests
npm run migrate          # Run migrations
npm run seed             # Seed database

# Frontend
npm run dev              # Start dev server
npm run build            # Production build
npm run preview          # Preview build

# Full Stack (from root)
./start-dev.sh           # Start both servers
./start.sh               # Production start
./stop.sh                # Stop services
./status.sh              # Check status
```

## 🔒 Security Features

- ✅ JWT authentication with configurable expiry
- ✅ Rate limiting (auth, API, sync endpoints)
- ✅ Input validation with express-validator
- ✅ Role-based access control
- ✅ Password hashing with bcrypt
- ✅ SQL injection protection via ORM
- ✅ CORS configuration
- ✅ Request logging

## 🧪 Testing

```bash
# Backend tests
cd backend
npm test

# Test rate limiting
curl -X POST http://localhost:5001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"test","password":"test"}'
```

## 📦 Technology Stack

### Backend
- Express.js - Web framework
- PostgreSQL - Database
- Sequelize - ORM
- JWT - Authentication
- Winston - Logging
- express-rate-limit - Rate limiting
- express-validator - Input validation

### Frontend
- React 18 - UI framework
- Vite - Build tool
- Material UI (MUI v7) - Component library
- React Router - Routing
- IndexedDB - Offline storage

## 📁 Project Structure

```
timber-mart-crm/
├── backend/
│   ├── config/          # Database, env, logger configs
│   ├── middleware/      # Auth, validation, rate limiting
│   ├── models/          # Sequelize models
│   ├── routes/          # API endpoints
│   ├── services/        # Business logic
│   ├── utils/           # Utilities
│   └── server.js        # Entry point
├── frontend/
│   ├── src/
│   │   ├── components/  # React components
│   │   ├── context/     # Context providers
│   │   ├── hooks/       # Custom hooks
│   │   ├── pages/       # Page components
│   │   ├── services/    # API & DB services
│   │   └── theme/       # MUI theme
│   └── public/
├── CLAUDE.md            # Development guide
└── README.md            # This file
```

## 🤝 Contributing

1. Read [CLAUDE.md](./CLAUDE.md) for development guidelines
2. Create a feature branch
3. Make your changes
4. Add validation and tests
5. Submit a pull request

## 📝 License

MIT License - See LICENSE file for details

## 🐛 Known Issues

- Migration files don't exist (using Sequelize sync)
- Some pages still use legacy CSS instead of MUI
- No automated E2E tests yet
- Sync conflict resolution is basic (last-write-wins)

See [CLAUDE.md](./CLAUDE.md) for complete list and workarounds.

## 💡 Support

For issues and questions:
1. Check [CLAUDE.md](./CLAUDE.md) for common solutions
2. Check existing issues in the repository
3. Review the codebase documentation in source files

## 🎯 Roadmap

- [x] Implement JWT refresh tokens ✅
- [x] Add rate limiting and input validation ✅
- [x] Migrate to Material UI components ✅
- [ ] Complete database migration system (currently using Sequelize sync)
- [ ] Add E2E tests (unit tests implemented)
- [ ] Implement advanced sync conflict resolution
- [ ] Add email notifications
- [ ] Mobile app version
- [ ] Fix customer balance display (show Credit/Debit)

---

**Built with ❤️ for Timber Mart**
# Timber-Mart
