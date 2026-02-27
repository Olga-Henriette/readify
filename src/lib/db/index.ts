import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";

const connectionString = process.env.DATABASE_URL!;

// Configuration du client pour le développement (singleton pour éviter trop de connexions)
const client = postgres(connectionString);
export const db = drizzle(client, { schema });