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
      // Save the username in local storage
      localStorage.setItem('username', username);
      // Redirect to chat page upon successful registration
      document.getElementById('register-login').style.display = 'none';
      document.getElementById('chat').style.display = 'block';
    })
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
    .then(res => {
      if (!res.ok) {
        return res.text().then(text => { throw new Error(text) });
      }
      return res.json();
    })
    .then(data => {
      token = data.token;
      // Save the username in local storage
      localStorage.setItem('username', username);
      document.getElementById('register-login').style.display = 'none';
      document.getElementById('chat').style.display = 'block';
    })
    .catch(error => alert(`Login failed: ${error.message}`));
}



// Function to send a message
async function sendMessage() {
  const receiver = document.getElementById('receiver').value;
  const message = document.getElementById('message').value;
  const username = localStorage.getItem('username');
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
      sender: username,
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
  const username = localStorage.getItem('username');
  fetch('/messages', {
    method: 'GET',
    headers: {
      'Authorization': token,
      'username': username
    },
  })
    .then(res => res.json())
    .then(messages => {
      // Get the content divs
      const sentMessagesContent = document.getElementById('sent-messages-content');
      const receivedMessagesContent = document.getElementById('received-messages-content');

      // Clear the message content, but keep the headers
      sentMessagesContent.innerHTML = '';
      receivedMessagesContent.innerHTML = '';

      messages.forEach(msg => {
        const messageElement = document.createElement('div');
        if (msg.sender === username) {
          messageElement.textContent = `To: ${msg.receiver}, Message: ${msg.encryptedData}`;
          sentMessagesContent.appendChild(messageElement);
        } else {
          messageElement.textContent = `From: ${msg.sender}, Message: ${msg.encryptedData}`;
          receivedMessagesContent.appendChild(messageElement);
        }
      });
    })
    .catch(error => console.error('Error loading messages:', error));
}

function decryptClientMessages() {
  const username = localStorage.getItem('username');
  fetch('/messages', {
    method: 'GET',
    headers: {
      'Authorization': token,
      'username': username
    },
  })
    .then(res => res.json())
    .then(messages => {
      // Get the content divs
      const sentMessagesContent = document.getElementById('sent-messages-content');
      const receivedMessagesContent = document.getElementById('received-messages-content');

      // Clear the message content, but keep the headers
      sentMessagesContent.innerHTML = '';
      receivedMessagesContent.innerHTML = '';

      messages.forEach(msg => {
        fetch('/decrypt-messages', {
          method: 'GET',
          headers: {
            'key': msg.key,
            'iv': msg.iv,
            'data': msg.encryptedData
          },
        })
          .then(res => res.json())
          .then(message => {
            const messageElement = document.createElement('div');
            // Convert key and iv from hex to Buffer

            if (msg.sender === username) {
              messageElement.textContent = `To: ${msg.receiver}, Message: ${message}`;
              sentMessagesContent.appendChild(messageElement);
            } else {
              messageElement.textContent = `From: ${msg.sender}, Message: ${message}`;
              receivedMessagesContent.appendChild(messageElement);
            }
          });
      })
    })
    .catch(error => console.error('Error loading messages:', error));
}

