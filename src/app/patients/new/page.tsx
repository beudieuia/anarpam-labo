import { CompatProps, unwrap } from '@/types/next-compat';
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { patientService } from "@/lib/dataService";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default async function NewPatientPage() {
  const _p = await unwrap(params);
  const _sp = await unwrap(searchParams);
  const router = useRouter();
  const [formData, setFormData] = useState({
    nom: "",
    prenom: "",
    dateNaissance: "",
    sexe: "M",
    telephone: "",
    email: "",
    adresse: ""
  });
  
  const [errors, setErrors] = useState<Record<string, string>>({});
  
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
    
    if (!formData.nom.trim()) {
      newErrors.nom = "Le nom est obligatoire";
    }
    
    if (!formData.prenom.trim()) {
      newErrors.prenom = "Le prénom est obligatoire";
    }
    
    if (formData.email && !/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Format d'email invalide";
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
      patientService.create({
        nom: formData.nom,
        prenom: formData.prenom,
        dateNaissance: formData.dateNaissance || undefined,
        sexe: formData.sexe as 'M' | 'F',
        telephone: formData.telephone || undefined,
        email: formData.email || undefined,
        adresse: formData.adresse || undefined
      });
      
      router.push('/patients');
    } catch (error) {
      console.error("Error creating patient:", error);
      setErrors(prev => ({ ...prev, submit: "Une erreur est survenue lors de la création du patient" }));
    }
  };
  
  return (
    <div className="container mx-auto py-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Nouveau Patient</h1>
        <Link href="/patients">
          <Button variant="outline">Retour à la liste</Button>
        </Link>
      </div>
      
      <div className="bg-white p-6 rounded-lg shadow">
        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div>
              <label htmlFor="nom" className="block text-sm font-medium mb-1">
                Nom <span className="text-red-500">*</span>
              </label>
              <Input
                id="nom"
                name="nom"
                value={formData.nom}
                onChange={handleChange}
                className={errors.nom ? "border-red-500" : ""}
              />
              {errors.nom && <p className="mt-1 text-sm text-red-500">{errors.nom}</p>}
            </div>
            
            <div>
              <label htmlFor="prenom" className="block text-sm font-medium mb-1">
                Prénom <span className="text-red-500">*</span>
              </label>
              <Input
                id="prenom"
                name="prenom"
                value={formData.prenom}
                onChange={handleChange}
                className={errors.prenom ? "border-red-500" : ""}
              />
              {errors.prenom && <p className="mt-1 text-sm text-red-500">{errors.prenom}</p>}
            </div>
            
            <div>
              <label htmlFor="dateNaissance" className="block text-sm font-medium mb-1">
                Date de naissance
              </label>
              <Input
                id="dateNaissance"
                name="dateNaissance"
                type="date"
                value={formData.dateNaissance}
                onChange={handleChange}
              />
            </div>
            
            <div>
              <label htmlFor="sexe" className="block text-sm font-medium mb-1">
                Sexe <span className="text-red-500">*</span>
              </label>
              <select
                id="sexe"
                name="sexe"
                value={formData.sexe}
                onChange={handleChange}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              >
                <option value="M">Masculin</option>
                <option value="F">Féminin</option>
              </select>
            </div>
            
            <div>
              <label htmlFor="telephone" className="block text-sm font-medium mb-1">
                Téléphone
              </label>
              <Input
                id="telephone"
                name="telephone"
                value={formData.telephone}
                onChange={handleChange}
              />
            </div>
            
            <div>
              <label htmlFor="email" className="block text-sm font-medium mb-1">
                Email
              </label>
              <Input
                id="email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                className={errors.email ? "border-red-500" : ""}
              />
              {errors.email && <p className="mt-1 text-sm text-red-500">{errors.email}</p>}
            </div>
            
            <div className="md:col-span-2">
              <label htmlFor="adresse" className="block text-sm font-medium mb-1">
                Adresse
              </label>
              <textarea
                id="adresse"
                name="adresse"
                value={formData.adresse}
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
            <Link href="/patients">
              <Button type="button" variant="outline">Annuler</Button>
            </Link>
            <Button type="submit">Enregistrer</Button>
          </div>
        </form>
      </div>
    </div>
  );
}



