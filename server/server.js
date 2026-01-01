const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const Product = require('./models/Product'); // IMPORT THE NEW MODEL

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// -----------------------------------------------------------------------------
// MOCK DATA (New Structure: Parent + Variants)
// -----------------------------------------------------------------------------
const MOCK_PRODUCTS = [
  { 
    _id: '1', 
    title: 'Vesto Classic Sneakers', 
    price: 4500, 
    category: 'Sneakers',
    description: 'Premium classic sneakers perfect for everyday wear',
    images: ['https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600&h=600&fit=crop'],
    variants: [
      { sku: 'VES-CLS-WHT-40', color: 'White', size: '40', stock: 10, priceOverride: 4500 },
      { sku: 'VES-CLS-WHT-41', color: 'White', size: '41', stock: 5, priceOverride: 4500 },
      { sku: 'VES-CLS-BLK-40', color: 'Black', size: '40', stock: 8, priceOverride: 4500 }
    ]
  },
  { 
    _id: '2', 
    title: 'Vesto Leather Boots', 
    price: 7800, 
    category: 'Boots',
    description: 'Durable leather boots for all weather conditions',
    images: ['https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?w=600&h=600&fit=crop'],
    variants: [
      { sku: 'VES-BOOT-BRN-42', color: 'Brown', size: '42', stock: 12, priceOverride: 7800 },
      { sku: 'VES-BOOT-BLK-42', color: 'Black', size: '42', stock: 4, priceOverride: 7800 }
    ]
  }
];

let dbConnected = false;
let Order;

// -----------------------------------------------------------------------------
// MONGODB CONNECTION
// -----------------------------------------------------------------------------
mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/vestoshoes', {
  serverSelectionTimeoutMS: 3000
})
  .then(() => {
    console.log('✅ MongoDB connected');
    dbConnected = true;

    // Define Order Schema (Temporary inline)
    const orderSchema = new mongoose.Schema({
      phone: String,
      location: String,
      cartItems: Array,
      total: Number,
      timestamp: { type: Date, default: Date.now }
    });
    
    Order = mongoose.models.Order || mongoose.model('Order', orderSchema);
    
    // Seed the new data
    seedProducts();
  })
  .catch((err) => {
    console.log('⚠️  MongoDB not available. Running in mock mode.');
    // console.log(err.message); 
  });

const SHIPPING_COSTS = {
  'Nairobi CBD': 200, 'Westlands': 250, 'Karen': 300,
  'Nakuru': 300, 'Eldoret': 400, 'Mombasa': 500, 
  'Kisumu': 350, 'Thika': 250
};

// -----------------------------------------------------------------------------
// SEEDING SCRIPT (Populates DB with Variant Data)
// -----------------------------------------------------------------------------
async function seedProducts() {
  if (!dbConnected) return;
  try {
    // WIPE OLD DATA to prevent conflicts
    await Product.deleteMany({});
    
    console.log('🌱 Seeding Vesto Product/Variant data...');
    
    await Product.insertMany([
      { 
        title: 'Vesto Classic Sneakers', 
        price: 4500, 
        category: 'Sneakers',
        description: 'Premium classic sneakers perfect for everyday wear',
        images: ['https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600&h=600&fit=crop'],
        variants: [
          { sku: 'VES-CLS-WHT-40', color: 'White', size: '40', stock: 10, priceOverride: 4500 },
          { sku: 'VES-CLS-WHT-41', color: 'White', size: '41', stock: 8, priceOverride: 4500 },
          { sku: 'VES-CLS-WHT-42', color: 'White', size: '42', stock: 0, priceOverride: 4500 }, // Out of stock
          { sku: 'VES-CLS-BLK-40', color: 'Black', size: '40', stock: 5, priceOverride: 4500 }
        ]
      },
      { 
        title: 'Vesto Leather Boots', 
        price: 7800, 
        category: 'Boots',
        description: 'Durable leather boots for all weather conditions',
        images: ['https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?w=600&h=600&fit=crop'],
        variants: [
          { sku: 'VES-BOOT-BRN-40', color: 'Brown', size: '40', stock: 5, priceOverride: 7800 },
          { sku: 'VES-BOOT-BRN-41', color: 'Brown', size: '41', stock: 5, priceOverride: 7800 },
          { sku: 'VES-BOOT-BRN-42', color: 'Brown', size: '42', stock: 2, priceOverride: 7800 }
        ]
      }
    ]);
    console.log('✅ Vesto Products seeded!');
  } catch (error) {
    console.error('❌ Error seeding products:', error.message);
  }
}

// -----------------------------------------------------------------------------
// API ROUTES
// -----------------------------------------------------------------------------

// GET ALL PRODUCTS
app.get('/api/products', async (req, res) => {
  try {
    if (dbConnected) {
      const products = await Product.find({});
      return res.json(products);
    }
    return res.json(MOCK_PRODUCTS);
  } catch (error) {
    res.json(MOCK_PRODUCTS);
  }
});

// GET SINGLE PRODUCT
app.get('/api/products/:id', async (req, res) => {
  try {
    if (dbConnected) {
      const product = await Product.findById(req.params.id);
      if (!product) return res.status(404).json({ error: 'Product not found' });
      return res.json(product);
    }
    
    // Mock Fallback
    const product = MOCK_PRODUCTS.find(p => p._id === req.params.id);
    if (!product) return res.status(404).json({ error: 'Product not found' });
    return res.json(product);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch product' });
  }
});

// CREATE ORDER
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
      // NOTE: In next steps we will add logic to subtract stock here
      return res.json({ success: true, orderId: order._id });
    }
    
    const mockOrderId = 'mock_' + Date.now();
    return res.json({ success: true, orderId: mockOrderId });
  } catch (error) {
    console.error('Error creating order:', error);
    return res.status(500).json({ error: 'Failed to create order' });
  }
});

app.listen(5000, () => console.log('🛍️ Server: http://localhost:5000'));