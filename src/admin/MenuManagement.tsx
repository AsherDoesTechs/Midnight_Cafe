import { useState, useEffect, useCallback, useMemo } from "react";
import {
  Plus,
  Loader2,
  Lock,
  ShieldCheck,
  QrCode,
  X,
  CheckCircle2,
} from "lucide-react";
import { supabase } from ".././libs/supabaseClient";
import MenuTable from "../admin/ComponentsAdmin/MenuTable";
import EditMenuModal from "../admin/ComponentsAdmin/EditMenuModal";
import { type MenuItem } from "../utils/menu-utils";
import { authenticator } from "otplib";
import { AdminSetup } from "./ComponentsAdmin/qrcode";

export default function MenuManagement() {
  // --- STATE ---
  const [menu, setMenu] = useState<MenuItem[]>([]);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editForm, setEditForm] = useState<Partial<MenuItem>>({});
  const [adding, setAdding] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  // --- AUTH STATE ---
  const [showSetup, setShowSetup] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [authInput, setAuthInput] = useState("");
  const [showSuccessFlash, setShowSuccessFlash] = useState(false);
  const [lastAuthTime, setLastAuthTime] = useState<number | null>(null);

  const SESSION_DURATION = useMemo(() => 15 * 60 * 1000, []);

  const isSessionValid = useCallback(() => {
    if (!lastAuthTime) return false;
    return Date.now() - lastAuthTime < SESSION_DURATION;
  }, [lastAuthTime, SESSION_DURATION]);

  // --- AUTO-VALIDATION LOGIC ---
  const handleAuthInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.replace(/\D/g, "").slice(0, 6);
    setAuthInput(val);

    if (val.length === 6) {
      const secret = import.meta.env.VITE_ADMIN_ACCESS_CODE;
      try {
        const isValid = authenticator.check(val, secret);
        if (isValid) {
          setLastAuthTime(Date.now());
          setAuthInput("");
          setIsVerifying(false);
          setShowSuccessFlash(true);
          setTimeout(() => setShowSuccessFlash(false), 2000);
        } else {
          setAuthInput("");
          alert("Invalid code. Please try again.");
        }
      } catch (err) {
        console.error("Auth Error:", err);
      }
    }
  };

  const validateAction = (): boolean => {
    if (isSessionValid()) return true;
    setIsVerifying(true);
    return false;
  };

  const fetchMenu = useCallback(async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from("menu_items")
        .select("*")
        .order("id", { ascending: false });
      if (error) throw error;
      setMenu((data as MenuItem[]) || []);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchMenu();
  }, [fetchMenu]);

  // --- CRUD ACTIONS ---
  const saveMenuItem = async (item: Partial<MenuItem>, isNew: boolean) => {
    if (!validateAction()) return;

    const cleanName = item.name?.trim() || "";
    const priceNum = Number(item.price);

    if (cleanName.length < 3 || !item.category || priceNum < 0) {
      return alert("Please check all required fields.");
    }

    // Checking for duplicates (isNew is now used)
    if (
      isNew &&
      menu.some((m) => m.name.toLowerCase() === cleanName.toLowerCase())
    ) {
      return alert("An item with this name already exists.");
    }

    setIsUploading(true); // setIsUploading is now used
    try {
      const itemToSave: Partial<MenuItem> = {
        name: cleanName,
        description: item.description?.trim() || "",
        category: item.category,
        price: priceNum,
        status: item.status || "available",
        diet_tags: item.diet_tags || [],
      };

      // Handle image upload if a new file exists
      if (imageFile) {
        const fileExt = imageFile.name.split(".").pop();
        const fileName = `${Date.now()}.${fileExt}`;
        const { error: uploadError } = await supabase.storage
          .from("menu-images")
          .upload(fileName, imageFile);

        if (uploadError) throw uploadError;

        const { data: publicData } = supabase.storage
          .from("menu-images")
          .getPublicUrl(fileName);
        itemToSave.image = publicData.publicUrl;
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
      setEditingId(null);
      setAdding(false);
      setImageFile(null);
    } catch (err: any) {
      alert(err.message);
    } finally {
      setIsUploading(false); // setIsUploading is now used
    }
  };

  const handleUpdateStatus = async (item: MenuItem) => {
    if (!validateAction()) return; // item is now used here
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

  return (
    <div
      className={`p-4 md:p-8 min-h-screen transition-colors duration-500 ${
        showSuccessFlash ? "bg-green-50" : "bg-gray-50"
      }`}
    >
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div className="flex items-center gap-4">
          <h2 className="text-3xl font-extrabold text-gray-800">
            🍽 Menu Management
          </h2>
          <div className="relative h-10 flex items-center">
            {isSessionValid() ? (
              <div className="flex items-center gap-2 text-xs font-bold text-green-700 bg-green-100 border border-green-200 px-3 py-1.5 rounded-full animate-in fade-in zoom-in duration-300">
                <ShieldCheck size={16} className="text-green-600" />
                AUTHORIZED SESSION
              </div>
            ) : isVerifying ? (
              <div className="flex items-center gap-2 bg-white p-1 pr-3 border-2 border-indigo-500 rounded-lg shadow-sm">
                <input
                  autoFocus
                  type="text"
                  placeholder="6-digit code"
                  value={authInput}
                  onChange={handleAuthInputChange}
                  className="w-32 px-2 py-1 text-sm font-mono tracking-widest focus:outline-none"
                />
                <button
                  onClick={() => setIsVerifying(false)}
                  className="text-gray-400 hover:text-red-500"
                >
                  <X size={16} />
                </button>
              </div>
            ) : (
              <button
                onClick={() => setIsVerifying(true)}
                className="flex items-center gap-2 text-xs font-bold text-gray-500 bg-gray-200 hover:bg-gray-300 px-3 py-1.5 rounded-full transition-all"
              >
                <Lock size={14} /> LOCKED (CLICK TO UNLOCK)
              </button>
            )}
          </div>
        </div>

        <div className="flex gap-2">
          <button
            onClick={() => setShowSetup(!showSetup)}
            className={`p-2 rounded-lg transition-colors ${
              showSetup
                ? "bg-indigo-600 text-white"
                : "text-gray-600 hover:bg-gray-200"
            }`}
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
            className="bg-indigo-600 text-white px-5 py-2 rounded-lg hover:bg-indigo-700 disabled:opacity-50 flex items-center shadow-md"
          >
            <Plus size={20} className="mr-2" /> Add New Item
          </button>
        </div>
      </div>

      {showSuccessFlash && (
        <div className="fixed inset-0 pointer-events-none flex items-center justify-center z-50">
          <div className="bg-green-500 text-white px-8 py-4 rounded-2xl shadow-2xl flex items-center gap-3 animate-bounce">
            <CheckCircle2 size={32} />
            <span className="text-xl font-bold">Access Granted!</span>
          </div>
        </div>
      )}

      {showSetup && (
        <div className="mb-8 flex justify-center animate-in slide-in-from-top duration-300">
          <div className="relative">
            <button
              onClick={() => setShowSetup(false)}
              className="absolute -top-2 -right-2 bg-white rounded-full shadow-md p-1 text-gray-400 border"
            >
              <X size={16} />
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
          onCancel={() => {
            setEditingId(null);
            setAdding(false);
          }}
          onFormChange={(e) =>
            setEditForm({ ...editForm, [e.target.name]: e.target.value })
          }
          onFileChange={(file) => setImageFile(file)}
        />
      )}
    </div>
  );
}
