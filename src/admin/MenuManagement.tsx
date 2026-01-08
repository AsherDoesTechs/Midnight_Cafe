import { useState, useEffect, useCallback, useMemo } from "react";
import { Plus, Loader2, Lock, ShieldCheck, QrCode } from "lucide-react";
import { supabase } from ".././libs/supabaseClient";
import MenuTable from "../admin/ComponentsAdmin/MenuTable";
import EditMenuModal from "../admin/ComponentsAdmin/EditMenuModal";
import { type MenuItem } from "../utils/menu-utils";
import { authenticator } from "otplib";
import { AdminSetup } from "./ComponentsAdmin/qrcode";

export default function MenuManagement() {
  const [menu, setMenu] = useState<MenuItem[]>([]);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editForm, setEditForm] = useState<Partial<MenuItem>>({});
  const [adding, setAdding] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [showSetup, setShowSetup] = useState(false);

  // --- SECURITY CONFIG ---
  const [lastAuthTime, setLastAuthTime] = useState<number | null>(null);
  // Memoize duration so it's a stable dependency for the hook
  const SESSION_DURATION = useMemo(() => 15 * 60 * 1000, []);

  const isSessionValid = useCallback(() => {
    if (!lastAuthTime) return false;
    return Date.now() - lastAuthTime < SESSION_DURATION;
  }, [lastAuthTime, SESSION_DURATION]); // Added SESSION_DURATION dependency

  const fetchMenu = useCallback(async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from("menu_items")
        .select("*")
        .order("id", { ascending: false });

      if (error) throw error;
      setMenu((data as MenuItem[]) || []);
    } catch (_error) {
      console.error("Error fetching menu:", _error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchMenu();
  }, [fetchMenu]);

  const validateAction = (): boolean => {
    if (isSessionValid()) return true;

    const inputCode = prompt(
      "Enter the 6-digit code from your Google Authenticator app:"
    );

    if (!inputCode) return false;
    const secret = import.meta.env.VITE_TOTP_SECRET;

    try {
      const isValid = authenticator.check(inputCode, secret);
      if (isValid) {
        setLastAuthTime(Date.now());
        return true;
      } else {
        alert("Invalid code. Please check your app and try again.");
        return false;
      }
    } catch (err) {
      alert("Error verifying code.");
      console.error(err);
      return false;
    }
  };

  const uploadImage = async (file: File): Promise<string> => {
    const allowedTypes = ["image/jpeg", "image/png", "image/webp"];
    if (!allowedTypes.includes(file.type))
      throw new Error("Invalid file type.");
    if (file.size > 2 * 1024 * 1024)
      throw new Error("File too large (Max 2MB).");

    setIsUploading(true);
    try {
      const fileExt = file.name.split(".").pop();
      const fileName = `${Date.now()}.${fileExt}`;
      const { error: uploadError } = await supabase.storage
        .from("menu-images")
        .upload(fileName, file, { cacheControl: "3600", upsert: true });

      if (uploadError) throw uploadError;

      const { data: publicData } = supabase.storage
        .from("menu-images")
        .getPublicUrl(fileName);
      return publicData.publicUrl;
    } finally {
      setIsUploading(false);
    }
  };

  const saveMenuItem = async (item: Partial<MenuItem>, isNew: boolean) => {
    if (!validateAction()) return;

    const cleanName = item.name?.trim() || "";
    const priceNum = Number(item.price);

    if (cleanName.length < 3 || !item.category || priceNum < 0) {
      return alert("Please check all required fields.");
    }

    if (
      isNew &&
      menu.some((m) => m.name.toLowerCase() === cleanName.toLowerCase())
    ) {
      return alert("An item with this name already exists.");
    }

    // FIX: Replaced 'any' with a strict Partial<MenuItem>
    const itemToSave: Partial<MenuItem> = {
      name: cleanName,
      description: item.description?.trim() || "",
      category: item.category,
      price: priceNum,
      status: item.status || "available",
      diet_tags: item.diet_tags || [],
    };

    try {
      if (imageFile) {
        itemToSave.image = await uploadImage(imageFile);
      } else {
        itemToSave.image = item.image || "/default-menu-image.png";
      }

      const query = isNew
        ? supabase.from("menu_items").insert([itemToSave])
        : supabase.from("menu_items").update(itemToSave).eq("id", item.id);

      const { data, error } = await query.select().single();

      if (error) throw error;

      if (isNew) setMenu((prev) => [data as MenuItem, ...prev]);
      else
        setMenu((prev) =>
          prev.map((i) => (i.id === item.id ? (data as MenuItem) : i))
        );

      alert("Changes saved successfully!");
      resetForm();
    } catch (err: unknown) {
      const error = err as { code?: string; message: string };
      alert(error.code === "23505" ? "Duplicate Name" : error.message);
    }
  };

  const handleUpdateStatus = async (item: MenuItem) => {
    if (!validateAction()) return;
    const newStatus = item.status === "archived" ? "available" : "archived";
    try {
      const { error } = await supabase
        .from("menu_items")
        .update({ status: newStatus })
        .eq("id", item.id);
      if (error) throw error;
      setMenu((prev) =>
        prev.map((i) => (i.id === item.id ? { ...i, status: newStatus } : i))
      );
    } catch {
      alert("Failed to update status.");
    }
  };

  const resetForm = () => {
    setEditingId(null);
    setEditForm({});
    setAdding(false);
    setImageFile(null);
  };

  return (
    <div className="p-4 md:p-8 bg-gray-50 min-h-screen">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div className="flex items-center gap-4">
          <h2 className="text-3xl font-extrabold text-gray-800">
            🍽 Menu Management
          </h2>
          {isSessionValid() ? (
            <div className="flex items-center gap-1 text-xs font-bold text-green-600 bg-green-100 px-2 py-1 rounded-full animate-pulse">
              <ShieldCheck size={14} /> AUTHORIZED
            </div>
          ) : (
            <div className="flex items-center gap-1 text-xs font-bold text-gray-400 bg-gray-200 px-2 py-1 rounded-full">
              <Lock size={14} /> LOCKED
            </div>
          )}
        </div>

        <div className="flex gap-2">
          <button
            onClick={() => setShowSetup(!showSetup)}
            className="p-2 text-gray-600 hover:bg-gray-200 rounded-lg transition-colors"
          >
            <QrCode size={24} />
          </button>
          <button
            onClick={() => {
              setEditForm({
                name: "",
                category: "",
                price: 0,
                status: "available",
              });
              setEditingId(-Date.now());
              setAdding(true);
            }}
            disabled={!!editingId}
            className="bg-indigo-600 text-white px-5 py-2 rounded-lg hover:bg-indigo-700 disabled:opacity-50 flex items-center"
          >
            <Plus size={20} className="mr-2" /> Add New Item
          </button>
        </div>
      </div>

      {showSetup && (
        <div className="mb-8 flex justify-center">
          <div className="relative">
            <button
              onClick={() => setShowSetup(false)}
              className="absolute top-2 right-2 text-gray-400 hover:text-black"
            >
              ✕
            </button>
            <AdminSetup />
          </div>
        </div>
      )}

      {isLoading ? (
        <div className="flex justify-center py-20">
          <Loader2 className="animate-spin text-indigo-600" size={40} />
        </div>
      ) : (
        <MenuTable
          menu={menu}
          editingId={editingId}
          startEdit={(item) => {
            setEditingId(item.id);
            setEditForm(item);
            setAdding(false);
          }}
          handleUpdateStatus={handleUpdateStatus}
        />
      )}

      {editingId && (
        <EditMenuModal
          isOpen={!!editingId}
          item={editForm}
          imageFile={imageFile}
          isAdding={adding}
          isUploading={isUploading}
          onSave={() => saveMenuItem(editForm, adding)}
          onCancel={resetForm}
          onFormChange={(e) => {
            const { name, value } = e.target;
            let finalValue: string | string[] = value;

            // Type-safe handling of multi-select
            if (e.target instanceof HTMLSelectElement && name === "diet_tags") {
              finalValue = Array.from(e.target.selectedOptions, (o) => o.value);
            }

            setEditForm((prev) => ({ ...prev, [name]: finalValue }));
          }}
          onFileChange={(file) => setImageFile(file)}
        />
      )}
    </div>
  );
}
