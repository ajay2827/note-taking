// userController.test.js

const chai = require('chai');
const chaiHttp = require('chai-http');
const sinon = require('sinon');
const app = require('../index');
const User = require('../models/User');
const bcrypt = require('bcrypt');
const { expect } = chai;

chai.use(chaiHttp);

describe('User Controller', () => {
  describe('User Registration', () => {
    beforeEach(() => {
      sinon.restore();
    });

    it('should return an error for missing credentials', async () => {
      const userData = {
        // Incomplete data, missing credentials
      };

      const res = await chai.request(app).post('/api/v1/user').send(userData);

      expect(res).to.have.status(404);
    });

    it('should return an error for an existing user', async () => {
      const userData = {
        name: 'Existing User',
        email: 'existing@example.com',
        password: 'existingpassword',
      };

      sinon.stub(User, 'findOne').resolves({ ...userData });

      const res = await chai.request(app).post('/api/v1/user').send(userData);

      expect(res).to.have.status(404);
    });
  });

  describe('User Login', () => {
    beforeEach(() => {
      sinon.restore();
    });

    it('should login a user with correct credentials', async () => {
      const userData = {
        email: 'test@example.com',
        password: 'testpassword',
      };

      const user = {
        _id: 'mockedUserID',
        ...userData,
      };

      sinon.stub(User, 'findOne').resolves(user);
      sinon.stub(bcrypt, 'compare').resolves(true);

      const res = await chai
        .request(app)
        .post('/api/v1/user/login')
        .send(userData);

      expect(res).to.have.status(200);
      expect(res.body).to.have.property('user');
      expect(res.body).to.have.property('token');
    });

    it('should return an error for missing credentials', async () => {
      const userData = {
        // Incomplete data, missing credentials
      };

      const res = await chai
        .request(app)
        .post('/api/v1/user/login')
        .send(userData);

      expect(res).to.have.status(400);
    });

    it('should return an error for an invalid email', async () => {
      const userData = {
        email: 'nonexistent@example.com',
        password: 'somepassword',
      };

      sinon.stub(User, 'findOne').resolves(null);

      const res = await chai
        .request(app)
        .post('/api/v1/user/login')
        .send(userData);

      expect(res).to.have.status(401);
    });

    it('should return an error for incorrect password', async () => {
      const userData = {
        email: 'test@example.com',
        password: 'wrongpassword',
      };

      sinon.stub(User, 'findOne').resolves({ email: userData.email });
      sinon.stub(bcrypt, 'compare').resolves(false);

      const res = await chai
        .request(app)
        .post('/api/v1/user/login')
        .send(userData);

      expect(res).to.have.status(401);
    });
  });
});
