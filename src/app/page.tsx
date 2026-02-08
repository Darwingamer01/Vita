'use client';

import Link from 'next/link';
import Image from 'next/image';
import {
  Heart, Activity, Ambulance, Map as MapIcon,
  Zap, Users, ArrowRight, CheckCircle2, Siren, ChevronRight,
  MessageSquare, Cpu, Stethoscope
} from 'lucide-react';
import { motion, Variants } from 'framer-motion';
import { useRef, useState } from 'react';
import ChatWidget from '@/components/features/ChatWidget';
import EmergencyButton from '@/components/features/EmergencyButton';

import { useLanguage } from '@/lib/i18n';
import { LampContainer } from '@/components/ui/lamp';
import { Cover } from '@/components/ui/cover';
import { CardBody, CardContainer, CardItem } from "@/components/ui/3d-card";
import { Button as MovingBorderButton } from "@/components/ui/moving-border";
import { ExpandableCardDemo } from "@/components/ui/expandable-cards";
import { AnimatedTestimonials } from "@/components/ui/animated-testimonials";
import { ThreeDMarquee } from "@/components/ui/3d-marquee";

type Testimonial = {
  quote: string;
  name: string;
  designation: string;
  src: string;
};

const testimonials: Testimonial[] = [
  {
    quote:
      "This app saved my father's life during the blackout. We found an oxygen cylinder within 2 minutes when every hospital line was busy.",
    name: "Sarah Chen",
    designation: "Survivor, Mumbai",
    src: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?q=80&w=3560&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
  },
  {
    quote:
      "The God-Mode visibility is insane. As a fleet manager, I coordinated 4 ambulances through the flood zones using the real-time heatmaps.",
    name: "Michael Rodriguez",
    designation: "Ambulance Fleet Coordinator",
    src: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?q=80&w=3540&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
  },
  {
    quote:
      "Doctors picking up video triage calls in 30 seconds? This is the future of emergency healthcare. I can assess patients before they even arrive.",
    name: "Dr. Emily Watson",
    designation: "Chief of Surgery, Apollo",
    src: "https://images.unsplash.com/photo-1623582854588-d60de57fa33f?q=80&w=3540&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
  },
  {
    quote:
      "The Neural Prediction engine alerted us to the bed shortage 2 hours before the surge hit. We were ready. Pure genius.",
    name: "Karan Patel",
    designation: "Hospital Administrator",
    src: "https://images.unsplash.com/photo-1636041293178-808a676cda85?q=80&w=3540&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
  },
  {
    quote:
      "When the grid went down, the Community Lifeline helped me find food for my elderly neighbors. It restores your faith in humanity.",
    name: "Lisa Wang",
    designation: "Community Volunteer",
    src: "https://images.unsplash.com/photo-1624561172888-ac93c696e10c?q=80&w=2592&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
  },
];

export function TestimonialMarquee() {
  return (
    <div className="mx-auto my-10 max-w-7xl rounded-3xl bg-transparent p-2">
      <ThreeDMarquee<Testimonial>
        items={testimonials}
        speed="slow"
        renderItem={(testimonial, index) => (
          <div
            key={index}
            className="relative h-60 w-80 shrink-0 overflow-hidden rounded-xl border border-cyan-500/30 bg-slate-800/50 backdrop-blur-md p-6 flex flex-col justify-between hover:border-cyan-300 hover:bg-slate-700/80 transition-all duration-300 group hover:shadow-[0_0_30px_rgba(6,182,212,0.3)]"
          >
            <p className="text-white text-sm leading-relaxed mb-4 line-clamp-4 font-medium drop-shadow-sm">"{testimonial.quote}"</p>

            <div className="flex items-center gap-3">
              <div className="relative h-10 w-10 rounded-full overflow-hidden ring-2 ring-cyan-500/40 group-hover:ring-cyan-300 transition-all">
                <Image
                  src={testimonial.src}
                  alt={testimonial.name}
                  fill
                  className="object-cover"
                />
              </div>
              <div>
                <h4 className="text-cyan-100 font-bold text-sm tracking-wide">{testimonial.name}</h4>
                <p className="text-cyan-400 text-xs font-bold uppercase tracking-wider">{testimonial.designation}</p>
              </div>
            </div>
          </div>
        )}
      />
    </div>
  );
}

export default function Home() {
  const { t } = useLanguage();
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [isSOSOpen, setIsSOSOpen] = useState(false);

  // Animation Variants
  const fadeInUp: Variants = {
    hidden: { opacity: 0, y: 40, filter: "blur(8px)" },
    visible: {
      opacity: 1,
      y: 0,
      filter: "blur(0px)",
      transition: {
        duration: 1.0,
        ease: [0.25, 0.4, 0.25, 1], // Simpler Smooth Ease
      }
    }
  };

  const staggerContainer: Variants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.12, delayChildren: 0.1 } }
  };

  const cardHover: Variants = {
    rest: { scale: 1, y: 0, filter: "brightness(1)" },
    hover: {
      scale: 1.02,
      y: -5,
      filter: "brightness(1.1)",
      transition: {
        duration: 0.4,
        ease: "easeOut"
      }
    }
  };

  const hospitalPartners = [
    "APOLLO HOSPITALS", "AIIMS DELHI", "FORTIS HEALTHCARE",
    "MAX SUPER SPECIALITY", "MEDANTA", "MANIPAL HOSPITALS",
    "NH NARAYANA", "KOKILABEN AMBANI", "LILAVATI HOSPITAL"
  ];

  const features = [
    {
      title: t.featureMapTitle,
      desc: t.featureMapDesc,
      icon: <MapIcon size={32} className="text-white" />,
      link: "/signup", cta: t.ctaMap,
      className: "bg-gradient-to-br from-teal-500/20 via-teal-900/40 to-teal-500/20 border-teal-400/50",
      glow: "group-hover/card:shadow-[0_0_50px_rgba(45,212,191,0.5)]"
    },
    {
      title: "Doctors Available NOW",
      desc: "Cardio, Neuro, and Peds specialists on-call.",
      icon: <Stethoscope size={32} className="text-cyan-200" />,
      link: "/signup", cta: "Find Doctors",
      className: "bg-gradient-to-br from-cyan-500/20 via-cyan-900/40 to-cyan-500/20 border-cyan-400/50",
      glow: "group-hover/card:shadow-[0_0_50px_rgba(34,211,238,0.5)]"
    },
    {
      title: "Blood & Oxygen",
      desc: "Live stock from verified banks. Filter by distance.",
      icon: <Heart size={32} className="text-violet-200" />,
      link: "/signup", cta: "Check Stock",
      className: "bg-gradient-to-br from-violet-500/20 via-violet-900/40 to-violet-500/20 border-violet-400/50",
      glow: "group-hover/card:shadow-[0_0_50px_rgba(167,139,250,0.5)]"
    },
    {
      title: "Ambulance & Beds",
      desc: "ICU/Ventilator availability in real-time.",
      icon: <Ambulance size={32} className="text-indigo-200" />,
      link: "/signup", cta: "Find Bed/Amb",
      className: "bg-gradient-to-br from-indigo-500/20 via-indigo-900/40 to-indigo-500/20 border-indigo-400/50",
      glow: "group-hover/card:shadow-[0_0_50px_rgba(129,140,248,0.5)]"
    },
    {
      title: t.featureAITitle,
      desc: t.featureAIDesc,
      icon: <Zap size={32} className="text-fuchsia-200" />,
      link: "/signup", cta: "Try AI",
      className: "bg-gradient-to-br from-fuchsia-500/20 via-fuchsia-900/40 to-fuchsia-500/20 border-fuchsia-400/50",
      glow: "group-hover/card:shadow-[0_0_50px_rgba(232,121,249,0.5)]"
    },
    {
      title: "Community Lifeline",
      desc: "Broadcast SOS requests. Connect with local volunteers.",
      icon: <Users size={32} className="text-blue-200" />,
      link: "/signup", cta: "View Requests",
      className: "bg-gradient-to-br from-blue-500/20 via-blue-900/40 to-blue-500/20 border-blue-400/50",
      glow: "group-hover/card:shadow-[0_0_50px_rgba(96,165,250,0.5)]"
    }
  ];

  return (
    <div className="flex flex-col min-h-screen font-sans overflow-x-hidden selection:bg-purple-500/30 bg-slate-900 text-white">

      {/* 1. HERO SECTION WITH LAMP */}
      <LampContainer>
        <motion.div
          initial={{ opacity: 0.5, y: 100 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{
            delay: 0.3,
            duration: 0.8,
            ease: "easeInOut",
          }}
          className="flex flex-col items-center justify-center text-center"
        >
          <motion.div
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-950/30 border border-emerald-500/20 backdrop-blur-md text-sm font-medium text-emerald-200 mb-6 cursor-default hover:bg-emerald-900/20 transition-colors"
          >
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-teal-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-teal-500"></span>
            </span>
            v4.0 Ultimate Edition Live
          </motion.div>

          <motion.h1
            className="bg-gradient-to-br from-slate-200 to-slate-500 py-4 bg-clip-text text-center text-4xl font-black tracking-tight text-transparent md:text-7xl"
          >
            VITA SAVES <br /> <Cover>LIVES FAST.</Cover>
          </motion.h1>

          <motion.p
            className="text-lg md:text-2xl text-cyan-100/80 mb-10 max-w-2xl mx-auto font-light leading-relaxed mt-4"
          >
            {t.heroDesc}
          </motion.p>

          <motion.div
            className="flex flex-col sm:flex-row items-center justify-center gap-6"
          >
            <Link href="/signup">
              <MovingBorderButton
                borderRadius="1.75rem"
                duration={4000}
                className="bg-gray-900 dark:bg-white/10 text-white border-white/10 hover:bg-gray-800 dark:hover:bg-white/20 font-bold text-xl"
                containerClassName="h-16 w-60"
              >
                <span className="flex items-center gap-2">
                  Get Started Now <ArrowRight size={20} />
                </span>
              </MovingBorderButton>
            </Link>
          </motion.div>
        </motion.div>
      </LampContainer>

      {/* 2. TRUSTED BY MARQUEE */}
      <section className="py-10 border-y border-white/5 bg-white/[0.02] backdrop-blur-sm overflow-hidden z-10 relative">
        <div className="container mx-auto px-4 mb-6 text-center">
          <p className="text-xs font-bold text-gray-500 uppercase tracking-[0.2em]">Trusted by 50+ Networks</p>
        </div>
        <div className="relative w-full overflow-hidden">
          <div className="absolute left-0 top-0 bottom-0 w-32 bg-gradient-to-r from-[#020617] to-transparent z-10"></div>
          <div className="absolute right-0 top-0 bottom-0 w-32 bg-gradient-to-l from-[#020617] to-transparent z-10"></div>

          <div className="flex w-max animate-marquee text-white/50">
            {[...hospitalPartners, ...hospitalPartners, ...hospitalPartners].map((name, i) => (
              <span key={i} className="text-2xl font-black mx-12 uppercase whitespace-nowrap select-none hover:text-white transition-colors duration-500">
                {name}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* 3. ZIG-ZAG FEATURE SECTION */}
      <div className="py-32 space-y-48 container mx-auto px-4 relative z-10">

        {/* FEATURE 1: MASTER MAP */}
        <motion.section
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={staggerContainer}
        >
          <div className="grid lg:grid-cols-2 gap-20 items-center">
            <motion.div variants={fadeInUp}>
              <div className="w-16 h-16 rounded-2xl bg-blue-500/10 flex items-center justify-center mb-8 border border-blue-400/20 text-blue-400 shadow-[0_0_30px_rgba(59,130,246,0.15)] backdrop-blur-md transform -rotate-3">
                <MapIcon size={32} />
              </div>
              <h2 className="text-5xl md:text-6xl font-black mb-6 tracking-tight leading-tight">
                <span className="text-transparent bg-clip-text bg-gradient-to-b from-white to-gray-500">God-Mode</span> <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-400 drop-shadow-lg">Visibility.</span>
              </h2>
              <p className="text-xl text-blue-100 leading-relaxed mb-8">
                The fog of war is gone. Identify critical resources with sub-second latency across 18 unique infrastructure layers.
              </p>
              <ul className="space-y-4 mb-10">
                {["Real-time Availability", "Route Optimization", "Infrastructure Heatmaps"].map((item, i) => (
                  <li key={i} className="flex items-center gap-3 text-lg text-gray-100 font-medium">
                    <div className="w-6 h-6 rounded-full bg-green-500/20 flex items-center justify-center text-green-400 border border-green-500/30"><CheckCircle2 size={12} strokeWidth={3} /></div>
                    {item}
                  </li>
                ))}
              </ul>
              <Link href="/signup" className="group inline-flex items-center gap-2 text-lg font-bold text-blue-400 hover:text-blue-300 transition-colors">
                Explore Master Map <ChevronRight size={20} className="group-hover:translate-x-1 transition-transform" />
              </Link>
            </motion.div>

            <motion.div variants={fadeInUp} className="relative group perspective-1000">
              <div className="absolute -inset-4 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-[2.5rem] blur-[60px] opacity-20 group-hover:opacity-40 transition duration-1000"></div>
              <div className="relative bg-white/5 border border-white/10 rounded-[2rem] p-2 shadow-2xl backdrop-blur-md transform transition-transform duration-700 hover:rotate-1 hover:scale-[1.01]">
                <div className="relative h-[500px] w-full rounded-[1.8rem] overflow-hidden bg-[#0a0a12]/50">
                  <Image
                    src="/v4_map_dashboard.png"
                    alt="Vita Live Map Dashboard"
                    fill
                    className="object-cover transition-transform duration-700 group-hover:scale-105 opacity-90 group-hover:opacity-100"
                  />
                </div>
              </div>
            </motion.div>
          </div>
        </motion.section>

        {/* FEATURE 2: AI Triage */}
        <motion.section
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={staggerContainer}
        >
          <div className="grid lg:grid-cols-2 gap-20 items-center flex-col-reverse lg:flex-row">
            <motion.div variants={fadeInUp} className="relative group perspective-1000 lg:order-1 order-2">
              <div className="absolute -inset-4 bg-gradient-to-r from-purple-500 to-pink-500 rounded-[2.5rem] blur-[60px] opacity-20 group-hover:opacity-40 transition duration-1000"></div>
              <div className="relative bg-white/5 border border-white/10 rounded-[2rem] p-2 shadow-2xl backdrop-blur-md transform transition-transform duration-700 hover:-rotate-1 hover:scale-[1.01]">
                <div className="relative h-[500px] w-full rounded-[1.8rem] overflow-hidden bg-[#0a0a12]/50">
                  <Image
                    src="/v4_ai_assistant.png"
                    alt="Vita AI Assistant"
                    fill
                    className="object-cover transition-transform duration-700 group-hover:scale-105 opacity-90 group-hover:opacity-100"
                  />
                </div>
              </div>
            </motion.div>

            <motion.div variants={fadeInUp} className="lg:order-2 order-1">
              <div className="w-16 h-16 rounded-2xl bg-purple-500/10 flex items-center justify-center mb-8 border border-purple-400/20 text-purple-400 shadow-[0_0_30px_rgba(192,132,252,0.15)] backdrop-blur-md transform rotate-3">
                <Cpu size={32} />
              </div>
              <h2 className="text-5xl md:text-6xl font-black mb-6 tracking-tight leading-tight">
                <span className="text-transparent bg-clip-text bg-gradient-to-b from-white to-gray-500">Neural</span> <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400 drop-shadow-lg">Prediction.</span>
              </h2>
              <p className="text-xl text-purple-100 leading-relaxed mb-8">
                Processing millions of data points to predict shortages and triage patients before they even reach the ER.
              </p>
              <Link href="/signup" className="group inline-flex items-center gap-2 text-lg font-bold text-purple-400 hover:text-purple-300 transition-colors">
                Analyze AI Insights <ChevronRight size={20} className="group-hover:translate-x-1 transition-transform" />
              </Link>
            </motion.div>
          </div>
        </motion.section>


        {/* FEATURE 3: VIBRANT COLOR GRID SECTION WITH EXPANDABLE CARDS */}
        <section
          className="pb-20 relative z-10"
        >
          <div className="text-center max-w-3xl mx-auto mb-10">
            <h2 className="text-4xl md:text-5xl font-black mb-6 text-white drop-shadow-md">The Complete Ecosystem</h2>
            <p className="text-gray-300 text-lg">Connected intelligence for every stakeholder.</p>
          </div>

          <div className="flex flex-col items-center justify-center gap-6 dark">
            <ExpandableCardDemo />
          </div>
        </section>
      </div>

      {/* 4. EMERGENCY ACTION SECTION */}
      <section className="pb-20 px-4 relative z-10">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={fadeInUp}
          className="container mx-auto"
        >
          <div className="relative rounded-[3rem] bg-black/40 border border-red-500/20 overflow-hidden p-12 md:p-24 text-center shadow-[0_0_50px_rgba(220,38,38,0.1)] backdrop-blur-xl">
            <div className="absolute top-[-50%] left-[-20%] w-[800px] h-[800px] bg-red-600/20 blur-[150px] rounded-full animate-pulse mix-blend-screen"></div>
            <div className="absolute bottom-[-50%] right-[-20%] w-[800px] h-[800px] bg-orange-600/20 blur-[150px] rounded-full animate-pulse mix-blend-screen"></div>

            <div className="relative z-10 max-w-4xl mx-auto">
              <h2 className="text-5xl md:text-7xl font-black mb-8 text-white tracking-tighter drop-shadow-2xl">Emergency? <br /> <span className="text-red-500">Don't Wait.</span></h2>
              <p className="text-xl text-gray-100 mb-12 max-w-2xl mx-auto">Skip the login. Trigger the network immediately.</p>

              <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
                <MovingBorderButton
                  borderRadius="1.75rem"
                  className="bg-red-600 text-white border-red-500 font-bold text-xl"
                  containerClassName="h-16 w-60"
                  onClick={() => setIsSOSOpen(true)}
                >
                  <span className="flex items-center gap-2">
                    <Siren className="animate-pulse" size={24} />
                    TRIGGER SOS
                  </span>
                </MovingBorderButton>

                <MovingBorderButton
                  borderRadius="1.75rem"
                  className="bg-white/5 text-white border-white/10 font-bold text-xl backdrop-blur-md"
                  containerClassName="h-16 w-60"
                  onClick={() => setIsChatOpen(true)}
                >
                  <span className="flex items-center gap-2">
                    <MessageSquare size={24} />
                    Chat with AI
                  </span>
                </MovingBorderButton>
              </div>
            </div>
          </div>
        </motion.div>
      </section>

      {/* 5. TESTIMONIALS SECTION */}
      <section className="py-20 relative z-10 overflow-hidden">
        <div className="container mx-auto px-4 mb-10 text-center">
          <h2 className="text-4xl md:text-5xl font-black text-white mb-4">Voices form the Frontlines</h2>
          <p className="text-gray-400 mb-8">Real stories from survivors, doctors, and volunteers.</p>
        </div>

        <TestimonialMarquee />
      </section>

      {/* 5. FOOTER */}
      <footer className="border-t border-white/5 pt-24 pb-12 text-white bg-black/20 backdrop-blur-sm relative z-10">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-12 mb-20 text-center md:text-left">
            <div className="col-span-2">
              <Link href="/" className="text-2xl font-black bg-clip-text text-transparent bg-gradient-to-r from-blue-400 via-indigo-400 to-purple-400 flex items-center justify-center md:justify-start gap-2 tracking-tighter mb-6">
                <div className="relative flex items-center justify-center w-8 h-8 rounded-lg bg-blue-500/20 border border-blue-500/30">
                  <Zap size={20} className="text-blue-400 fill-current" />
                </div>
                VITA
              </Link>
              <p className="text-gray-400 leading-relaxed max-w-sm mx-auto md:mx-0">
                Data-driven emergency response. <br /> Built for the future of healthcare.
              </p>
            </div>
            <div>
              <h4 className="font-bold text-white mb-6">Platform</h4>
              <ul className="space-y-4 text-gray-400 text-sm">
                <li><Link href="/about" className="hover:text-blue-400 transition-colors">About Us</Link></li>
                <li><Link href="/login" className="hover:text-blue-400 transition-colors">Login</Link></li>
                <li><Link href="/signup" className="hover:text-blue-400 transition-colors">Sign Up</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold text-white mb-6">Legal</h4>
              <ul className="space-y-4 text-gray-400 text-sm">
                <li><Link href="/privacy" className="hover:text-blue-400 transition-colors">Privacy Policy</Link></li>
                <li><Link href="/terms" className="hover:text-blue-400 transition-colors">Terms</Link></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-white/5 pt-8 text-center text-gray-500 text-sm">
            &copy; 2026 Vita Emergency Network.
          </div>
        </div>
      </footer>

      <ChatWidget isOpen={isChatOpen} onClose={() => setIsChatOpen(false)} showTrigger={false} />
      <EmergencyButton isOpen={isSOSOpen} onClose={() => setIsSOSOpen(false)} showTrigger={false} />
    </div>
  );
}
