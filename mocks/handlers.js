import { http, HttpResponse } from "msw";

import dashboard from "./dashboard.json";
import phishing from "./phishing.json";
import leaks from "./leaks.json";

export const handlers = [
  http.get("/api/dashboard", () => {
    return HttpResponse.json(dashboard);
  }),

  http.get("/api/phishing", () => {
    return HttpResponse.json(phishing);
  }),

  http.get("/api/leaks", () => {
    return HttpResponse.json(leaks);
  }),
];