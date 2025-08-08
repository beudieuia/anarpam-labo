import Link from "next/link";
import { CompatProps, unwrap } from '@/types/next-compat';

export default async function Home() {
  const _p = await unwrap(params);
  const _sp = await unwrap(searchParams);
  return (
    <div className="min-h-screen flex flex-col">
      <header className="bg-blue-800 text-white p-4 shadow-md">
        <div className="container mx-auto">
          <h1 className="text-2xl font-bold">ANARPAM Laboratory Management System</h1>
        </div>
      </header>
      
      <main className="flex-grow container mx-auto my-8 px-4">
        <div className="max-w-4xl mx-auto">
          <section className="bg-white p-8 rounded-lg shadow-lg">
            <h2 className="text-3xl font-bold text-gray-800 mb-6">Welcome to ANARPAM Laboratory Management</h2>
            <p className="text-lg text-gray-600 mb-6">
              A comprehensive system for managing laboratory operations, samples, patients, and analyses.
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-8">
              <Link href="/patients">
                <div className="bg-blue-50 hover:bg-blue-100 p-6 rounded-lg shadow transition-colors cursor-pointer">
                  <h3 className="text-xl font-semibold text-blue-800 mb-2">Patient Management</h3>
                  <p className="text-gray-600">Register and manage patient information</p>
                </div>
              </Link>
              
              <Link href="/samples">
                <div className="bg-green-50 hover:bg-green-100 p-6 rounded-lg shadow transition-colors cursor-pointer">
                  <h3 className="text-xl font-semibold text-green-800 mb-2">Sample Management</h3>
                  <p className="text-gray-600">Track and process laboratory samples</p>
                </div>
              </Link>
              
              <Link href="/analyses">
                <div className="bg-purple-50 hover:bg-purple-100 p-6 rounded-lg shadow transition-colors cursor-pointer">
                  <h3 className="text-xl font-semibold text-purple-800 mb-2">Analyses</h3>
                  <p className="text-gray-600">Record and review laboratory analyses</p>
                </div>
              </Link>
              
              <Link href="/results">
                <div className="bg-amber-50 hover:bg-amber-100 p-6 rounded-lg shadow transition-colors cursor-pointer">
                  <h3 className="text-xl font-semibold text-amber-800 mb-2">Results</h3>
                  <p className="text-gray-600">View and manage test results</p>
                </div>
              </Link>
              
              <Link href="/reports">
                <div className="bg-red-50 hover:bg-red-100 p-6 rounded-lg shadow transition-colors cursor-pointer">
                  <h3 className="text-xl font-semibold text-red-800 mb-2">Reports</h3>
                  <p className="text-gray-600">Generate and export laboratory reports</p>
                </div>
              </Link>
              
              <Link href="/settings">
                <div className="bg-gray-50 hover:bg-gray-100 p-6 rounded-lg shadow transition-colors cursor-pointer">
                  <h3 className="text-xl font-semibold text-gray-800 mb-2">Settings</h3>
                  <p className="text-gray-600">Configure system settings</p>
                </div>
              </Link>
            </div>
          </section>
        </div>
      </main>
      
      <footer className="bg-gray-100 p-4 border-t">
        <div className="container mx-auto text-center text-gray-600">
          <p>&copy; {new Date().getFullYear()} ANARPAM Laboratory Management System</p>
        </div>
      </footer>
    </div>
  );
}



