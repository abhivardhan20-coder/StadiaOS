export const FALLBACK_MOCKS = {
  stadiumLive: {
    liveContext: {
      crowds: ["Gate A (High Density)", "Concourse 2 (Moderate Density)"],
      maintenance: ["Elevator 3 (Out of Service)", "Corridor 7 (Blocked)"],
      closedGates: ["Gate D (West) - Closed for security"],
      securityIncidents: ["Gate D (West) - Suspicious package"],
      traffic: ["Perimeter Road East (Heavy Traffic)"]
    },
    crowdPulse: {
      overallDensity: 82,
      predictedPeak: "19:30",
      anomalies: ["Unusual buildup near Gate C", "Concourse 4 flow restricted"],
      heatmapData: [
        { zone: "Gate A", density: 88, trend: "up" },
        { zone: "Gate B", density: 45, trend: "down" },
        { zone: "Gate C", density: 82, trend: "up" },
        { zone: "Concourse 1", density: 60, trend: "stable" }
      ]
    }
  },
  greenOps: {
    score: 85,
    electricity: "1.2MW",
    solar: "350kW",
    water: "4.2kL/h",
    hvac: "Optimal (22C)",
    carbon: "2.1t/h",
    waste: "1.2t",
    recycling: "0.8t",
    foodWaste: "150kg",
    battery: "92%",
    airQuality: "Good (42 AQI)",
    temperature: "22°C",
    humidity: "45%",
    savings: "$2,250",
    forecasts: [
      "Peak energy demand expected at 18:00",
      "Solar generation dropping in 2 hours",
      "HVAC efficiency at 95%"
    ],
    recommendations: [
      "Pre-cool sector 4",
      "Switch to battery power for peak",
      "Reduce lighting in empty zones"
    ]
  },
  polyglot: (text: string, target: string) => ({
    original: text,
    translated: `[Offline Mode Translation to ${target}]: ${text}`,
    language: target,
    culturalNotes: ["Offline mode active. Real-time translation unavailable."],
    audioUrl: null,
    confidence: 0.99
  }),
  wayfinder: (dest?: string) => ({
    destination: dest || "Unknown",
    route_steps: [
      { instruction: "Head towards Concourse 4B", type: "walk" as const, congestion: "low" as const, distance: 150, duration: 2 },
      { instruction: "Take the elevator down to Level 2", type: "elevator" as const, congestion: "low" as const, distance: 0, duration: 1 },
      { instruction: "Proceed straight to destination", type: "walk" as const, congestion: "moderate" as const, distance: 200, duration: 3 }
    ],
    estimated_walk_time_min: 6,
    step_free: true,
    rationale: "Optimized route avoiding main crowd bottlenecks.",
    predicted_congestion: "Moderate near destination",
    alternative_routes: [{ name: "West Loop", time_min: 8, reason: "Less crowded" }]
  })
};
