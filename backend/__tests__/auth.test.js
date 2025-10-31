import request from 'supertest';
import express from 'express';
import { generateAccessToken, generateRefreshToken, verifyAccessToken } from '../utils/tokenUtils.js';

describe('Token Utils', () => {
  test('generateAccessToken creates valid token', () => {
    const user = {
      id: 1,
      username: 'testuser',
      role: 'ADMIN',
      email: 'test@test.com',
      permissions: ['*']
    };

    const token = generateAccessToken(user);
    expect(token).toBeTruthy();
    expect(typeof token).toBe('string');
  });

  test('verifyAccessToken validates token correctly', () => {
    const user = {
      id: 1,
      username: 'testuser',
      role: 'ADMIN',
      email: 'test@test.com',
      permissions: ['*']
    };

    const token = generateAccessToken(user);
    const decoded = verifyAccessToken(token);

    expect(decoded).toBeTruthy();
    expect(decoded.id).toBe(user.id);
    expect(decoded.username).toBe(user.username);
  });

  test('verifyAccessToken returns null for invalid token', () => {
    const decoded = verifyAccessToken('invalid-token');
    expect(decoded).toBeNull();
  });

  test('generateRefreshToken creates random token', () => {
    const token1 = generateRefreshToken();
    const token2 = generateRefreshToken();

    expect(token1).toBeTruthy();
    expect(token2).toBeTruthy();
    expect(token1).not.toBe(token2);
    expect(token1.length).toBeGreaterThan(50);
  });
});
