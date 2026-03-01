# Safed-Injera Memory Document

**Purpose:** Reference this file before executing any task to ensure consistency and prevent regression bugs.

---

## Database Schema (Post-Upgrade)

### users
| Column | Type | Constraints |
|--------|------|--------------|
| id | UUID | PRIMARY KEY |
| username | TEXT | NOT NULL, UNIQUE |
| email | TEXT | NOT NULL, UNIQUE |
| password | TEXT | NOT NULL |
| role | TEXT | NOT NULL, DEFAULT 'admin' |
| branch_id | UUID | REFERENCES branches(id), nullable |
| created_at | TIMESTAMPTZ | NOT NULL, DEFAULT now() |
| updated_at | TIMESTAMPTZ | NOT NULL, DEFAULT now() |

**Roles:** `admin` | `staff` | `sub_admin`

### branches
| Column | Type | Constraints |
|--------|------|--------------|
| id | UUID | PRIMARY KEY |
| name | TEXT | NOT NULL |
| location | TEXT | NOT NULL |
| is_main_hub | BOOLEAN | NOT NULL, DEFAULT false |
| created_at | TIMESTAMPTZ | NOT NULL |
| updated_at | TIMESTAMPTZ | NOT NULL |

### stocks
| Column | Type | Constraints |
|--------|------|--------------|
| id | BIGSERIAL | PRIMARY KEY |
| product_name | TEXT | NOT NULL |
| description | TEXT | |
| quantity | INTEGER | NOT NULL, DEFAULT 0 |
| unit | TEXT | NOT NULL, DEFAULT 'pieces' |
| price | NUMERIC(12,2) | NOT NULL, CHECK (price >= 0) |
| category | TEXT | NOT NULL, DEFAULT 'Injera' |
| is_active | BOOLEAN | NOT NULL, DEFAULT TRUE |
| minimum_threshold | INTEGER | DEFAULT 0 |
| is_low_stock | BOOLEAN | GENERATED ALWAYS AS (quantity < COALESCE(minimum_threshold, 0)) STORED |
| branch_id | UUID | REFERENCES branches(id), nullable |
| last_restocked_by | UUID | REFERENCES users(id) |
| last_restocked_at | TIMESTAMPTZ | |
| last_updated | TIMESTAMPTZ | NOT NULL, DEFAULT now() |
| created_at | TIMESTAMPTZ | NOT NULL, DEFAULT now() |
| updated_at | TIMESTAMPTZ | NOT NULL, DEFAULT now() |

**Units:** `pieces` | `packs` | `boxes` | `kg`  
**Categories:** `Injera` | `Teff Flour` | `Pure Teff` | `Packaging` | `Other`

### stock_transfers
| Column | Type | Constraints |
|--------|------|--------------|
| id | UUID | PRIMARY KEY |
| from_branch_id | UUID | REFERENCES branches(id) |
| to_branch_id | UUID | REFERENCES branches(id) |
| product_name | TEXT | NOT NULL |
| category | TEXT | NOT NULL |
| quantity | INTEGER | NOT NULL, CHECK (quantity > 0) |
| unit | TEXT | NOT NULL |
| status | TEXT | NOT NULL (pending\|in_transit\|received\|cancelled) |
| dispatched_by | UUID | REFERENCES users(id) |
| dispatched_at | TIMESTAMPTZ | |
| received_by | UUID | REFERENCES users(id) |
| received_at | TIMESTAMPTZ | |
| created_at | TIMESTAMPTZ | NOT NULL |
| updated_at | TIMESTAMPTZ | NOT NULL |

### orders
| Column | Type | Constraints |
|--------|------|--------------|
| id | BIGSERIAL | PRIMARY KEY |
| customer_name | TEXT | NOT NULL |
| email | TEXT | NOT NULL |
| phone | TEXT | |
| business_type | TEXT | NOT NULL |
| product | TEXT | NOT NULL |
| quantity | INTEGER | NOT NULL, CHECK (quantity > 0) |
| message | TEXT | |
| status | TEXT | NOT NULL, DEFAULT 'pending' |
| total_price | NUMERIC(12,2) | |
| order_date | TIMESTAMPTZ | NOT NULL, DEFAULT now() |
| notes | TEXT | |
| updated_by | UUID | REFERENCES users(id) |
| status_history | JSONB | DEFAULT '[]'::jsonb |
| created_at | TIMESTAMPTZ | NOT NULL, DEFAULT now() |
| updated_at | TIMESTAMPTZ | NOT NULL, DEFAULT now() |

### stock_transactions
| Column | Type | Constraints |
|--------|------|--------------|
| id | BIGSERIAL | PRIMARY KEY |
| stock_id | BIGINT | NOT NULL, REFERENCES stocks(id) ON DELETE CASCADE |
| transfer_id | UUID | REFERENCES stock_transfers(id), nullable |
| transaction_type | TEXT | CHECK (in \| out \| adjustment \| initial) |
| quantity_change | INTEGER | NOT NULL |
| quantity_before | INTEGER | NOT NULL |
| quantity_after | INTEGER | NOT NULL |
| performed_by | UUID | REFERENCES users(id) |
| reason | TEXT | |
| created_at | TIMESTAMPTZ | NOT NULL, DEFAULT now() |

### stock_settings
**Default thresholds:** Injera (200), Teff Flour (100), Pure Teff (50), Packaging (500), Other (50)

---

## Authentication Flow

- **Mechanism:** JWT-based; 7-day expiry
- **Header:** `Authorization: Bearer <token>`
- **Roles:** `admin` (full access), `staff` (restricted), `sub_admin` (branch-scoped only)
- **Middleware:** `protect` validates JWT and loads user (including branch_id); `adminOnly` restricts delete/settings; `hubAdminOnly` for Main Hub; `subAdminOrHigher` for branch access
- **Sub-admin:** Can only access stocks/transfers where `branch_id = user.branch_id`
- **Frontend:** Token + user (including branchId) in localStorage; 401/403 triggers logout and redirect to /login

---

## Stock Calculation Logic

- **Quantity update:** `quantity = quantity + adjustment` with `quantity + adjustment >= 0` (stockRepository.adjustStockQuantity)
- **Low stock:** `is_low_stock = quantity < COALESCE(minimum_threshold, 0)` (computed column)
- **Total injera (Dashboard):** `sum(quantity)` for active stocks
- **Order deduction:** Wrapped in `withTransaction`; check stock before insert; reject if insufficient; deduct and create stock_transaction atomically; reversal on order delete

---

## ACID Compliance

- **Transaction wrapper:** `withTransaction(client => ...)` in `utils/transaction.ts` — BEGIN, execute, COMMIT or ROLLBACK
- **Atomic operations:** Order create/delete, quick-adjust, stock transfer dispatch/receive all use `withTransaction`
- **Immutable logs:** `stock_transactions` and `stock_transfers` are append-only; reports use them as source of truth

---

## Transfer Flow (Hub to Branch)

1. **Dispatch** (Main Hub only): `POST /api/stock-transfers/dispatch` — Decrement hub stock, create stock_transfer (status: in_transit), create stock_transaction (out). All atomic.
2. **Receive** (Branch sub-admin): `POST /api/stock-transfers/:id/receive` — Increment branch stock (or create if new), update transfer status to received, create stock_transaction (in). All atomic.

---

## API Endpoints (New)

- `GET /api/branches` — List branches
- `GET /api/branches/main-hub` — Get Main Hub
- `POST /api/branches` — Create branch (admin only)
- `GET /api/stock-transfers/branch-dashboard?branchId=` — Branch dashboard stats
- `POST /api/stock-transfers/dispatch` — Dispatch from Main Hub
- `GET /api/stock-transfers/pending?branchId=` — Pending transfers for branch
- `POST /api/stock-transfers/:id/receive` — Receive transfer at branch
