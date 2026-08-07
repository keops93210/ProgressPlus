import { useEffect, useState } from "react";

export function useRestTimer(initialTime = 90) {
  const [timeLeft, setTimeLeft] = useState(initialTime);
  const [isRunning, setIsRunning] = useState(false);

  useEffect(() => {
    if (!isRunning) return;

    if (timeLeft <= 0) {
      setIsRunning(false);
      return;
    }

    const timer = setTimeout(() => {
      setTimeLeft((prev) => prev - 1);
    }, 1000);

    return () => clearTimeout(timer);
  }, [isRunning, timeLeft]);

  function start(time?: number) {
    setTimeLeft(time ?? initialTime);
    setIsRunning(true);
  }

  function stop() {
    setIsRunning(false);
  }

  function reset(time?: number) {
    setTimeLeft(time ?? initialTime);
    setIsRunning(false);
  }

  return {
    timeLeft,
    isRunning,
    start,
    stop,
    reset,
  };
}
