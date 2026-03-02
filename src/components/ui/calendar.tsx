"use client"

import * as React from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { DayPicker } from "react-day-picker"

import { cn } from "@/lib/utils"
import { buttonVariants } from "@/components/ui/button"

export type CalendarProps = React.ComponentProps<typeof DayPicker>

function Calendar({
  className,
  classNames,
  showOutsideDays = true,
  ...props
}: CalendarProps) {
  return (
    <DayPicker
      showOutsideDays={showOutsideDays}
      className={cn("p-3 bg-background border rounded-md", className)}
      classNames={{
        months: "flex flex-col sm:flex-row space-y-4 sm:space-x-4 sm:space-y-0",
        month: "space-y-4 relative",
        month_caption: "flex flex-col items-center pt-12 pb-2 relative", // Padding top to make room for nav
        caption_label: "text-sm font-semibold text-white tracking-tight",
        nav: "flex items-center absolute right-0 left-0 top-1 justify-between w-full px-4 z-20", // Positioned at top
        button_previous: cn(
          buttonVariants({ variant: "ghost" }),
          "h-8 w-8 p-0 opacity-100 !text-accent hover:!bg-accent hover:!text-black transition-colors rounded-full"
        ),
        button_next: cn(
          buttonVariants({ variant: "ghost" }),
          "h-8 w-8 p-0 opacity-100 !text-accent hover:!bg-accent hover:!text-black transition-colors rounded-full"
        ),
        month_grid: "w-full border-collapse space-y-1",
        weekdays: "flex",
        weekday: "text-muted-foreground rounded-md w-9 font-normal text-[0.8rem] text-center",
        week: "flex w-full mt-2",
        day: cn(
          buttonVariants({ variant: "ghost" }),
          "h-9 w-9 p-0 font-normal aria-selected:opacity-100 hover:bg-accent hover:text-black rounded-md"
        ),
        day_button: "h-9 w-9 p-0 font-normal aria-selected:opacity-100",
        range_end: "day-range-end",
        selected: "!bg-primary !text-white hover:!bg-primary/90 focus:!bg-primary focus:!text-white",
        today: "text-accent font-bold underline underline-offset-4",
        outside: "day-outside text-muted-foreground/50 aria-selected:bg-accent/50 aria-selected:text-muted-foreground",
        disabled: "text-muted-foreground opacity-50",
        range_middle: "aria-selected:bg-accent aria-selected:text-accent-foreground",
        hidden: "invisible",
        ...classNames,
      }}
      components={{
        IconLeft: ({ ...props }) => (
          <ChevronLeft className="h-5 w-5 !text-inherit" {...props} />
        ),
        IconRight: ({ ...props }) => (
          <ChevronRight className="h-5 w-5 !text-inherit" {...props} />
        ),
      }}
      {...props}
    />
  )
}
Calendar.displayName = "Calendar"

export { Calendar }
