import express, { Request, Response } from "express";

const router = express.Router();

router.get("/", (req: Request, res: Response) => {
  // Simulate live dynamic data on the server
  const baseOccupancy = 68400;
  
  const zones = [
    { id: 'north_stand', name: 'North Stand (Zone A)', density: 80 + Math.random() * 5, status: 'warning' },
    { id: 'south_stand', name: 'South Stand (Zone B)', density: 40 + Math.random() * 10, status: 'normal' },
    { id: 'east_stand', name: 'East Stand (Zone C)', density: 90 + Math.random() * 8, status: 'critical' },
    { id: 'west_stand', name: 'West Stand (Zone D)', density: 55 + Math.random() * 5, status: 'normal' },
    { id: 'gate_north', name: 'Concourse 4B', density: 85 + Math.random() * 10, status: 'warning' },
  ];

  zones.forEach(z => {
    if (z.density >= 90) z.status = 'critical';
    else if (z.density >= 75) z.status = 'warning';
    else z.status = 'normal';
    z.density = Math.round(z.density);
  });

  const chartData = [
    { time: '18:00', actual: 30, predicted: 30 },
    { time: '18:15', actual: 45, predicted: 42 },
    { time: '18:30', actual: 65, predicted: 60 },
    { time: '18:45', actual: 80, predicted: 78 },
    { time: '19:00', actual: 95, predicted: 90 },
    { time: '19:15', actual: null, predicted: 85 },
    { time: '19:30', actual: null, predicted: 60 },
    { time: '19:45', actual: null, predicted: 40 },
  ];

  res.json({
    occupancy: baseOccupancy + Math.floor(Math.random() * 100),
    zones,
    chartData,
    liveContext: {
      time: new Date().toISOString(),
      alerts: zones.filter(z => z.status === 'critical').map(z => `Density Breach: ${z.name} (${z.density}%)`),
      weather: "Clear, 22C",
      transit: "Metro Line B delayed by 10m",
      zones,
      totalOccupancy: baseOccupancy
    }
  });
});

export default router;
