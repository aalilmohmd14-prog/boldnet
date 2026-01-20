
'use client';

import { useRef, useState, useEffect } from 'react';
import {
  motion,
  useScroll,
  useTransform,
  useInView,
  useReducedMotion,
} from 'framer-motion';
import {
  Compass,
  Target,
  Lightbulb,
  BarChart3,
  LucideProps,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useIsMobile } from '@/hooks/use-mobile';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';
import { PersonalBrandingContactForm } from '../coded/personal-branding/PersonalBrandingContactForm';

// --- Data for timeline steps ---
const steps = [
  {
    id: 1,
    subtitle: 'ÉTAPE 1',
    title: 'DÉCOUVERTE',
    description: 'On explore votre histoire, vos objectifs et votre public.',
    Icon: Compass,
  },
  {
    id: 2,
    subtitle: 'ÉTAPE 2',
    title: 'STRATÉGIE',
    description:
      'On crée votre positionnement et votre contenu pour attirer les bons clients.',
    Icon: Target,
  },
  {
    id: 3,
    subtitle: 'ÉTAPE 3',
    title: 'EXÉCUTION',
    description:
      'Scénario, tournage, montage, réseaux sociaux, site web... tout est fait pour vous.',
    Icon: Lightbulb,
  },
  {
    id: 4,
    subtitle: 'ÉTAPE 4',
    title: 'RÉSULTATS',
    description:
      'Visibilité, prospects, moins de pub, plus de revenus. Votre réputation devient votre moteur.',
    Icon: BarChart3,
  },
];

type StepProps = {
  step: (typeof steps)[0];
  index: number;
  isActive: boolean;
  isMobile: boolean;
};

// --- Sub-component for a single timeline step ---
const Step = ({ step, index, isActive, isMobile }: StepProps) => {
  const shouldReduceMotion = useReducedMotion();

  const stepVariants = {
    initial: {
      opacity: 0,
      y: shouldReduceMotion ? 0 : 20,
      filter: shouldReduceMotion ? 'none' : 'blur(6px)',
    },
    animate: {
      opacity: 1,
      y: 0,
      filter: 'blur(0px)',
      transition: { duration: 0.5, ease: 'easeOut' },
    },
  };

  const iconVariants = {
    initial: { scale: 0.92, opacity: 0.8 },
    animate: {
      scale: isActive ? 1.05 : 1,
      opacity: 1,
      transition: { type: 'spring', stiffness: 300, damping: 20 },
    },
  };

  const contentOpacity = isActive || isMobile ? 1 : 0.55;

  return (
    <motion.div
      initial="initial"
      whileInView="animate"
      viewport={{ once: true, amount: 0.5 }}
      variants={stepVariants}
      transition={{ delay: index * 0.15 }}
      className={cn(
        'group relative flex w-full items-center',
        !isMobile && (index % 2 === 0 ? 'justify-end' : 'justify-start')
      )}
    >
      <div
        className={cn(
          'w-full md:w-1/2',
          !isMobile && (index % 2 === 0 ? 'pl-8' : 'pr-8')
        )}
      >
        <motion.div
          whileHover={
            shouldReduceMotion ? {} : { y: -2, transition: { duration: 0.2 } }
          }
          animate={{ opacity: contentOpacity }}
          transition={{ duration: 0.4 }}
          className={cn(
            'rounded-lg p-4 transition-all',
            isActive && !isMobile ? 'bg-white/5 shadow-lg' : 'bg-transparent'
          )}
        >
          <div
            className={cn(
              'flex items-center gap-4',
              !isMobile && index % 2 === 0 && 'flex-row-reverse'
            )}
          >
            {/* Desktop Icon and Line */}
            {!isMobile && (
              <motion.div
                variants={iconVariants}
                whileHover={shouldReduceMotion ? {} : { rotate: -3 }}
                className="relative z-10 hidden flex-shrink-0 md:flex"
              >
                <div
                  className={cn(
                    'flex h-12 w-12 items-center justify-center rounded-full bg-white shadow-lg transition-all duration-300',
                    isActive && 'shadow-red-300/50'
                  )}
                >
                  <step.Icon className="h-6 w-6 text-red-600" />
                </div>
              </motion.div>
            )}

            {/* Content */}
            <div
              className={cn(
                'flex-grow',
                !isMobile && (index % 2 === 0 ? 'text-right' : 'text-left')
              )}
            >
              <div className="flex items-center gap-3 md:hidden">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-white">
                  <step.Icon className="h-5 w-5 text-red-600" />
                </div>
                <h3 className="font-bold uppercase tracking-wide text-white">
                  {step.subtitle}
                </h3>
              </div>
              <h3 className="hidden font-bold uppercase tracking-wide text-white md:block">
                {step.subtitle}
              </h3>
              <h4 className="font-headline text-xl font-bold uppercase text-red-200">
                {step.title}
              </h4>
              <p className="mt-1 text-sm text-white/80">{step.description}</p>
            </div>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
};

// --- Main MethodSection Component ---
export default function MethodSection({ content }: { content: any }) {
  const isMobile = useIsMobile();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [activeStep, setActiveStep] = useState(1);

  const containerRef = useRef<HTMLDivElement>(null);
  const stepRefs = useRef<(HTMLDivElement | null)[]>([]);

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start center', 'end center'],
  });

  // Animate the height of the progress line
  const lineHeight = useTransform(scrollYProgress, (v) => v);

  // Track the active step based on scroll position
  useEffect(() => {
    const handleScroll = () => {
      if (!containerRef.current || isMobile) return;

      const viewportCenter = window.scrollY + window.innerHeight / 2;
      let closestStep = { index: 0, distance: Infinity };

      stepRefs.current.forEach((ref, index) => {
        if (!ref) return;
        const rect = ref.getBoundingClientRect();
        const stepCenter = window.scrollY + rect.top + rect.height / 2;
        const distance = Math.abs(viewportCenter - stepCenter);

        if (distance < closestStep.distance) {
          closestStep = { index: index + 1, distance };
        }
      });

      setActiveStep(closestStep.index);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [isMobile]);

  const titleVariants = {
    hidden: { opacity: 0, y: 16 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6, ease: 'easeOut' },
    },
  };

  return (
    <>
      <section
        id="funnel"
        ref={containerRef}
        className="relative overflow-hidden bg-red-700/20 py-16 text-white backdrop-blur-sm md:py-24"
      >
        {/* Background decorative gradient */}
        <div
          className="absolute inset-0 z-0 opacity-10"
          style={{
            backgroundImage:
              'radial-gradient(circle, rgba(255,255,255,0.1) 1px, transparent 1px)',
            backgroundSize: '1.5rem 1.5rem',
          }}
        />

        <div className="container relative z-10 mx-auto px-4">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.5 }}
            variants={titleVariants}
            className="text-center"
          >
            <h2 className="font-headline text-3xl font-bold tracking-tight text-white sm:text-5xl">
              {content?.title || 'NOTRE METHODE'}
            </h2>
            <div className="mx-auto mt-4 h-1 w-24 bg-white/50" />
          </motion.div>

          <div className="relative mx-auto mt-12 max-w-4xl md:mt-20">
            {/* The timeline bar */}
            <div className="absolute left-4 top-4 bottom-4 w-1 -translate-x-1/2 rounded-full bg-white/10 md:left-1/2" />
            <motion.div
              style={{ scaleY: lineHeight }}
              className="absolute left-4 top-4 bottom-4 w-1 -translate-x-1/2 origin-top rounded-full bg-white"
            />

            {/* Steps container */}
            <div className="relative flex flex-col gap-12 md:gap-0">
              {steps.map((step, index) => (
                <div
                  key={step.id}
                  ref={(el) => (stepRefs.current[index] = el)}
                >
                  <Step
                    step={step}
                    index={index}
                    isActive={activeStep === step.id}
                    isMobile={isMobile}
                  />
                </div>
              ))}
            </div>
          </div>

          <div className="mt-12 text-center">
            <Button
              onClick={() => setIsFormOpen(true)}
              size="lg"
              className="rounded-full bg-white px-10 py-6 text-lg font-bold text-red-600 hover:bg-gray-200"
            >
              {content?.ctaButtonText || 'EN SAVOIR PLUS'}{' '}
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </div>
        </div>
      </section>
      {isFormOpen && <PersonalBrandingContactForm onOpenChange={setIsFormOpen} />}
    </>
  );
}
