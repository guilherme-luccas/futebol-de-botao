"use client";

import { useState, useEffect } from "react";
import {
  generateMatchSchedule,
  type GenerateMatchScheduleOutput,
} from "@/ai/flows/generate-match-schedule";
import type { Ranking, Schedule, Player, Playoff } from "@/lib/types";
import { calculateRankings, generatePlayoffs, areAllMatchesPlayed } from "@/lib/tournament-logic";
import PlayerManager from "@/components/player-manager";
import ScheduleDisplay from "@/components/schedule-display";
import RankingsTable from "@/components/rankings-table";
import PlayoffBracket from "@/components/playoff-bracket";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Trophy, Users, Shield, Calendar, Bot, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const FootballIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <circle cx="12" cy="12" r="10" />
      <path d="M12 2a5 5 0 0 0-5 5 5 5 0 0 0 5 5 5 5 0 0 0 5-5 5 5 0 0 0-5-5z" />
      <path d="M12 22a5 5 0 0 0 5-5 5 5 0 0 0-5-5 5 5 0 0 0-5 5 5 5 0 0 0 5 5z" />
      <path d="M22 12a5 5 0 0 0-5-5 5 5 0 0 0-5 5 5 5 0 0 0 5 5 5 5 0 0 0 5-5z" />
      <path d="M2 12a5 5 0 0 0 5 5 5 5 0 0 0 5-5 5 5 0 0 0-5-5 5 5 0 0 0-5 5z" />
    </svg>
  );

export default function TournamentDashboard() {
  const [players, setPlayers] = useState<Player[]>([]);
  const [numFields, setNumFields] = useState(1);
  const [schedule, setSchedule] = useState<Schedule | null>(null);
  const [rankings, setRankings] = useState<Ranking[]>([]);
  const [playoffs, setPlayoffs] = useState<Playoff | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [view, setView] = useState<'setup' | 'tournament'>('setup');
  const { toast } = useToast();

  useEffect(() => {
    if (schedule) {
      const newRankings = calculateRankings(players.map(p => p.name), schedule);
      setRankings(newRankings);
      if (areAllMatchesPlayed(schedule)) {
        const top4Rankings = newRankings.slice(0, 4);
        if (top4Rankings.length === 4) {
          setPlayoffs(generatePlayoffs(top4Rankings));
        }
      }
    }
  }, [schedule, players]);

  const handleGenerateSchedule = async () => {
    if (players.length < 3) {
      toast({
        variant: "destructive",
        title: "Not enough players",
        description: "Please add at least 3 players to generate a schedule.",
      });
      return;
    }
    if (numFields < 1) {
      toast({
        variant: "destructive",
        title: "Invalid number of fields",
        description: "You must have at least 1 field.",
      });
      return;
    }

    setIsLoading(true);
    try {
      const result: GenerateMatchScheduleOutput = await generateMatchSchedule({
        playerNames: players.map((p) => p.name),
        numFields: numFields,
      });

      const initialSchedule: Schedule = {
        schedule: result.schedule.map((round) => ({
          ...round,
          matches: round.matches.map((match) => ({
            ...match,
            player1Score: null,
            player2Score: null,
          })),
        })),
      };
      setSchedule(initialSchedule);
      setView('tournament');
    } catch (error) {
      console.error("Failed to generate schedule:", error);
      toast({
        variant: "destructive",
        title: "Schedule Generation Failed",
        description: "Could not generate a schedule. Please try again.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleScoreChange = (roundIndex: number, matchIndex: number, player: 'player1' | 'player2', score: number | null) => {
    if (!schedule) return;

    const newSchedule = JSON.parse(JSON.stringify(schedule));
    const match = newSchedule.schedule[roundIndex].matches[matchIndex];

    if (player === 'player1') {
      match.player1Score = score;
    } else {
      match.player2Score = score;
    }

    setSchedule(newSchedule);
  };
  
  const handlePlayoffScoreChange = (matchId: string, player: 'player1' | 'player2', score: number | null) => {
      if (!playoffs) return;
  
      const newPlayoffs = JSON.parse(JSON.stringify(playoffs)) as Playoff;
  
      let matchFound = false;
      
      // Check semi-finals
      for (const match of newPlayoffs.semiFinals) {
        if (match.id === matchId) {
          match[player === 'player1' ? 'player1Score' : 'player2Score'] = score;
          matchFound = true;
          break;
        }
      }
  
      // Check final
      if (!matchFound && newPlayoffs.final.id === matchId) {
        newPlayoffs.final[player === 'player1' ? 'player1Score' : 'player2Score'] = score;
      }
      
      // Update winners
      for (const match of newPlayoffs.semiFinals) {
          if (match.player1Score !== null && match.player2Score !== null) {
              if (match.player1Score > match.player2Score) {
                  match.winner = match.player1?.name || null;
              } else if (match.player2Score > match.player1Score) {
                  match.winner = match.player2?.name || null;
              } else {
                  match.winner = null;
              }
          }
      }

      // Populate Final
      const semi1Winner = newPlayoffs.semiFinals[0].winner;
      const semi2Winner = newPlayoffs.semiFinals[1].winner;
      const semi1 = newPlayoffs.semiFinals[0];
      const semi2 = newPlayoffs.semiFinals[1];

      if(semi1Winner && semi1.player1 && semi1.player2) {
        newPlayoffs.final.player1 = semi1.player1.name === semi1Winner ? semi1.player1 : semi1.player2;
      }
      if(semi2Winner && semi2.player1 && semi2.player2) {
        newPlayoffs.final.player2 = semi2.player1.name === semi2Winner ? semi2.player1 : semi2.player2;
      }

      if (newPlayoffs.final.player1Score !== null && newPlayoffs.final.player2Score !== null) {
          if (newPlayoffs.final.player1Score > newPlayoffs.final.player2Score) {
              newPlayoffs.final.winner = newPlayoffs.final.player1?.name || null;
          } else if (newPlayoffs.final.player2Score > newPlayoffs.final.player1Score) {
              newPlayoffs.final.winner = newPlayoffs.final.player2?.name || null;
          } else {
              newPlayoffs.final.winner = null;
          }
      }
  
      setPlayoffs(newPlayoffs);
  };


  const startNewTournament = () => {
    setPlayers([]);
    setNumFields(1);
    setSchedule(null);
    setRankings([]);
    setPlayoffs(null);
    setView('setup');
  }

  return (
    <div className="container mx-auto p-4 md:p-8">
      <header className="mb-8 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <FootballIcon className="h-10 w-10 text-primary" />
          <h1 className="text-3xl md:text-4xl font-bold font-headline">
            Button Football Tournament
          </h1>
        </div>
        {view === 'tournament' && (
          <Button onClick={startNewTournament}>New Tournament</Button>
        )}
      </header>
      
      {view === 'setup' ? (
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-2xl">
              <Users /> Tournament Setup
            </CardTitle>
            <CardDescription>Add players and specify the number of fields to begin.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <PlayerManager players={players} setPlayers={setPlayers} />
            <div className="space-y-2">
              <label htmlFor="numFields" className="flex items-center gap-2 font-medium">
                <Shield /> Number of Fields
              </label>
              <Input
                id="numFields"
                type="number"
                value={numFields}
                onChange={(e) => setNumFields(Math.max(1, parseInt(e.target.value) || 1))}
                min="1"
                className="w-24"
              />
            </div>
            <Button size="lg" onClick={handleGenerateSchedule} disabled={isLoading} className="w-full bg-accent hover:bg-accent/90 text-accent-foreground">
              {isLoading ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Bot className="mr-2 h-4 w-4" />
              )}
              Generate Schedule with AI
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-8">
          {schedule && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-2xl"><Calendar/> Match Schedule</CardTitle>
              </CardHeader>
              <CardContent>
                <ScheduleDisplay schedule={schedule} onScoreChange={handleScoreChange} />
              </CardContent>
            </Card>
          )}

          {rankings.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-2xl"><Trophy/> Rankings</CardTitle>
              </CardHeader>
              <CardContent>
                <RankingsTable rankings={rankings} />
              </CardContent>
            </Card>
          )}

          {playoffs && (
             <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-2xl"><Trophy/> Playoffs</CardTitle>
                <CardDescription>The top 4 players advance to the playoffs!</CardDescription>
              </CardHeader>
              <CardContent>
                <PlayoffBracket playoffs={playoffs} onScoreChange={handlePlayoffScoreChange} />
              </CardContent>
            </Card>
          )}

        </div>
      )}
    </div>
  );
}
