import cron from 'node-cron';
const timezone = { timezone: "Asia/Riyadh" };

export function scheduleTask(interval: string, taskFunction: () => Promise<void>) {
  return cron.schedule(interval, taskFunction, { ...timezone, scheduled: false });
}
