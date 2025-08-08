 param($m) "import { $($m.Groups[1].Value), IdParam, PaginationQuery } from '@/types/next-compat';" 
"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Sample, Patient, Analysis, SampleAnalysis } from "@/lib/models";
import { sampleService, patientService, analysisService, sampleAnalysisService } from "@/lib/dataService";
import { Button } from "@/components/ui/button";
import { 
  Table, 
  TableHeader, 
  TableBody, 
  TableHead, 
  TableRow, 
  TableCell 
} from "@/components/ui/table";

interface SamplePageProps {
  params: {
    id: string;
  };
}

export default async function SamplePage({
  const _p = await unwrap(params);
  const _sp = await unwrap(searchParams);   const { id } = _p ?? {};
params }: SamplePageProps) {
  const [sample, setSample] = useState<Sample | null>(null);
  const [patient, setPatient] = useState<Patient | null>(null);
  const [sampleAnalyses, setSampleAnalyses] = useState<SampleAnalysis[]>([]);
  const [analyses, setAnalyses] = useState<Record<string, Analysis>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedAnalysis, setSelectedAnalysis] = useState<string>("");
  const router = useRouter();
  
  useEffect(() => {
    const loadData = () => {
      try {
        // Get sample data
        const sampleData = sampleService.getById((await params).id);
        if (!sampleData) {
          setError("Échantillon non trouvé");
          setIsLoading(false);
          return;
        }
        
        setSample(sampleData);
        
        // Get patient data
        const patientData = patientService.getById(sampleData.patientId);
        setPatient(patientData);
        
        // Get sample analyses
        const sampleAnalysesData = sampleAnalysisService.getBySampleId((await params).id);
        setSampleAnalyses(sampleAnalysesData);
        
        // Get all analyses and create a lookup map
        const allAnalyses = analysisService.getAll();
        const analysesMap: Record<string, Analysis> = {};
        allAnalyses.forEach(analysis => {
          analysesMap[analysis.id] = analysis;
        });
        setAnalyses(analysesMap);
        
        setIsLoading(false);
      } catch (err) {
        console.error("Error loading sample data:", err);
        setError("Une erreur est survenue lors du chargement des données");
        setIsLoading(false);
      }
    };
    
    // Small delay to simulate loading and ensure localStorage is ready
    setTimeout(loadData, 500);
  }, [(await params).id]);
  
  const handleDelete = () => {
    if (window.confirm("Êtes-vous sûr de vouloir supprimer cet échantillon? Cette action est irréversible.")) {
      try {
        const success = sampleService.delete((await params).id);
        if (success) {
          router.push('/samples');
        } else {
          setError("Impossible de supprimer l'échantillon");
        }
      } catch (err) {
        console.error("Error deleting sample:", err);
        setError("Une erreur est survenue lors de la suppression");
      }
    }
  };

  const handleAddAnalysis = () => {
    if (!selectedAnalysis) return;
    
    try {
      // Check if this analysis is already added to the sample
      const exists = sampleAnalyses.some(sa => sa.analysisId === selectedAnalysis);
      if (exists) {
        alert("Cette analyse est déjà associée à cet échantillon");
        return;
      }
      
      // Create new sample analysis
      const newSampleAnalysis = sampleAnalysisService.create({
        sampleId: (await params).id,
        analysisId: selectedAnalysis,
        status: "PENDING",
      });
      
      // Update the UI
      setSampleAnalyses(prev => [...prev, newSampleAnalysis]);
      setSelectedAnalysis("");
    } catch (err) {
      console.error("Error adding analysis:", err);
      setError("Une erreur est survenue lors de l'ajout de l'analyse");
    }
  };
  
  const handleStatusChange = (sampleAnalysisId: string, newStatus: string) => {
    try {
      const updated = sampleAnalysisService.update(sampleAnalysisId, {
        status: newStatus as any,
      });
      
      if (updated) {
        // Update the UI
        setSampleAnalyses(prev => 
          prev.map(sa => sa.id === sampleAnalysisId ? updated : sa)
        );
      }
    } catch (err) {
      console.error("Error updating status:", err);
      setError("Une erreur est survenue lors de la mise à jour du statut");
    }
  };
  
  const updateSampleStatus = () => {
    if (!sample) return;
    
    // Determine the overall status based on analyses statuses
    let newStatus: "RECEIVED" | "IN_PROCESS" | "ANALYZED" | "VALIDATED" | "REPORTED" = "RECEIVED";
    
    if (sampleAnalyses.length === 0) {
      newStatus = "RECEIVED";
    } else if (sampleAnalyses.every(sa => sa.status === "VALIDATED")) {
      newStatus = "VALIDATED";
    } else if (sampleAnalyses.every(sa => ["COMPLETED", "VALIDATED"].includes(sa.status))) {
      newStatus = "ANALYZED";
    } else if (sampleAnalyses.some(sa => sa.status === "IN_PROGRESS")) {
      newStatus = "IN_PROCESS";
    }
    
    // Only update if status is different
    if (sample.statut !== newStatus) {
      try {
        const updated = sampleService.update(sample.id, {
          statut: newStatus
        });
        
        if (updated) {
          setSample(updated);
        }
      } catch (err) {
        console.error("Error updating sample status:", err);
      }
    }
  };

  // Call updateSampleStatus whenever sampleAnalyses changes
  useEffect(() => {
    updateSampleStatus();
  }, [sampleAnalyses]);

  const formatDate = (dateString?: string) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString();
  };
  
  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'PENDING':
        return 'En attente';
      case 'IN_PROGRESS':
        return 'En cours';
      case 'COMPLETED':
        return 'Terminé';
      case 'VALIDATED':
        return 'Validé';
      default:
        return status;
    }
  };
  
  const getStatusClass = (status: string) => {
    switch (status) {
      case 'PENDING':
        return 'bg-gray-100 text-gray-800';
      case 'IN_PROGRESS':
        return 'bg-yellow-100 text-yellow-800';
      case 'COMPLETED':
        return 'bg-blue-100 text-blue-800';
      case 'VALIDATED':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };
  
  if (isLoading) {
    return (
      <div className="container mx-auto py-6 text-center">
        <p>Chargement...</p>
      </div>
    );
  }
  
  if (error || !sample) {
    return (
      <div className="container mx-auto py-6">
        <div className="bg-red-50 p-6 rounded-lg shadow text-center">
          <h1 className="text-xl font-semibold text-red-700 mb-2">{error || "Échantillon non trouvé"}</h1>
          <Link href="/samples">
            <Button>Retourner à la liste des échantillons</Button>
          </Link>
        </div>
      </div>
    );
  }
  
  return (
    <div className="container mx-auto py-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Détails de l&apos;Échantillon</h1>
        <div className="flex gap-2">
          <Link href="/samples">
            <Button variant="outline">Retour à la liste</Button>
          </Link>
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Sample Information */}
        <div className="bg-white p-6 rounded-lg shadow lg:col-span-2">
          <h2 className="text-lg font-semibold mb-4">Informations de l&apos;échantillon</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div>
              <p className="text-sm text-gray-500">Code Échantillon</p>
              <p className="font-medium">{sample.sampleCode}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Type de prélèvement</p>
              <p className="font-medium">{sample.typePrelevement}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Date de prélèvement</p>
              <p className="font-medium">{formatDate(sample.datePrelevement)}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Statut</p>
              <p className="font-medium">
                <span className={`px-2 py-1 text-xs rounded-full ${
                  sample.statut === 'RECEIVED' ? 'bg-blue-100 text-blue-800' :
                  sample.statut === 'IN_PROCESS' ? 'bg-yellow-100 text-yellow-800' :
                  sample.statut === 'ANALYZED' ? 'bg-purple-100 text-purple-800' :
                  sample.statut === 'VALIDATED' ? 'bg-green-100 text-green-800' :
                  'bg-gray-100 text-gray-800'
                }`}>
                  {sample.statut === 'RECEIVED' ? 'Reçu' :
                   sample.statut === 'IN_PROCESS' ? 'En cours' :
                   sample.statut === 'ANALYZED' ? 'Analysé' :
                   sample.statut === 'VALIDATED' ? 'Validé' :
                   sample.statut === 'REPORTED' ? 'Rapporté' : sample.statut}
                </span>
              </p>
            </div>
            <div className="md:col-span-2">
              <p className="text-sm text-gray-500">Remarques</p>
              <p className="font-medium">{sample.remarks || "Aucune remarque"}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Date de création</p>
              <p className="font-medium">{new Date(sample.createdAt).toLocaleString()}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Dernière mise à jour</p>
              <p className="font-medium">{new Date(sample.updatedAt).toLocaleString()}</p>
            </div>
          </div>
        </div>
        
        {/* Patient Information */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-lg font-semibold mb-4">Informations du patient</h2>
          
          {patient ? (
            <>
              <div className="mb-4">
                <p className="text-sm text-gray-500">Code Patient</p>
                <p className="font-medium">{patient.patientCode}</p>
              </div>
              <div className="mb-4">
                <p className="text-sm text-gray-500">Nom et Prénom</p>
                <p className="font-medium">{patient.nom} {patient.prenom}</p>
              </div>
              <div className="mb-4">
                <p className="text-sm text-gray-500">Sexe</p>
                <p className="font-medium">{patient.sexe === 'M' ? 'Masculin' : 'Féminin'}</p>
              </div>
              <div className="mb-4">
                <p className="text-sm text-gray-500">Date de naissance</p>
                <p className="font-medium">{formatDate(patient.dateNaissance)}</p>
              </div>
              <div className="mt-4">
                <Link href={`/patients/${patient.id}`}>
                  <Button variant="outline" size="sm">Voir la fiche patient</Button>
                </Link>
              </div>
            </>
          ) : (
            <p className="text-gray-500">Patient non trouvé</p>
          )}
        </div>
      </div>
      
      {/* Analyses Section */}
      <div className="mt-8">
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold">Analyses associées</h2>
            <div className="flex gap-2 items-center">
              <select
                value={selectedAnalysis}
                onChange={(e) => setSelectedAnalysis(e.target.value)}
                className="h-10 rounded-md border border-input bg-background px-3 py-2 text-sm"
              >
                <option value="">Sélectionner une analyse</option>
                {Object.values(analyses)
                  .filter(analysis => !sampleAnalyses.some(sa => sa.analysisId === analysis.id))
                  .map((analysis) => (
                    <option key={analysis.id} value={analysis.id}>
                      {analysis.name}
                    </option>
                  ))}
              </select>
              <Button 
                onClick={handleAddAnalysis} 
                disabled={!selectedAnalysis}
              >
                Ajouter
              </Button>
            </div>
          </div>
          
          {sampleAnalyses.length === 0 ? (
            <div className="text-center py-10">
              <p className="text-gray-500">Aucune analyse associée à cet échantillon</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Code</TableHead>
                  <TableHead>Analyse</TableHead>
                  <TableHead>Résultat</TableHead>
                  <TableHead>Statut</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sampleAnalyses.map((sampleAnalysis) => {
                  const analysis = analyses[sampleAnalysis.analysisId];
                  return (
                    <TableRow key={sampleAnalysis.id}>
                      <TableCell>{analysis?.analysisCode || "N/A"}</TableCell>
                      <TableCell>{analysis?.name || "Analyse inconnue"}</TableCell>
                      <TableCell>
                        {sampleAnalysis.result || "En attente"}
                      </TableCell>
                      <TableCell>
                        <span className={`px-2 py-1 text-xs rounded-full ${getStatusClass(sampleAnalysis.status)}`}>
                          {getStatusLabel(sampleAnalysis.status)}
                        </span>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Link href={`/analyses/${sampleAnalysis.id}`}>
                            <Button variant="outline" size="sm">Éditer</Button>
                          </Link>
                          <select
                            value={sampleAnalysis.status}
                            onChange={(e) => handleStatusChange(sampleAnalysis.id, e.target.value)}
                            className="h-9 rounded-md border border-input bg-background px-2 py-1 text-xs"
                          >
                            <option value="PENDING">En attente</option>
                            <option value="IN_PROGRESS">En cours</option>
                            <option value="COMPLETED">Terminé</option>
                            <option value="VALIDATED">Validé</option>
                          </select>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </div>
      </div>
      
      <div className="mt-10 pt-6 border-t flex justify-end">
        <Button 
          variant="destructive" 
          onClick={handleDelete}
        >
          Supprimer l&apos;échantillon
        </Button>
      </div>
    </div>
  );
}



