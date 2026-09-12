import React, { useState, useEffect } from 'react';
import { Sparkles, Quote, Calendar, BookmarkCheck } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { analyticsApi } from '../../api/analyticsApi';

export const HeroGreeting = () => {
  const { user, profile } = useAuth();
  const [quoteData, setQuoteData] = useState(null);

  useEffect(() => {
    const fetchQuote = async () => {
      try {
        const res = await analyticsApi.getDailyQuote();
        setQuoteData(res.data);
      } catch (e) {
        console.error('Failed to load quote:', e);
      }
    };
    fetchQuote();
  }, [profile?.hijri_adjustment]);

  const getGreetingTime = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 17) return 'Good Afternoon';
    return 'Good Evening';
  };

  const displayName = profile?.display_name || user?.username || 'Believer';

  return (
    <div className="relative overflow-hidden rounded-2xl sm:rounded-3xl p-4 sm:p-6 md:p-8 bg-gradient-to-br from-[#076e9d] via-[#0b5d81] to-[#0a3147] text-white shadow-soft-lg mb-4 sm:mb-6 border border-[#3dc3f3]/30">
      {/* Subtle geometric pattern overlay */}
      <div className="absolute inset-0 opacity-15 islamic-pattern-bg pointer-events-none" />
      <div className="absolute -right-10 -bottom-10 w-64 h-64 rounded-full bg-[#3dc3f3]/25 blur-3xl pointer-events-none" />
      <div className="absolute right-10 top-6 w-32 h-32 rounded-full bg-[#1eb4eb]/20 blur-2xl pointer-events-none" />

      <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4 sm:gap-6">
        <div className="space-y-1.5 sm:space-y-2">
          {/* Hijri & Gregorian Date pill */}
          <div className="inline-flex flex-wrap items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3 py-1 rounded-full bg-[#0a3147]/60 backdrop-blur-md text-[11px] sm:text-xs font-semibold text-[#bce8fb] border border-[#3dc3f3]/40">
            <Calendar className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-[#3dc3f3]" />
            <span>{quoteData?.hijri?.formatted || '19 Safar 1448 AH'}</span>
            <span className="opacity-40 hidden sm:inline">•</span>
            <span className="hidden sm:inline">{quoteData?.gregorian_formatted || 'Friday, 11 September 2026'}</span>
          </div>

          <h2 className="text-xl sm:text-2xl md:text-3xl font-extrabold tracking-tight text-white">
            Assalamu Alaikum, <span className="text-[#3dc3f3]">{displayName}</span>
          </h2>
          <p className="text-xs sm:text-sm text-[#e1f3fd]/90 font-medium">
            {getGreetingTime()} — Welcome to your daily Islamic operating system.
          </p>
        </div>

        {/* Motivational Daily Quote Card */}
        {quoteData?.quote && (
          <div className="max-w-md p-3.5 sm:p-4 rounded-2xl bg-[#060e14]/65 backdrop-blur-md border border-[#3dc3f3]/25 space-y-1.5 self-stretch md:self-auto flex flex-col justify-center shadow-lg shadow-black/20">
            <div className="flex items-center justify-between text-xs text-[#81d7f8] font-bold">
              <span className="flex items-center gap-1">
                <Quote className="w-3.5 h-3.5 text-[#3dc3f3]" /> {quoteData.quote.topic}
              </span>
              <span className="text-[10px] text-slate-300 font-normal">{quoteData.quote.source}</span>
            </div>
            {quoteData.quote.arabic && (
              <p className="font-arabic text-sm text-[#f0faff] text-right leading-relaxed font-semibold">
                "{quoteData.quote.arabic}"
              </p>
            )}
            <p className="text-xs text-[#bce8fb]/95 italic font-medium leading-relaxed">
              "{quoteData.quote.text}"
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
