 param($m) "import { $($m.Groups[1].Value), IdParam, PaginationQuery } from '@/types/next-compat';" 
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { SampleAnalysis, Analysis, Sample, Patient } from "@/lib/models";
import { sampleAnalysisService, analysisService, sampleService, patientService } from "@/lib/dataService";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface SampleAnalysisPageProps {
  params: {
    id: string;
  };
}

export default async function SampleAnalysisPage({
  const _p = await unwrap(params);
  const _sp = await unwrap(searchParams);   const { id } = _p ?? {};
params }: SampleAnalysisPageProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const [sampleAnalysis, setSampleAnalysis] = useState<SampleAnalysis | null>(null);
  const [analysis, setAnalysis] = useState<Analysis | null>(null);
  const [sample, setSample] = useState<Sample | null>(null);
  const [patient, setPatient] = useState<Patient | null>(null);
  
  const [formData, setFormData] = useState({
    result: "",
    normalRange: "",
    unit: "",
    notes: "",
    status: "PENDING"
  });
  
  const [errors, setErrors] = useState<Record<string, string>>({});
  
  useEffect(() => {
    const loadData = async () => {
      try {
        // Load the sample analysis
        const sampleAnalysisData = sampleAnalysisService.getById((await params).id);
        if (!sampleAnalysisData) {
          setError("Analyse d'échantillon non trouvée");
          setIsLoading(false);
          return;
        }
        
        setSampleAnalysis(sampleAnalysisData);
        setFormData({
          result: sampleAnalysisData.result || "",
          normalRange: sampleAnalysisData.normalRange || "",
          unit: sampleAnalysisData.unit || "",
          notes: sampleAnalysisData.notes || "",
          status: sampleAnalysisData.status
        });
        
        // Load related data
        const analysisData = analysisService.getById(sampleAnalysisData.analysisId);
        setAnalysis(analysisData);
        
        const sampleData = sampleService.getById(sampleAnalysisData.sampleId);
        setSample(sampleData);
        
        if (sampleData) {
          const patientData = patientService.getById(sampleData.patientId);
          setPatient(patientData);
        }
        
        setIsLoading(false);
      } catch (err) {
        console.error("Error loading data:", err);
        setError("Une erreur est survenue lors du chargement des données");
        setIsLoading(false);
      }
    };
    
    // Small delay to simulate loading and ensure localStorage is ready
    setTimeout(loadData, 500);
  }, [(await params).id]);
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Clear error when field is modified
    if (errors[name]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };
  
  const validate = () => {
    const newErrors: Record<string, string> = {};
    
    if (formData.status === "COMPLETED" || formData.status === "VALIDATED") {
      if (!formData.result.trim()) {
        newErrors.result = "Le résultat est obligatoire pour les analyses terminées ou validées";
      }
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validate() || !sampleAnalysis) {
      return;
    }
    
    try {
      const updatedSampleAnalysis = sampleAnalysisService.update(sampleAnalysis.id, {
        result: formData.result.trim() || undefined,
        normalRange: formData.normalRange.trim() || undefined,
        unit: formData.unit.trim() || undefined,
        notes: formData.notes.trim() || undefined,
        status: formData.status as any
      });
      
      if (updatedSampleAnalysis && sample) {
        router.push(`/samples/${sample.id}`);
      } else {
        router.push('/samples');
      }
    } catch (error) {
      console.error("Error updating sample analysis:", error);
      setErrors(prev => ({ ...prev, submit: "Une erreur est survenue lors de la mise à jour des résultats" }));
    }
  };
  
  if (isLoading) {
    return (
      <div className="container mx-auto py-6 text-center">
        <p>Chargement...</p>
      </div>
    );
  }
  
  if (error || !sampleAnalysis || !analysis) {
    return (
      <div className="container mx-auto py-6">
        <div className="bg-red-50 p-6 rounded-lg shadow text-center">
          <h1 className="text-xl font-semibold text-red-700 mb-2">{error || "Données non trouvées"}</h1>
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
        <h1 className="text-2xl font-bold">Résultats d&apos;Analyse</h1>
        {sample && (
          <Link href={`/samples/${sample.id}`}>
            <Button variant="outline">Retour à l&apos;échantillon</Button>
          </Link>
        )}
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        {/* Analysis Information */}
        <div className="bg-white p-6 rounded-lg shadow lg:col-span-2">
          <h2 className="text-lg font-semibold mb-4">Informations de l&apos;analyse</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div>
              <p className="text-sm text-gray-500">Analyse</p>
              <p className="font-medium">{analysis.name}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Code d&apos;analyse</p>
              <p className="font-medium">{analysis.analysisCode}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Catégorie</p>
              <p className="font-medium">{analysis.category}</p>
            </div>
            {sample && (
              <div>
                <p className="text-sm text-gray-500">Code d&apos;échantillon</p>
                <p className="font-medium">{sample.sampleCode}</p>
              </div>
            )}
            {sample && (
              <div>
                <p className="text-sm text-gray-500">Type de prélèvement</p>
                <p className="font-medium">{sample.typePrelevement}</p>
              </div>
            )}
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
              {patient.dateNaissance && (
                <div className="mb-4">
                  <p className="text-sm text-gray-500">Date de naissance</p>
                  <p className="font-medium">{new Date(patient.dateNaissance).toLocaleDateString()}</p>
                </div>
              )}
            </>
          ) : (
            <p className="text-gray-500">Patient non trouvé</p>
          )}
        </div>
      </div>
      
      {/* Results Form */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-lg font-semibold mb-4">Saisie des résultats</h2>
        
        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div>
              <label htmlFor="status" className="block text-sm font-medium mb-1">
                Statut <span className="text-red-500">*</span>
              </label>
              <select
                id="status"
                name="status"
                value={formData.status}
                onChange={handleChange}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              >
                <option value="PENDING">En attente</option>
                <option value="IN_PROGRESS">En cours</option>
                <option value="COMPLETED">Terminé</option>
                <option value="VALIDATED">Validé</option>
              </select>
            </div>
            
            <div>
              <label htmlFor="result" className="block text-sm font-medium mb-1">
                Résultat {(formData.status === "COMPLETED" || formData.status === "VALIDATED") && <span className="text-red-500">*</span>}
              </label>
              <Input
                id="result"
                name="result"
                value={formData.result}
                onChange={handleChange}
                className={errors.result ? "border-red-500" : ""}
              />
              {errors.result && <p className="mt-1 text-sm text-red-500">{errors.result}</p>}
            </div>
            
            <div>
              <label htmlFor="unit" className="block text-sm font-medium mb-1">
                Unité
              </label>
              <Input
                id="unit"
                name="unit"
                value={formData.unit}
                onChange={handleChange}
              />
            </div>
            
            <div>
              <label htmlFor="normalRange" className="block text-sm font-medium mb-1">
                Plage normale
              </label>
              <Input
                id="normalRange"
                name="normalRange"
                value={formData.normalRange}
                onChange={handleChange}
                placeholder="ex: 70-120 mg/dL"
              />
            </div>
            
            <div className="md:col-span-2">
              <label htmlFor="notes" className="block text-sm font-medium mb-1">
                Notes / Observations
              </label>
              <textarea
                id="notes"
                name="notes"
                value={formData.notes}
                onChange={handleChange}
                rows={3}
                className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              />
            </div>
          </div>
          
          {errors.submit && (
            <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded">
              <p className="text-red-600">{errors.submit}</p>
            </div>
          )}
          
          <div className="flex justify-end gap-4">
            {sample && (
              <Link href={`/samples/${sample.id}`}>
                <Button type="button" variant="outline">Annuler</Button>
              </Link>
            )}
            <Button type="submit">Enregistrer les résultats</Button>
          </div>
        </form>
      </div>
    </div>
  );
}



