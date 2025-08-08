"use client";
import { CompatProps, unwrap } from '@/types/next-compat';
import { useState, useEffect } from "react";
import Link from "next/link";
import { Analysis } from "@/lib/models";
import { analysisService } from "@/lib/dataService";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Table, 
  TableHeader, 
  TableBody, 
  TableHead, 
  TableRow, 
  TableCell 
} from "@/components/ui/table";

export default async function AnalysesPage() {
  const _p = await unwrap(params);
  const _sp = await unwrap(searchParams);
  const [analyses, setAnalyses] = useState<Analysis[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    const loadData = () => {
      const allAnalyses = analysisService.getAll();
      setAnalyses(allAnalyses);
      setIsLoading(false);
    };
    
    // Small delay to simulate loading and ensure localStorage is ready
    setTimeout(loadData, 500);
  }, []);
  
  const handleSearch = () => {
    if (searchQuery.trim() === "") {
      setAnalyses(analysisService.getAll());
    } else {
      const allAnalyses = analysisService.getAll();
      const query = searchQuery.toLowerCase();
      
      const filteredAnalyses = allAnalyses.filter(analysis => 
        analysis.name.toLowerCase().includes(query) ||
        analysis.analysisCode.toLowerCase().includes(query) ||
        analysis.category.toLowerCase().includes(query)
      );
      
      setAnalyses(filteredAnalyses);
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'GNF',
      minimumFractionDigits: 0,
    }).format(price);
  };

  return (
    <div className="container mx-auto py-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Catalogue des Analyses</h1>
        <Link href="/analyses/new">
          <Button>Nouvelle Analyse</Button>
        </Link>
      </div>
      
      <div className="bg-white p-6 rounded-lg shadow mb-6">
        <div className="flex gap-4 mb-6">
          <Input
            placeholder="Rechercher par nom, code ou catégorie..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="flex-grow"
          />
          <Button onClick={handleSearch}>Rechercher</Button>
        </div>
        
        {isLoading ? (
          <div className="text-center py-10">
            <p className="text-gray-500">Chargement des données...</p>
          </div>
        ) : analyses.length === 0 ? (
          <div className="text-center py-10">
            <p className="text-gray-500">Aucune analyse trouvée</p>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Code</TableHead>
                <TableHead>Nom</TableHead>
                <TableHead>Catégorie</TableHead>
                <TableHead>Prix</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {analyses.map((analysis) => (
                <TableRow key={analysis.id}>
                  <TableCell>{analysis.analysisCode}</TableCell>
                  <TableCell>{analysis.name}</TableCell>
                  <TableCell>{analysis.category}</TableCell>
                  <TableCell>{formatPrice(analysis.price)}</TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Link href={`/analyses/${analysis.id}`}>
                        <Button variant="outline" size="sm">Voir</Button>
                      </Link>
                      <Link href={`/analyses/${analysis.id}/edit`}>
                        <Button variant="outline" size="sm">Modifier</Button>
                      </Link>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </div>
    </div>
  );
}




