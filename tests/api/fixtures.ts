import { randomUUID } from 'node:crypto';
import { test as base } from '@playwright/test';
import { Booking, BookerClient } from './client';

/** A valid booking with a unique name, so parallel tests never see each other's data. */
export function newBookingData(): Booking {
  return {
    firstname: 'Test',
    lastname: `User-${randomUUID()}`,
    totalprice: 150,
    depositpaid: true,
    bookingdates: { checkin: '2027-01-10', checkout: '2027-01-15' },
    additionalneeds: 'Breakfast',
  };
}

type Fixtures = {
  /** Client whose created bookings are deleted after each test. */
  api: BookerClient;
  token: string;
  booking: { id: number; data: Booking };
};

export const test = base.extend<Fixtures>({
  api: async ({ request }, use) => {
    const api = new BookerClient(request);
    await use(api);
    await api.cleanup();
  },
  token: async ({ api }, use) => use(await api.token()),
  booking: async ({ api }, use) => {
    const data = newBookingData();
    const response = await api.createBooking(data);
    await use({ id: (await response.json()).bookingid, data });
  },
});

export { expect } from '@playwright/test';
