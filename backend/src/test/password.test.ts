import { expect, test, describe } from "bun:test";
import bcrypt from 'bcryptjs';

describe('Password Hash Testing', () => {
    const plainPassword = 'password123';
    // Hash dari seeder (ambil dari init.sql)
    const seederHash = '$2a$10$OSkNsvXLi4inMt4F5mPKp.4fkBkuM1jKIpW9Ay9hJOdsQIVMVSaEq';
    
    test('should verify password from seeder', async () => {
        const isMatch = await bcrypt.compare(plainPassword, seederHash);
        expect(isMatch).toBe(true);
    });

    test('should generate correct hash format', async () => {
        const newHash = await bcrypt.hash(plainPassword, 10);
        console.log('Generated hash:', newHash);
        // Verifikasi format hash
        expect(newHash).toMatch(/^\$2[ab]\$\d+\$/);
        // Verifikasi panjang hash
        expect(newHash.length).toBeGreaterThan(50);
    });

    test('should successfully hash and verify password', async () => {
        // Generate hash baru
        const newHash = await bcrypt.hash(plainPassword, 10);
        // Verify dengan password yang sama
        const isMatch = await bcrypt.compare(plainPassword, newHash);
        expect(isMatch).toBe(true);
    });
});