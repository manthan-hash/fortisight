async function loadDashboardData() {
    try {
        const alertsRes = await fetch('/api/alerts');
        const alertsData = await alertsRes.json();

        const statsRes = await fetch('/api/dashboard-stats');
        const statsData = await statsRes.json();

        if (!alertsData.success || !statsData.success) {
            console.error('Failed to load surveillance data');
            return;
        }

        const alerts = alertsData.alerts || [];
        const stats = statsData;

        const alertCount = document.getElementById('alertCount');
        if (alertCount) alertCount.textContent = `${alerts.length} alerts`;

        const currentThreatLevel = document.getElementById('currentThreatLevel');
        if (currentThreatLevel) currentThreatLevel.textContent = stats.currentThreatLevel;

        const currentRiskScore = document.getElementById('currentRiskScore');
        if (currentRiskScore) {
            currentRiskScore.innerHTML = `
                <span class="risk-value">${stats.currentRiskScore}</span>
                <div class="risk-bar">
                    <div class="risk-fill" style="width: ${stats.currentRiskScore}%; background: ${
                        stats.currentRiskScore >= 80 ? '#ef4444' :
                        stats.currentRiskScore >= 50 ? '#f59e0b' : '#10b981'
                    };"></div>
                </div>
            `;
        }

        const unknownFacesToday = document.getElementById('unknownFacesToday');
        if (unknownFacesToday) unknownFacesToday.textContent = alerts.length;

        const knownFacesToday = document.getElementById('knownFacesToday');
        if (knownFacesToday) knownFacesToday.textContent = 'System Live';

        const lastEventDescription = document.getElementById('lastEventDescription');
        if (lastEventDescription && alerts.length > 0) {
            lastEventDescription.textContent = `${alerts[0].description} (${alerts[0].riskLevel})`;
        }

        renderAlertsCards(alerts.slice(0, 6));
        renderRecentAlerts(alerts.slice(0, 5));

    } catch (error) {
        console.error('Error loading dashboard data:', error);
    }
}

function renderAlertsCards(alerts) {
    const container = document.getElementById('alertsContainer');
    const noAlertsMessage = document.getElementById('noAlertsMessage');

    if (!container) return;

    if (!alerts.length) {
        if (noAlertsMessage) noAlertsMessage.style.display = 'block';
        container.innerHTML = '';
        return;
    }

    if (noAlertsMessage) noAlertsMessage.style.display = 'none';

    container.innerHTML = alerts.map(alert => `
        <div class="alert-card" style="
            background:#1f2937;
            border-radius:12px;
            padding:16px;
            margin-bottom:16px;
            display:flex;
            gap:16px;
            align-items:center;
        ">
            <img src="${alert.imagePath}" alt="Alert Image" style="
                width:140px;
                height:100px;
                object-fit:cover;
                border-radius:8px;
                border:2px solid ${getRiskColor(alert.riskLevel)};
            " />
            <div style="flex:1;">
                <h4 style="margin:0 0 8px 0; color:${getRiskColor(alert.riskLevel)};">
                    ${alert.type}
                </h4>
                <p style="margin:4px 0;">Distance: ${alert.distance} cm</p>
                <p style="margin:4px 0;">Risk: ${alert.riskLevel} (${alert.riskScore})</p>
                <p style="margin:4px 0;">Location: ${alert.location}</p>
                <p style="margin:4px 0; font-size:12px; color:#9ca3af;">
                    ${new Date(alert.timestamp).toLocaleString()}
                </p>
            </div>
        </div>
    `).join('');
}

function renderRecentAlerts(alerts) {
    const table = document.getElementById('recentAlertsTable');
    if (!table) return;

    table.innerHTML = alerts.map(alert => `
        <div class="table-row" style="
            display:grid;
            grid-template-columns: 1fr 1fr 1fr;
            padding:12px 0;
            border-bottom:1px solid #374151;
        ">
            <div>${new Date(alert.timestamp).toLocaleTimeString()}</div>
            <div>${alert.type}</div>
            <div style="color:${getRiskColor(alert.riskLevel)}; font-weight:bold;">
                ${alert.riskLevel}
            </div>
        </div>
    `).join('');
}

function getRiskColor(level) {
    if (level === 'HIGH') return '#ef4444';
    if (level === 'MEDIUM') return '#f59e0b';
    return '#10b981';
}

function updateVideoTimestamp() {
    const el = document.getElementById('videoTimestamp');
    if (el) {
        el.textContent = new Date().toLocaleString();
    }
}

setInterval(loadDashboardData, 5000);
setInterval(updateVideoTimestamp, 1000);

document.addEventListener('DOMContentLoaded', () => {
    loadDashboardData();
    updateVideoTimestamp();
});
