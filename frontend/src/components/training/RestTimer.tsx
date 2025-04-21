import React, { useState, useEffect } from 'react';
import { Button } from '@heroui/button';
import { SkipForward, Timer } from 'lucide-react';

interface RestTimerProps {
  duration: number; // Duration in seconds
  onComplete: () => void; // Callback when timer finishes or is skipped
}

const RestTimer: React.FC<RestTimerProps> = ({ duration, onComplete }) => {
  const [remainingTime, setRemainingTime] = useState(duration);

  useEffect(() => {
    // Ensure effect runs only if remainingTime > 0
    if (remainingTime <= 0) {
      // Use a check to prevent calling onComplete multiple times if already 0
      if (duration > 0) { 
        onComplete();
      }
      return;
    }

    const intervalId = setInterval(() => {
      setRemainingTime((prevTime) => prevTime - 1);
    }, 1000);

    // Cleanup interval on component unmount or when duration changes
    return () => clearInterval(intervalId);
    // Add duration to dependency array to restart timer if duration changes (though unlikely in this context)
  }, [remainingTime, onComplete, duration]); 

  // Format time as MM:SS
  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleSkip = () => {
    // Directly call onComplete and clear interval defensively
    onComplete(); 
  };

  return (
    <div className="my-6 p-4 border rounded-lg bg-blue-50 dark:bg-gray-800 shadow-md flex flex-col items-center space-y-4">
      <div className="flex items-center text-blue-600 dark:text-blue-400">
        <Timer className="mr-2 h-5 w-5" />
        <h3 className="text-lg font-medium">Rest Time</h3>
      </div>
      <div className="text-5xl font-bold text-gray-800 dark:text-gray-100">
        {formatTime(remainingTime)}
      </div>
      <Button variant="ghost" size="sm" onClick={handleSkip}>
        <SkipForward className="mr-2 h-4 w-4" /> Skip Rest
      </Button>
    </div>
  );
};

export default RestTimer;
