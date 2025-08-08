 param($m) "import { $($m.Groups[1].Value), IdParam, PaginationQuery } from '@/types/next-compat';" 
"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Report, Patient, Sample, SampleAnalysis, Analysis } from "@/lib/models";
import { reportService, patientService, sampleService, sampleAnalysisService, analysisService } from "@/lib/dataService";
import { Button } from "@/components/ui/button";
import { 
  Table, 
  TableHeader, 
  TableBody, 
  TableHead, 
  TableRow, 
  TableCell 
} from "@/components/ui/table";

interface ReportPageProps {
  params: {
    id: string;
  };
}

export default async function ReportPage({
  const _p = await unwrap(params);
  const _sp = await unwrap(searchParams);   const { id } = _p ?? {};
params }: ReportPageProps) {
  const [report, setReport] = useState<Report | null>(null);
  const [patient, setPatient] = useState<Patient | null>(null);
  const [sample, setSample] = useState<Sample | null>(null);
  const [sampleAnalyses, setSampleAnalyses] = useState<SampleAnalysis[]>([]);
  const [analyses, setAnalyses] = useState<Record<string, Analysis>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  
  useEffect(() => {
    const loadData = () => {
      try {
        // Get report data
        const reportData = reportService.getById((await params).id);
        if (!reportData) {
          setError("Rapport non trouvé");
          setIsLoading(false);
          return;
        }
        
        setReport(reportData);
        
        // Get patient data
        const patientData = patientService.getById(reportData.patientId);
        setPatient(patientData);
        
        // Get sample data
        const sampleData = sampleService.getById(reportData.sampleId);
        setSample(sampleData);
        
        if (sampleData) {
          // Get sample analyses
          const sampleAnalysesData = sampleAnalysisService.getBySampleId(sampleData.id);
          setSampleAnalyses(sampleAnalysesData);
          
          // Get all analyses and create a lookup map
          const allAnalyses = analysisService.getAll();
          const analysesMap: Record<string, Analysis> = {};
          allAnalyses.forEach(analysis => {
            analysesMap[analysis.id] = analysis;
          });
          setAnalyses(analysesMap);
        }
        
        setIsLoading(false);
      } catch (err) {
        console.error("Error loading report data:", err);
        setError("Une erreur est survenue lors du chargement des données");
        setIsLoading(false);
      }
    };
    
    // Small delay to simulate loading and ensure localStorage is ready
    setTimeout(loadData, 500);
  }, [(await params).id]);
  
  const handleStatusChange = async (newStatus: string) => {
    if (!report) return;
    
    try {
      const updatedReport = reportService.update(report.id, {
        status: newStatus as any
      });
      
      if (updatedReport) {
        setReport(updatedReport);
      }
    } catch (err) {
      console.error("Error updating report status:", err);
      setError("Une erreur est survenue lors de la mise à jour du statut");
    }
  };
  
  const handleDelete = () => {
    if (!report) return;
    
    if (window.confirm("Êtes-vous sûr de vouloir supprimer ce rapport? Cette action est irréversible.")) {
      try {
        const success = reportService.delete(report.id);
        if (success) {
          router.push('/reports');
        } else {
          setError("Impossible de supprimer le rapport");
        }
      } catch (err) {
        console.error("Error deleting report:", err);
        setError("Une erreur est survenue lors de la suppression");
      }
    }
  };
  
  const handlePrint = () => {
    window.print();
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString();
  };
  
  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'DRAFT':
        return 'Brouillon';
      case 'FINALIZED':
        return 'Finalisé';
      case 'SIGNED':
        return 'Signé';
      case 'DELIVERED':
        return 'Délivré';
      default:
        return status;
    }
  };
  
  const getStatusClass = (status: string) => {
    switch (status) {
      case 'DRAFT':
        return 'bg-yellow-100 text-yellow-800';
      case 'FINALIZED':
        return 'bg-blue-100 text-blue-800';
      case 'SIGNED':
        return 'bg-green-100 text-green-800';
      case 'DELIVERED':
        return 'bg-gray-100 text-gray-800';
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
  
  if (error || !report || !patient || !sample) {
    return (
      <div className="container mx-auto py-6">
        <div className="bg-red-50 p-6 rounded-lg shadow text-center">
          <h1 className="text-xl font-semibold text-red-700 mb-2">{error || "Données non trouvées"}</h1>
          <Link href="/reports">
            <Button>Retourner à la liste des rapports</Button>
          </Link>
        </div>
      </div>
    );
  }
  
  return (
    <div className="container mx-auto py-6">
      <div className="flex items-center justify-between mb-6 print:hidden">
        <h1 className="text-2xl font-bold">Rapport d&apos;analyse</h1>
        <div className="flex gap-2">
          <Link href="/reports">
            <Button variant="outline">Retour à la liste</Button>
          </Link>
          <Button onClick={handlePrint}>Imprimer</Button>
        </div>
      </div>
      
      <div className="bg-white p-6 rounded-lg shadow mb-6">
        {/* Header - Laboratory Info */}
        <div className="mb-8 flex justify-between items-start border-b pb-4">
          <div>
            <h1 className="text-2xl font-bold">ANARPAM Laboratoire</h1>
            <p className="text-sm text-gray-600">Agence Nationale de Recherche et de Planification des Approvisionnements en Médicaments</p>
            <p className="text-sm text-gray-600">BP 1042, Conakry, Guinée</p>
            <p className="text-sm text-gray-600">Tél: +224 000 000 000</p>
          </div>
          <div className="text-right">
            <p className="font-bold">Rapport #{report.reportCode}</p>
            <p className="text-sm text-gray-600">Date: {formatDate(report.createdAt)}</p>
            <p className="text-sm text-gray-600">
              Statut: <span className={`px-2 py-1 text-xs rounded-full ${getStatusClass(report.status)}`}>
                {getStatusLabel(report.status)}
              </span>
            </p>
          </div>
        </div>
        
        {/* Patient & Sample Info */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div>
            <h2 className="text-lg font-semibold mb-2">Information du patient</h2>
            <div className="grid grid-cols-1 gap-1 text-sm">
              <div><span className="font-medium">Code:</span> {patient.patientCode}</div>
              <div><span className="font-medium">Nom complet:</span> {patient.nom} {patient.prenom}</div>
              <div><span className="font-medium">Sexe:</span> {patient.sexe === 'M' ? 'Masculin' : 'Féminin'}</div>
              {patient.dateNaissance && (
                <div><span className="font-medium">Date de naissance:</span> {formatDate(patient.dateNaissance)}</div>
              )}
              {patient.telephone && (
                <div><span className="font-medium">Téléphone:</span> {patient.telephone}</div>
              )}
            </div>
          </div>
          
          <div>
            <h2 className="text-lg font-semibold mb-2">Information de l&apos;échantillon</h2>
            <div className="grid grid-cols-1 gap-1 text-sm">
              <div><span className="font-medium">Code:</span> {sample.sampleCode}</div>
              <div><span className="font-medium">Type:</span> {sample.typePrelevement}</div>
              <div><span className="font-medium">Date de prélèvement:</span> {formatDate(sample.datePrelevement)}</div>
              {sample.remarks && (
                <div><span className="font-medium">Remarques:</span> {sample.remarks}</div>
              )}
            </div>
          </div>
        </div>
        
        {/* Results Table */}
        <div className="mb-8">
          <h2 className="text-lg font-semibold mb-4">Résultats d&apos;analyses</h2>
          
          {sampleAnalyses.length === 0 ? (
            <p className="text-gray-500">Aucune analyse trouvée pour cet échantillon</p>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Code</TableHead>
                    <TableHead>Analyse</TableHead>
                    <TableHead>Résultat</TableHead>
                    <TableHead>Unité</TableHead>
                    <TableHead>Plage normale</TableHead>
                    <TableHead>Notes</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {sampleAnalyses.map((sampleAnalysis) => {
                    const analysis = analyses[sampleAnalysis.analysisId];
                    return (
                      <TableRow key={sampleAnalysis.id}>
                        <TableCell>{analysis?.analysisCode || "N/A"}</TableCell>
                        <TableCell>{analysis?.name || "Analyse inconnue"}</TableCell>
                        <TableCell className="font-medium">{sampleAnalysis.result || "Non disponible"}</TableCell>
                        <TableCell>{sampleAnalysis.unit || "-"}</TableCell>
                        <TableCell>{sampleAnalysis.normalRange || "-"}</TableCell>
                        <TableCell>{sampleAnalysis.notes || "-"}</TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </div>
        
        {/* Conclusion & Recommendations */}
        <div className="mb-8">
          <h2 className="text-lg font-semibold mb-2">Conclusion</h2>
          <div className="p-4 bg-gray-50 rounded-md mb-4">
            {report.conclusion ? (
              <p>{report.conclusion}</p>
            ) : (
              <p className="text-gray-500 italic">Aucune conclusion fournie</p>
            )}
          </div>
          
          <h2 className="text-lg font-semibold mb-2">Recommandations</h2>
          <div className="p-4 bg-gray-50 rounded-md">
            {report.recommendations ? (
              <p>{report.recommendations}</p>
            ) : (
              <p className="text-gray-500 italic">Aucune recommandation fournie</p>
            )}
          </div>
        </div>
        
        {/* Footer - Signature */}
        <div className="mt-12 pt-6 border-t">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <p className="text-sm text-gray-600">Validé par:</p>
              <div className="h-16"></div>
              <p className="font-medium">Dr. Nom du Biologiste</p>
              <p className="text-sm text-gray-600">Biologiste médical</p>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-600">Date:</p>
              <p>{new Date().toLocaleDateString()}</p>
            </div>
          </div>
        </div>
      </div>
      
      {/* Action Buttons - Only visible when not printing */}
      <div className="mt-6 pt-6 border-t flex justify-between print:hidden">
        <div>
          <Button 
            variant="destructive" 
            onClick={handleDelete}
          >
            Supprimer le rapport
          </Button>
        </div>
        
        <div className="flex gap-2">
          <Link href={`/reports/${report.id}/edit`}>
            <Button variant="outline">Modifier</Button>
          </Link>
          
          {report.status === "DRAFT" && (
            <Button 
              onClick={() => handleStatusChange("FINALIZED")}
              variant="outline"
              className="bg-blue-50 hover:bg-blue-100"
            >
              Finaliser
            </Button>
          )}
          
          {report.status === "FINALIZED" && (
            <Button 
              onClick={() => handleStatusChange("SIGNED")}
              variant="outline"
              className="bg-green-50 hover:bg-green-100"
            >
              Signer
            </Button>
          )}
          
          {report.status === "SIGNED" && (
            <Button 
              onClick={() => handleStatusChange("DELIVERED")}
              variant="outline"
              className="bg-gray-50 hover:bg-gray-100"
            >
              Marquer comme délivré
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}



