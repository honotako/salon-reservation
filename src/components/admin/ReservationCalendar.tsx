"use client";

import FullCalendar, { Calendar } from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/react/daygrid";
import themePlugin from "@fullcalendar/react/themes/classic";
import jaLocale from "@fullcalendar/react/locales/ja";
import { useRouter } from "next/navigation";

import "@fullcalendar/react/skeleton.css";
import "@fullcalendar/react/themes/classic/theme.css";
import "@fullcalendar/react/themes/classic/palette.css";

// カレンダーに渡す1件分のデータの形
export type CalendarEvent = {
    id?: string;
    title: string;
    start?: string;
    end?: string;
    color?: string;
    display?: "auto" | "background";
    daysOfWeek?: number[];
    allDay?: boolean;
};

export default function ReservationCalendar({ events }: { events: CalendarEvent[] }) {
    const router = useRouter();
  
    return (
      <FullCalendar
        plugins={[themePlugin,dayGridPlugin]}
        initialView="dayGridMonth"
        locale={jaLocale}
        headerToolbar={{ left: "prev,next today", center: "title", right: "" }}
        events={events}
        eventClick={(info) => {
          router.push(`/admin/reservations/${info.event.id}`);
        }}
      />
    );
  }