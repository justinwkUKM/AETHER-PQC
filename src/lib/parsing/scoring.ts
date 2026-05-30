const HIGH_RISK = ["RSA", "DSA", "DH", "ECDSA", "ECDH"];
const LOW_RISK = ["AES-256", "SHA-256", "SHA-384", "SHA-512", "ML-KEM", "ML-DSA", "SLH-DSA"];

export function scorePrimitive(input: string) {
  const normalized = input.toUpperCase();

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
