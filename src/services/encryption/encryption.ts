import type {EncryptionKeyCollection} from "@perfice/db/collections";
import {argon2id} from "hash-wasm";

export class EncryptionService {

    private encryptionKey: CryptoKey | null = null;
    private textEncoder = new TextEncoder();
    private textDecoder = new TextDecoder();

    private authKeyCollection: EncryptionKeyCollection;

    constructor(authKeyCollection: EncryptionKeyCollection) {
        this.authKeyCollection = authKeyCollection;
    }

    async setPassword(password: string, salt: string): Promise<void> {
        let saltBytes = this.base64ToBytes(salt);
        this.encryptionKey = await this.loadKey(password, saltBytes);
        await this.authKeyCollection.put(this.encryptionKey);
    }

    private async loadKey(password: string, salt: Uint8Array): Promise<CryptoKey> {
        let hashed = await argon2id({
            password: password,
            salt: salt,
            iterations: 2,
            parallelism: 4,
            memorySize: 1000,
            hashLength: 32,
            outputType: "binary"
        })

        return await window.crypto.subtle.importKey(
            "raw",
            hashed,
            {
                name: "AES-GCM",
                length: 256,
            },
            false,
            ["encrypt", "decrypt"]
        );
    }

    private async getEncryptionKey(): Promise<CryptoKey> {
        if (!this.encryptionKey) {
            const key = await this.authKeyCollection.getKey();
            if (!key) throw new Error('Encryption key not found');

            this.encryptionKey = key;
        }

        return this.encryptionKey;
    }

    async encrypt(data: any): Promise<string> {
        const key = await this.getEncryptionKey();
        const encodedData = this.textEncoder.encode(JSON.stringify(data));

        const iv = crypto.getRandomValues(new Uint8Array(12));
        const encrypted = await crypto.subtle.encrypt(
            {name: 'AES-GCM', iv},
            key,
            encodedData
        );

        const result = new Uint8Array(iv.length + encrypted.byteLength);
        result.set(iv);
        result.set(new Uint8Array(encrypted), iv.length);

        return this.bytesToBase64(result);
    }

    async decrypt(encryptedString: string): Promise<any> {
        const key = await this.getEncryptionKey();
        const data = this.base64ToBytes(encryptedString);
        const iv = data.slice(0, 12);
        const encrypted = data.slice(12);

        const decrypted = await crypto.subtle.decrypt(
            {name: 'AES-GCM', iv},
            key,
            encrypted
        );

        return JSON.parse(this.textDecoder.decode(decrypted));
    }

    private bytesToBase64(buffer: Uint8Array) {
        return btoa(String.fromCharCode(...buffer));
    }

    private base64ToBytes(encoded: string) {
        const binary = atob(encoded);
        const bytes = new Uint8Array(binary.length);
        for (let i = 0; i < bytes.length; i++) {
            bytes[i] = binary.charCodeAt(i);
        }

        return bytes;
    }

}
