export function formatTime(seconds: number) {
  seconds = Math.round(seconds);
  let hours = (seconds / (60 * 60)) | 0;
  seconds -= hours * 60 * 60;
  let minutes = (seconds / 60) | 0;
  seconds -= minutes * 60;

  return hours + ":" +
      minutes.toString().padStart(2, '0') + ":" +
      seconds.toString().padStart(2, '0');
}