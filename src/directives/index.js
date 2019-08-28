import { AuthDirective } from "./auth";
import { GuestDirective } from "./guest";
import { AdminDirective } from "./admin";

export const schemaDirectives = {
  auth: AuthDirective,
  guest: GuestDirective,
  admin: AdminDirective,
}