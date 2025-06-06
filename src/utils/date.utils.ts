
import { format, toZonedTime } from 'date-fns-tz';

const IST_TIMEZONE = 'Asia/Kolkata';

export function formatToIST(date: Date): { date: string; time: string } {
  const zonedDate = toZonedTime(date, IST_TIMEZONE);
  return {
    date: format(zonedDate, 'dd/MM/yyyy', { timeZone: IST_TIMEZONE }),
    time: format(zonedDate, 'hh:mm:ss a', { timeZone: IST_TIMEZONE }),
  };
}

export function getPastDateInIST(daysAgo: number): Date {
  const pastDate = new Date();
  pastDate.setDate(pastDate.getDate() - daysAgo);
  return toZonedTime(pastDate, 'Asia/Kolkata'); // Corrected
}
