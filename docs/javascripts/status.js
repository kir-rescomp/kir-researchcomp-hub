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
    const path = window.location.pathname;
    
    // If we're at the root index page
    if (path.endsWith('/') || path.endsWith('/index.html')) {
      return 'status/current.json';
    }
    // If we're in a subdirectory
    else {
      return '../status/current.json';
    }
  }
  
  fetch(getStatusPath())
    .then(response => {
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      return response.json();
    })
    .then(data => {
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
      
      const lastUpdated = new Date(data.last_updated).toLocaleString();
      html += `<p class="last-updated">Last updated: ${lastUpdated}</p>`;
      
      statusContainer.innerHTML = html;
    })
    .catch(error => {
      statusContainer.innerHTML = '<p style="color: #f44336;">Unable to load cluster status. Please try again later.</p>';
      console.error('Error loading status:', error);
    });
});


function createEmailBody(data) {
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
  
  const lastUpdated = new Date(data.last_updated).toLocaleString();
  body += "\n" + "=".repeat(50) + "\n";
  body += `Last updated: ${lastUpdated}\n`;
  
  return encodeURIComponent(body);
}

function sendStatusEmail(data) {
  const recipient = "hpc-admin@example.ac.uk"; // Change this to your email
  const subject = encodeURIComponent("Cluster Status Update - " + new Date().toLocaleDateString());
  const body = createEmailBody(data);
  
  window.location.href = `mailto:${recipient}?subject=${subject}&body=${body}`;
}