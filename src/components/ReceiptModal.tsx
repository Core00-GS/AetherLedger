import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { format } from 'date-fns';
import { Check, ArrowDownRight, ArrowUpRight, Copy, Terminal, Star, Sparkles, ReceiptText } from 'lucide-react';
import { Expense, TransactionType } from '../types';
import { formatCurrency } from '../lib/utils';

interface ReceiptModalProps {
  expense: Expense | null;
  onClose: () => void;
  userXP: number;
  userLevel: number;
  aetherCreds: number;
  xpBonus: number;
  credBonus: number;
}

export default function ReceiptModal({
  expense,
  onClose,
  userXP,
  userLevel,
  aetherCreds,
  xpBonus,
  credBonus,
}: ReceiptModalProps) {
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!expense) return;

    // Web Audio Synthesizer to make realistic receipt printing sounds!
    const playPrintSound = () => {
      try {
        const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
        if (!AudioContextClass) return;
        const audioCtx = new AudioContextClass();
        
        const playBeep = (freq: number, startTime: number, duration: number, vol = 0.04) => {
          const osc = audioCtx.createOscillator();
          const gain = audioCtx.createGain();
          osc.type = 'sine';
          osc.frequency.setValueAtTime(freq, startTime);
          gain.gain.setValueAtTime(vol, startTime);
          gain.gain.exponentialRampToValueAtTime(0.0001, startTime + duration);
          osc.connect(gain);
          gain.connect(audioCtx.destination);
          osc.start(startTime);
          osc.stop(startTime + duration);
        };
        
        // Simulates thermal printer stepper motor clicks & sweeps
        const playPrinterStep = (startTime: number, duration: number, pitch = 120) => {
          const osc = audioCtx.createOscillator();
          const gain = audioCtx.createGain();
          osc.type = 'triangle';
          osc.frequency.setValueAtTime(pitch, startTime);
          osc.frequency.linearRampToValueAtTime(pitch + 60, startTime + duration * 0.3);
          osc.frequency.linearRampToValueAtTime(pitch - 20, startTime + duration * 0.7);
          osc.frequency.setValueAtTime(pitch + 10, startTime + duration);
          
          gain.gain.setValueAtTime(0.015, startTime);
          gain.gain.linearRampToValueAtTime(0.012, startTime + duration - 0.05);
          gain.gain.exponentialRampToValueAtTime(0.0001, startTime + duration);
          
          osc.connect(gain);
          gain.connect(audioCtx.destination);
          osc.start(startTime);
          osc.stop(startTime + duration);
        };

        // Play dual start digital chime
        playBeep(980, audioCtx.currentTime, 0.06);
        playBeep(1440, audioCtx.currentTime + 0.07, 0.1);
        
        // Print feeds (motor rolling sounds)
        const steps = 5;
        for (let i = 0; i < steps; i++) {
          const t = audioCtx.currentTime + 0.2 + (i * 0.35);
          playPrinterStep(t, 0.25, 110 + (i * 15));
          // Mini mechanical click in between
          playBeep(300, t + 0.22, 0.02, 0.01);
        }
        
        // Success complete chime
        const doneTime = audioCtx.currentTime + 0.2 + (steps * 0.35) + 0.1;
        playBeep(1200, doneTime, 0.08, 0.03);
        playBeep(1800, doneTime + 0.09, 0.15, 0.03);

      } catch (err) {
        console.warn('Audio Context blocked or unsupported', err);
      }
    };

    playPrintSound();
  }, [expense]);

  if (!expense) return null;

  const isIncome = expense.type === TransactionType.INCOME;
  const shortId = expense.id.slice(0, 8).toUpperCase();
  const hexAddress = `0x${expense.id.slice(9, 17)}`;

  const handleCopyId = () => {
    navigator.clipboard.writeText(expense.id);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const formattedTime = format(new Date(expense.createdAt), 'yyyy/MM/dd HH:mm:ss');

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/75 backdrop-blur-md overflow-y-auto">
      <div className="w-full max-w-md flex flex-col items-center">
        
        {/* Holographic Printer Mechanical Top Block */}
        <div className="w-80 bg-gradient-to-r from-[#171e3d] via-[#101428] to-[#171e3d] border-t-2 border-x border-white/25 rounded-t-2xl py-3 px-6 flex flex-col items-center relative shadow-[0_-15px_30px_rgba(0,242,255,0.15)] overflow-hidden">
          {/* Neon warning light */}
          <div className="absolute top-1 right-3 flex items-center gap-1.5 font-mono text-[8px] text-cyan-400">
            <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-ping" />
            <span>PRINTER STATUS: ACTV</span>
          </div>
          
          <div className="text-[10px] text-gray-400 font-mono tracking-widest flex items-center gap-1 mb-1.5 uppercase font-bold text-center">
            <Terminal className="w-3.5 h-3.5 text-cyan-400 animate-bounce" /> AETHER THERMAL FEEDER
          </div>
          
          {/* Laser slit out from which receipt prints */}
          <div className="w-full h-2 bg-[#090b14] border border-white/5 rounded-full shadow-[inset_0_3px_6px_rgba(0,0,0,0.8),0_0_8px_rgba(0,242,255,0.4)] flex justify-between px-4 items-center">
            <div className="w-[30%] h-0.5 bg-cyan-500/80 animate-pulse" />
            <div className="w-[40%] h-0.5 bg-purple-500/80" />
          </div>
        </div>

        {/* Printed thermal receipt slip */}
        <div className="animate-receipt-print overflow-hidden w-80 bg-[#fbf9f4] text-[#13171a] shadow-[0_20px_50px_rgba(0,0,0,0.8)] border-x-2 border-dashed border-[#b6b4b0] pb-6 flex flex-col font-mono relative leading-relaxed z-10">
          
          {/* Faint dot matrix vertical scanlines overlay */}
          <div className="absolute inset-0 bg-[linear-gradient(rgba(0,0,0,0.015)_1px,transparent_1px)] bg-[size:100%_4px] pointer-events-none" />

          {/* Receipt Content Wrapper with genuine thermal paper texture */}
          <div className="px-6 pt-5 flex flex-col text-[11px] font-mono leading-relaxed relative selection:bg-cyan-200">
            
            {/* Stamp logo watermark on background */}
            <div className="absolute top-[20%] left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-[0.06] border-4 border-black border-dashed rounded-full p-2 text-center rotate-12 pointer-events-none select-none">
              <span className="text-xl font-bold tracking-widest block font-sans">AETHER</span>
              <span className="text-[8px] font-sans">SECURE SYSTEM</span>
            </div>

            <div className="text-center mb-4">
              <h1 className="text-sm font-extrabold tracking-widest uppercase text-black font-sans leading-tight">
                ❖ AETHER LEDGER ❖
              </h1>
              <p className="text-[9px] uppercase tracking-wider text-gray-500 font-semibold font-sans mt-0.5">
                Metropolitan Financial Enclave
              </p>
              <div className="text-[8px] text-gray-400 border-t border-b border-gray-300 py-1 mt-2 flex justify-between font-bold">
                <span>EST: 2026</span>
                <span>SYSTEM ID: {hexAddress}</span>
                <span>NO. {shortId}</span>
              </div>
            </div>

            {/* Core receipt data block */}
            <div className="space-y-2 mb-4 text-[#1b1f24] font-semibold">
              <div className="flex justify-between items-center bg-gray-200/50 p-1 rounded font-bold">
                <span>DATE / TIME:</span>
                <span className="text-black">{formattedTime}</span>
              </div>
              <div className="flex justify-between">
                <span>SERIAL KEY:</span>
                <div className="flex items-center gap-1">
                  <span className="text-black font-bold">{shortId}</span>
                  <button onClick={handleCopyId} className="text-gray-500 hover:text-black">
                    {copied ? <Check className="w-3 h-3 text-green-600" /> : <Copy className="w-3 h-3" />}
                  </button>
                </div>
              </div>
              <div className="flex justify-between">
                <span>SECTOR / CAT:</span>
                <span className="text-black font-bold font-sans">
                  [{expense.category}]
                </span>
              </div>
              <div className="flex justify-between border-b border-dashed border-gray-300 pb-1.5">
                <span>FLOW ROUTING:</span>
                <span className={isIncome ? 'text-emerald-700 font-extrabold' : 'text-rose-700 font-extrabold'}>
                  {isIncome ? 'INBOUND DEPOSIT (+)' : 'OUTBOUND EXPENSE (-)'}
                </span>
              </div>
            </div>

            {/* Item description list */}
            <div className="mb-4">
              <span className="text-[9px] text-gray-400 font-bold uppercase tracking-wider block mb-1">
                MEMORANDUM DETAIL
              </span>
              <div className="border border-gray-300 rounded p-2 bg-[#f4f3ef] text-[#2c3035] leading-relaxed">
                <div className="text-[12px] font-bold text-black border-b border-gray-200 pb-1 mb-1 flex items-center gap-1.5">
                  {isIncome ? (
                    <ArrowUpRight className="w-4 h-4 text-emerald-600 shrink-0" />
                  ) : (
                    <ArrowDownRight className="w-4 h-4 text-rose-600 shrink-0" />
                  )}
                  {expense.description}
                </div>
                {expense.remark ? (
                  <div className="text-[10px] text-gray-600 font-mono mt-1">
                    <span className="font-bold underline text-black">REMARK:</span> {expense.remark}
                  </div>
                ) : (
                  <div className="text-[9px] text-gray-400 italic">No extra remarks provided by auditor.</div>
                )}
              </div>
            </div>

            {/* Giant amount block */}
            <div className="border-t-2 border-b-2 border-black py-3 mb-4 text-center">
              <span className="text-[10px] text-gray-500 font-bold tracking-widest block uppercase mb-1">
                AUTHORIZED TOTAL AMOUNT
              </span>
              <span className={`text-2xl font-extrabold tracking-tight ${isIncome ? 'text-emerald-800' : 'text-rose-800'}`}>
                {isIncome ? '+' : '-'}{formatCurrency(expense.amount)}
              </span>
            </div>

            {/* Gamification / XP Progression section */}
            <div className="bg-cyan-50 border border-cyan-200/60 rounded-xl p-2.5 mb-4 text-cyan-950 font-sans">
              <div className="flex items-center gap-1 text-[10px] font-bold text-cyan-800 mb-1">
                <Sparkles className="w-3.5 h-3.5 text-cyan-600 animate-spin-slow" />
                <span>FRUGAL-QUEST REWARD STAMP</span>
              </div>
              <div className="grid grid-cols-2 gap-2 text-[10px]">
                <div className="bg-white/80 p-1.5 rounded border border-cyan-100 flex flex-col justify-center items-center">
                  <span className="text-[8px] text-gray-500 font-mono">EARNED EXP</span>
                  <span className="font-bold text-cyan-700 mt-0.5">+{xpBonus} EXP</span>
                </div>
                <div className="bg-white/80 p-1.5 rounded border border-cyan-100 flex flex-col justify-center items-center">
                  <span className="text-[8px] text-gray-500 font-mono">AETHER CREDITS</span>
                  <span className="font-bold text-cyan-700 mt-0.5">+{credBonus} CRED</span>
                </div>
              </div>
              <div className="mt-1.5 text-[9px] text-cyan-800/80 font-medium text-center font-mono">
                CURRENT COMPTROLLER RANK: LV.{userLevel} // XP:{userXP}
              </div>
            </div>

            {/* Symbolic digital barcode */}
            <div className="flex flex-col items-center mb-5 text-gray-800">
              <div className="text-[20px] tracking-[4px] font-mono leading-none text-black select-none opacity-85 select-none text-center">
                ||||||| | ||||| | || ||||| |||||||
              </div>
              <span className="text-[8px] text-gray-400 font-bold mt-1 tracking-wider">
                *AETHER-SECURE-{shortId}*
              </span>
            </div>

            {/* Aesthetic legal disclosure & safety confirmation statement */}
            <div className="text-[8.5px] text-gray-400 font-mono leading-normal tracking-wide text-center uppercase border-t border-dashed border-gray-300 pt-3">
              BY CONFIRMING THIS SLIP, YOU AGREE TO LOCAL RECORD PERSISTENCE PROTECTED BY SECURE ENCRYPTED AES CACHE. ANY FRAUD DETECTED WILL TRIGGER SYSTEM DEFLATION.
              <p className="mt-2 text-black font-extrabold tracking-widest font-sans text-[9px]">
                感謝您的使用 • SAFE SAVING ALWAYS
              </p>
            </div>

          </div>

          {/* Genuine serrated tear-off paper zigzag bottom decoration */}
          <div className="absolute bottom-0 inset-x-0 h-2 bg-[#fbf9f4] overflow-hidden flex" style={{ clipPath: 'polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)' }}>
            {Array.from({ length: 40 }).map((_, i) => (
              <div
                key={i}
                className="w-2.5 h-2.5 bg-black/10 shrink-0 transform rotate-45 translate-y-1"
                style={{ backgroundColor: '#0c0e18' }}
              />
            ))}
          </div>

        </div>

        {/* Real action tear/file slider button */}
        <motion.div 
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="mt-6 flex flex-col gap-2.5 items-center w-80 relative z-20"
        >
          <button
            onClick={onClose}
            className="w-full bg-gradient-to-r from-cyan-400 to-blue-500 hover:from-cyan-300 hover:to-blue-400 active:scale-95 text-[#090b14] font-bold text-xs py-3.5 px-6 rounded-xl font-sans uppercase tracking-widest flex items-center justify-center gap-2 shadow-[0_8px_25px_rgba(0,242,255,0.3)] transition-all"
          >
            <ReceiptText className="w-4 h-4 text-black shrink-0 animate-pulse" />
            撕下收據並入賬 // TEAR SLIP OUT
          </button>
          
          <span className="text-[9px] text-gray-400 font-mono tracking-wider animate-pulse flex items-center gap-1">
            ⚠️ CLICKING CONFIRMS FILE INTEGRATION TO LEDGER LEDGERS
          </span>
        </motion.div>

      </div>
    </div>
  );
}
