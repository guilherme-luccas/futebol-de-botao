"use client";

import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Bell, Play, Pause, RefreshCw, TimerOff, AlarmClockOff } from 'lucide-react';
import { useSounds } from '@/hooks/use-sounds';

interface GameTimerProps {
    timerDuration: number;
}

export default function GameTimer({ timerDuration }: GameTimerProps) {
  const [time, setTime] = useState(timerDuration);
  const [isActive, setIsActive] = useState(false);
  const { playTimerStart, playTimerEnd } = useSounds();

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (isActive && time > 0) {
      interval = setInterval(() => {
        setTime((prevTime) => {
          const newTime = prevTime - 1;
          console.log('Timer funcionando - Tempo restante:', newTime);
          return newTime;
        });
      }, 1000);
    } else if (isActive && time === 0) {
      console.log('Timer finalizado! Tocando alarme.');
      playTimerEnd();
      setIsActive(false);
    }
    return () => {
      if (interval) {
        clearInterval(interval);
      }
    };
  }, [isActive, time, playTimerEnd]);
  
  useEffect(() => {
    setTime(timerDuration);
    // When timer duration is changed during setup, we reset the timer state
    setIsActive(false);
  }, [timerDuration]);


  const toggleTimer = () => {
    if (time === 0) {
        resetTimer();
        playTimerStart();
        setIsActive(true);
    } else {
        if (!isActive) {
          playTimerStart();
        }
        setIsActive(!isActive);
    }
  };

  const resetTimer = () => {
    setIsActive(false);
    setTime(timerDuration);
  };

  const isPaused = !isActive && time > 0 && time < timerDuration;

  const renderStatus = () => {
    if (isActive) {
      return (
        <div className="flex flex-col items-center gap-2 text-accent">
          <Bell className="h-8 w-8 animate-pulse" />
          <p className="text-lg font-semibold">Partida em andamento</p>
        </div>
      );
    }
    if (isPaused) {
      return (
        <div className="flex flex-col items-center gap-2 text-yellow-600">
          <AlarmClockOff className="h-8 w-8" />
          <p className="text-lg font-semibold">Partida pausada</p>
        </div>
      );
    }
    return (
      <div className="flex flex-col items-center gap-2 text-muted-foreground">
        <TimerOff className="h-8 w-8" />
        <p className="text-lg font-semibold">Nenhuma partida em andamento</p>
      </div>
    );
  };


  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-2xl">
            <Bell /> Alarme da Partida
          </CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col items-center justify-center gap-4">
          <div className="h-20 flex items-center justify-center">
            {renderStatus()}
          </div>
          <div className="flex gap-4">
            <Button onClick={toggleTimer} size="lg">
              {isActive ? <Pause className="mr-2 h-6 w-6" /> : <Play className="mr-2 h-6 w-6" />}
              {isActive ? 'Pausar' : 'Iniciar Alarme'}
            </Button>
            <Button onClick={resetTimer} variant="outline" size="lg">
              <RefreshCw className="mr-2 h-6 w-6" />
              Reiniciar
            </Button>
          </div>
        </CardContent>
      </Card>
    </>
  );
}
