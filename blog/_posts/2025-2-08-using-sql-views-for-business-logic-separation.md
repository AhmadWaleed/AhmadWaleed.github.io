---
title: Using SQL Views for Business Logic Separation.
date: 2025-2-08
tags:
  - domain-driven-design
  - ddd
  - sql
  - postgres
  - golang
  - design
author: Ahmed Waleed
location: Dubai, UAE
---
A SQL Trick I Wish I Had Known Long Ago. In software development, separating business logic or domain logic from an application and other layers is a crucial architectural principle. One of the most important layers in business logic is the persistence layer.

Keeping the persistence layer decoupled via interfaces allows us to keep database-specific implementations out of domain logic. However, this is not entirely true. No matter how much we try to decouple the persistence layer from a specific DBMS, it always ends up being influenced by it.

**How Does the Persistence Layer Get Tightly Coupled?**

You might think that defining a repository interface ensures complete decoupling. However, this is not the case because every database management system (DBMS) has a common way to store data, whether they call it a tuple, record, or object in a table. These concepts inevitably leak into abstractions one way or another.

As a result, different domain use cases might not match the repository interface operations, forcing us to name them based on database-specific details rather than business logic.

* * *

## A Practical Example: Order Processing

Consider a scenario where an order goes through multiple stages:

- A **Draft Order** is created with initial details.
- A **Confirmed Order** is finalized after payment and shipping details are provided.

In a order processing domain, consider following `OrderService` that uses `OrderRepository` interface to perform order processing related persistence operations:

```go
package order

func (s *OrderServer) CreateDraftOrder(ctx context.Context, order DraftOrder) error {
    if err := s.repo.UpdateOrder(order); err != nil {
        return err
    }
}

func (s *OrderServer) ConfirmOrder(ctx context.Context, order ConfirmedOrder) error {
    if _, err := s.repo.UpdateOrder(ctx, order); err != nil {
        return err
    }
}
```

**Problem: Generic `UpdateOrder` Method**

A naive approach would be to define an `UpdateOrder` method that handles both cases. To support this, we might define a repository interface like this:

```go
package order

type OrderRepository interface {
    UpdateOrder(ctx context.Context, order Order) (orderID int, err error)
}
```

**Why is this problematic?**`UpdateOrder` does not match our actual business use cases. Instead of having separate operations for `DraftOrder` and `ConfirmOrder`, it forces us to use a single method influenced by database knowledge.
You might be thinking, well, i can still have two operations defined in the repository interface and solve the problem, But, the repository must first find the existing order, modify fields as per the use case, and then execute the update query. This leads to tight coupling, higher risk of bugs, extra logic for retrieving existing order, updating specific fields, hard-to-maintain code, and potential data corruption.

* * *

## Solution: Using SQL Views for Controlled Inserts and Updates

Instead of exposing the `orders` table for direct inserts/updates, we can define SQL views that restrict what data can be inserted or modified at each stage.

### Step 1: Define the Base Table

```sql
CREATE TABLE orders (
    order_id SERIAL PRIMARY KEY,
    customer_id INT NOT NULL,
    items JSONB NOT NULL,
    status TEXT DEFAULT 'draft',
    payment_info TEXT,
    shipping_address TEXT
);
```

This table will hold both draft orders and confirmed orders, but the repository should not be able to insert/update all fields directly.

* * *

### Step 2: Create Views for Controlled Inserts

Instead of exposing the full `orders` table, we define two SQL views:

#### View for Draft Orders

Allows inserting only draft order info such as `customer_id` and `items` (no accidental updates to `status`, `payment_info`, or `shipping_address`).

```sql
CREATE VIEW draft_orders AS
SELECT order_id, customer_id, items
FROM orders;
```

A `CreateDraftOrder` repository operation will use this view to insert new orders.

#### View for Confirmed Orders

Allows updating only confirm order info such as `status`, `payment_info`, and `shipping_address` (ensuring no modifications to `items` or `customer_id`).

```sql
CREATE VIEW confirmed_orders AS
SELECT order_id, status, payment_info, shipping_address
FROM orders;
```

A `ConfirmOrder` repository operation will use this view for finalizing orders.

* * *

## Implementing in Go

With database views in place, we can define a clean repository interface that aligns with business logic:

```go
type OrderRepository interface {
    CreateDraftOrder(ctx context.Context, o order.DraftOrder) (int, error)
    ConfirmOrder(ctx context.Context, o order.ConfirmOrder) error
}
```

### Go Implementation Using PostgreSQL

```go
package postgres

func (r *OrderRepository) CreateDraftOrder(ctx context.Context, o order.DraftOrder) (int, error) {
    var orderID int
    query := `INSERT INTO draft_orders (customer_id, items) VALUES ($1, $2) RETURNING order_id;`
    err := r.db.QueryRow(query, o.CustomerID, o.Items).Scan(&orderID)
    return orderID, err
}

func (r *OrderRepository) ConfirmOrder(ctx context.Context, o order.ConfirmOrder) error {
    query := `UPDATE confirmed_orders SET status = $1, payment_info = $2, shipping_address = $3 WHERE order_id = $4;`
    _, err := r.db.Exec(query, o.Status, o.PaymentInfo, o.ShippingAddress, o.OrderID)
    return err
}
```

* * *

Let's now take a look at the trade-offs and important considerations when using SQL views for structuring inserts and updates by answer some important question:

### Are Views ACID-Compliant?

Yes! Views preserve ACID properties because they ultimately operate on the base table.

- **Atomicity** → Transactions ensure that either all changes succeed or none do.
- **Consistency** → Constraints on the base table still apply.
- **Isolation** → Views respect the transaction isolation level (e.g., `SERIALIZABLE`).
- **Durability** → Once committed, changes persist just like normal table operations.

> **Caveat:** Views don’t have their own indexes, so query performance depends on the base table’s indexes.

* * *

### Why Is This Approach Better?

- **Clear Separation of Concerns** → The repository aligns with business workflow.
- **Prevents Accidental Updates** → No risk of modifying restricted fields.
- **More Maintainable** → Each method is focused and does exactly what it needs.
- **Enforces Data Integrity at the Database Level** → Without extra application logic.

### When Should You Use This Approach?

- If your business logic requires separating different update responsibilities.
- If you want database-enforced constraints without adding complex validation logic in business logic.
- If you need clean repository interfaces that align with business operations.

### When Not to Use It?

- If your views involve complex joins or aggregations (they might not be updatable).
- If you require dynamic business rules which are more complicated to implement and might involve external sources.

* * *

## Final Thoughts

Using SQL views to enforce structured inserts and updates is a powerful yet often overlooked technique. It provides data integrity, security, and maintainability while keeping repository interfaces clean and business-driven.

If you're designing a business-critical Go application, this approach ensures that each stage of the workflow has dedicated persistence logic, preventing accidental updates while maintaining clean architecture. 🚀
