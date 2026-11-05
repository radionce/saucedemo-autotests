# SauceDemo Autotests

Playwright + TypeScript test automation: UI tests for [SauceDemo](https://www.saucedemo.com) on three browsers, and API tests for [Restful Booker](https://restful-booker.herokuapp.com/apidoc/index.html).

[![Tests](https://github.com/radionce/saucedemo-autotests/actions/workflows/tests.yml/badge.svg)](https://github.com/radionce/saucedemo-autotests/actions/workflows/tests.yml) · [Latest HTML report](https://radionce.github.io/saucedemo-autotests/)

## What is covered

38 UI tests run on Chromium, Firefox and WebKit. 16 API tests run without a browser.

| Area          | What is tested                                                                     | Tests |
| ------------- | ---------------------------------------------------------------------------------- | ----- |
| UI: login     | Valid login, wrong and missing credentials, locked-out user, logged-out redirects  | 9     |
| UI: inventory | Catalog data, images per user, unknown product id                                  | 4     |
| UI: sorting   | Full list order for name A to Z, Z to A, price low to high, high to low            | 4     |
| UI: item page | Same name and price as the inventory, add and remove update the badge              | 2     |
| UI: cart      | Badge, cart rows, removing items, continue shopping, cart after logout             | 9     |
| UI: checkout  | Full order, field validation, cancel on both steps, order totals compared in cents | 7     |
| UI: special   | `problem_user`, `error_user`, `performance_glitch_user`                            | 3     |
| API: auth     | Health check, token creation, bad credentials                                      | 4     |
| API: bookings | CRUD, filtering, token enforcement, schema, invalid input                          | 12    |

## Known defects found

Each case is an expected-fail test: it asserts the correct behaviour and turns into a hard failure as soon as the behaviour is fixed.

| What is wrong                   | Expected                  | Actual                                   | Test                                                               |
| ------------------------------- | ------------------------- | ---------------------------------------- | ------------------------------------------------------------------ |
| SauceDemo: cart survives logout | Next login has empty cart | Previous session's items are still there | `cart.spec.ts`: cart contents do not survive a logout              |
| Booker: failed login status     | 401                       | 200 with `{"reason":"Bad credentials"}`  | `auth.spec.ts`: invalid credentials are rejected with a 401 status |
| Booker: missing required field  | 400                       | 500                                      | `booking.spec.ts`: a missing required field is rejected with 400   |
| Booker: non-numeric total price | 400                       | 200, stored as `totalprice: null`        | `booking.spec.ts`: a non-numeric total price is rejected with 400  |
| Booker: invalid date            | 400                       | 200, stored as `"0NaN-aN-aN"`            | `booking.spec.ts`: an invalid date is rejected with 400            |

SauceDemo also breaks two accounts on purpose, so these are site fixture behaviour rather than defects:

| Account        | Expected                     | Actual                                                | Test                                                                                  |
| -------------- | ---------------------------- | ----------------------------------------------------- | ------------------------------------------------------------------------------------- |
| `problem_user` | Last name stays in its field | Typing it overwrites the first name                   | `special-users.spec.ts`: problem_user: a typed last name stays in the last name field |
| `error_user`   | Finish places the order      | Finish throws a page error, the order is never placed | `special-users.spec.ts`: error_user: finish completes the order                       |

## Tech stack

Playwright, TypeScript, Page Object Model, Playwright fixtures, zod, ESLint, Prettier, GitHub Actions, GitHub Pages.

## Project structure

```
tests/
├── api/                  # Restful Booker suite
│   ├── client.ts         # typed client and booking schema
│   ├── fixtures.ts       # self-cleaning API fixtures
│   ├── auth.spec.ts
│   └── booking.spec.ts
├── data/                 # users and product catalog
├── pages/                # page objects and the header menu
├── fixtures.ts           # page-object fixtures and loggedInPage
└── *.spec.ts             # UI specs
```

## How to run

Prerequisite: Node 26 (see `.nvmrc`).

```bash
npm ci
npx playwright install
```

| Command                 | What it does                            |
| ----------------------- | --------------------------------------- |
| `npm test`              | All tests: 3 browsers and the API suite |
| `npm run test:chromium` | UI tests on Chromium only               |
| `npm run test:api`      | API tests only                          |
| `npm run typecheck`     | TypeScript check                        |
| `npm run lint`          | ESLint, zero warnings allowed           |
| `npm run format`        | Apply Prettier                          |
| `npm run format:check`  | Check formatting without changing files |
| `npm run report`        | Open the last HTML report               |

Run one file on one project:

```bash
npx playwright test tests/sorting.spec.ts --project=firefox
```

The API credentials default to the public demo values. Override them with `BOOKER_USERNAME` and `BOOKER_PASSWORD`.

## Design decisions

- **`data-test` locators:** they survive styling and copy changes, and they state what a test targets.
- **No sleeps:** tests rely on web-first assertions that retry until the page is ready. SauceDemo updates the URL before it swaps the DOM, so tests wait on an element unique to the next page before using a test id that both pages share.
- **Flakiness:** retries run only in CI, so a flaky test shows up locally instead of being hidden. CI keeps a trace on the first retry, plus a screenshot and video for each failure.
- **Expected-fail tests:** a defect stays visible and documented without turning the build red, and the test alerts us when the behaviour changes.
- **Independent API tests:** each test creates uniquely named data and a fixture deletes it afterwards, so tests can run in any order and in parallel.
- **Live sites:** both targets are public demos outside this project's control. The nightly CI run catches changes on their side.

## Author

Yaroslav Radko · [LinkedIn](https://linkedin.com/in/yaroslavradko)
