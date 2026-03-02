import { config } from "dotenv";
import path from "path";

config({ path: path.resolve(process.cwd(), ".env") });

import { db } from "./index";
import { books } from "./schema";

async function seed() {
  console.log("Début du remplissage des données...");

  try {

    const testBooks = [
      {
        title: "Le Petit Prince",
        author: "Antoine de Saint-Exupéry",
        isbn: "9782070612758",
        stock: 5,
        availableStock: 5,
      },
      {
        title: "Clean Code",
        author: "Robert C. Martin",
        isbn: "9780132350884",
        stock: 2,
        availableStock: 0, 
      },
      {
        title: "Refactoring",
        author: "Martin Fowler",
        isbn: "9780134757599",
        stock: 3,
        availableStock: 1, 
      },
      {
        title: "L'Alchimiste",
        author: "Paulo Coelho",
        isbn: "9782290004449",
        stock: 10,
        availableStock: 10,
      }
    ];

    await db.insert(books).values(testBooks);
    console.log("Données insérées avec succès !");
    process.exit(0);
  } catch (error) {
    console.error("Erreur lors du seed :", error);
    process.exit(1);
  }
}

seed();