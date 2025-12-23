// components/EditMenuModal.tsx

import React, { useState, useEffect } from "react";
import {
  Save,
  X,
  Tag,
  Coffee,
  List,
  ImageIcon,
  Info,
  Loader2,
  Upload,
} from "lucide-react";
import {
  type MenuItem,
  categoryOptions,
  dietOptions,
  statusOptions,
} from "../../utils/menu-utils";

// --- SUB-COMPONENT: Image Upload Form Section ---

interface ImageUploadFormSectionProps {
  item: Partial<MenuItem>;
  imageFile: File | null;
  isUploading: boolean;
  onFormChange: (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => void;
  onFileChange: (file: File | null) => void;
}

const ImageUploadFormSection: React.FC<ImageUploadFormSectionProps> = ({
  item,
  imageFile,
  isUploading,
  onFormChange,
  onFileChange,
}) => {
  const [previewUrl, setPreviewUrl] = useState<string>("");

  const inputStyle =
    "border border-gray-300 rounded-lg px-3 py-2 w-full focus:outline-none focus:ring-2 focus:ring-indigo-500 transition duration-150 bg-white text-gray-800 shadow-sm";
  const labelStyle =
    "text-sm font-semibold text-gray-700 flex items-center gap-2 mb-1";

  // Handle local preview generation and cleanup
  useEffect(() => {
    if (imageFile) {
      const objectUrl = URL.createObjectURL(imageFile);
      setPreviewUrl(objectUrl);
      return () => URL.revokeObjectURL(objectUrl);
    } else {
      setPreviewUrl(item.image || "");
    }
  }, [imageFile, item.image]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      onFileChange(e.target.files[0]);
    } else {
      onFileChange(null);
    }
  };

  return (
    <div className="flex flex-col sm:flex-row items-start space-y-4 sm:space-y-0 sm:space-x-6 border-b pb-4 border-gray-100">
      <div className="flex-shrink-0 self-center">
        {previewUrl ? (
          <img
            src={previewUrl}
            alt="preview"
            className="w-24 h-24 object-cover rounded-xl border-4 border-indigo-100 shadow-md"
          />
        ) : (
          <div className="w-24 h-24 bg-indigo-50 rounded-xl flex flex-col items-center justify-center text-sm text-indigo-500 border border-dashed border-indigo-300">
            <ImageIcon size={20} />
            No Image
          </div>
        )}
      </div>
      <div className="flex-grow space-y-1 w-full">
        <label className={labelStyle}>
          <ImageIcon size={16} /> Product Image
        </label>
        <div className="relative">
          <input
            type="file"
            name="imageFile"
            accept="image/*"
            onChange={handleFileChange}
            className={`block w-full text-sm text-gray-900 border border-gray-300 rounded-lg cursor-pointer bg-gray-50 focus:outline-none file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100`}
            disabled={isUploading}
          />
        </div>
        <p className="text-xs text-gray-500 mt-1">
          Upload a new file or paste a URL below.
        </p>

        <label className={`${labelStyle} pt-2`}>
          <Upload size={16} /> Image URL
        </label>
        <input
          type="url"
          name="image"
          value={item.image || ""}
          placeholder="http://example.com/product.jpg"
          onChange={onFormChange}
          className={inputStyle}
          disabled={!!imageFile || isUploading}
        />
        {isUploading && (
          <p className="text-sm font-medium text-indigo-600 flex items-center mt-1">
            <Loader2 className="animate-spin mr-2" size={16} /> Uploading...
          </p>
        )}
      </div>
    </div>
  );
};

// --- MAIN MODAL COMPONENT ---

interface EditMenuModalProps {
  isOpen: boolean;
  item: Partial<MenuItem>;
  imageFile: File | null;
  isAdding: boolean;
  isUploading: boolean;
  onSave: () => void;
  onCancel: () => void;
  onFormChange: (e: React.ChangeEvent<any>) => void;
  onFileChange: (file: File | null) => void;
}

const EditMenuModal: React.FC<EditMenuModalProps> = ({
  isOpen,
  item,
  imageFile,
  isAdding,
  isUploading,
  onSave,
  onCancel,
  onFormChange,
  onFileChange,
}) => {
  if (!isOpen) return null;

  const inputStyle =
    "border border-gray-300 rounded-lg px-3 py-2 w-full focus:outline-none focus:ring-2 focus:ring-indigo-500 transition duration-150 bg-white text-gray-800 shadow-sm";
  const labelStyle =
    "text-sm font-semibold text-gray-700 flex items-center gap-2 mb-1";
  const groupStyle = "space-y-1.5";

  // FIXED: Handle price as string to prevent .toFixed() crashes on input
  const handlePriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value.replace(/[^0-9.]/g, "");
    const parts = value.split(".");
    if (parts.length > 2) value = `${parts[0]}.${parts[1]}`;
    if (parts[1]) value = `${parts[0]}.${parts[1].slice(0, 2)}`;

    onFormChange({
      target: { name: "price", value: value },
    } as any);
  };

  const isSaveDisabled = isUploading || !item.name || !item.category;

  return (
    <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4 backdrop-blur-sm">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl overflow-hidden max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 p-5 border-b border-gray-100 flex justify-between items-center bg-white z-10">
          <h3 className="text-xl font-bold text-indigo-700">
            {isAdding ? "➕ Add New Item" : "✍️ Edit Item"}
          </h3>
          <button
            onClick={onCancel}
            className="text-gray-500 hover:text-red-600 p-2"
          >
            <X size={20} />
          </button>
        </div>

        <div className="p-6 space-y-6">
          <ImageUploadFormSection
            item={item}
            imageFile={imageFile}
            isUploading={isUploading}
            onFormChange={onFormChange}
            onFileChange={onFileChange}
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className={groupStyle}>
              <label className={labelStyle}>
                <Coffee size={16} /> Name
              </label>
              <input
                type="text"
                name="name"
                value={item.name || ""}
                onChange={onFormChange}
                className={inputStyle}
                required
              />
            </div>
            <div className={groupStyle}>
              <label className={labelStyle}>
                <Tag size={16} /> Category
              </label>
              <select
                name="category"
                value={item.category || ""}
                onChange={onFormChange}
                className={inputStyle}
                required
              >
                <option value="">Select Category</option>
                {categoryOptions.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className={groupStyle}>
            <label className={labelStyle}>
              <Info size={16} /> Description
            </label>
            <textarea
              name="description"
              value={item.description || ""}
              onChange={onFormChange}
              className={`${inputStyle} resize-none`}
              rows={2}
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className={groupStyle}>
              <label className={labelStyle}>
                <List size={16} /> Dietary Tags
              </label>
              <select
                name="diet_tags" // This name tells handleEditChange what to update
                multiple
                // Use optional chaining or default to empty array to prevent crashes
                value={item.diet_tags || []}
                onChange={onFormChange}
                className={`${inputStyle} h-28 cursor-pointer`}
              >
                {dietOptions.map((d) => (
                  <option key={d} value={d}>
                    {d.charAt(0).toUpperCase() + d.slice(1)}
                  </option>
                ))}
              </select>
              <p className="text-xs text-gray-500 mt-1">
                Hold **Ctrl/Cmd** to select multiple.
              </p>
            </div>
            <div className={groupStyle}>
              <label className={labelStyle}>₱ Price</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                  ₱
                </span>
                <input
                  type="text"
                  name="price"
                  value={item.price ?? ""} // FIXED: Removed .toFixed() which causes crashes during typing
                  onChange={handlePriceChange}
                  className={`${inputStyle} pl-7 font-mono`}
                  placeholder="0.00"
                />
              </div>
            </div>
            <div className={groupStyle}>
              <label className={labelStyle}>
                <List size={16} /> Status
              </label>
              <select
                name="status"
                value={item.status || "available"}
                onChange={onFormChange}
                className={inputStyle}
              >
                {statusOptions
                  .filter((s) => s.value !== "archived")
                  .map((s) => (
                    <option key={s.value} value={s.value}>
                      {s.label}
                    </option>
                  ))}
              </select>
            </div>
          </div>
        </div>

        <div className="sticky bottom-0 p-4 bg-gray-50 flex justify-end gap-3 border-t">
          <button
            onClick={onCancel}
            className="bg-gray-400 text-white px-4 py-2 rounded-lg text-sm"
          >
            Cancel
          </button>
          <button
            onClick={onSave}
            disabled={isSaveDisabled}
            className="bg-indigo-600 text-white px-6 py-2 rounded-lg text-sm flex items-center gap-2 disabled:opacity-50"
          >
            {isUploading ? (
              <Loader2 className="animate-spin" size={16} />
            ) : (
              <Save size={16} />
            )}
            Save Item
          </button>
        </div>
      </div>
    </div>
  );
};

export default EditMenuModal;
