const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('./models/user');

const router = express.Router();

// User registration
// auth.js
router.post('/register', async (req, res) => {
  try {
    const { username, password } = req.body;
    console.log(req.body);
    // Check if the user already exists
    const existingUser = await User.findOne({ username });
    if (existingUser) {
      return res.status(400).send('User already exists');
    }

    // Hash the password and create a new user
    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({ username, password: hashedPassword });
    await newUser.save();

    res.send('User registered successfully');
  } catch (error) {
    console.error('Error during registration:', error);
    res.status(500).send('Server error during registration');
  }
});


// User login
router.post('/login', async (req, res) => {
  const { username, password } = req.body;
  const user = await User.findOne({ username });

  if (user && await bcrypt.compare(password, user.password)) {
    const token = jwt.sign({ id: user._id }, 'secret', { expiresIn: '1h' });
    res.json({ token });
  } else {
    res.status(401).send('Invalid Username or Password');
  }
});


module.exports = router;
