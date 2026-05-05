# 🚨 FortiSight Surveillance System - Complete Setup Guide

## 📋 **System Overview**

FortiSight is a real-time surveillance system that receives alerts from Raspberry Pi devices and displays them in a live dashboard. The system captures motion and proximity data with images and provides instant visual feedback.

---

## 🏗️ **Architecture**

```
🍓 Raspberry Pi → 📡 Backend Server → 🖥️ Dashboard
     │                    │                    │
  Camera +         Node.js + Express     Real-time UI
  Proximity         PostgreSQL +          with Auto-refresh
  Sensor            Multer Uploads        Risk Assessment
```

---

## 🚀 **Quick Start**

### **1. Install Dependencies**
```bash
npm install
```

### **2. Start Server**
```bash
npm start
```

### **3. Access Dashboard**
```
Local:   http://localhost:3000/public/dashboard.html
Network: http://YOUR_IP:3000/public/dashboard.html
```

---

## 📡 **API Endpoints**

### **POST /api/alert**
**Purpose:** Receive alerts from Raspberry Pi
**Method:** `multipart/form-data`

**Request:**
```bash
curl -X POST http://localhost:3000/api/alert \
  -F "image=@capture.jpg" \
  -F "distance=0.8" \
  -F "timestamp=2024-03-12T14:30:00Z"
```

**Response:**
```json
{
  "success": true,
  "message": "Alert received and stored successfully",
  "alertId": 1,
  "riskLevel": "HIGH"
}
```

### **GET /api/alerts**
**Purpose:** Return all alerts for dashboard
**Method:** `GET`

**Response:**
```json
{
  "success": true,
  "count": 3,
  "alerts": [
    {
      "id": 1,
      "imagePath": "/uploads/alert_1710241800000.jpg",
      "distance": 0.8,
      "timestamp": "2024-03-12T14:30:00Z",
      "riskLevel": "HIGH"
    }
  ]
}
```

---

## 🍓 **Raspberry Pi Integration**

### **Python Example**
```python
import requests
import time
from datetime import datetime

# Configuration
BACKEND_URL = "http://YOUR_SERVER_IP:3000/api/alert"

def send_alert(image_path, distance):
    """Send alert to backend server"""
    try:
        with open(image_path, 'rb') as image_file:
            files = {'image': image_file}
            data = {
                'distance': distance,
                'timestamp': datetime.now().isoformat()
            }
            
            response = requests.post(
                BACKEND_URL, 
                files=files, 
                data=data,
                timeout=30
            )
            
            if response.status_code == 200:
                print("✅ Alert sent successfully")
                return True
            else:
                print(f"❌ Error: {response.status_code}")
                return False
                
    except Exception as e:
        print(f"❌ Exception: {e}")
        return False

# Example usage
if __name__ == "__main__":
    # Simulate motion detection
    image_path = "capture.jpg"
    distance = 0.5  # meters
    
    if send_alert(image_path, distance):
        print("🚨 Alert sent to FortiSight!")
    else:
        print("❌ Failed to send alert")
```

---

## 🎯 **Risk Assessment**

### **Automatic Risk Classification**
```javascript
// Backend logic
const riskLevel = distance < 1 ? 'HIGH' : 'LOW';

// Distance thresholds:
// < 1.0 meter  → HIGH RISK (🔴)
// ≥ 1.0 meter  → LOW RISK  (🟢)
```

### **Visual Indicators**
- **🔴 HIGH RISK**: Red border, red badge, urgent display
- **🟢 LOW RISK**: Green border, green badge, normal display

---

## 📁 **File Structure**

```
fortisight/
├── server.js              # Main backend server
├── package.json            # Dependencies and scripts
├── uploads/                # Stored alert images
│   ├── alert_1710241800000.jpg
│   └── alert_1710241801000.jpg
├── public/                 # Frontend files
│   ├── dashboard.html      # Main dashboard
│   ├── surveillance.js     # Real-time alert system
│   ├── styles-new.css     # Styling
│   ├── auth.js            # Authentication
│   └── app.js             # Dashboard functions
└── SURVEILLANCE-SETUP.md  # This guide
```

---

## 🔧 **Configuration**

### **Environment Variables**
```bash
# Server Configuration
PORT=3000
NODE_ENV=development

# Database (PostgreSQL)
DATABASE_URL=postgresql://localhost:5432/fortisight

# Session Security
SESSION_SECRET=your-secret-key-here
```

### **Server Startup**
```javascript
// Binds to all network interfaces for Raspberry Pi access
app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Server running on port ${PORT}`);
    console.log(`🌐 Network: http://0.0.0.0:${PORT}`);
});
```

---

## 📱 **Dashboard Features**

### **Real-Time Updates**
- ✅ Auto-refresh every 3 seconds
- ✅ Live alert count
- ✅ Visual refresh indicator
- ✅ Error handling with retry

### **Alert Display**
- ✅ Captured images
- ✅ Distance measurements
- ✅ Timestamp information
- ✅ Risk level badges
- ✅ Responsive grid layout

### **Risk Highlighting**
- ✅ High-risk alerts (red theme)
- ✅ Low-risk alerts (green theme)
- ✅ Hover effects and animations
- ✅ Mobile-responsive design

---

## 🚨 **Alert Processing Flow**

```
1. Raspberry Pi detects motion
   ↓
2. Captures image + measures distance
   ↓
3. Sends POST /api/alert with data
   ↓
4. Backend validates and stores
   ↓
5. Calculates risk level
   ↓
6. Saves image to /uploads/
   ↓
7. Adds to alerts array
   ↓
8. Dashboard auto-refreshes
   ↓
9. Displays new alert instantly
```

---

## 🔍 **Monitoring & Logging**

### **Server Console Output**
```
🚨 ALERT RECEIVED FROM RASPBERRY PI
✅ Alert stored: ID=1, Distance=0.8m, Risk=HIGH
📸 Image saved: /uploads/alert_1710241800000.jpg
⏰ Timestamp: 2024-03-12T14:30:00Z
📊 Total alerts: 1
---
📋 Dashboard requested 1 alerts
✅ Received 1 alerts
```

### **Browser Console**
```
🚨 Initializing FortiSight Surveillance System...
📡 Fetching alerts from backend...
✅ Received 1 alerts
📊 Rendered 1 alert cards
🔄 Auto-refresh started (every 3 seconds)
```

---

## 🛠️ **Troubleshooting**

### **Common Issues**

**❌ "Cannot connect to server"**
- Check server is running: `npm start`
- Verify IP address in Raspberry Pi code
- Ensure same network (WiFi/LAN)

**❌ "Image upload failed"**
- Check file size (< 5MB)
- Verify image format (JPG/PNG)
- Check /uploads folder permissions

**❌ "No alerts showing"**
- Check browser console for errors
- Verify API endpoint: `GET /api/alerts`
- Check network tab for failed requests

### **Debug Mode**
```javascript
// Enable detailed logging
console.log('📡 Fetching alerts from backend...');
console.log(`✅ Received ${data.count} alerts`);
console.log(`📊 Rendered ${this.alerts.length} alert cards`);
```

---

## 🔒 **Security Considerations**

### **Current Setup**
- ✅ CORS enabled (all origins)
- ✅ File type validation (images only)
- ✅ File size limit (5MB)
- ✅ Session-based authentication

### **Production Recommendations**
- 🔒 Restrict CORS to specific domains
- 🔒 Add API rate limiting
- 🔒 Implement user authentication for alerts
- 🔒 Add HTTPS/SSL certificates
- 🔒 Set up firewall rules

---

## 🚀 **Deployment**

### **Local Development**
```bash
npm install
npm start
# Visit: http://localhost:3000/public/dashboard.html
```

### **Network Access**
```bash
# Find your IP
ipconfig  # Windows
ifconfig   # Linux/Mac

# Update Raspberry Pi code
BACKEND_URL = "http://YOUR_IP:3000/api/alert"
```

### **Cloud Deployment**
```bash
# Deploy to Render/Vercel
# Set DATABASE_URL environment variable
# Configure CORS for your domain
```

---

## 📊 **Performance Metrics**

### **System Limits**
- ✅ Max file size: 5MB per image
- ✅ Max alerts stored: 100 (in memory)
- ✅ Refresh interval: 3 seconds
- ✅ Concurrent users: Unlimited (memory-based)

### **Optimization Tips**
- 🚀 Use CDN for image serving
- 🚀 Implement database persistence
- 🚀 Add image compression
- 🚀 Use WebSocket for real-time updates

---

## 🎯 **Next Steps**

### **Enhancements**
- 📱 Mobile app notifications
- 🗄️ Database persistence
- 📊 Analytics and reporting
- 🔔 Email/SMS alerts
- 🤖 AI object detection
- 📹 Video streaming

### **Integration**
- 📹 Multiple camera support
- 🌐 Remote monitoring
- 🔐 User management
- 📈 Historical data
- 🎛️ Configuration dashboard

---

## ✅ **System Status Checklist**

- [ ] Server running on port 3000
- [ ] Dashboard accessible via browser
- [ ] Raspberry Pi can connect to server
- [ ] Image uploads working
- [ ] Alerts displaying in real-time
- [ ] Risk assessment functioning
- [ ] Auto-refresh working
- [ ] Mobile responsive design

**🎉 Your FortiSight surveillance system is now fully operational!**

---

## 📞 **Support**

For issues and questions:
1. Check server console logs
2. Verify network connectivity
3. Review browser console errors
4. Test API endpoints manually

**🛡️ FortiSight - Protecting what matters most!**
