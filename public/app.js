let token = '';

// Function to register a new user
function register() {
  const username = document.getElementById('username').value;
  const password = document.getElementById('password').value;

  fetch('/auth/register', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ username, password }),
  })
    .then(res => {
      if (!res.ok) {
        return res.text().then(text => { throw new Error(text) });
      }
      return res.text();
    })
    .then(data => alert(data))
    .catch(error => alert(`Registration failed: ${error.message}`));
}

// Function to log in a user
function login() {
  const username = document.getElementById('username').value;
  const password = document.getElementById('password').value;

  fetch('/auth/login', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ username, password }),
  })
    .then(res => res.json())
    .then(data => {
      token = data.token;
      document.getElementById('register-login').style.display = 'none';
      document.getElementById('chat').style.display = 'block';
    });
}

// Function to send a message
async function sendMessage() {
  const receiver = document.getElementById('receiver').value;
  const message = document.getElementById('message').value;

  // Generate a 256-bit key for AES encryption
  const key = await crypto.subtle.generateKey(
    {
      name: 'AES-CBC',
      length: 256,
    },
    true,
    ['encrypt', 'decrypt']
  );

  // Export the key to a format suitable for sending to the server
  const keyBuffer = await crypto.subtle.exportKey('raw', key);
  const keyHex = Array.from(new Uint8Array(keyBuffer)).map(byte => byte.toString(16).padStart(2, '0')).join('');

  // Encrypt the message using the generated key
  const iv = crypto.getRandomValues(new Uint8Array(16)); // Generate a random initialization vector
  const encodedMessage = new TextEncoder().encode(message);

  const encryptedMessage = await crypto.subtle.encrypt(
    {
      name: 'AES-CBC',
      iv: iv,
    },
    key,
    encodedMessage
  );

  // Convert encrypted message to hex
  const encryptedMessageHex = Array.from(new Uint8Array(encryptedMessage)).map(byte => byte.toString(16).padStart(2, '0')).join('');
  const ivHex = Array.from(iv).map(byte => byte.toString(16).padStart(2, '0')).join('');

  fetch('/send-message', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': token,
    },
    body: JSON.stringify({
      message: encryptedMessageHex,
      key: keyHex,
      receiver,
      iv: ivHex
    }),
  })
    .then(res => {
      if (!res.ok) {
        return res.text().then(text => { throw new Error(text) });
      }
      return res.json();
    })
    .then(data => {
      alert(data.message);
      loadMessages();
    })
    .catch(error => alert(`Sending message failed: ${error.message}`));
}



// Function to load and display messages
function loadMessages() {
  fetch('/messages', {
    method: 'GET',
    headers: {
      'Authorization': token,
    },
  })
    .then(res => res.json())
    .then(messages => {
      const messageBox = document.getElementById('message-box');
      messageBox.innerHTML = '';
      messages.forEach(msg => {
        const messageElement = document.createElement('div');
        messageElement.textContent = `From: ${msg.sender}, To: ${msg.receiver}, Message: ${msg.encryptedData}`;
        messageBox.appendChild(messageElement);
      });
    });
}
