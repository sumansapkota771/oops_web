import "server-only";
import { createHmac, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";
import { connection } from "next/server";

const COOKIE = "oops_admin";
const MAX_AGE = 60 * 60 * 24 * 7; // 7 days

type Payload = { uid: string; v: string; exp: number };

function secret() {
  const s = process.env.ADMIN_SESSION_SECRET;
  if (!s || s.length < 32) throw new Error("ADMIN_SESSION_SECRET (at least 32 characters) is not set");
  return s;
}

const mac = (data: string) => createHmac("sha256", secret()).update(data).digest("base64url");

function sign(payload: Payload) {
  const body = Buffer.from(JSON.stringify(payload)).toString("base64url");
  return `${body}.${mac(body)}`;
}

function verify(token: string): Payload | null {
  const [body, signature] = token.split(".");
  if (!body || !signature) return null;
  const expected = Buffer.from(mac(body));
  const actual = Buffer.from(signature);
  if (expected.length !== actual.length || !timingSafeEqual(expected, actual)) return null;
  try {
    const payload = JSON.parse(Buffer.from(body, "base64url").toString("utf8")) as Payload;
    return payload.exp > Date.now() / 1000 && payload.uid && payload.v ? payload : null;
  } catch {
    return null;
  }
}

export const sessionConfigured = () => Boolean(process.env.ADMIN_SESSION_SECRET && process.env.ADMIN_SESSION_SECRET.length >= 32);

export async function startSession(uid: string, version: string) {
  const token = sign({ uid, v: version, exp: Math.floor(Date.now() / 1000) + MAX_AGE });
  (await cookies()).set(COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: MAX_AGE,
  });
}

export async function endSession() {
  (await cookies()).set(COOKIE, "", { httpOnly: true, sameSite: "lax", path: "/", maxAge: 0 });
}

export async function readSession(): Promise<Payload | null> {
  if (!sessionConfigured()) return null;
  // Checking expiry reads the clock, so make sure we are rendering for a real request first.
  await connection();
  const token = (await cookies()).get(COOKIE)?.value;
  return token ? verify(token) : null;
}
