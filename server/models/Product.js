const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  // 1. Parent Details (Shared)
  title: { type: String, required: true },
  description: { type: String, required: true },
  price: { type: Number, required: true }, // Base price
  category: { type: String, required: true },
  images: [String], // Array of image URLs (Main parent images)
  
  // 2. The Variants Array
  variants: [{
    sku: { type: String, required: true, unique: true }, // COV-RUNNER-BLUE-40
    color: { type: String, required: true },
    size: { type: String, required: true }, // Keeping as String for "40.5" or "L" support
    stock: { type: Number, default: 0 },    // We'll use 'stock' standard naming
    priceOverride: { type: Number }         // Optional: If size 45 costs more
  }],

  // 3. Metadata
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Product', productSchema);