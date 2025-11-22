import { create } from 'zustand';

interface TimetableEvent {
  id: string | null;
  userId: string | null;
  title: string;
  startTime: string;
  endTime: string;
  location: string;
  description: string;
  uid: string;
  weekNumber: number;
  moduleCode: string;
}

interface TimetableStore {
  timetable: TimetableEvent[];
  setTimetable: (events: TimetableEvent[]) => void;
}

export const useTimetableStore = create<TimetableStore>((set: (arg0: { timetable: any; }) => any) => ({
  timetable: [],
  setTimetable: (events: any) => set({ timetable: events }),
}));
