const mongoose = require ('mongoose');
const { createRadialChart } = require('recharts');
const  userSchema= new mongoose.Schema({
 name: {
    type: String,
    required: [true, 'Please add a name']

 },
 email:{
    type: String,
    required: [true,'Please add a email'],
    unique: true, //prevents duplicate registrations
    match: [
        /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
      'Please add a valid email'
    ]
 },
 password:{
    type: String,
    required: [true, 'Please add a password'],
    minlength: 6
 },
 createdAt: {
    type: Date,
    default: Date.now
 }

});

module.exports = mongoose.model('User', userSchema)