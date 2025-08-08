 param($m) "import { $($m.Groups[1].Value), IdParam, PaginationQuery } from '@/types/next-compat';" 
"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Analysis } from "@/lib/models";
import { analysisService, sampleAnalysisService } from "@/lib/dataService";
import { Button } from "@/components/ui/button";

interface AnalysisPageProps {
  params: {
    id: string;
  };
}

export default async function AnalysisPage({
  const _p = await unwrap(params);
  const _sp = await unwrap(searchParams);   const { id } = _p ?? {};
params }: AnalysisPageProps) {
  const [analysis, setAnalysis] = useState<Analysis | null>(null);
  const [usageCount, setUsageCount] = useState<number>(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  
  useEffect(() => {
    const loadData = () => {
      try {
        const analysisData = analysisService.getById((await params).id);
        if (!analysisData) {
          setError("Analyse non trouvée");
          setIsLoading(false);
          return;
        }
        
        setAnalysis(analysisData);
        
        // Count how many times this analysis has been used
        const allSampleAnalyses = sampleAnalysisService.getAll();
        const count = allSampleAnalyses.filter(sa => sa.analysisId === (await params).id).length;
        setUsageCount(count);
        
        setIsLoading(false);
      } catch (err) {
        console.error("Error loading analysis data:", err);
        setError("Une erreur est survenue lors du chargement des données");
        setIsLoading(false);
      }
    };
    
    // Small delay to simulate loading and ensure localStorage is ready
    setTimeout(loadData, 500);
  }, [(await params).id]);
  
  const handleDelete = () => {
    if (usageCount > 0) {
      alert("Cette analyse ne peut pas être supprimée car elle est utilisée dans des échantillons");
      return;
    }
    
    if (window.confirm("Êtes-vous sûr de vouloir supprimer cette analyse? Cette action est irréversible.")) {
      try {
        const success = analysisService.delete((await params).id);
        if (success) {
          router.push('/analyses');
        } else {
          setError("Impossible de supprimer l'analyse");
        }
      } catch (err) {
        console.error("Error deleting analysis:", err);
        setError("Une erreur est survenue lors de la suppression");
      }
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'GNF',
      minimumFractionDigits: 0,
    }).format(price);
  };
  
  if (isLoading) {
    return (
      <div className="container mx-auto py-6 text-center">
        <p>Chargement...</p>
      </div>
    );
  }
  
  if (error || !analysis) {
    return (
      <div className="container mx-auto py-6">
        <div className="bg-red-50 p-6 rounded-lg shadow text-center">
          <h1 className="text-xl font-semibold text-red-700 mb-2">{error || "Analyse non trouvée"}</h1>
          <Link href="/analyses">
            <Button>Retourner à la liste des analyses</Button>
          </Link>
        </div>
      </div>
    );
  }
  
  return (
    <div className="container mx-auto py-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Détails de l&apos;Analyse</h1>
        <div className="flex gap-2">
          <Link href="/analyses">
            <Button variant="outline">Retour à la liste</Button>
          </Link>
          <Link href={`/analyses/${(await params).id}/edit`}>
            <Button>Modifier</Button>
          </Link>
        </div>
      </div>
      
      <div className="bg-white p-6 rounded-lg shadow mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <p className="text-sm text-gray-500">Code d&apos;analyse</p>
            <p className="font-medium">{analysis.analysisCode}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Nom</p>
            <p className="font-medium">{analysis.name}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Catégorie</p>
            <p className="font-medium">{analysis.category}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Prix</p>
            <p className="font-medium">{formatPrice(analysis.price)}</p>
          </div>
          <div className="md:col-span-2">
            <p className="text-sm text-gray-500">Description</p>
            <p className="font-medium">{analysis.description || "Aucune description"}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Date de création</p>
            <p className="font-medium">{new Date(analysis.createdAt).toLocaleString()}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Dernière mise à jour</p>
            <p className="font-medium">{new Date(analysis.updatedAt).toLocaleString()}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Utilisation</p>
            <p className="font-medium">{usageCount} échantillon(s)</p>
          </div>
        </div>
      </div>
      
      <div className="mt-10 pt-6 border-t flex justify-end">
        <Button 
          variant="destructive" 
          onClick={handleDelete}
          disabled={usageCount > 0}
          title={usageCount > 0 ? "Cette analyse ne peut pas être supprimée car elle est utilisée dans des échantillons" : ""}
        >
          Supprimer l&apos;analyse
        </Button>
      </div>
    </div>
  );
}



