

import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import request from 'supertest';
import app from '../../src/index';
import User from '../../src/modules/user/user.model';

let mongoServer: MongoMemoryServer;

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  const mongoUri = mongoServer.getUri();
  await mongoose.connect(mongoUri);
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

afterEach(async () => {
  await User.deleteMany({});
});

describe('User API Integration Tests', () => {
  it('should create a user', async () => {
    const response = await request(app).post('/user').send({
      email: 'john@example.com',
      password: 'password123',
      confirmPassword: 'password123',
      firstname: 'John',
      lastname: 'Doe',
    });
    console.log(response.body);

    expect(response.status).toBe(201);
    // expect(response.body).toHaveProperty('_id');
    // expect(response.body.email).toBe('john@example.com');
  });

  it(' email not valid ', async () => {
    const response = await request(app).post('/user').send({
      email: 'john',
      password: 'password123',
      confirmPassword: 'password123',
      firstname: 'John',
      lastname: 'Doe',
    });
    console.log(response.body);

    expect(response.status).toBe(201);
    // expect(response.body).toHaveProperty('_id');
    // expect(response.body.email).toBe('john@example.com');
  });

  // it('should get all users', async () => {
  //   // Insert a user for testing
  //   const user = new User({ name: 'Jane Doe', email: 'jane@example.com' });
  //   await user.save();
  //
  //   const response = await request(app).get('/api/users');
  //   expect(response.status).toBe(200);
  //   expect(response.body.length).toBe(1);
  //   expect(response.body[0].name).toBe('Jane Doe');
  //   expect(response.body[0].email).toBe('jane@example.com');
  // });
});

