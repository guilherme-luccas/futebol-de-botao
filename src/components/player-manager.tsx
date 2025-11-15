"use client";

import { useState } from "react";
import type { Dispatch, SetStateAction } from "react";
import type { Player } from "@/lib/types";
import { generatePlayerNames } from "@/ai/flows/help-me-add-players";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { X, Bot, Plus, Loader2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";

interface PlayerManagerProps {
  players: Player[];
  setPlayers: Dispatch<SetStateAction<Player[]>>;
}

export default function PlayerManager({ players, setPlayers }: PlayerManagerProps) {
  const [newPlayerName, setNewPlayerName] = useState("");
  const [aiPrompt, setAiPrompt] = useState("");
  const [numAiPlayers, setNumAiPlayers] = useState(4);
  const [isAddingWithAI, setIsAddingWithAI] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { toast } = useToast();

  const handleAddPlayer = () => {
    if (newPlayerName.trim() && !players.some(p => p.name.toLowerCase() === newPlayerName.trim().toLowerCase())) {
      setPlayers([...players, { id: crypto.randomUUID(), name: newPlayerName.trim() }]);
      setNewPlayerName("");
    } else {
        toast({
            variant: "destructive",
            title: "Invalid Name",
            description: "Player name cannot be empty or a duplicate.",
        });
    }
  };

  const handleRemovePlayer = (id: string) => {
    setPlayers(players.filter(p => p.id !== id));
  };

  const handleGenerateWithAI = async () => {
    if (!aiPrompt.trim()) {
        toast({
            variant: "destructive",
            title: "Prompt is empty",
            description: "Please describe the players you want to generate.",
        });
        return;
    }
    setIsAddingWithAI(true);
    try {
        const result = await generatePlayerNames({
            prompt: aiPrompt,
            numberOfPlayers: numAiPlayers,
        });
        const newPlayers = result.playerNames
            .filter(name => !players.some(p => p.name.toLowerCase() === name.toLowerCase()))
            .map(name => ({ id: crypto.randomUUID(), name }));
        
        setPlayers([...players, ...newPlayers]);

        toast({
            title: "Players Added",
            description: `${newPlayers.length} new players were added to the tournament.`,
        });

        setIsDialogOpen(false);
        setAiPrompt("");
    } catch (error) {
        console.error("Failed to generate players with AI", error);
        toast({
            variant: "destructive",
            title: "AI Generation Failed",
            description: "Could not generate players. Please try again.",
        });
    } finally {
        setIsAddingWithAI(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="new-player">Player Names</Label>
        <div className="flex gap-2">
          <Input
            id="new-player"
            value={newPlayerName}
            onChange={(e) => setNewPlayerName(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleAddPlayer()}
            placeholder="e.g., John Doe"
          />
          <Button onClick={handleAddPlayer}><Plus className="mr-2 h-4 w-4"/> Add Player</Button>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline"><Bot className="mr-2 h-4 w-4" /> AI...</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add Players with AI</DialogTitle>
                <DialogDescription>Describe the type of players you want, and AI will generate names for you.</DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="ai-prompt" className="text-right">Prompt</Label>
                    <Input id="ai-prompt" value={aiPrompt} onChange={e => setAiPrompt(e.target.value)} placeholder="e.g., famous brazilian players" className="col-span-3"/>
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="ai-num" className="text-right">Number</Label>
                    <Input id="ai-num" type="number" value={numAiPlayers} onChange={e => setNumAiPlayers(parseInt(e.target.value))} min="1" max="20" className="col-span-3"/>
                </div>
              </div>
              <DialogFooter>
                <Button onClick={handleGenerateWithAI} disabled={isAddingWithAI} className="bg-accent hover:bg-accent/90 text-accent-foreground">
                    {isAddingWithAI ? <Loader2 className="mr-2 h-4 w-4 animate-spin"/> : <Bot className="mr-2 h-4 w-4"/>}
                    Generate
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
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
