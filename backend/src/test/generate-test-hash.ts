import bcrypt from 'bcryptjs';

async function generateTestHash() {
    const password = 'password123';
    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash(password, salt);
    console.log('Test password:', password);
    console.log('Generated hash:', hash);
    
    // Verify the hash
    const isValid = await bcrypt.compare(password, hash);
    console.log('Hash verification:', isValid);
}

generateTestHash();