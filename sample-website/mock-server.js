import express from 'express';
import cors from 'cors';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(cors());
app.use(express.json());

const DATA_DIR = path.join(__dirname, 'data');

// Helper functions for file I/O
const readJson = (file) => {
    try {
        const data = fs.readFileSync(path.join(DATA_DIR, file), 'utf8');
        return JSON.parse(data);
    } catch (err) {
        console.error(`Error reading ${file}:`, err);
        return [];
    }
};

const writeJson = (file, data) => {
    try {
        fs.writeFileSync(path.join(DATA_DIR, file), JSON.stringify(data, null, 2));
    } catch (err) {
        console.error(`Error writing ${file}:`, err);
    }
};

// Auth Helper
const generateToken = (user) => {
    // Simple token format: firstName + UUID (simulated)
    return `${user.firstName}-${user.id}`;
};

// Middleware to verify token
const authMiddleware = (req, res, next) => {
    const token = req.headers.authorization?.replace('Bearer ', '');

    if (!token) {
        return res.status(401).json({ error: 'Unauthorized: No token provided' });
    }

    const users = readJson('users.json');
    // decoding token: firstName-id
    const parts = token.split('-');
    const userId = parts[parts.length - 1]; // Last part is ID

    // In a real app we would verify signature etc. 
    // Here we just check if user exists and token starts with firstName
    const user = users.find(u => u.id === userId);

    if (user && token === `${user.firstName}-${user.id}`) {
        req.user = user;
        next();
    } else {
        return res.status(401).json({ error: 'Unauthorized: Invalid token' });
    }
};


// --- Auth Routes ---

app.post('/api/login', (req, res) => {
    const { email, password } = req.body;
    const users = readJson('users.json');
    const user = users.find(u => u.email === email && u.password === password);

    if (user) {
        const token = generateToken(user);
        const { password, ...userWithoutPass } = user;
        res.json({ token, user: userWithoutPass });
    } else {
        res.status(401).json({ error: 'Invalid credentials' });
    }
});

app.post('/api/register', (req, res) => {
    const { firstName, lastName, email, password } = req.body;
    const users = readJson('users.json');

    if (users.find(u => u.email === email)) {
        return res.status(400).json({ error: 'User already exists' });
    }

    const newUser = {
        id: `u${Date.now()}`,
        firstName,
        lastName,
        email,
        password
    };

    users.push(newUser);
    writeJson('users.json', users);

    const token = generateToken(newUser);
    const { password: _, ...userWithoutPass } = newUser;
    res.json({ token, user: userWithoutPass });
});

app.get('/api/me', authMiddleware, (req, res) => {
    const { password, ...userWithoutPass } = req.user;
    res.json(userWithoutPass);
});



// --- Data Routes ---

app.get('/api/orders', authMiddleware, (req, res) => {
    const allOrders = readJson('orders.json');
    // Filter orders for the logged-in user
    const userOrders = allOrders.filter(o => o.userId === req.user.id);
    res.json(userOrders);
});

app.post('/api/orders', authMiddleware, (req, res) => {
    const allCarts = readJson('carts.json');
    const userCart = allCarts[req.user.id];

    if (!userCart || !userCart.items || userCart.items.length === 0) {
        return res.status(400).json({ error: 'Cart is empty' });
    }

    const newOrder = {
        id: `ord-${Math.floor(Math.random() * 10000)}`,
        userId: req.user.id,
        status: 'pending',
        total: userCart.total,
        items: [...userCart.items],
        createdAt: new Date().toISOString()
    };

    const allOrders = readJson('orders.json');
    allOrders.unshift(newOrder);
    writeJson('orders.json', allOrders);

    // Clear cart
    allCarts[req.user.id] = { items: [], total: 0 };
    writeJson('carts.json', allCarts);

    res.json(newOrder);
});

app.get('/api/orders/:orderId', authMiddleware, (req, res) => {
    const allOrders = readJson('orders.json');
    const order = allOrders.find(o => o.id === req.params.orderId && o.userId === req.user.id);
    if (!order) return res.status(404).json({ error: 'Order not found' });
    res.json(order);
});

app.delete('/api/orders/:orderId', authMiddleware, (req, res) => {
    const allOrders = readJson('orders.json');
    const orderIndex = allOrders.findIndex(o => o.id === req.params.orderId && o.userId === req.user.id);

    if (orderIndex === -1) return res.status(404).json({ error: 'Order not found' });

    allOrders[orderIndex].status = 'cancelled';
    writeJson('orders.json', allOrders);

    res.json({ message: 'Order cancelled successfully', order: allOrders[orderIndex] });
});

app.get('/api/subscription', authMiddleware, (req, res) => {
    const allSubscriptions = readJson('subscriptions.json');
    const sub = allSubscriptions[req.user.id];
    // If no subscription, return null or 404? 
    // The previous mock returned a static object. Let's return null if not found.
    res.json(sub || null);
});

app.post('/api/subscription', authMiddleware, (req, res) => {
    // endpoint to create/update sub
    const allSubscriptions = readJson('subscriptions.json');
    const newSub = {
        id: `sub-${Date.now()}`,
        plan: 'Premium',
        status: 'active',
        nextBillingDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
    };
    allSubscriptions[req.user.id] = newSub;
    writeJson('subscriptions.json', allSubscriptions);
    res.json(newSub);
});

app.delete('/api/subscription', authMiddleware, (req, res) => {
    const allSubscriptions = readJson('subscriptions.json');
    if (allSubscriptions[req.user.id]) {
        allSubscriptions[req.user.id].status = 'cancelled';
        writeJson('subscriptions.json', allSubscriptions);
        res.json({ message: 'Subscription cancelled successfully' });
    } else {
        res.status(404).json({ error: 'No subscription found' });
    }
});

app.get('/api/products', (req, res) => {
    let products = readJson('products.json');

    if (req.query.query) {
        products = products.filter(p =>
            p.name.toLowerCase().includes(req.query.query.toLowerCase())
        );
    }
    if (req.query.category) {
        products = products.filter(p => p.category === req.query.category);
    }
    res.json(products);
});

app.get('/api/cart', authMiddleware, (req, res) => {
    const allCarts = readJson('carts.json');
    const userCart = allCarts[req.user.id] || { items: [], total: 0 };
    res.json(userCart);
});

app.post('/api/cart', authMiddleware, (req, res) => {
    const { productId, quantity } = req.body;
    const products = readJson('products.json');
    const product = products.find(p => p.id === productId || p.name.toLowerCase().includes(productId.toLowerCase()));

    if (!product) {
        return res.status(404).json({ error: 'Product not found' });
    }

    const allCarts = readJson('carts.json');
    let userCart = allCarts[req.user.id];
    if (!userCart) {
        userCart = { items: [], total: 0 };
        allCarts[req.user.id] = userCart;
    }

    const existingItem = userCart.items.find(item => item.productId === product.id);

    if (existingItem) {
        existingItem.quantity += quantity;
    } else {
        userCart.items.push({
            productId: product.id,
            name: product.name,
            price: product.price,
            image: product.image,
            quantity
        });
    }

    userCart.total = userCart.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    writeJson('carts.json', allCarts);

    res.json({ message: 'Item added to cart', cart: userCart });
});

app.delete('/api/cart', authMiddleware, (req, res) => {
    const allCarts = readJson('carts.json');
    allCarts[req.user.id] = { items: [], total: 0 };
    writeJson('carts.json', allCarts);
    res.json({ message: 'Cart cleared', cart: allCarts[req.user.id] });
});

const PORT = 3002;
// Use a try-catch for starting the server to handle potential errors gracefully (though not strictly necessary)
try {
    app.listen(PORT, () => {
        console.log(`🛍️  Mock e-commerce API running on http://localhost:${PORT}`);
    });
} catch (error) {
    console.error("Failed to start server:", error);
}

