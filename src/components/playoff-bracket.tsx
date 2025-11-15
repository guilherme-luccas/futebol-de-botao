import type { Playoff, PlayoffMatch } from "@/lib/types";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Trophy } from "lucide-react";

interface PlayoffBracketProps {
  playoffs: Playoff;
  onScoreChange: (matchId: string, player: 'player1' | 'player2', score: number | null) => void;
}

const MatchCard = ({ match, onScoreChange, disabled = false }: { match: PlayoffMatch, onScoreChange: PlayoffBracketProps['onScoreChange'], disabled?: boolean }) => (
  <Card className="w-full md:w-80">
    <CardHeader className="p-4">
      <CardTitle className="text-base">{match.name}</CardTitle>
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

export default function PlayoffBracket({ playoffs, onScoreChange }: PlayoffBracketProps) {
  const { semiFinals, final } = playoffs;

  return (
    <div className="flex flex-col md:flex-row items-center justify-center gap-8 md:gap-16 relative">
      {/* Semi-Finals */}
      <div className="flex flex-col gap-8 md:gap-16">
        {semiFinals.map(match => <MatchCard key={match.id} match={match} onScoreChange={onScoreChange} />)}
      </div>

      {/* Connector lines and Final */}
      <div className="flex items-center">
        <div className="hidden md:block w-16 h-px bg-border"></div>
        <MatchCard match={final} onScoreChange={onScoreChange} disabled={!final.player1 || !final.player2} />
      </div>

      {final.winner && (
        <div className="flex flex-col items-center gap-2 mt-8 md:mt-0 md:ml-16">
            <Trophy className="w-16 h-16 text-yellow-400"/>
            <p className="text-xl font-bold">Campeão</p>
            <p className="text-2xl font-headline text-primary">{final.winner}</p>
        </div>
      )}
    </div>
  );
}
