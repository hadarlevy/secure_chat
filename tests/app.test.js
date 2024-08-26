const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../server');  // Ensure the path is correct
let server;
const port = 9002;  // Change to a different port

describe('Auth Routes', () => {
  beforeAll(async () => {
    await mongoose.connect('mongodb+srv://hlev2454:passwordmongo@barknetcluster.ksy8pmw.mongodb.net/SecurityChat?retryWrites=true&w=majority', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    server = app.listen(port, () => {
      console.log(`Secure server running on port ${port}`);
    });
  });

  afterAll(async () => {
    await mongoose.disconnect();
    if (server) {
      server.close();
    }
  });

  test('User registration', async () => {
    const res = await request(app)
      .post('/auth/register')
      .send({ username: 'testuser', password: 'password' });

    expect(res.statusCode).toBe(200);
    expect(res.text).toBe('User registered successfully');
  });

  test('User login', async () => {
    const res = await request(app)
      .post('/auth/login')
      .send({ username: 'testuser', password: 'password' });

    expect(res.statusCode).toBe(200);
    expect(res.body.token).toBeDefined();
  });

  test('Invalid login', async () => {
    const res = await request(app)
      .post('/auth/login')
      .send({ username: 'testuser', password: 'wrongpassword' });

    expect(res.statusCode).toBe(401);
    expect(res.text).toBe('Invalid Username or Password');
  });
});
