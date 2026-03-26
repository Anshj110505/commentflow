// Import mongoose to create a database model
const mongoose = require('mongoose');

// Define the shape/structure of a User in the database
const userSchema = new mongoose.Schema({
  
  name: { 
    type: String,    // must be text
    required: true   // cannot be empty
  },
  
  email: { 
    type: String, 
    required: true, 
    unique: true     // no two users can have same email
  },
  
  password: { 
    type: String, 
    required: true   // will be encrypted before saving
  },
  
  createdAt: { 
    type: Date, 
    default: Date.now  // automatically saves signup time
  }

});

// Create and export the model
// mongoose.model('User', userSchema) creates a 'users' collection in MongoDB
module.exports = mongoose.model('User', userSchema);