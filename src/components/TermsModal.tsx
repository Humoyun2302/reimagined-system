import React, { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, ChevronDown, Shield, FileText, Users, CreditCard, Ban, Lock, Globe, Scale, AlertTriangle, Wrench, Trash2, Lightbulb, RefreshCw, BookOpen, Database, Share2, UserCheck, Clock } from 'lucide-react';
import { Button } from './ui/button';
import { useLanguage } from '../contexts/LanguageContext';

interface TermsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAgree?: () => void;
  mode?: 'terms' | 'privacy';
}

const ic = "w-4 h-4 sm:w-5 sm:h-5";
const sectionIcons: Record<string, React.ReactNode[]> = {
  terms: [
    <Globe className={ic} />,           // 1 General use
    <Users className={ic} />,            // 2 Account registration
    <FileText className={ic} />,         // 3 Barber accounts
    <BookOpen className={ic} />,         // 4 Accuracy of profiles
    <Clock className={ic} />,            // 5 Booking process
    <Scale className={ic} />,            // 6 Platform as intermediary
    <Lightbulb className={ic} />,        // 7 User-generated content
    <Ban className={ic} />,              // 8 Prohibited content
    <Wrench className={ic} />,           // 9 Moderation rights
    <AlertTriangle className={ic} />,    // 10 Limitation of liability
    <RefreshCw className={ic} />,        // 11 Service availability
    <Trash2 className={ic} />,           // 12 Account suspension
    <Shield className={ic} />,           // 13 Intellectual property
    <CreditCard className={ic} />,       // 14 Payments
    <FileText className={ic} />,         // 15 Changes to platform
  ],
  privacy: [
    <Database className={ic} />,         // 1 Collection of data
    <FileText className={ic} />,         // 2 Types of data
    <Wrench className={ic} />,           // 3 How data is used
    <Globe className={ic} />,            // 4 Cookies & analytics
    <Lock className={ic} />,             // 5 Storage & protection
    <Share2 className={ic} />,           // 6 Third-party sharing
    <UserCheck className={ic} />,        // 7 User rights
    <Clock className={ic} />,            // 8 Retention policies
  ],
};

export function TermsModal({ isOpen, onClose, onAgree, mode = 'terms' }: TermsModalProps) {
  const { t } = useLanguage();
  const [hasScrolledToBottom, setHasScrolledToBottom] = useState(false);
  const [showTopFade, setShowTopFade] = useState(false);
  const [showBottomFade, setShowBottomFade] = useState(true);
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) {
      setHasScrolledToBottom(false);
      setShowTopFade(false);
      setShowBottomFade(true);
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  // Check if content is scrollable on mount and after render
  useEffect(() => {
    if (isOpen && contentRef.current) {
      const el = contentRef.current;
      const isScrollable = el.scrollHeight > el.clientHeight + 10;
      setShowBottomFade(isScrollable);
      if (!isScrollable) {
        setHasScrolledToBottom(true);
      }
    }
  }, [isOpen]);

  const handleScroll = useCallback(() => {
    if (contentRef.current) {
      const { scrollTop, scrollHeight, clientHeight } = contentRef.current;
      const isAtBottom = scrollTop + clientHeight >= scrollHeight - 20;
      const isAtTop = scrollTop < 10;
      setHasScrolledToBottom(isAtBottom);
      setShowTopFade(!isAtTop);
      setShowBottomFade(!isAtBottom);
    }
  }, []);

  const handleAgree = () => {
    if (onAgree) onAgree();
    onClose();
  };

  const sectionCount = mode === 'terms' ? 15 : 8;
  const sections = Array.from({ length: sectionCount }, (_, i) => i + 1);
  const icons = sectionIcons[mode] || [];

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100]"
          />

          {/* Modal container — full-screen on mobile, centered card on desktop */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 40 }}
            transition={{ type: 'spring', damping: 28, stiffness: 320 }}
            className="fixed inset-0 sm:inset-4 md:inset-8 lg:inset-y-12 lg:inset-x-[15%] z-[101] flex flex-col bg-white dark:bg-gray-900 sm:rounded-2xl md:rounded-3xl shadow-2xl overflow-hidden"
            style={{ paddingTop: 'env(safe-area-inset-top)', paddingBottom: 'env(safe-area-inset-bottom)' }}
          >
            {/* ── Fixed Header ── */}
            <div className="flex-shrink-0 px-4 py-3.5 sm:px-6 sm:py-4 border-b border-gray-200/80 dark:border-gray-700/80 bg-gradient-to-r from-blue-50/80 to-indigo-50/80 dark:from-gray-800/80 dark:to-gray-800/50">
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
                  <div className="flex-shrink-0 w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-br from-[#5B8CFF] to-blue-600 flex items-center justify-center shadow-md">
                    {mode === 'terms' ? (
                      <FileText className="w-4.5 h-4.5 sm:w-5 sm:h-5 text-white" />
                    ) : (
                      <Lock className="w-4.5 h-4.5 sm:w-5 sm:h-5 text-white" />
                    )}
                  </div>
                  <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-gray-900 dark:text-white truncate">
                    {t(`${mode}.title`)}
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

            {/* ── Scrollable Content Area ── */}
            <div className="relative flex-1 min-h-0">
              {/* Top fade overlay */}
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
                  {/* Intro text */}
                  {mode === 'terms' && (
                    <p className="text-sm sm:text-base leading-relaxed font-medium text-gray-800 dark:text-gray-200">
                      {t('terms.intro')}
                    </p>
                  )}

                  {/* Sections */}
                  {sections.map((i) => (
                    <section
                      key={i}
                      className="group rounded-xl sm:rounded-2xl border border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-800/30 p-4 sm:p-5 transition-colors hover:border-[#5B8CFF]/20"
                    >
                      <div className="flex items-start gap-3 mb-2.5 sm:mb-3">
                        <div className="flex-shrink-0 mt-0.5 w-8 h-8 sm:w-9 sm:h-9 rounded-lg bg-[#5B8CFF]/10 dark:bg-[#5B8CFF]/20 flex items-center justify-center text-[#5B8CFF]">
                          {icons[i - 1] || <FileText className="w-4 h-4 sm:w-5 sm:h-5" />}
                        </div>
                        <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white leading-snug pt-1">
                          {t(`${mode}.section${i}Title`)}
                        </h3>
                      </div>
                      <p className="text-[13px] sm:text-sm md:text-base leading-relaxed sm:leading-relaxed text-gray-600 dark:text-gray-400 pl-11 sm:pl-12">
                        {t(`${mode}.section${i}Content`)}
                      </p>
                    </section>
                  ))}

                  {/* Last updated */}
                  {mode === 'terms' && (
                    <div className="pt-4 sm:pt-5 border-t border-gray-200 dark:border-gray-700">
                      <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-500 italic text-center">
                        {t('terms.lastUpdated')}
                      </p>
                    </div>
                  )}

                  {/* Bottom spacer for comfortable reading */}
                  <div className="h-2" />
                </div>
              </div>

              {/* Bottom fade overlay */}
              <div
                className="pointer-events-none absolute bottom-0 left-0 right-0 h-10 sm:h-12 z-10 transition-opacity duration-300"
                style={{
                  opacity: showBottomFade ? 1 : 0,
                  background: 'linear-gradient(to top, white 0%, transparent 100%)',
                }}
              />
            </div>

            {/* ── Scroll-to-bottom indicator (floating, only when agreement needed) ── */}
            <AnimatePresence>
              {!hasScrolledToBottom && onAgree && mode === 'terms' && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  className="absolute bottom-[90px] sm:bottom-[100px] left-1/2 -translate-x-1/2 z-20 flex flex-col items-center gap-1 pointer-events-none"
                >
                  <span className="text-xs sm:text-sm font-medium text-[#5B8CFF] bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm px-3 py-1 rounded-full shadow-md border border-[#5B8CFF]/20">
                    {t('terms.scrollToBottom')}
                  </span>
                  <motion.div
                    animate={{ y: [0, 6, 0] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                  >
                    <ChevronDown className="w-5 h-5 text-[#5B8CFF]" />
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* ── Fixed Footer ── */}
            <div className="flex-shrink-0 px-4 py-3 sm:px-6 sm:py-4 border-t border-gray-200/80 dark:border-gray-700/80 bg-gradient-to-r from-blue-50/60 to-indigo-50/60 dark:from-gray-800/60 dark:to-gray-800/30">
              <div className="max-w-3xl mx-auto flex items-center gap-3">
                <Button
                  onClick={onClose}
                  variant="outline"
                  size="lg"
                  className={`h-11 sm:h-12 text-sm sm:text-base ${onAgree ? 'flex-1 sm:flex-none sm:min-w-[120px]' : 'w-full'}`}
                >
                  {t('common.close')}
                </Button>
                {onAgree && (
                  <Button
                    onClick={handleAgree}
                    disabled={!hasScrolledToBottom && mode === 'terms'}
                    size="lg"
                    className="flex-1 h-11 sm:h-12 bg-gradient-to-r from-[#5B8CFF] to-blue-600 hover:from-[#4A7BEE] hover:to-blue-700 disabled:opacity-40 disabled:cursor-not-allowed transition-all text-sm sm:text-base font-semibold shadow-md"
                  >
                    {t('terms.agreeAndContinue')}
                  </Button>
                )}
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
