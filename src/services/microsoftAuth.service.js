import jwt from "jsonwebtoken";
import jwksClient from "jwks-rsa";
import { sociallogin } from "./auth.service.js";
import logger from "../utils/logger.js";

// Microsoft's public keys endpoint
const client = jwksClient({
  jwksUri: "https://login.microsoftonline.com/common/discovery/v2.0/keys",
});

// Get signing key from Microsoft
const getSigningKey = (header) => {
  return new Promise((resolve, reject) => {
    client.getSigningKey(header.kid, (err, key) => {
      if (err) {
        reject(err);
      } else {
        resolve(key.getPublicKey());
      }
    });
  });
};

export const microsoftAuthService = async (idToken) => {
  // Step 1: Decode header to get kid (key id)
  const decoded = jwt.decode(idToken, { complete: true });

  if (!decoded) {
    const error = new Error("Invalid Microsoft token.");
    error.statusCode = 400;
    throw error;
  }

  // Step 2: Get Microsoft's public signing key
  const signingKey = await getSigningKey(decoded.header);

  // Step 3: Verify token signature
  const payload = jwt.verify(idToken, signingKey, {
    algorithms: ["RS256"],
    audience: process.env.MICROSOFT_CLIENT_ID,
  });

  logger.debug(`Microsoft payload: ${JSON.stringify(payload)}`);

  // Step 4: Extract user info
  // Microsoft uses 'preferred_username' or 'email' for email
  // and 'name' for full name and 'oid' for unique user id
  const email = payload.email || payload.preferred_username;
  const name = payload.name;
  const oid = payload.oid;

  if (!email || !name || !oid) {
    logger.warn(`Missing fields in Microsoft payload — email: ${email}, name: ${name}, oid: ${oid}`);
    const error = new Error("Invalid Microsoft token payload.");
    error.statusCode = 400;
    throw error;
  }

  // Step 5: Call same socialLogin used by Google
  const result = await sociallogin({
    email,
    fullName: name,
    provider: "microsoft",
    providerId: oid,
  });

  return result;
};