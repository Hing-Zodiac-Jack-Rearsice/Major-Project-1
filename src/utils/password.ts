import crypto from "crypto";

export const saltAndHashPassword = async (password: string): Promise<string> => {
    const salt = await new Promise<string>((resolve, reject) => {
        crypto.randomBytes(16, (err, buf) => {
            if (err) reject(err);
            else resolve(buf.toString("hex"));
        });
    });
    const hash = await new Promise<string>((resolve, reject) => {
        crypto.scrypt(password, salt, 64, (err, buf) => {
            if (err) reject(err);
            else resolve(buf.toString("hex"));
        });
    });
    return `${salt}:${hash}`;
};

export const verifyPassword = async (plainPassword: string, hashedPassword: string): Promise<boolean> => {
    const [salt, storedHash] = hashedPassword.split(':');
    return new Promise((resolve, reject) => {
        crypto.scrypt(plainPassword, salt, 64, (err, derivedKey) => {
            if (err) reject(err);
            resolve(storedHash === derivedKey.toString('hex'));
        });
    });
};



