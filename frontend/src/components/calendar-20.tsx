
import * as React from "react"
import { useEffect } from "react"

import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { useToast } from "@/components/ui/toast-provider"

export default function Calendar20() {
  const [date, setDate] = React.useState<Date | undefined>()
  const [selectedTime, setSelectedTime] = React.useState<string | null | undefined>()
  const [lastErrorTime, setLastErrorTime] = React.useState<number>(0)
  const { showToast } = useToast()

  const timeSlots = ["8:00", "9:00", "10:00", "11:00", "12:00", "13:00", "14:00", "15:00", "16:00", "17:00"]

  // Calculate date range: today to 15 days from now
  const today = new Date()
  const maxDate = new Date()
  maxDate.setDate(today.getDate() + 15)

  const bookedDates = Array.from(
    { length: 3 },
    (_, i) => new Date(2025, 5, 17 + i)
  )

  // Function to disable dates outside the 15-day range
  const isDateDisabled = (date: Date) => {
    const dateOnly = new Date(date.getFullYear(), date.getMonth(), date.getDate())
    const todayOnly = new Date(today.getFullYear(), today.getMonth(), today.getDate())
    const maxDateOnly = new Date(maxDate.getFullYear(), maxDate.getMonth(), maxDate.getDate())
    
    return dateOnly < todayOnly || dateOnly > maxDateOnly
  }

  function combineDateTime(date: Date | undefined, time: string | null | undefined): Date | null {
    if (!date || !time) return null

    const [hours, minutes] = time.split(":").map(Number)
    const combined = new Date(date)

    combined.setHours(hours, minutes, 0, 0) // set h:m:s:ms
    return combined
  }

  useEffect(() => {
    const finalDate = combineDateTime(date, selectedTime)
    console.log('date:',date?.getMonth())
    console.log('selectedTime:',selectedTime)
    console.log('finalDate:',finalDate?.getMonth())

    // Only validate if we have a valid combined date
    if (finalDate) {
      // Check if the selected date/time is in the past
      if (finalDate.getTime() < Date.now()) {
        // Prevent spam by only showing error once every 3 seconds
        const now = Date.now()
        if (now - lastErrorTime > 3000) {
          showToast({
            message: "Please select a valid future date and time",
            variant: "error",
            duration: 4000
          })
          setLastErrorTime(now)
        }
      }
    }
  }, [date, selectedTime, showToast, lastErrorTime])

  return (
    <Card className="gap-0 p-0">
      <CardContent className="relative p-0 md:pr-48">
        <div className="p-6">
          <Calendar
            mode="single"
            selected={date}
            onSelect={setDate}
            defaultMonth={date || new Date()}
            disabled={(date) => isDateDisabled(date) || bookedDates.some(bookedDate => 
              date.getDate() === bookedDate.getDate() && 
              date.getMonth() === bookedDate.getMonth() && 
              date.getFullYear() === bookedDate.getFullYear()
            )}
            showOutsideDays={false}
            modifiers={{
              booked: bookedDates,
            }}
            modifiersClassNames={{
              booked: "[&>button]:line-through opacity-100",
            }}
            className="bg-transparent p-0 [--cell-size:--spacing(10)] md:[--cell-size:--spacing(12)]"
            formatters={{
              formatWeekdayName: (date) => {
                return date.toLocaleString("en-US", { weekday: "short" })
              },
            }}
          />
        </div>
        <div className="no-scrollbar inset-y-0 right-0 flex max-h-72 w-full scroll-pb-6 flex-col gap-4 overflow-y-auto border-t p-6 md:absolute md:max-h-none md:w-48 md:border-t-0 md:border-l">
          <div className="grid gap-2">
            {timeSlots.map((time) => (
              <Button
                key={time}
                variant={selectedTime === time ? "default" : "outline"}
                onClick={() => setSelectedTime(time)}
                className="w-full shadow-none"
              >
                {time}
              </Button>
            ))}
          </div>
        </div>
      </CardContent>
      <CardFooter className="flex flex-col gap-4 border-t px-6 !py-5 md:flex-row">
        <div className="text-sm">
          {date && selectedTime ? (
            <>
              Your appointment is booked for{" "}
              <span className="font-medium">
                {" "}
                {date?.toLocaleDateString("en-US", {
                  weekday: "long",
                  day: "numeric",
                  month: "long",
                })}{" "}
              </span>
              at <span className="font-medium">{selectedTime}</span>.
            </>
          ) : (
            <>Select a date and time for your meeting.</>
          )}
        </div>
      </CardFooter>
    </Card>
  )
}
