const Upload = () => {
    return (
        <>
            <div className=" container max-w-[720px] mx-auto">

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

                        <input type="file" id="uploadFile" className="hidden" />
                        <p className="text-sm font-medium text-slate-400 mt-2">
                            Or click to browse and select files from your computer.
                        </p>
                        <button
                            onClick={() => document.getElementById("uploadFile")?.click()}
                            className="mt-3 px-3 py-1 border border-gray-300 rounded-md text-xs font-semibold text-gray-700 hover:bg-gray-50"
                        >
                            Browse Files
                        </button>
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
                        <li className="flex justify-between py-3">
                            <div className="flex min-w-0 gap-x-2">
                                <div className="h-10 flex flex-col justify-center">
                                    <img src="/src/assets/file.png" alt="" className="size-6 flex-none "/>
                                </div>
                                <div className="min-w-0 flex-auto">
                                    <p className="text-sm/6 text-left font-semibold text-gray-900">Statement file 1.csv</p>
                                    <div className="flex flex-row gap-x-3">
                                        <p className="text-xs/4 text-left text-gray-500">Aug 01, 2025</p>
                                        <p className="text-xs/4 text-left text-gray-500">30 transactions</p>
                                    </div>
                                </div>
                            </div>
                            <div className="hidden shrink-0 md:flex-row sm:flex sm:flex-col sm:items-end">
                                <div className="h-10 flex flex-col justify-center">
                                    <img src="/src/assets/tick-mark.png" alt="" className="size-5 "/>
                                </div>
                                <p className="text-sm/10 text-gray-600 ml-1">Completed</p>
                            </div>
                        </li>
                        <li className="flex justify-between py-3">
                            <div className="flex min-w-0 gap-x-2">
                                <div className="h-10 flex flex-col justify-center">
                                    <img src="/src/assets/file.png" alt="" className="size-6 flex-none "/>
                                </div>
                                <div className="min-w-0 flex-auto">
                                    <p className="text-sm/6 text-left font-semibold text-gray-900">Statement file 1.csv</p>
                                    <div className="flex flex-row gap-x-3">
                                        <p className="text-xs/4 text-left text-gray-500">Aug 01, 2025</p>
                                        <p className="text-xs/4 text-left text-gray-500">30 transactions</p>
                                    </div>
                                </div>
                            </div>
                            <div className="hidden shrink-0 md:flex-row sm:flex sm:flex-col sm:items-end">
                                <div className="h-10 flex flex-col justify-center">
                                    <img src="/src/assets/tick-mark.png" alt="" className="size-5 "/>
                                </div>
                                <p className="text-sm/10 text-gray-600 ml-1">Completed</p>
                            </div>
                        </li>
                        <li className="flex justify-between py-3">
                            <div className="flex min-w-0 gap-x-2">
                                <div className="h-10 flex flex-col justify-center">
                                    <img src="/src/assets/file.png" alt="" className="size-6 flex-none "/>
                                </div>
                                <div className="min-w-0 flex-auto">
                                    <p className="text-sm/6 text-left font-semibold text-gray-900">Statement file 1.csv</p>
                                    <div className="flex flex-row gap-x-3">
                                        <p className="text-xs/4 text-left text-gray-500">Aug 01, 2025</p>
                                        <p className="text-xs/4 text-left text-gray-500">30 transactions</p>
                                    </div>
                                </div>
                            </div>
                            <div className="hidden shrink-0 md:flex-row sm:flex sm:flex-col sm:items-end">
                                <div className="h-10 flex flex-col justify-center">
                                    <img src="/src/assets/tick-mark.png" alt="" className="size-5 "/>
                                </div>
                                <p className="text-sm/10 text-gray-600 ml-1">Completed</p>
                            </div>
                        </li>
                        <li className="flex justify-between py-3">
                            <div className="flex min-w-0 gap-x-2">
                                <div className="h-10 flex flex-col justify-center">
                                    <img src="/src/assets/file.png" alt="" className="size-6 flex-none "/>
                                </div>
                                <div className="min-w-0 flex-auto">
                                    <p className="text-sm/6 text-left font-semibold text-gray-900">Statement file 1.csv</p>
                                    <div className="flex flex-row gap-x-3">
                                        <p className="text-xs/4 text-left text-gray-500">Aug 01, 2025</p>
                                        <p className="text-xs/4 text-left text-gray-500">30 transactions</p>
                                    </div>
                                </div>
                            </div>
                            <div className="hidden shrink-0 md:flex-row sm:flex sm:flex-col sm:items-end">
                                <div className="h-10 flex flex-col justify-center">
                                    <img src="/src/assets/tick-mark.png" alt="" className="size-5 "/>
                                </div>
                                <p className="text-sm/10 text-gray-600 ml-1">Completed</p>
                            </div>
                        </li>
                        <li className="flex justify-between py-3">
                            <div className="flex min-w-0 gap-x-2">
                                <div className="h-10 flex flex-col justify-center">
                                    <img src="/src/assets/file.png" alt="" className="size-6 flex-none "/>
                                </div>
                                <div className="min-w-0 flex-auto">
                                    <p className="text-sm/6 text-left font-semibold text-gray-900">Statement file 1.csv</p>
                                    <div className="flex flex-row gap-x-3">
                                        <p className="text-xs/4 text-left text-gray-500">Aug 01, 2025</p>
                                        <p className="text-xs/4 text-left text-gray-500">30 transactions</p>
                                    </div>
                                </div>
                            </div>
                            <div className="hidden shrink-0 md:flex-row sm:flex sm:flex-col sm:items-end">
                                <div className="h-10 flex flex-col justify-center">
                                    <img src="/src/assets/tick-mark.png" alt="" className="size-5 "/>
                                </div>
                                <p className="text-sm/10 text-gray-600 ml-1">Completed</p>
                            </div>
                        </li>
                        <li className="flex justify-between py-3">
                            <div className="flex min-w-0 gap-x-2">
                                <div className="h-10 flex flex-col justify-center">
                                    <img src="/src/assets/file.png" alt="" className="size-6 flex-none "/>
                                </div>
                                <div className="min-w-0 flex-auto">
                                    <p className="text-sm/6 text-left font-semibold text-gray-900">Statement file 1.csv</p>
                                    <div className="flex flex-row gap-x-3">
                                        <p className="text-xs/4 text-left text-gray-500">Aug 01, 2025</p>
                                        <p className="text-xs/4 text-left text-gray-500">30 transactions</p>
                                    </div>
                                </div>
                            </div>
                            <div className="hidden shrink-0 md:flex-row sm:flex sm:flex-col sm:items-end">
                                <div className="h-10 flex flex-col justify-center">
                                    <img src="/src/assets/tick-mark.png" alt="" className="size-5 "/>
                                </div>
                                <p className="text-sm/10 text-gray-600 ml-1">Completed</p>
                            </div>
                        </li>
                        <li className="flex justify-between py-3">
                            <div className="flex min-w-0 gap-x-2">
                                <div className="h-10 flex flex-col justify-center">
                                    <img src="/src/assets/file.png" alt="" className="size-6 flex-none "/>
                                </div>
                                <div className="min-w-0 flex-auto">
                                    <p className="text-sm/6 text-left font-semibold text-gray-900">Statement file 1.csv</p>
                                    <div className="flex flex-row gap-x-3">
                                        <p className="text-xs/4 text-left text-gray-500">Aug 01, 2025</p>
                                        <p className="text-xs/4 text-left text-gray-500">30 transactions</p>
                                    </div>
                                </div>
                            </div>
                            <div className="hidden shrink-0 md:flex-row sm:flex sm:flex-col sm:items-end">
                                <div className="h-10 flex flex-col justify-center">
                                    <img src="/src/assets/tick-mark.png" alt="" className="size-5 "/>
                                </div>
                                <p className="text-sm/10 text-gray-600 ml-1">Completed</p>
                            </div>
                        </li>
                    </ul>

                </div>
            </div>
        </>
    );
};

export default Upload;