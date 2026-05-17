import { MockDB } from "../mockDB";
import { simulateNetwork } from "./sharedService";

/**
 * Fetches the overall financial details for a student (Relational)
 */
export const getFeeDetails = async (studentId = 'stud-001') => {
  const studentInvoices = await MockDB.invoices.find({ studentId });
  const studentReceipts = await MockDB.receipts.find({ studentId });

  const totalFees = studentInvoices.reduce((sum, inv) => sum + inv.amount, 0);
  const totalPaid = studentReceipts.reduce((sum, rcp) => sum + rcp.amount, 0);
  const outstandingBalance = totalFees - totalPaid;

  const pendingInvoices = studentInvoices
    .filter(inv => inv.status !== "Paid")
    .sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate));

  const summary = {
    totalFees,
    totalPaid,
    outstandingBalance,
    currency: "₹",
    dueDate: pendingInvoices[0]?.dueDate || "N/A",
    status: outstandingBalance === 0 ? "Paid" : totalPaid > 0 ? "Partially Paid" : "Pending",
  };

  const structure = studentInvoices.map(inv => {
    const relatedReceipts = studentReceipts.filter(rcp => rcp.invoiceId === inv.id);
    const paidForThis = relatedReceipts.reduce((sum, rcp) => sum + rcp.amount, 0);
    
    let components = [];
    if (inv.category === 'transport') {
      const fuel = Math.round(inv.amount * 0.60);
      const route = inv.amount - fuel;
      components = [
        { head: "Fuel & Maintenance Charge", amount: fuel },
        { head: "Route Operating Fee", amount: route }
      ];
    } else if (inv.category === 'miscellaneous') {
      const club = Math.round(inv.amount * 0.50);
      const event = inv.amount - club;
      components = [
        { head: "Club & Activities Membership", amount: club },
        { head: "Event & Equipment Charge", amount: event }
      ];
    } else {
      const tuition = Math.round(inv.amount * 0.75);
      const lab = Math.round(inv.amount * 0.15);
      const activity = inv.amount - tuition - lab;
      components = [
        { head: "Tuition Fee", amount: tuition },
        { head: "Laboratory & ICT Fee", amount: lab },
        { head: "Activity Fee", amount: activity }
      ];
    }

    return {
      id: inv.id,
      label: inv.targetLabel,
      total: inv.amount,
      paidAmount: paidForThis,
      remainingAmount: inv.amount - paidForThis,
      status: inv.status,
      dueDate: inv.dueDate,
      invoiceNo: inv.invoiceNo,
      components
    };
  });

  return simulateNetwork({
    summary,
    structure,
    pendingBills: pendingInvoices.map(inv => {
      const paid = studentReceipts.filter(r => r.invoiceId === inv.id).reduce((s, r) => s + r.amount, 0);
      return { ...inv, paidAmount: paid, remainingAmount: inv.amount - paid };
    }),
    receipts: studentReceipts.sort((a, b) => new Date(b.date) - new Date(a.date)),
    itCertificate: {
      financialYear: "2024-2025",
      totalPaid: summary.totalPaid,
      taxExemptionLimit: 150000
    },
    miscInvoices: studentInvoices.filter(inv => inv.category === "miscellaneous")
  });
};
