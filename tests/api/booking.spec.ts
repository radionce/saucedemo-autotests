import { test, expect, newBookingData } from './fixtures';
import { Booking, bookingSchema } from './client';

test('a created booking reads back exactly as it was sent', async ({ api }) => {
  const data = newBookingData();

  const created = await api.createBooking(data);
  expect(created.status()).toBe(200);
  const { bookingid, booking } = await created.json();
  expect(booking).toEqual(data);

  const fetched = await api.getBooking(bookingid);
  expect(fetched.status()).toBe(200);
  expect(await fetched.json()).toEqual(data);
});

test('filtering by name returns the created booking', async ({ api, booking }) => {
  const { firstname, lastname } = booking.data;
  const response = await api.getBookingIds({ firstname, lastname });
  expect(response.status()).toBe(200);
  expect(await response.json()).toContainEqual({ bookingid: booking.id });
});

test('a booking response matches the schema', async ({ api, booking }) => {
  const response = await api.getBooking(booking.id);
  const result = bookingSchema.safeParse(await response.json());
  expect(result.error).toBeUndefined();
});

test('PUT with a token replaces the booking', async ({ api, token, booking }) => {
  const update = { ...newBookingData(), totalprice: 275, depositpaid: false };

  const response = await api.updateBooking(booking.id, update, token);
  expect(response.status()).toBe(200);
  expect(await (await api.getBooking(booking.id)).json()).toEqual(update);
});

test('PATCH with a token changes only the sent fields', async ({ api, token, booking }) => {
  const response = await api.partialUpdateBooking(booking.id, { totalprice: 999 }, token);
  expect(response.status()).toBe(200);
  expect(await (await api.getBooking(booking.id)).json()).toEqual({
    ...booking.data,
    totalprice: 999,
  });
});

test('PUT without a token is rejected and changes nothing', async ({ api, booking }) => {
  const response = await api.updateBooking(booking.id, newBookingData());
  expect(response.status()).toBe(403);
  expect(await (await api.getBooking(booking.id)).json()).toEqual(booking.data);
});

test('PATCH without a token is rejected and changes nothing', async ({ api, booking }) => {
  const response = await api.partialUpdateBooking(booking.id, { totalprice: 999 });
  expect(response.status()).toBe(403);
  expect(await (await api.getBooking(booking.id)).json()).toEqual(booking.data);
});

test('DELETE with a token removes the booking', async ({ api, token, booking }) => {
  const response = await api.deleteBooking(booking.id, token);
  // 201 for a delete is unusual, but it is what the API documents.
  expect(response.status()).toBe(201);
  expect((await api.getBooking(booking.id)).status()).toBe(404);
});

test('a malformed JSON body is rejected with 400', async ({ api }) => {
  const response = await api.createBooking('{"firstname": ');
  expect(response.status()).toBe(400);
});

// API defects below. Each test asserts the correct behaviour and is marked expected-to-fail,
// so it flips to a hard failure the day the API is fixed.

// Actual: 500 Internal Server Error. Bad client input should not look like a server crash.
test.fail('a missing required field is rejected with 400', async ({ api }) => {
  const data: Partial<Booking> = newBookingData();
  delete data.firstname;
  const response = await api.createBooking(data);
  expect(response.status()).toBe(400);
});

// Actual: 200 OK, and the booking is stored with `totalprice: null`.
test.fail('a non-numeric total price is rejected with 400', async ({ api }) => {
  const response = await api.createBooking({ ...newBookingData(), totalprice: 'abc' });
  expect(response.status()).toBe(400);
});

// Actual: 200 OK, and the dates are stored as the corrupted string "0NaN-aN-aN".
test.fail('an invalid date is rejected with 400', async ({ api }) => {
  const response = await api.createBooking({
    ...newBookingData(),
    bookingdates: { checkin: 'not-a-date', checkout: 'not-a-date' },
  });
  expect(response.status()).toBe(400);
});
