import axios from "axios";
import React, { useState } from "react";

export default function UploadFile() {
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [userDetails, setUserDetails] = useState(null); // State to hold user details from backend
  const [showDetails, setShowDetails] = useState(false); // State to control visibility of user details table

  const handleFileChange = (event) => {
    const files = Array.from(event.target.files);
    const updatedFiles = files.map((file) => ({
      name: file.name,
      size: (file.size / 1024).toFixed(2) + " KB",
      status: "Pending",
    }));
    setSelectedFiles((prev) => [...prev, ...updatedFiles]);
  };

  const handleDeleteFile = (index) => {
    setSelectedFiles(selectedFiles.filter((_, i) => i !== index));
  };

  const handleUpload = async () => {
    if (selectedFiles.length > 0) {
      console.log("Uploading files...", selectedFiles);

      // Update file status to 'Uploading' before starting the upload
      const updatedFiles = selectedFiles.map((file) => ({
        ...file,
        status: "Uploading", // Set initial status to 'Uploading'
      }));
      setSelectedFiles(updatedFiles);

      try {
        const formData = new FormData();
        selectedFiles.forEach((file) => {
          formData.append("file", file); // Appending files to formData
        });

        const response = await axios.post(
          "http://localhost:3001/extract-text",
          formData,
          {
            headers: { "Content-Type": "multipart/form-data" },
          }
        );

        if (response.data && Array.isArray(response.data)) {
          // Map the response data with selected files
          const updatedFilesWithStatus = selectedFiles.map((file, index) => {
            const responseFile = response.data[index]; // Get the corresponding file from the response

            // Map response attributes to the selected file attributes
            return {
              ...file,
              status: responseFile?.status || "Uploaded", // Use 'Uploaded' as default if not present in response
              message: responseFile?.message || "Upload complete", // Display message from the response
            };
          });

          setSelectedFiles(updatedFilesWithStatus); // Update the state with the mapped data
        }

        // Assuming the backend response contains user details
        setUserDetails(response.data.userDetails || null); // Extract user details if available

        return response.data;
      } catch (error) {
        console.error("Error sending file to backend:", error);

        // In case of error, update the status for failed files
        const updatedFilesWithError = selectedFiles.map((file) => ({
          ...file,
          status: "Error", // Mark files as 'Error' if the upload fails
          message: "An error occurred while uploading", // Error message
        }));
        setSelectedFiles(updatedFilesWithError);

        return null;
      }
    }
  };

  return (
    <div className="flex flex-col lg:flex-row items-center justify-center min-h-screen p-6 gap-8">
      {/* Upload Container */}
      <div className="w-full max-w-2xl p-8 border border-gray-300 rounded-lg shadow-md bg-white">
        <h1 className="text-2xl font-bold mb-2 text-center">Upload</h1>
        <p className="text-gray-600 mb-6 text-center">
          Choose a file to upload
        </p>

        {/* File Upload Box */}
        <label
          htmlFor="dropzone-file"
          className="flex flex-col items-center justify-center w-full h-64 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100 transition"
        >
          <div className="flex flex-col items-center justify-center pt-5 pb-6">
            <svg
              className="w-10 h-10 mb-4 text-gray-400"
              aria-hidden="true"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 20 16"
            >
              <path
                stroke="currentColor"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M13 13h3a3 3 0 0 0 0-6h-.025A5.56 5.56 0 0 0 16 6.5 5.5 5.5 0 0 0 5.207 5.021C5.137 5.017 5.071 5 5 5a4 4 0 0 0 0 8h2.167M10 15V6m0 0L8 8m2-2 2 2"
              />
            </svg>
            <p className="mb-2 text-sm text-gray-500">
              <span className="font-semibold">Click to upload</span> or drag and
              drop
            </p>
            <p className="text-xs text-gray-500">
              SVG, PNG, JPG, or GIF (MAX. 800x400px)
            </p>
          </div>
          <input
            id="dropzone-file"
            type="file"
            className="hidden"
            multiple
            onChange={handleFileChange}
          />
        </label>

        {/* Table Displaying Selected Files */}
        {selectedFiles.length > 0 && (
          <div className="mt-6">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-100">
                  <th className="border-b border-gray-200 px-4 py-2">
                    File Name
                  </th>
                  <th className="border-b border-gray-200 px-4 py-2">Size</th>
                  <th className="border-b border-gray-200 px-4 py-2">Status</th>
                  <th className="border-b border-gray-200 px-4 py-2 text-center">
                    Action
                  </th>
                </tr>
              </thead>
              <tbody>
                {selectedFiles.map((file, index) => (
                  <tr key={index} className="border-b border-gray-200">
                    <td
                      className="px-4 py-2 truncate max-w-[200px]"
                      title={file.name}
                    >
                      {file.name}
                    </td>
                    <td className="px-4 py-2">{file.size}</td>
                    <td className="px-4 py-2 text-yellow-500">{file.status}</td>
                    <td className="px-4 py-2 text-center">
                      <button
                        onClick={() => handleDeleteFile(index)}
                        className="text-gray-400 hover:text-red-500 transition cursor-pointer"
                      >
                        ✖
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Upload Button (Always Visible) */}
        <button
          onClick={handleUpload}
          className={`mt-6 w-full px-6 py-2 font-semibold rounded transition ${
            selectedFiles.length > 0
              ? "bg-blue-500 text-white hover:bg-blue-600"
              : "bg-gray-300 text-gray-500 cursor-not-allowed"
          }`}
          disabled={selectedFiles.length === 0}
        >
          Upload File
        </button>
      </div>

      {/* Vertical Divider */}
      {showDetails && (
        <div className="hidden lg:block border-l border-dotted h-100 mx-8"></div>
      )}

      {/* Conditionally Rendered Right-Side User Details Table */}
      {showDetails && userDetails && (
        <div className="w-full max-w-sm p-8 border border-gray-300 rounded-lg shadow-md bg-white">
          <h2 className="text-xl font-bold mb-4 text-center">User Details</h2>
          <table className="w-full text-left border-collapse">
            <tbody>
              <tr className="border-b border-gray-200">
                <td className="px-4 py-2 font-semibold">Name</td>
                <td className="px-4 py-2">{userDetails.name}</td>
              </tr>
              <tr className="border-b border-gray-200">
                <td className="px-4 py-2 font-semibold">DOB</td>
                <td className="px-4 py-2">{userDetails.dob}</td>
              </tr>
              <tr className="border-b border-gray-200">
                <td className="px-4 py-2 font-semibold">Address</td>
                <td className="px-4 py-2">{userDetails.address}</td>
              </tr>
              <tr>
                <td className="px-4 py-2 font-semibold">Phone</td>
                <td className="px-4 py-2">{userDetails.phone}</td>
              </tr>
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
