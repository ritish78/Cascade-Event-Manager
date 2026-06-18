import { describe, expect, it } from "vitest";
import hashPassword, { passwordMatches } from "../../src/utils/hashPassword";

describe("hashPassword", () => {
  it("returns a hash different from the original password", async () => {
    const password = "testPasswordThatIDontUseElseWhere";

    const hash = await hashPassword(password);

    expect(hash).toBeDefined();
    expect(hash).not.toBe(password);
  });

  it("returns an argon2 hash string", async () => {
    const hash = await hashPassword("password123");

    expect(hash.startsWith("$argon2")).toBe(true);
  });

  it("produces different hashes for the same password", async () => {
    const password = "password123";

    const hash1 = await hashPassword(password);
    const hash2 = await hashPassword(password);

    expect(hash1).not.toBe(hash2);
  });
});

describe("passwordMatches", () => {
  it("returns true when password matches hash", async () => {
    const password = "password123";

    const hash = await hashPassword(password);

    const result = await passwordMatches(password, hash);

    expect(result).toBe(true);
  });

  it("returns false when password does not match hash", async () => {
    const hash = await hashPassword("password123");

    const result = await passwordMatches("wrongPassword", hash);

    expect(result).toBe(false);
  });

  it("works with multiple passwords independently", async () => {
    const hash1 = await hashPassword("firstPassword");
    const hash2 = await hashPassword("secondPassword");

    expect(await passwordMatches("firstPassword", hash1)).toBe(true);

    expect(await passwordMatches("secondPassword", hash2)).toBe(true);

    expect(await passwordMatches("firstPassword", hash2)).toBe(false);

    expect(await passwordMatches("secondPassword", hash1)).toBe(false);
  });
});
