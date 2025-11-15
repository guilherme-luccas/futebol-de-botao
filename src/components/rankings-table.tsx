import type { Ranking } from "@/lib/types";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Medal } from "lucide-react";

interface RankingsTableProps {
  rankings: Ranking[];
}

export default function RankingsTable({ rankings }: RankingsTableProps) {
  const getRankColor = (rank: number) => {
    if (rank === 1) return "text-yellow-400";
    if (rank === 2) return "text-gray-400";
    if (rank === 3) return "text-yellow-600";
    return "";
  };
  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[50px]">Pos</TableHead>
            <TableHead>Jogador</TableHead>
            <TableHead className="text-center">J</TableHead>
            <TableHead className="text-center">V</TableHead>
            <TableHead className="text-center">E</TableHead>
            <TableHead className="text-center">D</TableHead>
            <TableHead className="text-center">GP</TableHead>
            <TableHead className="text-center">GC</TableHead>
            <TableHead className="text-center">SG</TableHead>
            <TableHead className="text-center">Pts</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {rankings.map((p) => (
            <TableRow key={p.name} className={p.rank <= 4 ? 'bg-primary/10' : ''}>
              <TableCell className="font-medium">
                <div className="flex items-center gap-2">
                  {p.rank <= 3 ? <Medal className={`h-5 w-5 ${getRankColor(p.rank)}`} /> : null}
                  <span>{p.rank}</span>
                </div>
              </TableCell>
              <TableCell className="font-medium">{p.name}</TableCell>
              <TableCell className="text-center">{p.played}</TableCell>
              <TableCell className="text-center">{p.wins}</TableCell>
              <TableCell className="text-center">{p.draws}</TableCell>
              <TableCell className="text-center">{p.losses}</TableCell>
              <TableCell className="text-center">{p.goalsFor}</TableCell>
              <TableCell className="text-center">{p.goalsAgainst}</TableCell>
              <TableCell className="text-center">{p.goalDifference}</TableCell>
              <TableCell className="text-center font-bold">{p.points}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
