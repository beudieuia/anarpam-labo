import { CompatProps, unwrap } from '@/types/next-compat';
"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Report, Patient, Sample } from "@/lib/models";
import { reportService, patientService, sampleService } from "@/lib/dataService";
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

export default async function ReportsPage() {
  const _p = await unwrap(params);
  const _sp = await unwrap(searchParams);
  const [reports, setReports] = useState<Report[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [patientMap, setPatientMap] = useState<Record<string, Patient>>({});
  const [sampleMap, setSampleMap] = useState<Record<string, Sample>>({});
  
  useEffect(() => {
    const loadData = () => {
      const allReports = reportService.getAll();
      setReports(allReports);
      
      // Build maps for quick lookup
      const patients = patientService.getAll();
      const patientsById: Record<string, Patient> = {};
      patients.forEach(patient => {
        patientsById[patient.id] = patient;
      });
      setPatientMap(patientsById);
      
      const samples = sampleService.getAll();
      const samplesById: Record<string, Sample> = {};
      samples.forEach(sample => {
        samplesById[sample.id] = sample;
      });
      setSampleMap(samplesById);
      
      setIsLoading(false);
    };
    
    // Small delay to simulate loading and ensure localStorage is ready
    setTimeout(loadData, 500);
  }, []);
  
  const handleSearch = () => {
    if (searchQuery.trim() === "") {
      setReports(reportService.getAll());
    } else {
      const allReports = reportService.getAll();
      const query = searchQuery.toLowerCase();
      
      const filteredReports = allReports.filter(report => {
        const patient = patientMap[report.patientId];
        const sample = sampleMap[report.sampleId];
        
        return (
          report.reportCode.toLowerCase().includes(query) ||
          (patient && (
            patient.nom.toLowerCase().includes(query) ||
            patient.prenom.toLowerCase().includes(query) ||
            patient.patientCode.toLowerCase().includes(query)
          )) ||
          (sample && sample.sampleCode.toLowerCase().includes(query))
        );
      });
      
      setReports(filteredReports);
    }
  };

  const formatDate = (dateString: string) => {
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

  const getPatientName = (patientId: string) => {
    const patient = patientMap[patientId];
    return patient ? `${patient.nom} ${patient.prenom}` : 'Patient inconnu';
  };

  const getPatientCode = (patientId: string) => {
    const patient = patientMap[patientId];
    return patient ? patient.patientCode : 'N/A';
  };

  const getSampleCode = (sampleId: string) => {
    const sample = sampleMap[sampleId];
    return sample ? sample.sampleCode : 'N/A';
  };

  return (
    <div className="container mx-auto py-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Gestion des Rapports</h1>
        <Link href="/reports/new">
          <Button>Nouveau Rapport</Button>
        </Link>
      </div>
      
      <div className="bg-white p-6 rounded-lg shadow mb-6">
        <div className="flex gap-4 mb-6">
          <Input
            placeholder="Rechercher par code, patient..."
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
        ) : reports.length === 0 ? (
          <div className="text-center py-10">
            <p className="text-gray-500">Aucun rapport trouvé</p>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Code</TableHead>
                <TableHead>Patient</TableHead>
                <TableHead>Code Patient</TableHead>
                <TableHead>Code Échantillon</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Statut</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {reports.map((report) => (
                <TableRow key={report.id}>
                  <TableCell>{report.reportCode}</TableCell>
                  <TableCell>{getPatientName(report.patientId)}</TableCell>
                  <TableCell>{getPatientCode(report.patientId)}</TableCell>
                  <TableCell>{getSampleCode(report.sampleId)}</TableCell>
                  <TableCell>{formatDate(report.createdAt)}</TableCell>
                  <TableCell>
                    <span className={`px-2 py-1 text-xs rounded-full ${getStatusClass(report.status)}`}>
                      {getStatusLabel(report.status)}
                    </span>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Link href={`/reports/${report.id}`}>
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



