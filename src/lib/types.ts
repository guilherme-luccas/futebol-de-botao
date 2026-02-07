export interface Player {
  id: string;
  name: string;
}

export interface Match {
  field: number;
  player1: string;
  player2: string;
  player1Score: number | null;
  player2Score: number | null;
  bye?: boolean;
  winner?: 'player1' | 'player2' | null;
}

export interface Round {
  round: number;
  matches: Match[];
}

export interface Schedule {
  schedule: Round[];
}

export interface Ranking {
  rank: number;
  name: string;
  played: number;
  wins: number;
  draws: number;
  losses: number;
  goalsFor: number;
  goalsAgainst: number;
  goalDifference: number;
  points: number;
}

export interface PlayoffMatch {
  id: string;
  name: string;
  player1: { name: string; seed: number } | null;
  player2: { name: string; seed: number } | null;
  player1Score: number | null;
  player2Score: number | null;
  winner: string | null;
  nextMatchId: string | null;
  field: number;
}

export interface Playoff {
  semiFinals: PlayoffMatch[];
  final: PlayoffMatch;
}
