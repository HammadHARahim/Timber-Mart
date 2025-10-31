import { body, validationResult } from 'express-validator';

describe('Validation Rules', () => {
  test('customer name validation - too short', async () => {
    const req = {
      body: { name: 'A' }
    };

    await body('name')
      .trim()
      .notEmpty()
      .isLength({ min: 2, max: 100 })
      .run(req);

    const errors = validationResult(req);
    expect(errors.isEmpty()).toBe(false);
  });

  test('customer name validation - valid', async () => {
    const req = {
      body: { name: 'John Doe' }
    };

    await body('name')
      .trim()
      .notEmpty()
      .isLength({ min: 2, max: 100 })
      .run(req);

    const errors = validationResult(req);
    expect(errors.isEmpty()).toBe(true);
  });

  test('email validation - invalid format', async () => {
    const req = {
      body: { email: 'not-an-email' }
    };

    await body('email')
      .isEmail()
      .run(req);

    const errors = validationResult(req);
    expect(errors.isEmpty()).toBe(false);
  });

  test('email validation - valid format', async () => {
    const req = {
      body: { email: 'test@example.com' }
    };

    await body('email')
      .isEmail()
      .run(req);

    const errors = validationResult(req);
    expect(errors.isEmpty()).toBe(true);
  });

  test('amount validation - negative number', async () => {
    const req = {
      body: { amount: -10 }
    };

    await body('amount')
      .isFloat({ min: 0.01 })
      .run(req);

    const errors = validationResult(req);
    expect(errors.isEmpty()).toBe(false);
  });

  test('amount validation - valid number', async () => {
    const req = {
      body: { amount: 100.50 }
    };

    await body('amount')
      .isFloat({ min: 0.01 })
      .run(req);

    const errors = validationResult(req);
    expect(errors.isEmpty()).toBe(true);
  });
});
