import { describe, it, expect } from 'vitest';
import request from 'supertest';
import { app } from '../../index';

describe('Product Routes', () => {
  describe('GET /products', () => {
    it('should return products list', async () => {
      const response = await request(app).get('/products');

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('status', 'success');
      expect(response.body).toHaveProperty('data');
      expect(Array.isArray(response.body.data)).toBe(true);
    });

    it('should support pagination', async () => {
      const response = await request(app)
        .get('/products')
        .query({ page: 1, limit: 10 });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('status', 'success');
      expect(response.body).toHaveProperty('data');
      expect(response.body).toHaveProperty('pagination');
    });
  });

  describe('GET /products/featured', () => {
    it('should return featured products', async () => {
      const response = await request(app).get('/products/featured');

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('status', 'success');
      expect(response.body).toHaveProperty('data');
      expect(Array.isArray(response.body.data)).toBe(true);
    });
  });

  describe('GET /products/trending', () => {
    it('should return trending products', async () => {
      const response = await request(app).get('/products/trending');

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('status', 'success');
      expect(response.body).toHaveProperty('data');
      expect(Array.isArray(response.body.data)).toBe(true);
    });
  });

  describe('GET /products/id/:id', () => {
    it('should return 404 for non-existent product', async () => {
      const response = await request(app).get(
        '/products/id/00000000-0000-0000-0000-000000000000'
      );

      expect(response.status).toBe(404);
    });
  });

  describe('GET /products/slug/:slug', () => {
    it('should return 404 for non-existent slug', async () => {
      const response = await request(app).get(
        '/products/slug/non-existent-slug'
      );

      expect(response.status).toBe(404);
    });
  });
});
