/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  ShieldCheck,
  Smile,
  MessageCircle,
  ChevronRight,
  ChevronLeft,
  Volume2,
  Info,
  Heart,
  Settings2,
  Home,
  School,
  Globe,
  Wifi,
  Users,
  BrainCircuit,
  Lock,
  RotateCcw,
  Sparkles,
  Search,
  CheckCircle2,
  AlertTriangle,
  SendHorizontal,
  Wind,
  MousePointer2
} from 'lucide-react';

/// --- Types & Constants ---

type Section = 'explorar' | 'situacoes' | 'confianca' | 'voz' | 'progresso';
type Category = 'familia' | 'escola' | 'digital' | 'rua' | 'segredo';

interface AvatarConfig {
  skin: string;
  hairStyle: 'short' | 'long' | 'curly' | 'bald';
  hairColor: string;
  clothingColor: string;
}

interface Situation {
  id: number;
  category: Category;
  title: string;
  description: string;
  icon: string;
  questions: string[];
  severity: 'baixa' | 'media' | 'alta';
  advice: string;
}

const SITUATIONS: Situation[] = [
  {
    id: 1,
    category: 'escola',
    title: "O Puxão de Cabelo",
    description: "Um colega puxa seu cabelo bem forte porque quer o brinquedo que você está usando.",
    icon: "👧",
    questions: ["O que você diria para ele?", "Como seu couro cabeludo se sentiu?", "Isso é uma brincadeira?"],
    severity: 'baixa',
    advice: "Trabalhe a comunicação assertiva e o limite da dor física."
  },
  {
    id: 2,
    category: 'familia',
    title: "Beijo na Bochecha",
    description: "Um adulto que você mal conhece quer te dar um beijo no rosto e você não se sente bem.",
    icon: "🏠",
    questions: ["Você é obrigado a dar beijo?", "Que tal um tchau com a mão?", "Como dizer 'no' educadamente?"],
    severity: 'media',
    advice: "Reforce que afeto forçado não é obrigatório, mesmo com conhecidos."
  },
  {
    id: 3,
    category: 'digital',
    title: "Câmera Ligada",
    description: "Alguém em um chat de vídeo pede para você mostrar partes do seu corpo que ficam sob a roupa.",
    icon: "💻",
    questions: ["Isso é seguro?", "Quem está por trás da tela?", "O que fazer com o computador agora?"],
    severity: 'alta',
    advice: "Foco total em segurança digital e privacidade da zona íntima via webcam."
  },
  {
    id: 4,
    category: 'segredo',
    title: "O Presente Secreto",
    description: "Alguém te dá um doce e diz: 'Não conta para a mamãe que a gente fez essa brincadeira'.",
    icon: "🎁",
    questions: ["Existem segredos que dão frio na barriga?", "E se o segredo for ruim?", "Quem você deve procurar?"],
    severity: 'alta',
    advice: "Diferenciação entre surpresas (boas) e segredos (perigosos)."
  },
  {
    id: 5,
    category: 'rua',
    title: "O Caroneiro",
    description: "Alguém para o carro e pede ajuda para achar um cachorrinho, pedindo para você entrar no carro.",
    icon: "🚗",
    questions: ["Crianças devem ajudar adultos sozinhos?", "Qual a distância segura do carro?", "Para onde você correria?"],
    severity: 'alta',
    advice: "Protocolo de segurança com estranhos e manutenção de distância física."
  },
  {
    id: 6,
    category: 'escola',
    title: "O Banheiro",
    description: "Um colega maior tenta entrar na cabine do banheiro enquanto você está usando.",
    icon: "🚽",
    questions: ["O banheiro é um lugar privado?", "O que você gritaria nessa hora?", "Quem é o adulto na escola que ajuda?"],
    severity: 'media',
    advice: "Proteção da intimidade em ambientes coletivos."
  }
];

const STICKERS = [
  { id: 'corpo', label: 'Mestre do Corpo', icon: '🛡️', desc: 'Conheceu todas as zonas de proteção.' },
  { id: 'voz', label: 'Voz de Trovão', icon: '📢', desc: 'Praticou frases de segurança.' },
  { id: 'situacoes', label: 'Escudo Protetor', icon: '✨', desc: 'Resolveu todos os desafios.' },
  { id: 'confianca', label: 'Equipe de Resgate', icon: '🤝', desc: 'Identificou seus ajudantes.' }
];

const PHRASES = [
  "Meu corpo é só meu.",
  "Eu não gosto quando me tocam assim.",
  "Pare com isso agora!",
  "Vou contar para alguém em quem confio.",
  "Não sou obrigado a aceitar carinhos."
];

const SKIN_COLORS = ["#FFDBAC", "#F1C27D", "#E0AC69", "#8D5524"];
const HAIR_COLORS = ["#090806", "#4B352D", "#C4A484", "#A52A2A"];
const CLOTHING_COLORS = ["#6366F1", "#EC4899", "#10B981", "#F59E0B", "#EF4444"];

// --- Audio Utility ---
const speak = (text: string, gender: 'boy' | 'girl' | 'neutral' | null = 'neutral') => {
  if ('speechSynthesis' in window) {
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'pt-BR';
    utterance.rate = 0.95;
    utterance.pitch = gender === 'girl' ? 1.2 : 1.0;
    
    const voices = window.speechSynthesis.getVoices();
    const targetVoice = voices.find(v => {
      const name = v.name.toLowerCase();
      if (gender === 'girl') return name.includes('maria') || name.includes('female') || name.includes('luciana');
      if (gender === 'boy') return name.includes('daniel') || name.includes('male') || name.includes('helio');
      return v.lang === 'pt-BR';
    });
    
    if (targetVoice) utterance.voice = targetVoice;
    window.speechSynthesis.speak(utterance);
  }
};

const playSfx = (type: 'success' | 'click' | 'alert') => {
  const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  
  osc.connect(gain);
  gain.connect(ctx.destination);
  
  if (type === 'success') {
    osc.type = 'sine';
    osc.frequency.setValueAtTime(440, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.2);
    gain.gain.setValueAtTime(0.1, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.3);
    osc.start();
    osc.stop(ctx.currentTime + 0.3);
  } else if (type === 'alert') {
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(220, ctx.currentTime);
    gain.gain.setValueAtTime(0.1, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.1);
    osc.start();
    osc.stop(ctx.currentTime + 0.1);
  } else {
    osc.type = 'sine';
    osc.frequency.setValueAtTime(660, ctx.currentTime);
    gain.gain.setValueAtTime(0.05, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.05);
    osc.start();
    osc.stop(ctx.currentTime + 0.05);
  }
};

// --- Avatar Component ---
const CustomAvatar = ({ config, size = "md", onPartClick }: { config: AvatarConfig, size?: 'sm' | 'md' | 'lg', onPartClick?: (part: string) => void }) => {
  return (
    <div className="relative inline-block">
      <svg 
        viewBox="0 0 200 300" 
        className="drop-shadow-2xl transition-all"
        style={{ 
          width: size === 'sm' ? '100px' : size === 'lg' ? '100%' : '150px',
          maxWidth: size === 'lg' ? '280px' : 'none',
          height: 'auto'
        }}
      >
      <g className="cursor-pointer">
        <rect x="75" y="220" width="20" height="60" fill={config.skin} onClick={() => onPartClick?.("Pernas")} />
        <rect x="105" y="220" width="20" height="60" fill={config.skin} onClick={() => onPartClick?.("Pernas")} />
        <path d="M60 140 Q100 130 140 140 L135 230 L65 230 Z" fill={config.clothingColor} onClick={() => onPartClick?.("Tronco")} />
        <circle cx="100" cy="225" r="15" fill="transparent" onClick={() => onPartClick?.("Zona Íntima")} />
        <rect x="45" y="145" width="15" height="70" fill={config.skin} transform="rotate(10 45 145)" onClick={() => onPartClick?.("Braços")} />
        <rect x="140" y="145" width="15" height="70" fill={config.skin} transform="rotate(-10 155 145)" onClick={() => onPartClick?.("Braços")} />
        <rect x="90" y="125" width="20" height="15" fill={config.skin} />
        <circle cx="100" cy="100" r="40" fill={config.skin} onClick={() => onPartClick?.("Cabeça")} />
        <circle cx="85" cy="95" r="3" fill="#333" />
        <circle cx="115" cy="95" r="3" fill="#333" />
        <path d="M90 115 Q100 125 110 115" fill="none" stroke="#333" strokeWidth="2" />
        {config.hairStyle === 'short' && (
          <path d="M60 90 Q60 50 100 50 Q140 50 140 90 L135 100 Q100 90 65 100 Z" fill={config.hairColor} />
        )}
        {config.hairStyle === 'long' && (
          <path d="M60 90 Q60 40 100 40 Q140 40 140 90 L150 180 Q100 170 50 180 Z" fill={config.hairColor} />
        )}
        {config.hairStyle === 'curly' && (
          <g fill={config.hairColor}>
             <circle cx="70" cy="70" r="15" />
             <circle cx="100" cy="55" r="18" />
             <circle cx="130" cy="70" r="15" />
             <circle cx="65" cy="100" r="12" />
             <circle cx="135" cy="100" r="12" />
          </g>
        )}
      </g>
    </svg>
    </div>
  );
};

// --- Components ---

const ProgressBar = ({ current, total }: { current: number, total: number }) => (
  <div className="w-full bg-slate-100 h-3 rounded-full overflow-hidden flex">
    <motion.div 
      initial={{ width: 0 }}
      animate={{ width: `${(current / total) * 100}%` }}
      className="bg-emerald-500 h-full"
    />
  </div>
);

const StickerCard = ({ sticker, unlocked }: { sticker: typeof STICKERS[0], unlocked: boolean, key?: React.Key }) => (
  <motion.div 
    whileHover={unlocked ? { scale: 1.05 } : {}}
    className={`p-6 rounded-[32px] border-4 flex flex-col items-center text-center gap-3 transition-all ${
      unlocked ? 'bg-white border-emerald-100 shadow-xl' : 'bg-slate-50 border-transparent opacity-40 grayscale'
    }`}
  >
    <span className="text-6xl mb-2">{sticker.icon}</span>
    <h4 className="font-bold text-slate-800 leading-none">{sticker.label}</h4>
    <p className="text-[10px] uppercase font-black tracking-widest text-slate-400">{sticker.desc}</p>
    {unlocked && (
      <div className="mt-2 bg-emerald-500 text-white p-1 rounded-full">
        <CheckCircle2 size={16} />
      </div>
    )}
  </motion.div>
);

const CompleteButton = ({ onClick, unlocked, label }: { onClick: () => void, unlocked: boolean, label: string }) => (
  <button 
    onClick={unlocked ? undefined : onClick}
    className={`w-full py-6 rounded-[35px] font-black uppercase tracking-widest text-sm transition-all flex items-center justify-center gap-3 shadow-xl ${
      unlocked 
      ? 'bg-emerald-500 text-white shadow-emerald-200 cursor-default' 
      : 'bg-indigo-600 text-white hover:bg-indigo-700 hover:scale-[1.02] active:scale-[0.98]'
    }`}
  >
    {unlocked ? <CheckCircle2 size={24} /> : <Sparkles size={24} />}
    {unlocked ? "Missão Concluída!" : label}
  </button>
);

export default function App() {
  const [activeTab, setActiveTab] = useState<Section>('explorar');
  const [isProfessionalMode, setIsProfessionalMode] = useState(false);
  const [gender, setGender] = useState<'boy' | 'girl' | 'neutral' | null>(null);
  const [isCustomizing, setIsCustomizing] = useState(false);
  const [avatar, setAvatar] = useState<AvatarConfig>({
    skin: SKIN_COLORS[0],
    hairStyle: 'short',
    hairColor: HAIR_COLORS[0],
    clothingColor: CLOTHING_COLORS[0]
  });

  const [currentSituationIdx, setCurrentSituationIdx] = useState(0);
  const [sessionLog, setSessionLog] = useState<{scenario: string, reaction: number}[]>([]);
  const [unlockedStickers, setUnlockedStickers] = useState<string[]>([]);
  const [selectedHelpers, setSelectedHelpers] = useState<string[]>([]);
  const [voicePower, setVoicePower] = useState(0);
  const [activePart, setActivePart] = useState<string | null>(null);

  // Computed Progress
  const progressPercent = useMemo(() => {
    let score = 0;
    if (gender) score += 10;
    score += (sessionLog.length / SITUATIONS.length) * 50;
    score += (selectedHelpers.length > 0 ? 20 : 0);
    score += (voicePower >= 100 ? 20 : 0);
    return Math.min(score, 100);
  }, [gender, sessionLog, selectedHelpers, voicePower]);


  const handleReaction = (n: number) => {
    playSfx(n === 3 ? 'alert' : 'click');
    const existing = sessionLog.findIndex(l => l.scenario === SITUATIONS[currentSituationIdx].title);
    if (existing !== -1) {
      const newLog = [...sessionLog];
      newLog[existing].reaction = n;
      setSessionLog(newLog);
    } else {
      setSessionLog([...sessionLog, { scenario: SITUATIONS[currentSituationIdx].title, reaction: n }]);
    }
  };

  const toggleHelper = (id: string) => {
    playSfx('click');
    setSelectedHelpers(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  };

  const handleReset = () => {
    if (window.confirm("Deseja reiniciar a missão do zero?")) {
      setGender(null);
      setIsCustomizing(false);
      setActiveTab('explorar');
      setSessionLog([]);
      setUnlockedStickers([]);
      setSelectedHelpers([]);
      setVoicePower(0);
      playSfx('click');
    }
  };

  return (
    <div className="min-h-screen bg-[#F8F9FA] text-slate-900 font-sans flex flex-col md:flex-row h-screen overflow-hidden">
      
      {/* Side Navigation for Tablet/Desktop */}
      <aside className="w-24 bg-white border-r border-slate-100 flex flex-col items-center py-10 gap-8 hidden md:flex">
         <div className="w-14 h-14 bg-indigo-600 rounded-2xl flex items-center justify-center text-white shadow-xl shadow-indigo-200 mb-4">
           <ShieldCheck size={30} />
         </div>
         {[
           { id: 'explorar', icon: <Home size={22}/>, label: 'Início' },
           { id: 'situacoes', icon: <Search size={22}/>, label: 'Treino' },
           { id: 'confianca', icon: <Users size={22}/>, label: 'Equipe' },
           { id: 'voz', icon: <Volume2 size={22}/>, label: 'Voz' },
           { id: 'progresso', icon: <Sparkles size={22}/>, label: 'Selo' }
         ].map(item => (
           <button 
            key={item.id}
            onClick={() => { setActiveTab(item.id as any); playSfx('click'); }}
            className={`flex flex-col items-center gap-1 p-3 rounded-2xl transition-all ${
              activeTab === item.id ? 'bg-indigo-50 text-indigo-600' : 'text-slate-300 hover:text-slate-500'
            }`}
           >
             {item.icon}
             <span className="text-[8px] font-black uppercase tracking-tighter">{item.label}</span>
           </button>
         ))}
         <div className="mt-auto flex flex-col gap-4">
            <button 
              onClick={handleReset}
              title="Reiniciar Missão"
              className="p-3 bg-rose-50 text-rose-500 rounded-2xl hover:bg-rose-100 transition-all"
            >
              <RotateCcw size={22} />
            </button>
            <button 
              onClick={() => { setIsProfessionalMode(!isProfessionalMode); playSfx('click'); }}
              className={`p-3 rounded-2xl transition-all ${isProfessionalMode ? 'bg-amber-100 text-amber-600' : 'bg-slate-50 text-slate-300'}`}
            >
              <Settings2 size={22} />
            </button>
         </div>
      </aside>

      {/* Main Experience Wrapper */}
      <main className={`flex-1 flex flex-col transition-all duration-700 bg-white shadow-inner ${isProfessionalMode ? 'md:mr-[400px]' : ''}`}>
        
        {/* App Bar */}
        <header className="px-6 md:px-8 py-6 flex flex-col md:flex-row items-start md:items-center gap-4 md:gap-0 justify-between">
           <div className="flex flex-col">
              <h2 className="font-black text-2xl tracking-tight text-slate-900">
                {activeTab === 'explorar' && "Meu Castelo de Proteção"}
                {activeTab === 'situacoes' && "Desafios de Segurança"}
                {activeTab === 'confianca' && "Minha Rede de Apoio"}
                {activeTab === 'voz' && "Laboratório de Voz"}
                {activeTab === 'progresso' && "Minha Coleção de Selos"}
              </h2>
              <div className="flex items-center gap-3 mt-2">
                 <div className="w-48 h-2 bg-slate-100 rounded-full overflow-hidden">
                    <motion.div animate={{ width: `${progressPercent}%` }} className="h-full bg-emerald-500" />
                 </div>
                 <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{progressPercent.toFixed(0)}% Completo</span>
              </div>
           </div>

           <div className="flex items-center gap-2 px-4 py-2 bg-indigo-50 text-indigo-600 rounded-full text-[10px] md:text-xs font-bold self-start md:self-auto">
              <Sparkles size={14} />
              {unlockedStickers.length} Selos Ganhos
           </div>
        </header>

        {/* View Surface */}
        <div className="flex-1 overflow-y-auto px-4 md:px-16 py-4 pb-48 md:pb-32">
          <AnimatePresence mode="wait">
            {!gender ? (
              <motion.div key="intro" className="max-w-2xl mx-auto py-12 space-y-12">
                <div className="text-center space-y-4">
                  <h3 className="text-4xl font-black italic text-indigo-900 tracking-tight leading-tight">Olá, Pequeno Herói!</h3>
                  <p className="text-lg text-slate-500 font-medium">Escolha seu personagem para começar a missão:</p>
                </div>
                <div className="flex flex-wrap justify-center gap-4 md:gap-8">
                  {[
                    { id: 'boy', icon: '👦', label: 'Herói' },
                    { id: 'girl', icon: '👧', label: 'Heroína' }
                  ].map(t => (
                    <button 
                      key={t.id} 
                      onClick={() => { 
                        setGender(t.id as any); 
                        setIsCustomizing(true);
                        playSfx('success'); 
                      }} 
                      className="group flex flex-col items-center gap-4"
                    >
                      <div className="w-32 h-32 md:w-40 md:h-40 bg-white rounded-[40px] md:rounded-[50px] flex items-center justify-center text-6xl md:text-7xl group-hover:scale-110 group-hover:rotate-3 group-hover:bg-indigo-50 group-hover:shadow-xl transition-all border-4 border-slate-100 hover:border-indigo-200">
                         {t.icon}
                      </div>
                      <span className="font-black uppercase tracking-widest text-xs text-slate-400 group-hover:text-indigo-600">{t.label}</span>
                    </button>
                  ))}
                </div>
              </motion.div>
            ) : isCustomizing ? (
              <motion.div key="customize" className="w-full max-w-4xl mx-auto py-4 md:py-8">
                <div className="flex flex-col md:flex-row gap-8 md:gap-12 items-center w-full">
                  <div className="bg-slate-50 p-4 md:p-12 rounded-[40px] md:rounded-[64px] border-4 border-slate-100 shadow-inner w-full md:w-1/2 flex justify-center">
                    <div className="w-40 md:w-full flex justify-center">
                      <CustomAvatar config={avatar} size="lg" />
                    </div>
                  </div>
                  
                  <div className="flex-1 space-y-6 md:space-y-8 w-full">
                    <h3 className="text-3xl font-black text-slate-800 text-center md:text-left">Monte seu Herói</h3>
                    
                    <div className="space-y-4">
                      <p className="text-xs font-black uppercase tracking-widest text-slate-400">Tom de Pele</p>
                      <div className="flex flex-wrap gap-3">
                        {SKIN_COLORS.map(c => (
                          <button key={c} onClick={() => setAvatar({...avatar, skin: c})} className={`w-10 h-10 rounded-full border-4 ${avatar.skin === c ? 'border-indigo-600' : 'border-white'}`} style={{backgroundColor: c}} />
                        ))}
                      </div>
                    </div>

                    <div className="space-y-4">
                      <p className="text-xs font-black uppercase tracking-widest text-slate-400">Cabelo</p>
                      <div className="flex flex-wrap gap-3">
                        {['short', 'long', 'curly', 'bald'].map(s => (
                          <button key={s} onClick={() => setAvatar({...avatar, hairStyle: s as any})} className={`px-4 py-2 rounded-xl border-2 font-bold text-xs ${avatar.hairStyle === s ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-white text-slate-400 border-slate-100'}`}>
                            {s === 'short' ? 'Curto' : s === 'long' ? 'Longo' : s === 'curly' ? 'Cacheado' : 'Sem Cabelo'}
                          </button>
                        ))}
                      </div>
                      <div className="flex flex-wrap gap-3 mt-2">
                        {HAIR_COLORS.map(c => (
                          <button key={c} onClick={() => setAvatar({...avatar, hairColor: c})} className={`w-8 h-8 rounded-full border-4 ${avatar.hairColor === c ? 'border-indigo-600' : 'border-white'}`} style={{backgroundColor: c}} />
                        ))}
                      </div>
                    </div>

                    <div className="space-y-4">
                      <p className="text-xs font-black uppercase tracking-widest text-slate-400">Cor da Roupa</p>
                      <div className="flex flex-wrap gap-3">
                        {CLOTHING_COLORS.map(c => (
                          <button key={c} onClick={() => setAvatar({...avatar, clothingColor: c})} className={`w-10 h-10 rounded-full border-4 ${avatar.clothingColor === c ? 'border-indigo-600' : 'border-white'}`} style={{backgroundColor: c}} />
                        ))}
                      </div>
                    </div>

                    <button 
                      onClick={() => { setIsCustomizing(false); playSfx('success'); speak("Uniforme pronto! Missão iniciada!", gender); }}
                      className="w-full py-5 bg-indigo-600 text-white rounded-[32px] font-black uppercase tracking-widest hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-200"
                    >
                      Começar Missão!
                    </button>
                  </div>
                </div>
              </motion.div>
            ) : (
              <motion.div 
                key={activeTab}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="h-full"
              >
                {activeTab === 'explorar' && (
                  <div className="grid lg:grid-cols-2 gap-8 md:gap-12 items-center h-full">
                    <div className="space-y-6 md:space-y-8">
                      <div className="relative group w-full flex justify-center">
                        <div className="absolute -inset-4 bg-indigo-500/10 rounded-[64px] blur-2xl group-hover:bg-indigo-500/20 transition-all" />
                        <div className="relative bg-white p-4 md:p-12 rounded-[40px] md:rounded-[64px] border-4 border-slate-50 shadow-xl w-full flex justify-center">
                          <div className="w-40 md:w-full flex justify-center">
                            <CustomAvatar 
                              config={avatar} 
                              size="lg" 
                              onPartClick={(part) => {
                                setActivePart(part);
                                playSfx('click');
                              }} 
                            />
                          </div>
                        </div>
                      </div>

                      <div className="bg-slate-50 p-8 rounded-[40px] border-2 border-slate-100 min-h-[140px] flex items-center justify-center text-center">
                        {activePart ? (
                          <div className="space-y-2 animate-in fade-in slide-in-from-bottom-4">
                            <h4 className="text-2xl font-black text-indigo-600">{activePart}</h4>
                            <p className="text-slate-500 font-medium">Clique em outra parte para aprender mais!</p>
                          </div>
                        ) : (
                          <div className="space-y-2 text-slate-400">
                             <MousePointer2 size={32} className="mx-auto mb-2 opacity-20" />
                             <p className="font-bold uppercase tracking-widest text-xs">Toque no personagem para explorar</p>
                          </div>
                        )}
                      </div>
                    </div>
                    
                    <div className="space-y-8">
                       <div className="p-8 bg-indigo-600 rounded-[50px] text-white space-y-4 shadow-2xl shadow-indigo-200 relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16 blur-3xl" />
                        <h4 className="text-3xl font-black tracking-tight">O Castelo do Seu Corpo</h4>
                        <p className="text-indigo-100 font-medium leading-relaxed">
                          Seu corpo é um castelo precioso. Você é quem decide quem pode entrar nas salas! As partes sob a roupa de banho são as salas secretas que só você cuida.
                        </p>
                      </div>

                      <div className="grid gap-4">
                        {[
                          { id: 'public', icon: '🤲', title: 'Portão de Entrada', desc: 'Mãos e rosto. Coisas que fazemos no público.', color: 'bg-emerald-500' },
                          { id: 'personal', icon: '🫂', title: 'Jardim Privado', desc: 'Abraços e carinhos de quem amamos.', color: 'bg-amber-400' },
                          { id: 'secret', icon: '🔒', title: 'Sala Secreta', desc: 'Sua zona íntima. Ninguém pode entrar.', color: 'bg-rose-500' }
                        ].map(z => (
                          <motion.div 
                            key={z.id} 
                            whileHover={{ x: 10 }} 
                            onClick={() => { playSfx('click'); }}
                            className="p-6 bg-slate-50 rounded-[32px] border-2 border-transparent hover:border-indigo-100 hover:bg-white flex items-center gap-6 cursor-pointer group"
                          >
                            <span className="text-5xl group-hover:scale-110 transition-all">{z.icon}</span>
                            <div className="flex-1">
                               <div className="flex items-center justify-between">
                                 <h5 className="font-black text-slate-800 uppercase tracking-widest text-[10px]">{z.title}</h5>
                                 <Volume2 size={14} className="text-slate-300 group-hover:text-indigo-500" />
                               </div>
                               <p className="font-medium text-slate-500">{z.desc}</p>
                            </div>
                          </motion.div>
                        ))}
                      </div>
                      <div className="pt-8">
                         <CompleteButton 
                           label="Concluir Exploração do Castelo"
                           unlocked={unlockedStickers.includes('corpo')}
                           onClick={() => { setUnlockedStickers(prev => [...prev, 'corpo']); playSfx('success'); }}
                         />
                      </div>
                    </div>
                  </div>
                )}


                {activeTab === 'situacoes' && (
                  <div className="w-full max-w-4xl mx-auto flex flex-col gap-8">
                     <div className="flex items-center gap-4">
                        <div className="flex-1 h-3 bg-slate-100 rounded-full overflow-hidden">
                           <motion.div animate={{ width: `${((currentSituationIdx + 1) / SITUATIONS.length) * 100}%` }} className="h-full bg-indigo-500" />
                        </div>
                        <span className="font-black text-slate-300 text-xs">CENÁRIO {currentSituationIdx + 1} / {SITUATIONS.length}</span>
                     </div>

                     <motion.div 
                        key={currentSituationIdx}
                        initial={{ opacity: 0, scale: 0.98 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="bg-white border-4 border-slate-50 rounded-[40px] md:rounded-[50px] p-6 md:p-12 shadow-2xl relative w-full"
                     >
                       <div className="grid md:grid-cols-2 gap-8 md:gap-16 items-center">
                          <div className="space-y-8">
                             <div className="w-32 h-32 bg-slate-50 rounded-full flex items-center justify-center text-7xl shadow-inner mb-6">
                               {SITUATIONS[currentSituationIdx].icon}
                             </div>
                             <div className="space-y-4">
                                <div className="flex items-center gap-3">
                                  <h3 className="text-4xl font-black text-slate-900 tracking-tight leading-tight">{SITUATIONS[currentSituationIdx].title}</h3>
                                </div>
                                <p className="text-2xl text-slate-500 font-medium leading-relaxed italic border-l-8 border-indigo-100 pl-8">
                                  "{SITUATIONS[currentSituationIdx].description}"
                                </p>
                             </div>
                             
                             <div className="space-y-4 pt-10">
                                <p className="font-black text-xs uppercase tracking-widest text-slate-400">Isso é adequado ou te deixa estranho?</p>
                                <div className="grid grid-cols-3 gap-2 md:gap-4">
                                  {[
                                    { n: 1, label: 'Legal!', icon: '✅', color: 'emerald' },
                                    { n: 2, label: 'Estranho...', icon: '🤔', color: 'amber' },
                                    { n: 3, label: 'MAL!', icon: '🛡️', color: 'rose' }
                                  ].map(r => {
                                    const active = sessionLog.find(l => l.scenario === SITUATIONS[currentSituationIdx].title)?.reaction === r.n;
                                    return (
                                      <button 
                                        key={r.n}
                                        onClick={() => handleReaction(r.n)}
                                        className={`flex-1 p-3 md:p-6 rounded-3xl border-4 transition-all flex flex-col items-center gap-2 ${
                                          active ? `bg-${r.color}-50 border-${r.color}-400 text-${r.color}-600 scale-105 shadow-lg` : 'bg-slate-50 border-transparent opacity-60'
                                        }`}
                                      >
                                        <span className="text-xl md:text-3xl">{r.icon}</span>
                                        <span className="font-black text-[8px] md:text-[10px] uppercase">{r.label}</span>
                                      </button>
                                    );
                                  })}
                                </div>
                             </div>
                          </div>

                          <div className="bg-indigo-50 border-2 border-indigo-100 rounded-[40px] p-10 space-y-8">
                             <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-indigo-500 rounded-xl flex items-center justify-center text-white"><Info size={20}/></div>
                                <span className="font-black uppercase tracking-widest text-xs text-indigo-900">Perguntas para Pensar</span>
                             </div>
                             <ul className="space-y-6">
                               {SITUATIONS[currentSituationIdx].questions.map((q, i) => (
                                 <li 
                                  key={i} 
                                  className="flex gap-4 bg-white p-6 rounded-3xl border border-indigo-100 shadow-sm font-bold text-slate-700 leading-tight transition-all group"
                                 >
                                   <span className="w-6 h-6 bg-indigo-100 rounded-full flex items-center justify-center text-[10px] font-black text-indigo-600 shrink-0 group-hover:bg-indigo-500 group-hover:text-white">{i+1}</span>
                                   <span className="flex-1">{q}</span>
                                 </li>
                               ))}
                             </ul>
                          </div>
                       </div>

                       <div className="flex justify-between items-center mt-16 pt-10 border-t border-slate-50">
                          <button 
                            disabled={currentSituationIdx === 0}
                            onClick={() => { setCurrentSituationIdx(s => s - 1); playSfx('click'); }}
                            className="text-slate-300 hover:text-slate-600 font-black uppercase text-[10px] tracking-[0.2em] transition-all"
                          >
                           Voltar Cenário
                          </button>
                          <button 
                            disabled={currentSituationIdx === SITUATIONS.length - 1}
                            onClick={() => { setCurrentSituationIdx(s => s + 1); playSfx('click'); }}
                            className="bg-emerald-500 text-white px-12 py-5 rounded-full font-black uppercase tracking-widest text-xs shadow-xl shadow-emerald-500/30 hover:scale-105 transition-all flex items-center gap-3"
                          >
                            Próximo Desafio <ChevronRight size={20}/>
                          </button>
                       </div>

                       {currentSituationIdx === SITUATIONS.length - 1 && (
                         <div className="mt-12 pt-10 border-t border-slate-50">
                            <CompleteButton 
                              label="Finalizar Todos os Desafios"
                              unlocked={unlockedStickers.includes('situacoes')}
                              onClick={() => { 
                                if (sessionLog.length < SITUATIONS.length) {
                                  alert("Por favor, responda a todos os desafios antes de concluir!");
                                } else {
                                  setUnlockedStickers(prev => [...prev, 'situacoes']); 
                                  playSfx('success'); 
                                }
                              }}
                            />
                         </div>
                       )}
                     </motion.div>
                  </div>
                )}

                {activeTab === 'confianca' && (
                  <div className="w-full max-w-4xl mx-auto space-y-8 md:space-y-12">
                    <div className="text-center space-y-4">
                       <h3 className="text-4xl font-black text-slate-900">Minha Equipe de Resgate</h3>
                       <p className="text-lg text-slate-400 font-medium">Se você se sentir inseguro, quem são os ajudantes que você pode chamar?</p>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-6">
                      {[
                        { id: 'mae', label: 'Mamãe', icon: '👩‍🦰' },
                        { id: 'pai', label: 'Papai', icon: '🧔' },
                        { id: 'vovo', label: 'Vovô/Vovó', icon: '👵' },
                        { id: 'pro', label: 'Professor(a)', icon: '👩‍🏫' },
                        { id: 'policia', label: 'Polícia/190', icon: '👮' },
                        { id: 'to', label: 'Minha TO', icon: '👩‍⚕️' },
                        { id: 'vizinho', label: 'Vizinho', icon: '🏘️' },
                        { id: 'irmao', label: 'Irmão/Irmã', icon: '🧑' },
                        { id: 'tio', label: 'Tio/Tia', icon: '🧑‍🦰' },
                        { id: 'amigo', label: 'Melhor Amigo', icon: '🧒' }
                      ].map(h => {
                        const active = selectedHelpers.includes(h.id);
                        return (
                          <button 
                            key={h.id}
                            onClick={() => toggleHelper(h.id)}
                            className={`flex flex-col items-center gap-4 p-4 md:p-8 rounded-[30px] md:rounded-[40px] border-4 transition-all ${
                              active ? 'bg-indigo-50 border-indigo-500 scale-105 shadow-xl' : 'bg-white border-slate-50 grayscale opacity-60 hover:grayscale-0 hover:opacity-100 shadow-sm'
                            }`}
                          >
                            <span className="text-6xl">{h.icon}</span>
                            <span className="font-black text-[10px] uppercase text-slate-600">{h.label}</span>
                          </button>
                        );
                      })}
                    </div>

                    <div className="p-6 md:p-10 bg-indigo-600 rounded-[40px] md:rounded-[50px] text-white flex flex-col md:flex-row items-center md:items-start text-center md:text-left gap-6 md:gap-8 shadow-2xl w-full">
                       <div className="w-24 h-24 bg-white/20 rounded-full flex items-center justify-center text-4xl shrink-0">🤝</div>
                       <div className="space-y-2">
                         <h4 className="text-2xl font-black italic">Você já tem {selectedHelpers.length} heróis na sua equipe!</h4>
                         <p className="text-indigo-100 font-medium">Lembre-se: em casos de perigo, conte para qualquer um deles até que alguém escute você de verdade.</p>
                       </div>
                    </div>

                    <div className="max-w-xl mx-auto w-full pt-12">
                       <CompleteButton 
                         label="Confirmar Meus Ajudantes"
                         unlocked={unlockedStickers.includes('confianca')}
                         onClick={() => { 
                           if (selectedHelpers.length < 3) {
                             alert("Escolha pelo menos 3 heróis para sua equipe de resgate!");
                           } else {
                             setUnlockedStickers(prev => [...prev, 'confianca']); 
                             playSfx('success'); 
                           }
                         }}
                       />
                    </div>
                  </div>
                )}

                {activeTab === 'voz' && (
                  <div className="w-full max-w-3xl mx-auto space-y-8 md:space-y-12 h-full flex flex-col justify-center">
                    <div className="text-center space-y-4">
                       <h3 className="text-5xl font-black text-slate-900 leading-none">Minha Voz é Escudo!</h3>
                       <p className="text-slate-400 font-bold text-lg">Clique nas frases para soltar sua voz de super-herói. Quanto mais clicar, mais forte o escudo fica!</p>
                    </div>

                    <div className="grid gap-4">
                      {PHRASES.map((p, i) => (
                        <motion.button 
                          key={i}
                          whileHover={{ x: 20 }}
                          onClick={() => { 
                            setVoicePower(prev => Math.min(prev + 20, 100));
                            speak(p, gender);
                            playSfx('click');
                          }}
                          className="w-full flex items-center justify-between p-5 md:p-8 bg-white border-2 border-slate-100 rounded-3xl md:rounded-[35px] hover:border-indigo-400 hover:bg-indigo-50 transition-all text-left shadow-md group"
                        >
                          <span className="text-lg md:text-2xl font-black text-slate-800 tracking-tight group-hover:text-indigo-600">{p}</span>
                          <div className="p-3 md:p-4 bg-slate-50 text-slate-300 rounded-2xl group-hover:bg-indigo-500 group-hover:text-white transition-all transform group-hover:rotate-12">
                            <Volume2 size={24} className="md:w-[30px] md:h-[30px]" />
                          </div>
                        </motion.button>
                      ))}
                    </div>

                    <div className="space-y-4">
                       <div className="flex justify-between items-end">
                         <span className="font-black text-xs uppercase tracking-widest text-slate-400">Poder da Voz</span>
                         <span className="font-black text-3xl text-indigo-600 italic">{voicePower}%</span>
                       </div>
                       <div className="w-full h-10 bg-slate-100 rounded-full border-4 border-white shadow-inner p-1 overflow-hidden">
                          <motion.div animate={{ width: `${voicePower}%` }} className="h-full bg-indigo-500 rounded-full shadow-[0_0_20px_rgba(99,102,241,0.5)]" />
                       </div>
                    </div>

                    <div className="pt-12 max-w-xl mx-auto w-full">
                       <CompleteButton 
                         label="Liberar Escudo de Voz"
                         unlocked={unlockedStickers.includes('voz')}
                         onClick={() => { 
                           if (voicePower < 100) {
                             alert("Pratique mais as frases para carregar seu escudo!");
                           } else {
                             setUnlockedStickers(prev => [...prev, 'voz']); 
                             playSfx('success'); 
                           }
                         }}
                       />
                    </div>
                  </div>
                )}

                {activeTab === 'progresso' && (
                   <div className="w-full max-w-4xl mx-auto space-y-8 md:space-y-12">
                     <div className="text-center space-y-4">
                        <h3 className="text-5xl font-black text-slate-900">Minha Coleção</h3>
                        <p className="text-slate-400 font-bold text-lg">Aqui estão os selos de herói que você conquistou na sessão de hoje.</p>
                     </div>

                     <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
                       {STICKERS.map(s => (
                         <StickerCard key={s.id} sticker={s} unlocked={unlockedStickers.includes(s.id)} />
                       ))}
                     </div>

                     {unlockedStickers.length === STICKERS.length && (
                       <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="p-6 md:p-12 bg-emerald-500 rounded-[40px] md:rounded-[60px] text-white text-center space-y-6 md:space-y-8 shadow-2xl shadow-emerald-200 w-full">
                          <div className="text-9xl">🏆</div>
                          <h4 className="text-4xl font-black leading-tight">Parabéns, Guardião de Defesa!</h4>
                          <p className="text-xl font-medium opacity-90 max-w-xl mx-auto">Você completou todos os módulos e agora tem os conhecimentos necessários para cuidar bem do seu corpo.</p>
                          <button onClick={() => window.print()} className="bg-white text-emerald-600 px-10 py-5 rounded-full font-black uppercase text-sm shadow-xl hover:scale-105 transition-all">Imprimir Certificado</button>
                       </motion.div>
                     )}
                   </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Floating Mobile/Static Nav Overlay */}
        {gender && (
          <div className="fixed bottom-4 left-1/2 -translate-x-1/2 w-[95%] md:hidden bg-white/90 backdrop-blur-2xl border border-slate-100 p-2 rounded-[30px] shadow-[0_20px_40px_rgba(0,0,0,0.15)] z-[100] flex gap-1">
              {[
                { id: 'explorar', icon: <Home size={18}/> },
                { id: 'situacoes', icon: <Search size={18}/> },
                { id: 'confianca', icon: <Users size={18}/> },
                { id: 'voz', icon: <Volume2 size={18}/> },
                { id: 'progresso', icon: <Sparkles size={18}/> }
              ].map(item => (
                <button 
                  key={item.id}
                  onClick={() => { setActiveTab(item.id as any); playSfx('click'); }}
                  className={`flex-1 p-4 rounded-[32px] transition-all flex items-center justify-center ${
                    activeTab === item.id ? 'bg-indigo-600 text-white' : 'text-slate-300'
                  }`}
                >
                  {item.icon}
                </button>
              ))}
          </div>
        )}
      </main>

      {/* Professional Dashboard (Fixed Desktop Layout) */}
      <AnimatePresence>
        {isProfessionalMode && (
          <motion.aside
            initial={{ opacity: 0, x: 100 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 100 }}
            className="fixed right-0 top-0 bottom-0 w-full md:w-[400px] bg-[#14151a] text-slate-100 shadow-2xl z-[150] flex flex-col p-8 overflow-y-auto"
          >
             <div className="flex items-center justify-between mb-10 pb-6 border-b border-slate-800">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-amber-500 rounded-lg text-white"><BrainCircuit size={18}/></div>
                  <h4 className="font-black text-[10px] uppercase tracking-widest text-slate-400">Dashboard Terapêutica</h4>
                </div>
                <button 
                  onClick={() => setIsProfessionalMode(false)}
                  className="text-slate-500 hover:text-white"
                >
                  <ChevronRight size={24}/>
                </button>
             </div>

             <div className="space-y-10">
                <section className="space-y-4">
                   <h5 className="text-[10px] uppercase font-black text-slate-600 tracking-[0.2em]">Foco da Sessão</h5>
                   <div className="bg-slate-900 rounded-[30px] p-6 border border-slate-800 flex items-start gap-4">
                      <div className="p-2 rounded-full bg-indigo-500/10 text-indigo-400"><Info size={16}/></div>
                      <p className="text-sm font-medium leading-relaxed italic text-slate-400">
                         {activeTab === 'explorar' && "Observe se a criança demonstra dificuldades em reconhecer a zona pessoal vs íntima."}
                         {activeTab === 'situacoes' && `Situação atual: ${SITUATIONS[currentSituationIdx].advice}`}
                         {activeTab === 'confianca' && "Incentive a criança a escolher ajudantes da casa e de fora da casa (escola/terapia)."}
                         {activeTab === 'voz' && "Avalie a projeção e segurança da fala. O treino de repetição ajuda na quebra do congelamento."}
                         {activeTab === 'progresso' && "Valide os selos como 'conquistas de segurança'."}
                       </p>
                    </div>
                 </section>

                 <section className="space-y-4">
                    <div className="flex items-center justify-between">
                       <h5 className="text-[10px] uppercase font-black text-slate-600 tracking-[0.2em]">Diretrizes Terapêuticas</h5>
                       <Sparkles size={14} className="text-indigo-400" />
                    </div>
                    <div className="bg-emerald-900/10 border border-emerald-900/20 rounded-[30px] p-6">
                        <p className="text-xs text-slate-400 leading-relaxed">
                          {activeTab === 'situacoes' ? SITUATIONS[currentSituationIdx].advice : "Utilize o app como mediador lúdico para que a criança externalize sentimentos sobre limites corporais."}
                        </p>
                    </div>
                 </section>

                 <section className="space-y-4">
                    <h5 className="text-[10px] uppercase font-black text-slate-600 tracking-[0.2em]">Anotações Clínicas</h5>
                    <textarea className="w-full h-32 bg-slate-900 border border-slate-800 rounded-[25px] p-4 text-xs focus:ring-1 ring-emerald-500 outline-none text-slate-300 placeholder:text-slate-700" placeholder="Registrar observações comportamentais..." />
                 </section>

                 <section className="space-y-4 pt-4">
                    <h5 className="text-[10px] uppercase font-black text-slate-600 tracking-[0.2em]">Sessão Report (Sumário)</h5>
                    <div className="grid gap-2">
                       <div className="bg-slate-900/50 p-4 rounded-2xl flex justify-between text-[11px] font-bold">
                          <span className="text-slate-500">Situações Respondidas</span>
                          <span className="text-indigo-400">{sessionLog.length} / {SITUATIONS.length}</span>
                       </div>
                       <div className="bg-slate-900/50 p-4 rounded-2xl flex justify-between text-[11px] font-bold">
                          <span className="text-slate-500">Poder de Voz</span>
                          <span className="text-indigo-400">{voicePower}%</span>
                       </div>
                       <div className="bg-slate-900/50 p-4 rounded-2xl flex justify-between text-[11px] font-bold">
                          <span className="text-slate-500">Ajudantes Selecionados</span>
                          <span className="text-indigo-400">{selectedHelpers.length}</span>
                       </div>
                    </div>
                    <button 
                     onClick={() => {
                         const report = `RELATÓRIO DE SESSÃO - CORPO E LIMITES\n\nGênero: ${gender}\nCustomização: ${JSON.stringify(avatar)}\nSituações Resolvidas: ${sessionLog.length}\nRespostas detalhadas: ${JSON.stringify(sessionLog)}\nHeróis de Confiança: ${selectedHelpers.join(', ')}\nProgresso Total: ${progressPercent.toFixed(0)}%`;
                         const blob = new Blob([report], {type: 'text/plain'});
                         const url = URL.createObjectURL(blob);
                         const a = document.createElement('a');
                         a.href = url;
                         a.download = `relatorio-${new Date().toISOString().split('T')[0]}.txt`;
                         a.click();
                     }}
                     className="w-full py-4 border border-slate-800 rounded-[25px] font-black text-[10px] uppercase tracking-widest text-slate-500 hover:text-white hover:bg-slate-800"
                    >
                      Exportar Evolução (TXT)
                    </button>
                 </section>
             </div>
          </motion.aside>
        )}
      </AnimatePresence>

    </div>
  );
}
