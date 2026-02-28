import { pgTable, text, timestamp, uuid, integer, pgEnum, boolean } from "drizzle-orm/pg-core";

export const roleEnum = pgEnum("role", ["ADMIN", "LIBRARIAN", "MEMBER"]);

// Table Users étendue pour l'Auth professionnelle
export const users = pgTable("user", {
  id: text("id").primaryKey(), // Better-auth utilise des string IDs par défaut
  name: text("name").notNull(),
  email: text("email").unique().notNull(),
  emailVerified: boolean("email_verified").notNull(),
  image: text("image"),
  role: text("role").default("MEMBER").notNull(),
  createdAt: timestamp("created_at").notNull(),
  updatedAt: timestamp("updated_at").notNull(),
  suspendedUntil: timestamp("suspended_until"), // Date jusqu'à laquelle l'user est banni
  fineBalance: integer("fine_balance").default(0).notNull(), // Amende en centimes (ex: 500 = 5.00€)
});

// Tables requises par Better-Auth pour la gestion des sessions
export const sessions = pgTable("session", {
    id: text("id").primaryKey(),
    expiresAt: timestamp("expires_at").notNull(),
    token: text("token").notNull().unique(),
    createdAt: timestamp("created_at").notNull(),
    updatedAt: timestamp("updated_at").notNull(),
    ipAddress: text("ip_address"),
    userAgent: text("user_agent"),
    userId: text("user_id").notNull().references(() => users.id),
});

export const accounts = pgTable("account", {
    id: text("id").primaryKey(),
    accountId: text("account_id").notNull(),
    providerId: text("provider_id").notNull(),
    userId: text("user_id").notNull().references(() => users.id),
    accessToken: text("access_token"),
    refreshToken: text("refresh_token"),
    idToken: text("id_token"),
    accessTokenExpiresAt: timestamp("access_token_expires_at"),
    refreshTokenExpiresAt: timestamp("refresh_token_expires_at"),
    scope: text("scope"),
    password: text("password"),
    createdAt: timestamp("created_at").notNull(),
    updatedAt: timestamp("updated_at").notNull(),
});

export const verifications = pgTable("verification", {
    id: text("id").primaryKey(),
    identifier: text("identifier").notNull(),
    value: text("value").notNull(),
    expiresAt: timestamp("expires_at").notNull(),
    createdAt: timestamp("created_at"),
    updatedAt: timestamp("updated_at"),
});

// Vos tables métier (Livres et Emprunts)
export const books = pgTable("books", {
  id: uuid("id").primaryKey().defaultRandom(),
  title: text("title").notNull(),
  author: text("author").notNull(),
  isbn: text("isbn").unique().notNull(),
  stock: integer("stock").default(0).notNull(),
  availableStock: integer("available_stock").default(0).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const borrowings = pgTable("borrowings", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: text("user_id").references(() => users.id, { onDelete: "cascade" }).notNull(),
  bookId: uuid("book_id").references(() => books.id, { onDelete: "cascade" }).notNull(),
  borrowedAt: timestamp("borrowed_at").defaultNow().notNull(),
  dueDate: timestamp("due_date").notNull(),
  returnedAt: timestamp("returned_at"),
});