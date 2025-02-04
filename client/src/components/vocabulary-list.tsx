import type { VocabularyWord } from "@shared/schema";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";

interface VocabularyListProps {
  words: VocabularyWord[];
}

export default function VocabularyList({ words }: VocabularyListProps) {
  return (
    <ScrollArea className="h-[400px] pr-4">
      <div className="space-y-4">
        {words.map((word) => (
          <div
            key={word.id}
            className="p-4 border rounded-lg flex justify-between items-center"
          >
            <div>
              <p className="font-medium text-lg">{word.japanese}</p>
              <p className="text-sm text-muted-foreground">{word.spanish}</p>
            </div>
            <div className="flex gap-2">
              <Badge variant={word.learned ? "success" : "secondary"}>
                {word.learned ? "Aprendida" : "Por aprender"}
              </Badge>
              {word.failedAttempts > 0 && (
                <Badge variant="destructive">
                  Fallos: {word.failedAttempts}
                </Badge>
              )}
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
