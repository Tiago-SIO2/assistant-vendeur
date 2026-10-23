import "server-only";
import { Client } from "@upstash/qstash";

export const qstash = new Client({
  token: process.env.QSTASH_TOKEN ?? "",
  baseUrl: process.env.QSTASH_URL,
});

export const NOMBRE_RELANCES = 3;