# CraftyWrap

<p align="center">
  <img src="frontend/public/logo.png" alt="CraftyWrap logo" width="160" />
</p>

<p align="center">
  A full-stack storefront for handmade crochet and yarn creations.
</p>

CraftyWrap lets customers browse handcrafted products, build a cart, place an order, request a custom design, and manage their account. Store administrators have a protected dashboard for managing catalogue data, promotions, orders, reviews, and users.

## Highlights

- Responsive product catalogue with filtering, search, sorting, product details, related products, reviews, and wishlists.
- Persistent guest and signed-in carts, including guest-cart merging after authentication.
- Account registration, JWT sign-in, a Google ID-token authentication endpoint, saved addresses, and order history.
- Checkout for guests and customers, promo-code validation, gift wrapping, UPI/manual payment, and Razorpay payment verification.
- Custom-order requests with optional JPEG, PNG, or WebP reference images stored in Cloudinary.
- Role-based administration for products, themes, product types, promotional codes, orders, reviews, custom orders, and users.
- Automatic initial catalogue seeding when the connected database has no products.

## Stack

| Layer | Technology |
| --- | --- |
| Client | Next.js 14, React 18, TypeScript, Tailwind CSS, Framer Motion |
| Server | Express 5, TypeScript, Mongoose |
| Database | MongoDB |
| Authentication | JWT, bcrypt, Google Identity token verification |
| Payments | Razorpay |
| Media uploads | Multer (memory storage) and Cloudinary |

## Project layout

```text
CraftyWrap/
├── frontend/                 # Next.js storefront and admin interface
│   ├── src/app/              # Routes: home, collections, cart, checkout, account, admin
│   ├── src/components/       # Reusable UI, loading states, and animations
│   ├── src/context/          # Cart and authenticated-user state
│   └── .env.example          # Public client configuration template
└── backend/                  # Express API
    ├── src/controllers/      # Request handlers and validation schemas
    ├── src/models/           # Mongoose documents
    ├── src/routes/           # API route definitions
    ├── src/services/         # Cart, order, and promotion business logic
    ├── src/seed/             # Upsert-based catalogue seed data
    └── .env.example          # Server configuration template
```

## Prerequisites

- Node.js 20 LTS or newer
- npm 9 or newer
- A MongoDB database (Atlas or local)

Optional integrations:

- Razorpay API keys for online card/UPI payment collection
- Google OAuth client ID for Google ID-token authentication
- Cloudinary credentials for custom-order and review image uploads

## Run locally

1. Install dependencies from the repository root:

   ```powershell
   npm --prefix backend install
   npm --prefix frontend install
   ```

2. Create local environment files:

   ```powershell
   Copy-Item backend/.env.example backend/.env
   Copy-Item frontend/.env.example frontend/.env.local
   ```

3. Set `MONGODB_URI` and a long, unique `JWT_SECRET` in `backend/.env`. Add the optional provider credentials if those integrations will be used.

4. Start the API in one terminal:

   ```powershell
   cd backend
   npm run dev
   ```

5. Start the storefront in another terminal:

   ```powershell
   cd frontend
   npm run dev
   ```

Open [http://localhost:3000](http://localhost:3000). The API health endpoint is available at [http://localhost:5000/health](http://localhost:5000/health).

On its first successful database connection, the backend adds the sample product types, themes, products, and the `CRAFTY10` promo code if the product collection is empty. To apply the supplied seed values again, run:

```powershell
cd backend
npm run seed
```

The seed process upserts its named product types, design themes, products, and default promo code; do not use it if you do not want those records refreshed to the supplied values.

## Environment configuration

### `backend/.env`

| Variable | Required | Description |
| --- | :---: | --- |
| `MONGODB_URI` | Yes | MongoDB connection string. |
| `JWT_SECRET` | Yes | Long random secret used to sign access tokens. |
| `FRONTEND_ORIGIN` | Yes | Allowed client origin(s), comma-separated. Defaults to `http://localhost:3000`. |
| `PORT` | No | API port. Defaults to `5000`. |
| `GOOGLE_CLIENT_ID` | For Google authentication | OAuth web client ID used to verify Google ID tokens. |
| `RAZORPAY_KEY_ID` | For Razorpay | Razorpay key ID used to create payment orders. |
| `RAZORPAY_KEY_SECRET` | For Razorpay | Razorpay secret used to create and verify payment orders. |
| `CLOUDINARY_CLOUD_NAME` | For image uploads | Cloudinary cloud name. |
| `CLOUDINARY_API_KEY` | For image uploads | Cloudinary API key. |
| `CLOUDINARY_API_SECRET` | For image uploads | Cloudinary API secret. |

### `frontend/.env.local`

| Variable | Required | Description |
| --- | :---: | --- |
| `NEXT_PUBLIC_API_URL` | Yes | API base URL, normally `http://localhost:5000/api`. |
| `NEXT_PUBLIC_GOOGLE_CLIENT_ID` | For a Google sign-in UI | Same Google web client ID used by the API. |
| `NEXT_PUBLIC_RAZORPAY_KEY_ID` | For Razorpay checkout | Public Razorpay key ID. Never place the Razorpay secret here. |

`NEXT_PUBLIC_*` values are bundled into the browser. Keep all secrets—including `JWT_SECRET`, Razorpay secret, and Cloudinary secret—only in `backend/.env`.

> **Google authentication note:** The API can verify a Google ID token at `POST /api/auth/google`, but the current storefront does not initialize the Google Identity library or obtain that token itself. Add that client integration before presenting Google sign-in as a working customer flow.

## Application routes

| Route | Purpose |
| --- | --- |
| `/` | Landing page with featured products and themes. |
| `/collections` | Searchable and filterable catalogue. |
| `/products/[id]` | Product details, related items, and reviews. |
| `/cart` | Shopping cart, gift options, and promotion codes. |
| `/checkout` | Shipping details and payment flow. |
| `/custom-order` | Custom handmade-item request form. |
| `/login` and `/signup` | Customer authentication. |
| `/account` | Profile, addresses, wishlist, order history, and custom-order history. |
| `/admin` | Protected store management dashboard for administrators. |

## API overview

All API endpoints are rooted at `/api` and return the following envelope:

```json
{
  "success": true,
  "message": "Human-readable result",
  "data": {}
}
```

Protected endpoints use a bearer token:

```http
Authorization: Bearer <access-token>
```

Guest cart and checkout calls identify a browser cart with:

```http
X-Cart-Token: <client-generated-token>
```

| Resource | Main endpoints |
| --- | --- |
| Authentication | `POST /auth/register`, `POST /auth/login`, `POST /auth/google` |
| User account | `GET/PATCH /users/me`, `GET/PUT /users/me/wishlist/:productId`, `GET /users/me/wishlist` |
| Products | `GET/POST /products`, `GET /products/autocomplete`, `GET /products/:slug`, `GET /products/:slug/related`, `PATCH/DELETE /products/:productId` |
| Product metadata | `GET/POST /product-types`, `GET/POST /design-themes` plus admin `PATCH/DELETE` operations |
| Cart | `GET /carts/current`, `POST /carts/items`, `PATCH/DELETE /carts/items/:productId`, `PATCH/DELETE /carts/current`, `POST /carts/merge` |
| Orders | `POST /orders/checkout`, `POST /orders/:orderId/verify-payment`, `GET /orders/me`, admin `GET/PATCH /orders` |
| Custom orders | `POST /custom-orders`, `GET /custom-orders/me`, and admin list/update operations |
| Reviews | `GET /reviews/product/:slug`, `POST /reviews/product/:slug`, plus admin list/update/delete operations |
| Promotions | `POST /promo-codes/validate`, plus admin CRUD endpoints |
| Newsletter | `POST /newsletter` |

The admin operations require a token belonging to a user whose `role` is `admin`. New registrations are created as `customer` users; an existing admin can promote a user from the Users section of `/admin`.

## Payments and uploads

Checkout supports `razorpay` and `upi_manual` payment methods. When valid Razorpay server credentials are configured, Razorpay orders are created and payment signatures are verified by the API. Without those credentials, use `upi_manual` for a local/demo flow; Razorpay verification will not be available.

Custom-order reference images and review images are limited to JPEG, PNG, or WebP files up to 10 MB. Uploading an image requires valid Cloudinary server credentials.

## Production build

Build each service independently:

```powershell
cd backend
npm run build
npm start
```

```powershell
cd frontend
npm run build
npm start
```

Before deployment, update `FRONTEND_ORIGIN` and `NEXT_PUBLIC_API_URL` to the production URLs, configure the same Google client ID on both services, and add the production Razorpay and Cloudinary credentials as needed.

## Operational notes

- CORS permits only the origins listed in `FRONTEND_ORIGIN` (or requests without an `Origin` header).
- Access tokens and guest cart tokens are stored in browser local storage by the storefront.
- Product deletion is implemented as deactivation, which preserves order references while removing the item from the active catalogue.
- The MongoDB connection must support transactions for checkout stock updates; use a replica set deployment such as MongoDB Atlas.

## Available scripts

| Directory | Command | Description |
| --- | --- | --- |
| `frontend` | `npm run dev` | Start the Next.js development server. |
| `frontend` | `npm run build` | Create a production client build. |
| `frontend` | `npm start` | Serve the built client. |
| `frontend` | `npm run lint` | Run the configured Next.js lint command. |
| `backend` | `npm run dev` | Start the API with automatic TypeScript reloads. |
| `backend` | `npm run build` | Compile TypeScript to `dist/`. |
| `backend` | `npm start` | Run the compiled API. |
| `backend` | `npm run seed` | Upsert the supplied catalogue data. |

## Security checklist

- Do not commit `.env`, `.env.local`, provider secrets, or production database URLs.
- Use a unique, high-entropy `JWT_SECRET` for every deployed environment.
- Restrict Google OAuth, Razorpay, Cloudinary, MongoDB, and CORS settings to the deployed domains and least required permissions.
- Enable TLS for the frontend, API, and database connections in production.
