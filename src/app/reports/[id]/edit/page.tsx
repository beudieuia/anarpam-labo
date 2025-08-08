 param($m) "import { $($m.Groups[1].Value), IdParam, PaginationQuery } from '@/types/next-compat';" 
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
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

interface EditReportPageProps {
  params: {
    id: string;
  };
}

export default async function EditReportPage({
  const _p = await unwrap(params);
  const _sp = await unwrap(searchParams);   const { id } = _p ?? {};
params }: EditReportPageProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const [report, setReport] = useState<Report | null>(null);
  const [patient, setPatient] = useState<Patient | null>(null);
  const [sample, setSample] = useState<Sample | null>(null);
  const [sampleAnalyses, setSampleAnalyses] = useState<SampleAnalysis[]>([]);
  const [analyses, setAnalyses] = useState<Record<string, Analysis>>({});
  
  const [formData, setFormData] = useState({
    conclusion: "",
    recommendations: ""
  });
  
  const [errors, setErrors] = useState<Record<string, string>>({});
  
  useEffect(() => {
    const loadData = async () => {
      try {
        // Load the report
        const reportData = reportService.getById((await params).id);
        if (!reportData) {
          setError("Rapport non trouvé");
          setIsLoading(false);
          return;
        }
        
        // Check if report is editable
        if (reportData.status === "DELIVERED") {
          setError("Ce rapport a déjà été délivré et ne peut plus être modifié");
          setIsLoading(false);
          return;
        }
        
        setReport(reportData);
        setFormData({
          conclusion: reportData.conclusion || "",
          recommendations: reportData.recommendations || ""
        });
        
        // Load related data
        const patientData = patientService.getById(reportData.patientId);
        setPatient(patientData);
        
        const sampleData = sampleService.getById(reportData.sampleId);
        setSample(sampleData);
        
        if (sampleData) {
          // Load sample analyses
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
  
  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!report) return;
    
    try {
      const updatedReport = reportService.update(report.id, {
        conclusion: formData.conclusion || undefined,
        recommendations: formData.recommendations || undefined
      });
      
      router.push(`/reports/${report.id}`);
    } catch (error) {
      console.error("Error updating report:", error);
      setErrors(prev => ({ ...prev, submit: "Une erreur est survenue lors de la mise à jour du rapport" }));
    }
  };
  
  const formatDate = (dateString?: string) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString();
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
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Modifier le Rapport</h1>
        <Link href={`/reports/${report.id}`}>
          <Button variant="outline">Annuler</Button>
        </Link>
      </div>
      
      <div className="bg-white p-6 rounded-lg shadow mb-6">
        {/* Patient & Sample Info (Read-only) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div>
            <h2 className="text-lg font-semibold mb-2">Information du patient</h2>
            <div className="bg-gray-50 p-4 rounded-md">
              <div className="grid grid-cols-1 gap-1 text-sm">
                <div><span className="font-medium">Code:</span> {patient.patientCode}</div>
                <div><span className="font-medium">Nom complet:</span> {patient.nom} {patient.prenom}</div>
                <div><span className="font-medium">Sexe:</span> {patient.sexe === 'M' ? 'Masculin' : 'Féminin'}</div>
                {patient.dateNaissance && (
                  <div><span className="font-medium">Date de naissance:</span> {formatDate(patient.dateNaissance)}</div>
                )}
              </div>
            </div>
          </div>
          
          <div>
            <h2 className="text-lg font-semibold mb-2">Information de l&apos;échantillon</h2>
            <div className="bg-gray-50 p-4 rounded-md">
              <div className="grid grid-cols-1 gap-1 text-sm">
                <div><span className="font-medium">Code:</span> {sample.sampleCode}</div>
                <div><span className="font-medium">Type:</span> {sample.typePrelevement}</div>
                <div><span className="font-medium">Date de prélèvement:</span> {formatDate(sample.datePrelevement)}</div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Results Table (Read-only) */}
        <div className="mb-6">
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
        
        {/* Editable Form */}
        <form onSubmit={handleSubmit}>
          <div className="mb-6">
            <h2 className="text-lg font-semibold mb-2">Conclusion</h2>
            <textarea
              id="conclusion"
              name="conclusion"
              value={formData.conclusion}
              onChange={handleChange}
              rows={4}
              className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              placeholder="Conclusion générale basée sur les résultats d'analyses"
            />
          </div>
          
          <div className="mb-6">
            <h2 className="text-lg font-semibold mb-2">Recommandations</h2>
            <textarea
              id="recommendations"
              name="recommendations"
              value={formData.recommendations}
              onChange={handleChange}
              rows={4}
              className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              placeholder="Recommandations médicales ou de suivi"
            />
          </div>
          
          {errors.submit && (
            <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded">
              <p className="text-red-600">{errors.submit}</p>
            </div>
          )}
          
          <div className="flex justify-end gap-4">
            <Link href={`/reports/${report.id}`}>
              <Button type="button" variant="outline">Annuler</Button>
            </Link>
            <Button type="submit">Enregistrer les modifications</Button>
          </div>
        </form>
      </div>
    </div>
  );
}



