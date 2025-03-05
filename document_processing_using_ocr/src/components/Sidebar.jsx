import React, { useState } from "react";
import { FaUpload } from "react-icons/fa"; // You can replace this with a more modern icon from react-icons

export default function Sidebar() {
  const [selectedItem, setSelectedItem] = useState("upload");

  const handleSelectItem = (item) => {
    setSelectedItem(item);
  };

  return (
    <>
      <nav className="fixed top-0 z-50 w-full bg-white shadow-md">
        <div className="px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <a
                href="https://flowbite.com"
                className="flex items-center space-x-2"
              >
                <img
                  src="https://flowbite.com/docs/images/logo.svg"
                  className="h-8"
                  alt="Logo"
                />
                <span className="text-lg font-semibold text-gray-900 ">
                  DocProcess
                </span>
              </a>
            </div>
            <div className="flex items-center space-x-3">
              <button
                type="button"
                className="text-gray-800 bg-gray-200 rounded-full hover:bg-gray-300 focus:outline-none"
              >
                <img
                  className="w-8 h-8 rounded-full"
                  src="https://flowbite.com/docs/images/people/profile-picture-5.jpg"
                  alt="User photo"
                />
              </button>
            </div>
          </div>
        </div>
      </nav>

      <aside
        id="logo-sidebar"
        className="fixed top-0 left-0 z-40 w-64 h-screen pt-20 bg-white shadow-lg transition-transform sm:translate-x-0"
        aria-label="Sidebar"
      >
        <div className="h-full px-4 pb-4 overflow-y-auto">
          <ul className="space-y-3 font-medium">
            <li>
              <a
                href="#"
                onClick={() => handleSelectItem("upload")}
                className={`flex items-center py-2 px-3 rounded-lg transition duration-300 ease-in-out ${
                  selectedItem === "upload"
                    ? "bg-[#6366f1] text-white"
                    : "text-gray-700 hover:bg-gray-100 dark:text-white dark:hover:bg-gray-700"
                }`}
              >
                <FaUpload
                  className={`w-3 h-3 mr-3 ${
                    selectedItem === "upload" ? "text-white" : "text-gray-500"
                  }`}
                />
                <span className="text-sm">Upload</span>
              </a>
            </li>
          </ul>
        </div>
      </aside>
    </>
  );
}
