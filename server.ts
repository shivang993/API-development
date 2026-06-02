import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = 3000;

// Initialize Gemini
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY || "",
  httpOptions: {
    headers: {
      "User-Agent": "aistudio-build",
    },
  },
});

app.use(express.json());

// Security and Metadata Middlewares
app.use((req, res, next) => {
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.setHeader("X-Frame-Options", "DENY");
  res.setHeader("X-XSS-Protection", "1; mode=block");
  next();
});

// Standard Response Wrapper
const sendResponse = (res: any, data: any, status = 200, metaOverride = {}) => {
  res.status(status).json({
    success: status >= 200 && status < 300,
    count: Array.isArray(data) ? data.length : 1,
    data,
    meta: {
      requestId: `req_${Math.random().toString(36).substr(2, 9)}`,
      responseTime: Math.floor(Math.random() * 50) + 10,
      rateLimit: {
        remaining: 4850,
        limit: 5000,
        reset: new Date(Date.now() + 3600000).toISOString(),
      },
      ...metaOverride,
    },
  });
};

// Hierarchical Data Simulation
const STATES = [
  { id: "st_1", name: "Maharashtra", code: "MH" },
  { id: "st_2", name: "Karnataka", code: "KA" },
  { id: "st_3", name: "Gujarat", code: "GJ" },
  { id: "st_4", name: "Kerala", code: "KL" },
  { id: "st_5", name: "Tamil Nadu", code: "TN" },
  { id: "st_6", name: "West Bengal", code: "WB" },
];

const DISTRICTS: Record<string, any[]> = {
  st_1: [{ id: "ds_1", name: "Nandurbar" }, { id: "ds_2", name: "Pune" }, { id: "ds_3", name: "Nagpur" }],
  st_2: [{ id: "ds_4", name: "Vijayanagara" }, { id: "ds_5", name: "Bangalore Rural" }, { id: "ds_6", name: "Mysuru" }],
  st_3: [{ id: "ds_7", name: "Kutch" }, { id: "ds_8", name: "Ahmedabad" }],
  st_4: [{ id: "ds_9", name: "Wayanad" }, { id: "ds_10", name: "Idukki" }],
};

const SUB_DISTRICTS: Record<string, any[]> = {
  ds_1: [{ id: "sd_1", name: "Akkalkuwa" }, { id: "sd_2", name: "Taloda" }],
  ds_4: [{ id: "sd_3", name: "Hospet" }, { id: "sd_4", name: "Hadagali" }],
  ds_9: [{ id: "sd_5", name: "Mananthavady" }],
};

const VILLAGES: Record<string, any[]> = {
  sd_1: [
    { id: "vl_1", name: "Manibeli", population: 1200, households: 250, censusCode: "525002", state: "Maharashtra", district: "Nandurbar" },
    { id: "vl_3", name: "Akkalkuwa Town", population: 8500, households: 1800, censusCode: "525003", state: "Maharashtra", district: "Nandurbar" },
    { id: "vl_6", name: "Molgi", population: 3100, households: 620, censusCode: "525004", state: "Maharashtra", district: "Nandurbar" }
  ],
  sd_3: [
    { id: "vl_2", name: "Hampi", population: 2150, households: 500, censusCode: "605287", state: "Karnataka", district: "Vijayanagara" },
    { id: "vl_4", name: "Kamalapura", population: 15400, households: 3200, censusCode: "605288", state: "Karnataka", district: "Vijayanagara" },
    { id: "vl_7", name: "Kadirampura", population: 1850, households: 390, censusCode: "605289", state: "Karnataka", district: "Vijayanagara" }
  ],
  sd_5: [
    { id: "vl_5", name: "Thirunelli", population: 3400, households: 780, censusCode: "627341", state: "Kerala", district: "Wayanad" },
    { id: "vl_8", name: "Kartikulam", population: 5200, households: 1100, censusCode: "627342", state: "Kerala", district: "Wayanad" }
  ],
  sd_6: [ // New SD for Gujarat
    { id: "vl_9", name: "Dhordo", population: 500, households: 95, censusCode: "508123", state: "Gujarat", district: "Kutch" },
    { id: "vl_10", name: "Hodka", population: 1200, households: 240, censusCode: "508124", state: "Gujarat", district: "Kutch" }
  ]
};

// API v1 Router
const v1Router = express.Router();

// Middleware: API Key Validation
const apiAuthMiddleware = (req: any, res: any, next: any) => {
  const apiKey = req.headers["x-api-key"];
  if (!apiKey || apiKey === "invalid") {
    return res.status(401).json({ 
      success: false, 
      error: "INVALID_API_KEY",
      message: "API key missing or invalid"
    });
  }
  next();
};

v1Router.use(apiAuthMiddleware);

v1Router.get("/search", (req, res) => {
  const { q } = req.query;
  const flatVillages = Object.values(VILLAGES).flat();
  const results = q ? flatVillages.filter(v => v.name.toLowerCase().includes(String(q).toLowerCase())) : flatVillages;
  sendResponse(res, results);
});

v1Router.get("/states", (req, res) => sendResponse(res, STATES));

v1Router.get("/states/:id/districts", (req, res) => {
  sendResponse(res, DISTRICTS[req.params.id] || []);
});

v1Router.get("/districts/:id/subdistricts", (req, res) => {
  sendResponse(res, SUB_DISTRICTS[req.params.id] || []);
});

v1Router.get("/subdistricts/:id/villages", (req, res) => {
  sendResponse(res, VILLAGES[req.params.id] || []);
});

v1Router.get("/autocomplete", (req, res) => {
  const { q } = req.query;
  const query = String(q || "").toLowerCase();
  
  // Real world logic would be a complex search, here we mock a hit for 'Man'
  const mockHits = [
    {
      value: "vl_1",
      label: "Manibeli",
      fullAddress: "Manibeli, Akkalkuwa, Nandurbar, Maharashtra, India",
      hierarchy: { village: "Manibeli", subDistrict: "Akkalkuwa", district: "Nandurbar", state: "Maharashtra", country: "India" }
    },
    {
      value: "vl_5",
      label: "Thirunelli",
      fullAddress: "Thirunelli, Mananthavady, Wayanad, Kerala, India",
      hierarchy: { village: "Thirunelli", subDistrict: "Mananthavady", district: "Wayanad", state: "Kerala", country: "India" }
    }
  ];

  const results = mockHits.filter(h => h.label.toLowerCase().includes(query) || h.fullAddress.toLowerCase().includes(query));
  sendResponse(res, results);
});

app.use("/api/v1", v1Router);

// Analytics Data API (Admin Portals)
app.get("/api/admin/analytics", (req, res) => {
  res.json({
    requestsByDay: Array.from({ length: 30 }, (_, i) => ({
      date: `04-${String(i + 1).padStart(2, "0")}`,
      count: Math.floor(Math.random() * 1000) + 200,
    })),
    userDistribution: [
      { name: "Free", value: 400 },
      { name: "Premium", value: 300 },
      { name: "Pro", value: 200 },
      { name: "Unlimited", value: 100 },
    ],
    stateUsage: [
      { name: "Maharashtra", count: 4500 },
      { name: "Karnataka", count: 3200 },
      { name: "Gujarat", count: 2100 },
      { name: "Kerala", count: 1800 },
      { name: "Tamil Nadu", count: 1560 },
    ],
    responseTimeTrends: Array.from({ length: 24 }, (_, i) => ({
      hour: `${i}:00`,
      p95: Math.floor(Math.random() * 20) + 30,
      p99: Math.floor(Math.random() * 50) + 80,
    }))
  });
});

// Favorites & User Keys Management
let userKeys = [
  { id: "1", name: "Production App", key: "ak_8d3f...2e31", status: "Active", created: "2024-03-12" },
  { id: "2", name: "Staging Test", key: "ak_a9b1...f0c2", status: "Active", created: "2024-04-01" },
];

app.get("/api/user/keys", (req, res) => res.json(userKeys));
app.post("/api/user/keys", (req, res) => {
  const newKey = { 
    id: Date.now().toString(), 
    name: req.body.name, 
    key: `ak_${Math.random().toString(16).substr(2, 8)}...${Math.random().toString(16).substr(2, 4)}`,
    status: "Active",
    created: new Date().toISOString().split("T")[0]
  };
  userKeys.push(newKey);
  res.json(newKey);
});

// AI Enhanced Village Insights
app.post("/api/villages/ai-insight", async (req, res) => {
  const { villageName, state, district } = req.body;
  
  if (!villageName) {
    return res.status(400).json({ error: "Village name is required" });
  }

  try {
    const prompt = `Provide 3 interesting facts about the village "${villageName}" located in ${district}, ${state}, India. 
    Focus on culture, history, or unique characteristics. Return the output as valid JSON with a "facts" array of strings. 
    If the village is obscure, provide general cultural information about that region of ${state}.`;

    const result = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
      },
    });

    const insight = JSON.parse(result.text || "{}");
    res.json(insight);
  } catch (error) {
    console.error("Gemini Error:", error);
    res.status(500).json({ error: "Failed to generate AI insights" });
  }
});

// Favorites API (Simplified for demonstration)
let favorites: any[] = []; // In production, this would be in Firestore

app.get("/api/favorites/:userId", (req, res) => {
  res.json(favorites.filter(f => f.userId === req.params.userId));
});

app.post("/api/favorites", (req, res) => {
  const favorite = { id: Date.now().toString(), ...req.body };
  favorites.push(favorite);
  res.json(favorite);
});

app.delete("/api/favorites/:id", (req, res) => {
  favorites = favorites.filter(f => f.id !== req.params.id);
  res.json({ success: true });
});

// Vite middleware configuration
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
