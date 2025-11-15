import type { Schedule, Ranking, Playoff, PlayoffMatch, Match, Round } from './types';

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


export function generateRoundRobinSchedule(playerNames: string[], numFields: number): Schedule {
    let players = [...playerNames];
    
    if (players.length % 2 !== 0) {
        players.push("FOLGA");
    }

    const numPlayers = players.length;
    const numRounds = numPlayers - 1;
    const matchesPerRound = numPlayers / 2;
    const rounds: Round[] = [];

    const playerIndices = players.map((_, i) => i);
    const fixedPlayer = playerIndices.shift() as number;

    for (let i = 0; i < numRounds; i++) {
        const roundMatches: Omit<Match, 'player1Score' | 'player2Score'>[] = [];
        
        let opponentIndex = playerIndices[0];
        let p1 = players[fixedPlayer];
        let p2 = players[opponentIndex];
        
        if (p1 !== 'FOLGA' && p2 !== 'FOLGA') {
            roundMatches.push({ field: 0, player1: p1, player2: p2, bye: false });
        } else {
             const playerWithBye = p1 === 'FOLGA' ? players[opponentIndex] : players[fixedPlayer];
             if(playerWithBye){
                roundMatches.push({ field: 0, player1: playerWithBye, player2: 'FOLGA', bye: true });
             }
        }

        for (let j = 1; j < matchesPerRound; j++) {
            const player1Index = playerIndices[j];
            const player2Index = playerIndices[playerIndices.length - j];
            p1 = players[player1Index];
            p2 = players[player2Index];
             if (p1 !== 'FOLGA' && p2 !== 'FOLGA') {
                roundMatches.push({ field: 0, player1: p1, player2: p2, bye: false });
            } else {
                const playerWithBye = p1 === 'FOLGA' ? players[player2Index] : players[player1Index];
                if(playerWithBye){
                    roundMatches.push({ field: 0, player1: playerWithBye, player2: 'FOLGA', bye: true });
                }
            }
        }
        
        // Sort to move the "bye" match to the end
        roundMatches.sort((a, b) => {
            if (a.bye && !b.bye) return 1;
            if (!a.bye && b.bye) return -1;
            return 0;
        });
        
        rounds.push({
            round: i + 1,
            matches: roundMatches.map(m => ({ ...m, player1Score: null, player2Score: null }))
        });

        const last = playerIndices.pop() as number;
        playerIndices.unshift(last);
    }
    
    return { schedule: rounds };
}