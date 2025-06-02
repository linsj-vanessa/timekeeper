/**
 * Formats total seconds into a human-readable duration string like "1h.30m" or "45m".
 * Rounds to the nearest minute for display.
 * @param totalSeconds - The total seconds to format.
 * @returns A string representing the human-readable duration.
 */
export const formatDurationToHumanReadable = (totalSeconds: number): string => {
  if (totalSeconds < 0) totalSeconds = 0;
  if (totalSeconds === 0) return "0m";

  // Display seconds if it's less than a minute and not zero.
  if (totalSeconds < 60) {
    return `${Math.round(totalSeconds)}s`; 
  }
  
  const roundedTotalMinutes = Math.round(totalSeconds / 60);

  if (roundedTotalMinutes === 0 && totalSeconds > 0) { 
    return "1m"; 
  }

  const hours = Math.floor(roundedTotalMinutes / 60);
  const minutes = roundedTotalMinutes % 60;

  if (hours > 0) {
    let result = `${hours}h`;
    if (minutes > 0) {
      result += `.${String(minutes).padStart(2, '0')}m`;
    }
    return result;
  }
  
  if (minutes > 0) {
    return `${minutes}m`;
  }
  
  return "0m"; 
};
