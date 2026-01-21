console.log("Hello World");

import { getClient } from "@/app/lib/server/db";

async function seed(){
    const client = getClient();
    await client.connect();
    const res = await client.query(`
            CREATE TABLE IF NOT EXISTS role (
               idRole SERIAL PRIMARY KEY,
               name VARCHAR(10) UNIQUE NOT NULL
            );

            CREATE TABLE IF NOT EXISTS users (
               idUsr SERIAL PRIMARY KEY,
               email VARCHAR(255) UNIQUE NOT NULL,
               password VARCHAR(255) NOT NULL,
               idRole INT,
               crated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        `);

    console.log(res.rows);

    await client.end();

}

seed().catch(console.error);