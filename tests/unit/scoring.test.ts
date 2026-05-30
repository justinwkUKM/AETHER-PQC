import { describe, expect, it } from "vitest";
import { isKnownClassicalPublicKey, isKnownQuantumSafe, scorePrimitive } from "@/lib/parsing/scoring";

describe("crypto scoring", () => {
  it("scores classical public-key primitives as critical", () => {
    expect(scorePrimitive("RSA-2048")).toBe(10);
    expect(scorePrimitive("ECDH key exchange")).toBe(10);
    expect(isKnownClassicalPublicKey("ECDSA signatures")).toBe(true);
  });

  it("scores quantum-safe and symmetric primitives as low risk", () => {
    expect(scorePrimitive("AES-256")).toBe(0);
    expect(scorePrimitive("SHA-512")).toBe(0);
    expect(scorePrimitive("ML-KEM")).toBe(0);
    expect(isKnownQuantumSafe("ML-DSA certificate")).toBe(true);
  });

  it("uses a medium default for unknown algorithms", () => {
    expect(scorePrimitive("custom legacy cipher")).toBe(5);
  });
});
