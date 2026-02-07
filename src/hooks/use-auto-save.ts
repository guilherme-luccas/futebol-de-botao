import { useEffect, useRef, useCallback } from 'react';
import { useToast } from './use-toast';

export interface TournamentState {
  players: any[];
  numFields: number;
  timerDuration: number;
  schedule: any | null;
  rankings: any[];
  playoffs: any | null;
  view: 'setup' | 'tournament';
  lastSaved?: string;
}

const STORAGE_KEY = 'futebol-botao-tournament-state';
const AUTO_SAVE_INTERVAL = 20 * 60 * 1000; // 20 minutos em milissegundos

export function useAutoSave() {
  const { toast } = useToast();
  const autoSaveTimerRef = useRef<NodeJS.Timeout | null>(null);
  const lastStateRef = useRef<string>('');

  // Função para salvar o estado no localStorage
  const saveState = useCallback((state: TournamentState, showToast = false) => {
    try {
      const stateWithTimestamp = {
        ...state,
        lastSaved: new Date().toISOString(),
      };
      const serialized = JSON.stringify(stateWithTimestamp);
      
      // Evita salvar se o estado não mudou
      if (serialized === lastStateRef.current) {
        return;
      }
      
      localStorage.setItem(STORAGE_KEY, serialized);
      lastStateRef.current = serialized;
      
      if (showToast) {
        toast({
          title: "Estado Salvo",
          description: `Torneio salvo automaticamente às ${new Date().toLocaleTimeString('pt-BR')}`,
          duration: 2000,
        });
      }
    } catch (error) {
      console.error('Erro ao salvar estado:', error);
      toast({
        variant: "destructive",
        title: "Erro ao Salvar",
        description: "Não foi possível salvar o estado do torneio.",
      });
    }
  }, [toast]);

  // Função para carregar o estado do localStorage
  const loadState = useCallback((): TournamentState | null => {
    try {
      const serialized = localStorage.getItem(STORAGE_KEY);
      if (serialized === null) {
        return null;
      }
      const state = JSON.parse(serialized) as TournamentState;
      lastStateRef.current = serialized;
      
      // Mostrar quando o último save foi feito
      if (state.lastSaved) {
        const lastSavedDate = new Date(state.lastSaved);
        toast({
          title: "Estado Recuperado",
          description: `Último salvamento: ${lastSavedDate.toLocaleString('pt-BR')}`,
          duration: 3000,
        });
      }
      
      return state;
    } catch (error) {
      console.error('Erro ao carregar estado:', error);
      return null;
    }
  }, [toast]);

  // Função para limpar o estado salvo
  const clearState = useCallback(() => {
    try {
      localStorage.removeItem(STORAGE_KEY);
      lastStateRef.current = '';
      toast({
        title: "Estado Limpo",
        description: "Os dados salvos foram removidos.",
        duration: 2000,
      });
    } catch (error) {
      console.error('Erro ao limpar estado:', error);
    }
  }, [toast]);

  // Configurar auto-save a cada 20 minutos
  const startAutoSave = useCallback((getCurrentState: () => TournamentState) => {
    // Limpar timer anterior se existir
    if (autoSaveTimerRef.current) {
      clearInterval(autoSaveTimerRef.current);
    }

    // Configurar novo timer
    autoSaveTimerRef.current = setInterval(() => {
      const currentState = getCurrentState();
      // Só faz auto-save se estiver na view de torneio
      if (currentState.view === 'tournament') {
        saveState(currentState, true);
      }
    }, AUTO_SAVE_INTERVAL);
  }, [saveState]);

  // Limpar o timer quando o componente for desmontado
  useEffect(() => {
    return () => {
      if (autoSaveTimerRef.current) {
        clearInterval(autoSaveTimerRef.current);
      }
    };
  }, []);

  return {
    saveState,
    loadState,
    clearState,
    startAutoSave,
  };
}
