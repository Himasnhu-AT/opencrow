const products = [
    { id: 'p1', name: 'Wireless Headphones', price: 99.99, category: 'Electronics' },
    { id: 'p2', name: 'Smart Watch', price: 299.99, category: 'Electronics' },
    { id: 'p3', name: 'Laptop Stand', price: 49.99, category: 'Accessories' },
    { id: 'p4', name: 'USB-C Hub', price: 39.99, category: 'Accessories' },
    { id: 'p5', name: 'Mechanical Keyboard', price: 149.99, category: 'Electronics' },
    { id: 'p6', name: 'Mouse Pad', price: 19.99, category: 'Accessories' }
];

export default function ProductGrid() {
    const addToCart = (productId: string) => {
        const product = products.find(p => p.id === productId);
        if (product) {
            alert(`Added ${product.name} to cart!`);
        }
    };

    return (
        <div className="products-grid">
            {products.map(product => (
                <div key={product.id} className="product-card">
                    <img
                        src={`https://placehold.co/250x150/667eea/white?text=${encodeURIComponent(product.name)}`}
                        alt={product.name}
                    />
                    <div className="product-name">{product.name}</div>
                    <div className="product-price">${product.price}</div>
                    <button className="btn" onClick={() => addToCart(product.id)}>
                        Add to Cart
                    </button>
                </div>
            ))}
        </div>
    );
}
