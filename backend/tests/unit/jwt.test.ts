import dotenv from "dotenv";
dotenv.config({ path: ".env.test" });

import { describe, it, expect } from "vitest";

import {
  generateAccessToken,
  generateRefreshToken,
  generateJWT,
  verifyAccessToken,
  verifyRefreshToken,
} from "../../src/utils/jwt";

describe("generateAccessToken", () => {
  it("creates a valid access token", () => {
    const token = generateAccessToken(1, "Rajesh Hamal");

    expect(typeof token).toBe("string");
    expect(token.length).toBeGreaterThan(0);
  });

  it("contains the correct payload", () => {
    const token = generateAccessToken(1, "Rajesh Hamal");

    const decoded = verifyAccessToken(token);

    expect(decoded.user.id).toBe(1);
    expect(decoded.user.fullName).toBe("Rajesh Hamal");
  });
});

describe("generateRefreshToken", () => {
  it("creates a valid refresh token", () => {
    const token = generateRefreshToken(2, "Keanu Reeves");

    expect(typeof token).toBe("string");
    expect(token.length).toBeGreaterThan(0);
  });

  it("contains the correct payload", () => {
    const token = generateRefreshToken(2, "Keanu Reeves");

    const decoded = verifyRefreshToken(token);

    expect(decoded.user.id).toBe(2);
    expect(decoded.user.fullName).toBe("Keanu Reeves");
  });
});

describe("generateJWT", () => {
  it("returns both access and refresh tokens", () => {
    const tokens = generateJWT(3, "Harrison Ford");

    expect(tokens).toHaveProperty("accessToken");
    expect(tokens).toHaveProperty("refreshToken");

    expect(typeof tokens.accessToken).toBe("string");
    expect(typeof tokens.refreshToken).toBe("string");
  });

  it("creates tokens with the correct payload", () => {
    const tokens = generateJWT(3, "Harrison Ford");

    const accessPayload = verifyAccessToken(tokens.accessToken);
    const refreshPayload = verifyRefreshToken(tokens.refreshToken);

    expect(accessPayload.user.id).toBe(3);
    expect(accessPayload.user.fullName).toBe("Harrison Ford");

    expect(refreshPayload.user.id).toBe(3);
    expect(refreshPayload.user.fullName).toBe("Harrison Ford");
  });
});

describe("verifyAccessToken", () => {
  it("throws for an invalid token", () => {
    expect(() => {
      verifyAccessToken("invalid-token");
    }).toThrow();
  });

  it("throws when a refresh token is verified as an access token", () => {
    const refreshToken = generateRefreshToken(1, "Keanu Reeves");

    expect(() => {
      verifyAccessToken(refreshToken);
    }).toThrow();
  });
});

describe("verifyRefreshToken", () => {
  it("throws for an invalid token", () => {
    expect(() => {
      verifyRefreshToken("invalid-token");
    }).toThrow();
  });

  it("throws when an access token is verified as a refresh token", () => {
    const accessToken = generateAccessToken(1, "Keanu Reeves");

    expect(() => {
      verifyRefreshToken(accessToken);
    }).toThrow();
  });
});
