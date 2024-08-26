const express = require('express');
const mongoose = require('mongoose');
const authRoutes = require('./auth');
const Message = require('./models/Message');
const jwt = require('jsonwebtoken');
const { encryptMessage, decryptMessage } = require('./encryption');
const https = require('https');
const fs = require('fs');
const path = require('path');

const app = express();
app.use(express.json());

// Connect to MongoDB
mongoose.connect('mongodb+srv://hlev2454:passwordmongo@barknetcluster.ksy8pmw.mongodb.net/SecurityChat?retryWrites=true&w=majority', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
  .then(() => console.log('Connected to MongoDB'))
  .catch((error) => console.error('Could not connect to MongoDB', error));

// Load SSL certificate and key
const options = {
  key: fs.readFileSync('server.key'),
  cert: fs.readFileSync('server.cert'),
};

// Serve static files from the "public" directory
app.use(express.static(path.join(__dirname, 'public')));

// Serve the main page
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Endpoint for exchanging public keys
app.post('/exchange-key', (req, res) => {
  const { clientPublicKey } = req.body;
  // Implement secure exchange logic here
  res.json({ publicKey });
});

// Middleware to authenticate token
function authenticateToken(req, res, next) {
  const token = req.headers['authorization'];
  if (!token) return res.status(401).send('Access denied');

  jwt.verify(token, 'secret', (err, user) => {
    if (err) return res.status(403).send('Invalid token');
    req.user = user;
    next();
  });
}

// Endpoint for sending a message
app.post('/send-message', authenticateToken, async (req, res) => {
  const { sender, message, key, receiver, iv } = req.body;

  if (!message || !key || !receiver || !iv) {
    return res.status(400).send('Missing required fields');
  }

  try {
    // Convert key and iv from hex to Buffer
    const keyBuffer = Buffer.from(key, 'hex');
    const ivBuffer = Buffer.from(iv, 'hex');

    // Decrypt the message using the provided key and iv
    const decryptedMessage = decryptMessage(message, keyBuffer.toString('hex'), ivBuffer.toString('hex'));
    console.log(decryptedMessage);

    // Save the encrypted message to MongoDB
    const newMessage = new Message({
      sender, // This is the sender's ID
      receiver, // Save receiver as it is, no encryption applied
      encryptedData: message,
      iv: iv,
      key: key,
    });

    await newMessage.save();

    res.json({ message: 'Message sent and saved securely' });
  } catch (error) {
    console.error('Error sending message:', error);
    res.status(500).send('Internal Server Error');
  }
});





// Endpoint to retrieve messages for authenticated user
app.get('/messages', authenticateToken, async (req, res) => {
  try {
    const username = req.headers['username'];
    const messages = await Message.find({
      $or: [{ sender: username }, { receiver: username }],
    });
    res.json(messages);
  } catch (error) {
    console.error('Error retrieving messages:', error);
    res.status(500).send('Internal Server Error');
  }
});

app.get('/decrypt-messages', async (req, res) => {
  try {
    const key = req.headers['key'];
    const iv = req.headers['iv'];
    const data = req.headers['data'];

    const keyBuffer = Buffer.from(key, 'hex');
    const ivBuffer = Buffer.from(iv, 'hex');

    // Decrypt the message using the provided key and iv
    const message = decryptMessage(data, keyBuffer.toString('hex'), ivBuffer.toString('hex'));
    res.json(message);
    console.log(message)
  } catch (error) {
    console.error('Error retrieving messages:', error);
    res.status(500).send('Internal Server Error');
  }
});

// Route for authentication
app.use('/auth', authRoutes);

// Start the HTTPS server
https.createServer(options, app).listen(9001, () => {
  console.log('Secure server running on port 9001');
});


