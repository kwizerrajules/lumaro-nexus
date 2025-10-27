import dotenv from "dotenv";

dotenv.config();

export const config = {
  db: {
    host: process.env.MYSQL_HOST_NAME || "localhost",
    user: process.env.MYSQL_USERNAME || "root",
    password: process.env.MYSQL_PASSWORD || "",
    database: process.env.MYSQL_DATABASE_NAME || "abradaca",
    port: parseInt(process.env.MYSQL_PORT || "3306", 10),
  },
};
