document.addEventListener('DOMContentLoaded', function() {
  const statusContainer = document.getElementById('cluster-status');
  
  if (!statusContainer) return;
  
  // Function to format status text for display
  function formatStatusText(status) {
    return status
      .replace(/-/g, ' ')  // Replace hyphens with spaces
      .toUpperCase();       // Convert to uppercase
  }
  
  // Determine the correct path based on current location
  function getStatusPath() {
    const base = document.querySelector('base')?.href || location.href;
    return new URL('current.json', base).href;
  }
  
  function createEmailBody(data, lastUpdated) {
    let body = "Current Cluster Status\n";
    body += "=".repeat(50) + "\n\n";
    
    data.services.forEach(service => {
      body += `${service.name}: ${formatStatusText(service.status)}\n`;
    });
    
    if (data.upcoming_maintenance && data.upcoming_maintenance.length > 0) {
      body += "\n" + "=".repeat(50) + "\n";
      body += "Upcoming Maintenance:\n\n";
      data.upcoming_maintenance.forEach(maintenance => {
        body += `Date: ${maintenance.date}\n`;
        body += `Service: ${maintenance.service}\n`;
        body += `Description: ${maintenance.description}\n\n`;
      });
    }
    
    body += "\n" + "=".repeat(50) + "\n";
    body += `Last updated: ${lastUpdated}\n`;
    
    return encodeURIComponent(body);
  }
  
  function sendStatusEmail(data, lastUpdated) {
    const recipient = "hpc-admin@example.ac.uk"; // Change this to your email
    const subject = encodeURIComponent("Cluster Status Update - " + new Date().toLocaleDateString());
    const body = createEmailBody(data, lastUpdated);
    
    window.location.href = `mailto:${recipient}?subject=${subject}&body=${body}`;
  }
  
  fetch(getStatusPath())
    .then(response => {
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      
      // Get the Last-Modified header from the response
      const lastModified = response.headers.get('Last-Modified');
      
      return response.json().then(data => ({
        data: data,
        lastModified: lastModified
      }));
    })
    .then(result => {
      const data = result.data;
      
      // Use Last-Modified header, fallback to current time if not available
      const lastUpdated = result.lastModified 
        ? new Date(result.lastModified).toLocaleString()
        : new Date().toLocaleString();
      
      let html = '<div class="cluster-status">';
      
      data.services.forEach(service => {
        const statusClass = service.status.toLowerCase();
        const statusDisplay = formatStatusText(service.status);
        
        html += `
          <div class="status-item ${statusClass}">
            <span class="status-name">${service.name}</span>
            <span class="status-badge ${statusClass}">${statusDisplay}</span>
          </div>
        `;
      });
      
      html += '</div>';
      
      if (data.upcoming_maintenance && data.upcoming_maintenance.length > 0) {
        html += '<div class="maintenance-notices">';
        html += '<h3>Upcoming Maintenance</h3>';
        
        data.upcoming_maintenance.forEach(maintenance => {
          html += `
            <div class="maintenance-notice">
              <h4>📅 ${maintenance.date}</h4>
              <p><strong>${maintenance.service}</strong></p>
              <p>${maintenance.description}</p>
            </div>
          `;
        });
        
        html += '</div>';
      }
      
      html += `<p class="last-updated">Last updated: ${lastUpdated}</p>`;
      
      // Add email button
      html += `
        <div style="margin-top: 1.5em;">
          <button id="email-status-btn" class="status-email-button">
            📧 Send Status Update
          </button>
        </div>
      `;
      
      statusContainer.innerHTML = html;
      
      // Add click handler for the email button
      document.getElementById('email-status-btn').addEventListener('click', () => {
        sendStatusEmail(data, lastUpdated);
      });
    })
    .catch(error => {
      statusContainer.innerHTML = '<p style="color: #f44336;">Unable to load cluster status. Please try again later.</p>';
      console.error('Error loading status:', error);
    });
});