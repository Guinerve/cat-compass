import type { Reminder } from "./care";
declare global {
  interface Window {
    catCompassDesktop?: {
      platform: string;
      setReminders: (reminders: (Reminder & { catName: string })[]) => Promise<boolean>;
    };
  }
}
export {};
