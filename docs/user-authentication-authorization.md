# User Authentication and Authorization

Last reviewed: 2026-10-28

This document describes the authentication and authorization behavior currently implemented in the Pakhlai Restaurant System. It is limited to staff/user management, login sessions, roles, permissions, restaurant isolation, and branch access.

## 1. Executive summary

The project uses two related identity records:

- Django's built-in `auth.User` stores the username, password hash, and Django account flags such as `is_active`, `is_staff`, and `is_superuser`.
- `users.Staff` stores the restaurant employee profile, application role, restaurant, branches, active branch, employment status, and operational assignments.

Authentication is performed with Django REST Framework and Simple JWT. Authorization is primarily custom role-based access control using `Staff.role`, supplemented by restaurant and branch scoping.

The application does **not** use Django Groups as its main role system. Django's permission framework is used only for two optional user-activity capabilities:

- `users.monitor_user_activity`
- `users.revoke_user_sessions`

Those permissions can be assigned directly to a Django user or inherited through a Django Group because the code calls Django's standard `user.has_perm(...)`. No project code currently creates or assigns Groups.

## 2. Identity model

### Django `User`

The project uses Django's standard `django.contrib.auth.models.User`; it does not define a custom `AUTH_USER_MODEL`.

Important fields are:

| Field | Meaning in this project |
| --- | --- |
| `username` | Login identifier used by the staff JWT endpoint. |
| `password` | Django password hash. Passwords are set with `set_password()`. |
| `is_active` | The actual Django account-enabled flag. Simple JWT rejects inactive users. |
| `is_staff` | Allows access to Django's `/admin/` site when the user also has the necessary Django admin permissions. It does not grant React application access. |
| `is_superuser` | Grants Django superuser privileges and is the authoritative backend check for platform `SuperAdmin` access. |

### `Staff` profile

`users.Staff` has an optional one-to-one relation to `User` through `user.staff_profile`.

The profile contains:

- application role and optional `custom_role`;
- restaurant membership;
- assigned branches and current active branch;
- shift and kitchen-station assignments;
- profile/contact and payroll information;
- `status`: `Active`, `Inactive`, or `Resigned`;
- `is_demo`, which prevents some mutations.

A `Staff` record can exist without a `User`, in which case it is an employee record but cannot log in. The staff serializer creates a Django user only when both a username and password are supplied.

### Important distinction between flags and profiles

The Django admin site and React staff application do not use the same access test:

- Django admin access is based on Django authentication and `User.is_staff`/Django permissions.
- React staff access uses the JWT endpoint and the role returned from `Staff.role`, or `SuperAdmin` for a Django superuser without a staff profile.

Therefore, being able to log into `/admin/` does not by itself mean an account has a restaurant staff profile or application role.

## 3. Authentication flow

### Login

The React staff login sends the username and password to:

```text
POST /api/users/token/
```

`MyTokenObtainPairSerializer` delegates credential validation to Simple JWT/Django and then adds application data to the response and token.

For a user with a `Staff` profile, the response contains information such as:

- access and refresh JWTs;
- role and staff ID;
- restaurant ID;
- active branch and available branches;
- station assignments;
- whether branch selection is required;
- activity-monitoring and session-revocation capability flags;
- a managed session ID when the staff profile belongs to a restaurant.

Role classification at login is:

1. If the user has a `Staff` profile, use `Staff.role`.
2. If there is no staff profile, return `Customer`, including when the Django user is a superuser.

This means a Django `is_staff=True` or `is_superuser=True` account without a `Staff` profile is not recognized as a React staff user by this token response.

### JWT lifetime and rotation

Current Simple JWT settings are:

| Setting | Value |
| --- | --- |
| Access-token lifetime | 1 day |
| Refresh-token lifetime | 5 days |
| Refresh rotation | Enabled |
| Old refresh-token blacklisting | Enabled |
| Authorization scheme | `Bearer <token>` |

Refresh requests use:

```text
POST /api/users/token/refresh/
```

### Managed server-side sessions

Restaurant staff logins also create an `AuthSession`. The refresh token receives an `sid` claim identifying this session.

`SessionJWTAuthentication` performs normal JWT validation and, when an `sid` is present, confirms that the server-side session:

- has not been logged out;
- has not been revoked;
- has not passed its refresh expiry.

Session validity is cached in Redis. Administrators with the required authorization can revoke one session or all sessions for a user. Refresh tokens are blacklisted when possible, and subsequent access using a revoked managed session is rejected.

The `SESSION_REQUIRE_SID_FOR_STAFF` setting is currently configurable and defaults to false. When enabled, staff access tokens without a managed-session ID are rejected and the user must sign in again.

### Login rate limiting

Staff login is rate-limited using hashed username and client-IP counters in Django's cache. Production requires a shared cache; the current configuration uses Redis.

The limits are stored in the singleton `LoginRateLimitConfig` record and include:

- enabled/disabled state;
- maximum failed attempts;
- counting window;
- lockout duration.

Only a Django superuser can manage this configuration through `/api/users/security/login-rate-limit/`.

### Frontend token handling

The React application stores the following in `localStorage`:

- `authTokens` containing access and refresh tokens;
- `user` containing the returned role/profile context;
- `branches`;
- `activeBranch`.

The Axios interceptor adds the bearer token and, when available, the `X-Branch-ID` header. On a 401 response it attempts one token refresh, updates local storage, retries queued requests, and redirects to the staff login page if refresh fails.

`RequireAuth` provides client-side route guarding. This improves navigation and user experience, but it is not the security boundary. Backend DRF permission classes and queryset scoping must enforce every authorization rule.

## 4. Application roles

The allowed values in `Staff.ROLE_CHOICES` are:

| Stored value | Display name | Frontend home route | Current user-management relevance |
| --- | --- | --- | --- |
| `SuperAdmin` | Super Admin | `/super-admin` | A role value exists, but true platform super-admin checks generally require `User.is_superuser`. |
| `Admin` | Admin | `/admin/dashboard` | Full-restaurant administrator; can access all active branches and manage staff. |
| `BranchAdmin` | Branch Admin | `/admin/dashboard` | Administrator restricted to exactly one assigned branch; can manage non-privileged staff in that branch. |
| `Manager` | Manager | `/manager` | Operational manager; no staff-management API permission by default. |
| `FinanceManager` | Finance Manager | `/finance-manager` | Can list staff and currently can retrieve/update/delete staff through the detail API. |
| `OperationsManager` | Operations Manager | `/operations-manager` | Can list staff but cannot create staff because of an additional POST check; no detail endpoint permission. |
| `InventoryManager` | Inventory Manager | `/inventory-manager` | No staff-management API permission by default. |
| `Cashier` | Cashier | `/cashier` | No staff-management API permission by default. |
| `Call_operator` | Call Operator | `/call-operator` | No staff-management API permission by default. |
| `Waiter` | Waiter | `/waiter` | No staff-management API permission by default. |
| `Kitchen_manager` | Kitchen Manager | `/kitchen` | Can be assigned to kitchen stations; no staff-management API permission by default. |
| `DeliveryBoy` | Delivery Boy | No configured staff home route | Used for delivery assignment; no general staff-management permission. |
| `Other` | Other | No configured staff home route | Stores an optional `custom_role`; it does not automatically receive a dashboard or permissions. |

The role strings are case-sensitive and include underscores in `Call_operator` and `Kitchen_manager`.

### `SuperAdmin`: role versus Django superuser

These are not fully interchangeable:

- The staff model permits `role="SuperAdmin"`.
- The main `IsSuperAdmin` permission checks `request.user.is_superuser`, not the role string.
- Creating or changing a staff profile to the `SuperAdmin` role does not set `User.is_superuser`.

For reliable platform-super-admin access, the Django user must be a real Django superuser.

### Custom roles

`Staff.custom_role` is mostly descriptive. The `users.permissions.HasStaffRole` implementation can compare it with an allowed role, but `restaurants.permissions.HasStaffRole` only checks `Staff.role`. The current specific permission classes do not establish a complete custom-role policy. A custom role should therefore not be treated as a reliable way to grant application permissions.

## 5. Authorization layers

Authorization is enforced through several layers.

### Authentication requirement

DRF's default permission is `IsAuthenticated`, and its default authentication class is `SessionJWTAuthentication`.

### Role permission classes

Custom DRF permission classes compare `Staff.role` with allowed role lists, for example:

- `IsRestaurantAdmin`: `Admin` or `BranchAdmin`;
- `IsManager`;
- `IsInventoryManager`;
- `IsOperationsManager`;
- `IsFinanceManager`;
- `IsCashier`;
- `IsCallOperator`;
- `IsWaiter`;
- `IsKitchenManager`;
- `IsDeliveryBoy`.

Views frequently combine role permissions with DRF's bitwise OR syntax, such as `IsRestaurantAdmin | IsFinanceManager`.

There are two separate `HasStaffRole` implementations in `users.permissions` and `restaurants.permissions`. Their behavior is not identical:

- `users.permissions.HasStaffRole` lets Django superusers bypass role checks and considers `custom_role`.
- `restaurants.permissions.HasStaffRole` requires a staff profile and checks only the standard role.

Developers must check which module a view imports before assuming superuser or custom-role behavior.

### Restaurant isolation

`IsSameRestaurant` object permissions and restaurant-filtered querysets are used to prevent one restaurant's users from accessing another restaurant's records.

Object permissions alone do not automatically filter list endpoints. The code also scopes querysets using the authenticated user's restaurant and branch context.

### Restaurant/subscription state

`IsRestaurantActive` rejects ordinary staff access when:

- the restaurant is inactive;
- no subscription exists;
- the subscription is inactive;
- the current date is outside the subscription period.

Django superusers bypass this check.

### Branch scoping

Branch access is part of authorization, not just UI filtering.

- `Admin` and `SuperAdmin` staff roles are treated as all-branch roles for a restaurant.
- `BranchAdmin` is restricted to exactly one assigned branch and cannot switch to or request all branches.
- Other staff roles can access their explicitly assigned active branches.
- The frontend sends the selected branch in `X-Branch-ID`.
- Backend helpers validate that the branch belongs to the staff member's restaurant and is accessible to that staff member.
- Queryset helpers filter records to the active/requested branch or to all permitted branches.

### Frontend route roles

React's `RequireAuth` checks that an access token exists and, where configured, that the stored role is in the route's `allowedRoles`. For example, `/admin/dashboard` permits `Admin` and `BranchAdmin`, while `/super-admin` permits `SuperAdmin`.

This is a client-side convenience only. A user can alter local storage or call the API directly, so backend authorization remains mandatory.

## 6. User-management permissions

The main staff-management endpoints are:

```text
GET, POST              /api/users/staff/
GET, PUT, PATCH, DELETE /api/users/staff/<id>/
```

### Current backend matrix

| Operation | Current allowed roles | Additional behavior |
| --- | --- | --- |
| List staff | `Admin`, `BranchAdmin`, `FinanceManager`, `OperationsManager` | Results are restaurant/branch scoped. |
| Create staff | Outer permission allows the same four roles, but an internal check permits only `Admin` and `BranchAdmin` | Demo users are blocked. Branch Admin restrictions are applied by the serializer. |
| Retrieve one staff member | `Admin`, `BranchAdmin`, `FinanceManager` | Queryset is restaurant/branch scoped. |
| Update staff | `Admin`, `BranchAdmin`, `FinanceManager` | Demo users are blocked. Branch Admin privilege and branch restrictions are applied by the serializer. |
| Delete staff | `Admin`, `BranchAdmin`, `FinanceManager` | Demo users are blocked. Branch Admin cannot delete administrator accounts. |

The React staff-management page is nested under the `Admin`/`BranchAdmin` dashboard route, so Finance and Operations managers do not normally see it in the UI. That does not change their current backend API permissions.

### Branch Admin restrictions

A Branch Admin:

- is locked to one branch;
- can only see/manage staff in the permitted branch scope;
- cannot create `Admin`, `SuperAdmin`, or `BranchAdmin` accounts;
- cannot manage another privileged administrator account;
- cannot promote a user to a privileged administrator role;
- cannot change their own role;
- cannot assign or move staff to another branch.

The frontend also hides `Admin` and `BranchAdmin` role options from Branch Admin users, but the backend serializer is the authoritative enforcement.

### Admin behavior

An Admin has all active branches in their restaurant and can switch branches. The frontend staff form exposes `Admin` and `BranchAdmin` options only to an Admin.

The backend role choices also accept `SuperAdmin`, although the frontend does not expose it in this form. Assigning that role does not make the underlying Django user a superuser.

### User creation and password changes

When creating a staff profile:

- if both username and password are supplied, a Django `User` is created and linked;
- if either is missing, no login user is created;
- `User.is_staff` and `User.is_superuser` are not set by this flow;
- the password is hashed using `set_password()`.

When updating a staff profile:

- username and password can be changed;
- a missing linked user can be created when a username is supplied;
- changing `Staff.status` does not change `User.is_active`.

## 7. Does the project use Django Groups and permissions?

### Groups

Not as the application's role system.

There are no project code paths that create Django Groups, map `Staff.role` to a Group, or assign users to Groups. The application roles are strings stored in `Staff.role` and are checked by custom DRF permission classes.

Because the standard Django `User` model is used, the database and Django admin still support Groups. A manually assigned Group can grant Django model permissions or the two custom permissions described below, but it does not grant a Pakhlai `Staff.role` or satisfy role checks such as `IsFinanceManager`.

### Django permissions

The project defines these custom permissions on `AuthSession`:

```text
users.monitor_user_activity
users.revoke_user_sessions
```

They are checked with `user.has_perm(...)`, so they may be assigned directly to a user or through a Django Group.

Role-based defaults are also present:

- `Admin` and `BranchAdmin` may monitor activity without the explicit Django permission.
- `Admin` may revoke sessions without the explicit Django permission.
- Django superusers pass both checks.

Most other authorization does not use Django's per-model `add`, `change`, `delete`, or `view` permissions. It uses the custom role, restaurant, subscription, and branch checks described above.

## 8. Account-state behavior

Several similarly named status fields have different effects:

| State | Current effect |
| --- | --- |
| `User.is_active=False` | Prevents normal Django/Simple JWT authentication. This is the effective account-disable switch. |
| `Staff.status="Inactive"` | Employment/profile status only. It is not checked by the JWT login flow and does not currently prevent login. |
| `Staff.status="Resigned"` | Also does not currently prevent login. |
| `Restaurant.is_active=False` | Blocks endpoints protected by `IsRestaurantActive`. |
| Invalid/inactive subscription | Blocks endpoints protected by `IsRestaurantActive`. |
| `Staff.is_demo=True` | Blocks selected write operations, including staff creation/update/deletion, but is not a general read-only permission system. |
| Revoked/ended `AuthSession` | Rejects JWTs carrying that managed session's `sid`. |

## 9. Current gaps and security-sensitive behavior

These points describe the code as currently implemented and should be reviewed before treating the authorization model as complete.

1. **Public administrative/debug endpoints exist.** `/api/users/create-admin/` and `/api/users/debug-users/` are decorated with `AllowAny`. The first contains hard-coded superuser creation logic, and the second returns user fields including password hashes. These endpoints should be removed or locked down immediately in production.

2. **Finance Manager can mutate staff through the backend detail endpoint.** `staffDetailsView` permits `IsRestaurantAdmin | IsFinanceManager` for all supported methods, including update and delete. The frontend does not expose this page to Finance Managers, but direct API calls remain possible.

3. **Deleting a Staff profile does not delete or deactivate its Django User.** The one-to-one relationship cascades when the `User` is deleted, not when `Staff` is deleted. A deleted staff member's linked user can remain active. On subsequent JWT login, a user without a staff profile is classified as `Customer`, including a Django superuser.

4. **Employment status does not disable authentication.** Setting `Staff.status` to `Inactive` or `Resigned` does not set `User.is_active=False` and is not checked during login.

5. **Role and Django-superuser state can disagree.** A `Staff.role="SuperAdmin"` account is not necessarily a Django superuser, and a Django `is_staff` account is not necessarily a React staff user.

6. **Duplicate role-permission implementations differ.** `users.permissions.HasStaffRole` and `restaurants.permissions.HasStaffRole` have different superuser and custom-role behavior, which can produce inconsistent authorization across endpoints.

7. **Frontend authorization is broader in appearance than in enforcement.** Hiding a route or role option is useful UX but must never replace backend permission checks. Current backend access should be audited independently of navigation visibility.

8. **JWTs are stored in `localStorage`.** This is common in the current frontend design, but any successful cross-site-scripting attack could read the access and refresh tokens. Strong content security policy and XSS prevention are important.

9. **Password validators are configured but not explicitly called by the staff serializer.** `set_password()` hashes a password but does not run Django's configured password validators. Password-strength validation should be invoked explicitly if the same policy is expected outside Django admin forms.

## 10. Relevant implementation files

| Area | File |
| --- | --- |
| Staff roles/profile and managed sessions | `backend/backend/users/models.py` |
| Staff creation/update validation | `backend/backend/users/serializers.py` |
| Login/token response and staff-management endpoints | `backend/backend/users/views.py` |
| Session-aware JWT authentication | `backend/backend/users/authentication.py` |
| Refresh/session creation | `backend/backend/users/session_tokens.py` |
| Activity/session authorization and revocation | `backend/backend/users/session_views.py` |
| User permission classes | `backend/backend/users/permissions.py` |
| Restaurant role and state permissions | `backend/backend/restaurants/permissions.py` |
| Branch authorization/scoping | `backend/backend/restaurants/branching.py` |
| JWT/DRF/cache settings | `backend/backend/backend/settings.py` |
| React authentication context | `frontend/src/api/authforRBC.jsx` |
| Axios bearer/refresh/branch handling | `frontend/src/api/axiosInstance.jsx` |
| React route guard | `frontend/src/api/ReauireAuth.jsx` |
| Role-to-home-route mapping | `frontend/src/config/staffRoutes.js` |
| Staff-management UI | `frontend/src/component/Admin/staff/` |

