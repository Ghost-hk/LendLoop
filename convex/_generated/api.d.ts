/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type * as admin_mutations from "../admin/mutations.js";
import type * as admin_queries from "../admin/queries.js";
import type * as audit_helpers from "../audit/helpers.js";
import type * as audit_table from "../audit/table.js";
import type * as automation_events from "../automation/events.js";
import type * as lib_access from "../lib/access.js";
import type * as lib_dates from "../lib/dates.js";
import type * as lib_errors from "../lib/errors.js";
import type * as lib_functions from "../lib/functions.js";
import type * as lib_input from "../lib/input.js";
import type * as lib_validators from "../lib/validators.js";
import type * as loans_helpers from "../loans/helpers.js";
import type * as loans_mutations from "../loans/mutations.js";
import type * as loans_queries from "../loans/queries.js";
import type * as loans_table from "../loans/table.js";
import type * as tools_helpers from "../tools/helpers.js";
import type * as tools_mutations from "../tools/mutations.js";
import type * as tools_queries from "../tools/queries.js";
import type * as tools_table from "../tools/table.js";
import type * as users_internal from "../users/internal.js";
import type * as users_mutations from "../users/mutations.js";
import type * as users_queries from "../users/queries.js";
import type * as users_table from "../users/table.js";

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";

declare const fullApi: ApiFromModules<{
  "admin/mutations": typeof admin_mutations;
  "admin/queries": typeof admin_queries;
  "audit/helpers": typeof audit_helpers;
  "audit/table": typeof audit_table;
  "automation/events": typeof automation_events;
  "lib/access": typeof lib_access;
  "lib/dates": typeof lib_dates;
  "lib/errors": typeof lib_errors;
  "lib/functions": typeof lib_functions;
  "lib/input": typeof lib_input;
  "lib/validators": typeof lib_validators;
  "loans/helpers": typeof loans_helpers;
  "loans/mutations": typeof loans_mutations;
  "loans/queries": typeof loans_queries;
  "loans/table": typeof loans_table;
  "tools/helpers": typeof tools_helpers;
  "tools/mutations": typeof tools_mutations;
  "tools/queries": typeof tools_queries;
  "tools/table": typeof tools_table;
  "users/internal": typeof users_internal;
  "users/mutations": typeof users_mutations;
  "users/queries": typeof users_queries;
  "users/table": typeof users_table;
}>;

/**
 * A utility for referencing Convex functions in your app's public API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
export declare const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
>;

/**
 * A utility for referencing Convex functions in your app's internal API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = internal.myModule.myFunction;
 * ```
 */
export declare const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
>;

export declare const components: {};
