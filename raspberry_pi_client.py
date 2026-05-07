#!/usr/bin/env python3
"""
========================================
FORTISIGHT RASPBERRY PI CLIENT
Server IP: http://10.251.42.167:3000
========================================
"""

import requests
import time
import os
from datetime import datetime
import cv2
import numpy as np

# ========================================
# CRITICAL CONFIGURATION
# ========================================
API_URL = "http://10.251.42.167:3000/api/alert"
CAPTURE_INTERVAL = 5  # seconds between captures
IMAGE_PATH = "/tmp/fortisight_capture.jpg"

# ========================================
# CAMERA SETUP
# ========================================
def setup_camera():
    """Initialize camera for surveillance"""
    try:
        # Try different camera indices (0, 1, 2...)
        for camera_index in range(3):
            cap = cv2.VideoCapture(camera_index)
            if cap.isOpened():
                print(f"✅ Camera found at index {camera_index}")
                return cap
            cap.release()
        
        print("❌ No camera found")
        return None
    except Exception as e:
        print(f"❌ Camera setup error: {e}")
        return None

# ========================================
# DISTANCE SIMULATION
# ========================================
def simulate_distance():
    """Simulate proximity sensor reading"""
    # Replace this with actual sensor code
    import random
    return round(random.uniform(0.3, 2.5), 2)

# ========================================
# IMAGE CAPTURE
# ========================================
def capture_image(camera):
    """Capture image from camera"""
    try:
        ret, frame = camera.read()
        if ret:
            # Save image
            cv2.imwrite(IMAGE_PATH, frame)
            print(f"📸 Image captured: {IMAGE_PATH}")
            return True
        else:
            print("❌ Failed to capture image")
            return False
    except Exception as e:
        print(f"❌ Image capture error: {e}")
        return False

# ========================================
# ALERT SENDING
# ========================================
def send_alert(image_path, distance):
    """Send surveillance alert to FortiSight backend"""
    try:
        print(f"📡 Sending alert to {API_URL}")
        print(f"📸 Image: {image_path}")
        print(f"📏 Distance: {distance}m")
        
        # Determine risk level
        risk_level = "HIGH" if distance < 1.0 else "LOW"
        print(f"🚨 Risk Level: {risk_level}")
        
        with open(image_path, 'rb') as image_file:
            files = {'image': image_file}
            data = {
                'distance': distance,
                'timestamp': datetime.now().isoformat()
            }
            
            response = requests.post(
                API_URL, 
                files=files, 
                data=data,
                timeout=30
            )
            
            if response.status_code == 200:
                result = response.json()
                print(f"✅ Alert sent successfully!")
                print(f"🆔 Alert ID: {result.get('alertId', 'UNKNOWN')}")
                print(f"🚨 Server Risk: {result.get('riskLevel', 'UNKNOWN')}")
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
        print(f"❌ Check: {API_URL}")
        return False
    except FileNotFoundError:
        print(f"❌ Error: Image file not found: {image_path}")
        return False
    except Exception as e:
        print(f"❌ Exception: {e}")
        return False

# ========================================
# SYSTEM TESTING
# ========================================
def test_server_connection():
    """Test connection to FortiSight server"""
    try:
        print(f"🔍 Testing connection to {API_URL}")
        
        # Test alerts endpoint
        test_url = API_URL.replace('/api/alert', '/api/alerts')
        response = requests.get(test_url, timeout=10)
        
        if response.status_code == 200:
            print("✅ Server connection successful")
            data = response.json()
            print(f"📊 Server has {data.get('count', 0)} alerts")
            return True
        else:
            print(f"❌ Server returned HTTP {response.status_code}")
            return False
            
    except Exception as e:
        print(f"❌ Connection test failed: {e}")
        return False

# ========================================
# MAIN SURVEILLANCE LOOP
# ========================================
def main():
    print("🚨 FortiSight Raspberry Pi Client Started")
    print(f"🌐 Server: http://10.247.227.167:3000")
    print(f"📸 Camera: Initializing...")
    print(f"⏱️  Interval: {CAPTURE_INTERVAL} seconds")
    print("---")
    
    # Test server connection first
    if not test_server_connection():
        print("❌ Cannot connect to server. Exiting...")
        return
    
    # Setup camera
    camera = setup_camera()
    if not camera:
        print("❌ Camera setup failed. Exiting...")
        return
    
    alert_count = 0
    
    try:
        while True:
            print(f"\n🔄 Alert #{alert_count + 1}")
            
            # Simulate distance detection
            distance = simulate_distance()
            print(f"📏 Simulated distance: {distance}m")
            
            # Capture image
            if capture_image(camera):
                # Send alert
                if send_alert(IMAGE_PATH, distance):
                    alert_count += 1
                    print(f"✅ Alert #{alert_count} processed successfully")
                else:
                    print("❌ Failed to send alert")
            else:
                print("❌ Failed to capture image")
            
            # Wait before next capture
            print(f"⏱️  Waiting {CAPTURE_INTERVAL} seconds...")
            time.sleep(CAPTURE_INTERVAL)
            
    except KeyboardInterrupt:
        print("\n🛑 Shutting down surveillance client...")
        camera.release()
        print(f"📊 Total alerts sent: {alert_count}")
        
    except Exception as e:
        print(f"❌ Unexpected error: {e}")
        if camera:
            camera.release()

# ========================================
# ENTRY POINT
# ========================================
if __name__ == "__main__":
    main()
