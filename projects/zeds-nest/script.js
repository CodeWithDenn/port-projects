// Zed's Nest - Ordering System

let order = [];

document.addEventListener('DOMContentLoaded', function() {
    // Add event listeners to all "Add to Order" buttons
    const addButtons = document.querySelectorAll('.add-btn');
    addButtons.forEach(button => {
        button.addEventListener('click', function() {
            addItemToOrder(this);
        });
    });

    // Copy order button
    const copyBtn = document.getElementById('copyBtn');
    if (copyBtn) {
        copyBtn.addEventListener('click', copyOrderToClipboard);
    }

    // Clear order button
    const clearBtn = document.getElementById('clearBtn');
    if (clearBtn) {
        clearBtn.addEventListener('click', clearOrder);
    }

    // Update messenger link
    const messengerBtn = document.getElementById('messengerBtn');
    if (messengerBtn) {
        updateMessengerLink();
    }

    // Load order from localStorage if exists
    loadOrder();
});

// Add item to order
function addItemToOrder(button) {
    const itemContainer = button.closest('.menu-item');
    const itemName = itemContainer.querySelector('h3').textContent;
    const itemPrice = parseInt(itemContainer.querySelector('.price').textContent.replace(/[^\d]/g, ''));
    const qtyInput = itemContainer.querySelector('.qty-input');
    const quantity = parseInt(qtyInput.value);
    const flavourSelect = itemContainer.querySelector('.flavour-select');
    const flavour = flavourSelect ? flavourSelect.value : '';

    if (quantity <= 0) {
        alert('Please select a quantity');
        return;
    }

    if (flavourSelect && !flavour) {
        alert('Please select a flavour/variant');
        return;
    }

    // Create order item key (name + flavour)
    const orderKey = flavour ? `${itemName} - ${flavour}` : itemName;
    const displayName = flavour ? `${itemName} (${flavour})` : itemName;

    // Check if item with same name and flavour already in order
    const existingItem = order.find(item => item.displayName === displayName);

    if (existingItem) {
        existingItem.quantity += quantity;
    } else {
        order.push({
            name: itemName,
            displayName: displayName,
            flavour: flavour,
            price: itemPrice,
            quantity: quantity
        });
    }

    // Reset inputs
    qtyInput.value = 0;
    if (flavourSelect) {
        flavourSelect.value = '';
    }

    // Update display
    updateOrderDisplay();
    saveOrder();
}

// Update order display
function updateOrderDisplay() {
    const orderList = document.getElementById('orderList');
    const totalPrice = document.getElementById('totalPrice');

    if (order.length === 0) {
        orderList.innerHTML = '<p class="empty-message">No items added yet</p>';
        totalPrice.textContent = '0';
        return;
    }

    let html = '';
    let total = 0;

    order.forEach((item, index) => {
        const itemTotal = item.price * item.quantity;
        total += itemTotal;
        const displayName = item.displayName || item.name;

        html += `
            <div class="order-item">
                <div class="order-item-info">
                    <div class="order-item-name">${displayName}</div>
                    <div class="order-item-details">${item.quantity}x @ ₱${item.price}</div>
                </div>
                <span class="order-item-price">₱${itemTotal}</span>
                <button class="order-item-remove" onclick="removeItem(${index})">Remove</button>
            </div>
        `;
    });

    orderList.innerHTML = html;
    totalPrice.textContent = total;
}

// Remove item from order
function removeItem(index) {
    order.splice(index, 1);
    updateOrderDisplay();
    saveOrder();
}

// Clear entire order
function clearOrder() {
    if (confirm('Clear all items from order?')) {
        order = [];
        updateOrderDisplay();
        saveOrder();
    }
}

// Format order for messaging
function formatOrderText() {
    if (order.length === 0) {
        return 'No items in order';
    }

    let text = '*Order from Zed\'s Nest*\n\n';
    let total = 0;

    order.forEach(item => {
        const itemTotal = item.price * item.quantity;
        total += itemTotal;
        const displayName = item.displayName || item.name;
        text += `${displayName} x${item.quantity} - ₱${itemTotal}\n`;
    });

    text += `\n*Total: ₱${total}*\n\n`;
    text += 'Please confirm this order.';

    return text;
}

// Copy order to clipboard
function copyOrderToClipboard() {
    const orderText = formatOrderText();
    
    navigator.clipboard.writeText(orderText).then(() => {
        const copyBtn = document.getElementById('copyBtn');
        const originalText = copyBtn.textContent;
        
        copyBtn.textContent = 'Copied!';
        copyBtn.style.backgroundColor = '#27ae60';

        setTimeout(() => {
            copyBtn.textContent = originalText;
            copyBtn.style.backgroundColor = '';
        }, 2000);
    }).catch(err => {
        alert('Failed to copy order');
        console.error(err);
    });
}

// Update messenger link with order
function updateMessengerLink() {
    const messengerBtn = document.getElementById('messengerBtn');
    
    // Watch for order changes and update the messenger link
    const observer = new MutationObserver(() => {
        if (order.length > 0) {
            const orderText = formatOrderText();
            const encodedText = encodeURIComponent(orderText);
            // Using m.me with encoded message - adjust messenger_id as needed
            messengerBtn.href = `https://m.me/?text=${encodedText}`;
        } else {
            messengerBtn.href = 'https://m.me';
        }
    });

    observer.observe(document.getElementById('orderList'), {
        childList: true,
        subtree: true
    });

    // Initial update
    if (order.length > 0) {
        const orderText = formatOrderText();
        const encodedText = encodeURIComponent(orderText);
        messengerBtn.href = `https://m.me/?text=${encodedText}`;
    }
}

// Save order to localStorage
function saveOrder() {
    localStorage.setItem('zedsnest_order', JSON.stringify(order));
    updateMessengerLink();
}

// Load order from localStorage
function loadOrder() {
    const saved = localStorage.getItem('zedsnest_order');
    if (saved) {
        order = JSON.parse(saved);
        updateOrderDisplay();
        updateMessengerLink();
    }
}

// Navigation active state
document.addEventListener('DOMContentLoaded', function() {
    const currentPage = window.location.pathname.split('/').pop() || 'index.html';
    const navLinks = document.querySelectorAll('.nav-links a');
    
    navLinks.forEach(link => {
        const href = link.getAttribute('href');
        if (href.endsWith(currentPage)) {
            link.classList.add('active');
        }
    });
});