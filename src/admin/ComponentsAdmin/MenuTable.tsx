// components/MenuTable.tsx

import React from "react";
import {
  Pencil,
  Archive,
  PackageOpen,
  ImageIcon,
  Layers,
  List,
} from "lucide-react";
import { type MenuItem, StatusBadge } from "../../utils/menu-utils"; // 'type' keyword for MenuItem import is the correct fix

// --- PROPS INTERFACES ---

interface MenuTableProps {
  menu: MenuItem[];
  editingId: number | null;
  startEdit: (item: MenuItem) => void;
  handleUpdateStatus: (item: MenuItem) => Promise<void>;
}

// --- SUB-COMPONENT: Mobile Menu Item Card ---

interface MenuItemCardProps {
  item: MenuItem;
  startEdit: (item: MenuItem) => void;
  handleUpdateStatus: (item: MenuItem) => Promise<void>;
  isEditing: boolean;
}

const MenuItemCard: React.FC<MenuItemCardProps> = ({
  item,
  startEdit,
  handleUpdateStatus,
  isEditing,
}) => {
  const isArchived = item.status === "archived";

  return (
    <div
      className={`bg-white rounded-xl shadow-lg border transition duration-300 ${
        isEditing
          ? "border-indigo-400 ring-2 ring-indigo-200"
          : "border-gray-100 hover:shadow-xl"
      }`}
    >
      <div className="flex flex-col sm:flex-row p-4 gap-4">
        {/* Image */}
        <div className="flex-shrink-0">
          {item.image ? (
            <img
              src={item.image}
              alt={item.name}
              className="w-full h-40 sm:w-28 sm:h-28 object-cover rounded-lg border border-gray-200 shadow-sm"
            />
          ) : (
            <div className="w-full h-40 sm:w-28 sm:h-28 bg-gray-100 rounded-lg flex items-center justify-center text-gray-400">
              <ImageIcon size={32} />
            </div>
          )}
        </div>

        {/* Content */}
        <div className="flex-grow space-y-2">
          <div className="flex justify-between items-start">
            <div>
              <h3 className="text-xl font-bold text-gray-800">{item.name}</h3>
              <p className="text-xs font-medium text-indigo-600 uppercase flex items-center gap-1 mt-0.5">
                <Layers size={12} /> {item.category}
              </p>
            </div>
            <p className="text-2xl font-extrabold text-green-600">
              ₱{item.price.toFixed(2)}
            </p>
          </div>

          <p className="text-sm text-gray-600 line-clamp-2">
            {item.description}
          </p>

          <div className="flex flex-wrap gap-2 pt-1">
            <StatusBadge status={item.status} />
            {/* FIX: Change 'diet' to 'diet_tags' and type the parameter 'd' */}
            {(item.diet_tags || []).map((d: string) => (
              <span
                key={d}
                className="px-2 py-0.5 text-xs bg-teal-100 text-teal-800 rounded-full font-medium"
              >
                {d}
              </span>
            ))}
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-2">
            <button
              onClick={() => startEdit(item)}
              className="flex items-center justify-center w-full sm:w-auto gap-1 bg-blue-500 text-white px-3 py-2 rounded-lg hover:bg-blue-600 transition duration-200 text-sm font-medium shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
              type="button"
              disabled={isEditing}
            >
              <Pencil size={16} /> Edit
            </button>
            <button
              onClick={() => handleUpdateStatus(item)}
              className={`flex items-center justify-center w-full sm:w-auto gap-1 px-3 py-2 rounded-lg text-white transition duration-200 text-sm font-medium shadow-md ${
                isArchived
                  ? "bg-green-600 hover:bg-green-700"
                  : "bg-red-500 hover:bg-red-600"
              }`}
              type="button"
            >
              {isArchived ? (
                <>
                  <PackageOpen size={16} /> Unarchive
                </>
              ) : (
                <>
                  <Archive size={16} /> Archive
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// --- MAIN COMPONENT ---

const MenuTable: React.FC<MenuTableProps> = ({
  menu,
  editingId,
  startEdit,
  handleUpdateStatus,
}) => {
  if (menu.length === 0) {
    return (
      <div className="text-center p-12 text-gray-500 bg-white rounded-xl shadow-lg border border-dashed border-gray-200">
        <List size={32} className="mx-auto mb-4" />
        <p className="text-xl font-semibold">No active menu items found.</p>
        <p className="mt-1">
          Click "Add New Item" to start building your menu.
        </p>
      </div>
    );
  }

  return (
    <>
      {/* Desktop Table View */}
      <div className="hidden lg:block overflow-x-auto rounded-xl shadow-xl border border-gray-100">
        <table className="w-full bg-white border-collapse min-w-[1000px]">
          <thead className="bg-gray-100 text-gray-600 uppercase tracking-wider text-xs border-b border-gray-200">
            <tr>
              <th className="p-4 text-left w-[80px]">Image</th>
              <th className="p-4 text-left w-[200px]">Name / Category</th>
              <th className="p-4 text-left">Description & Diet</th>
              <th className="p-4 text-left w-[100px]">Price</th>
              <th className="p-4 text-left w-[150px]">Status</th>
              <th className="p-4 text-right w-[150px]">Actions</th>
            </tr>
          </thead>
          <tbody>
            {menu.map((item, index) => {
              const isArchived = item.status === "archived";
              return (
                <tr
                  key={item.id}
                  className={`border-b border-gray-100 transition duration-150 ${
                    editingId === item.id
                      ? "bg-indigo-50 border-indigo-200 shadow-inner"
                      : index % 2 === 0
                      ? "bg-white hover:bg-gray-50"
                      : "bg-gray-50 hover:bg-gray-100"
                  }`}
                >
                  {/* Image - FIX APPLIED HERE */}
                  <td className="p-4 align-middle">
                    {item.image ? (
                      <img
                        src={item.image}
                        alt={item.name}
                        className="w-14 h-14 rounded-lg object-cover border border-gray-200 shadow-sm"
                      />
                    ) : (
                      <div className="w-14 h-14 rounded-lg bg-gray-100 flex items-center justify-center text-gray-400 border border-dashed border-gray-300 shadow-sm">
                        <ImageIcon size={18} />
                      </div>
                    )}
                  </td>
                  {/* Name / Category */}
                  <td className="p-4 align-middle">
                    <span className="font-semibold text-gray-800 text-base block">
                      {item.name}
                    </span>
                    <span className="px-2 py-0.5 mt-1 text-xs bg-indigo-100 text-indigo-700 rounded-full font-medium inline-block">
                      {item.category.charAt(0).toUpperCase() +
                        item.category.slice(1)}
                    </span>
                  </td>
                  {/* Description & Diet */}
                  <td className="p-4 align-top text-sm">
                    <p className="text-gray-600 line-clamp-2 max-w-lg mb-2">
                      {item.description}
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {/* FIX: Change 'diet' to 'diet_tags' and type the parameter 'd' */}
                      {(item.diet_tags ?? []).length > 0 ? (
                        (item.diet_tags ?? []).map((d: string) => (
                          <span
                            key={d}
                            className="px-3 py-1 text-xs bg-teal-100 text-teal-800 rounded-full font-medium"
                          >
                            {d}
                          </span>
                        ))
                      ) : (
                        <span className="text-gray-400 text-xs italic">
                          No restrictions
                        </span>
                      )}
                    </div>
                  </td>
                  {/* Price */}
                  <td className="p-4 align-middle">
                    <span className="font-bold text-gray-700 text-lg">
                      ₱{item.price.toFixed(2)}
                    </span>
                  </td>
                  {/* Status */}
                  <td className="p-4 align-middle">
                    <StatusBadge status={item.status} />
                  </td>
                  {/* Actions */}
                  <td className="p-4 align-middle text-right">
                    <div className="flex gap-2 justify-end items-center">
                      <button
                        onClick={() => startEdit(item)}
                        className="flex items-center gap-1 bg-blue-500 text-white px-3 py-1.5 rounded-lg hover:bg-blue-600 transition duration-200 text-sm font-medium shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
                        type="button"
                        disabled={!!editingId}
                      >
                        <Pencil size={14} /> Edit
                      </button>
                      <button
                        onClick={() => handleUpdateStatus(item)}
                        className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-white transition duration-200 text-sm font-medium shadow-md ${
                          isArchived
                            ? "bg-green-600 hover:bg-green-700"
                            : "bg-red-500 hover:bg-red-600"
                        }`}
                        type="button"
                        disabled={!!editingId}
                      >
                        {isArchived ? (
                          <>
                            <PackageOpen size={14} /> Unarchive
                          </>
                        ) : (
                          <>
                            <Archive size={14} /> Archive
                          </>
                        )}
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Mobile Card View */}
      <div className="lg:hidden grid grid-cols-1 gap-6">
        {menu.map((item) => (
          <MenuItemCard
            key={item.id}
            item={item}
            startEdit={startEdit}
            handleUpdateStatus={handleUpdateStatus}
            isEditing={editingId === item.id}
          />
        ))}
      </div>
    </>
  );
};

export default MenuTable;
