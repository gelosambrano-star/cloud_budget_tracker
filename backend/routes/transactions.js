const express = require('express');
const router = express.Router();
const Transaction = require('../models/Transaction');
const { analyzeBudget } = require('../utils/budgetEngine');
const { protect } = require('../utils/authMiddleware'); // Import security guard

// GET all transactions for the authenticated user only
router.get('/', protect, async (req, res) => {
  try {
    // Filter MongoDB records to match the specific user ID attached by the middleware
    const transactions = await Transaction.find({ user: req.user }).sort({ createdAt: -1 });
    const analysis = analyzeBudget(transactions);
    res.json({ transactions, analysis });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST a brand new transaction record bound to a specific user
router.post('/', protect, async (req, res) => {
  try {
    const { title, amount, category } = req.body;
    const newTx = new Transaction({ 
      user: req.user, // Attach the owner ID to the transaction
      title, 
      amount, 
      category 
    });
    await newTx.save();
    res.status(201).json(newTx);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// DELETE a specific transaction after verifying user ownership
router.delete('/:id', protect, async (req, res) => {
  try {
    const transaction = await Transaction.findById(req.params.id);
    if (!transaction) {
      return res.status(404).json({ error: 'Transaction not found' });
    }
    
    // Security check: Verify if the user deleting actually owns the item
    if (transaction.user.toString() !== req.user) {
      return res.status(401).json({ error: 'User not authorized to delete this log' });
    }

    await transaction.deleteOne();
    res.json({ message: 'Transaction removed successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
