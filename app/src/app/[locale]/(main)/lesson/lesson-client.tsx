"use client";
import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { motion, AnimatePresence } from "framer-motion";
import { updateUserProgress } from "./actions";
import { Flag, Loader2, CheckCircle2, Globe } from "lucide-react";
import { toast } from "sonner";

function normalizeAnswer(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/\s+/g, " ")
    .replace(/ß/g, "ss")
    .replace(/ä/g, "ae")
    .replace(/ö/g, "oe")
    .replace(/ü/g, "ue")
    .replace(/[^a-z0-9\s-]/g, "");
}

type Question = {
  verbId: string;
  infinitive: string;
  case: string;
  preposition: string;
  translation: string | null;
  text: string;
  verbAnswer: string;
  prepAnswer: string;
  verbOptions: string[];
  sentenceTranslation: string | null;
  sentenceId: string;
  nativeTranslation: string | null;
};

export function LessonClient({ 
  questions: initialQuestions, 
  allPrepositions,
  isAdmin,
  t
}: { 
  questions: Question[], 
  allPrepositions: string[],
  isAdmin: boolean,
  t: any 
}) {
  const router = useRouter();
  
  // Initialize queue with IDs to track them through retries
  const [queue, setQueue] = useState<(Question & { id: number })[]>(() => 
    initialQuestions.map((q, idx) => ({ ...q, id: idx }))
  );
  
  const [currentIndex, setCurrentIndex] = useState(0);
  const [completedIds, setCompletedIds] = useState<Set<number>>(new Set());
  const [firstTryCorrectIds, setFirstTryCorrectIds] = useState<Set<number>>(new Set());
  const [verbInput, setVerbInput] = useState("");
  const [prepInput, setPrepInput] = useState("");
  const [status, setStatus] = useState<"idle" | "correct" | "incorrect">("idle");
  const [prepOptions, setPrepOptions] = useState<string[]>([]);
  const [verbOptions, setVerbOptions] = useState<string[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [wrongAnsweredIds, setWrongAnsweredIds] = useState<Set<number>>(new Set());
  const [isReporting, setIsReporting] = useState(false);
  const [hasReported, setHasReported] = useState<Set<number>>(new Set());
  
  const verbInputRef = useRef<HTMLInputElement>(null);
  const prepInputRef = useRef<HTMLInputElement>(null);

  // Generate stable options for each question
  useEffect(() => {
    if (currentIndex < queue.length) {
      const q = queue[currentIndex];
      
      // Setup prep options
      const correctPrep = q.prepAnswer;
      const prepDistractors = allPrepositions.filter(p => p.toLowerCase() !== correctPrep.toLowerCase());
      const shuffledPrepDistractors = prepDistractors.sort(() => Math.random() - 0.5);
      const selectedPrepDistractors = shuffledPrepDistractors.slice(0, 5);
      const finalPrepOptions = [correctPrep, ...selectedPrepDistractors].sort(() => Math.random() - 0.5);
      setPrepOptions(finalPrepOptions);

      // Setup verb options
      const correctVerb = q.verbAnswer;
      const vOptions = Array.isArray(q.verbOptions) ? q.verbOptions : [];
      const verbDistractors = vOptions.filter(v => v !== correctVerb).slice(0, 5);
      const finalVerbOptions = [correctVerb, ...verbDistractors].sort(() => Math.random() - 0.5);
      setVerbOptions(finalVerbOptions);
    }
  }, [currentIndex, queue, allPrepositions]);

  if (initialQuestions.length === 0) return <div>Keine Fragen</div>;

  if (currentIndex >= queue.length) {
    const accuracy = Math.round((firstTryCorrectIds.size / initialQuestions.length) * 100);
    return (
      <div className="flex flex-col items-center justify-center min-h-[80vh] px-4">
        <motion.div 
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", damping: 12 }}
          className="text-center space-y-8 w-full max-w-lg"
        >
          <h1 className="text-5xl font-medium text-[#58cc02] drop-shadow-sm mb-12">
            {t.lesson_complete}!
          </h1>

          <div className="grid grid-cols-2 gap-6">
            <motion.div
              initial={{ x: -50, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="bg-white rounded-3xl border-2 border-b-8 border-[#ffc800] p-6 text-center shadow-lg"
            >
              <div className="text-[#ffc800] text-lg font-bold uppercase mb-2 tracking-wider">
                {t.accuracy}
              </div>
              <div className="text-4xl font-bold text-[#1a1a1a]">
                {accuracy}%
              </div>
            </motion.div>

            <motion.div
              initial={{ x: 50, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="bg-white rounded-3xl border-2 border-b-8 border-[#1cb0f6] p-6 text-center shadow-lg"
            >
              <div className="text-[#1cb0f6] text-lg font-bold uppercase mb-2 tracking-wider">
                Punkte
              </div>
              <div className="text-4xl font-bold text-[#1a1a1a]">
                {completedIds.size * 10}
              </div>
            </motion.div>
          </div>

          <motion.div
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="pt-12"
          >
            <Button 
              size="lg" 
              className="w-full h-16 text-xl font-bold uppercase tracking-widest bg-[#58cc02] hover:bg-[#46a302] border-b-8 border-[#46a302] active:border-b-0 active:translate-y-2 rounded-2xl transition-all shadow-md"
              onClick={() => router.push("/")}
            >
              {t.continue}
            </Button>
          </motion.div>
        </motion.div>
      </div>
    );
  }

  const q = queue[currentIndex];
  // Progress: (unique questions finished correctly) / total original questions
  const progress = (completedIds.size / initialQuestions.length) * 100;

  // Split sentence by "____" to insert inputs
  const parts = q.text.split("____");

  const isModal = q.text.includes("muss");

  const renderVerbInput = () => (
    <div className="relative inline-flex items-center">
      <Input 
        ref={verbInputRef}
        style={{ width: `calc(${Math.max(verbInput.length || 4, 4)}ch + 1.2rem)` }}
        className={`min-w-[60px] md:min-w-[80px] text-center text-base md:text-lg h-9 md:h-11 border-2 border-b-4 rounded-lg md:rounded-xl transition-all focus-visible:ring-0 px-1.5 ${
          isDragging 
            ? "border-[#1cb0f6] bg-[#e1f5fe] scale-105" 
            : "border-[#e5e5e5] bg-white"
        } ${
          status === "correct" ? "border-[#58cc02] text-[#58cc02]" : 
          status === "incorrect" ? "border-[#ff4b4b] text-[#ff4b4b]" : ""
        }`}
        value={verbInput}
        onChange={e => setVerbInput(e.target.value)}
        placeholder="Verb"
        disabled={status !== "idle"}
        readOnly
        autoFocus={!isModal}
      />
    </div>
  );

  const renderPrepInput = () => (
    <div className="relative inline-flex items-center">
      <Input 
        ref={prepInputRef}
        style={{ width: `calc(${Math.max(prepInput.length || 4, 4)}ch + 1.2rem)` }}
        className={`min-w-[50px] md:min-w-[70px] text-center text-base md:text-lg h-9 md:h-11 border-2 border-b-4 rounded-lg md:rounded-xl transition-all focus-visible:ring-0 px-1.5 ${
          isDragging 
            ? "border-[#1cb0f6] bg-[#e1f5fe] scale-105" 
            : "border-[#e5e5e5] bg-white"
        } ${
          status === "correct" ? "border-[#58cc02] text-[#58cc02]" : 
          status === "incorrect" ? "border-[#ff4b4b] text-[#ff4b4b]" : ""
        }`}
        value={prepInput}
        onChange={e => setPrepInput(e.target.value)}
        placeholder="Präp."
        disabled={status !== "idle"}
        readOnly
        autoFocus={isModal}
      />
    </div>
  );

  const handleReport = async () => {
    if (isReporting || hasReported.has(q.id)) return;
    
    setIsReporting(true);
    try {
      const res = await fetch("/api/reports", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sentenceId: q.sentenceId,
          userAnswer: `${verbInput} ${prepInput}`.trim()
        }),
      });

      if (!res.ok) throw new Error("Failed to send report");

      setHasReported(prev => new Set(prev).add(q.id));
      toast.success("Fehler gemeldet. Danke!");
    } catch (error) {
      toast.error("Fehler beim Senden");
    } finally {
      setIsReporting(false);
    }
  };

  const handleCheck = async () => {
    if (status === "idle") {
      const isVerbCorrect = normalizeAnswer(verbInput) === normalizeAnswer(q.verbAnswer);
      const isPrepCorrect = normalizeAnswer(prepInput) === normalizeAnswer(q.prepAnswer);
      
      if (isVerbCorrect && isPrepCorrect) {
        setStatus("correct");
        
        // Mark as completed
        setCompletedIds(prev => new Set(prev).add(q.id));
        
        // Mark as first-try correct if it was never wrong
        if (!wrongAnsweredIds.has(q.id)) {
            setFirstTryCorrectIds(prev => new Set(prev).add(q.id));
        }

        // Save progress to database
        try {
            await updateUserProgress(q.verbId, true);
        } catch (error) {
            console.error("Failed to update progress:", error);
        }

      } else {
        setStatus("incorrect");
        setWrongAnsweredIds(prev => new Set(prev).add(q.id));
        
        // Add to the end of the queue for later retry
        setQueue(prev => [...prev, q]);
        
        // Also notify database about the attempt
        try {
            await updateUserProgress(q.verbId, false);
        } catch (error) {
            console.error("Failed to update progress:", error);
        }
      }
    } else {
      // Next question from queue
      setStatus("idle");
      setVerbInput("");
      setPrepInput("");
      setCurrentIndex(i => i + 1);
    }
  };

  const onDragEnd = (event: any, info: any, value: string) => {
      setIsDragging(false);
      if (status !== "idle") return;

      const { x, y } = info.point;
      
      // Check if dropped over prep input
      if (prepInputRef.current) {
        const rect = prepInputRef.current.getBoundingClientRect();
        if (x >= rect.left && x <= rect.right && y >= rect.top && y <= rect.bottom) {
          setPrepInput(value);
          return;
        }
      }

      // Also check if dropped over verb input (less likely but possible if user drags there)
      if (verbInputRef.current) {
        const rect = verbInputRef.current.getBoundingClientRect();
        if (x >= rect.left && x <= rect.right && y >= rect.top && y <= rect.bottom) {
          setVerbInput(value);
          return;
        }
      }
  };

  return (
    <div className="fixed inset-0 z-[60] bg-white flex flex-col h-full w-full overflow-hidden font-sans">
      {/* Header with Exit, Progress and Flag */}
      <div className="max-w-5xl mx-auto w-full flex items-center gap-4 md:gap-6 py-4 md:py-6 px-4 md:px-10 shrink-0">
        <button 
          onClick={() => router.push("/")}
          className="text-[#afafaf] hover:text-[#1a1a1a] transition-colors p-1"
        >
          <svg width="20" height="20" className="md:w-6 md:h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
        </button>
        
        <div className="flex-1 h-3 md:h-4 bg-[#e5e5e5] rounded-2xl overflow-hidden relative shadow-inner">
          <motion.div 
            className="h-full bg-[#58cc02] rounded-2xl relative shadow-[0_0_15px_rgba(88,204,2,0.6)]"
            initial={false}
            animate={{ width: `${Math.max(progress, 1)}%` }}
            transition={{ type: "spring", stiffness: 100, damping: 20 }}
          >
            {/* Awesome Reflection Effect */}
            <div className="absolute top-0.5 left-2 right-2 h-1 bg-white/40 rounded-full" />
          </motion.div>
        </div>

        <div className="flex items-center gap-2 text-[#afafaf] font-medium">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M14.4 6L14 4H5v17h2v-7h5.6l.4 2h7V6z"/></svg>
        </div>
      </div>

      <div className="flex-1 flex flex-col pt-4 md:pt-8 max-w-2xl mx-auto w-full overflow-y-auto no-scrollbar px-4">
        <h2 className="text-xl md:text-2xl font-medium text-[#1a1a1a] mb-6 md:mb-10 tracking-tight">
          {t.fill_blanks}
        </h2>

        <div className="space-y-8 md:space-y-12 pb-32 md:pb-10">
          <div className="flex flex-col items-start gap-5 md:gap-8">
            
            {q.nativeTranslation && (
              <div className="flex items-start gap-3 bg-slate-50/80 px-4 py-3 rounded-xl border border-slate-200/60 shadow-sm max-w-2xl">
                <Globe className="w-5 h-5 text-slate-400 mt-0.5 shrink-0" />
                <p className="text-slate-500 text-sm md:text-base italic leading-relaxed">
                  {q.nativeTranslation}
                </p>
              </div>
            )}

            {isAdmin && (
              <div className="relative">
                <div className="bg-white rounded-xl md:rounded-2xl border-2 border-b-4 border-[#e5e5e5] p-2 md:p-3 px-4 md:px-5 text-base md:text-lg font-normal text-[#555555] shadow-sm">
                  {q.infinitive} + {q.preposition}
                </div>
                <div className="absolute -bottom-2 left-8 w-3 h-3 bg-white border-r-2 border-b-2 border-[#e5e5e5] rotate-45" />
              </div>
            )}
            
            <div className="text-lg md:text-xl font-normal leading-relaxed flex flex-wrap items-center gap-x-2 md:gap-x-3 gap-y-3 md:gap-y-5 text-[#1a1a1a]">
              <span>{parts[0]}</span>
              {isModal ? renderPrepInput() : renderVerbInput()}
              <span>{parts[1]}</span>
              {isModal ? renderVerbInput() : renderPrepInput()}
              <span>{parts[2]}</span>
            </div>
          </div>

          {/* Options for Verb and Preposition */}
          <AnimatePresence>
            {status === "idle" && (
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="flex flex-col gap-6"
              >
                {/* Verb Options */}
                <div className="pt-2 flex flex-wrap justify-center gap-2 md:gap-3">
                  {verbOptions.map((v, idx) => (
                    <motion.div
                      key={`verb-${currentIndex}-${v}-${idx}`}
                      drag
                      dragSnapToOrigin
                      onDragStart={() => setIsDragging(true)}
                      onDragEnd={(e, info) => onDragEnd(e, info, v)}
                      whileHover={{ scale: 1.05 }}
                      whileDrag={{ scale: 1.1, zIndex: 10 }}
                      className="cursor-grab active:cursor-grabbing"
                    >
                      <Button 
                        variant="outline" 
                        className="rounded-lg md:rounded-xl h-10 md:h-12 px-4 md:px-6 border-2 border-b-4 border-[#e5e5e5] hover:bg-slate-50 text-base md:text-lg font-normal text-[#4b4b4b] transition-all active:border-b-2 active:translate-y-1 shadow-sm"
                        onClick={() => setVerbInput(v)}
                      >
                        {v}
                      </Button>
                    </motion.div>
                  ))}
                </div>

                {/* Preposition Options */}
                <div className="flex flex-wrap justify-center gap-2 md:gap-3">
                  {prepOptions.map((p, idx) => (
                    <motion.div
                      key={`prep-${currentIndex}-${p}-${idx}`}
                      drag
                      dragSnapToOrigin
                      onDragStart={() => setIsDragging(true)}
                      onDragEnd={(e, info) => onDragEnd(e, info, p)}
                      whileHover={{ scale: 1.05 }}
                      whileDrag={{ scale: 1.1, zIndex: 10 }}
                      className="cursor-grab active:cursor-grabbing"
                    >
                      <Button 
                        variant="outline" 
                        className="rounded-lg md:rounded-xl h-10 md:h-12 px-4 md:px-6 border-2 border-b-4 border-[#e5e5e5] hover:bg-slate-50 text-base md:text-lg font-normal text-[#4b4b4b] transition-all active:border-b-2 active:translate-y-1 shadow-sm"
                        onClick={() => setPrepInput(p)}
                      >
                        {p}
                      </Button>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Footer Check Bar - Duolingo Style */}
      <div className={`mt-auto shrink-0 border-t-2 border-[#e5e5e5] py-4 md:py-8 px-4 md:px-10 flex items-center justify-center transition-colors duration-300 ${
        status === "correct" ? "bg-[#d7ffb8]" : status === "incorrect" ? "bg-[#ffdfe0]" : "bg-white"
      }`}>
        <div className="max-w-4xl w-full flex flex-row items-center justify-between gap-4 md:gap-8">
          <AnimatePresence mode="wait">
            {status === "idle" ? (
              <>
                <Button 
                  variant="outline"
                  size="lg" 
                  className="hidden md:flex h-11 md:h-12 text-sm md:text-base font-medium uppercase tracking-widest border-2 border-b-4 border-[#e5e5e5] text-[#777777] hover:bg-[#f7f7f7] rounded-lg md:rounded-xl transition-all"
                  onClick={() => setCurrentIndex(i => i + 1)}
                >
                  Überspringen
                </Button>
                
                <div className="flex-1 md:flex-none">
                  <Button 
                    size="lg" 
                    className={`w-full md:w-56 h-11 md:h-12 text-sm md:text-base font-medium uppercase tracking-widest transition-all ${
                      !verbInput || !prepInput 
                        ? "bg-[#e5e5e5] text-[#afafaf] border-b-4 border-[#afafaf] cursor-not-allowed" 
                        : "bg-[#58cc02] text-white border-b-4 md:border-b-6 border-[#46a302] hover:bg-[#46a302] active:border-b-0 active:translate-y-2 rounded-lg md:rounded-xl"
                    }`}
                    onClick={handleCheck}
                    disabled={!verbInput || !prepInput}
                  >
                    {t.check}
                  </Button>
                </div>
              </>
            ) : (
              <motion.div 
                key="result"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="w-full flex flex-col md:flex-row items-center justify-between gap-4 md:gap-8"
              >
                <div className="flex items-center gap-4 md:gap-6 w-full md:w-auto">
                  <div className={`w-10 h-10 md:w-16 md:h-16 rounded-full flex items-center justify-center text-white text-xl md:text-3xl font-medium shrink-0 shadow-md ${
                    status === "correct" ? "bg-[#58cc02]" : "bg-[#ff4b4b]"
                  }`}>
                    {status === "correct" ? "✓" : "✗"}
                  </div>
                  <div className="space-y-0.5 overflow-hidden">
                    <h3 className={`text-xl md:text-2xl font-medium ${
                      status === "correct" ? "text-[#58cc02]" : "text-[#ff4b4b]"
                    }`}>
                      {status === "correct" ? t.correct : t.incorrect}
                    </h3>
                    {status === "incorrect" && (
                      <div className="flex items-center gap-4">
                        <div className="text-[#ff4b4b] text-base md:text-lg font-medium">
                          Richtig: <span className="underline font-bold">{q.verbAnswer} {q.prepAnswer}</span>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 gap-1.5 text-[#ff4b4b] hover:bg-[#ff4b4b]/10 hover:text-[#ff4b4b] rounded-lg border border-[#ff4b4b]/20"
                          onClick={handleReport}
                          disabled={isReporting || hasReported.has(q.id)}
                        >
                          {isReporting ? (
                            <Loader2 className="h-3.5 w-3.5 animate-spin" />
                          ) : hasReported.has(q.id) ? (
                            <CheckCircle2 className="h-3.5 w-3.5" />
                          ) : (
                            <Flag className="h-3.5 w-3.5" />
                          )}
                          <span className="text-xs uppercase tracking-wider font-bold">
                            {hasReported.has(q.id) ? "Gemeldet" : "Fehler?"}
                          </span>
                        </Button>
                      </div>
                    )}
                    {q.sentenceTranslation && (
                      <p className={`text-sm md:text-lg font-normal ${
                        status === "correct" ? "text-[#58cc02]" : "text-[#ff4b4b]"
                      }`}>
                        "{q.sentenceTranslation}"
                      </p>
                    )}
                  </div>
                </div>
                
                <Button 
                  size="lg" 
                  className={`w-full md:w-64 h-12 md:h-14 text-lg md:text-xl font-medium uppercase tracking-widest rounded-lg md:rounded-xl shadow-md transition-all border-b-4 md:border-b-6 active:border-b-0 active:translate-y-2 ${
                    status === "correct" 
                      ? "bg-[#58cc02] hover:bg-[#46a302] border-[#46a302]" 
                      : "bg-[#ff4b4b] hover:bg-[#d13b3b] border-[#d13b3b]"
                  }`}
                  onClick={handleCheck}
                >
                  {t.continue}
                </Button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
