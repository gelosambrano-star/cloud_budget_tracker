const mongoose = require ('mongoose');

const TransactionSchema =new mongoose.Schema({
    //this bind the transaction directly to a specific user's ID
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    
    title :{ type: String, required: true, trim: true},
    amount :{type: Number, required: true},
    category: { type: String , required: true, enum:['Income', 'Food', 'Rent', 'Utilities', 'Entertainment', 'other']},
    createdAt: {type: Date, default: Date.now}

});

module.exports = mongoose.model ('transaction', TransactionSchema);