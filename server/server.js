const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
dotenv.config();

const app = express();

// 1. INCREASE PAYLOAD LIMIT (Crucial for 5-angle images)
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));
app.use(cors());

// --- MOCK DATA GENERATOR (Updated for Variants) ---
const generateVariants = (productId, basePrice) => {
  const sizes = ['39', '40', '41', '42', '43', '44'];
  const colors = ['Black', 'White', 'Navy'];
  const variants = [];
  
  sizes.forEach(size => {
    // Generate a SKU for specific combinations
    variants.push({
      sku: `VES-${productId}-${size}-BLK`,
      size: size,
      color: 'Black',
      stock: Math.floor(Math.random() * 8), // Random stock
      priceOverride: basePrice
    });
  });
  return variants;
};

// Seed Data
const MOCK_PRODUCTS = [
  { 
    _id: '1', 
    title: 'Vesto Classic Sneakers', 
    price: 4500,
    buyingPrice: 3000, 
    image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600&h=600&fit=crop',
    images: [
      'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600&h=600&fit=crop',
      'https://images.unsplash.com/photo-1600185365926-3a2ce3cdb9eb?w=600&h=600&fit=crop'
    ],
    description: 'Premium classic sneakers perfect for everyday wear',
    category: 'Sneakers',
    rating: 4.8,
    variants: generateVariants('1', 4500)
  },
  { 
    _id: '2', 
    title: 'Vesto Leather Boots', 
    price: 7800,
    buyingPrice: 5500,
    image: 'https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?w=600&h=600&fit=crop',
    description: 'Durable leather boots for all weather conditions',
    category: 'Boots',
    rating: 4.9,
    variants: generateVariants('2', 7800)
  }
];

let dbConnected = false;
let Product, Order;

// --- MONGODB CONNECTION ---
mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/covershoes', {
  serverSelectionTimeoutMS: 3000
})
.then(() => {
  console.log('✅ MongoDB connected');
  dbConnected = true;
  
  // Define Schemas Inline (Microservice style for MVP)
  const productSchema = new mongoose.Schema({
    title: String,
    description: String,
    price: Number,
    buyingPrice: Number, // New: Profit tracking
    category: String,
    image: String,
    images: [String], // New: 5-angle support
    rating: Number,
    variants: [{
        sku: String,
        size: String,
        color: String,
        stock: Number,
        priceOverride: Number
    }]
  });

  const orderSchema = new mongoose.Schema({
    firstName: String,
    lastName: String,
    phone: String,
    location: String,
    deliveryNotes: String,
    cartItems: Array, // Stores snapshot of item details
    subtotal: Number,
    shipping: Number,
    total: Number,
    status: { type: String, default: 'Pending' },
    paymentMethod: String,
    timestamp: { type: Date, default: Date.now }
  });

  Product = mongoose.models.Product || mongoose.model('Product', productSchema);
  Order = mongoose.models.Order || mongoose.model('Order', orderSchema);
  
  seedProducts();
})
.catch((err) => {
  console.log('⚠️  MongoDB not available. Running in mock mode.', err.message);
});

async function seedProducts() {
  if (!dbConnected) return;
  try {
    const count = await Product.countDocuments();
    if (count === 0) {
        console.log('Seeding products...');
        await Product.insertMany(MOCK_PRODUCTS);
        console.log('✅ Database seeded');
    }
  } catch (error) {
    console.error('❌ Seeding failed:', error.message);
  }
}

// --- API ROUTES ---

// 1. GET PRODUCTS
app.get('/api/products', async (req, res) => {
  if (dbConnected && Product) {
    const products = await Product.find({});
    return res.json(products);
  }
  return res.json(MOCK_PRODUCTS);
});

app.get('/api/products/:id', async (req, res) => {
  if (dbConnected && Product) {
    try {
        const product = await Product.findById(req.params.id);
        if(product) return res.json(product);
    } catch(e) {}
  }
  const product = MOCK_PRODUCTS.find(p => p._id === req.params.id);
  return product ? res.json(product) : res.status(404).json({ error: 'Not Found' });
});

// 2. CREATE ORDER (Updated for Checkout.jsx)
app.post('/api/orders', async (req, res) => {
  try {
    const orderData = req.body;
    
    // Basic Validation
    if (!orderData.phone || !orderData.cartItems || orderData.cartItems.length === 0) {
      return res.status(400).json({ error: 'Invalid Order Data' });
    }

    if (dbConnected && Order) {
      const order = new Order(orderData);
      await order.save();
      
      // TODO: Here we would trigger the MPESA STK Push
      // await initiateSTKPush(orderData.phone, orderData.total);
      
      return res.json({ success: true, orderId: order._id });
    } else {
      // Mock Mode
      return res.json({ success: true, orderId: 'MOCK-' + Date.now() });
    }
  } catch (error) {
    console.error('Order Error:', error);
    return res.status(500).json({ error: 'Failed to create order' });
  }
});

// 3. ADMIN: GET ORDERS
app.get('/api/admin/orders', async (req, res) => {
    if (dbConnected && Order) {
        const orders = await Order.find().sort({ timestamp: -1 });
        return res.json(orders);
    }
    return res.json([]);
});

// 4. ADMIN: SAVE PRODUCT (Updated for Variants & Angles)
app.post('/api/admin/products', async (req, res) => {
    try {
        const productData = req.body;
        if (dbConnected && Product) {
            const product = new Product(productData);
            await product.save();
            return res.json({ success: true, product });
        }
        // Mock Update
        MOCK_PRODUCTS.push({ _id: Date.now().toString(), ...productData });
        return res.json({ success: true });
    } catch (error) {
        return res.status(500).json({ error: 'Save failed' });
    }
});

app.put('/api/admin/products/:id', async (req, res) => {
    try {
        if (dbConnected && Product) {
            await Product.findByIdAndUpdate(req.params.id, req.body);
            return res.json({ success: true });
        }
        return res.json({ success: true });
    } catch (error) {
        return res.status(500).json({ error: 'Update failed' });
    }
});

app.delete('/api/admin/products/:id', async (req, res) => {
    try {
        if (dbConnected && Product) {
            await Product.findByIdAndDelete(req.params.id);
            return res.json({ success: true });
        }
        return res.json({ success: true });
    } catch (error) {
        return res.status(500).json({ error: 'Delete failed' });
    }
});

const PORT = 5000;
app.listen(PORT, () => console.log(`🚀 Server running on http://localhost:${PORT}`));