import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"

type Player = {
  id: string
  name: string
}

export function SevenWondersScoreFields({ form, players }: { form: any; players: Player[] }) {
  return (
    <>
      {players.map((player) => (
        <div key={player.id} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name={`${player.id}.civilian`}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Civilian Structures</FormLabel>
                  <FormControl>
                    <Input type="number" min="0" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name={`${player.id}.science`}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Science</FormLabel>
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
              name={`${player.id}.commercial`}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Commercial</FormLabel>
                  <FormControl>
                    <Input type="number" min="0" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name={`${player.id}.guilds`}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Guilds</FormLabel>
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
              name={`${player.id}.military`}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Military</FormLabel>
                  <FormControl>
                    <Input type="number" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name={`${player.id}.wonder`}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Wonder</FormLabel>
                  <FormControl>
                    <Input type="number" min="0" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <FormField
            control={form.control}
            name={`${player.id}.coins`}
            render={({ field }) => (
              <FormItem>
                <FormLabel>Coins (÷3)</FormLabel>
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