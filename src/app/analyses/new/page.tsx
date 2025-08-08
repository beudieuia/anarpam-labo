"use client";
import { CompatProps, unwrap } from '@/types/next-compat';
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { analysisService } from "@/lib/dataService";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default async function NewAnalysisPage() {
  const _p = await unwrap(params);
  const _sp = await unwrap(searchParams);
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    category: "",
    price: 0
  });
  
  const [errors, setErrors] = useState<Record<string, string>>({});
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    
    // Convert price to number if the field is 'price'
    if (name === "price") {
      setFormData(prev => ({ ...prev, [name]: value === "" ? 0 : parseFloat(value) }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
    
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
    
    if (!formData.name.trim()) {
      newErrors.name = "Le nom de l'analyse est obligatoire";
    }
    
    if (!formData.category.trim()) {
      newErrors.category = "La catégorie est obligatoire";
    }
    
    if (formData.price <= 0) {
      newErrors.price = "Le prix doit être supérieur à 0";
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
      const newAnalysis = analysisService.create({
        name: formData.name,
        description: formData.description || undefined,
        category: formData.category,
        price: formData.price
      });
      
      router.push('/analyses');
    } catch (error) {
      console.error("Error creating analysis:", error);
      setErrors(prev => ({ ...prev, submit: "Une erreur est survenue lors de la création de l'analyse" }));
    }
  };
  
  return (
    <div className="container mx-auto py-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Nouvelle Analyse</h1>
        <Link href="/analyses">
          <Button variant="outline">Retour à la liste</Button>
        </Link>
      </div>
      
      <div className="bg-white p-6 rounded-lg shadow">
        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div>
              <label htmlFor="name" className="block text-sm font-medium mb-1">
                Nom de l&apos;analyse <span className="text-red-500">*</span>
              </label>
              <Input
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className={errors.name ? "border-red-500" : ""}
              />
              {errors.name && <p className="mt-1 text-sm text-red-500">{errors.name}</p>}
            </div>
            
            <div>
              <label htmlFor="category" className="block text-sm font-medium mb-1">
                Catégorie <span className="text-red-500">*</span>
              </label>
              <Input
                id="category"
                name="category"
                value={formData.category}
                onChange={handleChange}
                className={errors.category ? "border-red-500" : ""}
                placeholder="ex: Biochimie, Hématologie, Parasitologie..."
              />
              {errors.category && <p className="mt-1 text-sm text-red-500">{errors.category}</p>}
            </div>
            
            <div>
              <label htmlFor="price" className="block text-sm font-medium mb-1">
                Prix (GNF) <span className="text-red-500">*</span>
              </label>
              <Input
                id="price"
                name="price"
                type="number"
                value={formData.price || ""}
                onChange={handleChange}
                className={errors.price ? "border-red-500" : ""}
                min="0"
                step="1000"
              />
              {errors.price && <p className="mt-1 text-sm text-red-500">{errors.price}</p>}
            </div>
            
            <div className="md:col-span-2">
              <label htmlFor="description" className="block text-sm font-medium mb-1">
                Description
              </label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
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
            <Link href="/analyses">
              <Button type="button" variant="outline">Annuler</Button>
            </Link>
            <Button type="submit">Enregistrer</Button>
          </div>
        </form>
      </div>
    </div>
  );
}




