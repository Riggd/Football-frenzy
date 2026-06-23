export interface PlayerStats {
  shotPower: number;
  sprintSpeed: number;
  recoverySpeed: number;
}

export interface PlayerData {
  id: string;
  name: string;
  unlocked: boolean;
  stats: PlayerStats;
}

export interface TeamData {
  id: number;
  name: string;
  color: string;
  text: string;
  rating: number;
  region: string;
  aiIdentity: 'POSSESSION' | 'DIRECT' | 'HIGH_PRESS';
  roster: PlayerData[];
}

function generateRoster(teamPrefix: string, baseRating: number): PlayerData[] {
  // Use a simple seeded randomness based on string length to keep it deterministic for now
  const seed = teamPrefix.length;
  const variation = (seed % 10) - 5; // -5 to +4
  
  const base = Math.max(60, Math.min(99, baseRating + variation));
  
  return [
    {
      id: `${teamPrefix}_p1`,
      name: `${teamPrefix} Captain`,
      unlocked: true,
      stats: { 
        shotPower: Math.min(99, base + 2), 
        sprintSpeed: Math.min(99, base - 1), 
        recoverySpeed: Math.min(99, base + 1) 
      }
    },
    {
      id: `${teamPrefix}_p2`,
      name: `${teamPrefix} Striker`,
      unlocked: false,
      stats: { 
        shotPower: Math.min(99, base + 10), 
        sprintSpeed: Math.min(99, base + 8), 
        recoverySpeed: Math.max(50, base - 10) 
      }
    },
    {
      id: `${teamPrefix}_p3`,
      name: `${teamPrefix} Defender`,
      unlocked: false,
      stats: { 
        shotPower: Math.max(50, base - 8), 
        sprintSpeed: Math.max(50, base - 5), 
        recoverySpeed: Math.min(99, base + 10) 
      }
    }
  ];
}

export const TEAMS: TeamData[] = [
  // Host Nations (CONCACAF)
  { id: 0, name: 'USA', color: '#3b82f6', text: 'text-blue-600', rating: 78, region: 'CONCACAF', aiIdentity: 'HIGH_PRESS', roster: generateRoster('USA', 78) },
  { id: 1, name: 'MEX', color: '#15803d', text: 'text-green-700', rating: 80, region: 'CONCACAF', aiIdentity: 'POSSESSION', roster: generateRoster('MEX', 80) },
  { id: 2, name: 'CAN', color: '#ef4444', text: 'text-red-500', rating: 77, region: 'CONCACAF', aiIdentity: 'DIRECT', roster: generateRoster('CAN', 77) },

  // UEFA
  { id: 3, name: 'AUT', color: '#ef4444', text: 'text-red-500', rating: 81, region: 'UEFA', aiIdentity: 'POSSESSION', roster: generateRoster('AUT', 81) },
  { id: 4, name: 'BEL', color: '#dc2626', text: 'text-red-600', rating: 85, region: 'UEFA', aiIdentity: 'POSSESSION', roster: generateRoster('BEL', 85) },
  { id: 5, name: 'BIH', color: '#2563eb', text: 'text-blue-600', rating: 76, region: 'UEFA', aiIdentity: 'DIRECT', roster: generateRoster('BIH', 76) },
  { id: 6, name: 'CRO', color: '#ef4444', text: 'text-red-500', rating: 84, region: 'UEFA', aiIdentity: 'POSSESSION', roster: generateRoster('CRO', 84) },
  { id: 7, name: 'CZE', color: '#dc2626', text: 'text-red-600', rating: 78, region: 'UEFA', aiIdentity: 'POSSESSION', roster: generateRoster('CZE', 78) },
  { id: 8, name: 'ENG', color: '#ffffff', text: 'text-gray-400', rating: 90, region: 'UEFA', aiIdentity: 'DIRECT', roster: generateRoster('ENG', 90) },
  { id: 9, name: 'FRA', color: '#1d4ed8', text: 'text-blue-700', rating: 94, region: 'UEFA', aiIdentity: 'DIRECT', roster: generateRoster('FRA', 94) },
  { id: 10, name: 'GER', color: '#000000', text: 'text-gray-800', rating: 88, region: 'UEFA', aiIdentity: 'HIGH_PRESS', roster: generateRoster('GER', 88) },
  { id: 11, name: 'NED', color: '#f97316', text: 'text-orange-500', rating: 86, region: 'UEFA', aiIdentity: 'DIRECT', roster: generateRoster('NED', 86) },
  { id: 12, name: 'POR', color: '#b91c1c', text: 'text-red-700', rating: 87, region: 'UEFA', aiIdentity: 'DIRECT', roster: generateRoster('POR', 87) },
  { id: 13, name: 'SCO', color: '#1d4ed8', text: 'text-blue-700', rating: 77, region: 'UEFA', aiIdentity: 'HIGH_PRESS', roster: generateRoster('SCO', 77) },
  { id: 14, name: 'ESP', color: '#ef4444', text: 'text-red-500', rating: 89, region: 'UEFA', aiIdentity: 'DIRECT', roster: generateRoster('ESP', 89) },
  { id: 15, name: 'SWE', color: '#facc15', text: 'text-yellow-400', rating: 80, region: 'UEFA', aiIdentity: 'DIRECT', roster: generateRoster('SWE', 80) },
  { id: 16, name: 'SUI', color: '#ef4444', text: 'text-red-500', rating: 82, region: 'UEFA', aiIdentity: 'DIRECT', roster: generateRoster('SUI', 82) },
  { id: 17, name: 'TUR', color: '#dc2626', text: 'text-red-600', rating: 79, region: 'UEFA', aiIdentity: 'DIRECT', roster: generateRoster('TUR', 79) },

  // CONMEBOL
  { id: 18, name: 'ARG', color: '#60a5fa', text: 'text-blue-400', rating: 95, region: 'CONMEBOL', aiIdentity: 'POSSESSION', roster: generateRoster('ARG', 95) },
  { id: 19, name: 'BRA', color: '#fbbf24', text: 'text-yellow-500', rating: 93, region: 'CONMEBOL', aiIdentity: 'HIGH_PRESS', roster: generateRoster('BRA', 93) },
  { id: 20, name: 'COL', color: '#fbbf24', text: 'text-yellow-500', rating: 82, region: 'CONMEBOL', aiIdentity: 'HIGH_PRESS', roster: generateRoster('COL', 82) },
  { id: 21, name: 'ECU', color: '#fef08a', text: 'text-yellow-200', rating: 79, region: 'CONMEBOL', aiIdentity: 'HIGH_PRESS', roster: generateRoster('ECU', 79) },
  { id: 22, name: 'PAR', color: '#ef4444', text: 'text-red-500', rating: 78, region: 'CONMEBOL', aiIdentity: 'HIGH_PRESS', roster: generateRoster('PAR', 78) },
  { id: 23, name: 'URU', color: '#38bdf8', text: 'text-sky-400', rating: 84, region: 'CONMEBOL', aiIdentity: 'HIGH_PRESS', roster: generateRoster('URU', 84) },

  // CONCACAF (Others)
  { id: 24, name: 'CPV', color: '#1d4ed8', text: 'text-blue-700', rating: 74, region: 'CONCACAF', aiIdentity: 'POSSESSION', roster: generateRoster('CPV', 74) },
  { id: 25, name: 'CUW', color: '#3b82f6', text: 'text-blue-600', rating: 72, region: 'CONCACAF', aiIdentity: 'POSSESSION', roster: generateRoster('CUW', 72) },
  { id: 26, name: 'HAI', color: '#ef4444', text: 'text-red-500', rating: 71, region: 'CONCACAF', aiIdentity: 'HIGH_PRESS', roster: generateRoster('HAI', 71) },
  { id: 27, name: 'PAN', color: '#ef4444', text: 'text-red-500', rating: 75, region: 'CONCACAF', aiIdentity: 'HIGH_PRESS', roster: generateRoster('PAN', 75) },

  // CAF
  { id: 28, name: 'ALG', color: '#ffffff', text: 'text-gray-400', rating: 79, region: 'CAF', aiIdentity: 'DIRECT', roster: generateRoster('ALG', 79) },
  { id: 29, name: 'COD', color: '#38bdf8', text: 'text-sky-400', rating: 76, region: 'CAF', aiIdentity: 'POSSESSION', roster: generateRoster('COD', 76) },
  { id: 30, name: 'EGY', color: '#ef4444', text: 'text-red-500', rating: 78, region: 'CAF', aiIdentity: 'POSSESSION', roster: generateRoster('EGY', 78) },
  { id: 31, name: 'GHA', color: '#ffffff', text: 'text-gray-400', rating: 76, region: 'CAF', aiIdentity: 'DIRECT', roster: generateRoster('GHA', 76) },
  { id: 32, name: 'CIV', color: '#f97316', text: 'text-orange-500', rating: 78, region: 'CAF', aiIdentity: 'POSSESSION', roster: generateRoster('CIV', 78) },
  { id: 33, name: 'MAR', color: '#b91c1c', text: 'text-red-700', rating: 82, region: 'CAF', aiIdentity: 'POSSESSION', roster: generateRoster('MAR', 82) },
  { id: 34, name: 'SEN', color: '#10b981', text: 'text-green-500', rating: 81, region: 'CAF', aiIdentity: 'HIGH_PRESS', roster: generateRoster('SEN', 81) },
  { id: 35, name: 'TUN', color: '#ef4444', text: 'text-red-500', rating: 77, region: 'CAF', aiIdentity: 'POSSESSION', roster: generateRoster('TUN', 77) },

  // AFC
  { id: 36, name: 'AUS', color: '#fbbf24', text: 'text-yellow-500', rating: 77, region: 'AFC', aiIdentity: 'POSSESSION', roster: generateRoster('AUS', 77) },
  { id: 37, name: 'IRN', color: '#ffffff', text: 'text-gray-400', rating: 78, region: 'AFC', aiIdentity: 'DIRECT', roster: generateRoster('IRN', 78) },
  { id: 38, name: 'IRQ', color: '#10b981', text: 'text-green-500', rating: 74, region: 'AFC', aiIdentity: 'HIGH_PRESS', roster: generateRoster('IRQ', 74) },
  { id: 39, name: 'JPN', color: '#1d4ed8', text: 'text-blue-700', rating: 81, region: 'AFC', aiIdentity: 'DIRECT', roster: generateRoster('JPN', 81) },
  { id: 40, name: 'JOR', color: '#ef4444', text: 'text-red-500', rating: 73, region: 'AFC', aiIdentity: 'POSSESSION', roster: generateRoster('JOR', 73) },
  { id: 41, name: 'KOR', color: '#dc2626', text: 'text-red-600', rating: 80, region: 'AFC', aiIdentity: 'POSSESSION', roster: generateRoster('KOR', 80) },
  { id: 42, name: 'QAT', color: '#7f1d1d', text: 'text-red-900', rating: 75, region: 'AFC', aiIdentity: 'POSSESSION', roster: generateRoster('QAT', 75) },
  { id: 43, name: 'KSA', color: '#10b981', text: 'text-green-500', rating: 76, region: 'AFC', aiIdentity: 'HIGH_PRESS', roster: generateRoster('KSA', 76) },
  { id: 44, name: 'UZB', color: '#3b82f6', text: 'text-blue-600', rating: 75, region: 'AFC', aiIdentity: 'DIRECT', roster: generateRoster('UZB', 75) },

  // OFC
  { id: 45, name: 'NZL', color: '#000000', text: 'text-gray-800', rating: 73, region: 'OFC', aiIdentity: 'DIRECT', roster: generateRoster('NZL', 73) }
];
