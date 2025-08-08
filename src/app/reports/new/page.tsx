import { CompatProps, unwrap } from '@/types/next-compat';
"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Patient, Sample, SampleAnalysis, Analysis } from "@/lib/models";
import { patientService, sampleService, sampleAnalysisService, analysisService, reportService } from "@/lib/dataService";
import { Button } from "@/components/ui/button";
import { 
  Table, 
  TableHeader, 
  TableBody, 
  TableHead, 
  TableRow, 
  TableCell 
} from "@/components/ui/table";

export default async function NewReportPage() {
  const _p = await unwrap(params);
  const _sp = await unwrap(searchParams);
  const router = useRouter();
  const searchParams = useSearchParams();
  const sampleIdParam = (_sp ?? {}).get('sampleId');
  const patientIdParam = (_sp ?? {}).get('patientId');
  
  const [patients, setPatients] = useState<Patient[]>([]);
  const [samples, setSamples] = useState<Sample[]>([]);
  const [filteredSamples, setFilteredSamples] = useState<Sample[]>([]);
  const [sampleAnalyses, setSampleAnalyses] = useState<SampleAnalysis[]>([]);
  const [analyses, setAnalyses] = useState<Record<string, Analysis>>({});
  
  const [isLoading, setIsLoading] = useState(true);
  const [errors, setErrors] = useState<Record<string, string>>({});
  
  const [formData, setFormData] = useState({
    patientId: patientIdParam || "",
    sampleId: sampleIdParam || "",
    conclusion: "",
    recommendations: ""
  });
  
  useEffect(() => {
    const loadData = async () => {
      try {
        // Load all patients
        const allPatients = patientService.getAll();
        setPatients(allPatients);
        
        // Load all samples
        const allSamples = sampleService.getAll();
        setSamples(allSamples);
        
        // Filter samples by selected patient if any
        filterSamplesByPatient(formData.patientId, allSamples);
        
        // Load all analyses
        const allAnalyses = analysisService.getAll();
        const analysesMap: Record<string, Analysis> = {};
        allAnalyses.forEach(analysis => {
          analysesMap[analysis.id] = analysis;
        });
        setAnalyses(analysesMap);
        
        // Load sample analyses for selected sample if any
        if (formData.sampleId) {
          loadSampleAnalyses(formData.sampleId);
        }
        
        setIsLoading(false);
      } catch (err) {
        console.error("Error loading data:", err);
        setErrors(prev => ({ ...prev, loading: "Une erreur est survenue lors du chargement des données" }));
        setIsLoading(false);
      }
    };
    
    // Small delay to simulate loading and ensure localStorage is ready
    setTimeout(loadData, 500);
  }, [formData.patientId, formData.sampleId, patientIdParam, sampleIdParam]);
  
  const filterSamplesByPatient = (patientId: string, allSamples: Sample[] = samples) => {
    if (!patientId) {
      setFilteredSamples(allSamples);
    } else {
      const filtered = allSamples.filter(sample => sample.patientId === patientId);
      setFilteredSamples(filtered);
      
      // If the current selected sample doesn't belong to this patient, reset it
      if (formData.sampleId && !filtered.some(s => s.id === formData.sampleId)) {
        setFormData(prev => ({ ...prev, sampleId: "" }));
        setSampleAnalyses([]);
      }
    }
  };
  
  const loadSampleAnalyses = (sampleId: string) => {
    const analyses = sampleAnalysisService.getBySampleId(sampleId);
    setSampleAnalyses(analyses);
  };
  
  const handlePatientChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const patientId = e.target.value;
    setFormData(prev => ({ ...prev, patientId, sampleId: "" }));
    filterSamplesByPatient(patientId);
    setSampleAnalyses([]);
    
    // Clear error
    if (errors.patientId) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors.patientId;
        return newErrors;
      });
    }
  };
  
  const handleSampleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const sampleId = e.target.value;
    setFormData(prev => ({ ...prev, sampleId }));
    loadSampleAnalyses(sampleId);
    
    // Clear error
    if (errors.sampleId) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors.sampleId;
        return newErrors;
      });
    }
  };
  
  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  
  const validate = () => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.patientId) {
      newErrors.patientId = "Veuillez sélectionner un patient";
    }
    
    if (!formData.sampleId) {
      newErrors.sampleId = "Veuillez sélectionner un échantillon";
    }
    
    // Check if all analyses of the selected sample have results
    const incompleteAnalyses = sampleAnalyses.filter(sa => 
      sa.status !== "COMPLETED" && sa.status !== "VALIDATED"
    );
    
    if (incompleteAnalyses.length > 0) {
      newErrors.analyses = "Toutes les analyses doivent être terminées ou validées avant de créer un rapport";
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validate()) {
      return;
    }
    
    try {
      const newReport = reportService.create({
        patientId: formData.patientId,
        sampleId: formData.sampleId,
        conclusion: formData.conclusion || undefined,
        recommendations: formData.recommendations || undefined,
        status: "DRAFT"
      });
      
      router.push(`/reports/${newReport.id}`);
    } catch (error) {
      console.error("Error creating report:", error);
      setErrors(prev => ({ ...prev, submit: "Une erreur est survenue lors de la création du rapport" }));
    }
  };

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
  
  const selectedPatient = patients.find(p => p.id === formData.patientId);
  const selectedSample = samples.find(s => s.id === formData.sampleId);
  
  return (
    <div className="container mx-auto py-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Nouveau Rapport</h1>
        <Link href="/reports">
          <Button variant="outline">Retour à la liste</Button>
        </Link>
      </div>
      
      {errors.loading ? (
        <div className="bg-red-50 p-6 rounded-lg shadow text-center">
          <p className="text-red-600">{errors.loading}</p>
        </div>
      ) : (
        <form onSubmit={handleSubmit}>
          <div className="bg-white p-6 rounded-lg shadow mb-6">
            <h2 className="text-lg font-semibold mb-4">Sélection du patient et de l&apos;échantillon</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div>
                <label htmlFor="patientId" className="block text-sm font-medium mb-1">
                  Patient <span className="text-red-500">*</span>
                </label>
                <select
                  id="patientId"
                  name="patientId"
                  value={formData.patientId}
                  onChange={handlePatientChange}
                  className={`flex h-10 w-full rounded-md border ${errors.patientId ? 'border-red-500' : 'border-input'} bg-background px-3 py-2 text-sm`}
                >
                  <option value="">Sélectionnez un patient</option>
                  {patients.map((patient) => (
                    <option key={patient.id} value={patient.id}>
                      {patient.patientCode} - {patient.nom} {patient.prenom}
                    </option>
                  ))}
                </select>
                {errors.patientId && <p className="mt-1 text-sm text-red-500">{errors.patientId}</p>}
              </div>
              
              <div>
                <label htmlFor="sampleId" className="block text-sm font-medium mb-1">
                  Échantillon <span className="text-red-500">*</span>
                </label>
                <select
                  id="sampleId"
                  name="sampleId"
                  value={formData.sampleId}
                  onChange={handleSampleChange}
                  className={`flex h-10 w-full rounded-md border ${errors.sampleId ? 'border-red-500' : 'border-input'} bg-background px-3 py-2 text-sm`}
                  disabled={!formData.patientId}
                >
                  <option value="">Sélectionnez un échantillon</option>
                  {filteredSamples.map((sample) => (
                    <option key={sample.id} value={sample.id}>
                      {sample.sampleCode} - {sample.typePrelevement} ({formatDate(sample.datePrelevement)})
                    </option>
                  ))}
                </select>
                {errors.sampleId && <p className="mt-1 text-sm text-red-500">{errors.sampleId}</p>}
              </div>
            </div>
            
            {selectedPatient && (
              <div className="bg-gray-50 p-4 rounded-md mb-4">
                <h3 className="text-md font-medium mb-2">Information du patient</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                  <div>
                    <span className="text-gray-500">Nom complet:</span> {selectedPatient.nom} {selectedPatient.prenom}
                  </div>
                  <div>
                    <span className="text-gray-500">Sexe:</span> {selectedPatient.sexe === 'M' ? 'Masculin' : 'Féminin'}
                  </div>
                  <div>
                    <span className="text-gray-500">Date de naissance:</span> {formatDate(selectedPatient.dateNaissance)}
                  </div>
                </div>
              </div>
            )}
            
            {selectedSample && (
              <div className="bg-gray-50 p-4 rounded-md">
                <h3 className="text-md font-medium mb-2">Information de l&apos;échantillon</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                  <div>
                    <span className="text-gray-500">Code:</span> {selectedSample.sampleCode}
                  </div>
                  <div>
                    <span className="text-gray-500">Type:</span> {selectedSample.typePrelevement}
                  </div>
                  <div>
                    <span className="text-gray-500">Date de prélèvement:</span> {formatDate(selectedSample.datePrelevement)}
                  </div>
                </div>
              </div>
            )}
          </div>
          
          {formData.sampleId && (
            <div className="bg-white p-6 rounded-lg shadow mb-6">
              <h2 className="text-lg font-semibold mb-4">Résultats d&apos;analyses</h2>
              
              {sampleAnalyses.length === 0 ? (
                <p className="text-gray-500">Aucune analyse trouvée pour cet échantillon</p>
              ) : (
                <>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Code</TableHead>
                        <TableHead>Analyse</TableHead>
                        <TableHead>Résultat</TableHead>
                        <TableHead>Unité</TableHead>
                        <TableHead>Plage normale</TableHead>
                        <TableHead>Statut</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {sampleAnalyses.map((sampleAnalysis) => {
                        const analysis = analyses[sampleAnalysis.analysisId];
                        return (
                          <TableRow key={sampleAnalysis.id}>
                            <TableCell>{analysis?.analysisCode || "N/A"}</TableCell>
                            <TableCell>{analysis?.name || "Analyse inconnue"}</TableCell>
                            <TableCell>{sampleAnalysis.result || "Non disponible"}</TableCell>
                            <TableCell>{sampleAnalysis.unit || "-"}</TableCell>
                            <TableCell>{sampleAnalysis.normalRange || "-"}</TableCell>
                            <TableCell>
                              <span className={`px-2 py-1 text-xs rounded-full ${getStatusClass(sampleAnalysis.status)}`}>
                                {getStatusLabel(sampleAnalysis.status)}
                              </span>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                  
                  {errors.analyses && (
                    <p className="mt-4 text-sm text-red-500">{errors.analyses}</p>
                  )}
                </>
              )}
            </div>
          )}
          
          <div className="bg-white p-6 rounded-lg shadow mb-6">
            <h2 className="text-lg font-semibold mb-4">Conclusion et Recommandations</h2>
            
            <div className="mb-4">
              <label htmlFor="conclusion" className="block text-sm font-medium mb-1">
                Conclusion
              </label>
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
            
            <div className="mb-4">
              <label htmlFor="recommendations" className="block text-sm font-medium mb-1">
                Recommandations
              </label>
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
          </div>
          
          {errors.submit && (
            <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded">
              <p className="text-red-600">{errors.submit}</p>
            </div>
          )}
          
          <div className="flex justify-end gap-4">
            <Link href="/reports">
              <Button type="button" variant="outline">Annuler</Button>
            </Link>
            <Button type="submit">Créer le rapport</Button>
          </div>
        </form>
      )}
    </div>
  );
}



