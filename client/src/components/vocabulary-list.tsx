import type { VocabularyWord } from "@shared/schema";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";
import { useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface VocabularyListProps {
  words: VocabularyWord[];
}

export default function VocabularyList({ words }: VocabularyListProps) {
  const { toast } = useToast();

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("DELETE", `/api/vocabulary/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/vocabulary"] });
      toast({
        title: "Palabra eliminada",
        description: "La palabra ha sido eliminada correctamente.",
      });
    },
  });

  return (
    <ScrollArea className="h-[400px] pr-4">
      <div className="space-y-4">
        {words.map((word) => (
          <div
            key={word.id}
            className="p-4 border rounded-lg flex justify-between items-center gap-4"
          >
            <div className="flex-grow">
              <p className="font-medium text-lg">{word.japanese}</p>
              <p className="text-sm text-muted-foreground">{word.spanish}</p>
            </div>
            <div className="flex items-center gap-2">
              <div className="flex gap-2">
                <Badge variant={word.learned ? "default" : "secondary"}>
                  {word.learned ? "Aprendida" : "Por aprender"}
                </Badge>
                {word.failedAttempts > 0 && (
                  <Badge variant="destructive">
                    Fallos: {word.failedAttempts}
                  </Badge>
                )}
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => deleteMutation.mutate(word.id)}
                className="text-destructive hover:text-destructive"
                disabled={deleteMutation.isPending}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        ))}

        {words.length === 0 && (
          <p className="text-center text-muted-foreground">
            No hay palabras agregadas
          </p>
        )}
      </div>
    </ScrollArea>
  );
}