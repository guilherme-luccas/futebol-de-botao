"use client";

import { useState } from "react";
import type { Dispatch, SetStateAction } from "react";
import type { Player } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { X, Plus } from "lucide-react";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";

interface PlayerManagerProps {
  players: Player[];
  setPlayers: Dispatch<SetStateAction<Player[]>>;
}

export default function PlayerManager({ players, setPlayers }: PlayerManagerProps) {
  const [newPlayerName, setNewPlayerName] = useState("");
  const { toast } = useToast();

  const handleAddPlayer = () => {
    const trimmedName = newPlayerName.trim().toUpperCase();
    if (trimmedName && !players.some(p => p.name === trimmedName)) {
      setPlayers([...players, { id: crypto.randomUUID(), name: trimmedName }]);
      setNewPlayerName("");
    } else {
        toast({
            variant: "destructive",
            title: "Nome Inválido",
            description: "O nome do jogador não pode estar vazio ou ser duplicado.",
        });
    }
  };

  const handleRemovePlayer = (id: string) => {
    setPlayers(players.filter(p => p.id !== id));
  };

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <div className="flex items-center gap-2">
            <Label htmlFor="new-player">Nomes dos Jogadores</Label>
            <Badge variant="secondary">{players.length}</Badge>
        </div>
        <div className="flex gap-2">
          <Input
            id="new-player"
            value={newPlayerName}
            onChange={(e) => setNewPlayerName(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleAddPlayer()}
            placeholder="Ex: João Silva"
          />
          <Button onClick={handleAddPlayer}><Plus className="mr-2 h-4 w-4"/> Adicionar Jogador</Button>
        </div>
      </div>
      <div className="flex flex-wrap gap-2 min-h-[40px]">
        {players.map((player) => (
          <Badge key={player.id} variant="secondary" className="text-base py-1 pl-3 pr-1 bg-secondary/50">
            {player.name}
            <button onClick={() => handleRemovePlayer(player.id)} className="ml-2 rounded-full hover:bg-destructive/80 p-0.5">
              <X className="h-3 w-3" />
            </button>
          </Badge>
        ))}
      </div>
    </div>
  );
}
