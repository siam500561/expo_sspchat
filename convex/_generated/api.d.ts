/* prettier-ignore-start */

/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";
import type * as crons from "../crons.js";
import type * as expoToken from "../expoToken.js";
import type * as message from "../message.js";
import type * as online from "../online.js";
import type * as sohana_typing from "../sohana_typing.js";
import type * as tasks from "../tasks.js";
import type * as typing from "../typing.js";

/**
 * A utility for referencing Convex functions in your app's API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
declare const fullApi: ApiFromModules<{
  crons: typeof crons;
  expoToken: typeof expoToken;
  message: typeof message;
  online: typeof online;
  sohana_typing: typeof sohana_typing;
  tasks: typeof tasks;
  typing: typeof typing;
}>;
export declare const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
>;
export declare const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
>;

/* prettier-ignore-end */
