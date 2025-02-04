import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { insertVocabularySchema } from "@shared/schema";
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";

export default function VocabularyForm() {
  const { toast } = useToast();
  const form = useForm({
    resolver: zodResolver(insertVocabularySchema),
    defaultValues: {
      japanese: "",
      spanish: "",
    },
  });

  const mutation = useMutation({
    mutationFn: async (data: { japanese: string; spanish: string }) => {
      const response = await apiRequest("POST", "/api/vocabulary", data);
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/vocabulary"] });
      form.reset();
      toast({
        title: "¡Palabra agregada!",
        description: "La palabra se ha agregado correctamente.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit((data) => mutation.mutate(data))} className="space-y-4">
        <FormField
          control={form.control}
          name="japanese"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Palabra en Japonés</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="spanish"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Traducción al Español</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" disabled={mutation.isPending}>
          Agregar Palabra
        </Button>
      </form>
    </Form>
  );
}