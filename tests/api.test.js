const request = require('supertest');
const app = require('../app');
const { sequelize } = require('../config/db');

describe('API Tests', () => {
  beforeAll(async () => {
    await sequelize.sync({ force: true });
  });

  afterAll(async () => {
    await sequelize.close();
  });

  describe('Auth API', () => {
    it('should register a new user', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({
          email: 'test@example.com',
          password: 'password123',
          first_name: 'Test',
          last_name: 'User',
          role: 'student'
        });
      expect(res.statusCode).toEqual(201);
      expect(res.body).toHaveProperty('token');
    });

    it('should login a user', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'test@example.com',
          password: 'password123'
        });
      expect(res.statusCode).toEqual(200);
      expect(res.body).toHaveProperty('token');
    });
  });

  describe('User API', () => {
    let authToken;

    beforeAll(async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'test@example.com',
          password: 'password123'
        });
      authToken = res.body.token;
    });

    it('should get current user', async () => {
      const res = await request(app)
        .get('/api/auth/me')
        .set('Authorization', `Bearer ${authToken}`);
      expect(res.statusCode).toEqual(200);
      expect(res.body.email).toEqual('test@example.com');
    });

    it('should update user profile', async () => {
      const res = await request(app)
        .put('/api/users/1') // Assuming user_id is 1
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          first_name: 'Updated'
        });
      expect(res.statusCode).toEqual(200);
      expect(res.body.first_name).toEqual('Updated');
    });
  });
});