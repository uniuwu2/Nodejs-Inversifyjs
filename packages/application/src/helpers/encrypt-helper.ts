import { Variables } from "../constants/variables";
import * as bcrypt from "bcryptjs";

/**
 * The encrypt helper will use to encrypt the token and decrypt the token
 */
export class EncryptHelper {
    /**
     * Enrypt token
     * @param token -> Token string need to be encrypted
     * @returns string
     */
    public static encryptToken = (token: string): string => {
        return Buffer.from(token, "utf8").toString("base64");
    };

    /**
     * Decrypt token
     * @param token -> Token string need to be decrypted
     * @returns string
     */
    public static decryptToken = (token: string): string => {
        return Buffer.from(token, "base64").toString("utf8");
    };

    /**
     * Decrypt token
     * @param token -> Token string need to be decrypted
     * @returns string
     */
    public static bcryptHash = (password: string): Promise<string> => {
        return bcrypt.hash(password, Variables.SALT_ROUNDS);
    };
}
