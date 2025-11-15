"use client";

import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Play, Pause, RefreshCcw } from 'lucide-react';
import { Progress } from '@/components/ui/progress';

const TOTAL_SECONDS = 5;
const ALARM_DURATION_MS = 5000;
// Simple beep sound encoded in Base64
const ALARM_SOUND_DATA_URI = "data:audio/wav;base64,UklGRl9vT19XQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YU Rocko-Sin-Bleep-C4";

export default function GameTimer() {
  const [secondsLeft, setSecondsLeft] = useState(TOTAL_SECONDS);
  const [isActive, setIsActive] = useState(false);
  const alarmAudio = useRef<HTMLAudioElement | null>(null);
  const alarmInterval = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    // This effect runs only on the client-side
    alarmAudio.current = new Audio(ALARM_SOUND_DATA_URI);
  }, []);

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (isActive && secondsLeft > 0) {
      interval = setInterval(() => {
        setSecondsLeft(s => s - 1);
      }, 1000);
    } else if (isActive && secondsLeft === 0) {
      playAlarm();
      setIsActive(false);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isActive, secondsLeft]);

  const playAlarm = () => {
    if (!alarmAudio.current) return;

    alarmAudio.current.currentTime = 0;
    alarmAudio.current.play();

    const startTime = Date.now();
    
    const playLoop = () => {
        if(Date.now() - startTime < ALARM_DURATION_MS) {
            alarmAudio.current?.play();
            alarmInterval.current = setTimeout(playLoop, 300); // Small delay between beeps
        } else {
            stopAlarm();
        }
    }
    playLoop();
  };
  
  const stopAlarm = () => {
    if(alarmInterval.current) {
        clearTimeout(alarmInterval.current);
        alarmInterval.current = null;
    }
    if (alarmAudio.current) {
      alarmAudio.current.pause();
      alarmAudio.current.currentTime = 0;
    }
  }

  const toggleTimer = () => {
    setIsActive(!isActive);
    stopAlarm(); // Stop alarm if user interacts with timer
  };

  const resetTimer = () => {
    setIsActive(false);
    setSecondsLeft(TOTAL_SECONDS);
    stopAlarm();
  };
  
  const progress = (secondsLeft / TOTAL_SECONDS) * 100;

  return (
    <div className="flex flex-col items-center gap-4 p-4 rounded-lg">
      <div className="text-8xl font-bold font-mono tracking-tighter w-48 text-center">
        {secondsLeft}
      </div>
      <Progress value={progress} className="w-full h-4" />
      <div className="flex gap-4 mt-4">
        <Button onClick={toggleTimer} size="lg">
          {isActive ? <Pause className="mr-2" /> : <Play className="mr-2" />}
          {isActive ? 'Pausar' : 'Iniciar'}
        </Button>
        <Button onClick={resetTimer} variant="outline" size="lg">
          <RefreshCcw className="mr-2" />
          Resetar
        </Button>
      </div>
    </div>
  );
}

    