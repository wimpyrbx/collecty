const bcrypt = require('bcrypt');
const db = require('../db');

const SALT_ROUNDS = 10;

async function seedUsers() {
    try {
        // Hash the password
        const hashedPassword = await bcrypt.hash('ltg', SALT_ROUNDS);

        // Insert the test user
        const sql = `
            INSERT INTO users (username, password)
            VALUES (?, ?)
        `;

        await db.runAsync(sql, ['ltg', hashedPassword]);
        console.log('Test user created successfully');
    } catch (err) {
        console.error('Error seeding users:', err);
    } finally {
        db.close();
    }
}

seedUsers(); 