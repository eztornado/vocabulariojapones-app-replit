import { Link } from "wouter";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import VocabularyForm from "@/components/vocabulary-form";
import VocabularyList from "@/components/vocabulary-list";
import { useQuery } from "@tanstack/react-query";
import { BookOpen } from "lucide-react";

export default function Vocabulary() {
  const { data: words = [] } = useQuery({
    queryKey: ["/api/vocabulary"],
  });

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold">Vocabulario Japonés</h1>
          <Link href="/practice">
            <Button>
              <BookOpen className="mr-2 h-4 w-4" />
              Practicar
            </Button>
          </Link>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Agregar Palabra</CardTitle>
            </CardHeader>
            <CardContent>
              <VocabularyForm />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Lista de Vocabulario</CardTitle>
            </CardHeader>
            <CardContent>
              <VocabularyList words={words} />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
