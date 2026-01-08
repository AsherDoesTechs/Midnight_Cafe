/* eslint-disable react-refresh/only-export-components */
import React from "react";

// --- TYPES ---
export interface MenuItem {
  id: number;
  name: string;
  description: string;
  category: string;
  price: number;
  image?: string;
  diet_tags: string[];
  status: "available" | "archived" | "coming-soon" | "out-of-stock";
  created_at?: string;
}

// --- EXPORT OPTION ARRAYS ---
export const categoryOptions = ["coffee", "tea", "pastry", "sandwich"];

export const dietOptions = [
  "vegan",
  "dairy",
  "vegetarian",
  "gluten-free",
  "dairy-free",
];

export const statusOptions = [
  { value: "available", label: "Available" },
  { value: "coming-soon", label: "Coming Soon" },
  { value: "out-of-stock", label: "Out of Stock" },
  { value: "archived", label: "Archived" },
];

// --- COMPONENT: StatusBadge ---
interface StatusBadgeProps {
  status: MenuItem["status"];
}

const StatusBadge: React.FC<StatusBadgeProps> = ({ status }) => {
  let label = "";
  let classes = "";

  switch (status) {
    case "available":
      label = "Available";
      classes = "bg-green-100 text-green-800 border border-green-200";
      break;
    case "archived":
      label = "Archived";
      classes = "bg-gray-100 text-gray-800 border border-gray-200";
      break;
    case "coming-soon":
      label = "Coming Soon";
      classes = "bg-yellow-100 text-yellow-800 border border-yellow-200";
      break;
    case "out-of-stock":
      label = "Out of Stock";
      classes = "bg-red-100 text-red-800 border border-red-200";
      break;
    default:
      label = status || "Unknown";
      classes = "bg-gray-100 text-gray-800";
  }

  return (
    <span
      className={`px-2.5 py-1 rounded-full text-xs font-semibold ${classes}`}
    >
      {label}
    </span>
  );
};

export { StatusBadge };
