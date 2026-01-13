const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const { initiateSTKPush } = require('./utils/mpesa'); 

dotenv.config();

const app = express();

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));
app.use(cors());

// --- MOCK DATA GENERATOR ---
const generateVariants = (basePrice) => {
  const sizes = ['39', '40', '41', '42', '43', '44'];
  const variants = [];
  sizes.forEach(size => {
    variants.push({
      sku: `VES-GENERIC-${size}-BLK`, 
      size: size,
      color: 'Black',
      stock: Math.floor(Math.random() * 8),
      priceOverride: basePrice
    });
  });
  return variants;
};

const MOCK_PRODUCTS = [
  { 
    title: 'Vesto Classic Sneakers', 
    price: 4500,
    buyingPrice: 3000, 
    image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600&h=600&fit=crop',
    images: ['https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600&h=600&fit=crop'],
    description: 'Premium classic sneakers.',
    category: 'Sneakers',
    rating: 4.8,
    variants: generateVariants(4500)
  },
  { 
    title: 'Vesto Leather Boots', 
    price: 7800,
    buyingPrice: 5500,
    image: 'https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?w=600&h=600&fit=crop',
    description: 'Durable leather boots.',
    category: 'Boots',
    rating: 4.9,
    variants: generateVariants(7800)
  }
];

let dbConnected = false;
let Product, Order;

// MongoDB Connection
mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/covershoes', {
  serverSelectionTimeoutMS: 3000
})
.then(() => {
  console.log('✅ MongoDB connected');
  dbConnected = true;
  
  const productSchema = new mongoose.Schema({
    title: String,
    description: String,
    price: Number,
    buyingPrice: Number,
    category: String,
    image: String,
    images: [String],
    rating: Number,
    variants: [{ sku: String, size: String, color: String, stock: Number, priceOverride: Number }]
  });

  const orderSchema = new mongoose.Schema({
    firstName: String,
    lastName: String,
    phone: String,
    location: String,
    deliveryNotes: String,
    cartItems: Array,
    subtotal: Number,
    shipping: Number,
    total: Number,
    status: { type: String, default: 'Pending' }, 
    paymentMethod: String,
    mpesaRequestId: String,
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
        console.log('🌱 Seeding products...');
        await Product.insertMany(MOCK_PRODUCTS);
        console.log('✅ Seeding complete');
    }
  } catch (error) {
    console.error('❌ Seeding failed:', error.message);
  }
}

// --- PUBLIC ROUTES ---

app.get('/api/products', async (req, res) => {
  if (dbConnected && Product) {
    const products = await Product.find({});
    return res.json(products);
  }
  return res.json(MOCK_PRODUCTS.map((p, i) => ({ ...p, _id: (i + 1).toString() })));
});

app.get('/api/products/:id', async (req, res) => {
  if (dbConnected && Product) {
    try {
      if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
          return res.status(400).json({ error: 'Invalid ID format' });
      }
      const product = await Product.findById(req.params.id);
      if(product) return res.json(product);
    } catch(e) { console.error(e); }
  }
  const product = MOCK_PRODUCTS.find(p => p._id === req.params.id);
  return product ? res.json(product) : res.status(404).json({ error: 'Not Found' });
});

app.post('/api/orders', async (req, res) => {
  try {
    const orderData = req.body;
    if (!orderData.phone || !orderData.cartItems || orderData.cartItems.length === 0) {
      return res.status(400).json({ error: 'Invalid Order Data' });
    }

    if (dbConnected && Order) {
      const order = new Order(orderData);
      await order.save();

      try {
        const mpesaResponse = await initiateSTKPush(order.phone, order.total, order._id.toString());
        order.mpesaRequestId = mpesaResponse.MerchantRequestID;
        await order.save();
        console.log(`📲 STK Push sent for Order ${order._id}`);
      } catch (mpesaError) {
        console.error('⚠️ M-PESA Failed, Order saved as Pending:', mpesaError.message);
      }
      
      return res.json({ success: true, orderId: order._id });
    } else {
      return res.json({ success: true, orderId: 'MOCK-' + Date.now() });
    }
  } catch (error) {
    console.error('Order Error:', error);
    return res.status(500).json({ error: 'Failed to create order' });
  }
});

app.post('/api/mpesa/callback', async (req, res) => {
  try {
    console.log('📩 M-PESA Callback Received:', JSON.stringify(req.body, null, 2));
    const { Body } = req.body;
    if (!Body || !Body.stkCallback) return res.json({ result: 'ignored' });

    const { MerchantRequestID, ResultCode } = Body.stkCallback;

    if (dbConnected && Order) {
      const order = await Order.findOne({ mpesaRequestId: MerchantRequestID });
      if (order) {
        if (ResultCode === 0) {
          order.status = 'Paid';
          console.log(`✅ Order ${order._id} marked as PAID`);
        } else {
          order.status = 'Failed';
          console.log(`❌ Order ${order._id} payment FAILED`);
        }
        await order.save();
      }
    }
    res.json({ result: 'success' });
  } catch (error) {
    console.error('Callback Error:', error);
    res.status(500).json({ error: 'Internal Error' });
  }
});

// --- AUTH ROUTE ---
app.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body;
  if (email === 'admin@vesto.com' && password === 'admin123') {
    return res.json({ success: true, user: { id: 'ADM-001', name: 'Vesto Admin', role: 'admin' }, token: 'mock-admin' });
  }
  if (email === 'supplier@nike.com' && password === 'nike123') {
    return res.json({ success: true, user: { id: 'SUP-882', name: 'Nike Distributor', role: 'supplier' }, token: 'mock-supplier' });
  }
  return res.status(401).json({ error: 'Invalid credentials' });
});

// --- SUPPLIER ROUTES (NEW) ---
app.get('/api/supplier/orders', async (req, res) => {
  // In real life, we would filter by supplier ID here.
  // For MVP, we return all relevant active orders.
  if (dbConnected && Order) {
    try {
      const orders = await Order.find({ 
        // Just show Paid/Pending orders, not cancelled ones
        status: { $in: ['Paid', 'Pending'] } 
      }).sort({ timestamp: -1 });
      return res.json(orders);
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: 'Fetch failed' });
    }
  }
  // Mock data fallback if DB off
  return res.json([]);
});

// --- ADMIN ROUTES ---
app.get('/api/admin/orders', async (req, res) => {
    if (dbConnected && Order) {
        const orders = await Order.find().sort({ timestamp: -1 });
        return res.json(orders);
    }
    return res.json([]);
});

app.post('/api/admin/products', async (req, res) => {
    if (dbConnected && Product) {
        await new Product(req.body).save();
        return res.json({ success: true });
    }
    return res.json({ success: true }); 
});

app.put('/api/admin/products/:id', async (req, res) => {
    if (dbConnected && Product) {
        await Product.findByIdAndUpdate(req.params.id, req.body);
        return res.json({ success: true });
    }
    return res.json({ success: true });
});

app.delete('/api/admin/products/:id', async (req, res) => {
    if (dbConnected && Product) {
        await Product.findByIdAndDelete(req.params.id);
        return res.json({ success: true });
    }
    return res.json({ success: true });
});

const PORT = 5000;
app.listen(PORT, () => console.log(`🚀 Server running on http://localhost:${PORT}`));
// const express = require('express');
// const mongoose = require('mongoose');
// const cors = require('cors');
// const dotenv = require('dotenv');
// const { initiateSTKPush } = require('./utils/mpesa'); 

// dotenv.config();

// const app = express();

// app.use(express.json({ limit: '50mb' }));
// app.use(express.urlencoded({ limit: '50mb', extended: true }));
// app.use(cors());

// // --- MOCK DATA GENERATOR ---
// const generateVariants = (basePrice) => {
//   const sizes = ['39', '40', '41', '42', '43', '44'];
//   const variants = [];
//   sizes.forEach(size => {
//     // Note: We removed the productId from SKU generation temporarily to avoid circular logic
//     variants.push({
//       sku: `VES-GENERIC-${size}-BLK`, 
//       size: size,
//       color: 'Black',
//       stock: Math.floor(Math.random() * 8),
//       priceOverride: basePrice
//     });
//   });
//   return variants;
// };

// // --- FIX: REMOVED EXPLICIT IDs ---
// const MOCK_PRODUCTS = [
//   { 
//     // _id removed: MongoDB will generate this
//     title: 'Vesto Classic Sneakers', 
//     price: 4500,
//     buyingPrice: 3000, 
//     image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600&h=600&fit=crop',
//     images: ['https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600&h=600&fit=crop'],
//     description: 'Premium classic sneakers.',
//     category: 'Sneakers',
//     rating: 4.8,
//     variants: generateVariants(4500)
//   },
//   { 
//     // _id removed
//     title: 'Vesto Leather Boots', 
//     price: 7800,
//     buyingPrice: 5500,
//     image: 'https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?w=600&h=600&fit=crop',
//     description: 'Durable leather boots.',
//     category: 'Boots',
//     rating: 4.9,
//     variants: generateVariants(7800)
//   }
// ];

// let dbConnected = false;
// let Product, Order;

// // MongoDB Connection
// mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/covershoes', {
//   serverSelectionTimeoutMS: 3000
// })
// .then(() => {
//   console.log('✅ MongoDB connected');
//   dbConnected = true;
  
//   // SCHEMAS
//   const productSchema = new mongoose.Schema({
//     title: String,
//     description: String,
//     price: Number,
//     buyingPrice: Number,
//     category: String,
//     image: String,
//     images: [String],
//     rating: Number,
//     variants: [{ sku: String, size: String, color: String, stock: Number, priceOverride: Number }]
//   });

//   const orderSchema = new mongoose.Schema({
//     firstName: String,
//     lastName: String,
//     phone: String,
//     location: String,
//     deliveryNotes: String,
//     cartItems: Array,
//     subtotal: Number,
//     shipping: Number,
//     total: Number,
//     status: { type: String, default: 'Pending' }, 
//     paymentMethod: String,
//     mpesaRequestId: String,
//     timestamp: { type: Date, default: Date.now }
//   });

//   Product = mongoose.models.Product || mongoose.model('Product', productSchema);
//   Order = mongoose.models.Order || mongoose.model('Order', orderSchema);
  
//   seedProducts();
// })
// .catch((err) => {
//   console.log('⚠️  MongoDB not available. Running in mock mode.', err.message);
// });

// async function seedProducts() {
//   if (!dbConnected) return;
//   try {
//     const count = await Product.countDocuments();
//     if (count === 0) {
//         console.log('🌱 Seeding products...');
//         await Product.insertMany(MOCK_PRODUCTS);
//         console.log('✅ Seeding complete');
//     }
//   } catch (error) {
//     console.error('❌ Seeding failed:', error.message);
//   }
// }

// // --- ROUTES ---

// app.get('/api/products', async (req, res) => {
//   if (dbConnected && Product) {
//     const products = await Product.find({});
//     return res.json(products);
//   }
//   return res.json(MOCK_PRODUCTS.map((p, i) => ({ ...p, _id: (i + 1).toString() })));
// });

// app.get('/api/products/:id', async (req, res) => {
//   if (dbConnected && Product) {
//     try {
//       // Validate ObjectID format before querying to prevent crashes
//       if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
//           return res.status(400).json({ error: 'Invalid ID format' });
//       }
//       const product = await Product.findById(req.params.id);
//       if(product) return res.json(product);
//     } catch(e) { console.error(e); }
//   }
//   // Fallback for Mock Mode
//   const product = MOCK_PRODUCTS.find(p => p._id === req.params.id);
//   return product ? res.json(product) : res.status(404).json({ error: 'Not Found' });
// });

// // CREATE ORDER + STK PUSH
// app.post('/api/orders', async (req, res) => {
//   try {
//     const orderData = req.body;
    
//     if (!orderData.phone || !orderData.cartItems || orderData.cartItems.length === 0) {
//       return res.status(400).json({ error: 'Invalid Order Data' });
//     }

//     if (dbConnected && Order) {
//       const order = new Order(orderData);
//       await order.save();

//       try {
//         const mpesaResponse = await initiateSTKPush(order.phone, order.total, order._id.toString());
//         order.mpesaRequestId = mpesaResponse.MerchantRequestID;
//         await order.save();
//         console.log(`📲 STK Push sent for Order ${order._id}`);
//       } catch (mpesaError) {
//         console.error('⚠️ M-PESA Failed, Order saved as Pending:', mpesaError.message);
//       }
      
//       return res.json({ success: true, orderId: order._id });
//     } else {
//       return res.json({ success: true, orderId: 'MOCK-' + Date.now() });
//     }
//   } catch (error) {
//     console.error('Order Error:', error);
//     return res.status(500).json({ error: 'Failed to create order' });
//   }
// });

// // M-PESA CALLBACK
// app.post('/api/mpesa/callback', async (req, res) => {
//   try {
//     console.log('📩 M-PESA Callback Received:', JSON.stringify(req.body, null, 2));
//     const { Body } = req.body;
//     if (!Body || !Body.stkCallback) return res.json({ result: 'ignored' });

//     const { MerchantRequestID, ResultCode } = Body.stkCallback;

//     if (dbConnected && Order) {
//       const order = await Order.findOne({ mpesaRequestId: MerchantRequestID });
//       if (order) {
//         if (ResultCode === 0) {
//           order.status = 'Paid';
//           console.log(`✅ Order ${order._id} marked as PAID`);
//         } else {
//           order.status = 'Failed';
//           console.log(`❌ Order ${order._id} payment FAILED`);
//         }
//         await order.save();
//       }
//     }
//     res.json({ result: 'success' });
//   } catch (error) {
//     console.error('Callback Error:', error);
//     res.status(500).json({ error: 'Internal Error' });
//   }
// });

// // Admin Routes
// app.get('/api/admin/orders', async (req, res) => {
//     if (dbConnected && Order) {
//         const orders = await Order.find().sort({ timestamp: -1 });
//         return res.json(orders);
//     }
//     return res.json([]);
// });

// app.post('/api/admin/products', async (req, res) => {
//     if (dbConnected && Product) {
//         await new Product(req.body).save();
//         return res.json({ success: true });
//     }
//     return res.json({ success: true }); 
// });

// app.put('/api/admin/products/:id', async (req, res) => {
//     if (dbConnected && Product) {
//         await Product.findByIdAndUpdate(req.params.id, req.body);
//         return res.json({ success: true });
//     }
//     return res.json({ success: true });
// });

// app.delete('/api/admin/products/:id', async (req, res) => {
//     if (dbConnected && Product) {
//         await Product.findByIdAndDelete(req.params.id);
//         return res.json({ success: true });
//     }
//     return res.json({ success: true });
// });

// const PORT = 5000;

// // --- AUTH ROUTES ---
// app.post('/api/auth/login', (req, res) => {
//   const { email, password } = req.body;
  
//   // 1. ADMIN CHECK
//   if (email === 'admin@vesto.com' && password === 'admin123') {
//     return res.json({ 
//       success: true, 
//       user: { id: 'ADM-001', name: 'Vesto Admin', role: 'admin' },
//       token: 'mock-jwt-token-admin-secret-123' 
//     });
//   }
  
//   // 2. SUPPLIER CHECK
//   if (email === 'supplier@nike.com' && password === 'nike123') {
//     return res.json({ 
//       success: true, 
//       user: { id: 'SUP-882', name: 'Nike Distributor', role: 'supplier' },
//       token: 'mock-jwt-token-supplier-secret-456' 
//     });
//   }

//   return res.status(401).json({ error: 'Invalid credentials' });
// });


// app.listen(PORT, () => console.log(`🚀 Server running on http://localhost:${PORT}`));