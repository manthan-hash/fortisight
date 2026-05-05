# 🛡️ FortiSight Network Configuration Guide

## 🚨 **CRITICAL NETWORKING FIXES APPLIED**

### ✅ **1. Server Configuration - FIXED**
```javascript
const PORT = process.env.PORT || 3000;

app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Server running on port ${PORT}`);
    console.log(`🌐 Network access: http://0.0.0.0:${PORT}`);
});
```
**✅ Status**: Server binds to all network interfaces for external access

---

### ✅ **2. Uploads Static Serving - FIXED**
```javascript
// Images accessible via: http://<server-ip>:3000/uploads/<filename>
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
```
**✅ Status**: Uploads folder served statically for cross-device access

---

### ✅ **3. API Endpoints - VERIFIED**

#### POST /api/alert
```javascript
// Accepts: multipart/form-data
// Fields: image (file), distance (number), timestamp (optional)
// Stores: { id, imagePath, distance, risk, timestamp }
// Returns: JSON success response
```

#### GET /api/alerts
```javascript
// Returns: { success: true, count: N, alerts: [...] }
// Sorted: newest first
// Risk: distance < 1m = "HIGH", else "LOW"
```

---

### ✅ **4. CORS - ENABLED**
```javascript
const cors = require('cors');
app.use(cors()); // Allows all origins
```
**✅ Status**: Cross-origin requests enabled for frontend access

---

### ✅ **5. Frontend API Calls - FIXED**

#### Before (Relative Paths - BROKEN):
```javascript
fetch('/api/alerts') // ❌ Only works on same domain
```

#### After (Full URLs - WORKING):
```javascript
const API_BASE = "http://localhost:3000"; // <-- CONFIGURABLE

fetch(`${API_BASE}/api/alerts`) // ✅ Works cross-device
```

**✅ Status**: Frontend now uses configurable full API URLs

---

## 🔧 **NETWORK SETUP INSTRUCTIONS**

### **Step 1: Find Your Server IP**
```bash
# Windows
ipconfig

# Linux/Mac
ifconfig
# or
hostname -I
```

### **Step 2: Update Frontend Configuration**
```javascript
// In surveillance.js, change this line:
const API_BASE = "http://YOUR_SERVER_IP:3000";

// Examples:
const API_BASE = "http://192.168.1.100:3000";  // Local network
const API_BASE = "http://10.0.0.15:3000";     // Different network
const API_BASE = "http://YOUR_PUBLIC_IP:3000"; // Internet access
```

### **Step 3: Update Raspberry Pi Code**
```python
# Update the backend URL in your Python script
BACKEND_URL = "http://YOUR_SERVER_IP:3000/api/alert"

# Example:
BACKEND_URL = "http://192.168.1.100:3000/api/alert"
```

---

## 🌐 **ACCESS URLs**

### **Once Server is Running:**
```
Dashboard:     http://YOUR_IP:3000/public/dashboard.html
API Endpoint:  http://YOUR_IP:3000/api/alert
Alerts API:   http://YOUR_IP:3000/api/alerts
Images:        http://YOUR_IP:3000/uploads/<filename>
```

### **Local Development:**
```
Dashboard:     http://localhost:3000/public/dashboard.html
API Endpoint:  http://localhost:3000/api/alert
Alerts API:   http://localhost:3000/api/alerts
Images:        http://localhost:3000/uploads/<filename>
```

---

## 🍓 **RASPBERRY PI INTEGRATION**

### **Complete Python Script:**
```python
import requests
import time
from datetime import datetime
import os

# ========================================
# CONFIGURATION - UPDATE THIS
# ========================================
BACKEND_URL = "http://YOUR_SERVER_IP:3000/api/alert"  # <-- CHANGE THIS
IMAGE_PATH = "/path/to/camera/capture.jpg"       # <-- CHANGE THIS

def send_alert(image_path, distance):
    """Send surveillance alert to FortiSight backend"""
    try:
        with open(image_path, 'rb') as image_file:
            files = {'image': image_file}
            data = {
                'distance': distance,
                'timestamp': datetime.now().isoformat()
            }
            
            print(f"📡 Sending alert to {BACKEND_URL}")
            print(f"📸 Image: {image_path}")
            print(f"📏 Distance: {distance}m")
            
            response = requests.post(
                BACKEND_URL, 
                files=files, 
                data=data,
                timeout=30
            )
            
            if response.status_code == 200:
                result = response.json()
                print(f"✅ Alert sent successfully!")
                print(f"🚨 Risk Level: {result.get('riskLevel', 'UNKNOWN')}")
                print(f"🆔 Alert ID: {result.get('alertId', 'UNKNOWN')}")
                return True
            else:
                print(f"❌ Error: HTTP {response.status_code}")
                print(f"❌ Response: {response.text}")
                return False
                
    except requests.exceptions.Timeout:
        print("❌ Error: Request timeout (30s)")
        return False
    except requests.exceptions.ConnectionError:
        print("❌ Error: Cannot connect to server")
        print(f"❌ Check: {BACKEND_URL}")
        return False
    except Exception as e:
        print(f"❌ Exception: {e}")
        return False

# ========================================
# MAIN SURVEILLANCE LOOP
# ========================================
def main():
    print("🚨 FortiSight Raspberry Pi Client Started")
    print(f"🌐 Server: {BACKEND_URL}")
    
    while True:
        try:
            # Simulate motion detection
            # Replace this with your actual motion detection code
            distance = 0.5  # Simulated distance in meters
            
            if send_alert(IMAGE_PATH, distance):
                print("✅ Alert processed successfully")
            else:
                print("❌ Failed to send alert")
                
            # Wait before next detection
            time.sleep(5)  # 5 seconds between alerts
            
        except KeyboardInterrupt:
            print("\n🛑 Shutting down surveillance client...")
            break
        except Exception as e:
            print(f"❌ Unexpected error: {e}")
            time.sleep(10)  # Wait before retry

if __name__ == "__main__":
    main()
```

---

## 🔍 **TESTING CONNECTIVITY**

### **1. Test Server Access:**
```bash
# From Raspberry Pi
curl -I http://YOUR_SERVER_IP:3000

# Should return: HTTP/1.1 200 OK
```

### **2. Test API Endpoint:**
```bash
# Test alert endpoint
curl -X POST http://YOUR_SERVER_IP:3000/api/alert \
  -F "image=@test.jpg" \
  -F "distance=0.8"

# Should return: {"success": true, "alertId": 1, ...}
```

### **3. Test Dashboard Access:**
```bash
# From any device on same network
curl http://YOUR_SERVER_IP:3000/public/dashboard.html
```

---

## 🚨 **TROUBLESHOOTING NETWORK ISSUES**

### **❌ "Cannot Connect to Server"**
**Causes:**
- Wrong IP address
- Server not running
- Firewall blocking port 3000
- Different network segments

**Solutions:**
1. Verify server: `npm start`
2. Check IP: `ipconfig` or `ifconfig`
3. Test connectivity: `ping YOUR_SERVER_IP`
4. Check firewall: Allow port 3000
5. Try same network: Ensure devices on same WiFi

### **❌ "Images Not Loading"**
**Causes:**
- Wrong API_BASE in surveillance.js
- Uploads folder permissions
- CORS issues

**Solutions:**
1. Update API_BASE: `const API_BASE = "http://YOUR_IP:3000"`
2. Check uploads folder: `ls -la uploads/`
3. Verify CORS: Check browser console for CORS errors

### **❌ "CORS Error"**
**Causes:**
- Missing CORS middleware
- Wrong protocol (http vs https)
- Port mismatch

**Solutions:**
1. Verify CORS: `app.use(cors())` in server.js
2. Check protocol: Use http for local, https for production
3. Match ports: API_BASE port must match server port

---

## ✅ **VERIFICATION CHECKLIST**

### **Server Setup:**
- [ ] Server starts with `npm start`
- [ ] Binds to `0.0.0.0:3000`
- [ ] CORS middleware enabled
- [ ] Uploads folder served statically
- [ ] Console shows network access URL

### **Network Access:**
- [ ] Can access server from other devices
- [ ] API endpoint responds to POST requests
- [ ] Images accessible via URL
- [ ] Dashboard loads from external devices

### **Raspberry Pi Integration:**
- [ ] Python script updated with correct IP
- [ ] Can send alerts to backend
- [ ] Images upload successfully
- [ ] Receives success response

### **Frontend Configuration:**
- [ ] API_BASE set to correct server IP
- [ ] Dashboard fetches alerts successfully
- [ ] Images display correctly
- [ ] Auto-refresh working

---

## 🎯 **FINAL WORKING SYSTEM**

### **Data Flow:**
```
🍓 Raspberry Pi Camera
     ↓ (detects motion)
📏 Proximity Sensor
     ↓ (measures distance)
📡 Python Script
     ↓ (sends POST /api/alert)
🖥️ Node.js Backend
     ↓ (stores image + data)
📁 Uploads Folder
     ↓ (serves images)
🖥️ Dashboard
     ↓ (fetches /api/alerts)
👤 User
     ↓ (views live alerts)
```

### **Access Points:**
- **Raspberry Pi**: `http://YOUR_IP:3000/api/alert`
- **Dashboard**: `http://YOUR_IP:3000/public/dashboard.html`
- **Images**: `http://YOUR_IP:3000/uploads/<filename>`

---

## 🚀 **QUICK DEPLOY COMMANDS**

```bash
# 1. Start server
npm start

# 2. Note the network access URL from console
# Example: 🌐 Network access: http://192.168.1.100:3000

# 3. Update surveillance.js
const API_BASE = "http://192.168.1.100:3000";

# 4. Update Raspberry Pi script
BACKEND_URL = "http://192.168.1.100:3000/api/alert";

# 5. Test from Raspberry Pi
python raspberry_pi_client.py
```

---

## ✅ **SYSTEM STATUS: FULLY NETWORKED**

🎉 **All critical networking fixes have been applied:**

- ✅ Server binds to all interfaces (`0.0.0.0`)
- ✅ CORS enabled for cross-origin requests
- ✅ Uploads folder served statically
- ✅ Frontend uses configurable API URLs
- ✅ Proper image URL generation
- ✅ Complete Raspberry Pi integration code
- ✅ Comprehensive troubleshooting guide

**🛡️ Your FortiSight system is now fully networked and ready for cross-device surveillance!**
