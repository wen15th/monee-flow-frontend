import axios from "axios";
import {useState, useEffect} from "react";
import * as React from "react";
import { useAuth } from '../hooks/useAuth';


interface Statement {
    id: number,
    s3_key: string;
    created_at: string;
    transactions: number;
    status: number; // e.g. "Completed"
}

const Upload = () => {
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [selectedBank, setSelectedBank] = useState("");
    const [statements, setStatements] = useState<Statement[]>([]);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1)
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const [progress, setProgress] = useState(0);
    const [success, setSuccess] = useState(false);
    const { accessToken } = useAuth();

    // const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    //     if (!e.target.files || e.target.files.length === 0) return;

    //     const selectedFile = e.target.files[0];
    //     await handleUpload(selectedFile)
    //     // Reset the input value so that selecting the same file again will still trigger onChange
    //     e.target.value = "";
    // }
    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files || e.target.files.length === 0) return;
    
        setSelectedFile(e.target.files[0]);
        setSuccess(false);
        setError("");
    
        // reset input
        e.target.value = "";
    };

    const handleUpload = async () => {
        if (!selectedFile) {
            setError("Please select a file first");
            return;
        }
        if (!selectedBank) {
            setError("Please select a bank");
            return;
        }
    
        setError("");
        setLoading(true);
        setSuccess(false);
    
        const formData = new FormData();
        formData.append("file", selectedFile);
        formData.append("bank", selectedBank);

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
            setSuccess(true);
        } catch (err) {
            console.error(err);
            setError("Network error");
        } finally {
            // 给个小延迟，避免“loading”一闪而过
            setTimeout(() => {
                setLoading(false);
                setProgress(0);
            }, 1000);
        }
    }

    // Fetch user statements history
    useEffect(() => {
        const fetchData = async () => {
            try {
                const res = await fetch(
                    `http://localhost:8000/statements?page=${page}&page_size=10`,
                    {
                        method: "GET",
                        headers: {
                            Authorization: `Bearer ${accessToken}`
                        },
                    }
                );

                if (!res.ok) {
                    const err = await res.json();
                    setError(err.detail || "Failed to fetch statements")
                }

                const data = await res.json();
                setStatements(data.items);
                setTotalPages(Math.max(1, Math.ceil(data.total / data.page_size)));
            } catch (err) {
                console.error(err);
                setError("Failed to load upload history");
            }
        };

        fetchData().catch(console.error);
    }, [accessToken, page]);

    return (
        <>
            <div className="container max-w-[720px] pb-10 mx-auto">

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
                        {/* <button
                            onClick={() => document.getElementById("uploadFile")?.click()}
                            disabled={loading}
                            className="mt-3 px-3 py-1 border border-gray-300 rounded-md text-xs font-semibold text-gray-700 hover:bg-gray-50"
                        >
                            {loading ? "Uploading..." : "Browse Files"}
                        </button> */}
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
                                <option value="" disabled selected>
                                    Select Bank
                                </option>
                                <option value="TD">TD</option>
                                <option value="Rogers">Rogers</option>
                                <option value="BMO">BMO</option>
                            </select>

                            <button
                                type="button"
                                onClick={handleUpload}
                                disabled={loading || !selectedFile}
                                className="h-8 px-4 py-1 rounded-md bg-blue-500 text-white text-xs font-bold hover:bg-blue-700"
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
                            className="flex justify-between py-3">
                            <div className="flex min-w-0 gap-x-2">
                                <div className="h-10 flex flex-col justify-center">
                                    <img src="/src/assets/file.png" alt="" className="size-6 flex-none "/>
                                </div>
                                <div className="min-w-0 flex-auto">
                                    <p className="text-sm/6 text-left font-semibold text-gray-900">{stmt.s3_key}</p>
                                    <div className="flex flex-row gap-x-3">
                                        <p className="text-xs/4 text-left text-gray-500">{stmt.created_at}</p>
                                        <p className="text-xs/4 text-left text-gray-500">{stmt.transactions} transactions</p>
                                    </div>
                                </div>
                            </div>
                            <div className="hidden shrink-0 md:flex-row sm:flex sm:flex-col sm:items-end">
                                <div className="h-10 flex flex-col justify-center">
                                    <img src="/src/assets/tick-mark.png" alt="" className="size-5 "/>
                                </div>
                                <p className="text-sm/10 text-gray-600 ml-1">{stmt.status == 1 ?"Completed" : "Processing" }</p>
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
                            <span className="flex justify-center items-center border border-gray-200 text-gray-800 py-1 px-3 text-sm rounded-lg focus:outline-hidden focus:bg-gray-50 disabled:opacity-50 disabled:pointer-events-none dark:border-neutral-700 dark:text-white dark:focus:bg-white/10">1</span>
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