async function loadAlertsPage() {
    try {
        const res = await fetch('/api/alerts');
        const data = await res.json();

        if (!data.success) {
            console.error('Failed to load alerts');
            return;
        }

        renderAlertsTable(data.alerts || []);
    } catch (error) {
        console.error('Error loading alerts page:', error);
    }
}

function renderAlertsTable(alerts) {
    const tbody = document.getElementById('alertsTableBody');
    if (!tbody) return;

    if (!alerts.length) {
        tbody.innerHTML = `
            <tr>
                <td colspan="6" style="text-align:center; padding:20px;">
                    No alerts found
                </td>
            </tr>
        `;
        return;
    }

    tbody.innerHTML = alerts.map(alert => `
        <tr onclick='openAlertModal(${JSON.stringify(alert).replace(/'/g, "&apos;")})' style="cursor:pointer;">
            <td>${new Date(alert.timestamp).toLocaleString()}</td>
            <td>${alert.type}</td>
            <td>${alert.location}</td>
            <td style="color:${getRiskColor(alert.riskLevel)}; font-weight:bold;">
                ${alert.riskLevel}
            </td>
            <td>${alert.riskScore}</td>
            <td>${alert.status}</td>
        </tr>
    `).join('');
}

function openAlertModal(alert) {
    document.getElementById('modalTimestamp').textContent = new Date(alert.timestamp).toLocaleString();
    document.getElementById('modalType').textContent = alert.type;
    document.getElementById('modalLocation').textContent = alert.location;
    document.getElementById('modalSeverity').textContent = alert.riskLevel;
    document.querySelector('#modalRiskScore .risk-value').textContent = alert.riskScore;
    document.getElementById('modalRiskFill').style.width = `${alert.riskScore}%`;
    document.getElementById('modalRiskFill').style.background = getRiskColor(alert.riskLevel);
    document.getElementById('modalDescription').textContent = alert.description;
    document.querySelector('#modalFaceInfo .face-status').textContent = 'Unknown Face';
    document.querySelector('#modalFaceInfo .face-confidence').textContent = `Distance: ${alert.distance} cm`;

    document.getElementById('modalThumbnail').innerHTML = `
        <img src="${alert.imagePath}" alt="Alert" style="width:100%; max-width:250px; border-radius:10px;">
    `;

    document.getElementById('modalNotifications').innerHTML = `
        <div class="notification-item"><span class="notification-status">Telegram:</span> <span class="notification-result">Sent</span></div>
        <div class="notification-item"><span class="notification-status">Website:</span> <span class="notification-result">Saved</span></div>
        <div class="notification-item"><span class="notification-status">Buzzer:</span> <span class="notification-result">${alert.riskLevel === 'HIGH' ? 'Triggered' : 'Standby'}</span></div>
    `;

    document.getElementById('alertModal').style.display = 'flex';
}

function closeAlertModal() {
    document.getElementById('alertModal').style.display = 'none';
}

function getRiskColor(level) {
    if (level === 'HIGH') return '#ef4444';
    if (level === 'MEDIUM') return '#f59e0b';
    return '#10b981';
}

document.addEventListener('DOMContentLoaded', loadAlertsPage);
