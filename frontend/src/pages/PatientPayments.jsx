import React, { useState, useEffect } from 'react';
import api from '../utils/api';
import { CreditCard, DollarSign, Calendar, FileText } from 'lucide-react';

const PatientPayments = () => {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPayments = async () => {
      try {
        setLoading(true);
        const res = await api.get('/payments/history');
        if (res.data.success) {
          setPayments(res.data.data);
        }
      } catch (err) {
        console.error('Error fetching patient payment history:', err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchPayments();
  }, []);

  const getStatusClass = (status) => {
    switch (status) {
      case 'paid':
        return 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/30 dark:text-emerald-400';
      case 'pending':
        return 'bg-amber-100 text-amber-800 dark:bg-amber-950/30 dark:text-amber-400';
      case 'refunded':
        return 'bg-rose-100 text-rose-800 dark:bg-rose-950/30 dark:text-rose-450';
      default:
        return 'bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-300';
    }
  };

  return (
    <div className="space-y-8 pb-10 min-h-screen">
      {/* Title */}
      <div>
        <h2 className="text-2xl font-black text-slate-800 dark:text-white">Billing & Payments</h2>
        <p className="text-slate-500 dark:text-slate-400 text-xs">Access payment transactions log, invoice summaries, and download receipts.</p>
      </div>

      {loading ? (
        <div className="h-64 rounded-3xl skeleton"></div>
      ) : payments.length === 0 ? (
        <div className="text-center py-20 bg-white/40 dark:bg-darkBg-light/40 rounded-3xl border border-slate-200/50 dark:border-slate-800/50 max-w-md mx-auto">
          <CreditCard className="h-12 w-12 text-slate-350 dark:text-slate-700 mx-auto mb-4" />
          <h3 className="font-bold text-lg text-slate-850 dark:text-slate-200">No Transactions</h3>
          <p className="text-slate-450 text-xs mt-1">Receipts will appear here after paying consultation schedules.</p>
        </div>
      ) : (
        <div className="glass-panel bg-white/60 dark:bg-darkBg-light/60 border border-slate-200/50 dark:border-slate-800/50 rounded-3xl overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm border-collapse select-none">
              <thead>
                <tr className="bg-slate-100/50 dark:bg-darkBg-deep/50 border-b border-slate-200/60 dark:border-slate-800/60 text-slate-500 dark:text-slate-405 font-semibold text-xs uppercase tracking-wider">
                  <th className="py-4 px-6">Transaction ID</th>
                  <th className="py-4 px-6">Consulting Doctor</th>
                  <th className="py-4 px-6">Date</th>
                  <th className="py-4 px-6">Amount</th>
                  <th className="py-4 px-6">Status</th>
                  <th className="py-4 px-6 text-right">Invoices</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                {payments.map((p) => {
                  const doctorName = p.Appointment?.Doctor?.User?.name || 'Doctor';
                  const amount = parseFloat(p.amount).toFixed(2);
                  const date = new Date(p.created_at).toLocaleDateString();

                  return (
                    <tr key={p.payment_id} className="hover:bg-slate-50/50 dark:hover:bg-darkBg-deep/30 transition-colors text-slate-750 dark:text-slate-300">
                      <td className="py-4.5 px-6 font-mono text-xs text-slate-400">
                        TXN-{p.payment_id.toString().padStart(6, '0')}
                      </td>
                      <td className="py-4.5 px-6 font-semibold">
                        Dr. {doctorName}
                      </td>
                      <td className="py-4.5 px-6 flex items-center space-x-1.5">
                        <Calendar className="h-4 w-4 text-slate-400" />
                        <span>{date}</span>
                      </td>
                      <td className="py-4.5 px-6 font-bold text-slate-900 dark:text-white">
                        ${amount}
                      </td>
                      <td className="py-4.5 px-6">
                        <span className={`px-2.5 py-1 text-xxs font-bold rounded-full capitalize ${getStatusClass(p.payment_status)}`}>
                          {p.payment_status}
                        </span>
                      </td>
                      <td className="py-4.5 px-6 text-right">
                        <button
                          onClick={() => window.print()}
                          className="inline-flex items-center space-x-1 text-xs font-semibold text-primary-650 dark:text-primary-400 hover:underline"
                        >
                          <FileText className="h-3.5 w-3.5" />
                          <span>Receipt</span>
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default PatientPayments;
