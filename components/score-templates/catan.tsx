import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"

type Player = {
  id: string
  name: string
}

export function CatanScoreFields({ form, players }: { form: any; players: Player[] }) {
  return (
    <>
      {players.map((player) => (
        <div key={player.id} className="space-y-4">
          <FormField
            control={form.control}
            name={`${player.id}.victoryPoints`}
            render={({ field }) => (
              <FormItem>
                <FormLabel>Victory Points</FormLabel>
                <FormControl>
                  <Input type="number" min="0" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="grid grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name={`${player.id}.longestRoad`}
              render={({ field }) => (
                <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                  <FormControl>
                    <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <FormLabel>Longest Road (+2 points)</FormLabel>
                  </div>
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name={`${player.id}.largestArmy`}
              render={({ field }) => (
                <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                  <FormControl>
                    <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <FormLabel>Largest Army (+2 points)</FormLabel>
                  </div>
                </FormItem>
              )}
            />
          </div>
        </div>
      ))}
    </>
  )
}
