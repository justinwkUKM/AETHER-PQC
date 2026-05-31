const HIGH_RISK = ["RSA", "DSA", "DH", "ECDSA", "ECDH"];
const LOW_RISK = ["AES-256", "SHA-256", "SHA-384", "SHA-512", "ML-KEM", "ML-DSA", "SLH-DSA"];

export function scorePrimitive(input: string) {
  const normalized = input.toUpperCase();

  if (/\bTLS\s*1[._-]?0\b/i.test(normalized) || /\bSSL\b/i.test(normalized)) {
    return 10;
  }

  if (/\bTLS\s*1[._-]?1\b/i.test(normalized)) {
    return 9;
  }

  if (/\bTLS\s*1[._-]?2\b/i.test(normalized)) {
    const weakTls12 = /\b(RSA|SHA-?1|STATIC\s+DH|3DES|RC4|CBC|EXPORT|NULL)\b/i.test(normalized);
    return weakTls12 ? 8 : 5;
  }

  if (/\bTLS\s*1[._-]?3\b/i.test(normalized)) {
    return /\b(WEAK|LEGACY|DOWNGRADE|MISCONFIGURED)\b/i.test(normalized) ? 5 : 1;
  }

  if (HIGH_RISK.some((primitive) => new RegExp(`\\b${primitive}\\b`, "i").test(normalized))) {
    return 10;
  }

  if (LOW_RISK.some((primitive) => normalized.includes(primitive))) {
    return 0;
  }

  if (/\bAES\b/i.test(normalized)) {
    return 2;
  }

  if (/\bSHA\b/i.test(normalized)) {
    return 1;
  }

  return 5;
}

export function isKnownClassicalPublicKey(input: string) {
  return HIGH_RISK.some((primitive) => new RegExp(`\\b${primitive}\\b`, "i").test(input));
}

export function isKnownQuantumSafe(input: string) {
  return LOW_RISK.some((primitive) => input.toUpperCase().includes(primitive));
}

export function isKnownWeakProtocol(input: string) {
  return scorePrimitive(input) >= 8 && /\b(TLS|SSL|3DES|RC4|SHA-?1|STATIC\s+DH)\b/i.test(input);
}
