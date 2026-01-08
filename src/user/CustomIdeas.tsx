import { useState, useEffect, useCallback } from "react";
import * as React from "react";
import { Lightbulb, Send, PlusCircle } from "lucide-react";
import { supabase } from "../libs/supabaseClient";

interface CustomIdea {
  id: number;
  title: string;
  date: string;
  status: "Draft" | "Submitted" | "Processing";
  details: string;
}

interface IdeaFormProps {
  onIdeaAdded: () => void;
  onClose: () => void;
}

const IdeaForm: React.FC<IdeaFormProps> = ({ onIdeaAdded, onClose }) => {
  const [title, setTitle] = useState("");
  const [details, setDetails] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !details.trim()) {
      alert("Title and details are required.");
      return;
    }

    setIsSubmitting(true);

    try {
      // FIX: Use getUser() instead of user()
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error("User not authenticated");

      const { error } = await supabase.from("custom_ideas").insert([
        {
          user_id: user.id,
          title,
          details,
          status: "Draft",
          created_at: new Date().toISOString(),
        },
      ]);

      if (error) throw error;

      setTitle("");
      setDetails("");
      onIdeaAdded();
      onClose();
      alert("New custom idea drafted successfully!");
    } catch (err) {
      console.error("Error saving custom idea:", err);
      alert("Failed to save custom idea.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-[#1C1C1C] p-6 rounded-lg border border-[#F1A7C5] mb-6">
      <h4 className="text-xl font-bold text-[#F1A7C5] mb-4">
        Create New Idea Draft
      </h4>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label
            htmlFor="title"
            className="block text-sm font-medium text-gray-300 mb-1"
          >
            Idea Title
          </label>
          <input
            id="title"
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full p-2 bg-[#333] border border-[#444] rounded-md text-white focus:ring-[#F1A7C5] focus:border-[#F1A7C5]"
            placeholder="e.g., Triple Chocolate Lava Cake"
            required
            disabled={isSubmitting}
          />
        </div>
        <div>
          <label
            htmlFor="details"
            className="block text-sm font-medium text-gray-300 mb-1"
          >
            Detailed Description
          </label>
          <textarea
            id="details"
            value={details}
            onChange={(e) => setDetails(e.target.value)}
            rows={4}
            className="w-full p-2 bg-[#333] border border-[#444] rounded-md text-white focus:ring-[#F1A7C5] focus:border-[#F1A7C5]"
            placeholder="Describe ingredients, size, and special requirements."
            required
            disabled={isSubmitting}
          />
        </div>
        <div className="flex justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600 transition disabled:opacity-50"
            disabled={isSubmitting}
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition flex items-center gap-1 disabled:bg-green-700 disabled:opacity-75"
            disabled={isSubmitting}
          >
            {isSubmitting ? "Saving..." : "Save as Draft"} <Send size={16} />
          </button>
        </div>
      </form>
    </div>
  );
};

const CustomIdeas: React.FC = () => {
  const [ideas, setIdeas] = useState<CustomIdea[]>([]);
  const [loading, setLoading] = useState(true);
  const [isFormVisible, setIsFormVisible] = useState(false);

  const fetchIdeas = useCallback(async () => {
    setLoading(true);
    try {
      // FIX: Use getUser() instead of user()
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        setIdeas([]);
        setLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from("custom_ideas")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (error) throw error;

      const formattedData = (data || []).map((idea: any) => ({
        id: idea.id,
        title: idea.title,
        details: idea.details,
        status: idea.status,
        date: new Date(idea.created_at).toLocaleDateString(),
      }));

      setIdeas(formattedData);
    } catch (err) {
      console.error("Error fetching custom ideas:", err);
      setIdeas([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchIdeas();
  }, [fetchIdeas]);

  const handleAction = async (id: number, action: "submit" | "delete") => {
    // FIX: Use getUser()
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;

    if (action === "submit") {
      try {
        const { error } = await supabase
          .from("custom_ideas")
          .update({ status: "Submitted" })
          .eq("id", id)
          .eq("user_id", user.id);

        if (error) throw error;

        await fetchIdeas();
        alert(`Idea #${id} submitted for review!`);
      } catch (err) {
        console.error("Error submitting idea:", err);
        alert("Failed to submit idea.");
      }
    }

    if (action === "delete") {
      try {
        const { error } = await supabase
          .from("custom_ideas")
          .delete()
          .eq("id", id)
          .eq("user_id", user.id);

        if (error) throw error;

        setIdeas(ideas.filter((idea) => idea.id !== id));
        alert(`Idea #${id} deleted.`);
      } catch (err) {
        console.error("Error deleting idea:", err);
        alert("Failed to delete idea.");
      }
    }
  };

  if (loading)
    return <p className="text-center text-gray-400">Loading custom ideas...</p>;

  return (
    <div className="p-4 space-y-6">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-2xl font-semibold text-[#F1A7C5] flex items-center gap-2">
          <Lightbulb size={24} /> My Custom Order Ideas
        </h3>
        <button
          onClick={() => setIsFormVisible((prev) => !prev)}
          className="px-4 py-2 bg-[#F1A7C5] text-black font-semibold rounded-md hover:bg-[#E090B0] transition flex items-center gap-2 shadow-lg"
        >
          <PlusCircle size={18} />
          {isFormVisible ? "Hide Form" : "Add New Idea"}
        </button>
      </div>

      {isFormVisible && (
        <IdeaForm
          onIdeaAdded={fetchIdeas}
          onClose={() => setIsFormVisible(false)}
        />
      )}

      {ideas.length === 0 && !isFormVisible ? (
        <div className="text-center p-10 bg-[#222] rounded-lg border border-[#333]">
          <p className="text-lg font-medium">
            You haven't created any custom ideas yet.
          </p>
          <p className="text-sm text-gray-400 mt-2">
            Click the "Add New Idea" button to start drafting your dream
            dessert!
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {ideas.map((idea) => (
            <div
              key={idea.id}
              className="bg-[#222] p-5 rounded-lg border border-[#333] shadow-lg transition-all hover:border-[#F1A7C5]"
            >
              <div className="flex justify-between items-start mb-3">
                <h4 className="text-xl font-bold text-white">{idea.title}</h4>
                <span
                  className={`text-xs font-semibold px-3 py-1 rounded-full ${
                    idea.status === "Draft"
                      ? "bg-gray-600 text-white"
                      : idea.status === "Submitted"
                      ? "bg-blue-600 text-white"
                      : "bg-yellow-600 text-black"
                  }`}
                >
                  {idea.status}
                </span>
              </div>

              <p className="text-sm text-gray-400 mb-3 italic">
                Created on: {idea.date}
              </p>
              <p className="text-sm text-[#D0C8B3] border-l-2 border-[#F1A7C5] pl-3 py-1">
                {idea.details}
              </p>

              <div className="flex gap-3 mt-3">
                {idea.status === "Draft" && (
                  <>
                    <button
                      onClick={() => handleAction(idea.id, "submit")}
                      className="px-3 py-1 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm"
                    >
                      Submit
                    </button>
                    <button
                      onClick={() => handleAction(idea.id, "delete")}
                      className="px-3 py-1 bg-red-600 text-white rounded-md hover:bg-red-700 text-sm"
                    >
                      Delete
                    </button>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default CustomIdeas;
