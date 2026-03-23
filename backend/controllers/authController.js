const User = require('../models/user');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// ── REGISTER ─────────────────────────────────────────────
exports.register = async (req, res) => {
  try {
    // Get name, email, password from the request body
    const { name, email, password } = req.body;

    // Check if someone already registered with this email
    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(400).json({ message: '❌ Email already registered' });
    }

    // Encrypt the password - 10 means how strong the encryption is
    // Never save plain text passwords!
    const hashedPassword = await bcrypt.hash(password, 10);

    // Save the new user to database
    const user = await User.create({ 
      name, 
      email, 
      password: hashedPassword
    });

    // Create a login token that expires in 7 days
    const token = jwt.sign(
      { id: user._id },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    // Send back the token and user info
    res.status(201).json({ 
      token, 
      user: { 
        id: user._id, 
        name: user.name, 
        email: user.email 
      } 
    });

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ── LOGIN ─────────────────────────────────────────────────
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find user by email
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: '❌ Invalid email or password' });
    }

    // Compare entered password with encrypted one in database
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: '❌ Invalid email or password' });
    }

    // Create token
    const token = jwt.sign(
      { id: user._id }, 
      process.env.JWT_SECRET, 
      { expiresIn: '7d' }
    );

    // Send token and user info back
    res.json({ 
      token, 
      user: { 
        id: user._id, 
        name: user.name, 
        email: user.email 
      } 
    });

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};