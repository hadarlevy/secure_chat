**Secure Chat App**

*User Manual:*

1. Setup
  Install Dependencies: Run npm install to install all necessary dependencies.
  MongoDB Setup: Ensure that MongoDB is running and accessible. Update the connection string in server.js if needed.
  SSL Configuration: Place your SSL certificate (server.cert) and key (server.key) in the root directory.
2. Running the Application
  Start the Server: Run node server.js to start the server. The application will be accessible at https://localhost:9001.
  Access the Application: Open a web browser and navigate to https://localhost:9001.
  User Registration: Enter a username and password and click "Register" to create a new account.
  Login: Enter your username and password and click "Login" to access the chat interface.
  Sending Messages: Enter the recipient's username and your message, then click "Send" to send an encrypted message.
  Viewing Messages: Click "Load Messages" to view your sent and received messages.
  Decrypting Messages: Click "Decrypt Messages" to view decrypted versions of your received messages.


*****************************************************************************************************

*Code Documentation:*

app.js
  - register(): Registers a new user by sending a POST request to /auth/register with the provided username and password. If registration is successful, the user is redirected to the chat page.
  - login(): Logs in an existing user by sending a POST request to /auth/login with the provided username and password. Upon successful login, a JWT token is saved, and the user is redirected to the chat page.
  - sendMessage(): Encrypts the message using AES-256-CBC and sends the encrypted message, key, and IV to the server via a POST request to /send-message.
  - loadMessages(): Retrieves all messages related to the user (both sent and received) from the server and displays them.
  - decryptClientMessages(): Fetches the messages and decrypts them using the server-side decryption endpoint.

server.js
  - authenticateToken: Middleware function to authenticate requests using JWT. If the token is invalid or missing, access is denied.
  - /send-message: Endpoint for sending an encrypted message. It decrypts the message for logging purposes and then saves the encrypted data, key, and IV to MongoDB.
  - /messages: Retrieves all messages sent or received by the authenticated user.
  - /decrypt-messages: Decrypts a message on the server side using the provided key and IV.

auth.js
  - /register: Registers a new user by hashing their password and saving the user to MongoDB.
  - /login: Authenticates a user by comparing the hashed password with the stored hash, and if successful, returns a JWT token.

encryption.js
  - encryptMessage: Encrypts a message using AES-256-CBC. Generates a new IV for each encryption to ensure security.
  - decryptMessage: Decrypts a message using AES-256-CBC.
