// Mess data array - will be populated by user uploads and stored in MongoDB
let messData = [];

// API base URL
const API_BASE_URL = window.location.origin;

// Load data from API
async function loadMessData() {
    try {
        const response = await fetch(`${API_BASE_URL}/api/messes`);
        if (response.ok) {
            messData = await response.json();
        } else {
            console.error('Error loading mess data:', response.statusText);
            messData = [];
        }
    } catch (error) {
        console.error('Error loading mess data:', error);
        messData = [];
    }
}

// DOM Elements
const navBtns = document.querySelectorAll('.nav-btn');
const viewSections = document.querySelectorAll('.view-section');
const searchInput = document.getElementById('search-input');
const filterBtns = document.querySelectorAll('.filter-btn');
const messGrid = document.getElementById('mess-grid');
const menuForm = document.getElementById('menu-form');
const modal = document.getElementById('menu-modal');
const modalContent = document.getElementById('modal-content');
const closeModal = document.querySelector('.close');

// Tab Switching
navBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        const targetTab = btn.getAttribute('data-tab');
        
        // Update active nav button
        navBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        
        // Update active view section
        viewSections.forEach(section => {
            section.classList.remove('active');
            if (section.id === `${targetTab}-view`) {
                section.classList.add('active');
            }
        });
        
        // Load data for student view
        if (targetTab === 'student') {
            displayMessCards(messData);
        }
    });
});

// Search Functionality
searchInput.addEventListener('input', (e) => {
    const searchTerm = e.target.value.toLowerCase();
    const filteredData = messData.filter(mess => 
        mess.name.toLowerCase().includes(searchTerm) ||
        mess.location.toLowerCase().includes(searchTerm) ||
        mess.menuText.toLowerCase().includes(searchTerm)
    );
    displayMessCards(filteredData);
});

// Filter Functionality
filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        const filterType = btn.getAttribute('data-filter');
        
        // Update active filter button
        filterBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        
        // Filter data
        let filteredData = messData;
        if (filterType !== 'all') {
            filteredData = messData.filter(mess => mess.menuType === filterType);
        }
        
        displayMessCards(filteredData);
    });
});

// Display Mess Cards
function displayMessCards(data) {
    messGrid.innerHTML = '';
    
    if (data.length === 0) {
        messGrid.innerHTML = `
            <div class="no-results">
                <i class="fas fa-search"></i>
                <h3>No messes found</h3>
                <p>Try adjusting your search or filter criteria</p>
            </div>
        `;
        return;
    }
    
    data.forEach(mess => {
        const card = createMessCard(mess);
        messGrid.appendChild(card);
    });
}

// Create Mess Card
function createMessCard(mess) {
    const card = document.createElement('div');
    card.className = 'mess-card fade-in';
    
    const menuTypeHtml = mess.menuType ? `<div class="menu-type ${mess.menuType}">
        ${getMenuTypeLabel(mess.menuType)}
    </div>` : '';
    
    const priceHtml = mess.price ? `<div class="price">
        <i class="fas fa-rupee-sign"></i>
        ${mess.price}
    </div>` : '';
    
    card.innerHTML = `
        <h3>${mess.name}</h3>
        <div class="location">
            <i class="fas fa-map-marker-alt"></i>
            ${mess.location}
        </div>
        <div class="menu-preview">
            ${mess.menuText}
        </div>
        ${menuTypeHtml}
        ${priceHtml}
        <button class="view-details-btn" onclick="showMenuDetails(${mess.id})">
            <i class="fas fa-eye"></i>
            View Details
        </button>
    `;
    return card;
}

// Get Menu Type Label
function getMenuTypeLabel(type) {
    const labels = {
        'veg': 'Veg Only',
        'non-veg': 'Non-Veg Available',
        'budget': 'Budget Friendly'
    };
    return labels[type] || type;
}

// Show Menu Details Modal
function showMenuDetails(messId) {
    const mess = messData.find(m => m.id === messId);
    if (!mess) return;
    
    const priceInfo = mess.price ? `<p><i class="fas fa-tag"></i> <strong>Price:</strong> ${mess.price}</p>` : '';
    const menuTypeInfo = mess.menuType ? `<p><i class="fas fa-utensils"></i> <strong>Menu Type:</strong> ${getMenuTypeLabel(mess.menuType)}</p>` : '';
    
    modalContent.innerHTML = `
        <h2>${mess.name}</h2>
        <div class="mess-details">
            <p><i class="fas fa-map-marker-alt"></i> <strong>Location:</strong> ${mess.location}</p>
            <p><i class="fas fa-phone"></i> <strong>Contact:</strong> ${mess.phone}</p>
            <p><i class="fas fa-calendar"></i> <strong>Date:</strong> ${mess.date}</p>
            ${priceInfo}
            ${menuTypeInfo}
        </div>
        <div class="menu-details">
            <h3>Today's Menu</h3>
            <div class="menu-text">
                ${mess.menuText}
            </div>
        </div>
        ${mess.image ? `
            <img src="${mess.image}" alt="Menu Image" class="menu-image">
            <div class="contact-actions">
                <button class="call-btn" onclick="callMess('${mess.phone}')">
                    <i class="fas fa-phone"></i>
                    Call Now
                </button>
                <button class="whatsapp-btn" onclick="whatsappMess('${mess.phone}', '${mess.name}')">
                    <i class="fab fa-whatsapp"></i>
                    WhatsApp
                </button>
            </div>
        ` : `
            <div class="contact-actions">
                <button class="call-btn" onclick="callMess('${mess.phone}')">
                    <i class="fas fa-phone"></i>
                    Call Now
                </button>
                <button class="whatsapp-btn" onclick="whatsappMess('${mess.phone}', '${mess.name}')">
                    <i class="fab fa-whatsapp"></i>
                    WhatsApp
                </button>
            </div>
        `}
    `;
    
    modal.style.display = 'block';
}

// Close Modal
closeModal.addEventListener('click', () => {
    modal.style.display = 'none';
});

window.addEventListener('click', (e) => {
    if (e.target === modal) {
        modal.style.display = 'none';
    }
});

// Call Mess Function
function callMess(phone) {
    window.open(`tel:${phone}`, '_blank');
}

// WhatsApp Mess Function
function whatsappMess(phone, messName) {
    const message = `Hi, I'm interested in your mess menu at ${messName}. Can you please share more details?`;
    const whatsappUrl = `https://wa.me/${phone.replace(/\D/g, '')}?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
}

// Form Submission
menuForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const formData = new FormData();
    formData.append('name', document.getElementById('mess-name').value);
    formData.append('location', document.getElementById('mess-location').value);
    formData.append('phone', document.getElementById('mess-phone').value);
    formData.append('menuType', document.getElementById('menu-type').value || '');
    formData.append('menuText', document.getElementById('menu-text').value);
    formData.append('price', getPriceText(document.getElementById('price').value) || '');
    formData.append('date', new Date().toISOString().split('T')[0]);
    
    // Handle image upload
    const imageFile = document.getElementById('menu-image').files[0];
    if (imageFile) {
        formData.append('image', imageFile);
    }
    
    try {
        const response = await fetch(`${API_BASE_URL}/api/messes`, {
            method: 'POST',
            body: formData
        });
        
        if (response.ok) {
            const newMess = await response.json();
            messData.unshift(newMess);
            
            // Show success message
            showMessage('Menu uploaded successfully!', 'success');
            
            // Reset form
            menuForm.reset();
            
            // Switch to student view and show new mess
            document.querySelector('[data-tab="student"]').click();
            displayMessCards(messData);
        } else {
            const errorData = await response.json();
            showMessage(errorData.error || 'Error uploading menu', 'error');
        }
    } catch (error) {
        console.error('Error uploading menu:', error);
        showMessage('Error uploading menu. Please try again.', 'error');
    }
});

// Get Price Text
function getPriceText(priceValue) {
    if (!priceValue) return null;
    const prices = {
        'budget': '₹30-50 per meal',
        'medium': '₹50-80 per meal',
        'premium': '₹80+ per meal'
    };
    return prices[priceValue] || priceValue;
}

// Add Mess to List (kept for backward compatibility)
function addMessToList(newMess) {
    messData.unshift(newMess);
    displayMessCards(messData);
}

// Show Message
function showMessage(text, type) {
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${type}`;
    messageDiv.textContent = text;
    
    const container = document.querySelector('.container');
    container.insertBefore(messageDiv, container.firstChild);
    
    setTimeout(() => {
        messageDiv.remove();
    }, 3000);
}

// File Upload Preview
document.getElementById('menu-image').addEventListener('change', function(e) {
    const file = e.target.files[0];
    const placeholder = document.querySelector('.upload-placeholder');
    
    if (file) {
        const reader = new FileReader();
        reader.onload = function(e) {
            placeholder.innerHTML = `
                <i class="fas fa-check-circle"></i>
                <span>${file.name}</span>
            `;
        };
        reader.readAsDataURL(file);
    } else {
        placeholder.innerHTML = `
            <i class="fas fa-cloud-upload-alt"></i>
            <span>Click to upload image</span>
        `;
    }
});

// Auto-delete function (now handled by backend)
async function checkAndDeleteExpiredMenus() {
    try {
        const response = await fetch(`${API_BASE_URL}/api/messes/expired`, {
            method: 'DELETE'
        });
        
        if (response.ok) {
            const result = await response.json();
            if (result.deletedCount > 0) {
                console.log(`Deleted ${result.deletedCount} expired menus`);
                // Reload data from server
                await loadMessData();
                displayMessCards(messData);
            }
        }
    } catch (error) {
        console.error('Error checking expired menus:', error);
    }
}

// Initialize the app
document.addEventListener('DOMContentLoaded', async () => {
    // Load data from API
    await loadMessData();
    
    // Load initial data
    displayMessCards(messData);
    
    // Check for expired menus every minute
    setInterval(checkAndDeleteExpiredMenus, 60000);
    
    // Add some CSS for additional elements
    const style = document.createElement('style');
    style.textContent = `
        .no-results {
            text-align: center;
            padding: 3rem;
            color: #666;
        }
        
        .no-results i {
            font-size: 3rem;
            margin-bottom: 1rem;
            color: #ccc;
        }
        
        .view-details-btn {
            width: 100%;
            padding: 10px;
            background: linear-gradient(135deg, #667eea, #764ba2);
            color: white;
            border: none;
            border-radius: 8px;
            cursor: pointer;
            transition: all 0.3s ease;
            font-weight: 500;
        }
        
        .view-details-btn:hover {
            transform: translateY(-2px);
            box-shadow: 0 4px 15px rgba(102, 126, 234, 0.4);
        }
        
        .mess-details {
            background: #f8f9fa;
            padding: 1rem;
            border-radius: 10px;
            margin: 1rem 0;
        }
        
        .mess-details p {
            margin: 0.5rem 0;
        }
        
        .menu-details {
            margin: 1rem 0;
        }
        
        .menu-text {
            background: #f8f9fa;
            padding: 1rem;
            border-radius: 10px;
            margin-top: 0.5rem;
            word-wrap: break-word;
            overflow-wrap: break-word;
            white-space: pre-wrap;
            max-height: 200px;
            overflow-y: auto;
        }
        
        .menu-image {
            width: 100%;
            max-height: 300px;
            object-fit: cover;
            border-radius: 10px;
            margin: 1rem 0;
        }
        
        .contact-actions {
            display: flex;
            gap: 1rem;
            margin-top: 1rem;
        }
        
        @media (max-width: 768px) {
            .contact-actions {
                flex-direction: column;
                gap: 0.5rem;
            }
            
            .call-btn, .whatsapp-btn {
                padding: 15px;
                font-size: 1rem;
            }
        }
        
        @media (max-width: 480px) {
            .call-btn, .whatsapp-btn {
                padding: 12px;
                font-size: 0.9rem;
            }
        }
        
        .call-btn, .whatsapp-btn {
            flex: 1;
            padding: 12px;
            border: none;
            border-radius: 8px;
            cursor: pointer;
            font-weight: 500;
            transition: all 0.3s ease;
        }
        
        .call-btn {
            background: #28a745;
            color: white;
        }
        
        .whatsapp-btn {
            background: #25d366;
            color: white;
        }
        
        .call-btn:hover, .whatsapp-btn:hover {
            transform: translateY(-2px);
            box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
        }
        
        .upload-time-info {
            background: #fff3cd;
            color: #856404;
            padding: 0.5rem;
            border-radius: 5px;
            margin-bottom: 1rem;
            font-size: 0.9rem;
            text-align: center;
        }
        
        .time-remaining {
            display: inline-block;
            padding: 4px 12px;
            border-radius: 15px;
            font-size: 0.8rem;
            font-weight: 500;
            margin-bottom: 1rem;
            background: #e3f2fd;
            color: #1976d2;
        }
    `;
    document.head.appendChild(style);
}); 