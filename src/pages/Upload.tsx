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
    // const [file, setFile] = useState<File | null>(null);
    const [statements, setStatements] = React.useState<Statement[]>([]);
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const [progress, setProgress] = useState(0);
    const [success, setSuccess] = useState(false);
    const { accessToken } = useAuth();

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files || e.target.files.length === 0) return;

        const selectedFile = e.target.files[0];
        await handleUpload(selectedFile)
        // Reset the input value so that selecting the same file again will still trigger onChange
        e.target.value = "";
    }

    const handleUpload = async (file: File) => {
        setError("");
        setLoading(true);
        setSuccess(false); // reset success before upload

        const formData = new FormData();
        formData.append("file", file!)
        formData.append("bank", "TD")

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
                    "http://localhost:8000/statements?page=1&page_size=10",
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
            } catch (err) {
                console.error(err);
                setError("Failed to load upload history");
            }
        };

        fetchData().catch(console.error);
    }, [accessToken]);

    return (
        <>
            <div className="container max-w-[720px] mx-auto">

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
                        className="bg-white text-slate-500 font-semibold text-base rounded-lg px-20 py-5
                       flex flex-col items-center justify-center cursor-pointer
                       border-2 border-gray-300 border-dashed"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="w-12 h-12 mb-3 fill-gray-400" viewBox="0 0 32 32">
                            <path d="M23.75 11.044a7.99 7.99 0 0 0-15.5-.009A8 8 0 0 0 9 27h3a1 1 0 0 0 0-2H9a6 6 0 0 1-.035-12 1.038 1.038 0 0 0 1.1-.854 5.991 5.991 0 0 1 11.862 0A1.08 1.08 0 0 0 23 13a6 6 0 0 1 0 12h-3a1 1 0 0 0 0 2h3a8 8 0 0 0 .75-15.956z" />
                            <path d="M20.293 19.707a1 1 0 0 0 1.414-1.414l-5-5a1 1 0 0 0-1.414 0l-5 5a1 1 0 0 0 1.414 1.414L15 16.414V29a1 1 0 0 0 2 0V16.414z" />
                        </svg>

                        Drag and drop your CSV files here

                        <input type="file" id="uploadFile" className="hidden" onChange={handleFileChange} />
                        <p className="text-sm font-medium text-slate-400 mt-2">
                            Or click to browse and select files from your computer.
                        </p>
                        <button
                            onClick={() => document.getElementById("uploadFile")?.click()}
                            disabled={loading}
                            className="mt-3 px-3 py-1 border border-gray-300 rounded-md text-xs font-semibold text-gray-700 hover:bg-gray-50"
                        >
                            {loading ? "Uploading..." : "Browse Files"}
                        </button>

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
                <div className="flex flex-col w-full mt-6 border border-gray-200 rounded-xl p-10 bg-white shadow-sm max-h-[400px]">
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
                </div>
            </div>
        </>
    );
};

export default Upload;