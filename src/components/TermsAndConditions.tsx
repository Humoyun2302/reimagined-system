import React, { useState, useRef, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, FileText, Users, CreditCard, Ban, Shield, Globe, Scale, AlertTriangle, Wrench, Trash2, Lightbulb, RefreshCw, BookOpen, Clock } from 'lucide-react';
import { Button } from './ui/button';
import { useLanguage } from '../contexts/LanguageContext';

interface TermsAndConditionsProps {
  onClose: () => void;
}

const ic = "w-4 h-4 sm:w-5 sm:h-5";
const sectionIcons = [
  <Globe className={ic} />,
  <Users className={ic} />,
  <FileText className={ic} />,
  <BookOpen className={ic} />,
  <Clock className={ic} />,
  <Scale className={ic} />,
  <Lightbulb className={ic} />,
  <Ban className={ic} />,
  <Wrench className={ic} />,
  <AlertTriangle className={ic} />,
  <RefreshCw className={ic} />,
  <Trash2 className={ic} />,
  <Shield className={ic} />,
  <CreditCard className={ic} />,
  <FileText className={ic} />,
];

export function TermsAndConditions({ onClose }: TermsAndConditionsProps) {
  const { t } = useLanguage();
  const sections = Array.from({ length: 15 }, (_, i) => i + 1);
  const contentRef = useRef<HTMLDivElement>(null);
  const [showTopFade, setShowTopFade] = useState(false);
  const [showBottomFade, setShowBottomFade] = useState(true);

  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = '';
    };
  }, []);

  // Check initial scroll state
  useEffect(() => {
    if (contentRef.current) {
      const el = contentRef.current;
      setShowBottomFade(el.scrollHeight > el.clientHeight + 10);
    }
  }, []);

  const handleScroll = useCallback(() => {
    if (contentRef.current) {
      const { scrollTop, scrollHeight, clientHeight } = contentRef.current;
      setShowTopFade(scrollTop > 10);
      setShowBottomFade(scrollTop + clientHeight < scrollHeight - 20);
    }
  }, []);

  return (
    <div className="fixed inset-0 z-50">
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
      />

      {/* Modal — full-screen on mobile, centered card on desktop */}
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 40 }}
        transition={{ type: 'spring', damping: 28, stiffness: 320 }}
        className="absolute inset-0 sm:inset-4 md:inset-8 lg:inset-y-12 lg:inset-x-[15%] flex flex-col bg-white dark:bg-gray-900 sm:rounded-2xl md:rounded-3xl shadow-2xl overflow-hidden"
        style={{ paddingTop: 'env(safe-area-inset-top)', paddingBottom: 'env(safe-area-inset-bottom)' }}
      >
        {/* ── Fixed Header ── */}
        <div className="flex-shrink-0 px-4 py-3.5 sm:px-6 sm:py-4 border-b border-gray-200/80 dark:border-gray-700/80 bg-gradient-to-r from-blue-50/80 to-indigo-50/80 dark:from-gray-800/80 dark:to-gray-800/50">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
              <div className="flex-shrink-0 w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-br from-[#5B8CFF] to-blue-600 flex items-center justify-center shadow-md">
                <FileText className="w-4.5 h-4.5 sm:w-5 sm:h-5 text-white" />
              </div>
              <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-gray-900 dark:text-white truncate">
                {t('terms.title')}
              </h2>
            </div>
            <button
              onClick={onClose}
              className="flex-shrink-0 p-2 rounded-xl hover:bg-white/80 dark:hover:bg-gray-700/50 transition-colors active:scale-95"
              aria-label="Close"
            >
              <X className="w-5 h-5 sm:w-6 sm:h-6 text-gray-500 dark:text-gray-400" />
            </button>
          </div>
        </div>

        {/* ── Scrollable Content ── */}
        <div className="relative flex-1 min-h-0">
          {/* Top fade */}
          <div
            className="pointer-events-none absolute top-0 left-0 right-0 h-6 z-10 transition-opacity duration-300"
            style={{
              opacity: showTopFade ? 1 : 0,
              background: 'linear-gradient(to bottom, white 0%, transparent 100%)',
            }}
          />

          <div
            ref={contentRef}
            onScroll={handleScroll}
            className="h-full overflow-y-auto overscroll-contain px-4 py-5 sm:px-6 sm:py-6 md:px-8 md:py-8"
            style={{ WebkitOverflowScrolling: 'touch' }}
          >
            <div className="max-w-3xl mx-auto space-y-5 sm:space-y-6">
              {/* Intro */}
              <p className="text-sm sm:text-base leading-relaxed font-medium text-gray-800 dark:text-gray-200">
                {t('terms.intro')}
              </p>

              {/* Sections */}
              {sections.map((i) => (
                <section
                  key={i}
                  className="rounded-xl sm:rounded-2xl border border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-800/30 p-4 sm:p-5 transition-colors hover:border-[#5B8CFF]/20"
                >
                  <div className="flex items-start gap-3 mb-2.5 sm:mb-3">
                    <div className="flex-shrink-0 mt-0.5 w-8 h-8 sm:w-9 sm:h-9 rounded-lg bg-[#5B8CFF]/10 dark:bg-[#5B8CFF]/20 flex items-center justify-center text-[#5B8CFF]">
                      {sectionIcons[i - 1] || <FileText className="w-4 h-4 sm:w-5 sm:h-5" />}
                    </div>
                    <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white leading-snug pt-1">
                      {t(`terms.section${i}Title`)}
                    </h3>
                  </div>
                  <p className="text-[13px] sm:text-sm md:text-base leading-relaxed sm:leading-relaxed text-gray-600 dark:text-gray-400 pl-11 sm:pl-12">
                    {t(`terms.section${i}Content`)}
                  </p>
                </section>
              ))}

              {/* Last updated */}
              <div className="pt-4 sm:pt-5 border-t border-gray-200 dark:border-gray-700">
                <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-500 italic text-center">
                  {t('terms.lastUpdated')}
                </p>
              </div>

              <div className="h-2" />
            </div>
          </div>

          {/* Bottom fade */}
          <div
            className="pointer-events-none absolute bottom-0 left-0 right-0 h-10 sm:h-12 z-10 transition-opacity duration-300"
            style={{
              opacity: showBottomFade ? 1 : 0,
              background: 'linear-gradient(to top, white 0%, transparent 100%)',
            }}
          />
        </div>

        {/* ── Fixed Footer ── */}
        <div className="flex-shrink-0 px-4 py-3 sm:px-6 sm:py-4 border-t border-gray-200/80 dark:border-gray-700/80 bg-gradient-to-r from-blue-50/60 to-indigo-50/60 dark:from-gray-800/60 dark:to-gray-800/30">
          <div className="max-w-3xl mx-auto">
            <Button
              onClick={onClose}
              className="w-full h-11 sm:h-12 text-sm sm:text-base font-semibold bg-gradient-to-r from-[#5B8CFF] to-blue-600 hover:from-[#4A7BEE] hover:to-blue-700 shadow-md"
            >
              {t('common.close')}
            </Button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
