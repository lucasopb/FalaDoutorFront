"use client";

import React, { useState } from "react";
import { importDoctors, importPatients, importHealthInsurances } from "@/lib/api";

const importOptions = [
    { label: "Médicos", value: "doctor" },
    { label: "Pacientes", value: "patient" },
    { label: "Planos de Saúde", value: "health-insurance" },
];

const importFunctions: Record<string, (file: File) => Promise<any>> = {
    doctor: importDoctors,
    patient: importPatients,
    "health-insurance": importHealthInsurances,
};

export default function ImportPage() {
    const [selected, setSelected] = useState<string>(importOptions[0].value);
    const [file, setFile] = useState<File | null>(null);
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState<any>(null);
    const [error, setError] = useState<string | null>(null);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setFile(e.target.files[0]);
        }
    };

    const handleImport = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!file) return;
        setLoading(true);
        setError(null);
        setResult(null);
        try {
            const data = await importFunctions[selected](file);
            setResult(data);
        } catch (err: any) {
            if (err?.response?.status === 500) {
                setError("Erro ao ler o arquivo. Verifique se o tipo de importação selecionado corresponde à estrutura da tabela no arquivo.");
            } else {
                setError(err?.response?.data?.message || err.message || "Erro ao importar arquivo.");
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <main className="min-h-screen p-6 bg-gradient-to-br from-blue-50 to-indigo-50">
            <div className="max-w-2xl mx-auto">
                <h1 className="title-xl text-center text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600 mb-6">
                    Importar
                </h1>
                <div className="card">
                    <form onSubmit={handleImport} className="space-y-4">
                        <div>
                            <label htmlFor="import-type" className="block text-xs font-medium mb-1">Tipo de Importação</label>
                            <select
                                id="import-type"
                                className="input-field"
                                value={selected}
                                onChange={e => setSelected(e.target.value)}
                            >
                                {importOptions.map(opt => (
                                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label htmlFor="file-upload" className="block text-xs font-medium mb-1">Arquivo (.xlsx)</label>
                            <label htmlFor="file-upload" className="input-field flex items-center justify-between cursor-pointer">
                                <span className="text-slate-500 truncate pr-4 text-sm">{file ? file.name : "Nenhum arquivo selecionado"}</span>
                                <span className="btn-secondary !py-1 !px-2 whitespace-nowrap text-xs">Procurar</span>
                            </label>
                            <input
                                id="file-upload"
                                type="file"
                                accept=".xlsx"
                                onChange={handleFileChange}
                                className="sr-only"
                            />
                        </div>
                        <button
                            type="submit"
                            className="btn-primary w-full sm:w-auto disabled:opacity-50"
                            disabled={loading || !file}
                        >
                            {loading ? "Importando..." : "Importar"}
                        </button>
                    </form>
                </div>
                {error && (
                    <div className="mt-4 p-3 rounded-md bg-red-50 text-red-700 border border-red-200 animate-fade-in text-sm">{error}</div>
                )}
                {result && (
                    <div className="mt-4 card animate-fade-in">
                        <h2 className="title-md mb-3">Resultado da Importação</h2>
                        <div className="p-3 rounded-lg border mb-3 text-sm">{result.message}</div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
                            <div className="p-3 rounded-lg bg-green-50 border border-green-200">
                                <div className="font-medium text-green-800 text-xs">Sucesso</div>
                                <div className="text-2xl font-bold text-green-900">{result.result?.importedCount || 0}</div>
                            </div>
                            <div className="p-3 rounded-lg bg-red-50 border border-red-200">
                                <div className="font-medium text-red-800 text-xs">Falhas</div>
                                <div className="text-2xl font-bold text-red-900">{result.result?.failedCount || 0}</div>
                            </div>
                        </div>

                        {result.result?.failed?.length > 0 && (
                            <div>
                                <h3 className="font-semibold text-sm mb-2">Detalhes das Falhas</h3>
                                <ul className="space-y-2">
                                    {result.result.failed.map((fail: any, idx: number) => (
                                        <li key={idx} className="p-2 rounded-md bg-gray-50 border border-gray-200">
                                            <div className="text-xs font-medium">Linha do arquivo com erro:</div>
                                            <code className="text-xs bg-gray-200 p-1 rounded-md font-mono block my-1 overflow-x-auto">
                                                {JSON.stringify(fail.data)}
                                            </code>
                                            <div className="text-xs text-red-700 mt-1">
                                                <span className="font-semibold">Motivo:</span> {
                                                    Array.isArray(fail.errors)
                                                        ? fail.errors.map((e: any) => e.message || JSON.stringify(e)).join(", ")
                                                        : typeof fail.errors === "string"
                                                            ? fail.errors
                                                            : "Erro desconhecido"
                                                }
                                            </div>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </main>
    );
} 