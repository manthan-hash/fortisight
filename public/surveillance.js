// ========================================
// FORTISIGHT SURVEILLANCE SYSTEM
// Real-time Alert Management
// ========================================

// ========================================
// CONFIGURATION
// ========================================

// Use relative paths for production deployment
// Works on both local development and production (Render)
const API_BASE = ""; // Empty for relative paths

console.log('🌐 FortiSight Server: Using relative paths for production');

class SurveillanceSystem {
    constructor() {
        this.alerts = [];
        this.refreshInterval = null;
        this.isRefreshing = false;
        this.init();
    }

    // Initialize the surveillance system
    init() {
        console.log('🚨 Initializing FortiSight Surveillance System...');
        console.log(`🌐 API Base URL: ${API_BASE}`);
        
        // Start auto-refresh
        this.startAutoRefresh();
        
        // Initial fetch
        this.fetchAlerts();
        
        console.log('✅ Surveillance system initialized');
    }

    // Start auto-refresh every 3 seconds
    startAutoRefresh() {
        this.refreshInterval = setInterval(() => {
            this.fetchAlerts();
        }, 3000); // 3 seconds
        
        console.log('🔄 Auto-refresh started (every 3 seconds)');
    }

    // Fetch alerts from backend API
    async fetchAlerts() {
        if (this.isRefreshing) {
            console.log('⏳ Already refreshing, skipping...');
            return;
        }

        this.isRefreshing = true;
        this.updateRefreshIndicator('🔄 Fetching alerts...');

        try {
            console.log('📡 Fetching alerts from backend...');
            
            const response = await fetch(`${API_BASE}/api/alerts`);
            const data = await response.json();
            
            if (data.success) {
                this.alerts = data.alerts;
                this.renderAlerts();
                this.updateAlertCount(data.count);
                
                console.log(`✅ Received ${data.count} alerts`);
            } else {
                console.error('❌ Error in API response:', data);
                this.showError('Failed to fetch alerts');
            }
            
        } catch (error) {
            console.error('❌ Error fetching alerts:', error);
            this.showError('Network error - check connection');
        } finally {
            this.isRefreshing = false;
            this.updateRefreshIndicator('🔄 Auto-refreshing...');
        }
    }

    // Render alerts in the dashboard
    renderAlerts() {
        const container = document.getElementById('alertsContainer');
        const noAlertsMessage = document.getElementById('noAlertsMessage');
        
        if (!container) return;

        // Clear existing alerts (except no-alerts message)
        const existingAlerts = container.querySelectorAll('.alert-card');
        existingAlerts.forEach(alert => alert.remove());

        if (this.alerts.length === 0) {
            // Show no alerts message
            if (noAlertsMessage) {
                noAlertsMessage.style.display = 'block';
            }
            return;
        }

        // Hide no alerts message
        if (noAlertsMessage) {
            noAlertsMessage.style.display = 'none';
        }

        // Render each alert
        this.alerts.forEach(alert => {
            const alertCard = this.createAlertCard(alert);
            container.appendChild(alertCard);
        });

        console.log(`📊 Rendered ${this.alerts.length} alert cards`);
    }

    // Create alert card element
    createAlertCard(alert) {
        const card = document.createElement('div');
        card.className = `alert-card ${alert.riskLevel === 'HIGH' ? 'high-risk' : 'low-risk'}`;
        
        const riskBadge = alert.riskLevel === 'HIGH' 
            ? '<span class="risk-badge high">🔴 HIGH RISK</span>'
            : '<span class="risk-badge low">🟢 LOW RISK</span>';

        const formattedTime = new Date(alert.timestamp).toLocaleString();

        card.innerHTML = `
            <div class="alert-header">
                <div class="alert-info">
                    <span class="alert-id">Alert #${alert.id}</span>
                    ${riskBadge}
                </div>
                <div class="alert-time">${formattedTime}</div>
            </div>
            
            <div class="alert-content">
                <div class="alert-image">
                    <img src="${API_BASE}${alert.imagePath}" alt="Surveillance image" 
                         onerror="this.style.display='none'; this.nextElementSibling.style.display='block';">
                    <div class="image-error" style="display: none;">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
                            <circle cx="8.5" cy="8.5" r="1.5"/>
                            <polyline points="21 15 16 10 5 21"/>
                        </svg>
                        <span>Image not available</span>
                    </div>
                </div>
                
                <div class="alert-details">
                    <div class="alert-metric">
                        <span class="metric-label">Distance:</span>
                        <span class="metric-value">${alert.distance}m</span>
                    </div>
                    <div class="alert-metric">
                        <span class="metric-label">Risk Level:</span>
                        <span class="metric-value risk-${alert.riskLevel.toLowerCase()}">${alert.riskLevel}</span>
                    </div>
                </div>
            </div>
        `;

        return card;
    }

    // Update alert count display
    updateAlertCount(count) {
        const countElement = document.getElementById('alertCount');
        if (countElement) {
            countElement.textContent = `${count} alert${count !== 1 ? 's' : ''}`;
        }
    }

    // Update refresh indicator
    updateRefreshIndicator(text) {
        const indicator = document.getElementById('refreshIndicator');
        if (indicator) {
            indicator.textContent = text;
        }
    }

    // Show error message
    showError(message) {
        const container = document.getElementById('alertsContainer');
        if (!container) return;

        const errorDiv = document.createElement('div');
        errorDiv.className = 'error-message';
        errorDiv.innerHTML = `
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="12" cy="12" r="10"/>
                <line x1="12" y1="8" x2="12" y2="12"/>
                <line x1="12" y1="16" x2="12.01" y2="16"/>
            </svg>
            <span>${message}</span>
        `;

        container.appendChild(errorDiv);

        // Remove error message after 5 seconds
        setTimeout(() => {
            if (errorDiv.parentNode) {
                errorDiv.parentNode.removeChild(errorDiv);
            }
        }, 5000);
    }

    // Stop auto-refresh (for cleanup)
    stopAutoRefresh() {
        if (this.refreshInterval) {
            clearInterval(this.refreshInterval);
            this.refreshInterval = null;
            console.log('⏹️ Auto-refresh stopped');
        }
    }
}

// ========================================
// INITIALIZATION
// ========================================

// Wait for DOM to be loaded
document.addEventListener('DOMContentLoaded', function() {
    console.log('📱 DOM loaded, starting surveillance system...');
    
    // Initialize surveillance system
    window.surveillanceSystem = new SurveillanceSystem();
    
    // Cleanup on page unload
    window.addEventListener('beforeunload', function() {
        if (window.surveillanceSystem) {
            window.surveillanceSystem.stopAutoRefresh();
        }
    });
    
    console.log('✅ Surveillance system ready');
});
