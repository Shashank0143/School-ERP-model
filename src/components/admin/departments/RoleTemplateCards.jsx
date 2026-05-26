import { useState } from "react";
import PropTypes from "prop-types";
import { ChevronDown, ChevronUp, Check } from "lucide-react";

const RoleTemplateCards = ({ templates }) => {
  const [expandedTemplate, setExpandedTemplate] = useState(null);

  const toggleExpand = (templateId) => {
    setExpandedTemplate(expandedTemplate === templateId ? null : templateId);
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {templates.map((template) => {
        const Icon = template.icon;
        const isExpanded = expandedTemplate === template.id;

        return (
          <div
            key={template.id}
            className="bg-white rounded-2xl border border-[#caf0f8]/60 overflow-hidden transition-all duration-200 hover:shadow-md"
          >
            {/* Card Header */}
            <div className="p-4">
              <div className="flex items-start gap-3">
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                  style={{ backgroundColor: template.bg, color: template.color }}
                >
                  <Icon size={18} />
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="text-xs font-black text-[#03045e] mb-1">
                    {template.name}
                  </h4>
                  <p className="text-[10px] text-gray-500 font-semibold leading-relaxed">
                    {template.description}
                  </p>
                </div>
                <button
                  onClick={() => toggleExpand(template.id)}
                  className="p-1.5 rounded-lg hover:bg-[#caf0f8]/40 transition-colors flex-shrink-0"
                >
                  {isExpanded ? (
                    <ChevronUp size={16} className="text-[#0077b6]" />
                  ) : (
                    <ChevronDown size={16} className="text-[#0077b6]" />
                  )}
                </button>
              </div>
            </div>

            {/* Expandable Permissions */}
            {isExpanded && (
              <div className="px-4 pb-4 border-t border-[#caf0f8]/40 pt-3">
                <p className="text-[9px] font-bold text-gray-400 uppercase tracking-wider mb-2">
                  Can manage:
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {template.permissions.map((perm, idx) => (
                    <span
                      key={idx}
                      className="inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-[#caf0f8]/60 text-[#03045e] text-[9px] font-black border border-[#caf0f8]"
                    >
                      <Check size={10} />
                      {perm}
                    </span>
                  ))}
                </div>
                <button className="mt-3 w-full py-2 rounded-xl bg-[#03045e] text-white text-[10px] font-black hover:bg-[#0077b6] transition-colors">
                  Apply Template
                </button>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};

RoleTemplateCards.propTypes = {
  templates: PropTypes.array.isRequired,
};

export default RoleTemplateCards;
