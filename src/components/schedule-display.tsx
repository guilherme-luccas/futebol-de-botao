import type { Schedule } from "@/lib/types";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";

interface ScheduleDisplayProps {
  schedule: Schedule;
  onScoreChange: (roundIndex: number, matchIndex: number, player: 'player1' | 'player2', score: number | null) => void;
}

export default function ScheduleDisplay({ schedule, onScoreChange }: ScheduleDisplayProps) {
  return (
    <Accordion type="single" collapsible className="w-full" defaultValue="item-0">
      {schedule.schedule.map((round, roundIndex) => (
        <AccordionItem key={round.round} value={`item-${roundIndex}`}>
          <AccordionTrigger className="text-xl font-headline">Rodada {round.round}</AccordionTrigger>
          <AccordionContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[80px]">Campo</TableHead>
                    <TableHead>Jogador 1</TableHead>
                    <TableHead className="w-[120px] text-center">Placar</TableHead>
                    <TableHead>Jogador 2</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {round.matches.map((match, matchIndex) => (
                    <TableRow key={`${match.player1}-${match.player2}-${matchIndex}`}>
                      <TableCell className="font-medium">{match.field}</TableCell>
                      <TableCell>{match.player1}</TableCell>
                      <TableCell className="text-center">
                        {match.bye ? (
                          <Badge variant="outline">FOLGA</Badge>
                        ) : (
                          <div className="flex items-center justify-center gap-2">
                            <Input
                              type="number"
                              min="0"
                              value={match.player1Score ?? ''}
                              onChange={(e) => onScoreChange(roundIndex, matchIndex, 'player1', e.target.value === '' ? null : parseInt(e.target.value))}
                              className="w-14 text-center"
                              aria-label={`${match.player1} placar`}
                            />
                            <span>-</span>
                            <Input
                              type="number"
                              min="0"
                              value={match.player2Score ?? ''}
                              onChange={(e) => onScoreChange(roundIndex, matchIndex, 'player2', e.target.value === '' ? null : parseInt(e.target.value))}
                              className="w-14 text-center"
                              aria-label={`${match.player2} placar`}
                            />
                          </div>
                        )}
                      </TableCell>
                      <TableCell>{match.player2}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </AccordionContent>
        </AccordionItem>
      ))}
    </Accordion>
  );
}
