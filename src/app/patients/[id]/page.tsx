 param($m) "import { $($m.Groups[1].Value), IdParam, PaginationQuery } from '@/types/next-compat';" 
"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Patient, Sample } from "@/lib/models";
import { patientService, sampleService } from "@/lib/dataService";
import { Button } from "@/components/ui/button";
import { 
  Table, 
  TableHeader, 
  TableBody, 
  TableHead, 
  TableRow, 
  TableCell 
} from "@/components/ui/table";

interface PatientPageProps {
  params: {
    id: string;
  };
}

export default async function PatientPage({
  const _p = await unwrap(params);
  const _sp = await unwrap(searchParams);   const { id } = _p ?? {};
params }: PatientPageProps) {
  const [patient, setPatient] = useState<Patient | null>(null);
  const [samples, setSamples] = useState<Sample[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  
  useEffect(() => {
    const loadData = () => {
      try {
        const patientData = patientService.getById((await params).id);
        if (!patientData) {
          setError("Patient non trouvé");
          setIsLoading(false);
          return;
        }
        
        setPatient(patientData);
        
        const patientSamples = sampleService.getByPatientId((await params).id);
        setSamples(patientSamples);
        
        setIsLoading(false);
      } catch (err) {
        console.error("Error loading patient data:", err);
        setError("Une erreur est survenue lors du chargement des données");
        setIsLoading(false);
      }
    };
    
    // Small delay to simulate loading and ensure localStorage is ready
    setTimeout(loadData, 500);
  }, [(await params).id]);
  
  const handleDelete = () => {
    if (window.confirm("Êtes-vous sûr de vouloir supprimer ce patient? Cette action est irréversible.")) {
      try {
        const success = patientService.delete((await params).id);
        if (success) {
          router.push('/patients');
        } else {
          setError("Impossible de supprimer le patient");
        }
      } catch (err) {
        console.error("Error deleting patient:", err);
        setError("Une erreur est survenue lors de la suppression");
      }
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
  
  if (error || !patient) {
    return (
      <div className="container mx-auto py-6">
        <div className="bg-red-50 p-6 rounded-lg shadow text-center">
          <h1 className="text-xl font-semibold text-red-700 mb-2">{error || "Patient non trouvé"}</h1>
          <Link href="/patients">
            <Button>Retourner à la liste des patients</Button>
          </Link>
        </div>
      </div>
    );
  }
  
  return (
    <div className="container mx-auto py-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Détails du Patient</h1>
        <div className="flex gap-2">
          <Link href="/patients">
            <Button variant="outline">Retour à la liste</Button>
          </Link>
          <Link href={`/patients/${(await params).id}/edit`}>
            <Button>Modifier</Button>
          </Link>
        </div>
      </div>
      
      <div className="bg-white p-6 rounded-lg shadow mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <p className="text-sm text-gray-500">Code Patient</p>
            <p className="font-medium">{patient.patientCode}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Nom et Prénom</p>
            <p className="font-medium">{patient.nom} {patient.prenom}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Date de naissance</p>
            <p className="font-medium">{formatDate(patient.dateNaissance)}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Sexe</p>
            <p className="font-medium">{patient.sexe === 'M' ? 'Masculin' : 'Féminin'}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Téléphone</p>
            <p className="font-medium">{patient.telephone || "N/A"}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Email</p>
            <p className="font-medium">{patient.email || "N/A"}</p>
          </div>
          <div className="md:col-span-2">
            <p className="text-sm text-gray-500">Adresse</p>
            <p className="font-medium">{patient.adresse || "N/A"}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Date de création</p>
            <p className="font-medium">{new Date(patient.createdAt).toLocaleString()}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Dernière mise à jour</p>
            <p className="font-medium">{new Date(patient.updatedAt).toLocaleString()}</p>
          </div>
        </div>
      </div>
      
      <div className="mt-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold">Échantillons du patient</h2>
          <Link href={`/samples/new?patientId=${patient.id}`}>
            <Button>Nouveau prélèvement</Button>
          </Link>
        </div>
        
        {samples.length === 0 ? (
          <div className="bg-white p-6 rounded-lg shadow text-center">
            <p className="text-gray-500">Aucun échantillon enregistré pour ce patient</p>
          </div>
        ) : (
          <div className="bg-white p-6 rounded-lg shadow">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Code</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Date de prélèvement</TableHead>
                  <TableHead>Statut</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {samples.map((sample) => (
                  <TableRow key={sample.id}>
                    <TableCell>{sample.sampleCode}</TableCell>
                    <TableCell>{sample.typePrelevement}</TableCell>
                    <TableCell>{formatDate(sample.datePrelevement)}</TableCell>
                    <TableCell>
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
                    </TableCell>
                    <TableCell>
                      <Link href={`/samples/${sample.id}`}>
                        <Button variant="outline" size="sm">Voir</Button>
                      </Link>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </div>
      
      <div className="mt-10 pt-6 border-t flex justify-end">
        <Button 
          variant="destructive" 
          onClick={handleDelete}
        >
          Supprimer le patient
        </Button>
      </div>
    </div>
  );
}



