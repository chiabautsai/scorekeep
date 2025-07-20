import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"

type Player = {
  id: string
  name: string
}

export function GenericScoreFields({ form, players }: { form: any; players: Player[] }) {
  return (
    <>
      {players.map((player) => (
        <div key={player.id} className="space-y-4">
          <FormField
            control={form.control}
            name={`${player.id}.score`}
            render={({ field }) => (
              <FormItem>
                <FormLabel>Final Score</FormLabel>
                <FormControl>
                  <Input type="number" min="0" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
      ))}
    </>
  )
}
