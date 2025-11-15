"use client";

import { useState, useEffect, useCallback } from "react";
import type { Ranking, Schedule, Player, Playoff } from "@/lib/types";
import { calculateRankings, generatePlayoffs, areAllMatchesPlayed, generateRoundRobinSchedule } from "@/lib/tournament-logic";
import PlayerManager from "@/components/player-manager";
import ScheduleDisplay from "@/components/schedule-display";
import RankingsTable from "@/components/rankings-table";
import PlayoffBracket from "@/components/playoff-bracket";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Trophy, Users, Shield, Calendar, Loader2, Minus, Plus, Timer } from "lucide-react";
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

  const GameTimer = () => {
    const [isTiming, setIsTiming] = useState(false);
    const [audioContext, setAudioContext] = useState<AudioContext | null>(null);

    useEffect(() => {
        // Initialize AudioContext on the client side to avoid SSR issues.
        setAudioContext(new window.AudioContext());
        return () => {
            audioContext?.close();
        }
    }, []);

    const playAlarm = useCallback(() => {
        if (!audioContext) return;
        
        const playBeep = (freq: number, startTime: number, duration: number) => {
          const oscillator = audioContext.createOscillator();
          const gainNode = audioContext.createGain();
          
          oscillator.connect(gainNode);
          gainNode.connect(audioContext.destination);
          
          oscillator.type = 'square'; 
          oscillator.frequency.setValueAtTime(freq, startTime);
          gainNode.gain.setValueAtTime(1, startTime);
          gainNode.gain.exponentialRampToValueAtTime(0.0001, startTime + duration);
          
          oscillator.start(startTime);
          oscillator.stop(startTime + duration);
        };

        const now = audioContext.currentTime;
        const beepDuration = 0.1;
        const interval = 0.15;
        
        // Schedule a sequence of beeps
        playBeep(988, now, beepDuration); // B5
        playBeep(988, now + interval, beepDuration); // B5
        playBeep(988, now + 2 * interval, beepDuration); // B5

    }, [audioContext]);


    useEffect(() => {
        if (!isTiming) return;

        const timerId = setTimeout(() => {
            playAlarm();
            setIsTiming(false);
        }, 10000); // 10 seconds

        return () => clearTimeout(timerId);
    }, [isTiming, playAlarm]);


    const handleTimerClick = () => {
        if (!isTiming && audioContext) {
            // User interaction is required to start audio context
            if (audioContext.state === 'suspended') {
                audioContext.resume();
            }
            setIsTiming(true);
        }
    };
    
    return (
        <Button onClick={handleTimerClick} disabled={isTiming} variant="outline" size="icon" className="relative">
           <Timer className={`h-5 w-5 ${isTiming ? 'animate-pulse text-destructive' : ''}`} />
           <span className="sr-only">Iniciar Cronômetro de 10 segundos</span>
        </Button>
    );
};

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
        if (top4Rankings.length >= 4) {
          setPlayoffs(generatePlayoffs(top4Rankings));
        }
      }
    }
  }, [schedule, players]);

  const handleGenerateSchedule = async () => {
    if (players.length < 3) {
      toast({
        variant: "destructive",
        title: "Jogadores insuficientes",
        description: "Adicione pelo menos 3 jogadores para gerar uma tabela.",
      });
      return;
    }
    if (numFields < 1) {
      toast({
        variant: "destructive",
        title: "Número de campos inválido",
        description: "Você deve ter pelo menos 1 campo.",
      });
      return;
    }

    setIsLoading(true);
    try {
      const result = generateRoundRobinSchedule(
        players.map((p) => p.name)
      );

      const initialSchedule: Schedule = {
        schedule: result.schedule.map((round) => ({
          ...round,
          matches: round.matches.map((match) => ({
            ...match,
            player1Score: null,
            player2Score: null,
            field: 0,
          })),
        })),
      };
      setSchedule(initialSchedule);
      setView('tournament');
    } catch (error) {
      console.error("Falha ao gerar a tabela:", error);
      toast({
        variant: "destructive",
        title: "Falha na Geração da Tabela",
        description: "Não foi possível gerar uma tabela. Tente novamente.",
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

  const handleRandomizeField = (roundIndex: number, matchIndex: number) => {
    if (!schedule || numFields <= 0) return;
  
    const newSchedule = JSON.parse(JSON.stringify(schedule));
    const round = newSchedule.schedule[roundIndex];
    const currentMatch = round.matches[matchIndex];
  
    const allFields = Array.from({ length: numFields }, (_, i) => i + 1);
    
    // Get fields used by other matches in the same round
    const usedFields = round.matches
        .filter((match: any, index: number) => index !== matchIndex && !match.bye && match.field > 0)
        .map((match: any) => match.field);
  
    // Available fields are all fields minus used fields
    const availableFields = allFields.filter(field => !usedFields.includes(field));
  
    if (availableFields.length === 0 && numFields > 0) {
        toast({
            title: "Todos os campos sorteados",
            description: "Todos os campos já foram usados nesta rodada. Libere um campo para sortear novamente.",
        });
        return;
    }
    
    // From available fields, find one that is different from the current one
    let fieldsToChooseFrom = availableFields.filter(field => field !== currentMatch.field);
    
    // If all available fields are the same as the current one, just use the available pool
    if (fieldsToChooseFrom.length === 0) {
        fieldsToChooseFrom = availableFields;
    }

    if (fieldsToChooseFrom.length === 0) {
      toast({
        variant: "destructive",
        title: "Erro de Sorteio",
        description: "Não foi possível sortear um novo campo.",
      });
      return;
    }

    const newField = fieldsToChooseFrom[Math.floor(Math.random() * fieldsToChooseFrom.length)];
    
    currentMatch.field = newField;
    setSchedule(newSchedule);
  };
  
  const handlePlayoffScoreChange = (matchId: string, player: 'player1' | 'player2', score: number | null) => {
      if (!playoffs) return;
  
      const newPlayoffs = JSON.parse(JSON.stringify(playoffs)) as Playoff;
  
      let matchFound = false;
      
      for (const match of newPlayoffs.semiFinals) {
        if (match.id === matchId) {
          match[player === 'player1' ? 'player1Score' : 'player2Score'] = score;
          matchFound = true;
          break;
        }
      }
  
      if (!matchFound && newPlayoffs.final.id === matchId) {
        newPlayoffs.final[player === 'player1' ? 'player1Score' : 'player2Score'] = score;
      }
      
      for (const match of newPlayoffs.semiFinals) {
          if (match.player1Score !== null && match.player2Score !== null) {
              if (match.player1Score > match.player2Score) {
                  match.winner = match.player1?.name || null;
              } else if (match.player2Score > match.player1Score) {
                  match.winner = match.player2?.name || null;
              } else {
                  match.winner = null;
              }
          } else {
            match.winner = null;
          }
      }

      const semi1WinnerName = newPlayoffs.semiFinals[0].winner;
      const semi2WinnerName = newPlayoffs.semiFinals[1].winner;
      const semi1 = newPlayoffs.semiFinals[0];
      const semi2 = newPlayoffs.semiFinals[1];

      if(semi1WinnerName && semi1.player1 && semi1.player2) {
        newPlayoffs.final.player1 = semi1.player1.name === semi1WinnerName ? semi1.player1 : semi1.player2;
      } else {
        newPlayoffs.final.player1 = null;
        newPlayoffs.final.player1Score = null;
        newPlayoffs.final.player2Score = null;
      }

      if(semi2WinnerName && semi2.player1 && semi2.player2) {
        newPlayoffs.final.player2 = semi2.player1.name === semi2WinnerName ? semi2.player1 : semi2.player2;
      } else {
        newPlayoffs.final.player2 = null;
        newPlayoffs.final.player1Score = null;
        newPlayoffs.final.player2Score = null;
      }

      if (newPlayoffs.final.player1Score !== null && newPlayoffs.final.player2Score !== null) {
          if (newPlayoffs.final.player1Score > newPlayoffs.final.player2Score) {
              newPlayoffs.final.winner = newPlayoffs.final.player1?.name || null;
          } else if (newPlayoffs.final.player2Score > newPlayoffs.final.player1Score) {
              newPlayoffs.final.winner = newPlayoffs.final.player2?.name || null;
          } else {
              newPlayoffs.final.winner = null;
          }
      } else {
        newPlayoffs.final.winner = null;
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
  };

  return (
    <div className="container mx-auto p-4 md:p-8">
      <header className="mb-8 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <FootballIcon className="h-10 w-10 text-primary" />
          <h1 className="text-3xl md:text-4xl font-bold font-headline">
            Torneio de Futebol de Botão
          </h1>
        </div>
        <div className="flex items-center gap-4">
            {view === 'tournament' && <GameTimer />}
            {view === 'tournament' && (
              <Button onClick={startNewTournament}>Novo Torneio</Button>
            )}
        </div>
      </header>
      
      {view === 'setup' ? (
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-2xl">
              <Users /> Configuração do Torneio
            </CardTitle>
            <CardDescription>Adicione jogadores e especifique o número de campos para começar.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <PlayerManager players={players} setPlayers={setPlayers} />
            <div className="space-y-2">
              <Label htmlFor="numFields" className="flex items-center gap-2 font-medium">
                <Shield /> Número de Campos
              </Label>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="icon" onClick={() => setNumFields(Math.max(1, numFields - 1))}>
                    <Minus className="h-4 w-4" />
                </Button>
                <Input
                  id="numFields"
                  type="number"
                  value={numFields}
                  onChange={(e) => setNumFields(Math.max(1, parseInt(e.target.value) || 1))}
                  min="1"
                  className="w-16 text-center"
                />
                <Button variant="outline" size="icon" onClick={() => setNumFields(numFields + 1)}>
                    <Plus className="h-4 w-4" />
                </Button>
              </div>
            </div>
            <Button size="lg" onClick={handleGenerateSchedule} disabled={isLoading} className="w-full bg-accent hover:bg-accent/90 text-accent-foreground">
              {isLoading ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Calendar className="mr-2 h-4 w-4" />
              )}
              Gerar Tabela de Jogos
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-8">
          {schedule && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-2xl"><Calendar/> Tabela de Jogos</CardTitle>
              </CardHeader>
              <CardContent>
                <ScheduleDisplay schedule={schedule} onScoreChange={handleScoreChange} onRandomizeField={handleRandomizeField} />
              </CardContent>
            </Card>
          )}

          {rankings.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-2xl"><Trophy/> Classificação</CardTitle>
              </CardHeader>
              <CardContent>
                <RankingsTable rankings={rankings} />
              </CardContent>
            </Card>
          )}

          {playoffs && (
             <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-2xl"><Trophy/> Mata-mata</CardTitle>
                <CardDescription>Os 4 melhores jogadores avançam para o mata-mata!</CardDescription>
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
