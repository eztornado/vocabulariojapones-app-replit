import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import type { VocabularyWord } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Eye, EyeOff, Check, X } from "lucide-react";

interface WordCardProps {
  word: VocabularyWord;
  onNext: () => void;
}

export default function WordCard({ word, onNext }: WordCardProps) {
  const [showTranslation, setShowTranslation] = useState(false);

  const statusMutation = useMutation({
    mutationFn: async ({ id, learned }: { id: number; learned: boolean }) => {
      await apiRequest("PATCH", `/api/vocabulary/${id}/status`, { learned });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/vocabulary"] });
      onNext();
      setShowTranslation(false);
    },
  });

  const failMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("POST", `/api/vocabulary/${id}/fail`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/vocabulary"] });
    },
  });

  const handleFail = async () => {
    await failMutation.mutateAsync(word.id);
    statusMutation.mutate({ id: word.id, learned: false });
  };

  return (
    <Card className="w-full">
      <CardContent className="pt-6 space-y-6">
        <div className="text-center space-y-4">
          <h2 className="text-4xl font-bold mb-4">{word.japanese}</h2>
          <div className="h-8">
            {showTranslation && (
              <p className="text-xl text-muted-foreground">{word.spanish}</p>
            )}
          </div>
        </div>

        <div className="flex justify-center gap-4">
          <Button
            variant="outline"
            onClick={() => setShowTranslation(!showTranslation)}
          >
            {showTranslation ? (
              <EyeOff className="mr-2 h-4 w-4" />
            ) : (
              <Eye className="mr-2 h-4 w-4" />
            )}
            {showTranslation ? "Ocultar" : "Mostrar"} Traducción
          </Button>
        </div>

        {showTranslation && (
          <div className="flex justify-center gap-4">
            <Button
              variant="destructive"
              onClick={handleFail}
              disabled={statusMutation.isPending}
            >
              <X className="mr-2 h-4 w-4" />
              No Aprendida
            </Button>
            <Button
              variant="default"
              onClick={() =>
                statusMutation.mutate({ id: word.id, learned: true })
              }
              disabled={statusMutation.isPending}
            >
              <Check className="mr-2 h-4 w-4" />
              ¡Aprendida!
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
