import type { Schedule } from "@/lib/types";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { ChevronsDown, ChevronsUp } from "lucide-react";
import React, { useState, useEffect } from "react";

interface ScheduleDisplayProps {
  schedule: Schedule;
  onScoreChange: (roundIndex: number, matchIndex: number, player: 'player1' | 'player2', score: number | null) => void;
}

export default function ScheduleDisplay({ schedule, onScoreChange }: ScheduleDisplayProps) {
  const [openRounds, setOpenRounds] = useState<string[]>(["item-0"]);

  const allRoundKeys = schedule.schedule.map((_, index) => `item-${index}`);

  const expandAll = () => setOpenRounds(allRoundKeys);
  const collapseAll = () => setOpenRounds([]);

  const getWinnerClass = (isWinner: boolean) => {
    return isWinner ? "bg-accent/30 transition-all duration-500" : "";
  }

  return (
    <div className="space-y-4">
        <div className="flex gap-2 justify-end">
            <Button variant="outline" size="sm" onClick={expandAll}>
                <ChevronsDown className="mr-2 h-4 w-4" />
                Expandir Todos
            </Button>
            <Button variant="outline" size="sm" onClick={collapseAll}>
                <ChevronsUp className="mr-2 h-4 w-4" />
                Recolher Todos
            </Button>
        </div>
        <Accordion type="multiple" className="w-full space-y-4" value={openRounds} onValueChange={setOpenRounds}>
        {schedule.schedule.map((round, roundIndex) => (
            <Card key={round.round}>
                <AccordionItem value={`item-${roundIndex}`} className="border-b-0">
                    <AccordionTrigger className="text-xl font-headline px-6 py-4">
                        Rodada {round.round}
                    </AccordionTrigger>
                    <AccordionContent>
                        <div className="overflow-x-auto px-6 pb-4">
                        <Table>
                            <TableHeader>
                            <TableRow>
                                <TableHead className="w-[40%]">Jogador 1</TableHead>
                                <TableHead className="w-[20%] text-center">Placar</TableHead>
                                <TableHead className="w-[40%] text-right">Jogador 2</TableHead>
                            </TableRow>
                            </TableHeader>
                            <TableBody>
                            {round.matches.map((match, matchIndex) => (
                                <TableRow key={`${match.player1}-${match.player2}-${matchIndex}`}>
                                <TableCell className={cn("text-lg font-medium", getWinnerClass(match.winner === 'player1'))}>{match.player1}</TableCell>
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
                                        className="w-16 h-12 text-center text-3xl font-bold"
                                        aria-label={`${match.player1} placar`}
                                        />
                                        <span className="text-3xl font-bold">-</span>
                                        <Input
                                        type="number"
                                        min="0"
                                        value={match.player2Score ?? ''}
                                        onChange={(e) => onScoreChange(roundIndex, matchIndex, 'player2', e.target.value === '' ? null : parseInt(e.target.value))}
                                        className="w-16 h-12 text-center text-3xl font-bold"
                                        aria-label={`${match.player2} placar`}
                                        />
                                    </div>
                                    )}
                                </TableCell>
                                <TableCell className={cn("text-lg font-medium text-right", getWinnerClass(match.winner === 'player2'))}>{match.player2}</TableCell>
                                </TableRow>
                            ))}
                            </TableBody>
                        </Table>
                        </div>
                    </AccordionContent>
                </AccordionItem>
            </Card>
        ))}
        </Accordion>
    </div>
  );
}
