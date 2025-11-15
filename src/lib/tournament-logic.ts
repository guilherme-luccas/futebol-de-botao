import type { Schedule, Ranking, Playoff, PlayoffMatch } from './types';

export function calculateRankings(playerNames: string[], schedule: Schedule): Ranking[] {
  const stats: { [key: string]: Omit<Ranking, 'rank' | 'name'> } = {};

  playerNames.forEach(name => {
    stats[name] = {
      played: 0,
      wins: 0,
      draws: 0,
      losses: 0,
      goalsFor: 0,
      goalsAgainst: 0,
      goalDifference: 0,
      points: 0,
    };
  });

  schedule.schedule.forEach(round => {
    round.matches.forEach(match => {
      if (match.bye || match.player1Score === null || match.player2Score === null) {
        return;
      }

      const { player1, player2, player1Score, player2Score } = match;

      // Player 1 stats
      stats[player1].played++;
      stats[player1].goalsFor += player1Score;
      stats[player1].goalsAgainst += player2Score;

      // Player 2 stats
      stats[player2].played++;
      stats[player2].goalsFor += player2Score;
      stats[player2].goalsAgainst += player1Score;

      if (player1Score > player2Score) {
        stats[player1].wins++;
        stats[player1].points += 3;
        stats[player2].losses++;
      } else if (player2Score > player1Score) {
        stats[player2].wins++;
        stats[player2].points += 3;
        stats[player1].losses++;
      } else {
        stats[player1].draws++;
        stats[player1].points += 1;
        stats[player2].draws++;
        stats[player2].points += 1;
      }
    });
  });

  const rankedList: Omit<Ranking, 'rank'>[] = Object.entries(stats).map(([name, stat]) => ({
    name,
    ...stat,
    goalDifference: stat.goalsFor - stat.goalsAgainst,
  }));

  rankedList.sort((a, b) => {
    if (b.points !== a.points) return b.points - a.points;
    if (b.wins !== a.wins) return b.wins - a.wins;
    if (b.goalDifference !== a.goalDifference) return b.goalDifference - a.goalDifference;
    if (b.goalsFor !== a.goalsFor) return b.goalsFor - a.goalsFor;
    return a.name.localeCompare(b.name);
  });

  return rankedList.map((player, index) => ({
    ...player,
    rank: index + 1,
  }));
}

export function areAllMatchesPlayed(schedule: Schedule): boolean {
  return schedule.schedule.every(round => 
    round.matches.every(match => 
      match.bye || (match.player1Score !== null && match.player2Score !== null)
    )
  );
}

export function generatePlayoffs(top4Rankings: Ranking[]): Playoff | null {
    if (top4Rankings.length < 4) return null;

    const semiFinals: PlayoffMatch[] = [
        {
            id: 'sf1',
            name: 'Semi-Final 1',
            player1: { name: top4Rankings[0].name, seed: 1 },
            player2: { name: top4Rankings[3].name, seed: 4 },
            player1Score: null,
            player2Score: null,
            winner: null,
            nextMatchId: 'f1',
        },
        {
            id: 'sf2',
            name: 'Semi-Final 2',
            player1: { name: top4Rankings[1].name, seed: 2 },
            player2: { name: top4Rankings[2].name, seed: 3 },
            player1Score: null,
            player2Score: null,
            winner: null,
            nextMatchId: 'f1',
        },
    ];

    const final: PlayoffMatch = {
        id: 'f1',
        name: 'Final',
        player1: null,
        player2: null,
        player1Score: null,
        player2Score: null,
        winner: null,
        nextMatchId: null,
    };
    
    return { semiFinals, final };
}
