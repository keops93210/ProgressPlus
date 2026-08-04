import { useEffect, useState } from "react";

export default function useStopwatch(
  isRunning: boolean
) {
  const [seconds, setSeconds] = useState(0);

  useEffect(() => {
    if (!isRunning) return;

    const interval = setInterval(() => {
      setSeconds((prev) => prev + 1);
    }, 1000);

    return () => clearInterval(interval);
  }, [isRunning]);

  function reset() {
    setSeconds(0);
  }

  return {
    seconds,
    reset,
  };
}
