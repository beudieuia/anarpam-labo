import { CompatProps, unwrap } from '@/types/next-compat';
"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Patient } from "@/lib/models";
import { patientService, addSampleData } from "@/lib/dataService";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Table, 
  TableHeader, 
  TableBody, 
  TableHead, 
  TableRow, 
  TableCell 
} from "@/components/ui/table";

export default async function PatientsPage() {
  const _p = await unwrap(params);
  const _sp = await unwrap(searchParams);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    const loadData = () => {
      const allPatients = patientService.getAll();
      
      if (allPatients.length === 0) {
        // Add sample data if no patients exist
        addSampleData();
        setPatients(patientService.getAll());
      } else {
        setPatients(allPatients);
      }
      
      setIsLoading(false);
    };
    
    // Small delay to simulate loading and ensure localStorage is ready
    setTimeout(loadData, 500);
  }, []);
  
  const handleSearch = () => {
    if (searchQuery.trim() === "") {
      setPatients(patientService.getAll());
    } else {
      setPatients(patientService.search(searchQuery));
    }
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString();
  };

  return (
    <div className="container mx-auto py-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Gestion des Patients</h1>
        <Link href="/patients/new">
          <Button>Nouveau Patient</Button>
        </Link>
      </div>
      
      <div className="bg-white p-6 rounded-lg shadow mb-6">
        <div className="flex gap-4 mb-6">
          <Input
            placeholder="Rechercher par nom, prénom ou code patient..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="flex-grow"
          />
          <Button onClick={handleSearch}>Rechercher</Button>
        </div>
        
        {isLoading ? (
          <div className="text-center py-10">
            <p className="text-gray-500">Chargement des données...</p>
          </div>
        ) : patients.length === 0 ? (
          <div className="text-center py-10">
            <p className="text-gray-500">Aucun patient trouvé</p>
            <Button
              variant="outline" 
              className="mt-4"
              onClick={() => {
                addSampleData();
                setPatients(patientService.getAll());
              }}
            >
              Ajouter des données d&apos;exemple
            </Button>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Code</TableHead>
                <TableHead>Nom</TableHead>
                <TableHead>Prénom</TableHead>
                <TableHead>Date de naissance</TableHead>
                <TableHead>Sexe</TableHead>
                <TableHead>Téléphone</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {patients.map((patient) => (
                <TableRow key={patient.id}>
                  <TableCell>{patient.patientCode}</TableCell>
                  <TableCell>{patient.nom}</TableCell>
                  <TableCell>{patient.prenom}</TableCell>
                  <TableCell>{formatDate(patient.dateNaissance)}</TableCell>
                  <TableCell>{patient.sexe}</TableCell>
                  <TableCell>{patient.telephone || "N/A"}</TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Link href={`/patients/${patient.id}`}>
                        <Button variant="outline" size="sm">Voir</Button>
                      </Link>
                      <Link href={`/patients/${patient.id}/edit`}>
                        <Button variant="outline" size="sm">Modifier</Button>
                      </Link>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </div>
    </div>
  );
}



