import { CompatProps, unwrap } from '@/types/next-compat';
"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Sample, Patient, sampleService, patientService } from "../../lib";
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

export default async function SamplesPage() {
  const _p = await unwrap(params);
  const _sp = await unwrap(searchParams);
  const [samples, setSamples] = useState<Sample[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [patientMap, setPatientMap] = useState<Record<string, Patient>>({});
  
  useEffect(() => {
    const loadData = () => {
      const allSamples = sampleService.getAll();
      setSamples(allSamples);
      
      // Build a map of patient IDs to patient objects for quick lookup
      const patients = patientService.getAll();
      const patientsById: Record<string, Patient> = {};
      patients.forEach(patient => {
        patientsById[patient.id] = patient;
      });
      
      setPatientMap(patientsById);
      setIsLoading(false);
    };
    
    // Small delay to simulate loading and ensure localStorage is ready
    setTimeout(loadData, 500);
  }, []);
  
  const handleSearch = () => {
    if (searchQuery.trim() === "") {
      setSamples(sampleService.getAll());
    } else {
      const allSamples = sampleService.getAll();
      const query = searchQuery.toLowerCase();
      
      const filteredSamples = allSamples.filter(sample => {
        const patient = patientMap[sample.patientId];
        
        return (
          sample.sampleCode.toLowerCase().includes(query) ||
          sample.typePrelevement.toLowerCase().includes(query) ||
          (patient && (
            patient.nom.toLowerCase().includes(query) ||
            patient.prenom.toLowerCase().includes(query) ||
            patient.patientCode.toLowerCase().includes(query)
          ))
        );
      });
      
      setSamples(filteredSamples);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'RECEIVED':
        return 'Reçu';
      case 'IN_PROCESS':
        return 'En cours';
      case 'ANALYZED':
        return 'Analysé';
      case 'VALIDATED':
        return 'Validé';
      case 'REPORTED':
        return 'Rapporté';
      default:
        return status;
    }
  };

  const getStatusClass = (status: string) => {
    switch (status) {
      case 'RECEIVED':
        return 'bg-blue-100 text-blue-800';
      case 'IN_PROCESS':
        return 'bg-yellow-100 text-yellow-800';
      case 'ANALYZED':
        return 'bg-purple-100 text-purple-800';
      case 'VALIDATED':
        return 'bg-green-100 text-green-800';
      case 'REPORTED':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getPatientName = (patientId: string) => {
    const patient = patientMap[patientId];
    return patient ? `${patient.nom} ${patient.prenom}` : 'Patient inconnu';
  };

  const getPatientCode = (patientId: string) => {
    const patient = patientMap[patientId];
    return patient ? patient.patientCode : 'N/A';
  };

  return (
    <div className="container mx-auto py-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Gestion des Échantillons</h1>
        <Link href="/samples/new">
          <Button>Nouveau Prélèvement</Button>
        </Link>
      </div>
      
      <div className="bg-white p-6 rounded-lg shadow mb-6">
        <div className="flex gap-4 mb-6">
          <Input
            placeholder="Rechercher par code, type, ou patient..."
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
        ) : samples.length === 0 ? (
          <div className="text-center py-10">
            <p className="text-gray-500">Aucun échantillon trouvé</p>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Code</TableHead>
                <TableHead>Patient</TableHead>
                <TableHead>Code Patient</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Date Prélèvement</TableHead>
                <TableHead>Statut</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {samples.map((sample) => (
                <TableRow key={sample.id}>
                  <TableCell>{sample.sampleCode}</TableCell>
                  <TableCell>{getPatientName(sample.patientId)}</TableCell>
                  <TableCell>{getPatientCode(sample.patientId)}</TableCell>
                  <TableCell>{sample.typePrelevement}</TableCell>
                  <TableCell>{formatDate(sample.datePrelevement)}</TableCell>
                  <TableCell>
                    <span className={`px-2 py-1 text-xs rounded-full ${getStatusClass(sample.statut)}`}>
                      {getStatusLabel(sample.statut)}
                    </span>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Link href={`/samples/${sample.id}`}>
                        <Button variant="outline" size="sm">Voir</Button>
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



