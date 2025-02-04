import { useState, useMemo } from "react";
import { Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import WordCard from "@/components/word-card";
import type { VocabularyWord } from "@shared/schema";

export default function Practice() {
  const { data: words = [] } = useQuery({
    queryKey: ["/api/vocabulary"],
  });

  const [currentIndex, setCurrentIndex] = useState(0);

  const sortedWords = useMemo(() => {
    return [...words].sort((a, b) => b.failedAttempts - a.failedAttempts);
  }, [words]);

  const currentWord = sortedWords[currentIndex];

  const nextWord = () => {
    setCurrentIndex((prev) => (prev + 1) % sortedWords.length);
  };

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-2xl mx-auto space-y-6">
        <div className="flex justify-between items-center">
          <Link href="/">
            <Button variant="ghost">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Volver
            </Button>
          </Link>
          <h1 className="text-3xl font-bold">Práctica</h1>
        </div>

        {words.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-lg text-muted-foreground">
              No hay palabras para practicar. ¡Agrega algunas primero!
            </p>
          </div>
        ) : (
          <WordCard word={currentWord} onNext={nextWord} />
        )}
      </div>
    </div>
  );
}
