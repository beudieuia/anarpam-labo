import { CompatProps, unwrap } from '@/types/next-compat';
"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Patient } from "@/lib/models";
import { patientService, sampleService } from "@/lib/dataService";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default async function NewSamplePage() {
  const _p = await unwrap(params);
  const _sp = await unwrap(searchParams);
  const router = useRouter();
  const searchParams = useSearchParams();
  const patientIdParam = (_sp ?? {}).get('patientId');
  
  const [formData, setFormData] = useState({
    patientId: patientIdParam || "",
    typePrelevement: "",
    datePrelevement: new Date().toISOString().split('T')[0],
    statut: "RECEIVED",
    remarks: ""
  });
  
  const [patients, setPatients] = useState<Patient[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errors, setErrors] = useState<Record<string, string>>({});
  
  useEffect(() => {
    const loadData = async () => {
      // Get all patients
      const allPatients = patientService.getAll();
      setPatients(allPatients);
      
      // If there's a selected patient from the query params, validate it
      if (patientIdParam) {
        const patientExists = allPatients.some(p => p.id === patientIdParam);
        if (!patientExists) {
          setErrors(prev => ({ ...prev, patientId: "Patient sélectionné non trouvé" }));
        }
      }
      
      setIsLoading(false);
    };
    
    // Small delay to simulate loading and ensure localStorage is ready
    setTimeout(loadData, 500);
  }, [patientIdParam]);
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
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
    
    if (!formData.patientId) {
      newErrors.patientId = "Veuillez sélectionner un patient";
    }
    
    if (!formData.typePrelevement.trim()) {
      newErrors.typePrelevement = "Le type de prélèvement est obligatoire";
    }
    
    if (!formData.datePrelevement) {
      newErrors.datePrelevement = "La date de prélèvement est obligatoire";
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
      const newSample = sampleService.create({
        patientId: formData.patientId,
        typePrelevement: formData.typePrelevement,
        datePrelevement: formData.datePrelevement,
        statut: "RECEIVED" as any,
        remarks: formData.remarks || undefined
      });
      
      router.push(`/samples/${newSample.id}`);
    } catch (error) {
      console.error("Error creating sample:", error);
      setErrors(prev => ({ ...prev, submit: "Une erreur est survenue lors de la création du prélèvement" }));
    }
  };
  
  if (isLoading) {
    return (
      <div className="container mx-auto py-6 text-center">
        <p>Chargement...</p>
      </div>
    );
  }
  
  return (
    <div className="container mx-auto py-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Nouveau Prélèvement</h1>
        <Link href="/samples">
          <Button variant="outline">Retour à la liste</Button>
        </Link>
      </div>
      
      <div className="bg-white p-6 rounded-lg shadow">
        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div className="md:col-span-2">
              <label htmlFor="patientId" className="block text-sm font-medium mb-1">
                Patient <span className="text-red-500">*</span>
              </label>
              <select
                id="patientId"
                name="patientId"
                value={formData.patientId}
                onChange={handleChange}
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
              <label htmlFor="typePrelevement" className="block text-sm font-medium mb-1">
                Type de prélèvement <span className="text-red-500">*</span>
              </label>
              <Input
                id="typePrelevement"
                name="typePrelevement"
                value={formData.typePrelevement}
                onChange={handleChange}
                className={errors.typePrelevement ? "border-red-500" : ""}
                placeholder="ex: Sang, Urine, Selles..."
              />
              {errors.typePrelevement && <p className="mt-1 text-sm text-red-500">{errors.typePrelevement}</p>}
            </div>
            
            <div>
              <label htmlFor="datePrelevement" className="block text-sm font-medium mb-1">
                Date de prélèvement <span className="text-red-500">*</span>
              </label>
              <Input
                id="datePrelevement"
                name="datePrelevement"
                type="date"
                value={formData.datePrelevement}
                onChange={handleChange}
                className={errors.datePrelevement ? "border-red-500" : ""}
              />
              {errors.datePrelevement && <p className="mt-1 text-sm text-red-500">{errors.datePrelevement}</p>}
            </div>
            
            <div className="md:col-span-2">
              <label htmlFor="remarks" className="block text-sm font-medium mb-1">
                Remarques
              </label>
              <textarea
                id="remarks"
                name="remarks"
                value={formData.remarks}
                onChange={handleChange}
                rows={3}
                className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                placeholder="Informations complémentaires sur le prélèvement..."
              />
            </div>
          </div>
          
          {errors.submit && (
            <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded">
              <p className="text-red-600">{errors.submit}</p>
            </div>
          )}
          
          <div className="flex justify-end gap-4">
            <Link href="/samples">
              <Button type="button" variant="outline">Annuler</Button>
            </Link>
            <Button type="submit">Enregistrer</Button>
          </div>
        </form>
      </div>
    </div>
  );
}



