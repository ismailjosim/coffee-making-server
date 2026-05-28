# Coffee Making Server: 10-Step Feature Plan

This backend already has products, orders, MongoDB, and an MVC folder style. The next goal is to grow it into a complete coffee ordering API. Since the frontend uses Firebase Auth, the backend does not need custom register/login/password/JWT logic. The backend should verify Firebase ID tokens, then use MongoDB for app-specific user profile, roles, carts, orders, reviews, and admin data.

## Current Project

Existing modules:

- `products`: create, read, update, delete, search by name.
- `orders`: create, read, update, delete.
- `database`: MongoDB connection with `products` and `orders` collections.

Existing routes:

- `GET /products`
- `GET /products/:id`
- `GET /products/search/:data`
- `POST /products`
- `PUT /products/:id`
- `DELETE /products/:id`
- `GET /orders`
- `GET /orders/:id`
- `POST /orders`
- `PUT /orders/:id`
- `DELETE /orders/:id`

## Step 1: Improve Products And Menu Data

Goal: Make products feel like real coffee shop menu items.

Build:

- Better product fields: slug, description, category, tags, sizes, add-ons, stock, rating, discount.
- Product validation before create/update.
- Pagination, sorting, and filtering.
- Partial search instead of exact name search.
- Featured and available product endpoints.

Product data:

```json
{
  "_id": "ObjectId",
  "name": "Caramel Latte",
  "slug": "caramel-latte",
  "categoryId": "ObjectId",
  "category": "latte",
  "description": "Smooth espresso with steamed milk and caramel syrup.",
  "details": "Medium roast espresso, milk, caramel syrup.",
  "price": 4.99,
  "discountPrice": 3.99,
  "currency": "USD",
  "photo": "https://example.com/caramel-latte.jpg",
  "taste": "sweet",
  "tags": ["hot", "milk", "sweet"],
  "sizes": [
    { "name": "small", "price": 3.99 },
    { "name": "medium", "price": 4.99 },
    { "name": "large", "price": 5.99 }
  ],
  "addons": [
    { "name": "extra shot", "price": 1 },
    { "name": "oat milk", "price": 0.75 }
  ],
  "stock": 50,
  "isAvailable": true,
  "isFeatured": false,
  "ratingAverage": 4.7,
  "ratingCount": 32,
  "createdAt": "Date",
  "updatedAt": "Date"
}
```

APIs:

- `GET /products?page=1&limit=10`
- `GET /products?category=latte&minPrice=2&maxPrice=8&sort=price`
- `GET /products/search?q=latte`
- `GET /products/slug/:slug`
- `GET /products/featured`
- `PATCH /products/:id/availability`

## Step 2: Categories And Menu Sections

Goal: Organize products into menu sections.

Build:

- Category CRUD.
- Product counts per category.
- Category sorting for frontend menu display.
- Active/inactive category control.

Category data:

```json
{
  "_id": "ObjectId",
  "name": "Latte",
  "slug": "latte",
  "description": "Milk-based espresso drinks.",
  "image": "https://example.com/latte.jpg",
  "isActive": true,
  "sortOrder": 1,
  "createdAt": "Date",
  "updatedAt": "Date"
}
```

APIs:

- `GET /categories`
- `GET /categories/:id`
- `POST /categories`
- `PUT /categories/:id`
- `DELETE /categories/:id`
- `GET /categories/:id/products`

## Step 3: Firebase Auth Middleware And User Profiles

Goal: Use Firebase Auth from the frontend, but still store app-specific user data in MongoDB.

Important: Do not build custom password login, password hashing, or backend JWT issuing. The frontend logs in with Firebase and sends the Firebase ID token to the backend:

```text
Authorization: Bearer <firebase-id-token>
```

Build:

- Install and configure `firebase-admin`.
- Create `verifyFirebaseToken` middleware.
- Read Firebase user info from the decoded token: `uid`, `email`, `name`, `picture`.
- Create or update a MongoDB user profile after first login.
- Store role in MongoDB: `customer`, `admin`, `staff`.
- Add role middleware for admin/staff routes.

User profile data:

```json
{
  "_id": "ObjectId",
  "firebaseUid": "firebase-user-uid",
  "name": "John Doe",
  "email": "john@example.com",
  "phone": "+10000000000",
  "role": "customer",
  "avatar": "https://example.com/avatar.jpg",
  "addresses": [
    {
      "label": "home",
      "street": "123 Main Street",
      "city": "Dhaka",
      "postalCode": "1207",
      "country": "Bangladesh",
      "isDefault": true
    }
  ],
  "isActive": true,
  "createdAt": "Date",
  "updatedAt": "Date"
}
```

APIs:

- `GET /users/me`
- `PATCH /users/me`
- `POST /users/me/addresses`
- `PATCH /users/me/addresses/:addressId`
- `DELETE /users/me/addresses/:addressId`
- `GET /users` for admin
- `PATCH /users/:id/role` for admin

Backend middleware idea:

```js
// request user after middleware
req.firebaseUser = {
  uid: decodedToken.uid,
  email: decodedToken.email,
  name: decodedToken.name
};
```

## Step 4: Cart

Goal: Let logged-in users build an order before checkout.

Build:

- One active cart per Firebase user.
- Add product to cart with size and add-ons.
- Update quantity.
- Remove item.
- Calculate subtotal, tax, delivery fee, discount, and total.

Cart data:

```json
{
  "_id": "ObjectId",
  "firebaseUid": "firebase-user-uid",
  "items": [
    {
      "productId": "ObjectId",
      "name": "Caramel Latte",
      "photo": "https://example.com/caramel-latte.jpg",
      "size": "medium",
      "addons": [
        { "name": "extra shot", "price": 1 }
      ],
      "unitPrice": 4.99,
      "quantity": 2,
      "lineTotal": 11.98
    }
  ],
  "subtotal": 11.98,
  "tax": 0.6,
  "deliveryFee": 2,
  "discount": 0,
  "total": 14.58,
  "updatedAt": "Date"
}
```

APIs:

- `GET /cart`
- `POST /cart/items`
- `PATCH /cart/items/:productId`
- `DELETE /cart/items/:productId`
- `DELETE /cart`

## Step 5: Checkout And Better Orders

Goal: Convert the cart into real orders with status tracking.

Build:

- Checkout API creates an order from the cart.
- Save product snapshots in the order so old orders do not change when product prices change.
- Order statuses: `pending`, `confirmed`, `preparing`, `ready`, `delivered`, `cancelled`.
- Payment statuses: `unpaid`, `paid`, `failed`, `refunded`.
- Users can see only their own orders.
- Admin/staff can update order status.

Order data:

```json
{
  "_id": "ObjectId",
  "orderNumber": "COF-2026-0001",
  "firebaseUid": "firebase-user-uid",
  "customer": {
    "name": "John Doe",
    "email": "john@example.com",
    "phone": "+10000000000"
  },
  "items": [
    {
      "productId": "ObjectId",
      "name": "Caramel Latte",
      "size": "medium",
      "addons": ["extra shot"],
      "unitPrice": 4.99,
      "quantity": 2,
      "lineTotal": 9.98
    }
  ],
  "subtotal": 9.98,
  "tax": 0.5,
  "deliveryFee": 2,
  "discount": 0,
  "total": 12.48,
  "status": "pending",
  "paymentStatus": "unpaid",
  "paymentMethod": "cash_on_delivery",
  "deliveryAddress": {
    "street": "123 Main Street",
    "city": "Dhaka",
    "postalCode": "1207"
  },
  "timeline": [
    {
      "status": "pending",
      "message": "Order placed",
      "createdAt": "Date"
    }
  ],
  "createdAt": "Date",
  "updatedAt": "Date"
}
```

APIs:

- `POST /orders/checkout`
- `GET /orders/my-orders`
- `GET /orders/:id`
- `PATCH /orders/:id/cancel`
- `GET /orders?status=pending&page=1&limit=20` for admin/staff
- `PATCH /orders/:id/status` for admin/staff

## Step 6: Payments And Coupons

Goal: Add real business checkout features.

Build:

- Start with cash on delivery.
- Store payment transaction records.
- Later add Stripe, SSLCommerz, or another payment provider.
- Add coupons with percentage/fixed discounts.
- Validate coupon usage and expiry.

Payment data:

```json
{
  "_id": "ObjectId",
  "orderId": "ObjectId",
  "firebaseUid": "firebase-user-uid",
  "provider": "cash_on_delivery",
  "transactionId": "optional-provider-transaction-id",
  "amount": 12.48,
  "currency": "USD",
  "status": "pending",
  "paidAt": "Date",
  "createdAt": "Date"
}
```

Coupon data:

```json
{
  "_id": "ObjectId",
  "code": "COFFEE20",
  "type": "percentage",
  "value": 20,
  "minimumOrderAmount": 10,
  "usageLimit": 100,
  "usedCount": 7,
  "startsAt": "Date",
  "expiresAt": "Date",
  "isActive": true,
  "createdAt": "Date"
}
```

APIs:

- `POST /payments/create`
- `POST /payments/verify`
- `GET /orders/:id/payment`
- `POST /coupons/validate`
- `POST /coupons` for admin
- `GET /coupons` for admin
- `PATCH /coupons/:id` for admin
- `DELETE /coupons/:id` for admin

## Step 7: Reviews, Ratings, And Favorites

Goal: Add customer engagement features.

Build:

- Users can review products they ordered.
- One review per user per product/order.
- Product rating average updates after review changes.
- Admin can hide inappropriate reviews.
- Users can favorite products.

Review data:

```json
{
  "_id": "ObjectId",
  "productId": "ObjectId",
  "firebaseUid": "firebase-user-uid",
  "orderId": "ObjectId",
  "rating": 5,
  "comment": "Great taste and perfect sweetness.",
  "isVisible": true,
  "createdAt": "Date",
  "updatedAt": "Date"
}
```

Favorite data:

```json
{
  "_id": "ObjectId",
  "firebaseUid": "firebase-user-uid",
  "productId": "ObjectId",
  "createdAt": "Date"
}
```

APIs:

- `GET /products/:id/reviews`
- `POST /products/:id/reviews`
- `PATCH /reviews/:id`
- `DELETE /reviews/:id`
- `PATCH /reviews/:id/visibility` for admin
- `GET /favorites`
- `POST /favorites/:productId`
- `DELETE /favorites/:productId`

## Step 8: Inventory And Notifications

Goal: Keep stock accurate and users informed.

Build:

- Reduce stock after successful checkout.
- Restore stock when an order is cancelled.
- Track stock changes in inventory logs.
- Show low-stock products to admin/staff.
- Store notifications when order status changes.
- Mark notifications as read.

Inventory log data:

```json
{
  "_id": "ObjectId",
  "productId": "ObjectId",
  "type": "order",
  "quantityChange": -2,
  "previousStock": 50,
  "newStock": 48,
  "reason": "Order COF-2026-0001",
  "createdByFirebaseUid": "firebase-user-uid",
  "createdAt": "Date"
}
```

Notification data:

```json
{
  "_id": "ObjectId",
  "firebaseUid": "firebase-user-uid",
  "type": "order_status",
  "title": "Order is preparing",
  "message": "Your order COF-2026-0001 is now being prepared.",
  "isRead": false,
  "metadata": {
    "orderId": "ObjectId"
  },
  "createdAt": "Date"
}
```

APIs:

- `GET /inventory/low-stock` for admin/staff
- `PATCH /inventory/products/:productId/stock` for admin/staff
- `GET /inventory/products/:productId/logs` for admin/staff
- `GET /notifications`
- `PATCH /notifications/:id/read`
- `PATCH /notifications/read-all`

## Step 9: Admin Dashboard And Analytics

Goal: Give the business owner useful management APIs.

Build:

- Dashboard summary.
- Recent orders.
- Sales report.
- Best-selling products.
- Low-stock report.
- User count and order count.

Dashboard response:

```json
{
  "totalProducts": 48,
  "totalOrders": 320,
  "totalUsers": 150,
  "totalRevenue": 2840.5,
  "pendingOrders": 12,
  "lowStockProducts": 5,
  "bestSellingProducts": [
    {
      "productId": "ObjectId",
      "name": "Caramel Latte",
      "sold": 84,
      "revenue": 419.16
    }
  ]
}
```

APIs:

- `GET /admin/dashboard`
- `GET /admin/stats/sales?from=2026-01-01&to=2026-01-31`
- `GET /admin/stats/products`
- `GET /admin/orders/recent`
- `GET /admin/products/low-stock`

## Step 10: Validation, Security, Testing, And Project Structure

Goal: Make the larger backend reliable and maintainable.

Build:

- Request validation with `zod` or `joi`.
- MongoDB ObjectId validation.
- Consistent error responses.
- Central async error handling.
- `helmet` for security headers.
- `express-rate-limit` for basic abuse protection.
- MongoDB indexes for search and common queries.
- Tests for products, Firebase-protected routes, cart, checkout, orders, and admin.

Recommended libraries:

- `firebase-admin` for Firebase token verification.
- `zod` or `joi` for validation.
- `helmet` for security headers.
- `express-rate-limit` for rate limiting.
- `jest` and `supertest` for tests.

Suggested indexes:

```js
db.products.createIndex({ name: "text", description: "text", tags: "text" });
db.products.createIndex({ category: 1 });
db.products.createIndex({ price: 1 });
db.products.createIndex({ isAvailable: 1 });
db.users.createIndex({ firebaseUid: 1 }, { unique: true });
db.orders.createIndex({ firebaseUid: 1, createdAt: -1 });
db.orders.createIndex({ status: 1 });
db.favorites.createIndex({ firebaseUid: 1, productId: 1 }, { unique: true });
```

Suggested folder structure:

```text
coffee-making-server/
  config/
    database.js
    firebase.js
  controllers/
    adminController.js
    cartController.js
    categoryController.js
    couponController.js
    inventoryController.js
    notificationController.js
    orderController.js
    paymentController.js
    productController.js
    reviewController.js
    userController.js
  middleware/
    errorHandler.js
    requireFirebaseAuth.js
    requireRole.js
    validateRequest.js
  models/
    Cart.js
    Category.js
    Coupon.js
    Favorite.js
    InventoryLog.js
    Notification.js
    Order.js
    Payment.js
    Product.js
    Review.js
    User.js
  routes/
    adminRoutes.js
    cartRoutes.js
    categoryRoutes.js
    couponRoutes.js
    inventoryRoutes.js
    notificationRoutes.js
    orderRoutes.js
    paymentRoutes.js
    productRoutes.js
    reviewRoutes.js
    userRoutes.js
  utils/
    calculateOrderTotals.js
    generateOrderNumber.js
    pagination.js
  validators/
    cartValidator.js
    orderValidator.js
    productValidator.js
    userValidator.js
  tests/
    products.test.js
    cart.test.js
    orders.test.js
    admin.test.js
  features/
    FEATURES.md
```

## Best First Milestone

Build these first:

1. Product validation and better product fields.
2. Category APIs.
3. Firebase Admin setup.
4. `requireFirebaseAuth` middleware.
5. User profile APIs using Firebase `uid`.
6. Cart APIs.
7. Checkout API that creates an order from cart.

After this, the project will have a real customer flow: browse menu, login with Firebase on the frontend, manage profile, add to cart, and place an order.
