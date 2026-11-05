import { APIRequestContext } from '@playwright/test';
import { z } from 'zod';

// Public demo credentials from the Restful Booker docs. Override through the environment.
const USERNAME = process.env.BOOKER_USERNAME ?? 'admin';
const PASSWORD = process.env.BOOKER_PASSWORD ?? 'password123';

const isoDate = z.string().regex(/^\d{4}-\d{2}-\d{2}$/);

export const bookingSchema = z.strictObject({
  firstname: z.string(),
  lastname: z.string(),
  totalprice: z.number(),
  depositpaid: z.boolean(),
  bookingdates: z.strictObject({ checkin: isoDate, checkout: isoDate }),
  additionalneeds: z.string().optional(),
});

export type Booking = z.infer<typeof bookingSchema>;

const JSON_BODY = { 'Content-Type': 'application/json' };
const auth = (token?: string): Record<string, string> =>
  token ? { Cookie: `token=${token}` } : {};

/** Returns raw responses so tests can assert statuses, including the failing ones. */
export class BookerClient {
  private readonly createdIds: number[] = [];

  constructor(private readonly request: APIRequestContext) {}

  ping() {
    return this.request.get('/ping');
  }

  createToken(username = USERNAME, password = PASSWORD) {
    return this.request.post('/auth', { data: { username, password } });
  }

  async token(): Promise<string> {
    return (await (await this.createToken()).json()).token;
  }

  getBookingIds(filter?: { firstname?: string; lastname?: string }) {
    return this.request.get('/booking', { params: filter });
  }

  getBooking(id: number) {
    return this.request.get(`/booking/${id}`);
  }

  /** Takes `unknown` because negative tests send invalid bodies on purpose. */
  async createBooking(data: unknown) {
    const response = await this.request.post('/booking', { data, headers: JSON_BODY });
    if (response.ok()) this.createdIds.push((await response.json()).bookingid);
    return response;
  }

  updateBooking(id: number, data: Booking, token?: string) {
    return this.request.put(`/booking/${id}`, { data, headers: auth(token) });
  }

  partialUpdateBooking(id: number, data: Partial<Booking>, token?: string) {
    return this.request.patch(`/booking/${id}`, { data, headers: auth(token) });
  }

  deleteBooking(id: number, token?: string) {
    return this.request.delete(`/booking/${id}`, { headers: auth(token) });
  }

  /** Deletes everything this client created. Bookings a test already deleted just return 405. */
  async cleanup() {
    if (this.createdIds.length === 0) return;
    const token = await this.token();
    await Promise.all(this.createdIds.map((id) => this.deleteBooking(id, token)));
  }
}
