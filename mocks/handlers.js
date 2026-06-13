import { http, HttpResponse } from "msw";

import dashboard from "./dashboard.json";
import phishing from "./phishing.json";
import leaks from "./leaks.json";
import users from "./users.json";
import activityLog from "./activityLog.json";

export const handlers = [
  // Dashboard
  http.get("/api/dashboard", () => {
    return HttpResponse.json(dashboard);
  }),

  // Demo users
  http.get("/api/users", () => {
    return HttpResponse.json(users);
  }),

  // Dashboard timeline
  http.get("/api/activity-log", () => {
    return HttpResponse.json(activityLog);
  }),

  // URL phishing scan
  http.post("/api/phishing", async ({ request }) => {
    const { url } = await request.json();

    const blocked = phishing.find(
      (item) => item.status === "blocked"
    );

    const risky = phishing.find(
      (item) => item.status === "risky"
    );

    const safe = phishing.find(
      (item) => item.status === "safe"
    );

    if (
      url.toLowerCase().includes("hack") ||
      url.toLowerCase().includes("free")
    ) {
      return HttpResponse.json(blocked);
    }

    if (
      url.toLowerCase().includes("login") ||
      url.toLowerCase().includes("auth")
    ) {
      return HttpResponse.json(risky);
    }

    return HttpResponse.json(safe);
  }),

  // Email breach scan
  http.post("/api/leaks", async ({ request }) => {
    const { email } = await request.json();

    const breached = leaks.find(
      (item) => item.status === "breached"
    );

    const clean = leaks.find(
      (item) => item.status === "clean"
    );

    if (
      email.toLowerCase().includes("tarang") ||
      email.toLowerCase().includes("breach")
    ) {
      return HttpResponse.json(breached);
    }

    return HttpResponse.json(clean);
  }),
];