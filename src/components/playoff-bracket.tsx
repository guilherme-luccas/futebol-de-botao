import type { Playoff, PlayoffMatch } from "@/lib/types";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Trophy, Shuffle } from "lucide-react";
import { useEffect, useRef } from "react";
import confetti from "canvas-confetti";
import { useSounds } from "@/hooks/use-sounds";

interface PlayoffBracketProps {
  playoffs: Playoff;
  onScoreChange: (matchId: string, player: 'player1' | 'player2', score: number | null) => void;
  onDrawField: (matchId: string) => void;
  numFields: number;
}

const MatchCard = ({ match, onScoreChange, onDrawField, numFields, disabled = false }: { match: PlayoffMatch, onScoreChange: PlayoffBracketProps['onScoreChange'], onDrawField: PlayoffBracketProps['onDrawField'], numFields: number, disabled?: boolean }) => (
  <Card className="w-full md:w-80">
    <CardHeader className="p-4">
      <div className="flex justify-between items-center">
        <CardTitle className="text-base">{match.name}</CardTitle>
        {match.field > 0 && (
          <Badge variant="secondary">Campo {match.field}</Badge>
        )}
      </div>
      {numFields > 1 && (
        <Button 
          variant="outline" 
          size="sm" 
          onClick={() => onDrawField(match.id)} 
          className="w-full mt-2"
          disabled={disabled}
        >
          <Shuffle className="mr-2 h-4 w-4" />
          Sortear Campo
        </Button>
      )}
    </CardHeader>
    <CardContent className="p-4 pt-0 space-y-2">
      <div className="flex justify-between items-center">
        <span className="flex-1 truncate">{match.player1 ? `${match.player1.name} (${match.player1.seed})` : 'A definir'}</span>
        <Input
          type="number"
          min="0"
          value={match.player1Score ?? ''}
          onChange={(e) => onScoreChange(match.id, 'player1', e.target.value === '' ? null : parseInt(e.target.value))}
          className="w-16 h-12 text-center text-2xl font-bold"
          aria-label={`${match.player1?.name || 'Jogador 1'} placar`}
          disabled={!match.player1 || disabled}
        />
      </div>
      <div className="flex justify-between items-center">
        <span className="flex-1 truncate">{match.player2 ? `${match.player2.name} (${match.player2.seed})` : 'A definir'}</span>
        <Input
          type="number"
          min="0"
          value={match.player2Score ?? ''}
          onChange={(e) => onScoreChange(match.id, 'player2', e.target.value === '' ? null : parseInt(e.target.value))}
          className="w-16 h-12 text-center text-2xl font-bold"
          aria-label={`${match.player2?.name || 'Jogador 2'} placar`}
          disabled={!match.player2 || disabled}
        />
      </div>
      {match.winner && <div className="pt-2 text-center text-accent font-bold">Vencedor: {match.winner}</div>}
    </CardContent>
  </Card>
);

export default function PlayoffBracket({ playoffs, onScoreChange, onDrawField, numFields }: PlayoffBracketProps) {
  const { semiFinals, final } = playoffs;
  const confettiTriggered = useRef(false);
  const { playChampionCelebration } = useSounds();

  useEffect(() => {
    if (final.winner && !confettiTriggered.current) {
      confettiTriggered.current = true;
      
      // Tocar som de comemoração
      playChampionCelebration();
      
      // Explosão inicial
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#FFD700', '#FFA500', '#FF6347', '#00CED1', '#9370DB']
      });

      // Explosões laterais
      setTimeout(() => {
        confetti({
          particleCount: 50,
          angle: 60,
          spread: 55,
          origin: { x: 0 }
        });
        confetti({
          particleCount: 50,
          angle: 120,
          spread: 55,
          origin: { x: 1 }
        });
      }, 250);

      // Chuva de confete
      const duration = 3000;
      const end = Date.now() + duration;
      const interval = setInterval(() => {
        if (Date.now() > end) {
          clearInterval(interval);
          return;
        }
        confetti({
          particleCount: 3,
          angle: 90,
          spread: 50,
          origin: { x: Math.random(), y: 0 },
          colors: ['#FFD700', '#FFA500', '#FF6347']
        });
      }, 100);
    }
  }, [final.winner]);

  return (
    <div className="flex flex-col md:flex-row items-center justify-center gap-8 md:gap-16 relative">
      {/* Semi-Finals */}
      <div className="flex flex-col gap-8 md:gap-16">
        {semiFinals.map(match => <MatchCard key={match.id} match={match} onScoreChange={onScoreChange} onDrawField={onDrawField} numFields={numFields} />)}
      </div>

      {/* Connector lines and Final */}
      <div className="flex items-center">
        <div className="hidden md:block w-16 h-px bg-border"></div>
        <MatchCard match={final} onScoreChange={onScoreChange} onDrawField={onDrawField} numFields={numFields} disabled={!final.player1 || !final.player2} />
      </div>

      {final.winner && (
        <div className="flex flex-col items-center gap-2 mt-8 md:mt-0 md:ml-2 animate-bounce">
            <Trophy className="w-16 h-16 text-yellow-400 animate-pulse"/>
            <p className="text-xl font-bold">Campeão</p>
            <p className="text-2xl font-headline text-primary">{final.winner}</p>
        </div>
      )}
    </div>
  );
}
