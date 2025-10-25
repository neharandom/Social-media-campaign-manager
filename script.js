// Global variables
let campaigns = [];
let currentUser = null;
let editingCampaignId = null;

// DOM Elements
const loginSection = document.getElementById('loginSection');
const dashboardSection = document.getElementById('dashboardSection');
const loginForm = document.getElementById('loginForm');
const campaignForm = document.getElementById('campaignForm');
const logoutBtn = document.getElementById('logoutBtn');
const welcomeUser = document.getElementById('welcomeUser');
const campaignList = document.getElementById('campaignList');
const filterStatus = document.getElementById('filterStatus');

// Initialize app
document.addEventListener('DOMContentLoaded', function() {
    checkLoginStatus();
    loadCampaigns();
    setupEventListeners();
});

// Check if user is logged in
function checkLoginStatus() {
    const loggedInUser = localStorage.getItem('currentUser');
    if (loggedInUser) {
        currentUser = loggedInUser;
        showDashboard();
    } else {
        showLogin();
    }
}

// Setup event listeners
function setupEventListeners() {
    loginForm.addEventListener('submit', handleLogin);
    campaignForm.addEventListener('submit', handleCampaignSubmit);
    logoutBtn.addEventListener('click', handleLogout);
    filterStatus.addEventListener('change', displayCampaigns);
}

// Handle login
function handleLogin(e) {
    e.preventDefault();
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;

    if (username && password) {
        currentUser = username;
        localStorage.setItem('currentUser', username);
        showDashboard();
        loginForm.reset();
    }
}

// Handle logout
function handleLogout() {
    if (confirm('Are you sure you want to logout?')) {
        currentUser = null;
        localStorage.removeItem('currentUser');
        showLogin();
    }
}

// Show login screen
function showLogin() {
    loginSection.classList.remove('hidden');
    dashboardSection.classList.add('hidden');
}

// Show dashboard
function showDashboard() {
    loginSection.classList.add('hidden');
    dashboardSection.classList.remove('hidden');
    welcomeUser.textContent = `Welcome, ${currentUser}!`;
    displayCampaigns();
    updateStatistics();
}

// Load campaigns from storage
function loadCampaigns() {
    const storedCampaigns = localStorage.getItem('campaigns');
    if (storedCampaigns) {
        campaigns = JSON.parse(storedCampaigns);
    }
}

// Save campaigns to storage
function saveCampaigns() {
    localStorage.setItem('campaigns', JSON.stringify(campaigns));
}

// Handle campaign form submission
function handleCampaignSubmit(e) {
    e.preventDefault();

    const campaign = {
        id: editingCampaignId || Date.now(),
        name: document.getElementById('campaignName').value,
        platform: document.getElementById('platform').value,
        startDate: document.getElementById('startDate').value,
        endDate: document.getElementById('endDate').value,
        budget: parseFloat(document.getElementById('budget').value),
        status: document.getElementById('status').value,
        description: document.getElementById('description').value,
        createdBy: currentUser,
        createdAt: editingCampaignId ? campaigns.find(c => c.id === editingCampaignId).createdAt : new Date().toISOString()
    };

    if (editingCampaignId) {
        // Update existing campaign
        const index = campaigns.findIndex(c => c.id === editingCampaignId);
        campaigns[index] = campaign;
        editingCampaignId = null;
    } else {
        // Add new campaign
        campaigns.push(campaign);
    }

    saveCampaigns();
    campaignForm.reset();
    displayCampaigns();
    updateStatistics();

    // Show success message
    alert('Campaign saved successfully!');
}

// Display campaigns
function displayCampaigns() {
    const filterValue = filterStatus.value;
    let filteredCampaigns = campaigns;

    if (filterValue !== 'All') {
        filteredCampaigns = campaigns.filter(c => c.status === filterValue);
    }

    if (filteredCampaigns.length === 0) {
        campaignList.innerHTML = '<p class="empty-message">No campaigns found.</p>';
        return;
    }

    campaignList.innerHTML = filteredCampaigns.map(campaign => `
        <div class="campaign-card">
            <div class="campaign-header">
                <div>
                    <div class="campaign-title">${campaign.name}</div>
                    <span class="campaign-platform">${campaign.platform}</span>
                </div>
                <span class="campaign-status status-${campaign.status}">${campaign.status}</span>
            </div>
            
            <div class="campaign-details">
                <div class="detail-item">
                    <span class="detail-label">Start Date:</span>
                    ${formatDate(campaign.startDate)}
                </div>
                <div class="detail-item">
                    <span class="detail-label">End Date:</span>
                    ${formatDate(campaign.endDate)}
                </div>
                <div class="detail-item">
                    <span class="detail-label">Budget:</span>
                    $${campaign.budget.toLocaleString()}
                </div>
                <div class="detail-item">
                    <span class="detail-label">Created By:</span>
                    ${campaign.createdBy}
                </div>
            </div>

            ${campaign.description ? `
                <div class="campaign-description">
                    <span class="detail-label">Description:</span><br>
                    ${campaign.description}
                </div>
            ` : ''}

            <div class="campaign-actions">
                <button class="btn btn-edit" onclick="editCampaign(${campaign.id})">Edit</button>
                <button class="btn btn-delete" onclick="deleteCampaign(${campaign.id})">Delete</button>
            </div>
        </div>
    `).join('');
}

// Edit campaign
function editCampaign(id) {
    const campaign = campaigns.find(c => c.id === id);
    if (campaign) {
        editingCampaignId = id;
        document.getElementById('campaignName').value = campaign.name;
        document.getElementById('platform').value = campaign.platform;
        document.getElementById('startDate').value = campaign.startDate;
        document.getElementById('endDate').value = campaign.endDate;
        document.getElementById('budget').value = campaign.budget;
        document.getElementById('status').value = campaign.status;
        document.getElementById('description').value = campaign.description || '';
        
        // Scroll to form
        document.querySelector('.section').scrollIntoView({ behavior: 'smooth' });
    }
}

// Delete campaign
function deleteCampaign(id) {
    if (confirm('Are you sure you want to delete this campaign?')) {
        campaigns = campaigns.filter(c => c.id !== id);
        saveCampaigns();
        displayCampaigns();
        updateStatistics();
    }
}

// Update statistics
function updateStatistics() {
    const total = campaigns.length;
    const active = campaigns.filter(c => c.status === 'Active').length;
    const completed = campaigns.filter(c => c.status === 'Completed').length;
    const totalBudget = campaigns.reduce((sum, c) => sum + c.budget, 0);

    document.getElementById('totalCampaigns').textContent = total;
    document.getElementById('activeCampaigns').textContent = active;
    document.getElementById('completedCampaigns').textContent = completed;
    document.getElementById('totalBudget').textContent = `$${totalBudget.toLocaleString()}`;
}

// Format date
function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'short', 
        day: 'numeric' 
    });
}

// Set minimum dates for date inputs
document.addEventListener('DOMContentLoaded', function() {
    const today = new Date().toISOString().split('T')[0];
    document.getElementById('startDate').setAttribute('min', today);
    document.getElementById('endDate').setAttribute('min', today);
    
    // Update end date minimum when start date changes
    document.getElementById('startDate').addEventListener('change', function() {
        document.getElementById('endDate').setAttribute('min', this.value);
    });
});

