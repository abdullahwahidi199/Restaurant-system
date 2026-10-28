---
id: "operator_reference_interface_component_admin_staff_staffformmodal"
title: "Staff Form Modal — controls and fields"
module: "employees"
description: "Staff Form Modal — controls and fields — current Pakhlai operator behavior, controls, validation, and evidence."
keywords: ["employees", "staff", "form", "modal", "controls", "fields"]
roles: ["Admin", "BranchAdmin"]
related_docs: ["operator_modules_employees_staff", "operator_navigation_page_directory", "operator_reference_backend_index"]
frontend_routes: ["/admin/dashboard/staff"]
source_references: ["frontend/src/component/Admin/staff/StaffFormModal.jsx", "frontend/src/i18n.js"]
status: "source_verified"
---

# Staff Form Modal — controls and fields

This reference records the controls and fields declared by `StaffFormModal`. Use [staff](../../modules/employees/staff.md) for the operating procedure and [page directory](../../navigation/page_directory.md) for exact routes and portal access. A component may be reused in several pages; a listed route is a parent page that imports it, not a claim that every control appears there in every state.

Source: `frontend/src/component/Admin/staff/StaffFormModal.jsx`. Labels are resolved from `i18n.js` resources where available. Dynamic labels and icons are identified explicitly. Backend permissions and validation take precedence over a visible control; see [index](../backend/index.md).

## Displayed sections

`Edit Staff Member Add Staff`, `Personal Information Personal Information`, `Job Details Job Details`, `Salary Profile`, `Account Credentials Account Credentials`

## Open and use this interface

1. Open a permitted parent route from the page directory and select the intended branch where applicable.
2. Use the linked module procedure to open this drawer, modal, tab, or detail view.
3. Locate the control by its label below. Set dependent fields before a create/update submit; view, close, cancel, and filter controls do not generally require form completion.
4. Wait for a submitted request to finish. On failure, preserve the form, correct the reported field or prerequisite, and refresh the affected list before retrying a record-changing action.

## Actions and conditions

An action ID identifies a source control, including repeated controls in mobile and desktop layouts. `false branch` means the condition is false. Conditions are source expressions retained to avoid inventing broader permissions.

<a id="action-1"></a>

### Action 1: Close

| Property | Implemented behavior |
|---|---|
| Visible label / accessible name | Close |
| Location | StaffFormModal; JSX button; handler closeModal |
| Appears when | No enclosing conditional in this source; parent component may still restrict rendering. |
| Disabled when | No explicit disabled property on this control. |
| Permission | Parent route role plus endpoint enforcement. Admin, BranchAdmin |
| Operator steps | Locate this control on the described interface; for a create/update submission complete its required fields, then activate Close.  |
| Handler / destination | closeModal |
| Local UI result | Delegated to the named handler/parent; follow the linked module procedure. |

Record/status result, downstream effects, failure recovery, and reversal: [staff](../../modules/employees/staff.md). The backend contract contains exact server rejections; this UI reference does not infer an undo operation from an Edit/Cancel label.

<a id="action-2"></a>

### Action 2: Dynamic/container content; use the control location and handler below

| Property | Implemented behavior |
|---|---|
| Visible label / accessible name | Dynamic/container content; use the control location and handler below |
| Location | StaffFormModal; JSX form; handler handleSubmit |
| Appears when | No enclosing conditional in this source; parent component may still restrict rendering. |
| Disabled when | No explicit disabled property on this control. |
| Permission | Parent route role plus endpoint enforcement. Admin, BranchAdmin |
| Operator steps | Locate this control on the described interface; for a create/update submission complete its required fields, then activate Dynamic/container content; use the control location and handler below.  |
| Handler / destination | handleSubmit |
| Local UI result | setError |

Trace symbols: `formatApiError`, `handleSubmit`.

Record/status result, downstream effects, failure recovery, and reversal: [staff](../../modules/employees/staff.md). The backend contract contains exact server rejections; this UI reference does not infer an undo operation from an Edit/Cancel label.

<a id="action-3"></a>

### Action 3: [icon or dynamic label]

| Property | Implemented behavior |
|---|---|
| Visible label / accessible name | [icon or dynamic label] |
| Location | StaffFormModal; JSX label; handler () =&gt; handleStationToggle(st.id) |
| Appears when | availableStations.length === 0 [false branch] AND formData.role === "Kitchen_manager" |
| Disabled when | No explicit disabled property on this control. |
| Permission | Parent route role plus endpoint enforcement. Admin, BranchAdmin |
| Operator steps | Locate this control on the described interface; for a create/update submission complete its required fields, then activate [icon or dynamic label].  |
| Handler / destination | () =&gt; handleStationToggle(st.id) |
| Local UI result | setSelectedStations |

Trace symbols: `handleStationToggle`.

Record/status result, downstream effects, failure recovery, and reversal: [staff](../../modules/employees/staff.md). The backend contract contains exact server rejections; this UI reference does not infer an undo operation from an Edit/Cancel label.

<a id="action-4"></a>

### Action 4: Dynamic/container content; use the control location and handler below

| Property | Implemented behavior |
|---|---|
| Visible label / accessible name | Dynamic/container content; use the control location and handler below |
| Location | StaffFormModal; JSX button; handler () =&gt; setShowPassword(!showPassword) |
| Appears when | No enclosing conditional in this source; parent component may still restrict rendering. |
| Disabled when | No explicit disabled property on this control. |
| Permission | Parent route role plus endpoint enforcement. Admin, BranchAdmin |
| Operator steps | Locate this control on the described interface; for a create/update submission complete its required fields, then activate Dynamic/container content; use the control location and handler below.  |
| Handler / destination | () =&gt; setShowPassword(!showPassword) |
| Local UI result | setShowPassword |

Record/status result, downstream effects, failure recovery, and reversal: [staff](../../modules/employees/staff.md). The backend contract contains exact server rejections; this UI reference does not infer an undo operation from an Edit/Cancel label.

<a id="action-5"></a>

### Action 5: Cancel

| Property | Implemented behavior |
|---|---|
| Visible label / accessible name | Cancel |
| Location | StaffFormModal; JSX button; handler closeModal |
| Appears when | No enclosing conditional in this source; parent component may still restrict rendering. |
| Disabled when | No explicit disabled property on this control. |
| Permission | Parent route role plus endpoint enforcement. Admin, BranchAdmin |
| Operator steps | Locate this control on the described interface; for a create/update submission complete its required fields, then activate Cancel.  |
| Handler / destination | closeModal |
| Local UI result | Delegated to the named handler/parent; follow the linked module procedure. |

Record/status result, downstream effects, failure recovery, and reversal: [staff](../../modules/employees/staff.md). The backend contract contains exact server rejections; this UI reference does not infer an undo operation from an Edit/Cancel label.

<a id="action-6"></a>

### Action 6: Update Staff Add Staff

| Property | Implemented behavior |
|---|---|
| Visible label / accessible name | Update Staff Add Staff |
| Location | StaffFormModal; JSX button; handler handleSubmit |
| Appears when | No enclosing conditional in this source; parent component may still restrict rendering. |
| Disabled when | No explicit disabled property on this control. |
| Permission | Parent route role plus endpoint enforcement. Admin, BranchAdmin |
| Operator steps | Locate this control on the described interface; for a create/update submission complete its required fields, then activate Update Staff Add Staff.  |
| Handler / destination | handleSubmit |
| Local UI result | setError |

Trace symbols: `formatApiError`, `handleSubmit`.

Record/status result, downstream effects, failure recovery, and reversal: [staff](../../modules/employees/staff.md). The backend contract contains exact server rejections; this UI reference does not infer an undo operation from an Edit/Cancel label.

## Field reference

Required below means the rendered control declares a requirement. Custom submit validation can require additional values; backend requirements are separate in the module guide and backend reference. A blank/default expression is retained where the value comes from a record or parent. `Field` entries describe a wrapper; the following input may be its child, not a second field.

| ID / label | Type / binding | Frontend required | Default or displayed value | Limits / choices | Editability / dependency |
|---|---|---|---|---|---|
| <a id="field-1"></a> F1: Full Name * | input; name | true | "" | No explicit HTML limit here; backend may enforce more. | read-only=false; disabled=false |
| <a id="field-2"></a> F2: Email Address * | email; email | true | "" | No explicit HTML limit here; backend may enforce more. | read-only=false; disabled=false |
| <a id="field-3"></a> F3: Phone Number * | input; phone | true | "" | No explicit HTML limit here; backend may enforce more. | read-only=false; disabled=false |
| <a id="field-4"></a> F4: Hire Date Hire Date | date; hire_date | Not declared; see submit validation | "" | No explicit HTML limit here; backend may enforce more. | read-only=false; disabled=false |
| <a id="field-5"></a> F5: Profile Image Profile Image | file; image | Not declared; see submit validation | null | accept=image/* | read-only=false; disabled=false |
| <a id="field-6"></a> F6: Role Role * | select; role | true | "" | ; choices: Select Role [], Manager Manager [Manager], Kitchen Manager [Kitchen_manager], Inventory Manager [InventoryManager], Finance Manager [FinanceManager], Operations Manager [OperationsManager], Cashier [Cashier], Call Operator [Call_operator], Waiter [Waiter], Delivery Boy [DeliveryBoy], Other [Other] | read-only=false; disabled=false |
| <a id="field-7"></a> F7: Assign Kitchen Stations * | checkbox; isChecked | Not declared; see submit validation | isChecked | No explicit HTML limit here; backend may enforce more. | read-only=false; disabled=false; shown when availableStations.length === 0 [false branch] AND formData.role === "Kitchen_manager" |
| <a id="field-8"></a> F8: Shift Shift | select; shift | Not declared; see submit validation | "" | ; choices: Select Shift [] | read-only=false; disabled=false |
| <a id="field-9"></a> F9: Status Status | select; status | Not declared; see submit validation | "Active" | ; choices: Active [Active], Inactive [Inactive], Resigned [Resigned] | read-only=false; disabled=false |
| <a id="field-10"></a> F10: Custom Role | input; custom_role | Not declared; see submit validation | "" | No explicit HTML limit here; backend may enforce more. | read-only=false; disabled=false; shown when formData.role === "Other" |
| <a id="field-11"></a> F11: Vehicle Number Vehicle Number | text; vehicle_number | Not declared; see submit validation | "" | No explicit HTML limit here; backend may enforce more. | read-only=false; disabled=false; shown when formData.role === "DeliveryBoy" |
| <a id="field-12"></a> F12: Salary Type | select; salary_type | Not declared; see submit validation | "monthly" | ; choices: Monthly [monthly], Weekly [weekly], Daily [daily], Hourly [hourly] | read-only=false; disabled=false |
| <a id="field-13"></a> F13: Base Salary | number; payroll_base_salary | Not declared; see submit validation | "" | min=0; step=0.01 | read-only=false; disabled=false |
| <a id="field-14"></a> F14: Payment Day | number; payment_day | Not declared; see submit validation | 1 | min=1; max=31 | read-only=false; disabled=false |
| <a id="field-15"></a> F15: Allowances | number; payroll_allowances | Not declared; see submit validation | "" | min=0; step=0.01 | read-only=false; disabled=false |
| <a id="field-16"></a> F16: Deductions | number; payroll_deductions | Not declared; see submit validation | "" | min=0; step=0.01 | read-only=false; disabled=false |
| <a id="field-17"></a> F17: Overtime Rate | number; overtime_rate | Not declared; see submit validation | "" | min=0; step=0.01 | read-only=false; disabled=false |
| <a id="field-18"></a> F18: Payroll Notes | textarea; payroll_notes | Not declared; see submit validation | "" | No explicit HTML limit here; backend may enforce more. | read-only=false; disabled=false |
| <a id="field-19"></a> F19: Active Payroll Status | checkbox; is_payroll_active | Not declared; see submit validation | true | No explicit HTML limit here; backend may enforce more. | read-only=false; disabled=false |
| <a id="field-20"></a> F20: Username | text; username | Not declared; see submit validation | "" | No explicit HTML limit here; backend may enforce more. | read-only=false; disabled=false |
| <a id="field-21"></a> F21: Password {!editingStaff && &lt;span className="text-red-400"&gt; *&lt;/span&gt;} | showPassword ? "text" : "password"; password | Not declared; see submit validation | "" | No explicit HTML limit here; backend may enforce more. | read-only=false; disabled=false |

## Submission and validation evidence

- `handleSubmit`: `if ( !formData.name \|\| !formData.role \|\| !formData.email \|\| !formData.phone ) {`; `if (key === "image" && !value) continue; if (value === null \|\| value === undefined) continue; if (decimalFields.has(key)) {`; `if (integerFields.has(key)) { data.append(key, value === "" ? "1" : String(value)); continue; } if (typeof value === "boolean") {`; `if (value === "" && optionalTextFields.has(key)) continue; if (value !== "") { data.append(key, value); } } if (formData.role === "Kitchen_manager") {`; `if (editingStaff) await updateStaff(editingStaff.id, data); else await addStaff(data); closeModal(); } catch (err) {`

On success, follow the module’s next step; closing a modal is not evidence that an unacknowledged request succeeded. On failure, the feedback below and backend reference identify the available messages.

## Messages and feedback

| UI mechanism | Message or exact runtime source |
|---|---|
| `setError` | Please fill all required fields. |
| `setError` | formatApiError(err.response?.data \|\| err.message) |

Cause and operator resolution: [errors and recovery](../../troubleshooting/errors_and_recovery.md) and the module procedure. Runtime expressions indicate the UI displays a server value; they are not invented fixed error messages.

## Verified language labels

`fa` is the repository’s Dari/Persian resource; `ps` is Pashto. A missing resource is shown as “missing; fallback applies.”

| Key | English | fa | ps |
|---|---|---|---|
| `inventory_manager.common.close` | Close | بستن | بندول |
| `menu.sort.default` | Default | پیش‌فرض | اصلي |
| `staff.cancel` | Cancel | لغو | لغوه کول |
| `staff.update` | Update Staff | به‌روزرسانی کارمند | کارکوونکی تازه کول |
| `staff.add` | Add Staff | افزودن کارمند | کارکوونکی اضافه کول |
| `staff.form.full_name` | Full Name | نام کامل | بشپړ نوم |
| `staff.form.email` | Email Address | ایمیل | برېښنالیک |
| `staff.form.phone` | Phone Number | شماره تماس | د تلیفون شمېره |
| `staff.form.select_role` | Select Role | انتخاب وظیفه | دنده وټاکئ |
| `staff.roles.admin` | Admin | مدیر | ادمن |
| `legacy.branch_admin_f4fa2fb1` | Branch Admin | اداره شعبه | د څانګې مدیر |
| `staff.roles.manager` | Manager | مدیر | مدیر |
| `legacy.kitchen_manager_f750ba36` | Kitchen Manager | مدیر آشپزخانه | د پخلنځی مدیر |
| `inventory_manager.topbar.title` | Inventory Manager | مدیر انبار | د انبار مدیر |
| `legacy.finance_manager_dff996c0` | Finance Manager | مدیر مالی | مالی مدیر |
| `legacy.operations_manager_72cfe578` | Operations Manager | مدیر عملیات | د عملیاتو مدیر |
| `staff.roles.cashier` | Cashier | صندوق‌دار | کیشر |
| `legacy.call_operator_6845a9a1` | Call Operator | اپراتور تماس | کال اپریټر |
| `staff.roles.waiter` | Waiter | خدمتگار | ویټر |
| `staff.roles.delivery` | Delivery Boy | پیک موتوری | رسوونکی |
| `staff.roles.other` | Other | دیگر | نور |
| `staff.form.select_shift` | Select Shift | انتخاب شیفت | شفټ وټاکئ |
| `staff.status.active` | Active | فعال | فعال |
| `staff.status.inactive` | Inactive | غیرفعال | غیر فعال |
| `staff.status.resigned` | Resigned | استعفا داده | استعفا ورکړی |
| `staff.form.custom_role` | Custom Role | وظیفه دلخواه | خپل دنده |
| `staff.vehicle` | Vehicle Number | شماره موتر | د موټر نمبر |
| `legacy.monthly_d31edb7b` | Monthly | ماهانه | میاشتنی |
| `legacy.weekly_158f3da5` | Weekly | هفتگی | اونیزه |
| `legacy.daily_728298d3` | Daily | روزانه | ورځنۍ ورځ |
| `legacy.hourly_d9362548` | Hourly | ساعتی | په ساعت کې |
| `staff.form.username` | Username | نام کاربری | کارن نوم |
| `staff.form.password_optional` | Leave blank to keep current | اگر نمی‌خواهید تغییر دهید خالی بگذارید | که نه غواړې بدل یې کړې خالي پرېږده |
| `staff.form.password` | Password | رمز عبور | پاسورډ |
