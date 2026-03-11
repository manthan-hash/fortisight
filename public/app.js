// FortiSight - Smart Security Monitoring System

// Placeholder Data Structures
const DashboardSummary = {
  systemStatus: 'Operational',
  camerasOnline: '8/12',
  sensorsActive: '24/24',
  currentThreatLevel: 'Medium',
  currentRiskScore: 45,
  knownFacesToday: 12,
  unknownFacesToday: 3,
  lastEventDescription: 'Unknown face detected 2 min ago'
};

const RecentAlerts = [
  {
    id: 1,
    timestamp: '2024-03-09 14:45:32',
    type: 'Face Recognition',
    location: 'Front Entrance',
    severity: 'Medium',
    riskScore: 65,
    status: 'Active'
  },
  {
    id: 2,
    timestamp: '2024-03-09 14:30:15',
    type: 'Motion Detected',
    location: 'Side Gate',
    severity: 'Low',
    riskScore: 25,
    status: 'Acknowledged'
  },
  {
    id: 3,
    timestamp: '2024-03-09 14:15:48',
    type: 'Intrusion Alert',
    location: 'Back Door',
    severity: 'High',
    riskScore: 85,
    status: 'Active'
  },
  {
    id: 4,
    timestamp: '2024-03-09 13:45:22',
    type: 'System Event',
    location: 'Server Room',
    severity: 'Low',
    riskScore: 15,
    status: 'Resolved'
  }
];

const Settings = {
  visionSensitivity: 5,
  sensorSensitivity: 'medium',
  notificationThreshold: 50,
  notifyEmail: true,
  notifySMS: false,
  notifyInApp: true,
  devices: [
    { id: 1, name: 'Front Entrance Camera', status: 'online', type: 'camera' },
    { id: 2, name: 'Side Gate Camera', status: 'online', type: 'camera' },
    { id: 3, name: 'Back Door Camera', status: 'offline', type: 'camera' },
    { id: 4, name: 'Front Door Sensor', status: 'online', type: 'sensor' },
    { id: 5, name: 'Motion Sensor 1', status: 'online', type: 'sensor' },
    { id: 6, name: 'Motion Sensor 2', status: 'online', type: 'sensor' }
  ]
};

// Authentication Functions - DISABLED OLD FUNCTION
// function handleLogin(event) {
//   event.preventDefault();
//   
//   const email = document.getElementById('email').value;
//   const password = document.getElementById('password').value;
//   const errorMessage = document.getElementById('errorMessage');
//   
//   // Basic client-side validation
//   if (!email || !password) {
//     showError('Please fill in all fields');
//     return;
//   }
//   
//   // Simple email pattern validation
//   const emailPattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
//   if (!emailPattern.test(email)) {
//     showError('Please enter a valid email address');
//     return;
//   }
//   
//   // Simulate authentication (replace with real backend call)
//   if (email === 'admin@fortisight.com' && password === 'admin123') {
//     localStorage.setItem('loggedInUser', email);
//     localStorage.setItem('userRole', 'admin');
//     window.location.href = 'dashboard.html';
//   } else {
//     showError('Invalid email or password');
//   }
// }

function showError(message) {
  const errorMessage = document.getElementById('errorMessage');
  errorMessage.textContent = message;
  errorMessage.style.display = 'block';
  
  // Hide error after 5 seconds
  setTimeout(() => {
    errorMessage.style.display = 'none';
  }, 5000);
}

// Check authentication on page load
function checkAuthentication() {
  return true;
}

// Logout function
function logout() {
  localStorage.removeItem('loggedInUser');
  localStorage.removeItem('userRole');
  window.location.href = 'login.html';
}

// Dashboard Functions
function initializeDashboard() {
  if (!checkAuthentication()) return;
  
  // Update status cards
  updateStatusCards();
  
  // Update monitoring panel
  updateMonitoringPanel();
  
  // Update widgets
  updateWidgets();
  
  // Update recent alerts table
  updateRecentAlertsTable();
}

function updateStatusCards() {
  document.getElementById('systemStatus').textContent = DashboardSummary.systemStatus;
  document.getElementById('camerasOnline').textContent = DashboardSummary.camerasOnline;
  document.getElementById('sensorsActive').textContent = DashboardSummary.sensorsActive;
  document.getElementById('currentThreatLevel').textContent = DashboardSummary.currentThreatLevel;
  
  // Update threat level color
  const threatElement = document.getElementById('currentThreatLevel');
  threatElement.className = 'status-value';
  if (DashboardSummary.currentThreatLevel === 'Low') {
    threatElement.classList.add('threat-low');
  } else if (DashboardSummary.currentThreatLevel === 'Medium') {
    threatElement.classList.add('threat-medium');
  } else if (DashboardSummary.currentThreatLevel === 'High') {
    threatElement.classList.add('threat-high');
  }
}

function updateMonitoringPanel() {
  document.getElementById('monitoring-location').textContent = 'Front Entrance';
  document.getElementById('lastEventDescription').textContent = DashboardSummary.lastEventDescription;
  
  // Update timestamp
  const now = new Date();
  const timestamp = now.toISOString().slice(0, 19).replace('T', ' ');
  document.getElementById('videoTimestamp').textContent = timestamp;
}

function updateWidgets() {
  document.getElementById('knownFacesToday').textContent = DashboardSummary.knownFacesToday;
  document.getElementById('unknownFacesToday').textContent = DashboardSummary.unknownFacesToday;
  
  // Update risk score
  const riskScore = DashboardSummary.currentRiskScore;
  document.querySelector('.risk-value').textContent = riskScore;
  
  // Update risk bar
  const riskFill = document.querySelector('.risk-fill');
  riskFill.style.width = `${riskScore}%`;
  
  // Update risk bar color
  if (riskScore <= 30) {
    riskFill.style.background = '#10b981';
  } else if (riskScore <= 70) {
    riskFill.style.background = '#f59e0b';
  } else {
    riskFill.style.background = '#ff3b30';
  }
}

function updateRecentAlertsTable() {
  const tableBody = document.getElementById('recentAlertsTable');
  const recentAlerts = RecentAlerts.slice(0, 5); // Show only 5 most recent
  
  tableBody.innerHTML = recentAlerts.map(alert => `
    <div class="alert-row" onclick="showAlertDetails(${alert.id})">
      <div>${alert.timestamp}</div>
      <div>${alert.type}</div>
      <div><span class="severity-badge severity-${alert.severity.toLowerCase()}">${alert.severity}</span></div>
    </div>
  `).join('');
}

// Alerts Page Functions
function initializeAlerts() {
  if (!checkAuthentication()) return;
  
  populateAlertsTable();
  setupFilters();
}

function populateAlertsTable() {
  const tableBody = document.getElementById('alertsTableBody');
  
  tableBody.innerHTML = RecentAlerts.map(alert => `
    <tr onclick="showAlertDetails(${alert.id})">
      <td>${alert.timestamp}</td>
      <td>${alert.type}</td>
      <td>${alert.location}</td>
      <td><span class="severity-badge severity-${alert.severity.toLowerCase()}">${alert.severity}</span></td>
      <td>${alert.riskScore}</td>
      <td>${alert.status}</td>
    </tr>
  `).join('');
}

function setupFilters() {
  const severityFilter = document.getElementById('severityFilter');
  const typeFilter = document.getElementById('typeFilter');
  const timeFilter = document.getElementById('timeFilter');
  
  severityFilter.addEventListener('change', filterAlerts);
  typeFilter.addEventListener('change', filterAlerts);
  timeFilter.addEventListener('change', filterAlerts);
}

function filterAlerts() {
  const severity = document.getElementById('severityFilter').value;
  const type = document.getElementById('typeFilter').value;
  const time = document.getElementById('timeFilter').value;
  
  // Filter logic (placeholder for real backend integration)
  console.log('Filtering alerts:', { severity, type, time });
}

// Alert Details Modal
let currentAlertId = null;

function showAlertDetails(alertId) {
  currentAlertId = alertId;
  const alert = RecentAlerts.find(a => a.id === alertId);
  if (!alert) return;
  
  // Populate modal
  document.getElementById('modalTimestamp').textContent = alert.timestamp;
  document.getElementById('modalType').textContent = alert.type;
  document.getElementById('modalLocation').textContent = alert.location;
  document.getElementById('modalSeverity').textContent = alert.severity;
  document.getElementById('modalDescription').textContent = getAlertDescription(alert);
  document.getElementById('modalRiskScore').textContent = alert.riskScore;
  
  // Update risk bar in modal
  const modalRiskFill = document.getElementById('modalRiskFill');
  modalRiskFill.style.width = `${alert.riskScore}%`;
  if (alert.riskScore <= 30) {
    modalRiskFill.style.background = '#10b981';
  } else if (alert.riskScore <= 70) {
    modalRiskFill.style.background = '#f59e0b';
  } else {
    modalRiskFill.style.background = '#ff3b30';
  }
  
  // Update face recognition info
  updateFaceRecognitionInfo(alert);
  
  // Update notification history
  updateNotificationHistory(alert);
  
  // Show modal
  document.getElementById('alertModal').classList.add('active');
}

function getAlertDescription(alert) {
  const descriptions = {
    'Face Recognition': `${alert.severity} confidence face detected at ${alert.location}. Unknown individual - requires verification.`,
    'Motion Detected': `Motion detected in ${alert.location} area. No authorized personnel present.`,
    'Intrusion Alert': `Unauthorized entry attempt detected at ${alert.location}. Immediate response required.`,
    'System Event': `System ${alert.type.toLowerCase()} event in ${alert.location}. Status: ${alert.status}.`
  };
  
  return descriptions[alert.type] || 'Unknown alert type';
}

function updateFaceRecognitionInfo(alert) {
  const faceInfo = document.getElementById('modalFaceInfo');
  
  if (alert.type === 'Face Recognition') {
    faceInfo.innerHTML = `
      <p class="face-status">Unknown Face</p>
      <p class="face-confidence">Confidence: ${Math.floor(Math.random() * 30 + 60)}%</p>
    `;
  } else {
    faceInfo.innerHTML = `
      <p class="face-status">N/A</p>
      <p class="face-confidence">Not applicable</p>
    `;
  }
}

function updateNotificationHistory(alert) {
  const notificationHistory = document.getElementById('modalNotifications');
  
  // Simulate notification status
  const emailStatus = Math.random() > 0.5 ? 'Sent' : 'Pending';
  const smsStatus = Math.random() > 0.7 ? 'Sent' : 'Disabled';
  const appStatus = Math.random() > 0.3 ? 'Delivered' : 'Pending';
  
  notificationHistory.innerHTML = `
    <div class="notification-item">
      <span class="notification-status">Email:</span>
      <span class="notification-result">${emailStatus}</span>
    </div>
    <div class="notification-item">
      <span class="notification-status">SMS:</span>
      <span class="notification-result">${smsStatus}</span>
    </div>
    <div class="notification-item">
      <span class="notification-status">In-App:</span>
      <span class="notification-result">${appStatus}</span>
    </div>
  `;
}

function closeAlertModal() {
  document.getElementById('alertModal').classList.remove('active');
  currentAlertId = null;
}

function acknowledgeAlert() {
  if (currentAlertId) {
    const alert = RecentAlerts.find(a => a.id === currentAlertId);
    if (alert) {
      alert.status = 'Acknowledged';
      populateAlertsTable();
      updateNotificationHistory(alert);
    }
  }
}

function markAsResolved() {
  if (currentAlertId) {
    const alert = RecentAlerts.find(a => a.id === currentAlertId);
    if (alert) {
      alert.status = 'Resolved';
      populateAlertsTable();
      closeAlertModal();
    }
  }
}

// Settings Page Functions
function initializeSettings() {
  if (!checkAuthentication()) return;
  
  populateSettings();
  setupSettingsControls();
}

function populateSettings() {
  // Vision sensitivity
  const visionSlider = document.getElementById('visionSensitivity');
  const visionValue = document.getElementById('visionValue');
  visionSlider.value = Settings.visionSensitivity;
  visionValue.textContent = Settings.visionSensitivity;
  
  visionSlider.addEventListener('input', (e) => {
    visionValue.textContent = e.target.value;
  });
  
  // Sensor sensitivity
  document.getElementById('sensorSensitivity').value = Settings.sensorSensitivity;
  
  // Notification threshold
  document.getElementById('notificationThreshold').value = Settings.notificationThreshold;
  
  // Notification toggles
  document.getElementById('notifyEmail').checked = Settings.notifyEmail;
  document.getElementById('notifySMS').checked = Settings.notifySMS;
  document.getElementById('notifyInApp').checked = Settings.notifyInApp;
  
  // Populate devices list
  populateDevicesList();
}

function setupSettingsControls() {
  const visionSlider = document.getElementById('visionSensitivity');
  visionSlider.addEventListener('input', (e) => {
    document.getElementById('visionValue').textContent = e.target.value;
  });
}

function populateDevicesList() {
  const devicesList = document.getElementById('devicesList');
  
  devicesList.innerHTML = Settings.devices.map(device => `
    <div class="device-item">
      <div class="device-info">
        <span class="device-name">${device.name}</span>
        <span class="device-status ${device.status}">${device.status}</span>
      </div>
      <label class="toggle-label">
        <input type="checkbox" ${device.status === 'online' ? 'checked' : ''} 
               onchange="toggleDevice(${device.id})">
        <span class="toggle-slider"></span>
      </label>
    </div>
  `).join('');
}

function toggleDevice(deviceId) {
  const device = Settings.devices.find(d => d.id === deviceId);
  if (device) {
    device.status = device.status === 'online' ? 'offline' : 'online';
    populateDevicesList();
  }
}

function saveSettings() {
  // Collect current settings
  const visionSensitivity = document.getElementById('visionSensitivity').value;
  const sensorSensitivity = document.getElementById('sensorSensitivity').value;
  const notificationThreshold = document.getElementById('notificationThreshold').value;
  const notifyEmail = document.getElementById('notifyEmail').checked;
  const notifySMS = document.getElementById('notifySMS').checked;
  const notifyInApp = document.getElementById('notifyInApp').checked;
  
  // Update settings object
  Settings.visionSensitivity = parseInt(visionSensitivity);
  Settings.sensorSensitivity = sensorSensitivity;
  Settings.notificationThreshold = parseInt(notificationThreshold);
  Settings.notifyEmail = notifyEmail;
  Settings.notifySMS = notifySMS;
  Settings.notifyInApp = notifyInApp;
  
  // Show save confirmation
  const saveStatus = document.getElementById('saveStatus');
  saveStatus.classList.add('show');
  
  // Hide confirmation after 3 seconds
  setTimeout(() => {
    saveStatus.classList.remove('show');
  }, 3000);
  
  console.log('Settings saved:', Settings);
}

// Initialize pages based on current URL
document.addEventListener('DOMContentLoaded', () => {
  const currentPage = window.location.pathname;
  
  if (currentPage.includes('login.html')) {
    // Login page is handled by handleLogin function
  } else if (currentPage.includes('dashboard.html')) {
    initializeDashboard();
  } else if (currentPage.includes('alerts.html')) {
    initializeAlerts();
  } else if (currentPage.includes('settings.html')) {
    initializeSettings();
  }
});

// Tab navigation support
document.addEventListener('keydown', (e) => {
  if (e.key === 'Enter') {
    const loginForm = document.getElementById('loginForm');
    if (loginForm && document.activeElement === loginForm.querySelector('input[type="password"]')) {
      e.preventDefault();
      handleLogin(e);
    }
  }
});
