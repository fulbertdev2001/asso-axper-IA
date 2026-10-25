import React, { useEffect, useRef, useState } from 'react';
import {
  LazyMotion,
  domMax,
  m,
  AnimatePresence,
  MotionConfig,
  useScroll,
  useSpring,
  useTransform,
  useMotionValue,
  useMotionValueEvent,
  useInView,
  useReducedMotion,
  animate
} from 'motion/react';
import { Plan, Organization } from '../types';
import {
  Scale,
  Users,
  Landmark,
  Wallet,
  ShieldCheck,
  ArrowRight,
  Check,
  Minus,
  Plus,
  Menu,
  X,
  UserCheck,
  AlertTriangle,
  Compass,
  Calculator,
  UserCog,
  FolderKanban,
  BookOpen,
  Sparkles
} from 'lucide-react';
import '../landing.css';

interface PublicLandingViewProps {
  plans: Plan[];
  onOpenLogin: () => void;
  onStartOnboarding: (preferredPlanCode?: 'initiale' | 'pro' | 'expert') => void;
  currentOrg: Organization;
}

const EASE = [0.22, 1, 0.36, 1] as const;
const EXAMPLE_DURATION = 8000;
const TYPE_SPEED = 24;

const NAV_LINKS = [
  { href: '#domaines', label: 'Domaines' },
  { href: '#pour-qui', label: 'Pour qui' },
  { href: '#methode', label: 'Méthode' },
  { href: '#tarifs', label: 'Tarifs' },
  { href: '#faq', label: 'Questions' }
];

/* ---------- Contenus (alignés sur la vision produit, volontairement courts) ---------- */

const EXAMPLES = [
  {
    tab: 'RH',
    question: 'Nos éducateurs en CCN 66 ont-ils des congés en plus ?',
    answer: 'Oui, la CCN 66 prévoit des congés supplémentaires, selon l’annexe dont relève chaque salarié.',
    check: 'l’annexe de chaque salarié',
    sources: ['CCN 66 · annexes', 'Code du travail, L. 3141-3']
  },
  {
    tab: 'Gouvernance',
    question: 'Peut-on voter par procuration à notre AG ?',
    answer: 'La loi de 1901 ne l’encadre pas : ce sont vos statuts qui le prévoient, ou non.',
    check: 'la rédaction de vos statuts',
    sources: ['Loi du 1er juillet 1901', 'Vos statuts']
  },
  {
    tab: 'Finance',
    question: 'Subvention pas entièrement utilisée : que faire ?',
    answer: 'La part restante peut passer en fonds dédiés si votre engagement envers le financeur le justifie.',
    check: 'les clauses de votre convention',
    sources: ['Règlement ANC 2018-06', 'Convention de financement']
  }
];

const ENTITIES_A = ['CCN 66', 'CCN 51', 'ÉCLAT', 'ALISFA', 'Loi 1901', 'Statuts', 'Assemblée générale'];
const ENTITIES_B = ['CPOM', 'FSE', 'FONJEP', 'Fonds dédiés', 'DUERP', 'RGPD', 'URSSAF'];

const DOMAINS = [
  { icon: Users, title: 'RH et conventions', text: 'Contrats, embauche, convention collective.', tags: ['CCN 66', 'CCN 51', 'ÉCLAT'] },
  { icon: Landmark, title: 'Gouvernance', text: 'Statuts, AG, responsabilité des dirigeants.', tags: ['Loi 1901', 'Statuts', 'AG'] },
  { icon: Wallet, title: 'Finance et subventions', text: 'Budget, trésorerie, financements publics.', tags: ['CPOM', 'FSE', 'FONJEP'] },
  { icon: ShieldCheck, title: 'Conformité', text: 'Obligations employeur, RGPD, URSSAF.', tags: ['DUERP', 'RGPD', 'URSSAF'] }
];

const ROLES = [
  { icon: Compass, title: 'Direction', question: 'Quelles obligations quand on passe à 11 salariés ?' },
  { icon: Calculator, title: 'Trésorier', question: 'Doit-on nommer un commissaire aux comptes ?' },
  { icon: UserCog, title: 'RH', question: 'Quel préavis pour ce départ en CCN 51 ?' },
  { icon: Landmark, title: 'Président', question: 'Notre AG peut-elle voter sans quorum ?' },
  { icon: FolderKanban, title: 'Projet', question: 'Que mettre dans le compte rendu financier ?' }
];

// La promesse produit : de la question à l'action (vision produit, § 5)
const STEPS = [
  { title: 'Comprendre', text: 'Votre contexte est pris en compte.' },
  { title: 'Analyser', text: 'Faits, obligations et options triés.' },
  { title: 'Expliquer', text: 'En langage clair, sources à l’appui.' },
  { title: 'Faire avancer', text: 'Des étapes concrètes.' },
  { title: 'Sécuriser', text: 'Limites signalées, experte si besoin.' }
];

const STATS = [
  { value: 10, suffix: ' ans', label: 'dans le secteur' },
  { value: 48, suffix: ' h', label: 'pour l’experte' },
  { value: 4, suffix: '', label: 'domaines' }
];

const FAQS = [
  {
    q: 'En quoi est-ce différent d’un assistant généraliste ?',
    a: 'Il connaît la loi de 1901, les conventions du secteur et les financements publics, et tient compte du profil de votre association.'
  },
  {
    q: 'Les réponses sont-elles toujours à jour ?',
    a: 'L’assistant cite ses sources et signale ce qui doit être vérifié, notamment ce qui dépend de votre convention.'
  },
  {
    q: 'Remplace-t-il un avocat ou un expert-comptable ?',
    a: 'Non. C’est une aide à la décision : pour un litige ou un contrôle, il vous oriente vers l’experte ou un professionnel.'
  },
  {
    q: 'Puis-je résilier à tout moment ?',
    a: 'Oui. Les formules sont mensuelles et sans engagement.'
  }
];

const planName = (label: string) => label.replace(/\s*\(.*\)\s*/, '');

/* ---------- Primitives d'animation ---------- */

const Reveal: React.FC<{ children: React.ReactNode; delay?: number; y?: number; className?: string }> = ({
  children,
  delay = 0,
  y = 24,
  className
}) => (
  <m.div
    className={className}
    initial={{ opacity: 0, y }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true, margin: '0px 0px -80px 0px' }}
    transition={{ duration: 0.7, ease: EASE, delay }}
  >
    {children}
  </m.div>
);

const staggerParent = {
  hidden: {},
  show: { transition: { staggerChildren: 0.09 } }
};

const staggerChild = {
  hidden: { opacity: 0, y: 28 },
  show: { opacity: 1, y: 0, transition: { duration: 0.65, ease: EASE } }
};

const iconPop = {
  hidden: { opacity: 0, scale: 0.4, rotate: -25 },
  show: { opacity: 1, scale: 1, rotate: 0, transition: { type: 'spring' as const, stiffness: 320, damping: 16, delay: 0.15 } }
};

const tagsParent = {
  hidden: {},
  show: { transition: { staggerChildren: 0.06, delayChildren: 0.3 } }
};

const tagChild = {
  hidden: { opacity: 0, y: 8 },
  show: { opacity: 1, y: 0, transition: { duration: 0.35, ease: EASE } }
};

// Titre révélé mot par mot, chaque mot glissant depuis un masque
const SplitWords: React.FC<{ text: string; delay?: number; className?: string }> = ({ text, delay = 0, className }) => (
  <>
    {text.split(' ').map((word, i) => (
      <React.Fragment key={i}>
        <span className="lp-word-mask">
          <m.span
            className={`lp-word ${className || ''}`}
            initial={{ y: '110%' }}
            animate={{ y: '0%' }}
            transition={{ duration: 0.8, ease: EASE, delay: delay + i * 0.045 }}
          >
            {word}
          </m.span>
        </span>{' '}
      </React.Fragment>
    ))}
  </>
);

// Même révélation mot par mot, déclenchée à l'entrée dans l'écran (titres de section)
const InViewWords: React.FC<{ text: string; className?: string; delay?: number }> = ({ text, className, delay = 0 }) => (
  <m.span
    initial="hidden"
    whileInView="show"
    viewport={{ once: true, margin: '0px 0px -60px 0px' }}
    variants={{ hidden: {}, show: { transition: { staggerChildren: 0.045, delayChildren: delay } } }}
  >
    {text.split(' ').map((word, i) => (
      <React.Fragment key={i}>
        <span className="lp-word-mask">
          <m.span
            className={`lp-word ${className || ''}`}
            variants={{ hidden: { y: '110%' }, show: { y: '0%', transition: { duration: 0.75, ease: EASE } } }}
          >
            {word}
          </m.span>
        </span>{' '}
      </React.Fragment>
    ))}
  </m.span>
);

// Texte tapé lettre par lettre (le texte complet reste lisible par les lecteurs d'écran)
const Typewriter: React.FC<{ text: string; speed?: number }> = ({ text, speed = TYPE_SPEED }) => {
  const reduce = useReducedMotion();
  const [count, setCount] = useState(reduce ? text.length : 0);

  useEffect(() => {
    if (reduce) {
      setCount(text.length);
      return;
    }
    setCount(0);
    const id = setInterval(() => {
      setCount(c => {
        if (c >= text.length) {
          clearInterval(id);
          return c;
        }
        return c + 1;
      });
    }, speed);
    return () => clearInterval(id);
  }, [text, speed, reduce]);

  return (
    <span aria-label={text}>
      <span aria-hidden="true">{text.slice(0, count)}</span>
      {count < text.length && <span className="lp-caret" aria-hidden="true" />}
    </span>
  );
};

// Bouton « magnétique » : suit légèrement le curseur (sans effet au toucher)
const Magnetic: React.FC<{ children: React.ReactNode; strength?: number }> = ({ children, strength = 0.22 }) => {
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const sx = useSpring(x, { stiffness: 220, damping: 16, mass: 0.4 });
  const sy = useSpring(y, { stiffness: 220, damping: 16, mass: 0.4 });
  return (
    <m.span
      className="lp-magnetic"
      style={{ x: sx, y: sy }}
      onMouseMove={e => {
        const r = e.currentTarget.getBoundingClientRect();
        x.set((e.clientX - r.left - r.width / 2) * strength);
        y.set((e.clientY - r.top - r.height / 2) * strength);
      }}
      onMouseLeave={() => {
        x.set(0);
        y.set(0);
      }}
    >
      {children}
    </m.span>
  );
};

const Counter: React.FC<{ to: number; suffix: string }> = ({ to, suffix }) => {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: '0px 0px -60px 0px' });

  useEffect(() => {
    if (!inView) return;
    const controls = animate(0, to, {
      duration: 1.4,
      ease: EASE,
      onUpdate: v => {
        if (ref.current) ref.current.textContent = `${Math.round(v)}${suffix}`;
      }
    });
    return () => controls.stop();
  }, [inView, to, suffix]);

  // La valeur réelle est rendue d'emblée (lisible sans JavaScript et par les moteurs),
  // puis le compteur repart de zéro à l'entrée dans l'écran.
  return <span ref={ref}>{to}{suffix}</span>;
};

/* ---------- Carte d'exemple animée (hero) ---------- */

const ExampleCard: React.FC = () => {
  const [index, setIndex] = useState(0);
  const [autoplay, setAutoplay] = useState(true);
  const [phase, setPhase] = useState<'question' | 'thinking' | 'answer'>('question');

  // Légère inclinaison 3D qui suit le curseur
  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  const rotateX = useSpring(useTransform(my, [-0.5, 0.5], [4, -4]), { stiffness: 150, damping: 20 });
  const rotateY = useSpring(useTransform(mx, [-0.5, 0.5], [-5, 5]), { stiffness: 150, damping: 20 });

  const ex = EXAMPLES[index];

  // Question tapée, puis « en train d'écrire », puis réponse
  useEffect(() => {
    setPhase('question');
    const typed = ex.question.length * TYPE_SPEED + 250;
    const t1 = setTimeout(() => setPhase('thinking'), typed);
    const t2 = setTimeout(() => setPhase('answer'), typed + 900);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, [index, ex.question.length]);

  useEffect(() => {
    if (!autoplay) return;
    const t = setTimeout(() => setIndex(i => (i + 1) % EXAMPLES.length), EXAMPLE_DURATION);
    return () => clearTimeout(t);
  }, [index, autoplay]);

  return (
    <m.div
      className="lp-example-wrap"
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.9, ease: EASE, delay: 0.35 }}
      onMouseMove={e => {
        const r = e.currentTarget.getBoundingClientRect();
        mx.set((e.clientX - r.left) / r.width - 0.5);
        my.set((e.clientY - r.top) / r.height - 0.5);
      }}
      onMouseLeave={() => {
        mx.set(0);
        my.set(0);
      }}
    >
      <m.div className="lp-example" style={{ rotateX, rotateY }} aria-label="Exemples de questions et de réponses">
        <div className="lp-example-tabs" role="tablist">
          {EXAMPLES.map((e, i) => (
            <button
              key={e.tab}
              role="tab"
              aria-selected={i === index}
              className={`lp-example-tab${i === index ? ' is-active' : ''}`}
              onClick={() => {
                setAutoplay(false);
                setIndex(i);
              }}
            >
              {e.tab}
              {i === index && (
                <m.span
                  key={`${index}-${autoplay}`}
                  className="lp-example-progress"
                  initial={{ scaleX: autoplay ? 0 : 1 }}
                  animate={{ scaleX: 1 }}
                  transition={{ duration: autoplay ? EXAMPLE_DURATION / 1000 : 0, ease: 'linear' }}
                />
              )}
            </button>
          ))}
        </div>

        <div className="lp-example-body">
          <AnimatePresence mode="wait">
            <m.div
              key={index}
              className="lp-chat"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.35, ease: EASE }}
            >
              <div className="lp-bubble-q">
                <Typewriter text={ex.question} />
              </div>

              <AnimatePresence mode="wait">
                {phase === 'thinking' && (
                  <m.div
                    key="thinking"
                    className="lp-bubble-a lp-bubble-thinking"
                    initial={{ opacity: 0, y: 8, scale: 0.96 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.25 }}
                    aria-label="Rédaction de la réponse"
                  >
                    <span className="lp-typing"><span /><span /><span /></span>
                  </m.div>
                )}
                {phase === 'answer' && (
                  <m.div
                    key="answer"
                    className="lp-bubble-a"
                    initial="hidden"
                    animate="show"
                    variants={{ hidden: { opacity: 0, y: 10, scale: 0.97 }, show: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.4, ease: EASE, staggerChildren: 0.12 } } }}
                  >
                    <span className="lp-chip-ai"><Sparkles size={12} /> AssoExpert</span>
                    <m.p variants={staggerChild}>{ex.answer}</m.p>
                    <m.div className="lp-sources" variants={staggerChild}>
                      {ex.sources.map(s => (
                        <span key={s} className="lp-source">{s}</span>
                      ))}
                    </m.div>
                    <m.div className="lp-example-check" variants={staggerChild}>
                      <AlertTriangle size={14} />
                      <span>À vérifier : {ex.check}</span>
                    </m.div>
                  </m.div>
                )}
              </AnimatePresence>
            </m.div>
          </AnimatePresence>
        </div>
      </m.div>

      {/* Badges flottants autour de la carte (bureau) */}
      <m.div
        className="lp-float lp-float-a"
        initial={{ opacity: 0, scale: 0.9, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.6, ease: EASE, delay: 1.3 }}
        aria-hidden="true"
      >
        <m.div
          className="lp-float-inner"
          animate={{ y: [0, -8, 0] }}
          transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
        >
          <span className="lp-float-icon lp-float-icon-lime"><BookOpen size={14} /></span>
          Sources citées
        </m.div>
      </m.div>
      <m.div
        className="lp-float lp-float-b"
        initial={{ opacity: 0, scale: 0.9, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.6, ease: EASE, delay: 1.6 }}
        aria-hidden="true"
      >
        <m.div
          className="lp-float-inner"
          animate={{ y: [0, 8, 0] }}
          transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut', delay: 0.8 }}
        >
          <span className="lp-float-icon"><UserCheck size={14} /></span>
          <span>Experte sous 48 h</span>
        </m.div>
      </m.div>
    </m.div>
  );
};

/* ---------- Domaines : grille (bureau), carrousel automatique (mobile) ---------- */

const DomainsCarousel: React.FC = () => {
  const trackRef = useRef<HTMLDivElement>(null);
  const inView = useInView(trackRef, { margin: '0px 0px -80px 0px' });
  const [active, setActive] = useState(0);
  const [touched, setTouched] = useState(false);

  const goTo = (i: number) => {
    const track = trackRef.current;
    const card = track?.children[i] as HTMLElement | undefined;
    if (!track || !card) return;
    track.scrollTo({ left: card.offsetLeft - track.offsetLeft - 20, behavior: 'smooth' });
  };

  // Défilement automatique sur mobile tant que l'utilisateur n'a pas pris la main
  useEffect(() => {
    if (!inView || touched || !window.matchMedia('(max-width: 960px)').matches) return;
    const t = setTimeout(() => goTo((active + 1) % DOMAINS.length), 3200);
    return () => clearTimeout(t);
  }, [inView, touched, active]);

  return (
    <>
      <m.div
        ref={trackRef}
        className="lp-domains"
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, margin: '0px 0px -80px 0px' }}
        variants={staggerParent}
        onScroll={e => {
          const track = e.currentTarget;
          const first = track.children[0] as HTMLElement | undefined;
          if (!first) return;
          const step = first.offsetWidth + 12;
          setActive(Math.min(DOMAINS.length - 1, Math.max(0, Math.round(track.scrollLeft / step))));
        }}
        onPointerDown={() => setTouched(true)}
        onTouchStart={() => setTouched(true)}
      >
        {DOMAINS.map((d, i) => (
          <m.article
            key={d.title}
            className={`lp-domain${i === active ? ' is-current' : ''}`}
            variants={staggerChild}
            whileHover={{ y: -4 }}
            whileTap={{ scale: 0.98 }}
            transition={{ type: 'spring', stiffness: 300, damping: 24 }}
            onMouseMove={e => {
              const r = e.currentTarget.getBoundingClientRect();
              e.currentTarget.style.setProperty('--mx', `${e.clientX - r.left}px`);
              e.currentTarget.style.setProperty('--my', `${e.clientY - r.top}px`);
            }}
          >
            <m.span className="lp-domain-icon" variants={iconPop}><d.icon size={20} /></m.span>
            <h3>{d.title}</h3>
            <p>{d.text}</p>
            <m.div className="lp-tags" variants={tagsParent}>
              {d.tags.map(t => <m.span key={t} className="lp-tag" variants={tagChild}>{t}</m.span>)}
            </m.div>
          </m.article>
        ))}
      </m.div>
      <div className="lp-dots-nav" role="tablist" aria-label="Domaines">
        {DOMAINS.map((d, i) => (
          <button
            key={d.title}
            role="tab"
            aria-selected={i === active}
            aria-label={d.title}
            className={`lp-dot${i === active ? ' is-active' : ''}`}
            onClick={() => {
              setTouched(true);
              goTo(i);
            }}
          >
            {i === active && (
              <m.span layoutId="lp-dot-active" className="lp-dot-fill" transition={{ type: 'spring', stiffness: 400, damping: 32 }} />
            )}
          </button>
        ))}
      </div>
    </>
  );
};

/* ---------- Pour qui : sélecteur de rôle animé ---------- */

const RoleSwitcher: React.FC = () => {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { margin: '0px 0px -100px 0px' });
  const [active, setActive] = useState(0);
  const [autoplay, setAutoplay] = useState(true);

  useEffect(() => {
    if (!inView || !autoplay) return;
    const t = setTimeout(() => setActive(a => (a + 1) % ROLES.length), 3600);
    return () => clearTimeout(t);
  }, [inView, autoplay, active]);

  const role = ROLES[active];

  return (
    <div className="lp-roles" ref={ref}>
      <div className="lp-role-chips" role="tablist" aria-label="Profils">
        {ROLES.map((r, i) => (
          <button
            key={r.title}
            role="tab"
            aria-selected={i === active}
            className={`lp-role-chip${i === active ? ' is-active' : ''}`}
            onClick={() => {
              setAutoplay(false);
              setActive(i);
            }}
          >
            {i === active && (
              <m.span layoutId="lp-role-pill" className="lp-role-pill" transition={{ type: 'spring', stiffness: 380, damping: 32 }} />
            )}
            <r.icon size={15} />
            <span>{r.title}</span>
          </button>
        ))}
      </div>

      <div className="lp-role-stage">
        <AnimatePresence mode="wait">
          <m.div
            key={active}
            className="lp-role-card"
            initial={{ opacity: 0, y: 16, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -12, scale: 0.98 }}
            transition={{ duration: 0.35, ease: EASE }}
          >
            <m.span
              className="lp-role-icon"
              initial={{ scale: 0.5, rotate: -20 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: 'spring', stiffness: 300, damping: 15 }}
            >
              <role.icon size={22} />
            </m.span>
            <div className="lp-role-text">
              <span className="lp-role-label">{role.title}</span>
              <p className="lp-role-q">« <Typewriter text={role.question} /> »</p>
            </div>
          </m.div>
        </AnimatePresence>
      </div>
    </div>
  );
};

/* ---------- Méthode : étapes qui s'allument tour à tour ---------- */

const STEP_DURATION = 2400;

const MethodSteps: React.FC = () => {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { margin: '0px 0px -120px 0px' });
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    if (!inView || paused) return;
    const t = setTimeout(() => setActive(a => (a + 1) % STEPS.length), STEP_DURATION);
    return () => clearTimeout(t);
  }, [inView, paused, active]);

  return (
    <div className="lp-steps" ref={ref}>
      <m.span
        className="lp-steps-line lp-steps-line-h"
        initial={{ scaleX: 0 }}
        whileInView={{ scaleX: 1 }}
        viewport={{ once: true, margin: '0px 0px -120px 0px' }}
        transition={{ duration: 1.4, ease: EASE, delay: 0.2 }}
      />
      <m.span
        className="lp-steps-line lp-steps-line-v"
        initial={{ scaleY: 0 }}
        whileInView={{ scaleY: 1 }}
        viewport={{ once: true, margin: '0px 0px -120px 0px' }}
        transition={{ duration: 1.4, ease: EASE, delay: 0.2 }}
      />
      {STEPS.map((s, i) => (
        <Reveal key={s.title} className={`lp-step${i === active ? ' is-active' : ''}`} delay={0.1 + i * 0.15}>
          <span
            className="lp-step-hit"
            onMouseEnter={() => { setActive(i); setPaused(true); }}
            onMouseLeave={() => setPaused(false)}
            onClick={() => setActive(i)}
            aria-hidden="true"
          />
          <m.div
            className="lp-step-num"
            initial={{ scale: 0.6, opacity: 0 }}
            whileInView={{ scale: 1, opacity: 1 }}
            viewport={{ once: true, margin: '0px 0px -120px 0px' }}
            transition={{ type: 'spring', stiffness: 260, damping: 18, delay: 0.2 + i * 0.15 }}
          >
            {i + 1}
          </m.div>
          <div>
            <h3>{s.title}</h3>
            <p>{s.text}</p>
            <span className="lp-step-bar">
              {i === active && (
                <m.span
                  key={`${active}-${paused}`}
                  initial={{ scaleX: paused ? 1 : 0 }}
                  animate={{ scaleX: 1 }}
                  transition={{ duration: paused ? 0 : STEP_DURATION / 1000, ease: 'linear' }}
                />
              )}
            </span>
          </div>
        </Reveal>
      ))}
    </div>
  );
};

/* ---------- Tarifs : grille (bureau), sélecteur animé (mobile) ---------- */

const PlanCard: React.FC<{ plan: Plan; onChoose: () => void }> = ({ plan: p, onChoose }) => {
  const f = p.features;
  const items = [
    { on: f.briqueRh, label: 'RH et conventions' },
    { on: f.briqueGouvernance, label: 'Gouvernance' },
    { on: f.briqueFinance, label: 'Finance et subventions' },
    { on: f.briqueConformite, label: 'Conformité' },
    {
      on: f.expertQuestionsMonth > 0,
      label: f.expertQuestionsMonth > 0
        ? `${f.expertQuestionsMonth} question${f.expertQuestionsMonth > 1 ? 's' : ''} à l’experte / mois`
        : 'Question à l’experte'
    }
  ];
  return (
    <>
      {p.highlighted && (
        <span className="lp-plan-shine-wrap" aria-hidden="true">
          <m.span
            className="lp-plan-shine"
            initial={{ x: '-120%' }}
            whileInView={{ x: '320%' }}
            viewport={{ once: true, margin: '0px 0px -80px 0px' }}
            transition={{ duration: 1.6, ease: EASE, delay: 0.6 }}
          />
        </span>
      )}
      {p.highlighted && <span className="lp-plan-badge">Conseillée</span>}
      <h3>{planName(p.label)}</h3>
      <div className="lp-price">
        <strong><Counter to={p.priceMonthly} suffix=" €" /></strong>
        <span>HT / mois</span>
      </div>
      <m.ul initial="hidden" whileInView="show" viewport={{ once: true }} variants={tagsParent}>
        {items.map(it => (
          <m.li key={it.label} className={it.on ? '' : 'lp-off'} variants={tagChild}>
            {it.on ? <Check size={16} /> : <Minus size={16} />}
            {it.label}
          </m.li>
        ))}
      </m.ul>
      <button className={`lp-btn lp-btn-block ${p.highlighted ? 'lp-btn-primary' : 'lp-btn-ghost'}`} onClick={onChoose}>
        Choisir {planName(p.label)}
      </button>
    </>
  );
};

const PlanSwitcher: React.FC<{ plans: Plan[]; onChoose: (code: Plan['code']) => void }> = ({ plans, onChoose }) => {
  const [selected, setSelected] = useState<Plan['code']>(
    (plans.find(p => p.highlighted) || plans[0])?.code ?? 'pro'
  );
  const [dir, setDir] = useState(1);
  const plan = plans.find(p => p.code === selected) || plans[0];

  return (
    <div className="lp-plan-switcher">
      <div className="lp-plan-tabs" role="tablist" aria-label="Formules">
        {plans.map((p, i) => (
          <button
            key={p.code}
            role="tab"
            aria-selected={p.code === selected}
            className={`lp-plan-tab${p.code === selected ? ' is-active' : ''}`}
            onClick={() => {
              setDir(i > plans.findIndex(x => x.code === selected) ? 1 : -1);
              setSelected(p.code);
            }}
          >
            {p.code === selected && (
              <m.span layoutId="lp-plan-pill" className="lp-plan-pill" transition={{ type: 'spring', stiffness: 400, damping: 34 }} />
            )}
            <span>{planName(p.label)}</span>
          </button>
        ))}
      </div>
      <div className="lp-plan-stage">
        <AnimatePresence mode="wait" custom={dir}>
          <m.div
            key={plan.code}
            className={`lp-plan${plan.highlighted ? ' lp-plan-featured' : ''}`}
            custom={dir}
            initial={{ opacity: 0, x: 40 * dir }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -40 * dir }}
            transition={{ duration: 0.3, ease: EASE }}
            drag="x"
            dragConstraints={{ left: 0, right: 0 }}
            dragElastic={0.25}
            onDragEnd={(_, info) => {
              const idx = plans.findIndex(x => x.code === selected);
              if (info.offset.x < -60 && idx < plans.length - 1) {
                setDir(1);
                setSelected(plans[idx + 1].code);
              } else if (info.offset.x > 60 && idx > 0) {
                setDir(-1);
                setSelected(plans[idx - 1].code);
              }
            }}
          >
            <PlanCard plan={plan} onChoose={() => onChoose(plan.code)} />
          </m.div>
        </AnimatePresence>
      </div>
    </div>
  );
};

/* ---------- Page ---------- */

export const PublicLandingView: React.FC<PublicLandingViewProps> = ({
  plans,
  onOpenLogin,
  onStartOnboarding
}) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(0);
  const closeMenu = () => setIsMenuOpen(false);

  const { scrollY, scrollYProgress } = useScroll();
  const progress = useSpring(scrollYProgress, { stiffness: 120, damping: 24, mass: 0.3 });
  useMotionValueEvent(scrollY, 'change', v => setIsScrolled(v > 8));

  // Parallaxe douce des formes du hero
  const shapesY = useTransform(scrollY, [0, 600], [0, 120]);
  const ringRotate = useTransform(scrollY, [0, 800], [0, 40]);

  // Parallaxe de la photo de l'experte
  const expertRef = useRef<HTMLElement>(null);
  const { scrollYProgress: expertProgress } = useScroll({ target: expertRef, offset: ['start end', 'end start'] });
  const photoY = useTransform(expertProgress, [0, 1], [40, -40]);

  return (
    <MotionConfig reducedMotion="user">
      <LazyMotion features={domMax} strict>
        <div className="lp">
          {/* Navigation */}
          <nav className={`lp-nav${isScrolled ? ' is-scrolled' : ''}`} aria-label="Navigation principale">
            <m.div className="lp-progress" style={{ scaleX: progress }} />
            <div className="lp-container lp-nav-inner">
              <a href="#" className="lp-logo" onClick={closeMenu}>
                <span className="lp-logo-mark"><Scale size={16} /></span>
                AssoExpert
              </a>

              <div className="lp-nav-links">
                {NAV_LINKS.map(l => <a key={l.href} href={l.href}>{l.label}</a>)}
              </div>

              <div className="lp-nav-actions">
                <button className="lp-btn lp-btn-link" onClick={onOpenLogin}>Se connecter</button>
                <button className="lp-btn lp-btn-primary" onClick={() => onStartOnboarding()}>Commencer</button>
              </div>

              <button
                className="lp-burger"
                onClick={() => setIsMenuOpen(o => !o)}
                aria-label={isMenuOpen ? 'Fermer le menu' : 'Ouvrir le menu'}
                aria-expanded={isMenuOpen}
              >
                <AnimatePresence mode="wait" initial={false}>
                  <m.span
                    key={isMenuOpen ? 'close' : 'open'}
                    initial={{ rotate: -90, opacity: 0 }}
                    animate={{ rotate: 0, opacity: 1 }}
                    exit={{ rotate: 90, opacity: 0 }}
                    transition={{ duration: 0.18 }}
                    style={{ display: 'inline-flex' }}
                  >
                    {isMenuOpen ? <X size={22} /> : <Menu size={22} />}
                  </m.span>
                </AnimatePresence>
              </button>
            </div>

            <AnimatePresence>
              {isMenuOpen && (
                <m.div
                  className="lp-mobile-menu"
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.32, ease: EASE }}
                >
                  <m.div className="lp-mobile-menu-inner" initial="hidden" animate="show" variants={staggerParent}>
                    {NAV_LINKS.map(l => (
                      <m.a key={l.href} href={l.href} onClick={closeMenu} variants={staggerChild}>{l.label}</m.a>
                    ))}
                    <m.div className="lp-mobile-actions" variants={staggerChild}>
                      <button className="lp-btn lp-btn-primary lp-btn-block" onClick={() => onStartOnboarding()}>Commencer</button>
                      <button className="lp-btn lp-btn-ghost lp-btn-block" onClick={onOpenLogin}>Se connecter</button>
                    </m.div>
                  </m.div>
                </m.div>
              )}
            </AnimatePresence>
          </nav>

          <main>
            {/* Hero */}
            <header className="lp-hero">
              <m.div className="lp-hero-bg" style={{ y: shapesY }} aria-hidden="true">
                <div className="lp-dots" />
                <m.div
                  className="lp-blob lp-blob-blue"
                  animate={{ x: [0, 30, -10, 0], y: [0, -20, 15, 0] }}
                  transition={{ duration: 18, repeat: Infinity, ease: 'easeInOut' }}
                />
                <m.div
                  className="lp-blob lp-blob-lime"
                  animate={{ x: [0, -25, 15, 0], y: [0, 20, -10, 0] }}
                  transition={{ duration: 22, repeat: Infinity, ease: 'easeInOut' }}
                />
                <m.div className="lp-ring" style={{ rotate: ringRotate }}>
                  <m.span
                    className="lp-ring-orbit"
                    animate={{ rotate: 360 }}
                    transition={{ duration: 40, repeat: Infinity, ease: 'linear' }}
                  >
                    <span className="lp-ring-dot" />
                  </m.span>
                </m.div>
              </m.div>

              <div className="lp-container lp-hero-grid">
                <div>
                  <m.div
                    className="lp-hero-tag"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, ease: EASE }}
                  >
                    Pour les associations employeuses
                  </m.div>
                  <h1 className="lp-h1">
                    <SplitWords text="Les bonnes réponses pour gérer votre association," delay={0.1} />
                    <span className="lp-underline">
                      <SplitWords text="sources à l’appui." delay={0.45} className="lp-serif" />
                      <svg className="lp-underline-svg" viewBox="0 0 300 20" preserveAspectRatio="none" aria-hidden="true">
                        <m.path
                          d="M4 13 C 70 5, 170 4, 296 10"
                          fill="none"
                          stroke="var(--color-lime)"
                          strokeWidth="7"
                          strokeLinecap="round"
                          initial={{ pathLength: 0 }}
                          animate={{ pathLength: 1 }}
                          transition={{ duration: 0.9, ease: EASE, delay: 1.05 }}
                        />
                      </svg>
                    </span>
                  </h1>
                  <m.p
                    className="lp-hero-sub"
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.7, ease: EASE, delay: 0.6 }}
                  >
                    RH, gouvernance, finance, conformité. Et une experte quand l’enjeu le demande.
                  </m.p>
                  <m.div
                    className="lp-hero-ctas"
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.7, ease: EASE, delay: 0.72 }}
                  >
                    <Magnetic>
                      <button className="lp-btn lp-btn-primary lp-btn-arrow" onClick={() => onStartOnboarding()}>
                        Commencer <ArrowRight size={16} />
                      </button>
                    </Magnetic>
                    <Magnetic strength={0.15}>
                      <a href="#tarifs" className="lp-btn lp-btn-ghost">Voir les tarifs</a>
                    </Magnetic>
                  </m.div>
                  <m.p
                    className="lp-hero-note"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.7, delay: 0.9 }}
                  >
                    Sans engagement
                  </m.p>
                </div>

                <ExampleCard />
              </div>
            </header>

            {/* Bandeaux des sujets couverts (sens opposés) */}
            <div className="lp-marquee" aria-label="Sujets couverts">
              <div className="lp-marquee-track">
                {[...ENTITIES_A, ...ENTITIES_A].map((e, i) => (
                  <span key={i} className="lp-marquee-item" aria-hidden={i >= ENTITIES_A.length}>{e}</span>
                ))}
              </div>
              <div className="lp-marquee-track lp-marquee-reverse">
                {[...ENTITIES_B, ...ENTITIES_B].map((e, i) => (
                  <span key={i} className="lp-marquee-item" aria-hidden={i >= ENTITIES_B.length}>{e}</span>
                ))}
              </div>
            </div>

            {/* Domaines */}
            <section id="domaines" className="lp-section lp-section-soft">
              <div className="lp-container">
                <Reveal className="lp-head">
                  <span className="lp-eyebrow">Domaines couverts</span>
                  <h2 className="lp-h2"><InViewWords text="Quatre domaines, un seul interlocuteur" /></h2>
                </Reveal>
                <DomainsCarousel />
              </div>
            </section>

            {/* Pour qui */}
            <section id="pour-qui" className="lp-section">
              <div className="lp-container">
                <Reveal className="lp-head">
                  <span className="lp-eyebrow">Pour qui</span>
                  <h2 className="lp-h2"><InViewWords text="Pour toute l’équipe dirigeante" /></h2>
                  <p className="lp-lead">Associations de 1 à 100 salariés.</p>
                </Reveal>
                <Reveal delay={0.1}>
                  <RoleSwitcher />
                </Reveal>
              </div>
            </section>

            {/* Méthode : de la question à l'action */}
            <section id="methode" className="lp-section lp-section-soft">
              <div className="lp-container">
                <Reveal className="lp-head">
                  <span className="lp-eyebrow">Méthode</span>
                  <h2 className="lp-h2"><InViewWords text="De la question à l’action" /></h2>
                </Reveal>
                <MethodSteps />
              </div>
            </section>

            {/* Experte */}
            <section id="experte" className="lp-section" ref={expertRef}>
              <div className="lp-container lp-expert">
                <div className="lp-expert-figure">
                  <m.div className="lp-expert-parallax" style={{ y: photoY }}>
                    <m.div
                      className="lp-expert-photo-wrap"
                      initial={{ clipPath: 'inset(100% 0% 0% 0%)' }}
                      whileInView={{ clipPath: 'inset(0% 0% 0% 0%)' }}
                      viewport={{ once: true, margin: '0px 0px -80px 0px' }}
                      transition={{ duration: 1.1, ease: EASE }}
                    >
                      <m.img
                        className="lp-expert-photo"
                        src="/images/laetitia-badji.jpg"
                        alt="Portrait de Laetitia Badji"
                        loading="lazy"
                        initial={{ scale: 1.15 }}
                        whileInView={{ scale: 1 }}
                        viewport={{ once: true, margin: '0px 0px -80px 0px' }}
                        transition={{ duration: 1.4, ease: EASE }}
                      />
                    </m.div>
                  </m.div>
                  <Reveal delay={0.3}>
                    <div className="lp-expert-name">Laetitia Badji</div>
                    <div className="lp-expert-role">DAF externalisée, Cabinet Maé</div>
                  </Reveal>
                </div>
                <div>
                  <Reveal>
                    <span className="lp-eyebrow">L’experte derrière AssoExpert</span>
                    <p className="lp-quote">
                      « Rendre accessible à chaque association l’expertise d’une direction financière du secteur. »
                    </p>
                  </Reveal>
                  <Reveal delay={0.15} className="lp-stats">
                    {STATS.map(s => (
                      <div key={s.label} className="lp-stat">
                        <strong><Counter to={s.value} suffix={s.suffix} /></strong>
                        <span>{s.label}</span>
                      </div>
                    ))}
                  </Reveal>
                </div>
              </div>
            </section>

            {/* Tarifs */}
            <section id="tarifs" className="lp-section lp-section-soft">
              <div className="lp-container">
                <Reveal className="lp-head lp-head-center">
                  <span className="lp-eyebrow">Tarifs</span>
                  <h2 className="lp-h2"><InViewWords text="Une formule pour chaque structure" /></h2>
                  <p className="lp-lead">Mensuel, sans engagement.</p>
                </Reveal>

                {/* Bureau : les trois formules côte à côte */}
                <m.div
                  className="lp-plans"
                  initial="hidden"
                  whileInView="show"
                  viewport={{ once: true, margin: '0px 0px -80px 0px' }}
                  variants={staggerParent}
                >
                  {plans.map(p => (
                    <m.div
                      key={p.code}
                      className={`lp-plan${p.highlighted ? ' lp-plan-featured' : ''}`}
                      variants={staggerChild}
                      whileHover={{ y: -6 }}
                      transition={{ type: 'spring', stiffness: 300, damping: 24 }}
                    >
                      <PlanCard plan={p} onChoose={() => onStartOnboarding(p.code)} />
                    </m.div>
                  ))}
                </m.div>

                {/* Mobile : une formule à la fois, à faire glisser */}
                <Reveal className="lp-plans-mobile">
                  <PlanSwitcher plans={plans} onChoose={code => onStartOnboarding(code)} />
                </Reveal>
              </div>
            </section>

            {/* FAQ */}
            <section id="faq" className="lp-section">
              <div className="lp-container">
                <Reveal className="lp-head lp-head-center">
                  <span className="lp-eyebrow">Questions fréquentes</span>
                  <h2 className="lp-h2"><InViewWords text="Avant de commencer" /></h2>
                </Reveal>
                <m.div
                  className="lp-faq"
                  initial="hidden"
                  whileInView="show"
                  viewport={{ once: true, margin: '0px 0px -80px 0px' }}
                  variants={staggerParent}
                >
                  {FAQS.map((f, i) => {
                    const isOpen = openFaq === i;
                    return (
                      <m.div key={f.q} className={`lp-faq-item${isOpen ? ' is-open' : ''}`} variants={staggerChild}>
                        <button
                          className="lp-faq-q"
                          onClick={() => setOpenFaq(isOpen ? null : i)}
                          aria-expanded={isOpen}
                        >
                          {f.q}
                          <m.span
                            className="lp-faq-icon"
                            animate={{ rotate: isOpen ? 45 : 0 }}
                            transition={{ duration: 0.25, ease: EASE }}
                          >
                            <Plus size={18} />
                          </m.span>
                        </button>
                        <AnimatePresence initial={false}>
                          {isOpen && (
                            <m.div
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: 'auto', opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              transition={{ duration: 0.35, ease: EASE }}
                              style={{ overflow: 'hidden' }}
                            >
                              <p className="lp-faq-a">{f.a}</p>
                            </m.div>
                          )}
                        </AnimatePresence>
                      </m.div>
                    );
                  })}
                </m.div>
              </div>
            </section>

            {/* CTA final */}
            <section className="lp-section">
              <div className="lp-container">
                <m.div
                  className="lp-cta"
                  initial={{ opacity: 0, scale: 0.96, y: 24 }}
                  whileInView={{ opacity: 1, scale: 1, y: 0 }}
                  viewport={{ once: true, margin: '0px 0px -80px 0px' }}
                  transition={{ duration: 0.8, ease: EASE }}
                  onMouseMove={e => {
                    const r = e.currentTarget.getBoundingClientRect();
                    e.currentTarget.style.setProperty('--mx', `${e.clientX - r.left}px`);
                    e.currentTarget.style.setProperty('--my', `${e.clientY - r.top}px`);
                  }}
                >
                  <div className="lp-cta-spot" aria-hidden="true" />
                  <div className="lp-cta-shapes" aria-hidden="true">
                    <m.span
                      className="lp-cta-ring"
                      animate={{ rotate: 360 }}
                      transition={{ duration: 60, repeat: Infinity, ease: 'linear' }}
                    />
                    <m.span
                      className="lp-cta-glow"
                      animate={{ opacity: [0.5, 0.9, 0.5], scale: [1, 1.1, 1] }}
                      transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
                    />
                  </div>
                  <div className="lp-cta-content">
                    <h2>
                      <InViewWords text="Gérez votre association" delay={0.3} />
                      <InViewWords text="l’esprit tranquille." className="lp-serif" delay={0.5} />
                    </h2>
                    <p>Votre première question en quelques minutes.</p>
                    <div className="lp-cta-actions">
                      <Magnetic>
                        <button className="lp-btn lp-btn-primary lp-btn-arrow" onClick={() => onStartOnboarding()}>
                          Commencer <ArrowRight size={16} />
                        </button>
                      </Magnetic>
                      <Magnetic strength={0.15}>
                        <a href="mailto:contact@cabinet-mae.fr" className="lp-btn lp-btn-ghost">Nous écrire</a>
                      </Magnetic>
                    </div>
                  </div>
                </m.div>
              </div>
            </section>
          </main>

          {/* Footer */}
          <footer className="lp-footer">
            <div className="lp-container">
              <div className="lp-footer-top">
                <div>
                  <a href="#" className="lp-logo">
                    <span className="lp-logo-mark"><Scale size={16} /></span>
                    AssoExpert
                  </a>
                  <p>L’assistant spécialisé dans la gestion des associations, par le Cabinet Maé.</p>
                </div>
                <div className="lp-footer-links">
                  <div>
                    <h4>Produit</h4>
                    <a href="#domaines">Domaines</a>
                    <a href="#tarifs">Tarifs</a>
                    <a href="#faq">Questions</a>
                  </div>
                  <div>
                    <h4>Contact</h4>
                    <a href="#experte">L’experte</a>
                    <a href="mailto:contact@cabinet-mae.fr">contact@cabinet-mae.fr</a>
                  </div>
                </div>
              </div>
              <div className="lp-footer-bottom">
                <span>© 2026 AKILIGUE SAS · Cabinet Maé</span>
                <span>
                  <a href="/mentions-legales" style={{ color: 'inherit' }}>Mentions légales</a>
                  {' · '}
                  <a href="/politique-confidentialite" style={{ color: 'inherit' }}>Confidentialité</a>
                </span>
              </div>
            </div>
          </footer>
        </div>
      </LazyMotion>
    </MotionConfig>
  );
};
