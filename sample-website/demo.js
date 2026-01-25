// Mock data
const mockProducts = [
    { id: 'p1', name: 'Wireless Headphones', price: 99.99, category: 'Electronics' },
    { id: 'p2', name: 'Smart Watch', price: 299.99, category: 'Electronics' },
    { id: 'p3', name: 'Laptop Stand', price: 49.99, category: 'Accessories' },
    { id: 'p4', name: 'USB-C Hub', price: 39.99, category: 'Accessories' },
    { id: 'p5', name: 'Mechanical Keyboard', price: 149.99, category: 'Electronics' },
    { id: 'p6', name: 'Mouse Pad', price: 19.99, category: 'Accessories' }
];

const mockOrders = [
    {
        id: 'ord-001',
        status: 'delivered',
        total: 149.99,
        items: [{ name: 'Wireless Headphones', quantity: 1 }],
        createdAt: '2025-01-15'
    },
    {
        id: 'ord-002',
        status: 'shipped',
        total: 349.98,
        items: [{ name: 'Smart Watch', quantity: 1 }, { name: 'USB-C Hub', quantity: 1 }],
        createdAt: '2025-01-20'
    },
    {
        id: 'ord-003',
        status: 'pending',
        total: 49.99,
        items: [{ name: 'Laptop Stand', quantity: 1 }],
        createdAt: '2025-01-22'
    }
];

// Render functions
function renderProducts() {
    const grid = document.getElementById('products-grid');
    if (grid) {
        grid.innerHTML = mockProducts.map(product => `
      <div class="product-card">
        <img src="https://placehold.co/250x150/667eea/white?text=${encodeURIComponent(product.name)}" alt="${product.name}">
        <div class="product-name">${product.name}</div>
        <div class="product-price">${product.price}</div>
        <button class="btn" onclick="addToCart('${product.id}')">Add to Cart</button>
      </div>
    `).join('');
    }
}

function renderOrders() {
    const list = document.getElementById('orders-list');
    if (list) {
        list.innerHTML = mockOrders.map(order => `
      <div class="order-card">
        <div class="order-info">
          <div><strong>Order ${order.id}</strong></div>
          <div>Total: ${order.total} • ${order.createdAt}</div>
          <div style="margin-top: 8px; color: #6b7280;">${order.items.map(i => i.name).join(', ')}</div>
        </div>
        <span class="order-status status-${order.status}">${order.status.toUpperCase()}</span>
      </div>
    `).join('');
    }
}

function addToCart(productId) {
    const product = mockProducts.find(p => p.id === productId);
    if (product) {
        alert(`Added ${product.name} to cart!`);
    }
}

function logout() {
    alert('Logged out');
}

// Initialize
renderProducts();
renderOrders();

// Expose functions globally
window.addToCart = addToCart;
window.logout = logout;
