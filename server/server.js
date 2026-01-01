const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// Mock products for when MongoDB is not available - High quality placeholder items
const MOCK_PRODUCTS = [
  { 
    _id: '1', 
    title: 'Vesto Classic Sneakers', 
    price: 4500, 
    image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600&h=600&fit=crop',
    description: 'Premium classic sneakers perfect for everyday wear',
    category: 'Sneakers',
    rating: 4.8,
    inStock: true
  },
  { 
    _id: '2', 
    title: 'Vesto Leather Boots', 
    price: 7800, 
    image: 'https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?w=600&h=600&fit=crop',
    description: 'Durable leather boots for all weather conditions',
    category: 'Boots',
    rating: 4.9,
    inStock: true
  },
  { 
    _id: '3', 
    title: 'Vesto Running Shoes', 
    price: 3800, 
    image: 'https://images.unsplash.com/photo-1605348532760-6753d2c43329?w=600&h=600&fit=crop',
    description: 'Lightweight running shoes with superior comfort',
    category: 'Athletic',
    rating: 4.7,
    inStock: true
  },
  { 
    _id: '4', 
    title: 'Vesto Sport Sandals', 
    price: 3200, 
    image: 'https://images.unsplash.com/photo-1544966503-7cc5ac882d5f?w=600&h=600&fit=crop',
    description: 'Comfortable sport sandals for casual wear',
    category: 'Sandals',
    rating: 4.5,
    inStock: true
  },
  { 
    _id: '5', 
    title: 'Vesto High-Top Sneakers', 
    price: 5200, 
    image: 'https://images.unsplash.com/photo-1549298916-b41d501d3772?w=600&h=600&fit=crop',
    description: 'Stylish high-top sneakers with modern design',
    category: 'Sneakers',
    rating: 4.6,
    inStock: true
  },
  { 
    _id: '6', 
    title: 'Vesto Casual Loafers', 
    price: 4100, 
    image: 'https://images.unsplash.com/photo-1560769629-975ec94e6a86?w=600&h=600&fit=crop',
    description: 'Elegant loafers for business and casual occasions',
    category: 'Formal',
    rating: 4.8,
    inStock: true
  },
  { 
    _id: '7', 
    title: 'Vesto Basketball Shoes', 
    price: 6200, 
    image: 'https://images.unsplash.com/photo-1608231387042-66d1773070a5?w=600&h=600&fit=crop',
    description: 'High-performance basketball shoes with excellent grip',
    category: 'Athletic',
    rating: 4.9,
    inStock: true
  },
  { 
    _id: '8', 
    title: 'Vesto Canvas Sneakers', 
    price: 3500, 
    image: 'https://images.unsplash.com/photo-1539185441755-769473a23570?w=600&h=600&fit=crop',
    description: 'Classic canvas sneakers with timeless style',
    category: 'Sneakers',
    rating: 4.6,
    inStock: true
  },
  { 
    _id: '9', 
    title: 'Vesto Hiking Boots', 
    price: 8900, 
    image: 'https://images.unsplash.com/photo-1544966503-7d0c2a4c8c8c?w=600&h=600&fit=crop',
    description: 'Rugged hiking boots for outdoor adventures',
    category: 'Boots',
    rating: 4.9,
    inStock: true
  },
  { 
    _id: '10', 
    title: 'Vesto Slip-On Sneakers', 
    price: 3900, 
    image: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=600&h=600&fit=crop',
    description: 'Convenient slip-on design for easy wear',
    category: 'Sneakers',
    rating: 4.7,
    inStock: true
  },
  { 
    _id: '11', 
    title: 'Vesto Dress Shoes', 
    price: 5500, 
    image: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=600&h=600&fit=crop',
    description: 'Elegant dress shoes for formal occasions',
    category: 'Formal',
    rating: 4.8,
    inStock: true
  },
  { 
    _id: '12', 
    title: 'Vesto Trail Running', 
    price: 4800, 
    image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600&h=600&fit=crop',
    description: 'Trail running shoes with superior traction',
    category: 'Athletic',
    rating: 4.7,
    inStock: true
  }
];

let dbConnected = false;
let Product, Order;

// MongoDB connection with error handling
mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/covershoes', {
  serverSelectionTimeoutMS: 3000
})
  .then(() => {
    console.log('✅ MongoDB connected');
    dbConnected = true;
    
    const productSchema = new mongoose.Schema({
      title: String,
      price: Number,
      image: String,
      description: String,
      category: String,
      rating: Number,
      buyingPrice: { type: Number, select: false }
    });

    const orderSchema = new mongoose.Schema({
      phone: String,
      location: String,
      cartItems: Array,
      total: Number,
      timestamp: { type: Date, default: Date.now }
    });

    Product = mongoose.model('Product', productSchema);
    Order = mongoose.model('Order', orderSchema);
    
    seedProducts();
  })
  .catch((err) => {
    console.log('⚠️  MongoDB not available. Running in mock mode.');
    console.log('   Server will work with mock data. Start MongoDB for full functionality.');
  });

const SHIPPING_COSTS = {
  'Nairobi CBD': 200, 
  'Westlands': 250,
  'Karen': 300,
  'Nakuru': 300, 
  'Eldoret': 400, 
  'Mombasa': 500, 
  'Kisumu': 350,
  'Thika': 250,
  'Nyeri': 350,
  'Meru': 400
};

// Seed products
async function seedProducts() {
  if (!dbConnected) return;
  try {
    await Product.deleteMany({});
    await Product.insertMany([
      { title: 'Vesto Classic Sneakers', price: 4500, image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600&h=600&fit=crop', buyingPrice: 2800, category: 'Sneakers', rating: 4.8 },
      { title: 'Vesto Leather Boots', price: 7800, image: 'https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?w=600&h=600&fit=crop', buyingPrice: 5200, category: 'Boots', rating: 4.9 },
      { title: 'Vesto Running Shoes', price: 3800, image: 'https://images.unsplash.com/photo-1605348532760-6753d2c43329?w=600&h=600&fit=crop', buyingPrice: 2200, category: 'Athletic', rating: 4.7 },
      { title: 'Vesto Sport Sandals', price: 3200, image: 'https://images.unsplash.com/photo-1544966503-7cc5ac882d5f?w=600&h=600&fit=crop', buyingPrice: 2000, category: 'Sandals', rating: 4.5 },
      { title: 'Vesto High-Top Sneakers', price: 5200, image: 'https://images.unsplash.com/photo-1549298916-b41d501d3772?w=600&h=600&fit=crop', buyingPrice: 3200, category: 'Sneakers', rating: 4.6 },
      { title: 'Vesto Casual Loafers', price: 4100, image: 'https://images.unsplash.com/photo-1560769629-975ec94e6a86?w=600&h=600&fit=crop', buyingPrice: 2600, category: 'Formal', rating: 4.8 },
      { title: 'Vesto Basketball Shoes', price: 6200, image: 'https://images.unsplash.com/photo-1608231387042-66d1773070a5?w=600&h=600&fit=crop', buyingPrice: 4000, category: 'Athletic', rating: 4.9 },
      { title: 'Vesto Canvas Sneakers', price: 3500, image: 'https://images.unsplash.com/photo-1539185441755-769473a23570?w=600&h=600&fit=crop', buyingPrice: 2200, category: 'Sneakers', rating: 4.6 },
      { title: 'Vesto Hiking Boots', price: 8900, image: 'https://images.unsplash.com/photo-1544966503-7d0c2a4c8c8c?w=600&h=600&fit=crop', buyingPrice: 5800, category: 'Boots', rating: 4.9 },
      { title: 'Vesto Slip-On Sneakers', price: 3900, image: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=600&h=600&fit=crop', buyingPrice: 2500, category: 'Sneakers', rating: 4.7 },
      { title: 'Vesto Dress Shoes', price: 5500, image: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=600&h=600&fit=crop', buyingPrice: 3500, category: 'Formal', rating: 4.8 },
      { title: 'Vesto Trail Running', price: 4800, image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600&h=600&fit=crop', buyingPrice: 3000, category: 'Athletic', rating: 4.7 }
    ]);
    console.log('✅ Products seeded successfully');
  } catch (error) {
    console.error('❌ Error seeding products:', error.message);
  }
}

app.get('/api/products', async (req, res) => {
  try {
    if (dbConnected && Product) {
      const products = await Product.find({}, '-buyingPrice');
      return res.json(products);
    } else {
      // Return mock data when DB is not connected
      return res.json(MOCK_PRODUCTS);
    }
  } catch (error) {
    console.error('Error fetching products:', error);
    // Fallback to mock data on error
    res.json(MOCK_PRODUCTS);
  }
});

app.get('/api/products/:id', async (req, res) => {
  try {
    if (dbConnected && Product) {
      const product = await Product.findById(req.params.id, '-buyingPrice');
      if (!product) {
        return res.status(404).json({ error: 'Product not found' });
      }
      return res.json(product);
    } else {
      // Return mock product
      const product = MOCK_PRODUCTS.find(p => p._id === req.params.id);
      if (!product) {
        return res.status(404).json({ error: 'Product not found' });
      }
      return res.json(product);
    }
  } catch (error) {
    console.error('Error fetching product:', error);
    res.status(500).json({ error: 'Failed to fetch product' });
  }
});

app.post('/api/orders', async (req, res) => {
  try {
    const { phone, location, cartItems } = req.body;
    
    if (!phone || !location || !cartItems || cartItems.length === 0) {
      return res.status(400).json({ error: 'Missing required fields' });
    }
    
    const subtotal = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const shipping = SHIPPING_COSTS[location] || 500;
    const total = subtotal + shipping;
    
    if (dbConnected && Order) {
      const order = new Order({ phone, location, cartItems, total });
      await order.save();
      return res.json({ success: true, subtotal, shipping, total, orderId: order._id });
    } else {
      // Mock order response when DB is not connected
      const mockOrderId = 'mock_' + Date.now();
      console.log('📦 Mock Order Created:', { phone, location, total, orderId: mockOrderId });
      return res.json({ success: true, subtotal, shipping, total, orderId: mockOrderId });
    }
  } catch (error) {
    console.error('Error creating order:', error);
    return res.status(500).json({ error: 'Failed to create order', message: error.message });
  }
});

// Admin Dashboard Routes
app.get('/api/admin/orders', async (req, res) => {
  try {
    if (dbConnected && Order) {
      const orders = await Order.find().sort({ timestamp: -1 });
      return res.json(orders);
    } else {
      // Return empty array in mock mode
      return res.json([]);
    }
  } catch (error) {
    console.error('Error fetching orders:', error);
    return res.status(500).json({ error: 'Failed to fetch orders', message: error.message });
  }
});

app.post('/api/admin/products', async (req, res) => {
  try {
    if (!dbConnected || !Product) {
      return res.status(503).json({ error: 'Database not connected' });
    }
    const product = new Product(req.body);
    await product.save();
    res.json(product);
  } catch (error) {
    console.error('Error creating product:', error);
    res.status(500).json({ error: 'Failed to create product', message: error.message });
  }
});

app.put('/api/admin/products/:id', async (req, res) => {
  try {
    if (!dbConnected || !Product) {
      return res.status(503).json({ error: 'Database not connected' });
    }
    const product = await Product.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }
    res.json(product);
  } catch (error) {
    console.error('Error updating product:', error);
    res.status(500).json({ error: 'Failed to update product', message: error.message });
  }
});

app.delete('/api/admin/products/:id', async (req, res) => {
  try {
    if (!dbConnected || !Product) {
      return res.status(503).json({ error: 'Database not connected' });
    }
    const product = await Product.findByIdAndDelete(req.params.id);
    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }
    res.json({ success: true });
  } catch (error) {
    console.error('Error deleting product:', error);
    res.status(500).json({ error: 'Failed to delete product', message: error.message });
  }
});

app.listen(5000, () => console.log('🛍️ Server: http://localhost:5000'));

