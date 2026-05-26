# Push Channel Preparation for Backend Migration

This document outlines the preparation and implementation strategy for various push notification channels when migrating to a production backend.

## Supported Delivery Channels

### 1. Portal (In-App Notifications)

**Current Status:** ✅ Fully Implemented
- Implemented via `readReceipts` in notice data model
- Real-time display in notice board components
- Read/unread tracking

**Backend Requirements:**
- WebSocket connection for real-time updates
- Push notification service for in-app alerts
- Notification queue for offline users

**Implementation:**
```javascript
// WebSocket connection for real-time notices
const socket = new WebSocket('wss://api.school-erp.com/notices/stream');

socket.onmessage = (event) => {
  const notice = JSON.parse(event.data);
  // Display in-app notification
  showNotification({
    title: notice.title,
    message: notice.message,
    priority: notice.priority
  });
};
```

**API Endpoints:**
- `GET /api/notices/stream` - WebSocket endpoint for real-time notice stream
- `POST /api/notices/:id/read` - Mark notice as read

### 2. Email

**Current Status:** 🔄 Partially Implemented (delivery channel defined)
- Email included in `deliveryChannels` array
- No actual email sending implementation

**Backend Requirements:**
- SMTP server configuration
- Email template system
- Email queue for bulk sending
- Bounce handling and retry logic
- Email analytics (open rate, click rate)

**Recommended Services:**
- **SendGrid** - Reliable, good API, analytics
- **AWS SES** - Cost-effective, scalable
- **Mailgun** - Good for transactional emails
- **Postmark** - Excellent deliverability

**Implementation:**
```javascript
// Email service integration
const sendgrid = require('@sendgrid/mail');
sendgrid.setApiKey(process.env.SENDGRID_API_KEY);

async function sendEmailNotice(notice, recipient) {
  const msg = {
    to: recipient.email,
    from: 'notices@school-erp.com',
    subject: notice.title,
    html: generateEmailTemplate(notice),
    categories: [notice.category, notice.priority]
  };
  
  await sendgrid.send(msg);
  
  // Log delivery
  await logDelivery(notice.id, 'email', recipient.id, 'sent');
}
```

**Email Template Structure:**
```html
<!DOCTYPE html>
<html>
<head>
  <style>
    /* Responsive email styles */
  </style>
</head>
<body>
  <div class="email-container">
    <div class="header">
      <img src="school-logo.png" alt="School Logo">
    </div>
    <div class="content">
      <h1>{{notice.title}}</h1>
      <p>{{notice.message}}</p>
      {{#if notice.requiresAction}}
      <a href="{{actionUrl}}" class="cta-button">Take Action</a>
      {{/if}}
    </div>
    <div class="footer">
      <p>© 2025 School ERP System</p>
    </div>
  </div>
</body>
</html>
```

**API Endpoints:**
- `POST /api/notices/:id/send-email` - Trigger email delivery
- `GET /api/notices/:id/email-status` - Check email delivery status
- `POST /api/webhooks/email-bounce` - Handle email bounces

### 3. SMS

**Current Status:** 🔄 Partially Implemented (delivery channel defined)
- SMS included in `deliveryChannels` array
- No actual SMS sending implementation

**Backend Requirements:**
- SMS gateway integration
- Phone number validation
- SMS template system (160 char limit)
- Delivery status tracking
- Cost management and rate limiting

**Recommended Services:**
- **Twilio** - Reliable, good API, global coverage
- **AWS SNS** - Cost-effective, scalable
- **MessageBird** - Multi-channel support
- **Plivo** - Competitive pricing

**Implementation:**
```javascript
// SMS service integration
const twilio = require('twilio');
const client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);

async function sendSMSNotice(notice, recipient) {
  const message = generateSMSTemplate(notice);
  
  const sms = await client.messages.create({
    body: message,
    from: process.env.TWILIO_PHONE_NUMBER,
    to: recipient.phone
  });
  
  // Log delivery
  await logDelivery(notice.id, 'sms', recipient.id, 'sent', sms.sid);
  
  return sms;
}

function generateSMSTemplate(notice) {
  // Keep under 160 characters
  return `[${notice.priority.toUpperCase()}] ${notice.title}: ${notice.message.substring(0, 100)}...`;
}
```

**SMS Template Guidelines:**
- Maximum 160 characters per message
- Include priority indicator
- Shorten URLs using bit.ly or similar
- Include action link if required
- Add opt-out instructions

**API Endpoints:**
- `POST /api/notices/:id/send-sms` - Trigger SMS delivery
- `GET /api/notices/:id/sms-status` - Check SMS delivery status
- `POST /api/webhooks/sms-delivery` - Handle SMS delivery receipts

### 4. Push Notifications

**Current Status:** 🔄 Partially Implemented (delivery channel defined)
- Push included in `deliveryChannels` array
- No actual push notification implementation

**Backend Requirements:**
- FCM (Firebase Cloud Messaging) for Android
- APNs (Apple Push Notification Service) for iOS
- Web Push API for browsers
- Device token management
- Push notification queue
- Delivery analytics

**Implementation:**
```javascript
// FCM integration for Android
const admin = require('firebase-admin');
const serviceAccount = require('./firebase-service-account.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

async function sendPushNotice(notice, deviceTokens) {
  const message = {
    notification: {
      title: notice.title,
      body: notice.message.substring(0, 100),
      icon: 'app-icon.png'
    },
    data: {
      noticeId: notice.id,
      category: notice.category,
      priority: notice.priority,
      requiresAction: notice.requiresAction.toString()
    },
    tokens: deviceTokens
  };
  
  const response = await admin.messaging().sendMulticast(message);
  
  // Log delivery
  response.responses.forEach((resp, index) => {
    const status = resp.success ? 'delivered' : 'failed';
    logDelivery(notice.id, 'push', deviceTokens[index], status);
  });
  
  return response;
}
```

**APNs Integration (iOS):**
```javascript
// APNs integration for iOS
const apn = require('apn');

const options = {
  token: {
    key: './apns-key.p8',
    keyId: process.env.APNS_KEY_ID,
    teamId: process.env.APNS_TEAM_ID
  },
  production: process.env.NODE_ENV === 'production'
};

const apnProvider = new apn.Provider(options);

async function sendIOSPushNotice(notice, deviceTokens) {
  const notification = new apn.Notification({
    alert: {
      title: notice.title,
      body: notice.message.substring(0, 100)
    },
    badge: 1,
    sound: 'default',
    payload: {
      noticeId: notice.id,
      category: notice.category
    }
  });
  
  const response = await apnProvider.send(notification, deviceTokens);
  
  // Log delivery
  response.sent.forEach((token) => {
    logDelivery(notice.id, 'push', token, 'delivered');
  });
  
  return response;
}
```

**Web Push Integration:**
```javascript
// Web Push API integration
const webpush = require('web-push');

webpush.setVapidDetails(
  'mailto:admin@school-erp.com',
  process.env.VAPID_PUBLIC_KEY,
  process.env.VAPID_PRIVATE_KEY
);

async function sendWebPushNotice(notice, subscriptions) {
  const payload = JSON.stringify({
    title: notice.title,
    body: notice.message,
    icon: '/icon.png',
    data: {
      noticeId: notice.id,
      url: `/notices/${notice.id}`
    }
  });
  
  const results = await Promise.all(
    subscriptions.map(subscription =>
      webpush.sendNotification(subscription, payload)
        .then(() => logDelivery(notice.id, 'push', subscription.endpoint, 'delivered'))
        .catch(err => logDelivery(notice.id, 'push', subscription.endpoint, 'failed', err.message))
    )
  );
  
  return results;
}
```

**API Endpoints:**
- `POST /api/devices/register` - Register device token
- `DELETE /api/devices/:token` - Unregister device token
- `POST /api/notices/:id/send-push` - Trigger push notification
- `GET /api/notices/:id/push-status` - Check push delivery status

### 5. WhatsApp

**Current Status:** 🔄 Partially Implemented (delivery channel defined)
- WhatsApp included in `deliveryChannels` array
- No actual WhatsApp sending implementation

**Backend Requirements:**
- WhatsApp Business API integration
- Phone number validation
- Message template approval
- Media file handling
- Delivery status tracking
- Rate limiting

**Recommended Services:**
- **Twilio WhatsApp API** - Easy integration, reliable
- **Meta WhatsApp Business API** - Direct integration
- **MessageBird WhatsApp** - Multi-channel support

**Implementation:**
```javascript
// WhatsApp Business API integration
const twilio = require('twilio');
const client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);

async function sendWhatsAppNotice(notice, recipient) {
  const message = await client.messages.create({
    from: 'whatsapp:' + process.env.WHATSAPP_PHONE_NUMBER,
    to: 'whatsapp:' + recipient.phone,
    body: notice.message,
    mediaUrl: notice.metadata?.attachmentUrl
  });
  
  // Log delivery
  await logDelivery(notice.id, 'whatsapp', recipient.id, 'sent', message.sid);
  
  return message;
}
```

**WhatsApp Template Requirements:**
- Templates must be pre-approved by Meta
- Limited to certain message types
- Media files must be hosted
- Rate limits apply (1000 messages/day for free tier)

**API Endpoints:**
- `POST /api/notices/:id/send-whatsapp` - Trigger WhatsApp delivery
- `GET /api/notices/:id/whatsapp-status` - Check WhatsApp delivery status
- `POST /api/webhooks/whatsapp-delivery` - Handle WhatsApp delivery receipts

## Delivery Queue System

### Queue Architecture

```javascript
// Bull queue for delivery jobs
const Queue = require('bull');
const deliveryQueue = new Queue('notice-delivery', {
  redis: {
    host: process.env.REDIS_HOST,
    port: process.env.REDIS_PORT
  }
});

// Add delivery job
deliveryQueue.add({
  noticeId: 'notice-001',
  channel: 'email',
  recipientId: 'user-001'
}, {
  attempts: 3,
  backoff: {
    type: 'exponential',
    delay: 2000
  },
  removeOnComplete: 10,
  removeOnFail: 5
});

// Process delivery jobs
deliveryQueue.process(async (job) => {
  const { noticeId, channel, recipientId } = job.data;
  
  switch (channel) {
    case 'email':
      await sendEmailNotice(noticeId, recipientId);
      break;
    case 'sms':
      await sendSMSNotice(noticeId, recipientId);
      break;
    case 'push':
      await sendPushNotice(noticeId, recipientId);
      break;
    case 'whatsapp':
      await sendWhatsAppNotice(noticeId, recipientId);
      break;
  }
});
```

### Priority Handling

```javascript
// Priority-based queue processing
deliveryQueue.add({
  noticeId: 'urgent-notice',
  channel: 'sms',
  recipientId: 'user-001'
}, {
  priority: 1 // Higher priority = processed first
});

deliveryQueue.add({
  noticeId: 'info-notice',
  channel: 'email',
  recipientId: 'user-002'
}, {
  priority: 5 // Lower priority
});
```

## Channel Selection Logic

### Automatic Channel Selection

```javascript
function selectDeliveryChannels(notice, recipient) {
  const channels = notice.deliveryChannels || ['portal'];
  
  // Add fallback channels based on priority
  if (notice.priority === 'critical' && !channels.includes('sms')) {
    channels.push('sms');
  }
  
  if (notice.priority === 'urgent' && !channels.includes('email')) {
    channels.push('email');
  }
  
  // Filter based on recipient preferences
  const recipientPreferences = getRecipientPreferences(recipient.id);
  return channels.filter(channel => 
    recipientPreferences[channel] !== false
  );
}
```

### Recipient Preferences

```javascript
// Recipient notification preferences table
CREATE TABLE recipient_preferences (
  user_id VARCHAR(50) PRIMARY KEY,
  email_enabled BOOLEAN DEFAULT TRUE,
  sms_enabled BOOLEAN DEFAULT FALSE,
  push_enabled BOOLEAN DEFAULT TRUE,
  whatsapp_enabled BOOLEAN DEFAULT FALSE,
  quiet_hours_start TIME NULL,
  quiet_hours_end TIME NULL,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```

## Delivery Analytics

### Metrics to Track

- **Delivery Rate**: Percentage of messages successfully delivered
- **Open Rate**: Percentage of emails opened (for email channel)
- **Click Rate**: Percentage of links clicked (for email channel)
- **Response Rate**: Percentage of users who took action
- **Channel Performance**: Compare performance across channels
- **Cost per Message**: Track costs per channel

### Analytics Dashboard

```javascript
// Delivery analytics aggregation
async function getDeliveryAnalytics(noticeId) {
  const deliveryLogs = await getNoticeDeliveryLogs(noticeId);
  
  const analytics = {
    total: deliveryLogs.length,
    delivered: deliveryLogs.filter(l => l.status === 'delivered').length,
    failed: deliveryLogs.filter(l => l.status === 'failed').length,
    pending: deliveryLogs.filter(l => l.status === 'pending').length,
    byChannel: {},
    byStatus: {}
  };
  
  // Group by channel
  deliveryLogs.forEach(log => {
    analytics.byChannel[log.delivery_channel] = 
      (analytics.byChannel[log.delivery_channel] || 0) + 1;
  });
  
  // Group by status
  deliveryLogs.forEach(log => {
    analytics.byStatus[log.status] = 
      (analytics.byStatus[log.status] || 0) + 1;
  });
  
  return analytics;
}
```

## Rate Limiting

### Per-Channel Rate Limits

```javascript
const rateLimits = {
  email: {
    limit: 1000, // messages per hour
    window: 3600000 // 1 hour in milliseconds
  },
  sms: {
    limit: 100, // messages per hour
    window: 3600000
  },
  push: {
    limit: 10000, // messages per hour
    window: 3600000
  },
  whatsapp: {
    limit: 1000, // messages per day
    window: 86400000 // 24 hours
  }
};

async function checkRateLimit(channel) {
  const key = `rate_limit:${channel}`;
  const current = await redis.incr(key);
  
  if (current === 1) {
    await redis.expire(key, rateLimits[channel].window / 1000);
  }
  
  return current <= rateLimits[channel].limit;
}
```

## Cost Management

### Cost Tracking

```javascript
const channelCosts = {
  email: 0.001, // $0.001 per email
  sms: 0.05, // $0.05 per SMS
  push: 0.0001, // $0.0001 per push
  whatsapp: 0.02 // $0.02 per message
};

async function calculateDeliveryCost(noticeId) {
  const deliveryLogs = await getNoticeDeliveryLogs(noticeId);
  let totalCost = 0;
  
  deliveryLogs.forEach(log => {
    if (log.status === 'delivered') {
      totalCost += channelCosts[log.delivery_channel] || 0;
    }
  });
  
  return totalCost;
}
```

## Testing Strategy

### Channel Testing

1. **Unit Tests**: Test individual channel functions
2. **Integration Tests**: Test channel integration with queue
3. **End-to-End Tests**: Test full delivery pipeline
4. **Load Tests**: Test performance under high load
5. **Failover Tests**: Test behavior when channels fail

### Test Data

```javascript
// Test notice for all channels
const testNotice = {
  id: 'test-notice-001',
  title: 'Test Notice',
  message: 'This is a test notice for all channels',
  category: 'system',
  priority: 'info',
  deliveryChannels: ['portal', 'email', 'sms', 'push', 'whatsapp'],
  targetAudience: { type: 'SPECIFIC', userIds: ['test-user'] }
};
```

## Monitoring & Alerting

### Key Metrics to Monitor

- Queue depth (number of pending jobs)
- Delivery success rate per channel
- Average delivery time per channel
- Error rates and error types
- API response times
- Cost per channel

### Alert Thresholds

- Alert if delivery success rate < 95%
- Alert if queue depth > 1000
- Alert if error rate > 5%
- Alert if cost exceeds budget

## Migration Timeline

### Phase 1: Portal (Week 1)
- ✅ Already implemented
- Add WebSocket support for real-time updates

### Phase 2: Email (Week 2-3)
- Set up email service provider
- Implement email templates
- Integrate with delivery queue
- Test with test recipients

### Phase 3: SMS (Week 4)
- Set up SMS gateway
- Implement SMS templates
- Integrate with delivery queue
- Test with test recipients

### Phase 4: Push (Week 5-6)
- Set up FCM for Android
- Set up APNs for iOS
- Implement web push
- Integrate with delivery queue
- Test on all platforms

### Phase 5: WhatsApp (Week 7)
- Set up WhatsApp Business API
- Get template approval
- Integrate with delivery queue
- Test with test recipients

### Phase 6: Production (Week 8)
- Deploy all channels to production
- Monitor performance
- Optimize based on analytics
- Document procedures

## Active Communication Center (New Module)
While notices are *passive*, the new **Communication Center** module handles *active* outbound communications (Email/SMS).
- Requires integration with ESPs (Email Service Providers like SendGrid/AWS SES).
- Requires SMS gateway integration (e.g., Twilio, MSG91).
- Delivery statuses should be fed back into the campaign tracking UI via Webhooks.
