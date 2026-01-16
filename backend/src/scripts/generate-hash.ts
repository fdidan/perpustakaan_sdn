import bcrypt from 'bcryptjs';

async function generateHash() {
    const password = 'password123';
    const hash = await bcrypt.hash(password, 10);
    console.log('Generated hash for password123:', hash);
}

generateHash();