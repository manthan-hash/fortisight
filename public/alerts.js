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
    const modalTimestamp = document.getElementById('modalTimestamp');
    const modalType = document.getElementById('modalType');
    const modalLocation = document.getElementById('modalLocation');
    const modalSeverity = document.getElementById('modalSeverity');
    const modalRiskScore = document.querySelector('#modalRiskScore .risk-value');
    const modalRiskFill = document.getElementById('modalRiskFill');
    const modalDescription = document.getElementById('modalDescription');
    const modalFaceStatus = document.querySelector('#modalFaceInfo .face-status');
    const modalFaceConfidence = document.querySelector('#modalFaceInfo .face-confidence');
    const modalThumbnail = document.getElementById('modalThumbnail');
    const modalNotifications = document.getElementById('modalNotifications');
    const alertModal = document.getElementById('alertModal');

    if (modalTimestamp) modalTimestamp.textContent = new Date(alert.timestamp).toLocaleString();
    if (modalType) modalType.textContent = alert.type;
    if (modalLocation) modalLocation.textContent = alert.location;
    if (modalSeverity) modalSeverity.textContent = alert.riskLevel;
    if (modalRiskScore) modalRiskScore.textContent = alert.riskScore;
    if (modalRiskFill) {
        modalRiskFill.style.width = `${alert.riskScore}%`;
        modalRiskFill.style.background = getRiskColor(alert.riskLevel);
    }
    if (modalDescription) modalDescription.textContent = alert.description;
    if (modalFaceStatus) modalFaceStatus.textContent = 'Unknown Face';
    if (modalFaceConfidence) modalFaceConfidence.textContent = `Distance: ${alert.distance} cm`;
    if (modalThumbnail) {
        modalThumbnail.innerHTML = `
            <img src="${alert.imagePath}" alt="Alert" style="width:100%; max-width:250px; border-radius:10px;">
        `;
    }
    if (modalNotifications) {
        modalNotifications.innerHTML = `
            <div class="notification-item"><span class="notification-status">Telegram:</span> <span class="notification-result">Sent</span></div>
            <div class="notification-item"><span class="notification-status">Website:</span> <span class="notification-result">Saved</span></div>
            <div class="notification-item"><span class="notification-status">Buzzer:</span> <span class="notification-result">${alert.riskLevel === 'HIGH' ? 'Triggered' : 'Standby'}</span></div>
        `;
    }
    if (alertModal) alertModal.style.display = 'flex';
}

function closeAlertModal() {
    const alertModal = document.getElementById('alertModal');
    if (alertModal) alertModal.style.display = 'none';
}

function getRiskColor(level) {
    if (level === 'HIGH') return '#ef4444';
    if (level === 'MEDIUM') return '#f59e0b';
    return '#10b981';
}

document.addEventListener('DOMContentLoaded', loadAlertsPage);
