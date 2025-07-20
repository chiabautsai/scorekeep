import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"

type Player = {
  id: string
  name: string
}

export function WingspanScoreFields({ form, players }: { form: any; players: Player[] }) {
  return (
    <>
      {players.map((player) => (
        <div key={player.id} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name={`${player.id}.birds`}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Birds</FormLabel>
                  <FormControl>
                    <Input type="number" min="0" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name={`${player.id}.bonusCards`}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Bonus Cards</FormLabel>
                  <FormControl>
                    <Input type="number" min="0" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name={`${player.id}.endOfRound`}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>End of Round Goals</FormLabel>
                  <FormControl>
                    <Input type="number" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name={`${player.id}.eggs`}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Eggs</FormLabel>
                  <FormControl>
                    <Input type="number" min="0" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name={`${player.id}.foodCache`}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Food on Cards</FormLabel>
                  <FormControl>
                    <Input type="number" min="0" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name={`${player.id}.tuckedCards`}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tucked Cards</FormLabel>
                  <FormControl>
                    <Input type="number" min="0" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>
      ))}
    </>
  )
}
