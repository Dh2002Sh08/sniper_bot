// utils/secret.ts
export let secretKey: number[] | null = null;

export function setSecretKey(key: number[]) {
  secretKey = key;
}

export function getSecretKey(): Uint8Array {
    if (!secretKey || !Array.isArray(secretKey) || secretKey.length !== 64) {
      throw new Error("❌ secretKey is not set or invalid. Please create or restore a wallet first.");
    }
    return new Uint8Array(secretKey);
  }