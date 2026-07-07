import React, { useState } from "react";
import { BookOpen, Plus, Save, Edit, X, Power, PowerOff } from "lucide-react";
import MainCard from "../../../../../components/MainCard";

const CategoriesSection = ({ governance, onUpdate }) => {
  const [categories, setCategories] = useState(governance.categories || []);
  const [isAdding, setIsAdding] = useState(false);
  const [newCatName, setNewCatName] = useState("");
  const [error, setError] = useState("");

  const handleAdd = () => {
    if (!newCatName.trim()) {
      setError("Category name cannot be empty.");
      return;
    }
    if (categories.some(c => c.name.toLowerCase() === newCatName.trim().toLowerCase())) {
      setError("Category name already exists.");
      return;
    }
    
    const newCategory = {
      id: `cat-${Date.now()}`,
      name: newCatName.trim(),
      isActive: true
    };
    
    const updated = [...categories, newCategory];
    setCategories(updated);
    setIsAdding(false);
    setNewCatName("");
    setError("");
    
    onUpdate({ categories: updated });
  };

  const toggleStatus = (id) => {
    const updated = categories.map(c => 
      c.id === id ? { ...c, isActive: !c.isActive } : c
    );
    setCategories(updated);
    onUpdate({ categories: updated });
  };

  return (
    <MainCard className="bg-white border border-gray-100 overflow-hidden shadow-sm">
      <div className="px-6 py-4 border-b border-gray-50 bg-gray-50/50 flex justify-between items-center">
        <h3 className="text-sm font-black text-[#03045e] uppercase tracking-wider flex items-center gap-2">
          <BookOpen size={16} className="text-blue-500"/> Assessment Categories
        </h3>
        <button
          onClick={() => setIsAdding(true)}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 text-blue-600 rounded-lg text-xs font-bold hover:bg-blue-100 transition-colors"
        >
          <Plus size={14} /> Add Category
        </button>
      </div>

      <div className="p-6 space-y-4">
        {error && (
          <div className="text-xs font-bold text-red-600 bg-red-50 p-3 rounded-lg">
            {error}
          </div>
        )}

        {isAdding && (
          <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl border border-gray-100">
            <input
              type="text"
              value={newCatName}
              onChange={(e) => {
                setNewCatName(e.target.value);
                setError("");
              }}
              placeholder="e.g. Formative Assessment"
              className="flex-1 px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              autoFocus
            />
            <button
              onClick={handleAdd}
              className="px-4 py-2 bg-[#03045e] text-white rounded-lg text-xs font-bold flex items-center gap-2 hover:bg-[#023e8a]"
            >
              <Save size={14} /> Save
            </button>
            <button
              onClick={() => {
                setIsAdding(false);
                setNewCatName("");
                setError("");
              }}
              className="p-2 text-gray-400 hover:text-gray-600"
            >
              <X size={16} />
            </button>
          </div>
        )}

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-50/50 text-gray-400 uppercase text-[10px] font-black tracking-wider border-b border-gray-100">
              <tr>
                <th className="px-6 py-4">Category Name</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {categories.map(cat => (
                <tr key={cat.id} className={`hover:bg-gray-50/30 transition-colors ${!cat.isActive ? 'opacity-60' : ''}`}>
                  <td className="px-6 py-4 font-bold text-gray-800">
                    {cat.name}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded-md text-[10px] font-black uppercase tracking-wider ${cat.isActive ? 'bg-emerald-50 text-emerald-700' : 'bg-gray-100 text-gray-500'}`}>
                      {cat.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right flex justify-end gap-2">
                    <button
                      onClick={() => toggleStatus(cat.id)}
                      className={`p-2 rounded-lg transition-colors ${cat.isActive ? 'text-amber-500 hover:bg-amber-50' : 'text-emerald-500 hover:bg-emerald-50'}`}
                      title={cat.isActive ? 'Deactivate' : 'Activate'}
                    >
                      {cat.isActive ? <PowerOff size={16} /> : <Power size={16} />}
                    </button>
                  </td>
                </tr>
              ))}
              {categories.length === 0 && (
                <tr>
                  <td colSpan="3" className="px-6 py-8 text-center text-gray-400 text-sm">
                    No categories defined.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </MainCard>
  );
};

export default CategoriesSection;
