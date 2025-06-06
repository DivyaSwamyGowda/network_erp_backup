// helpers/password.util.ts
import * as bcrypt from 'bcrypt';

  class PasswordUtil {
    private static readonly SALT_ROUNDS = 10; // Recommended number of salt rounds

    /**
     * Hash a plaintext password
     * @param password Plaintext password
     * @returns Promise<string> Hashed password
     */
    static async hashPassword(password: string): Promise<string> {
        if (!password) {
            throw new Error('Password cannot be empty');
        }
        return await bcrypt.hash(password, this.SALT_ROUNDS);
    }

    /**
     * Verify a password against a hash
     * @param password Plaintext password
     * @param hash Hashed password
     * @returns Promise<boolean> True if the password matches the hash
     */
    static async verifyPassword(password: string, hash: string): Promise<boolean> {
        if (!password || !hash) {
            throw new Error('Password and hash are required');
        }
        return await bcrypt.compare(password, hash);
    }
}


export default PasswordUtil;