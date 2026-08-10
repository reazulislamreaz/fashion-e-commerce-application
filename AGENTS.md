# AGENTS.md

# Easy Fashion Limited — Software Engineer Technical Assessment

> **This document is the primary engineering instruction for all AI coding agents working in this repository.**

This repository is being developed as part of the **Easy Fashion Limited Software Engineer Technical Assessment**.

The purpose of this project is to demonstrate professional-level:

* Software architecture
* Backend engineering
* Frontend engineering
* Database design
* REST API development
* Authentication
* Authorization
* RBAC
* Security
* Clean coding practices
* SOLID principles
* Performance optimization
* Responsive UI/UX
* Testing
* Documentation
* Git workflow
* Problem-solving ability
* Overall system architecture

The final project must look and behave like a **well-engineered real-world production application**, not a minimal coding-test prototype.

---

# 1. CRITICAL AI AGENT INSTRUCTIONS

## 1.1 Read Before Coding

Before making **any code change**, the AI agent MUST:

1. Read this `AGENTS.md` completely.
2. Check whether `CLAUDE.md` exists and read it.
3. Check for any additional repository-level instruction files.
4. Read the relevant assessment requirements before implementing the requested feature.
5. Inspect the existing project structure.
6. Understand the existing architecture and coding patterns.
7. Reuse existing utilities, components, services, and patterns where appropriate.
8. Avoid introducing a new pattern when an existing project pattern already solves the problem.
9. Consider security, performance, scalability, maintainability, and UX before implementation.
10. Verify the implementation after making changes.

### Mandatory workflow

```text
Read Instructions
        ↓
Understand Assessment Requirement
        ↓
Inspect Existing Code
        ↓
Understand Architecture
        ↓
Identify Affected Modules
        ↓
Plan Implementation
        ↓
Implement
        ↓
Validate
        ↓
Test
        ↓
Review
        ↓
Document
```

**Do not start coding immediately without understanding the existing codebase.**

---

# 2. SOURCE OF TRUTH

The Easy Fashion Limited assessment requirements are the primary functional source of truth.

The project consists of two major applications:

```text
1. Customer E-Commerce Website
2. Management Dashboard
```

Every implementation decision must support the assessment requirements.

Additional features may be implemented only when they:

* Do not conflict with the assessment.
* Do not introduce unnecessary complexity.
* Improve the product meaningfully.
* Maintain security and maintainability.
* Do not delay or compromise required features.

---

# 3. PREFERRED TECHNOLOGY STACK

## Backend

Preferred:

* Node.js
*NestJS

## Database

Preferred:

* PostgreSQL


Because the assessment explicitly requires a **normalized relational database**, PostgreSQL should be preferred when there is no project constraint preventing it.

## Database Access

Allowed:

* Prisma


Prefer the ORM/query builder already established in the project.

## Frontend

Required/preferred:

* Next.js

## UI Framework

Allowed:

* Tailwind CSS
* Ant Design
* Material UI
* Bootstrap
* Another modern CSS framework

Do not introduce multiple UI frameworks unnecessarily.

---

# 4. PROJECT ARCHITECTURE

The project must follow a clean, modular, maintainable architecture.

For backend development, prefer:

```text
Router
   ↓
Controller
   ↓
Service
   ↓
Repository / Data Access
   ↓
Database
```

Supporting layers may include:

```text
Middleware
Validation
Authentication
Authorization
Guards
Configuration
Utilities
Logging
Error Handling
Types
Constants
```

## Architecture principles

Follow:

* Separation of concerns
* Single Responsibility Principle
* SOLID principles
* High cohesion
* Low coupling
* Dependency inversion where appropriate
* Reusable modules
* Clear module boundaries
* Testability
* Maintainability

### Controllers

Controllers should remain thin.

They should primarily:

* Receive requests.
* Validate/request-process input where appropriate.
* Call services.
* Return responses.

Do not place large business logic inside controllers.

### Services

Services should contain:

* Business logic
* Business rules
* Transaction orchestration
* Domain-level operations

### Repository/Data Access

Database access should be properly separated from business logic when the architecture requires a repository/data-access layer.

---

# 5. MODULE 1 — CUSTOMER E-COMMERCE WEBSITE

The Customer Website is a modern, responsive Fashion E-Commerce application.

---

# 6. CUSTOMER HOME PAGE

The landing page must include a professional and responsive home page.

## Hero Section

Implement:

* Modern responsive design
* Animated banner or carousel
* Fashion promotional banners
* Proper image loading
* Smooth but purposeful animations

Avoid unnecessary animation that negatively affects performance.

---

# 7. CUSTOMER SUMMARY SECTION

Display attractive summary cards showing:

* Total Categories
* Total Products
* Available Sizes
* Available Styles

The values should preferably come from real backend/database data rather than hardcoded values.

---

# 8. CUSTOMER PRODUCT LISTING

Display products in a responsive card layout.

Each product card should include:

* Product Image
* Product Name
* Category
* Style
* Available Sizes
* Price
* Add to Cart button

The layout must work properly on:

* Desktop
* Tablet
* Mobile

---

# 9. PRODUCT FILTERING

Customers must be able to filter products by:

* Category
* Size
* Style

Products must update dynamically based on the selected filters.

Filtering should be handled efficiently.

Where appropriate:

* Query parameters should be used.
* Backend filtering should be supported.
* Database indexes should support frequently used filters.
* Pagination should be considered.

---

# 10. PRODUCT DETAILS

Clicking a product must open a product details page.

The page must display:

* Multiple Product Images
* Product Description
* Category
* Available Sizes
* Available Styles
* Price
* Quantity Selector
* Add to Cart

The UI should clearly communicate:

* Product information
* Available options
* Current quantity
* Price
* Add-to-cart action

Handle loading, empty, and error states properly.

---

# 11. SHOPPING CART

Implement:

* Add Item
* Remove Item
* Update Quantity
* Price Calculation
* Grand Total

The cart must correctly handle:

* Multiple products
* Quantity updates
* Removing items
* Price calculation
* Empty cart state

Do not trust client-side prices during order creation.

The backend must validate product pricing and order totals before creating an order.

---

# 12. CHECKOUT / ORDER CREATION

Checkout must collect:

* Customer Name
* Phone Number
* Shipping Address

The system must successfully generate an Order.

Before creating an order, validate:

* Customer information
* Product existence
* Product availability
* Quantity
* Current price
* Order total

The final order total must be calculated securely on the server.

---

# 13. CUSTOMER FOOTER

The footer must include:

* Company Information
* Contact Information
* Social Media Links
* Copyright

The footer must be responsive and consistent with the application's visual design.

---

# 14. MODULE 2 — MANAGEMENT DASHBOARD

Develop a secure and responsive Management Dashboard.

Only authorized dashboard users should be able to access dashboard functionality.

Dashboard APIs must be protected using:

* JWT Authentication
* Role Guards / Authorization

---

# 15. USER REGISTRATION

Users must be able to register using:

* Full Name
* Email Address
* Phone Number (Optional)
* Password

## Registration requirements

* Email must be unique.
* Passwords must be securely hashed using bcrypt.
* All input fields must be validated.
* Proper validation errors must be returned.
* Newly registered users must receive the `Customer` role by default.

Never allow public registration to create:

* Super Admin
* Admin
* Manager

Dashboard roles must be assigned through authorized management functionality.

---

# 16. USER LOGIN

Users must be able to log in using:

* Email
* Password

After successful login, generate:

* JWT Access Token
* JWT Refresh Token

Authentication must be implemented securely.

---

# 17. JWT ACCESS TOKEN

Access tokens must have an expiration time.

Never create indefinitely valid access tokens.

Protected APIs must validate:

* Token presence
* Token validity
* Token expiration
* User identity

---

# 18. REFRESH TOKEN

Implement:

* Refresh Token generation
* Refresh Token expiration
* Refresh Token API
* Secure refresh token storage

If refresh tokens are persisted, they should be stored securely, preferably hashed.

### Bonus

Implement:

* Refresh Token Rotation

When rotation is implemented, properly invalidate/revoke the previous refresh token where appropriate.

---

# 19. REQUIRED AUTHENTICATION APIs

The backend must provide APIs for:

```text
Register
Login
Refresh Token
Logout
Get Current User Profile
```

These APIs must have proper:

* Validation
* Authentication
* Authorization where applicable
* HTTP status codes
* Error handling
* Response structure

---

# 20. SOCIAL AUTHENTICATION

Implement OAuth login using:

* Google
* Facebook

## Requirements

For an existing user:

* Automatically authenticate the user.

For a new user:

* Automatically create the user.

After successful OAuth authentication:

* Return JWT Access Token.
* Return JWT Refresh Token.

Social authentication must not create unauthorized privileged dashboard roles.

New social users should receive the appropriate default customer role unless explicitly provisioned otherwise.

---

# 21. DASHBOARD AUTHENTICATION

Only authenticated dashboard users can access the Management Dashboard.

The system must contain:

```text
One default Super Admin account
```

The Super Admin account must be seeded directly into the database.

Do not create the default Super Admin through public registration.

The seed process must be documented.

Credentials must not be hardcoded in the repository.

Use environment variables or secure seed configuration for sensitive credentials.

---

# 22. SUPER ADMIN

The Super Admin must be able to:

* Login
* Create Dashboard Users
* View User List
* View User Details
* Update User Information
* Activate Users
* Deactivate Users
* Assign User Roles

The Super Admin has full system access.

---

# 23. ROLE-BASED ACCESS CONTROL

Implement RBAC.

Roles:

```text
Super Admin
Admin
Manager
Customer
```

Authorization must be enforced server-side.

Do not rely only on frontend route protection.

---

# 24. SUPER ADMIN PERMISSIONS

Super Admin:

* Full System Access
* Manage Dashboard Users
* Assign Roles & Permissions
* Manage Products
* Manage Categories
* Manage Sizes
* Manage Styles
* Manage Orders
* View Dashboard Reports

---

# 25. ADMIN PERMISSIONS

Admin:

* Manage Products
* Manage Categories
* Manage Sizes
* Manage Styles
* View Users
* Manage Orders

Admin must not automatically receive Super Admin-only privileges.

---

# 26. MANAGER PERMISSIONS

Manager:

* View Dashboard
* View Products
* Manage Orders
* Update Order Status

Manager should not be allowed to perform unauthorized administrative operations.

---

# 27. CUSTOMER PERMISSIONS

Customer:

* Register
* Login
* Browse Products
* Add to Cart
* Place Orders
* View Own Orders
* Update Own Profile

A Customer must not access dashboard management operations.

---

# 28. AUTHORIZATION RULE

Every protected operation must verify:

```text
Is the user authenticated?
        ↓
Is the user active?
        ↓
Does the user have the required role/permission?
        ↓
Is the requested resource allowed for this user?
```

Never trust:

* Client-provided role
* Client-provided user ID
* Client-provided ownership information
* Client-provided permissions

---

# 29. SECURITY REQUIREMENTS

The application must implement:

* JWT Authentication
* Password Hashing with bcrypt
* Refresh Token Security
* Route Guards / Middleware
* Protected APIs
* Proper HTTP Status Codes
* Input Validation
* Centralized Error Handling
* CORS Configuration
* Environment Variables for Secrets

---

# 30. BONUS SECURITY FEATURES

Where time and architecture permit, implement:

* Email Verification
* Forgot Password
* Reset Password
* Account Activation
* Rate Limiting
* Login Attempt Protection
* Audit Log for Login Activity
* Refresh Token Rotation

Bonus features must never compromise core assessment requirements.

---

# 31. PASSWORD SECURITY

Passwords must:

* Never be stored as plain text.
* Always be hashed using bcrypt.
* Never be returned through API responses.
* Never appear in logs.
* Never be committed to Git.

---

# 32. SECRET MANAGEMENT

Never hardcode:

* Database passwords
* JWT secrets
* OAuth client secrets
* API keys
* Private tokens
* Cloud credentials
* Admin passwords

Use environment variables.

Provide:

```text
.env.example
```

with placeholder values.

Never commit real `.env` files.

---

# 33. DASHBOARD SUMMARY

The Management Dashboard must display summary cards for:

* Total Users
* Total Categories
* Total Products
* Total Orders

Prefer real database-backed values.

---

# 34. CATEGORY MANAGEMENT

Implement complete CRUD:

```text
Create
Read
Update
Delete
```

for Categories.

Handle:

* Validation
* Duplicate data
* Unauthorized operations
* Not-found cases
* Related product considerations

---

# 35. PRODUCT MANAGEMENT

Implement complete CRUD for Products.

Each Product must contain:

* Product Name
* Category
* Style
* Size
* Description
* Price
* Multiple Product Images

Product relationships must be modeled correctly.

Validate:

* Product name
* Category
* Style
* Size
* Description
* Price
* Images

---

# 36. SIZE MANAGEMENT

Implement complete CRUD operations for Sizes.

Ensure duplicate sizes are handled appropriately.

---

# 37. STYLE MANAGEMENT

Implement complete CRUD operations for Styles.

Ensure duplicate styles are handled appropriately.

---

# 38. ORDER MANAGEMENT

Dashboard must display:

* Customer Information
* Ordered Products
* Quantity
* Total Amount
* Order Status

Authorized dashboard users must be able to update Order Status according to their permissions.

Order status changes must be validated.

---

# 39. USER MANAGEMENT

Dashboard must provide:

* User List
* User Details

Super Admin must be able to:

* Create dashboard users
* Update user information
* Activate/deactivate users
* Assign roles
* View users

Role changes must be authorized.

---

# 40. REST API REQUIREMENTS

Develop clean REST APIs following best practices.

APIs must include, where applicable:

* Validation
* Authentication
* Authorization
* Error Handling
* Pagination
* Search
* Filtering

Use meaningful RESTful routes.

Example:

```text
/api/v1/auth/register
/api/v1/auth/login
/api/v1/auth/refresh
/api/v1/auth/logout
/api/v1/users
/api/v1/categories
/api/v1/products
/api/v1/sizes
/api/v1/styles
/api/v1/orders
```

Follow the project's established route conventions if they differ.

---

# 41. HTTP STATUS CODES

Use appropriate HTTP status codes.

Examples:

```text
200 OK
201 Created
204 No Content
400 Bad Request
401 Unauthorized
403 Forbidden
404 Not Found
409 Conflict
422 Unprocessable Entity
429 Too Many Requests
500 Internal Server Error
```

Do not use `200` for every situation.

---

# 42. API RESPONSE CONSISTENCY

API responses should follow a consistent structure.

Success responses should be predictable.

Error responses should contain useful information without exposing sensitive implementation details.

Never expose:

* Stack traces
* Database internals
* Password hashes
* Tokens unnecessarily
* Internal infrastructure details

---

# 43. VALIDATION

Validate:

* Request body
* Query parameters
* Route parameters
* Authentication input
* User input
* Product data
* Category data
* Size data
* Style data
* Order data

Never assume frontend validation is sufficient.

Backend validation is mandatory.

---

# 44. CENTRALIZED ERROR HANDLING

Implement centralized error handling.

Handle expected errors such as:

* Validation errors
* Authentication failures
* Authorization failures
* Duplicate records
* Resource not found
* Database errors
* Unexpected server errors

Production responses must not expose internal stack traces.

---

# 45. DATABASE DESIGN

The assessment explicitly requires a **normalized relational database**.

Preferred database:

```text
PostgreSQL
```

Core entities:

```text
Users
Roles
Categories
Products
Sizes
Styles
Orders
Order Items
```

Use proper:

* Relationships
* Foreign keys
* Indexes
* Constraints
* Unique constraints
* Referential integrity
* Timestamps where appropriate

---

# 46. DATABASE RELATIONSHIPS

The schema should logically represent relationships between:

```text
Users
  ↓
Orders
  ↓
Order Items
  ↓
Products
  ↓
Categories
Styles
Sizes
Roles
```

Avoid unnecessary duplication.

Do not create an overly denormalized schema without a clear engineering reason.

---

# 47. DATABASE CONSTRAINTS

Use database-level constraints where appropriate.

Examples:

* Unique email
* Unique category names where appropriate
* Unique style names where appropriate
* Unique size names where appropriate
* Foreign key constraints
* Non-null constraints
* Valid price constraints

Do not rely entirely on application-level validation for data integrity.

---

# 48. DATABASE INDEXING

Add indexes based on real query patterns.

Consider indexes for:

* User email
* Role relationships
* Product category
* Product style
* Product size relationships
* Order customer
* Order status
* Frequently searched/filterable fields

Avoid blindly indexing every column.

---

# 49. DATABASE PERFORMANCE

Avoid:

* N+1 queries
* Unnecessary joins
* Full-table scans for common queries
* Repeated database calls
* Fetching unused fields
* Unpaginated large datasets

Use:

* Appropriate indexes
* Pagination
* Filtering
* Search
* Efficient queries
* Projection/selective field retrieval

---

# 50. PAGINATION

List APIs should support pagination where applicable.

Examples:

```text
Users
Products
Categories
Orders
```

Pagination should prevent unnecessarily large responses.

Where appropriate, support:

```text
page
limit
sort
```

or an equivalent cursor-based approach.

---

# 51. SEARCH

Implement search where applicable.

Search must:

* Validate input.
* Avoid inefficient database queries.
* Work consistently with pagination.
* Use appropriate database capabilities/indexes.

---

# 52. FILTERING

Filtering must be supported where required.

Product filtering includes:

```text
Category
Size
Style
```

Dashboard listing APIs may also support relevant filtering.

---

# 53. FRONTEND ARCHITECTURE

The Next.js application must follow a clean and maintainable structure.

Prefer:

```text
Pages / Routes
Components
Features
Hooks
Services
API Client
Types
Utilities
State Management
```

Avoid putting all logic inside page components.

---

# 54. REUSABLE COMPONENTS

Create reusable components for repeated UI patterns.

Examples:

* Buttons
* Inputs
* Modals
* Tables
* Cards
* Product Cards
* Pagination
* Loading states
* Error states
* Empty states
* Form components

Do not create duplicate components for identical functionality.

---

# 55. RESPONSIVE UI

The entire application must work on:

* Desktop
* Tablet
* Mobile

Pay special attention to:

* Navigation
* Product grids
* Product details
* Cart
* Checkout
* Dashboard tables
* Dashboard sidebar
* Forms
* Modals

Do not treat mobile responsiveness as an afterthought.

---

# 56. UI/UX QUALITY

The application should feel like a real fashion e-commerce product.

Prioritize:

* Clean visual hierarchy
* Consistent spacing
* Typography
* Responsive layouts
* Clear buttons
* Accessible forms
* Meaningful feedback
* Loading states
* Empty states
* Error states
* Success states

Avoid unnecessary visual complexity.

---

# 57. LOADING STATES

Every asynchronous UI operation should properly handle loading.

Examples:

* Product loading
* Dashboard loading
* Login
* Registration
* CRUD operations
* Order creation
* Data tables

Never leave users looking at a blank screen while waiting for data.

---

# 58. EMPTY STATES

Handle empty data gracefully.

Examples:

```text
No products found.
No orders found.
No users found.
No categories found.
```

Provide useful UX rather than showing broken or empty layouts.

---

# 59. ERROR STATES

API failures must not crash the entire frontend.

Show clear error messages.

Where possible, provide recovery actions such as:

* Retry
* Refresh
* Go back
* Correct form input

Do not expose raw backend/database errors to users.

---

# 60. PERFORMANCE

Performance must be considered across frontend and backend.

Frontend considerations:

* Optimized images
* Lazy loading where appropriate
* Efficient rendering
* Avoid unnecessary re-renders
* Avoid unnecessary API calls
* Proper caching where appropriate
* Responsive loading states

Backend considerations:

* Efficient database queries
* Indexes
* Pagination
* Proper payload sizes
* Avoid duplicate queries
* Appropriate caching where justified

Do not sacrifice maintainability for insignificant micro-optimizations.

---

# 61. TYPESCRIPT

If TypeScript is used, use it properly.

Prefer:

* Strong typing
* Interfaces
* Types
* Generics
* Utility types
* Type-safe API contracts

Avoid unnecessary:

```typescript
any
```

Do not use type assertions merely to silence compiler errors.

---

# 62. CLEAN CODE

Code must be:

* Readable
* Maintainable
* Testable
* Reusable
* Predictable
* Consistent

Avoid:

* Giant functions
* Giant components
* Deep nesting
* Duplicate code
* Magic numbers
* Magic strings
* Unnecessary abstractions
* Premature optimization

Prefer simple, understandable solutions.

---

# 63. SOLID PRINCIPLES

Apply SOLID principles where they improve the design.

Especially:

* Single Responsibility
* Open/Closed
* Liskov Substitution
* Interface Segregation
* Dependency Inversion

Do not force SOLID abstractions where they provide no practical benefit.

---

# 64. SECURITY RULES

The following are mandatory:

### Never commit

```text
.env
Passwords
JWT secrets
OAuth secrets
Database credentials
API keys
Private tokens
Cloud credentials
```

### Never expose

```text
Password hashes
Private credentials
Internal stack traces
Sensitive environment values
```

### Always consider

```text
Authentication
Authorization
Input validation
Rate limiting
CORS
Secure cookies/tokens
Password hashing
Token expiration
Resource ownership
```

---

# 65. RESOURCE OWNERSHIP

Customers may only access their own protected resources.

For example:

```text
Customer A
    ↓
Can view Customer A's orders

Customer A
    X
Cannot view Customer B's orders
```

Never trust a client-provided user ID to determine ownership.

Derive authenticated user identity from the verified authentication context.

---

# 66. ORDER SECURITY

Order creation must be server-controlled.

Never trust the frontend for:

* Product price
* Product existence
* Quantity validity
* Grand total
* Customer identity

The backend must calculate the authoritative order total.

---

# 67. AUTHENTICATION SECURITY

Authentication implementation must account for:

* Invalid credentials
* Expired access tokens
* Invalid refresh tokens
* Revoked refresh tokens
* Inactive users
* Unauthorized dashboard access
* Role changes
* Logout

Where refresh token persistence is implemented, securely store tokens and support revocation/rotation where appropriate.

---

# 68. TESTING

Tests should cover important business logic and security boundaries.

At minimum, where applicable test:

```text
Registration
Login
Authentication
Authorization
RBAC
Validation
Product APIs
Order creation
Order permissions
Dashboard permissions
```

Test both:

### Happy paths

and:

### Failure paths

Examples:

```text
Invalid credentials
Invalid input
Duplicate email
Unauthorized request
Forbidden role
Missing resource
Invalid product
Invalid quantity
Expired token
```

---

# 69. TESTING CHECKLIST

Before considering implementation complete:

* [ ] Tests pass
* [ ] Type checking passes
* [ ] Lint passes
* [ ] Build succeeds
* [ ] No obvious runtime errors
* [ ] Authentication works
* [ ] Authorization works
* [ ] Required roles work
* [ ] Required APIs work
* [ ] UI works responsively

---

# 70. GIT WORKFLOW

The assessment explicitly requires meaningful Git commits.

Follow this workflow:

```text
Accept GitHub Collaboration Invitation
        ↓
Clone Repository
        ↓
Understand Existing Project
        ↓
Implement Incrementally
        ↓
Make Meaningful Commits
        ↓
Push Changes
```

---

# 71. COMMIT STANDARDS

Commits must demonstrate step-by-step development progress.

Good examples:

```text
chore: initialize project structure
chore: configure database and environment
feat: implement user registration
feat: implement JWT authentication
feat: add refresh token flow
feat: implement RBAC
feat: add category management
feat: implement product management
feat: implement size management
feat: implement style management
feat: implement customer storefront
feat: implement product filtering
feat: implement shopping cart
feat: implement order creation
feat: implement dashboard order management
feat: add responsive dashboard layout
test: add authentication tests
fix: handle duplicate email registration
fix: improve order validation
docs: update README
```

Avoid meaningless commits:

```text
update
fix
changes
final
done
test
asdf
```

Do not intentionally hide the development history.

The Git history should communicate how the system was progressively built.

---

# 72. NO UNRELATED CHANGES

When implementing a task:

1. Identify affected files.
2. Modify only necessary files.
3. Avoid unrelated refactoring.
4. Preserve existing functionality.
5. Review the Git diff before finishing.

Do not rewrite the entire application to implement a small feature.

---

# 73. DEPENDENCY MANAGEMENT

Before installing a package, ask:

1. Is it necessary?
2. Does the project already have a solution?
3. Is the dependency maintained?
4. Does it introduce unnecessary complexity?
5. Does it negatively affect performance?

Avoid unnecessary dependencies.

---

# 74. DOCUMENTATION

A complete `README.md` is mandatory.

The README must include:

* Project overview
* Features
* Technology stack
* Architecture
* Project structure
* Installation
* Environment variables
* Database setup
* Migration instructions
* Seed instructions
* Development instructions
* Build instructions
* Testing instructions
* API information
* Authentication information
* RBAC overview
* Important assumptions
* Known limitations
* Additional features

The README should be written for another developer who needs to run and understand the project.

---

# 75. ENVIRONMENT DOCUMENTATION

Document all required environment variables in `.env.example`.

Example categories:

```text
Database
JWT
Authentication
OAuth
Application
CORS
External services
```

Never place actual credentials in documentation.

---

# 76. DATABASE MIGRATION / SEED

The repository must include:

* Database schema
* Migration files
* Seed files

The default Super Admin must be seeded through the database seed process.

The README must explain how to execute:

```text
Migration
Seed
```

Do not manually require the reviewer to insert database records without documentation.

---

# 77. DEFAULT SUPER ADMIN

The default Super Admin must be created through a secure seed process.

Requirements:

* Role = Super Admin
* Password securely hashed with bcrypt
* Credentials must not be hardcoded as plaintext in committed source
* Seed process must be reproducible
* Credentials should be configurable through environment variables

Example concept:

```text
SUPER_ADMIN_EMAIL
SUPER_ADMIN_PASSWORD
```

---

# 78. API VERSIONING

Where appropriate, use API versioning.

Example:

```text
/api/v1/...
```

Maintain consistent route conventions throughout the application.

---

# 79. LOGGING

Use structured and useful logging where appropriate.

Logs should help diagnose:

* Authentication failures
* Server errors
* Important system events
* Database errors
* Unexpected failures

Never log:

* Passwords
* JWT secrets
* Refresh tokens
* OAuth secrets
* Sensitive personal information unnecessarily

---

# 80. CORS

Configure CORS securely.

Do not blindly allow every origin in production configuration.

Use environment-based allowed origins where appropriate.

---

# 81. RATE LIMITING

If implemented, rate limiting should especially protect sensitive endpoints such as:

```text
Login
Registration
Password reset
Refresh token
OAuth callbacks
```

Do not introduce rate limiting that breaks legitimate application behavior.

---

# 82. ACCOUNT STATUS

If account activation/deactivation is implemented:

Inactive users must not be able to perform protected operations.

Authorization checks should consider account status.

---

# 83. AUDIT LOGGING

If login audit logs are implemented, capture useful security events without storing sensitive credentials.

Examples:

```text
Successful login
Failed login
Logout
Password reset
Account activation/deactivation
Role change
```

Never store plaintext passwords or sensitive authentication secrets in audit logs.

---

# 84. BONUS FEATURES PRIORITY

Bonus features are secondary.

Implementation priority must always be:

```text
Required Features
        ↓
Security
        ↓
Correctness
        ↓
Testing
        ↓
Documentation
        ↓
Bonus Features
```

Do not sacrifice mandatory requirements for bonus features.

---

# 85. ASSESSMENT EVALUATION CRITERIA

The recruiter explicitly evaluates:

### Architecture

* Clean Architecture
* Modular Design
* Folder Structure

### Code

* Reusable Components
* SOLID Principles
* Clean Code
* Maintainability

### Backend

* API Design
* Authentication
* Authorization
* Security
* Error Handling
* Validation

### Database

* Proper schema
* Relationships
* Foreign keys
* Indexes
* Constraints
* Performance

### Frontend

* Responsive UI
* UI/UX quality
* Component reusability
* Loading/error/empty states

### Engineering

* Performance
* Git Commit History
* Documentation
* Overall architecture

---

# 86. PROBLEM-SOLVING STANDARD

When solving a requirement, do not immediately choose the first implementation that works.

Consider:

```text
Correctness
Security
Maintainability
Scalability
Performance
Testability
Developer Experience
User Experience
```

Prefer the simplest solution that satisfies the requirement professionally.

Do not over-engineer.

---

# 87. AI AGENT PROHIBITED BEHAVIOR

The AI agent MUST NOT:

* Ignore this file.
* Ignore `CLAUDE.md`.
* Ignore assessment requirements.
* Hardcode secrets.
* Commit `.env`.
* Remove tests to make them pass.
* Disable TypeScript errors instead of fixing them.
* Disable lint rules unnecessarily.
* Rewrite the entire codebase without justification.
* Change frameworks without a requirement.
* Add unnecessary dependencies.
* Implement fake APIs.
* Create placeholder functionality and claim it is complete.
* Remove existing functionality without justification.
* Make unrelated changes.
* Trust client-side authorization.
* Trust client-provided prices for orders.
* Expose sensitive information.
* Claim that code works without verification.

---

# 88. AI AGENT REQUIRED BEHAVIOR

The AI agent SHOULD:

* Read before coding.
* Inspect before modifying.
* Reuse existing architecture.
* Keep changes focused.
* Use strong typing.
* Validate all external input.
* Protect all sensitive operations.
* Consider database performance.
* Consider API performance.
* Consider responsive UX.
* Handle loading/error/empty states.
* Write maintainable code.
* Test important functionality.
* Review the final diff.
* Update documentation when necessary.
* Clearly communicate assumptions and limitations.

---

# 89. FEATURE COMPLETION STANDARD

A feature is not considered complete merely because the happy path works.

A feature should be considered complete only when applicable:

```text
Requirement
    ↓
Implementation
    ↓
Validation
    ↓
Authentication
    ↓
Authorization
    ↓
Error Handling
    ↓
Edge Cases
    ↓
Database Integrity
    ↓
Performance
    ↓
Testing
    ↓
Responsive UI
    ↓
Documentation
```

---

# 90. FINAL PRE-SUBMISSION CHECKLIST

Before submission, verify every item below.

## Source Code

* [ ] All source code has been pushed to GitHub.
* [ ] No sensitive credentials are committed.
* [ ] `.env` is ignored.
* [ ] `.env.example` exists.
* [ ] Project structure is clean.

## Customer Website

* [ ] Home page implemented.
* [ ] Hero section implemented.
* [ ] Promotional carousel/banner implemented.
* [ ] Summary cards implemented.
* [ ] Product listing implemented.
* [ ] Product filtering implemented.
* [ ] Product details implemented.
* [ ] Multiple product images implemented.
* [ ] Shopping cart implemented.
* [ ] Quantity management implemented.
* [ ] Price calculation implemented.
* [ ] Checkout implemented.
* [ ] Order creation implemented.
* [ ] Footer implemented.
* [ ] Responsive UI verified.

## Authentication

* [ ] Registration implemented.
* [ ] Email uniqueness enforced.
* [ ] bcrypt password hashing implemented.
* [ ] Login implemented.
* [ ] JWT Access Token implemented.
* [ ] JWT Refresh Token implemented.
* [ ] Access token expiration implemented.
* [ ] Refresh token expiration implemented.
* [ ] Refresh token API implemented.
* [ ] Logout implemented.
* [ ] Current user profile implemented.
* [ ] Google OAuth implemented.
* [ ] Facebook OAuth implemented.

## Dashboard

* [ ] Dashboard authentication implemented.
* [ ] Default Super Admin seeded.
* [ ] Dashboard user creation implemented.
* [ ] User list implemented.
* [ ] User details implemented.
* [ ] User update implemented.
* [ ] User activation/deactivation implemented.
* [ ] Role assignment implemented.
* [ ] RBAC implemented.
* [ ] Dashboard summary implemented.
* [ ] Category CRUD implemented.
* [ ] Product CRUD implemented.
* [ ] Size CRUD implemented.
* [ ] Style CRUD implemented.
* [ ] Order management implemented.
* [ ] Order status update implemented.

## RBAC

* [ ] Super Admin permissions verified.
* [ ] Admin permissions verified.
* [ ] Manager permissions verified.
* [ ] Customer permissions verified.
* [ ] Unauthorized access blocked.
* [ ] Protected APIs enforce role guards.

## API

* [ ] RESTful APIs implemented.
* [ ] Validation implemented.
* [ ] Authentication implemented.
* [ ] Authorization implemented.
* [ ] Error handling implemented.
* [ ] Pagination implemented where applicable.
* [ ] Search implemented where applicable.
* [ ] Filtering implemented where applicable.
* [ ] Proper HTTP status codes used.

## Database

* [ ] Users implemented.
* [ ] Roles implemented.
* [ ] Categories implemented.
* [ ] Products implemented.
* [ ] Sizes implemented.
* [ ] Styles implemented.
* [ ] Orders implemented.
* [ ] Order Items implemented.
* [ ] Relationships implemented.
* [ ] Foreign keys implemented.
* [ ] Indexes implemented.
* [ ] Constraints implemented.
* [ ] Migration files included.
* [ ] Seed files included.

## Security

* [ ] JWT security verified.
* [ ] bcrypt verified.
* [ ] Refresh token security verified.
* [ ] Input validation verified.
* [ ] CORS configured.
* [ ] Environment variables used.
* [ ] Protected APIs verified.
* [ ] Role guards verified.
* [ ] Sensitive information protected.
* [ ] Production error responses do not expose internals.

## Quality

* [ ] Clean architecture verified.
* [ ] Modular design verified.
* [ ] SOLID principles applied appropriately.
* [ ] Code duplication minimized.
* [ ] Reusable components created.
* [ ] Performance reviewed.
* [ ] Responsive UI reviewed.
* [ ] Tests pass.
* [ ] Lint passes.
* [ ] Type checking passes.
* [ ] Build succeeds.

## Documentation

* [ ] README exists.
* [ ] Installation documented.
* [ ] Environment variables documented.
* [ ] Database setup documented.
* [ ] Migration documented.
* [ ] Seed documented.
* [ ] API documentation included where appropriate.
* [ ] Assumptions documented.
* [ ] Limitations documented.
* [ ] Additional features documented.

## Git

* [ ] Meaningful commits exist.
* [ ] Development progress is visible in Git history.
* [ ] No meaningless commit history.
* [ ] All required changes are pushed.
* [ ] Final repository is clean and understandable.

---

# 91. FINAL ENGINEERING PRINCIPLE

The final repository should communicate the following to the Easy Fashion Limited reviewer:

> **This developer can take a real-world software requirement, design a maintainable architecture, build secure APIs, design a proper database, implement authentication and RBAC, build a responsive user interface, handle edge cases, test the system, document it properly, and deliver production-quality software.**

The objective is not simply:

```text
"Make the features work."
```

The objective is:

```text
Requirements
     ↓
Professional Architecture
     ↓
Clean Implementation
     ↓
Secure APIs
     ↓
Proper Database Design
     ↓
Reliable Authentication & RBAC
     ↓
Responsive UI/UX
     ↓
Testing
     ↓
Documentation
     ↓
Professional Git History
     ↓
Production-Quality Delivery
```

---

# 92. GOLDEN RULES

## Rule 1

**READ `AGENTS.md` BEFORE CODING.**

## Rule 2

**READ `CLAUDE.md` AND OTHER PROJECT INSTRUCTIONS BEFORE CODING.**

## Rule 3

**UNDERSTAND THE EXISTING CODEBASE BEFORE MODIFYING IT.**

## Rule 4

**FOLLOW THE EASY FASHION LIMITED ASSESSMENT REQUIREMENTS AS THE FUNCTIONAL SOURCE OF TRUTH.**

## Rule 5

**NEVER COMPROMISE SECURITY FOR CONVENIENCE.**

## Rule 6

**NEVER TRUST CLIENT-SIDE AUTHORIZATION OR CLIENT-SIDE ORDER PRICING.**

## Rule 7

**KEEP BUSINESS LOGIC OUT OF ROUTES AND THIN CONTROLLERS.**

## Rule 8

**USE PROPER DATABASE RELATIONSHIPS, CONSTRAINTS, AND INDEXES.**

## Rule 9

**HANDLE HAPPY PATHS AND FAILURE PATHS.**

## Rule 10

**DO NOT OVER-ENGINEER THE PROJECT.**

## Rule 11

**DO NOT MAKE UNRELATED CHANGES.**

## Rule 12

**VERIFY THE IMPLEMENTATION BEFORE CLAIMING IT IS COMPLETE.**

## Rule 13

**KEEP THE PROJECT PROFESSIONAL ENOUGH THAT A SENIOR ENGINEER CAN REVIEW THE CODEBASE COMFORTABLY.**

## Rule 14

**THE FINAL RESULT MUST DEMONSTRATE ENGINEERING JUDGMENT, NOT JUST FUNCTIONALITY.**
