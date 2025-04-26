import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@heroui/button';
import { Play, Pause, RotateCcw } from 'lucide-react';

interface WorkoutTimerProps {
  initialSeconds: number;
  onComplete?: () => void;
  isPrepTime?: boolean;
  isRestTime?: boolean;
  autoStart?: boolean;
  showControls?: boolean;
  size?: 'sm' | 'md' | 'lg';
  enableSound?: boolean;
}

const WorkoutTimer: React.FC<WorkoutTimerProps> = ({
  initialSeconds,
  onComplete,
  isPrepTime = false,
  isRestTime = false,
  autoStart = false,
  showControls = true,
  size = 'md',
  enableSound = true,
}) => {
  const [seconds, setSeconds] = useState(initialSeconds);
  const [isActive, setIsActive] = useState(autoStart);
  const [isPaused, setIsPaused] = useState(false);
  const [hasStarted, setHasStarted] = useState(false);
  
  const intervalRef = useRef<number | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const countdownAudioRef = useRef<HTMLAudioElement | null>(null);
  const completeAudioRef = useRef<HTMLAudioElement | null>(null);
  
  // Set up audio elements
  useEffect(() => {
    if (enableSound) {
      audioRef.current = new Audio('/sounds/beep.mp3');
      countdownAudioRef.current = new Audio('/sounds/countdown-beep.mp3');
      completeAudioRef.current = new Audio('/sounds/complete.mp3');
    }
    
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [enableSound]);
  
  // Timer logic
  useEffect(() => {
    if (isActive && !isPaused) {
      intervalRef.current = window.setInterval(() => {
        setSeconds((prevSeconds) => {
          // Play countdown sound for last 3 seconds
          if (enableSound && prevSeconds <= 4 && prevSeconds > 1) {
            countdownAudioRef.current?.play().catch(e => console.log('Audio play error:', e));
          }
          
          // Play completion sound at 0
          if (enableSound && prevSeconds === 1) {
            completeAudioRef.current?.play().catch(e => console.log('Audio play error:', e));
          }
          
          if (prevSeconds <= 1) {
            clearInterval(intervalRef.current!);
            if (onComplete) {
              onComplete();
            }
            return 0;
          }
          return prevSeconds - 1;
        });
      }, 1000);
    }
    
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isActive, isPaused, onComplete, enableSound]);
  
  const startTimer = () => {
    setIsActive(true);
    setIsPaused(false);
    setHasStarted(true);
    
    // Play start sound
    if (enableSound && !hasStarted) {
      audioRef.current?.play().catch(e => console.log('Audio play error:', e));
    }
  };
  
  const pauseTimer = () => {
    setIsPaused(true);
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
  };
  
  const resumeTimer = () => {
    setIsPaused(false);
  };
  
  const resetTimer = () => {
    setSeconds(initialSeconds);
    setIsActive(false);
    setIsPaused(false);
    setHasStarted(false);
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
  };
  
  // Format time as MM:SS or just SS if less than 60 seconds
  const formatTime = (timeInSeconds: number): string => {
    const minutes = Math.floor(timeInSeconds / 60);
    const remainingSeconds = timeInSeconds % 60;
    
    if (minutes > 0) {
      return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
    }
    return `${remainingSeconds}`;
  };
  
  // Determine background color based on timer state
  const getTimerColor = () => {
    if (isPrepTime) return 'bg-yellow-100 dark:bg-yellow-900';
    if (isRestTime) return 'bg-blue-100 dark:bg-blue-900';
    if (seconds <= 3) return 'bg-red-100 dark:bg-red-900';
    return 'bg-green-100 dark:bg-green-900';
  };
  
  // Determine text size based on size prop
  const getTextSize = () => {
    switch (size) {
      case 'sm': return 'text-4xl';
      case 'lg': return 'text-8xl';
      default: return 'text-6xl';
    }
  };
  
  return (
    <div className="flex flex-col items-center">
      <div 
        className={`${getTimerColor()} ${getTextSize()} font-bold rounded-full flex items-center justify-center transition-colors duration-300`}
        style={{ 
          width: size === 'sm' ? '100px' : size === 'lg' ? '200px' : '150px',
          height: size === 'sm' ? '100px' : size === 'lg' ? '200px' : '150px',
        }}
      >
        {formatTime(seconds)}
      </div>
      
      {showControls && (
        <div className="flex gap-2 mt-4">
          {!isActive && !isPaused ? (
            <Button onClick={startTimer} size="sm">
              <Play className="h-4 w-4 mr-1" /> Start
            </Button>
          ) : isPaused ? (
            <Button onClick={resumeTimer} size="sm">
              <Play className="h-4 w-4 mr-1" /> Resume
            </Button>
          ) : (
            <Button onClick={pauseTimer} size="sm" variant="ghost">
              <Pause className="h-4 w-4 mr-1" /> Pause
            </Button>
          )}
          
          <Button onClick={resetTimer} size="sm" variant="ghost">
            <RotateCcw className="h-4 w-4 mr-1" /> Reset
          </Button>
        </div>
      )}
    </div>
  );
};

export default WorkoutTimer;
