export type FactionId = "allied" | "crimson" | "epsilon" | "foehn";

export interface Faction {
  id: FactionId;
  name: string;
  fullName: string;
  color: string;
  desc: string;
}

export interface Mission {
  id: string;
  code: string;
  name: string;
  faction: FactionId;
  lat: number;
  lon: number;
  sector: string;
  difficulty: 1 | 2 | 3 | 4 | 5;
  status: "AVAILABLE" | "ACTIVE" | "COMPLETE" | "LOCKED";
  briefing: string[];
  objectives: string[];
}

export const FACTIONS: Faction[] = [
  {
    id: "allied",
    name: "ALLIED COMMAND",
    fullName: "ALLIED FORCES TACTICAL NETWORK",
    color: "#00F0FF",
    desc: "Joint coalition defense network",
  },
  {
    id: "crimson",
    name: "CRIMSON PACT",
    fullName: "EASTERN ALLIANCE WAR COLLEGE",
    color: "#FF3366",
    desc: "Heavy armor strike command",
  },
  {
    id: "epsilon",
    name: "EPSILON COLLECTIVE",
    fullName: "PSIONIC RESEARCH DIVISION",
    color: "#B44CFF",
    desc: "Mind-linked special operations",
  },
  {
    id: "foehn",
    name: "FOEHN REVOLT",
    fullName: "SOLAR FRONTIER INSURGENCY",
    color: "#FFB000",
    desc: "Independent resistance cells",
  },
];

export const MISSIONS: Mission[] = [
  {
    id: "al-01",
    code: "AL-01",
    name: "OP: MIDNIGHT STORM",
    faction: "allied",
    lat: 40.7128,
    lon: -74.006,
    sector: "ATLANTIC SECTOR // GRID DQ-14",
    difficulty: 3,
    status: "ACTIVE",
    briefing: [
      "DECRYPTED TRANSMISSION // CHANNEL 07-A",
      "Hostile armor columns detected converging on Manhattan perimeter. Civic defense grid operating at 34% capacity. Weather relays report zero visibility window in 06:00.",
      "Deploy forward recon to the eastern harbor. Hold the Meridian Gate until the Chrono Relay Array completes its charge cycle.",
    ],
    objectives: [
      "Defend Meridian Gate for 10 minutes",
      "Destroy enemy siege crawlers",
      "Relay the Chronosphere array",
    ],
  },
  {
    id: "al-02",
    code: "AL-02",
    name: "OP: NORTHERN LIGHT",
    faction: "allied",
    lat: 51.5074,
    lon: -0.1278,
    sector: "EUROPEAN SECTOR // GRID JS-08",
    difficulty: 2,
    status: "AVAILABLE",
    briefing: [
      "DECRYPTED TRANSMISSION // CHANNEL 03-C",
      "Enemy submarine activity detected in the North Sea corridor. Satellite passes show three blockade lines forming around the Thames estuary.",
      "Escort the intelligence convoy through sector J-08. Maintain radio silence until the beacon array is online.",
    ],
    objectives: [
      "Escort convoy to extraction point",
      "Deploy sonar beacon array",
      "Neutralize enemy blockade lines",
    ],
  },
  {
    id: "al-03",
    code: "AL-03",
    name: "OP: TIDAL VANGUARD",
    faction: "allied",
    lat: 35.6762,
    lon: 139.6503,
    sector: "PACIFIC SECTOR // GRID UF-21",
    difficulty: 4,
    status: "AVAILABLE",
    briefing: [
      "DECRYPTED TRANSMISSION // CHANNEL 11-B",
      "Typhoon cell moving over the archipelago has grounded all air support. Enemy naval task force exploiting the storm to approach the capital bay.",
      "Weather-control satellites are in position. Seize the offshore platforms before the storm window closes at 04:00.",
    ],
    objectives: [
      "Capture three offshore platforms",
      "Survive the enemy naval assault",
      "Deploy stormbreaker satellite",
    ],
  },
  {
    id: "cr-01",
    code: "CR-01",
    name: "OP: RED DAWN",
    faction: "crimson",
    lat: 55.7558,
    lon: 37.6173,
    sector: "EURASIAN SECTOR // GRID OK-33",
    difficulty: 4,
    status: "AVAILABLE",
    briefing: [
      "DECRYPTED TRANSMISSION // CHANNEL 05-R",
      "Allied forward bases spotted along the western steppe. Iron Curtain facilities report 78% efficiency — field test conditions are optimal.",
      "Break through the defensive perimeter before their Chrono satellites reposition. The General's Tesla division will follow your advance.",
    ],
    objectives: [
      "Crush the western defense line",
      "Deploy Iron Curtain on the vanguard",
      "Reach the enemy command HQ",
    ],
  },
  {
    id: "cr-02",
    code: "CR-02",
    name: "OP: WINTER HAMMER",
    faction: "crimson",
    lat: 43.1332,
    lon: 131.9113,
    sector: "FAR EAST SECTOR // GRID VX-12",
    difficulty: 3,
    status: "AVAILABLE",
    briefing: [
      "DECRYPTED TRANSMISSION // CHANNEL 08-K",
      "Port facilities at the eastern coast have fallen silent. Long-range radar confirms an armored response force inbound within 12 hours.",
      "Fortify the coastal batteries. The ice sheet is thick enough to move heavy armor across the frozen strait.",
    ],
    objectives: [
      "Rebuild coastal battery network",
      "Destroy the response force",
      "Hold the port for 24 hours",
    ],
  },
  {
    id: "cr-03",
    code: "CR-03",
    name: "OP: SILENT STEPPE",
    faction: "crimson",
    lat: 51.1605,
    lon: 71.4704,
    sector: "CENTRAL ASIA // GRID QW-02",
    difficulty: 2,
    status: "LOCKED",
    briefing: [
      "ENCRYPTED // CLEARANCE LEVEL 5 REQUIRED",
      "Data unreadable.",
    ],
    objectives: ["---"],
  },
  {
    id: "ep-01",
    code: "EP-01",
    name: "OP: PSI LATTICE",
    faction: "epsilon",
    lat: 30.0444,
    lon: 31.2357,
    sector: "NORTH AFRICA // GRID CB-09",
    difficulty: 5,
    status: "AVAILABLE",
    briefing: [
      "DECRYPTED TRANSMISSION // CHANNEL 00-PSI",
      "The Pyramid Array beneath the desert has entered phase two resonance. Allied satellites cannot detect its signature — yet.",
      "Guard the lattice while the Mastermind links every initiate in sector. A single interruption will reset the psionic field to zero.",
    ],
    objectives: [
      "Protect the Pyramid Array",
      "Link 12 initiates to the lattice",
      "Do not lose the Mastermind",
    ],
  },
  {
    id: "ep-02",
    code: "EP-02",
    name: "OP: MINDSHARD",
    faction: "epsilon",
    lat: 52.52,
    lon: 13.405,
    sector: "CENTRAL EUROPE // GRID HT-17",
    difficulty: 4,
    status: "LOCKED",
    briefing: [
      "ENCRYPTED // CLEARANCE LEVEL 7 REQUIRED",
      "Data unreadable.",
    ],
    objectives: ["---"],
  },
  {
    id: "fo-01",
    code: "FO-01",
    name: "OP: SOLAR FALL",
    faction: "foehn",
    lat: -22.9068,
    lon: -43.1729,
    sector: "SOUTH ATLANTIC // GRID ZM-06",
    difficulty: 3,
    status: "AVAILABLE",
    briefing: [
      "DECRYPTED TRANSMISSION // CHANNEL 12-F",
      "Requisitioned solar harvesters are being routed through the coastal terminals. Two orbital reflectors can be re-aimed to cover your advance.",
      "Cut the supply corridor. The city grid runs on harvested light — take it away and the occupation loses power within a week.",
    ],
    objectives: [
      "Destroy supply convoys",
      "Re-aim orbital reflectors",
      "Liberate the coastal terminal",
    ],
  },
  {
    id: "fo-02",
    code: "FO-02",
    name: "OP: THERMAL ASCENT",
    faction: "foehn",
    lat: 1.3521,
    lon: 103.8198,
    sector: "SUNDA SECTOR // GRID PS-04",
    difficulty: 2,
    status: "AVAILABLE",
    briefing: [
      "DECRYPTED TRANSMISSION // CHANNEL 15-T",
      "Geothermal tap points beneath the strait have been overclocked by the occupiers. Rising sea temperature is destabilizing the reef line.",
      "Vent the thermal pressure through the old pipeline network. The eruption will blind every sensor in the sector.",
    ],
    objectives: [
      "Overload the thermal taps",
      "Escape the sensor net",
      "Sabotage the pipeline valves",
    ],
  },
];

export const factionById = (id: FactionId) => FACTIONS.find((f) => f.id === id)!;
export const missionById = (id: string) => MISSIONS.find((m) => m.id === id)!;
