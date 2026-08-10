# Database Design — Phase 1

## Technology

- PostgreSQL 17
- Prisma ORM 7
- Migration-driven schema (`backend/prisma/migrations`)

## Entity relationship overview

```text
Role
  │
  └── User
        │
        └── Order
              │
              └── OrderItem ─── Product
                                  │
                     ┌────────────┼────────────┐
                     ↓            ↓            ↓
                 Category       Style        ProductSize
                                                │
                                                ↓
                                               Size

Product
   │
   └── ProductImage
```

## Models

| Model | Purpose |
| --- | --- |
| `Role` | RBAC roles (`SUPER_ADMIN`, `ADMIN`, `MANAGER`, `CUSTOMER`) |
| `User` | Accounts with optional phone, bcrypt password hash, account status |
| `Category` | Product categories |
| `Style` | Product styles |
| `Size` | Available sizes with sort order |
| `Product` | Catalog products with price and active flag |
| `ProductSize` | Many-to-many product ↔ size |
| `ProductImage` | Multiple images per product (optional primary) |
| `Order` | Checkout order with customer snapshot fields and total |
| `OrderItem` | Line items with `unitPrice` / `subtotal` price snapshots |
| `RefreshToken` | Hashed refresh tokens with expiry and revocation |

## Important design decisions

1. **Roles are normalized** into a `roles` table with unique `code` + `name` (not hardcoded only in application enums).
2. **Product sizes** use a junction table (`product_sizes`) with `@@unique([productId, sizeId])`.
3. **Product images** are normalized (`product_images`) instead of comma-separated URLs.
4. **Order item prices are snapshotted** (`unitPrice`, `subtotal`) so historical orders remain correct if product prices change.
5. **Delete behavior protects history**:
   - `OrderItem.product` → `onDelete: Restrict`
   - `Order.user` → `onDelete: Restrict`
   - Catalog join/image rows cascade with product deletion
   - Prefer deactivating catalog entities (`isActive`) over hard deletes
6. **User.email** is unique; seed/application should store lowercase values for consistency.
7. **`passwordHash` is nullable** to allow future OAuth-only accounts without storing placeholder passwords.
8. **Refresh tokens** are persisted as SHA-256 hashes (`refresh_tokens`), never as raw JWT values. Tokens are rotated on refresh and revoked on logout.

## Indexes (selected)

- Users: unique email; indexes on `roleId`, `status`
- Products: `categoryId`, `styleId`, `isActive`, `name`
- ProductSize: unique `(productId, sizeId)`; indexes on both FKs
- Orders: `userId`, `status`, `createdAt`
- OrderItems: `orderId`, `productId`

## Seed

Mandatory seed data:

- Roles: Super Admin, Admin, Manager, Customer
- One default Super Admin user (bcrypt-hashed password)

Environment variables (see `backend/.env.example`):

- `SUPER_ADMIN_EMAIL`
- `SUPER_ADMIN_PASSWORD`
- `SUPER_ADMIN_FULL_NAME` (optional)

Seed is idempotent (`upsert`).
