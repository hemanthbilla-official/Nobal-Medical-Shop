#!/usr/bin/env node

import { readFileSync, existsSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { readFile } from "node:fs/promises";

const __dirname = dirname(fileURLToPath(import.meta.url));

function usage() {
  console.log(`
Usage:
  node scripts/create-user.mjs --email <email> --password <password> --name <name> --role <owner|worker>
  node scripts/create-user.mjs --uid <uid> --name <name> --role <owner|worker>

Mode 1 (full create):  --email + --password + --name + --role
Mode 2 (role only):    --uid + --name + --role
`);
  process.exit(1);
}

const args = {};
const raw = process.argv.slice(2);
for (let i = 0; i < raw.length; i++) {
  if (raw[i].startsWith("--")) {
    const key = raw[i].slice(2);
    const val = raw[++i];
    if (!val || val.startsWith("--")) {
      console.error("Error: missing value for --" + key);
      usage();
    }
    args[key] = val;
  }
}

const modeFull = !!args.email && !!args.password;
const modeRoleOnly = !!args.uid && !args.email && !args.password;

if (!modeFull && !modeRoleOnly) usage();
if (!args.name || !args.role) usage();
if (args.role !== "owner" && args.role !== "worker") {
  console.error('Error: role must be "owner" or "worker"');
  process.exit(1);
}
if (modeFull && args.password.length < 6) {
  console.error("Error: password must be at least 6 characters");
  process.exit(1);
}

// Load .env for project ID
const envPath = resolve(process.cwd(), ".env");
if (!existsSync(envPath)) {
  console.error("Error: .env not found");
  process.exit(1);
}
const envContent = readFileSync(envPath, "utf-8");
const env = {};
for (const line of envContent.split("\n")) {
  const trimmed = line.trim();
  if (!trimmed || trimmed.startsWith("#")) continue;
  const eqIdx = trimmed.indexOf("=");
  if (eqIdx === -1) continue;
  env[trimmed.slice(0, eqIdx).trim()] = trimmed.slice(eqIdx + 1).trim();
}

const apiKey = env.VITE_FIREBASE_API_KEY;
const projectId = env.VITE_FIREBASE_PROJECT_ID;

if (!apiKey || !projectId) {
  console.error("Error: VITE_FIREBASE_API_KEY and VITE_FIREBASE_PROJECT_ID required in .env");
  process.exit(1);
}

// Load service account for Firestore admin access
const saCandidates = [
  resolve(process.cwd(), "service-account.json"),
  resolve(__dirname, "..", "service-account.json"),
];
const saPath = saCandidates.find((p) => existsSync(p));
if (!saPath) {
  console.error("Error: service-account.json not found in project root");
  process.exit(1);
}

const serviceAccount = JSON.parse(readFileSync(saPath, "utf-8"));

// Get an OAuth2 access token from the service account
async function getAccessToken() {
  const { GoogleAuth } = await import("google-auth-library");
  const auth = new GoogleAuth({
    credentials: serviceAccount,
    scopes: ["https://www.googleapis.com/auth/cloud-platform"],
  });
  const client = await auth.getClient();
  const token = await client.getAccessToken();
  return token.token;
}

// Write to Firestore using OAuth2 access token
async function writeFirestoreDoc(uid, accessToken) {
  const now = new Date().toISOString();
  const doc = {
    fields: {
      uid: { stringValue: uid },
      name: { stringValue: args.name },
      email: { stringValue: args.email || uid + "@placeholder.local" },
      role: { stringValue: args.role },
      createdAt: { timestampValue: now },
    },
  };

  const url = `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents/users/${uid}`;
  const res = await fetch(url, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      Authorization: "Bearer " + accessToken,
    },
    body: JSON.stringify(doc),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(
      "Firestore write failed: " + (err.error?.message || res.statusText)
    );
  }
}

async function run() {
  console.log("Getting access token from service account...");
  const accessToken = await getAccessToken();

  if (modeRoleOnly) {
    console.log("Writing Firestore role document...");
    await writeFirestoreDoc(args.uid, accessToken);
    console.log("  UID:   " + args.uid);
    console.log("  Name:  " + args.name);
    console.log("  Role:  " + args.role);
    console.log("\nDone.");
    return;
  }

  // Full create mode: create user via Auth REST API
  console.log("Creating Firebase Auth user...");
  const authUrl = "https://identitytoolkit.googleapis.com/v1/accounts:signUp?key=" + apiKey;
  const res = await fetch(authUrl, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      email: args.email,
      password: args.password,
      displayName: args.name,
      returnSecureToken: true,
    }),
  });

  const data = await res.json();

  if (!res.ok) {
    const code = data.error?.message || "";
    if (code.includes("CONFIGURATION_NOT_FOUND")) {
      console.error(
        "\nFirebase Authentication is not fully configured.\n" +
        "Go to Firebase Console > Authentication > Sign-in method\n" +
        "and enable the Email/Password provider, then re-run.\n" +
        "\nAlternatively, create the user manually in Firebase Console,\n" +
        "then run: node scripts/create-user.mjs --uid <UID> --name \"...\" --role ...\n"
      );
    } else {
      console.error("Auth API error: " + (data.error?.message || res.statusText));
    }
    process.exit(1);
  }

  const uid = data.localId;
  console.log("  UID:   " + uid);
  console.log("  Email: " + data.email);
  console.log("  Name:  " + args.name);

  console.log("Writing Firestore role document...");
  await writeFirestoreDoc(uid, accessToken);
  console.log("  Role:  " + args.role);
  console.log("\nDone. User " + args.email + " created.");
}

run().catch((err) => {
  console.error("Error: " + err.message);
  process.exit(1);
});
