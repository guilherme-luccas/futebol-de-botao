"use client";

import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Bell, Play, Pause, RefreshCw, TimerOff, AlarmClockOff } from 'lucide-react';

const TIMER_SECONDS = 1200;

export default function GameTimer() {
  const [time, setTime] = useState(TIMER_SECONDS);
  const [isActive, setIsActive] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (isActive && time > 0) {
      interval = setInterval(() => {
        setTime((prevTime) => prevTime - 1);
      }, 1000);
    } else if (isActive && time === 0) {
      audioRef.current?.play();
      setIsActive(false);
    }
    return () => {
      if (interval) {
        clearInterval(interval);
      }
    };
  }, [isActive, time]);

  const toggleTimer = () => {
    if (time === 0) {
        resetTimer();
        setIsActive(true);
    } else {
        setIsActive(!isActive);
    }
  };

  const resetTimer = () => {
    setIsActive(false);
    setTime(TIMER_SECONDS);
    audioRef.current?.pause();
    if (audioRef.current) {
        audioRef.current.currentTime = 0;
    }
  };

  const isPaused = !isActive && time > 0 && time < TIMER_SECONDS;

  const renderStatus = () => {
    if (isActive) {
      return (
        <div className="flex flex-col items-center gap-2">
          <Bell className="h-20 w-20 animate-pulse" />
          <p className="text-lg">Partida em andamento</p>
        </div>
      );
    }
    if (isPaused) {
      return (
        <div className="flex flex-col items-center gap-2">
          <AlarmClockOff className="h-20 w-20" />
          <p className="text-lg">Partida pausada</p>
        </div>
      );
    }
    return (
      <div className="flex flex-col items-center gap-2">
        <TimerOff className="h-20 w-20" />
        <p className="text-lg">Nenhuma partida em andamento</p>
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
          <div className="text-primary h-[124px] flex items-center justify-center">
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
      <audio ref={audioRef} src="https://actions.google.com/sounds/v1/alarms/alarm_clock.ogg" preload="auto" />
    </>
  );
}
