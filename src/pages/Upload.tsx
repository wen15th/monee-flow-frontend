import axios from "axios";
import {useState, useEffect} from "react";
import * as React from "react";
import { useAuth } from '../hooks/useAuth';

type Currency = "USD" | "CAD" | "CNY";


interface Statement {
    id: number,
    s3_key: string;
    created_at: string;
    transactions: number;
    status: number; // e.g. "Completed"
}

interface StatementDeleteResponse {
    statement_id: number;
    deleted: boolean;
    transactions_affected: number;
    file_deleted: boolean;
    file_delete_error: string | null;
}

const Upload = () => {
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [selectedBank, setSelectedBank] = useState("");
    const [selectedCurrency, setSelectedCurrency] = useState<Currency | "">("");
    const [statements, setStatements] = useState<Statement[]>([]);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1)
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const [progress, setProgress] = useState(0);
    const [success, setSuccess] = useState(false);
    const [toast, setToast] = useState<{ type: "success" | "error"; message: string } | null>(null);
    const [deleting, setDeleting] = useState(false);

    const showToast = (type: "success" | "error", message: string) => {
        setToast({ type, message });
        window.setTimeout(() => setToast(null), 3000);
    };
    const { accessToken } = useAuth();


    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files || e.target.files.length === 0) return;
    
        setSelectedFile(e.target.files[0]);
        setSuccess(false);
        setError("");
        setSelectedBank("");
        setSelectedCurrency("");
    
        // reset input
        e.target.value = "";
    };

    const handleUpload = async () => {
        let uploadSucceeded = false;
        if (!selectedFile) {
            setError("Please select a file first");
            return;
        }
        if (!selectedBank) {
            setError("Please select a bank");
            return;
        }
        if (!selectedCurrency) {
            setError("Please select a currency");
            return;
        }

        setError("");
        setLoading(true);
        setSuccess(false);

        const formData = new FormData();
        formData.append("file", selectedFile);
        formData.append("bank", selectedBank);
        formData.append("currency", selectedCurrency);

        try {
            // Upload statement
            const res = await axios.post("http://localhost:8000/statements", formData, {
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                },
                // withCredentials: true,
                onUploadProgress: (event) => {
                    if (event.total) {
                        const percent = Math.round((event.loaded * 100) / event.total);
                        setProgress(percent);
                    }
                },
            });

            console.log("Upload success:", res.data);
            uploadSucceeded = true;
            setSuccess(true);
            setSelectedFile(null);
            setSelectedBank("");
            setSelectedCurrency("");
            // Do NOT refresh history here
        } catch (err) {
            console.error(err);
            setError("Network error");
        } finally {
            // Add a small delay to avoid the "loading" state flashing too quickly.
            setTimeout(() => {
                setLoading(false);
                setProgress(0);

                // Refresh history only after the success message becomes visible (success && !loading)
                if (uploadSucceeded) {
                    window.setTimeout(() => {
                        // Ensure newest upload is visible
                        if (page !== 1) {
                            setPage(1); // useEffect will refetch
                        } else {
                            fetchStatements().catch(console.error);
                        }
                    }, 200);
                }
            }, 1000);
        }
    }

    const fetchStatements = async () => {
        try {
            const res = await fetch(
                `http://localhost:8000/statements?page=${page}&page_size=10`,
                {
                    method: "GET",
                    headers: {
                        Authorization: `Bearer ${accessToken}`,
                    },
                }
            );

            if (!res.ok) {
                const err = await res.json();
                setError(err.detail || "Failed to fetch statements");
                return;
            }

            const data = await res.json();
            setStatements(data.items);
            setTotalPages(Math.max(1, Math.ceil(data.total / data.page_size)));
        } catch (err) {
            console.error(err);
            setError("Failed to load upload history");
        }
    };

    const handleDeleteStatement = async (statementId: number) => {
        const confirmed = window.confirm(
            "Deleting this file will also delete its related transaction entries. Are you sure you want to delete it?"
        );
        if (!confirmed) return;

        setError("");
        setDeleting(true);
        setSuccess(false);

        try {
            const res = await axios.delete<StatementDeleteResponse>(
                `http://localhost:8000/statements/${statementId}?delete_transactions=true`,
                {
                    headers: {
                        Authorization: `Bearer ${accessToken}`,
                    },
                }
            );

            const data = res.data;
            if (data.deleted) {
                showToast(
                    "success",
                    `Deleted successfully! The related ${data.transactions_affected} transactions have been deleted.`
                );
            } else {
                showToast("error", "Delete failed. Please try again.");
                return;
            }

            // Refresh list
            await fetchStatements();
        } catch (err) {
            console.error(err);
            showToast("error", "Failed to delete the statement.");
        } finally {
            setDeleting(false);
        }
    };

    // Fetch user statements history
    useEffect(() => {
        fetchStatements().catch(console.error);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [accessToken, page]);

    return (
        <>
            <div className="container max-w-[720px] pb-10 mx-auto">
                {toast && (
                    <div className="fixed inset-0 z-50 flex items-start justify-center pt-12 pointer-events-none">
                        <div
                            className={`rounded-lg px-6 py-4 shadow-xl border text-sm font-semibold pointer-events-auto ${
                                toast.type === "success"
                                    ? "bg-white border-green-500 text-green-700"
                                    : "bg-white border-red-200 text-red-700"
                            }`}
                            role="status"
                            aria-live="polite"
                        >
                            {toast.type === "success" ? "✅ " : "❌ "}{toast.message}
                        </div>
                    </div>
                )}

                {/* Description */}
                <div className="py-10">
                    <h2 className="text-2xl font-semibold">Upload Bank Statements</h2>
                    <p className="text-sm font-medium text-[#717182] mt-2">Upload your bank statement CSV files to automatically analyze your spending patterns</p>
                </div>
                {/* Upload component */}
                <div className="flex flex-col w-full border border-gray-200 rounded-xl p-10 bg-white shadow-sm">
                    {/* Title */}
                    <div className="flex items-center mb-5">
                        <img src="/src/assets/upload.png" alt="icon" className="w-5 h-5" />
                        <p className="text-sm font-medium text-gray-900 ml-2">
                            Upload New Bank Statement
                        </p>
                    </div>

                    {/* Upload box */}
                    <label
                        htmlFor="uploadFile"
                        className="bg-white text-sm font-semibold rounded-lg px-20 py-5
                       flex flex-col items-center justify-center cursor-pointer
                       border-2 border-gray-300 border-dashed"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="w-12 h-12 mb-3 fill-gray-400" viewBox="0 0 32 32">
                            <path d="M23.75 11.044a7.99 7.99 0 0 0-15.5-.009A8 8 0 0 0 9 27h3a1 1 0 0 0 0-2H9a6 6 0 0 1-.035-12 1.038 1.038 0 0 0 1.1-.854 5.991 5.991 0 0 1 11.862 0A1.08 1.08 0 0 0 23 13a6 6 0 0 1 0 12h-3a1 1 0 0 0 0 2h3a8 8 0 0 0 .75-15.956z" />
                            <path d="M20.293 19.707a1 1 0 0 0 1.414-1.414l-5-5a1 1 0 0 0-1.414 0l-5 5a1 1 0 0 0 1.414 1.414L15 16.414V29a1 1 0 0 0 2 0V16.414z" />
                        </svg>

                        Drag and drop your CSV files here

                        <input type="file" id="uploadFile" className="hidden" onChange={handleFileChange} />
                        <p className="text-sm font-medium text-[#717182] mt-2">
                            Or click to browse and select files from your computer.
                        </p>
     
                        <div className="flex items-center gap-2 mt-3">
                            <button
                                type="button"
                                onClick={() => document.getElementById("uploadFile")?.click()}
                                disabled={loading}
                                className="h-8 px-3 py-1 border border-gray-300 rounded-md text-xs font-semibold text-gray-700 hover:bg-gray-50"
                            >
                                Browse Files
                            </button>

                            <select
                                value={selectedBank}
                                onChange={(e) => setSelectedBank(e.target.value)}
                                className="h-8 px-2 py-1 border border-gray-300 rounded-lg text-xs text-gray-700 focus:outline-none"
                            >
                                <option value="" disabled>
                                    Select Bank
                                </option>
                                <option value="TD">TD</option>
                                <option value="Rogers">Rogers</option>
                                {/* <option value="BMO">BMO</option> */}
                                <option value="CMB">CMB</option>
                            </select>

                            <select
                                value={selectedCurrency}
                                onChange={(e) => setSelectedCurrency(e.target.value as Currency)}
                                className="h-8 px-2 py-1 border border-gray-300 rounded-lg text-xs text-gray-700 focus:outline-none"
                            >
                                <option value="" disabled>
                                    Currency
                                </option>
                                <option value="USD">🇺🇸 USD</option>
                                <option value="CAD">🇨🇦 CAD</option>
                                <option value="CNY">🇨🇳 CNY</option>
                            </select>

                            <button
                                type="button"
                                onClick={handleUpload}
                                disabled={loading || !selectedFile || !selectedBank || !selectedCurrency}
                                className={`h-8 px-4 py-1 rounded-md text-xs font-bold transition
    ${
        loading || !selectedFile || !selectedBank || !selectedCurrency
            ? "bg-gray-300 text-gray-500 cursor-not-allowed"
            : "bg-green-600 text-white hover:bg-green-700"
    }`}
                            >
                                Upload
                            </button>
                        </div>
                        {selectedFile && (
                                <p className="h-8 mt-2 text-xs text-gray-600">
                                    Selected file: <span className="font-medium">{selectedFile.name}</span>
                                </p>
                            )}

                        {/* Loading */}
                        {loading && (
                            <div className="mt-2 w-full bg-gray-200 rounded-full h-2">
                                <div
                                    className="bg-green-600 h-2 rounded-full"
                                    style={{ width: `${progress}%` }}
                                ></div>
                            </div>
                        )}
                        {success && !loading && (
                            <p className="mt-5 text-green-600 text-sm font-bold">✅ Upload completed successfully!</p>
                        )}

                        {/* Error */}
                        {error && <p className="text-red-500 text-sm font-bold mt-5">{error}</p>}
                    </label>
                </div>

                {/* Upload History */}
                <div className="flex flex-col w-full my-6 border border-gray-200 rounded-xl p-10 bg-white shadow-sm max-h-[450px]">
                    <div className="flex items-center mb-5">
                        <img src="/src/assets/history.png" alt="icon" className="w-5 h-5"/>
                        <p className="text-sm font-medium text-left text-gray-900 ml-2">Upload History</p>
                    </div>

                    {/* Statement list */}
                    <ul role="list" className="divide-y divide-gray-100 overflow-y-auto">
                        {statements.map((stmt) => (
                        <li key={stmt.id}
                            className="flex items-center py-3">
                            <div className="flex min-w-0 gap-x-2 flex-1">
                                <div className="h-10 flex flex-col justify-center">
                                    <img src="/src/assets/file.png" alt="" className="size-6 flex-none "/>
                                </div>
                                <div className="min-w-0 flex-auto">
                                    <div className="flex items-center gap-x-1">
                                        <p className="text-sm/6 text-left font-semibold text-gray-900">{stmt.s3_key}</p>
                                        <button
                                            type="button"
                                            onClick={() => handleDeleteStatement(stmt.id)}
                                            disabled={deleting}
                                            title="Delete"
                                            className="inline-flex items-center justify-center rounded-full p-0.5 text-gray-400 hover:text-red-600 hover:bg-red-50 disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
                                                <circle cx="12" cy="12" r="9" />
                                                <line x1="9" y1="9" x2="15" y2="15" />
                                                <line x1="15" y1="9" x2="9" y2="15" />
                                            </svg>
                                        </button>
                                        <img src="/src/assets/tick-mark.png" alt="" className="size-5" />
                                        <p className="text-sm text-gray-600">{stmt.status == 1 ? "Completed" : "Processing"}</p>
                                    </div>
                                    <div className="flex flex-row gap-x-3">
                                        <p className="text-xs/4 text-left text-gray-500">{stmt.created_at}</p>
                                        <p className="text-xs/4 text-left text-gray-500">{stmt.transactions} transactions</p>
                                    </div>
                                </div>
                            </div>
                        </li>
                        ))}
                    </ul>

                    {/* Pagination */}
                    <nav className="flex justify-center mt-8" aria-label="Pagination">
                        <button onClick={() => setPage((p) => Math.max(p - 1, 1))}
                                disabled={page === 1}
                                className="py-2 px-2 mx-1 inline-flex justify-center items-center gap-x-2 text-sm rounded-lg text-gray-800 hover:bg-gray-100 focus:outline-hidden focus:bg-gray-100 disabled:opacity-50 disabled:pointer-events-none dark:text-white dark:hover:bg-white/10 dark:focus:bg-white/10" aria-label="Previous">
                            <svg className="shrink-0 size-3.5" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                                <path d="m15 18-6-6 6-6"></path>
                            </svg>
                            <span className="sr-only">Previous</span>
                        </button>
                        <div className="flex items-center">
                            <span className="flex justify-center items-center border border-gray-200 text-gray-800 py-1 px-3 text-sm rounded-lg focus:outline-hidden focus:bg-gray-50 disabled:opacity-50 disabled:pointer-events-none dark:border-neutral-700 dark:text-white dark:focus:bg-white/10">{page}</span>
                            <span className="justify-center items-center text-gray-500 py-1 px-1.5 text-sm dark:text-neutral-500">of</span>
                            <span className="flex justify-center items-center text-gray-500 py-1 px-1.5 text-sm dark:text-neutral-500">{totalPages}</span>
                        </div>
                        <button onClick={() => setPage((p) => Math.min(p + 1, totalPages))}
                            disabled={page === totalPages}
                            className="py-2 px-2 mx-1 inline-flex justify-center items-center gap-x-2 text-sm rounded-lg text-gray-800 hover:bg-gray-100 focus:outline-hidden focus:bg-gray-100 disabled:opacity-50 disabled:pointer-events-none dark:text-white dark:hover:bg-white/10 dark:focus:bg-white/10" aria-label="Next">
                            <span className="sr-only">Next</span>
                            <svg className="shrink-0 size-3.5" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                                <path d="m9 18 6-6-6-6"></path>
                            </svg>
                        </button>
                    </nav>
                </div>
            </div>
        </>
    );
};

export default Upload;