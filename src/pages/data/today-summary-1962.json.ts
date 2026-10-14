import type { APIRoute } from "astro";
import { getSiteTables } from "../../lib/siteData";

export const GET: APIRoute = () =>
  new Response(JSON.stringify(getSiteTables().todaySummaryTable1962), { headers: { "Content-Type": "application/json" } });
