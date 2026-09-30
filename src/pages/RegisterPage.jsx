import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Sparkles, ArrowRight } from 'lucide-react';
import { Button } from '../components/common/UIComponents';

export const RegisterPage = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const timer = setTimeout(() => {
      navigate('/', { replace: true });
    }, 500);
    return () => clearTimeout(timer);
  }, [navigate]);

  return (
    <div className="min-h-screen bg-islamic-bg-light dark:bg-islamic-bg-dark flex flex-col justify-center items-center py-12 px-4 relative overflow-hidden">
      <div className="max-w-md w-full text-center z-10 glass-card p-8 rounded-3xl shadow-soft-lg space-y-4">
        <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-islamic-primary-600 to-islamic-primary-950 flex items-center justify-center text-white shadow-picton-glow mx-auto mb-2">
          <span className="text-2xl font-bold font-arabic">☪</span>
        </div>
        <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
          Single-User Mode Active
        </h2>
        <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300">
          Your personal habit tracking workspace is always active without registration.
        </p>
        <Button
          variant="primary"
          size="lg"
          className="w-full flex items-center justify-center gap-2"
          onClick={() => navigate('/', { replace: true })}
        >
          Go to Dashboard <ArrowRight className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
};

export default RegisterPage;
