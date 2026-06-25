import { pgTable, uuid, text, timestamp, pgEnum } from "drizzle-orm/pg-core";
import { lawFirms } from "./law-firms";

export const userRoleEnum = pgEnum("user_role", ["admin", "member"]);

export const users = pgTable("users", {
  id: uuid("id").primaryKey().defaultRandom(),
  lawFirmId: uuid("law_firm_id")
    .notNull()
    .references(() => lawFirms.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  // Hashed password — never store plaintext
  passwordHash: text("password_hash"),
  role: userRoleEnum("role").notNull().default("member"),
  avatarUrl: text("avatar_url"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

// OAuth accounts linked to a user (e.g. Gmail)
export const oauthAccounts = pgTable("oauth_accounts", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  provider: text("provider").notNull(), // e.g. "google"
  providerAccountId: text("provider_account_id").notNull(),
  // Tokens are stored encrypted at rest via Supabase column encryption
  accessTokenEncrypted: text("access_token_encrypted"),
  refreshTokenEncrypted: text("refresh_token_encrypted"),
  tokenExpiresAt: timestamp("token_expires_at", { withTimezone: true }),
  scope: text("scope"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});
