import express from 'express';
import cors from 'cors';

const app = express();
app.use(cors());
app.use(express.json());

// Mock database
let orders = [
    { id: 'ord-001', status: 'delivered', total: 149.99, items: [{ name: 'Wireless Headphones' }], createdAt: '2025-01-15' },
    { id: 'ord-002', status: 'shipped', total: 349.98, items: [{ name: 'Smart Watch' }], createdAt: '2025-01-20' },
    { id: 'ord-003', status: 'pending', total: 49.99, items: [{ name: 'Laptop Stand' }], createdAt: '2025-01-22' }
];

let subscription = {
    id: 'sub-001',
    plan: 'Premium',
    status: 'active',
    nextBillingDate: '2025-02-23'
};

const products = [
    { id: 'p1', name: 'Wireless Headphones', price: 99.99, category: 'Electronics', image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500&auto=format&fit=crop&q=60' },
    { id: 'p2', name: 'Smart Watch', price: 299.99, category: 'Electronics', image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500&auto=format&fit=crop&q=60' },
    { id: 'p3', name: 'Laptop Stand', price: 49.99, category: 'Accessories', image: 'https://images.unsplash.com/photo-1611186871348-b1ce696e52c9?w=500&auto=format&fit=crop&q=60' },
    { id: 'p4', name: 'USB-C Hub', price: 39.99, category: 'Accessories', image: 'https://images.unsplash.com/photo-1625842268584-8f3296236761?w=500&auto=format&fit=crop&q=60' },
    { id: 'p5', name: 'Mechanical Keyboard', price: 149.99, category: 'Electronics', image: 'https://images.unsplash.com/photo-1602025882379-e01cf08baa51?w=500&auto=format&fit=crop&q=60' },
    { id: 'p6', name: 'Mouse Pad', price: 19.99, category: 'Accessories', image: 'https://images.unsplash.com/photo-1615526675159-e248c3021d3f?w=500&auto=format&fit=crop&q=60' },
];

let cart = {
    items: [],
    total: 0
};

// Middleware to verify token (optional for demo)
const authMiddleware = (req, res, next) => {
    const token = req.headers.authorization?.replace('Bearer ', '');
    // Allow requests with any Bearer token or no token for demo purposes
    // In production, you would validate properly
    if (token && token !== 'demo-user-token-123' && token !== 'undefined') {
        console.log(`[Mock API] Auth with token: ${token.substring(0, 20)}...`);
    }
    next();
};

// Routes (no auth for demo)
app.get('/api/orders', (req, res) => {
    console.log('[Mock API] GET /api/orders');
    res.json(orders);
});

app.post('/api/orders', (req, res) => {
    console.log('[Mock API] POST /api/orders (Checkout)');
    if (cart.items.length === 0) {
        return res.status(400).json({ error: 'Cart is empty' });
    }
    const newOrder = {
        id: `ord-${Math.floor(Math.random() * 10000)}`,
        status: 'pending',
        total: cart.total,
        items: [...cart.items],
        createdAt: new Date().toISOString()
    };
    orders.unshift(newOrder);
    cart = { items: [], total: 0 };
    res.json(newOrder);
});

app.get('/api/orders/:orderId', (req, res) => {
    const order = orders.find(o => o.id === req.params.orderId);
    if (!order) return res.status(404).json({ error: 'Order not found' });
    res.json(order);
});

app.delete('/api/orders/:orderId', (req, res) => {
    const orderIndex = orders.findIndex(o => o.id === req.params.orderId);
    if (orderIndex === -1) return res.status(404).json({ error: 'Order not found' });

    orders[orderIndex].status = 'cancelled';
    res.json({ message: 'Order cancelled successfully', order: orders[orderIndex] });
});

app.get('/api/subscription', (req, res) => {
    res.json(subscription);
});

app.delete('/api/subscription', (req, res) => {
    subscription.status = 'cancelled';
    res.json({ message: 'Subscription cancelled successfully' });
});

app.get('/api/products', (req, res) => {
    let filtered = products;
    if (req.query.query) {
        filtered = filtered.filter(p =>
            p.name.toLowerCase().includes(req.query.query.toLowerCase())
        );
    }
    if (req.query.category) {
        filtered = filtered.filter(p => p.category === req.query.category);
    }
    res.json(filtered);
});

app.get('/api/cart', (req, res) => {
    res.json(cart);
});

app.post('/api/cart', (req, res) => {
    const { productId, quantity } = req.body;
    const product = products.find(p => p.id === productId || p.name.toLowerCase().includes(productId.toLowerCase()));

    if (!product) {
        return res.status(404).json({ error: 'Product not found' });
    }

    const existingItem = cart.items.find(item => item.productId === product.id);

    if (existingItem) {
        existingItem.quantity += quantity;
    } else {
        cart.items.push({ productId: product.id, name: product.name, price: product.price, image: product.image, quantity });
    }

    cart.total = cart.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);

    res.json({ message: 'Item added to cart', cart });
});

app.delete('/api/cart', (req, res) => {
    cart = { items: [], total: 0 };
    res.json({ message: 'Cart cleared', cart });
});

const PORT = 3002;
app.listen(PORT, () => {
    console.log(`🛍️  Mock e-commerce API running on http://localhost:${PORT}`);
});
