const express = require('express');
const router = express.Router();
const Wishlist = require('../models/Wishlist');

// Get wishlist
router.get('/show/:userId', async (req, res) => {
  try {
    const wishlist = await Wishlist.findOne({ user: req.params.userId });
    res.json(wishlist ? wishlist.items : []);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Add to wishlist
router.post('/add', async (req, res) => {
  const { userId, product } = req.body;

  try {
    if (!userId || !product) {
      return res.status(400).json({ error: 'userId and product are required' });
    }
    let wishlist = await Wishlist.findOne({ user: userId });

    if (!wishlist) {
      wishlist = new Wishlist({ user: userId, items: [product] });
    } else {
      const exists = wishlist.items.find((item) => item.productId === product.productId);
      if (!exists) {
        wishlist.items.push(product);
      }
    }

    await wishlist.save();
    res.status(200).json(wishlist.items);
  } catch (err) {
    res.status(500).json({ error: 'Failed to update wishlist' });
  }
});

// Remove from wishlist
router.post('/remove', async (req, res) => {
  const { userId, productId } = req.body;

  try {
    const wishlist = await Wishlist.findOne({ user: userId });
    if (!wishlist) return res.status(404).json({ error: 'Wishlist not found' });

    wishlist.items = wishlist.items.filter((item) => item.productId !== productId);
    await wishlist.save();

    res.status(200).json(wishlist.items);
  } catch (err) {
    res.status(500).json({ error: 'Failed to remove item' });
  }
});

module.exports = router;