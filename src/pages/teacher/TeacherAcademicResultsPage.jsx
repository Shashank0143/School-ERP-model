import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Award, Printer } from 'lucide-react';
import AdminPageHeader from '../../components/admin/AdminPageHeader';
import MainCard from '../../components/MainCard';
import EmptyState from '../../components/common/EmptyState';
import { getReportCardsForClass } from '../../services/reportCardService';
import { useAuth } from '../../context/AuthContext';
import PrintableReportCard from '../admin/examinations/academic-report-cards/components/PrintableReportCard';

const TeacherAcademicResultsPage = () => {
  const { user } = useAuth();
  const [reportCards, setReportCards] = useState([]);
  const [loading, setLoading] = useState(true);

  // Assuming teacher has assignedClasses[0] as their main class.
  const classId = user?.assignedClasses?.[0] || 'C-10A';
  const sessionId = '2024-25'; // Ideally selected from a dropdown

  useEffect(() => {
    const fetchCards = async () => {
      setLoading(true);
      try {
        const cards = await getReportCardsForClass(classId, sessionId);
        // Teachers only see Published or Frozen report cards
        setReportCards(cards.filter(c => c.status === 'Published' || c.status === 'Frozen'));
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetchCards();
  }, [classId, sessionId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <AdminPageHeader
        title="Class Academic Results"
        description={`View finalized report cards for your assigned class (${classId})`}
        breadcrumbs={["Dashboard", "Academic Results"]}
      />

      <div className="flex justify-end mb-4 print:hidden">
        <button 
          onClick={() => window.print()}
          disabled={reportCards.length === 0}
          className="bg-[#03045e] hover:bg-[#0077b6] text-white px-6 py-2 rounded-lg font-bold flex items-center gap-2 transition-colors disabled:opacity-50"
        >
          <Printer size={16} /> Print All Report Cards
        </button>
      </div>

      {reportCards.length === 0 ? (
        <MainCard className="h-[400px] flex items-center justify-center bg-white border border-dashed border-gray-300">
          <EmptyState 
            icon={Award}
            title="No Report Cards Available"
            description="No published report cards were found for your class."
          />
        </MainCard>
      ) : (
        <div className="space-y-12">
          {reportCards.map((card, index) => (
            <div key={card.id} className={index > 0 ? "break-before-page" : ""}>
              <PrintableReportCard card={card} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default TeacherAcademicResultsPage;
