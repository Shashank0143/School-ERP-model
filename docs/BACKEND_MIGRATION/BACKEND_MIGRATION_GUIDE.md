# Backend Migration Guide

This guide provides a step-by-step approach for migrating the notice system from localStorage to a production backend.

## Prerequisites

- Node.js 18+ installed
- PostgreSQL 14+ or MySQL 8+ installed
- Redis 6+ for queue management
- Basic knowledge of REST APIs
- Access to cloud hosting (AWS, GCP, or Azure)

## Migration Overview

The migration is divided into 5 phases:
1. **Service Layer Abstraction** - Create API provider wrapper
2. **Backend Implementation** - Build REST API and database
3. **Frontend Integration** - Connect frontend to backend
4. **Testing & Validation** - Ensure data integrity
5. **Production Deployment** - Deploy to production

## Phase 1: Service Layer Abstraction

### Step 1.1: Create API Provider

Create `src/services/apiProvider.js`:

```javascript
/**
 * API Provider
 * Wraps all API calls with error handling and authentication
 */

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3000/api';

class ApiProvider {
  constructor() {
    this.baseURL = API_BASE_URL;
    this.token = localStorage.getItem('authToken');
  }

  setToken(token) {
    this.token = token;
    localStorage.setItem('authToken', token);
  }

  clearToken() {
    this.token = null;
    localStorage.removeItem('authToken');
  }

  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;
    const headers = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }

    const config = {
      ...options,
      headers,
    };

    try {
      const response = await fetch(url, config);
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Request failed');
      }

      return await response.json();
    } catch (error) {
      console.error('API request failed:', error);
      throw error;
    }
  }

  async get(endpoint, params = {}) {
    const queryString = new URLSearchParams(params).toString();
    const url = queryString ? `${endpoint}?${queryString}` : endpoint;
    return this.request(url, { method: 'GET' });
  }

  async post(endpoint, data = {}) {
    return this.request(endpoint, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async put(endpoint, data = {}) {
    return this.request(`${endpoint}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async delete(endpoint) {
    return this.request(endpoint, { method: 'DELETE' });
  }
}

export const apiProvider = new ApiProvider();
```

### Step 1.2: Update Notice Service

Modify `src/services/noticeService.js` to use apiProvider:

```javascript
import { apiProvider } from './apiProvider';

// Keep localStorage as fallback for offline mode
const USE_API = process.env.REACT_APP_USE_API === 'true';

export const getNotices = async (filters = {}) => {
  if (USE_API) {
    return apiProvider.get('/notices', filters);
  }
  // Fallback to localStorage
  const notices = getItem(STORAGE_KEYS.NOTICES, []);
  return notices;
};

export const createNotice = async (noticeData) => {
  if (USE_API) {
    return apiProvider.post('/notices', noticeData);
  }
  // Fallback to localStorage
  const notices = getItem(STORAGE_KEYS.NOTICES, []);
  const newNotice = {
    id: `notice_${Date.now()}`,
    ...noticeData,
    createdAt: new Date().toISOString(),
  };
  const updated = [...notices, newNotice];
  setItem(STORAGE_KEYS.NOTICES, updated);
  return newNotice;
};

export const updateNotice = async (noticeId, updates) => {
  if (USE_API) {
    return apiProvider.put(`/notices/${noticeId}`, updates);
  }
  // Fallback to localStorage
  const notices = getItem(STORAGE_KEYS.NOTICES, []);
  const index = notices.findIndex((n) => n.id === noticeId);
  if (index === -1) throw new Error('Notice not found');
  const updated = [...notices];
  updated[index] = { ...updated[index], ...updates };
  setItem(STORAGE_KEYS.NOTICES, updated);
  return updated[index];
};

export const deleteNotice = async (noticeId) => {
  if (USE_API) {
    return apiProvider.delete(`/notices/${noticeId}`);
  }
  // Fallback to localStorage
  const notices = getItem(STORAGE_KEYS.NOTICES, []);
  const updated = notices.filter((n) => n.id !== noticeId);
  setItem(STORAGE_KEYS.NOTICES, updated);
  return { success: true };
};

export const markNoticeRead = async (noticeId, userId) => {
  if (USE_API) {
    return apiProvider.post(`/notices/${noticeId}/read`, { userId });
  }
  // Fallback to localStorage
  const notices = getItem(STORAGE_KEYS.NOTICES, []);
  const index = notices.findIndex((n) => n.id === noticeId);
  if (index === -1) throw new Error('Notice not found');
  const notice = notices[index];
  const readReceipts = notice.readReceipts || [];
  if (!readReceipts.find((r) => r.userId === userId)) {
    readReceipts.push({ userId, readAt: new Date().toISOString() });
    const updated = [...notices];
    updated[index] = { ...notice, readReceipts };
    setItem(STORAGE_KEYS.NOTICES, updated);
  }
  return { success: true };
};
```

### Step 1.3: Update Other Services

Repeat the same pattern for:
- `noticeActionService.js`
- `noticeScheduler.js` (backend will handle scheduling)
- `noticeOrchestrator.js` (backend will handle orchestration)

### Step 1.4: Test API Provider

```javascript
// Test in development
import { apiProvider } from './services/apiProvider';

// Test authentication
apiProvider.setToken('test-token');

// Test API calls
apiProvider.get('/notices')
  .then(data => console.log('Notices:', data))
  .catch(error => console.error('Error:', error));
```

## Phase 2: Backend Implementation

### Step 2.1: Set Up Backend Project

```bash
# Create backend directory
mkdir school-erp-backend
cd school-erp-backend

# Initialize Node.js project
npm init -y

# Install dependencies
npm install express cors helmet morgan dotenv
npm install pg sequelize
npm install jsonwebtoken bcryptjs
npm install bull redis
npm install nodemon --save-dev
```

### Step 2.2: Create Project Structure

```
school-erp-backend/
├── src/
│   ├── config/
│   │   ├── database.js
│   │   ├── redis.js
│   │   └── index.js
│   ├── models/
│   │   ├── Notice.js
│   │   ├── NoticeTarget.js
│   │   ├── NoticeRead.js
│   │   ├── NoticeAction.js
│   │   └── NoticeDeliveryLog.js
│   ├── controllers/
│   │   ├── noticeController.js
│   │   ├── actionController.js
│   │   └── schedulerController.js
│   ├── routes/
│   │   ├── noticeRoutes.js
│   │   ├── actionRoutes.js
│   │   └── schedulerRoutes.js
│   ├── middleware/
│   │   ├── auth.js
│   │   ├── errorHandler.js
│   │   └── rateLimiter.js
│   ├── services/
│   │   ├── noticeService.js
│   │   ├── actionService.js
│   │   ├── deliveryService.js
│   │   └── schedulerService.js
│   ├── queues/
│   │   └── deliveryQueue.js
│   └── app.js
├── .env
├── .env.example
└── package.json
```

### Step 2.3: Configure Database

Create `src/config/database.js`:

```javascript
const { Sequelize } = require('sequelize');

const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASSWORD,
  {
    host: process.env.DB_HOST,
    port: process.env.DB_PORT || 5432,
    dialect: 'postgres',
    logging: process.env.NODE_ENV === 'development' ? console.log : false,
    pool: {
      max: 20,
      min: 5,
      acquire: 30000,
      idle: 10000,
    },
  }
);

module.exports = sequelize;
```

### Step 2.4: Create Models

Create `src/models/Notice.js`:

```javascript
const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Notice = sequelize.define('Notice', {
  id: {
    type: DataTypes.STRING(50),
    primaryKey: true,
  },
  title: {
    type: DataTypes.STRING(500),
    allowNull: false,
  },
  message: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  category: {
    type: DataTypes.STRING(50),
    allowNull: false,
  },
  priority: {
    type: DataTypes.STRING(20),
    allowNull: false,
  },
  status: {
    type: DataTypes.STRING(20),
    allowNull: false,
    defaultValue: 'draft',
  },
  sourceModule: {
    type: DataTypes.STRING(50),
    allowNull: true,
  },
  requiresAction: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
  actionType: {
    type: DataTypes.STRING(50),
    allowNull: true,
  },
  actionDeadline: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  deliveryChannels: {
    type: DataTypes.JSON,
    allowNull: true,
  },
  metadata: {
    type: DataTypes.JSON,
    allowNull: true,
  },
  createdBy: {
    type: DataTypes.STRING(50),
    allowNull: false,
  },
  publishedAt: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  expiresAt: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  autoArchiveAfter: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
}, {
  tableName: 'notices',
  timestamps: true,
  createdAt: 'createdAt',
  updatedAt: 'updatedAt',
});

module.exports = Notice;
```

### Step 2.5: Create Controllers

Create `src/controllers/noticeController.js`:

```javascript
const Notice = require('../models/Notice');
const { noticeService } = require('../services/noticeService');

exports.getAllNotices = async (req, res) => {
  try {
    const { status, category, priority, userId, unreadOnly, pendingActionOnly } = req.query;
    const notices = await noticeService.getAllNotices({
      status,
      category,
      priority,
      userId,
      unreadOnly,
      pendingActionOnly,
    });
    res.json({ success: true, data: notices });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.getNoticeById = async (req, res) => {
  try {
    const { id } = req.params;
    const notice = await noticeService.getNoticeById(id);
    if (!notice) {
      return res.status(404).json({ success: false, error: 'Notice not found' });
    }
    res.json({ success: true, data: notice });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.createNotice = async (req, res) => {
  try {
    const noticeData = req.body;
    const notice = await noticeService.createNotice(noticeData);
    res.status(201).json({ success: true, data: notice });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.updateNotice = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;
    const notice = await noticeService.updateNotice(id, updates);
    res.json({ success: true, data: notice });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.deleteNotice = async (req, res) => {
  try {
    const { id } = req.params;
    await noticeService.deleteNotice(id);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.markNoticeRead = async (req, res) => {
  try {
    const { id } = req.params;
    const { userId } = req.body;
    await noticeService.markNoticeRead(id, userId);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};
```

### Step 2.6: Create Routes

Create `src/routes/noticeRoutes.js`:

```javascript
const express = require('express');
const router = express.Router();
const noticeController = require('../controllers/noticeController');
const authMiddleware = require('../middleware/auth');

router.get('/', authMiddleware, noticeController.getAllNotices);
router.get('/:id', authMiddleware, noticeController.getNoticeById);
router.post('/', authMiddleware, noticeController.createNotice);
router.put('/:id', authMiddleware, noticeController.updateNotice);
router.delete('/:id', authMiddleware, noticeController.deleteNotice);
router.post('/:id/read', authMiddleware, noticeController.markNoticeRead);

module.exports = router;
```

### Step 2.7: Create Main App

Create `src/app.js`:

```javascript
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const dotenv = require('dotenv');

dotenv.config();

const noticeRoutes = require('./routes/noticeRoutes');
const actionRoutes = require('./routes/actionRoutes');
const schedulerRoutes = require('./routes/schedulerRoutes');
const errorHandler = require('./middleware/errorHandler');

const app = express();

// Middleware
app.use(helmet());
app.use(cors());
app.use(morgan('combined'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/notices', noticeRoutes);
app.use('/api/actions', actionRoutes);
app.use('/api/scheduler', schedulerRoutes);

// Error handling
app.use(errorHandler);

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

module.exports = app;
```

### Step 2.8: Create Environment File

Create `.env.example`:

```env
# Server
PORT=3000
NODE_ENV=development

# Database
DB_HOST=localhost
DB_PORT=5432
DB_NAME=school_erp
DB_USER=postgres
DB_PASSWORD=your_password

# Redis
REDIS_HOST=localhost
REDIS_PORT=6379

# JWT
JWT_SECRET=your_jwt_secret
JWT_EXPIRE=7d

# Email
SENDGRID_API_KEY=your_sendgrid_key
EMAIL_FROM=notices@school-erp.com

# SMS
TWILIO_ACCOUNT_SID=your_twilio_sid
TWILIO_AUTH_TOKEN=your_twilio_token
TWILIO_PHONE_NUMBER=your_twilio_number

# Push
FIREBASE_PROJECT_ID=your_firebase_project_id
FIREBASE_PRIVATE_KEY=your_firebase_private_key
APNS_KEY_ID=your_apns_key_id
APNS_TEAM_ID=your_apns_team_id

# WhatsApp
WHATSAPP_PHONE_NUMBER=your_whatsapp_number
```

### Step 2.9: Initialize Database

```bash
# Create database
createdb school_erp

# Run migrations
npx sequelize-cli init
npx sequelize-cli model:generate --name Notice --attributes title:string,message:text
npx sequelize-cli migration:generate --name create-notices
npx sequelize-cli db:migrate
```

## Phase 3: Frontend Integration

### Step 3.1: Update Environment Variables

Create `.env` in frontend:

```env
REACT_APP_API_URL=http://localhost:3000/api
REACT_APP_USE_API=true
```

### Step 3.2: Test Integration

```bash
# Start backend
cd school-erp-backend
npm start

# Start frontend
cd school-erp-dashboard
npm start
```

### Step 3.3: Verify Data Flow

1. Create a notice via frontend
2. Verify it appears in database
3. Mark notice as read
4. Verify read receipt in database
5. Test action responses
6. Verify action responses in database

## Phase 4: Testing & Validation

### Step 4.1: Unit Tests

```javascript
// tests/noticeService.test.js
const { noticeService } = require('../src/services/noticeService');

describe('Notice Service', () => {
  test('should create notice', async () => {
    const noticeData = {
      title: 'Test Notice',
      message: 'Test message',
      category: 'academic',
      priority: 'info',
    };
    const notice = await noticeService.createNotice(noticeData);
    expect(notice).toHaveProperty('id');
    expect(notice.title).toBe(noticeData.title);
  });

  test('should get notice by id', async () => {
    const notice = await noticeService.getNoticeById('notice-001');
    expect(notice).not.toBeNull();
  });
});
```

### Step 4.2: Integration Tests

```javascript
// tests/api.test.js
const request = require('supertest');
const app = require('../src/app');

describe('API Endpoints', () => {
  test('GET /api/notices should return notices', async () => {
    const response = await request(app)
      .get('/api/notices')
      .set('Authorization', 'Bearer test-token');
    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
  });

  test('POST /api/notices should create notice', async () => {
    const noticeData = {
      title: 'Test Notice',
      message: 'Test message',
      category: 'academic',
      priority: 'info',
    };
    const response = await request(app)
      .post('/api/notices')
      .set('Authorization', 'Bearer test-token')
      .send(noticeData);
    expect(response.status).toBe(201);
    expect(response.body.success).toBe(true);
  });
});
```

### Step 4.3: Data Validation

```javascript
// scripts/validateData.js
const { getNotices } = require('./src/services/noticeService');

async function validateData() {
  const notices = await getNotices();
  
  let errors = [];
  
  notices.forEach(notice => {
    if (!notice.id) errors.push(`Notice missing id`);
    if (!notice.title) errors.push(`Notice missing title`);
    if (!notice.message) errors.push(`Notice missing message`);
    if (!notice.category) errors.push(`Notice missing category`);
    if (!notice.priority) errors.push(`Notice missing priority`);
  });
  
  if (errors.length > 0) {
    console.error('Validation errors:', errors);
    process.exit(1);
  } else {
    console.log('All data validated successfully');
  }
}

validateData();
```

## Phase 5: Production Deployment

### Step 5.1: Backend Deployment

```bash
# Deploy to AWS EC2
# 1. Launch EC2 instance
# 2. Install Node.js, PostgreSQL, Redis
# 3. Clone repository
# 4. Install dependencies
# 5. Set environment variables
# 6. Run migrations
# 7. Start application with PM2

pm2 start src/app.js --name school-erp-backend
pm2 save
pm2 startup
```

### Step 5.2: Database Migration

```bash
# Export localStorage data
node scripts/exportLocalStorage.js

# Transform and import to database
node scripts/importToDatabase.js

# Validate data
node scripts/validateData.js
```

### Step 5.3: Frontend Deployment

```bash
# Build for production
npm run build

# Deploy to Vercel/Netlify
# 1. Connect repository
# 2. Configure environment variables
# 3. Deploy
```

### Step 5.4: Update Production Environment

Update frontend `.env.production`:

```env
REACT_APP_API_URL=https://api.school-erp.com/api
REACT_APP_USE_API=true
```

### Step 5.5: Monitor Deployment

```bash
# Check backend logs
pm2 logs school-erp-backend

# Check database connections
psql -h localhost -U postgres -d school_erp -c "SELECT count(*) FROM notices;"

# Check Redis
redis-cli ping
```

## Rollback Plan

### If Backend Fails

1. Switch frontend to localStorage mode:
   ```env
   REACT_APP_USE_API=false
   ```

2. Restart frontend

3. Investigate backend logs

4. Fix and redeploy

### If Data Migration Fails

1. Keep localStorage as backup

2. Fix migration script

3. Re-run migration

4. Validate data

5. Switch to API mode

## Post-Migration Tasks

1. **Monitor Performance**
   - API response times
   - Database query performance
   - Error rates

2. **Optimize Queries**
   - Add missing indexes
   - Optimize slow queries
   - Implement caching

3. **Set Up Monitoring**
   - Application monitoring (New Relic, Datadog)
   - Error tracking (Sentry)
   - Log aggregation (ELK stack)

4. **Document Procedures**
   - Deployment procedures
   - Backup procedures
   - Emergency procedures

5. **Train Team**
   - Backend architecture
   - API usage
   - Troubleshooting

## Troubleshooting

### Common Issues

**Issue: API requests failing**
- Check API base URL
- Verify authentication token
- Check CORS configuration

**Issue: Database connection errors**
- Verify database credentials
- Check database is running
- Check network connectivity

**Issue: Redis connection errors**
- Verify Redis is running
- Check Redis credentials
- Check network connectivity

**Issue: Data not syncing**
- Check API mode is enabled
- Verify network connectivity
- Check browser console for errors

## Support

For issues during migration:
1. Check logs
2. Review documentation
3. Contact backend team
4. Create GitHub issue

## Phase 6: Asynchronous Workflows & Communication

### 1. Workflow Event Bus Migration
The current workflowEvents.js is a synchronous, in-memory pub-sub bus.
- **Backend Task**: Replace with a robust message broker (e.g., Redis Pub/Sub, RabbitMQ, or Kafka).
- **Frontend Task**: Refactor emitEvent to perform a POST /api/events/emit request.

### 2. Timetable Sub-services
The timetable logic is highly modular (dminTimetableService, alidationService).
- **Backend Task**: Port validation logic to backend to ensure atomicity. Conflict checking must happen server-side before persisting slots.

### 3. Communication Center
- **Backend Task**: Implement queueing system (e.g., BullMQ) for processing mass email/SMS campaigns asynchronously to prevent API timeouts.
