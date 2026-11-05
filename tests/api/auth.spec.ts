import { test, expect } from './fixtures';

test('GET /ping reports the service is up', async ({ api }) => {
  const response = await api.ping();
  // 201 for a health check is unusual, but it is what the API documents.
  expect(response.status()).toBe(201);
});

test('valid credentials return a token', async ({ api }) => {
  const response = await api.createToken();
  expect(response.status()).toBe(200);
  expect((await response.json()).token).toEqual(expect.any(String));
});

test('invalid credentials return the bad credentials reason and no token', async ({ api }) => {
  const response = await api.createToken('admin', 'wrong_password');
  expect(await response.json()).toEqual({ reason: 'Bad credentials' });
});

// API defect: a failed login answers 200 OK, so clients have to inspect the body to
// notice it failed. Asserted as the correct behaviour and marked expected-to-fail.
test.fail('invalid credentials are rejected with a 401 status', async ({ api }) => {
  const response = await api.createToken('admin', 'wrong_password');
  expect(response.status()).toBe(401);
});
