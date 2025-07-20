import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"

type Player = {
  id: string
  name: string
}

export function TicketToRideScoreFields({ form, players }: { form: any; players: Player[] }) {
  return (
    <>
      {players.map((player) => (
        <div key={player.id} className="space-y-4">
          <FormField
            control={form.control}
            name={`${player.id}.routes`}
            render={({ field }) => (
              <FormItem>
                <FormLabel>Route Points</FormLabel>
                <FormControl>
                  <Input type="number" min="0" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name={`${player.id}.tickets`}
            render={({ field }) => (
              <FormItem>
                <FormLabel>Destination Tickets (can be negative)</FormLabel>
                <FormControl>
                  <Input type="number" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name={`${player.id}.longestPath`}
            render={({ field }) => (
              <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                <FormControl>
                  <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                </FormControl>
                <div className="space-y-1 leading-none">
                  <FormLabel>Longest Path (+10 points)</FormLabel>
                </div>
              </FormItem>
            )}
          />
        </div>
      ))}
    </>
  )
}
