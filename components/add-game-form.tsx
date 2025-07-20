"use client"

import { useState } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"

import { addGame } from "@/lib/data"
import { Button } from "@/components/ui/button"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { toast } from "@/components/ui/use-toast"

const formSchema = z.object({
  name: z.string().min(2, {
    message: "Game name must be at least 2 characters.",
  }),
  template: z.enum(["generic", "catan", "ticket-to-ride", "wingspan", "seven-wonders"], {
    required_error: "Please select a scoring template.",
  }),
})

type Game = {
  id: string
  name: string
  template: string
}

export function AddGameForm({ onAddGame }: { onAddGame: (game: Game) => void }) {
  const [isSubmitting, setIsSubmitting] = useState(false)

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      template: "generic",
    },
  })

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsSubmitting(true)
    try {
      const newGame = await addGame(values)
      onAddGame(newGame)
      toast({
        title: "Game added",
        description: `${values.name} has been added to your library.`,
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to add game. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Game Name</FormLabel>
              <FormControl>
                <Input placeholder="Enter game name" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="template"
          render={({ field }) => (
            <FormItem className="space-y-3">
              <FormLabel>Scoring Template</FormLabel>
              <FormControl>
                <RadioGroup
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                  className="flex flex-col space-y-1"
                >
                  <FormItem className="flex items-center space-x-3 space-y-0">
                    <FormControl>
                      <RadioGroupItem value="generic" />
                    </FormControl>
                    <FormLabel className="font-normal">Generic (Basic score tracking)</FormLabel>
                  </FormItem>
                  <FormItem className="flex items-center space-x-3 space-y-0">
                    <FormControl>
                      <RadioGroupItem value="catan" />
                    </FormControl>
                    <FormLabel className="font-normal">Catan (Victory points, longest road, etc.)</FormLabel>
                  </FormItem>
                  <FormItem className="flex items-center space-x-3 space-y-0">
                    <FormControl>
                      <RadioGroupItem value="ticket-to-ride" />
                    </FormControl>
                    <FormLabel className="font-normal">Ticket to Ride (Routes, tickets, longest path)</FormLabel>
                  </FormItem>
                  <FormItem className="flex items-center space-x-3 space-y-0">
                    <FormControl>
                      <RadioGroupItem value="wingspan" />
                    </FormControl>
                    <FormLabel className="font-normal">
                      Wingspan (Birds, bonus cards, end of round goals, etc.)
                    </FormLabel>
                  </FormItem>
                  <FormItem className="flex items-center space-x-3 space-y-0">
                    <FormControl>
                      <RadioGroupItem value="seven-wonders" />
                    </FormControl>
                    <FormLabel className="font-normal">
                      7 Wonders (Civilian, science, military, guilds, etc.)
                    </FormLabel>
                  </FormItem>

                </RadioGroup>
              </FormControl>
              <FormDescription>
                Select a pre-built template or use the generic option for simple scoring.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" className="w-full" disabled={isSubmitting}>
          {isSubmitting ? "Adding..." : "Add Game"}
        </Button>
      </form>
    </Form>
  )
}
