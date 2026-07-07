import React, { useState } from "react";
import { FileCheck, Save, Plus, X, AlertTriangle } from "lucide-react";
import MainCard from "../../../../../components/MainCard";

const GradesSection = ({ governance, onUpdate }) => {
  const [grades, setGrades] = useState(
    [...governance.gradeBoundaries].sort((a, b) => b.min - a.min)
  );
  const [error, setError] = useState("");

  const validateGrades = (currentGrades) => {
    // Check if min <= max
    for (const g of currentGrades) {
      if (Number(g.min) > Number(g.max)) {
        return `Invalid range for ${g.name}: Min (${g.min}) cannot be greater than Max (${g.max}).`;
      }
    }

    // Check descending order and overlap
    for (let i = 0; i < currentGrades.length - 1; i++) {
      const current = currentGrades[i];
      const next = currentGrades[i + 1];
      
      if (Number(current.min) <= Number(next.max)) {
        return `Overlap detected between ${current.name} (${current.min}-${current.max}) and ${next.name} (${next.min}-${next.max}). Ensure strict descending order with no overlaps.`;
      }
    }
    
    return null;
  };

  const handleSave = () => {
    const validationError = validateGrades(grades);
    if (validationError) {
      setError(validationError);
      return;
    }
    
    setError("");
    const updatedGrades = grades.map((g, idx) => ({ ...g, order: idx + 1 }));
    onUpdate({ gradeBoundaries: updatedGrades });
  };

  const handleGradeChange = (id, field, value) => {
    const updated = grades.map(g => {
      if (g.id === id) {
        return { ...g, [field]: value };
      }
      return g;
    });
    // Sort descending by min automatically for easier validation
    updated.sort((a, b) => Number(b.min) - Number(a.min));
    setGrades(updated);
    setError("");
  };

  const handleAddGrade = () => {
    const newGrade = {
      id: `gb-${Date.now()}`,
      name: "New Grade",
      min: 0,
      max: 0,
      point: 0
    };
    setGrades([...grades, newGrade].sort((a, b) => b.min - a.min));
  };

  const handleRemoveGrade = (id) => {
    setGrades(grades.filter(g => g.id !== id));
  };

  return (
    <MainCard className="bg-white border border-gray-100 overflow-hidden shadow-sm">
      <div className="px-6 py-4 border-b border-gray-50 bg-gray-50/50 flex justify-between items-center">
        <h3 className="text-sm font-black text-[#03045e] uppercase tracking-wider flex items-center gap-2">
          <FileCheck size={16} className="text-blue-500"/> Grading Configuration
        </h3>
        <button
          onClick={handleAddGrade}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 text-blue-600 rounded-lg text-xs font-bold hover:bg-blue-100 transition-colors"
        >
          <Plus size={14} /> Add Grade
        </button>
      </div>

      <div className="p-6 space-y-4">
        {error && (
          <div className="text-xs font-bold text-red-600 bg-red-50 p-3 rounded-lg flex items-center gap-2">
            <AlertTriangle size={14} />
            {error}
          </div>
        )}

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-50/50 text-gray-400 uppercase text-[10px] font-black tracking-wider border-b border-gray-100">
              <tr>
                <th className="px-4 py-3">Grade Name</th>
                <th className="px-4 py-3">Min %</th>
                <th className="px-4 py-3">Max %</th>
                <th className="px-4 py-3">Grade Point</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {grades.map(grade => (
                <tr key={grade.id} className="hover:bg-gray-50/30 transition-colors">
                  <td className="px-4 py-3">
                    <input 
                      type="text" 
                      value={grade.name}
                      onChange={(e) => handleGradeChange(grade.id, "name", e.target.value)}
                      className="w-full px-3 py-1.5 bg-white border border-gray-200 rounded-lg text-sm font-bold text-[#03045e] focus:outline-none focus:border-blue-300"
                    />
                  </td>
                  <td className="px-4 py-3">
                    <input 
                      type="number" 
                      value={grade.min}
                      onChange={(e) => handleGradeChange(grade.id, "min", e.target.value)}
                      className="w-full px-3 py-1.5 bg-white border border-gray-200 rounded-lg text-sm font-medium focus:outline-none focus:border-blue-300"
                    />
                  </td>
                  <td className="px-4 py-3">
                    <input 
                      type="number" 
                      value={grade.max}
                      onChange={(e) => handleGradeChange(grade.id, "max", e.target.value)}
                      className="w-full px-3 py-1.5 bg-white border border-gray-200 rounded-lg text-sm font-medium focus:outline-none focus:border-blue-300"
                    />
                  </td>
                  <td className="px-4 py-3">
                    <input 
                      type="number" 
                      value={grade.point}
                      onChange={(e) => handleGradeChange(grade.id, "point", e.target.value)}
                      className="w-full px-3 py-1.5 bg-white border border-gray-200 rounded-lg text-sm font-medium focus:outline-none focus:border-blue-300"
                    />
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button 
                      onClick={() => handleRemoveGrade(grade.id)}
                      className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      <X size={16} />
                    </button>
                  </td>
                </tr>
              ))}
              {grades.length === 0 && (
                <tr>
                  <td colSpan="5" className="px-6 py-8 text-center text-gray-400 text-sm">
                    No grades defined.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {grades.length > 0 && (
          <div className="flex justify-end pt-4 border-t border-gray-50">
            <button
              onClick={handleSave}
              className="px-6 py-2.5 rounded-xl text-sm font-black tracking-wider uppercase transition-all shadow-md flex items-center gap-2 bg-[#03045e] text-white hover:bg-[#023e8a] hover:-translate-y-0.5"
            >
              <Save size={16} /> Save Grades
            </button>
          </div>
        )}
      </div>
    </MainCard>
  );
};

export default GradesSection;
