// Sample data storage (in a real application, this would come from a backend API)
let classesData = [];
let ordersData = [];

// Check authentication before initializing
// function checkAuthentication() {
//     const isAuthenticated = sessionStorage.getItem('adminAuthenticated');
//     if (isAuthenticated !== 'true') {
//         // Redirect to login page
//         window.location.href = 'login.html';
//         return false;
//     }
//     return true;
// }

// Initialize admin dashboard
document.addEventListener('DOMContentLoaded', function() {
    // Check authentication first
    // if (!checkAuthentication()) {
    //     return;
    // }
    
    // Load sample data
    loadSampleData();
    
    // Render tables
    renderClassesTable();
    renderOrdersTable();
    
    // Update statistics
    updateStatistics();
    
    // Setup event listeners
    setupEventListeners();
});

// Load sample data
function loadSampleData() {
    // Sample classes data
    classesData = [
        {
            id: 1,
            name: 'John Doe',
            email: 'john.doe@example.com',
            phone: '+91 98765 43210',
            date: '2024-12-20',
            time: '10:00',
            sessionType: 'Beginner Class',
            artMedium: 'Pencil Sketching',
            duration: '2 Hour Session',
            status: 'confirmed'
        },
        {
            id: 2,
            name: 'Jane Smith',
            email: 'jane.smith@example.com',
            phone: '+91 98765 43211',
            date: '2024-12-21',
            time: '14:00',
            sessionType: 'Intermediate Class',
            artMedium: 'Watercolor',
            duration: '3 Hour Session',
            status: 'pending'
        },
        {
            id: 3,
            name: 'Mike Johnson',
            email: 'mike.j@example.com',
            phone: '+91 98765 43212',
            date: '2024-12-22',
            time: '16:00',
            sessionType: 'Advanced Class',
            artMedium: 'Oil Painting',
            duration: '2 Hour Session',
            status: 'completed'
        }
    ];
    
    // Sample orders data
    ordersData = [
        {
            id: 1,
            name: 'Sarah Williams',
            email: 'sarah.w@example.com',
            phone: '+91 98765 43213',
            artworkType: 'Portrait',
            canvasSize: 'Medium - 16" x 20"',
            artStyle: 'Realistic',
            urgency: 'Standard (2-3 weeks)',
            budget: '₹3,000 - ₹5,000',
            status: 'pending',
            instructions: 'Portrait of family member with warm colors'
        },
        {
            id: 2,
            name: 'David Brown',
            email: 'david.b@example.com',
            phone: '+91 98765 43214',
            artworkType: 'Landscape',
            canvasSize: 'Large - 20" x 24"',
            artStyle: 'Impressionist',
            urgency: 'Rush (1-2 weeks)',
            budget: '₹5,000 - ₹8,000',
            status: 'in-progress',
            instructions: 'Mountain landscape with sunset'
        },
        {
            id: 3,
            name: 'Emily Davis',
            email: 'emily.d@example.com',
            phone: '+91 98765 43215',
            artworkType: 'Abstract',
            canvasSize: 'Small - 12" x 16"',
            artStyle: 'Abstract',
            urgency: 'Standard (2-3 weeks)',
            budget: '₹2,000 - ₹3,000',
            status: 'completed',
            instructions: 'Modern abstract design with vibrant colors'
        }
    ];
    
    // Load from localStorage if available
    const savedClasses = localStorage.getItem('adminClasses');
    const savedOrders = localStorage.getItem('adminOrders');
    
    if (savedClasses) {
        classesData = JSON.parse(savedClasses);
    } else {
        localStorage.setItem('adminClasses', JSON.stringify(classesData));
    }
    
    if (savedOrders) {
        ordersData = JSON.parse(savedOrders);
    } else {
        localStorage.setItem('adminOrders', JSON.stringify(ordersData));
    }
}

// Render classes table
function renderClassesTable(filteredData = null) {
    const tbody = document.getElementById('classesTableBody');
    const emptyState = document.getElementById('classesEmptyState');
    const data = filteredData || classesData;
    
    tbody.innerHTML = '';
    
    if (data.length === 0) {
        tbody.style.display = 'none';
        emptyState.style.display = 'block';
        return;
    }
    
    tbody.style.display = '';
    emptyState.style.display = 'none';
    
    data.forEach(classItem => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>#${classItem.id}</td>
            <td>${classItem.name}</td>
            <td>${classItem.email}</td>
            <td>${classItem.phone}</td>
            <td>${formatDate(classItem.date)}<br><small>${classItem.time}</small></td>
            <td>${classItem.sessionType}</td>
            <td>${classItem.artMedium}</td>
            <td>${classItem.duration}</td>
            <td><span class="status-badge ${classItem.status}">${classItem.status}</span></td>
            <td>
                <div class="action-buttons">
                    <button class="action-btn view" onclick="viewClassDetails(${classItem.id})">
                        <i class="fas fa-eye"></i> View
                    </button>
                    <button class="action-btn edit" onclick="editClass(${classItem.id})">
                        <i class="fas fa-edit"></i> Edit
                    </button>
                    <button class="action-btn delete" onclick="deleteClass(${classItem.id})">
                        <i class="fas fa-trash"></i> Delete
                    </button>
                </div>
            </td>
        `;
        tbody.appendChild(row);
    });
}

// Render orders table
function renderOrdersTable(filteredData = null) {
    const tbody = document.getElementById('ordersTableBody');
    const emptyState = document.getElementById('ordersEmptyState');
    const data = filteredData || ordersData;
    
    tbody.innerHTML = '';
    
    if (data.length === 0) {
        tbody.style.display = 'none';
        emptyState.style.display = 'block';
        return;
    }
    
    tbody.style.display = '';
    emptyState.style.display = 'none';
    
    data.forEach(order => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>#ORD${order.id}</td>
            <td>${order.name}</td>
            <td>${order.email}</td>
            <td>${order.phone}</td>
            <td>${order.artworkType}</td>
            <td>${order.canvasSize}</td>
            <td>${order.artStyle}</td>
            <td>${order.urgency}</td>
            <td>${order.budget}</td>
            <td><span class="status-badge ${order.status}">${order.status}</span></td>
            <td>
                <div class="action-buttons">
                    <button class="action-btn view" onclick="viewOrderDetails(${order.id})">
                        <i class="fas fa-eye"></i> View
                    </button>
                    <button class="action-btn edit" onclick="editOrder(${order.id})">
                        <i class="fas fa-edit"></i> Edit
                    </button>
                    <button class="action-btn delete" onclick="deleteOrder(${order.id})">
                        <i class="fas fa-trash"></i> Delete
                    </button>
                </div>
            </td>
        `;
        tbody.appendChild(row);
    });
}

// Update statistics
function updateStatistics() {
    const totalClasses = classesData.length;
    const totalOrders = ordersData.length;
    const pendingClasses = classesData.filter(c => c.status === 'pending').length;
    const pendingOrders = ordersData.filter(o => o.status === 'pending').length;
    const completedClasses = classesData.filter(c => c.status === 'completed').length;
    const completedOrders = ordersData.filter(o => o.status === 'completed').length;
    
    document.getElementById('totalClasses').textContent = totalClasses;
    document.getElementById('totalOrders').textContent = totalOrders;
    document.getElementById('pendingItems').textContent = pendingClasses + pendingOrders;
    document.getElementById('completedItems').textContent = completedClasses + completedOrders;
}

// Setup event listeners
function setupEventListeners() {
    // Class search
    document.getElementById('classSearch').addEventListener('input', function(e) {
        const searchTerm = e.target.value.toLowerCase();
        const filtered = classesData.filter(classItem => 
            classItem.name.toLowerCase().includes(searchTerm) ||
            classItem.email.toLowerCase().includes(searchTerm) ||
            classItem.phone.includes(searchTerm) ||
            classItem.sessionType.toLowerCase().includes(searchTerm)
        );
        renderClassesTable(filtered);
    });
    
    // Class filter
    document.getElementById('classFilter').addEventListener('change', function(e) {
        const filterValue = e.target.value;
        let filtered = classesData;
        
        if (filterValue !== 'all') {
            filtered = classesData.filter(c => c.status === filterValue);
        }
        
        const searchTerm = document.getElementById('classSearch').value.toLowerCase();
        if (searchTerm) {
            filtered = filtered.filter(classItem => 
                classItem.name.toLowerCase().includes(searchTerm) ||
                classItem.email.toLowerCase().includes(searchTerm) ||
                classItem.phone.includes(searchTerm) ||
                classItem.sessionType.toLowerCase().includes(searchTerm)
            );
        }
        
        renderClassesTable(filtered);
    });
    
    // Order search
    document.getElementById('orderSearch').addEventListener('input', function(e) {
        const searchTerm = e.target.value.toLowerCase();
        const filtered = ordersData.filter(order => 
            order.name.toLowerCase().includes(searchTerm) ||
            order.email.toLowerCase().includes(searchTerm) ||
            order.phone.includes(searchTerm) ||
            order.artworkType.toLowerCase().includes(searchTerm)
        );
        renderOrdersTable(filtered);
    });
    
    // Order filter
    document.getElementById('orderFilter').addEventListener('change', function(e) {
        const filterValue = e.target.value;
        let filtered = ordersData;
        
        if (filterValue !== 'all') {
            filtered = ordersData.filter(o => o.status === filterValue);
        }
        
        const searchTerm = document.getElementById('orderSearch').value.toLowerCase();
        if (searchTerm) {
            filtered = filtered.filter(order => 
                order.name.toLowerCase().includes(searchTerm) ||
                order.email.toLowerCase().includes(searchTerm) ||
                order.phone.includes(searchTerm) ||
                order.artworkType.toLowerCase().includes(searchTerm)
            );
        }
        
        renderOrdersTable(filtered);
    });
}

// View class details
function viewClassDetails(id) {
    const classItem = classesData.find(c => c.id === id);
    if (!classItem) return;
    
    const content = `
        <div class="details-view">
            <div class="detail-item">
                <div class="detail-label">Student Name</div>
                <div class="detail-value">${classItem.name}</div>
            </div>
            <div class="detail-item">
                <div class="detail-label">Email</div>
                <div class="detail-value">${classItem.email}</div>
            </div>
            <div class="detail-item">
                <div class="detail-label">Phone</div>
                <div class="detail-value">${classItem.phone}</div>
            </div>
            <div class="detail-item">
                <div class="detail-label">Date & Time</div>
                <div class="detail-value">${formatDate(classItem.date)} at ${classItem.time}</div>
            </div>
            <div class="detail-item">
                <div class="detail-label">Session Type</div>
                <div class="detail-value">${classItem.sessionType}</div>
            </div>
            <div class="detail-item">
                <div class="detail-label">Art Medium</div>
                <div class="detail-value">${classItem.artMedium}</div>
            </div>
            <div class="detail-item">
                <div class="detail-label">Duration</div>
                <div class="detail-value">${classItem.duration}</div>
            </div>
            <div class="detail-item">
                <div class="detail-label">Status</div>
                <div class="detail-value"><span class="status-badge ${classItem.status}">${classItem.status}</span></div>
            </div>
        </div>
    `;
    
    document.getElementById('viewDetailsContent').innerHTML = content;
    const modal = new bootstrap.Modal(document.getElementById('viewDetailsModal'));
    modal.show();
}

// Edit class
function editClass(id) {
    const classItem = classesData.find(c => c.id === id);
    if (!classItem) return;
    
    document.getElementById('editClassId').value = classItem.id;
    document.getElementById('editClassName').value = classItem.name;
    document.getElementById('editClassEmail').value = classItem.email;
    document.getElementById('editClassPhone').value = classItem.phone;
    document.getElementById('editClassDate').value = classItem.date;
    document.getElementById('editClassTime').value = classItem.time;
    document.getElementById('editClassStatus').value = classItem.status;
    document.getElementById('editClassSessionType').value = classItem.sessionType;
    document.getElementById('editClassArtMedium').value = classItem.artMedium;
    
    const modal = new bootstrap.Modal(document.getElementById('editClassModal'));
    modal.show();
}

// Save class edit
function saveClassEdit() {
    const id = parseInt(document.getElementById('editClassId').value);
    const classItem = classesData.find(c => c.id === id);
    
    if (classItem) {
        classItem.name = document.getElementById('editClassName').value;
        classItem.email = document.getElementById('editClassEmail').value;
        classItem.phone = document.getElementById('editClassPhone').value;
        classItem.date = document.getElementById('editClassDate').value;
        classItem.time = document.getElementById('editClassTime').value;
        classItem.status = document.getElementById('editClassStatus').value;
        
        localStorage.setItem('adminClasses', JSON.stringify(classesData));
        renderClassesTable();
        updateStatistics();
        
        const modal = bootstrap.Modal.getInstance(document.getElementById('editClassModal'));
        modal.hide();
        
        showNotification('Class updated successfully!', 'success');
    }
}

// Delete class
function deleteClass(id) {
    if (confirm('Are you sure you want to delete this class?')) {
        classesData = classesData.filter(c => c.id !== id);
        localStorage.setItem('adminClasses', JSON.stringify(classesData));
        renderClassesTable();
        updateStatistics();
        showNotification('Class deleted successfully!', 'success');
    }
}

// View order details
function viewOrderDetails(id) {
    const order = ordersData.find(o => o.id === id);
    if (!order) return;
    
    const content = `
        <div class="details-view">
            <div class="detail-item">
                <div class="detail-label">Customer Name</div>
                <div class="detail-value">${order.name}</div>
            </div>
            <div class="detail-item">
                <div class="detail-label">Email</div>
                <div class="detail-value">${order.email}</div>
            </div>
            <div class="detail-item">
                <div class="detail-label">Phone</div>
                <div class="detail-value">${order.phone}</div>
            </div>
            <div class="detail-item">
                <div class="detail-label">Artwork Type</div>
                <div class="detail-value">${order.artworkType}</div>
            </div>
            <div class="detail-item">
                <div class="detail-label">Canvas Size</div>
                <div class="detail-value">${order.canvasSize}</div>
            </div>
            <div class="detail-item">
                <div class="detail-label">Art Style</div>
                <div class="detail-value">${order.artStyle}</div>
            </div>
            <div class="detail-item">
                <div class="detail-label">Urgency</div>
                <div class="detail-value">${order.urgency}</div>
            </div>
            <div class="detail-item">
                <div class="detail-label">Budget</div>
                <div class="detail-value">${order.budget}</div>
            </div>
            <div class="detail-item">
                <div class="detail-label">Status</div>
                <div class="detail-value"><span class="status-badge ${order.status}">${order.status}</span></div>
            </div>
            <div class="detail-item">
                <div class="detail-label">Special Instructions</div>
                <div class="detail-value">${order.instructions}</div>
            </div>
        </div>
    `;
    
    document.getElementById('viewDetailsContent').innerHTML = content;
    const modal = new bootstrap.Modal(document.getElementById('viewDetailsModal'));
    modal.show();
}

// Edit order
function editOrder(id) {
    const order = ordersData.find(o => o.id === id);
    if (!order) return;
    
    document.getElementById('editOrderId').value = order.id;
    document.getElementById('editOrderName').value = order.name;
    document.getElementById('editOrderEmail').value = order.email;
    document.getElementById('editOrderPhone').value = order.phone;
    document.getElementById('editOrderStatus').value = order.status;
    document.getElementById('editOrderArtworkType').value = order.artworkType;
    document.getElementById('editOrderCanvasSize').value = order.canvasSize;
    document.getElementById('editOrderInstructions').value = order.instructions;
    
    const modal = new bootstrap.Modal(document.getElementById('editOrderModal'));
    modal.show();
}

// Save order edit
function saveOrderEdit() {
    const id = parseInt(document.getElementById('editOrderId').value);
    const order = ordersData.find(o => o.id === id);
    
    if (order) {
        order.name = document.getElementById('editOrderName').value;
        order.email = document.getElementById('editOrderEmail').value;
        order.phone = document.getElementById('editOrderPhone').value;
        order.status = document.getElementById('editOrderStatus').value;
        
        localStorage.setItem('adminOrders', JSON.stringify(ordersData));
        renderOrdersTable();
        updateStatistics();
        
        const modal = bootstrap.Modal.getInstance(document.getElementById('editOrderModal'));
        modal.hide();
        
        showNotification('Order updated successfully!', 'success');
    }
}

// Delete order
function deleteOrder(id) {
    if (confirm('Are you sure you want to delete this order?')) {
        ordersData = ordersData.filter(o => o.id !== id);
        localStorage.setItem('adminOrders', JSON.stringify(ordersData));
        renderOrdersTable();
        updateStatistics();
        showNotification('Order deleted successfully!', 'success');
    }
}

// Format date
function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
    });
}

// Show notification
function showNotification(message, type = 'info') {
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: ${type === 'success' ? '#27ae60' : '#3498db'};
        color: white;
        padding: 15px 25px;
        border-radius: 10px;
        box-shadow: 0 5px 15px rgba(0,0,0,0.2);
        z-index: 10000;
        animation: slideIn 0.3s ease;
    `;
    notification.textContent = message;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

// Handle logout
function handleLogout() {
    if (confirm('Are you sure you want to logout?')) {
        // Clear authentication
        sessionStorage.removeItem('adminAuthenticated');
        sessionStorage.removeItem('adminLoginTime');
        
        // Redirect to login page
        window.location.href = 'login.html';
    }
}

// Add CSS animations
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from {
            transform: translateX(400px);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    
    @keyframes slideOut {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(400px);
            opacity: 0;
        }
    }
`;
document.head.appendChild(style);

