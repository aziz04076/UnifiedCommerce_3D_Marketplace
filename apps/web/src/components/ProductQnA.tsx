'use client';

import React, { useState } from 'react';
import { HelpCircle, ThumbsUp, MessageSquare, Send, CheckCircle2 } from 'lucide-react';
import { Button } from '@unified-commerce/ui';

export interface QnAItem {
  id: string;
  question: string;
  author: string;
  date: string;
  answers: {
    id: string;
    answer: string;
    author: string;
    isVendor?: boolean;
    date: string;
    upvotes: number;
  }[];
}

const DEFAULT_QNA: QnAItem[] = [
  {
    id: 'qna-1',
    question: 'Does the planar magnetic diaphragm require a high-impedance balanced amplifier?',
    author: 'Kaelen R.',
    date: '3 days ago',
    answers: [
      {
        id: 'ans-1',
        answer: 'While it shines with a dedicated 4.4mm balanced DAC amplifier, the sensitivity is calibrated at 104dB/mW so standard mobile converters drive it cleanly without clipping.',
        author: 'AetherApex Lab Engineer',
        isVendor: true,
        date: '2 days ago',
        upvotes: 24,
      },
    ],
  },
  {
    id: 'qna-2',
    question: 'Is the suborbital shipping shock-proof container reusable for travel?',
    author: 'Elena Rostova',
    date: '1 week ago',
    answers: [
      {
        id: 'ans-2',
        answer: 'Yes, it is pressure-sealed anodized aerogel composite with TSA latch locks and custom foam inserts.',
        author: 'Verified Buyer (Nexus Prime)',
        isVendor: false,
        date: '5 days ago',
        upvotes: 11,
      },
    ],
  },
];

export const ProductQnA: React.FC<{ productId: string; vendorName: string }> = ({
  productId,
  vendorName,
}) => {
  const [qnaList, setQnaList] = useState<QnAItem[]>(DEFAULT_QNA);
  const [newQuestion, setNewQuestion] = useState('');
  const [authorName, setAuthorName] = useState('');
  const [isAsking, setIsAsking] = useState(false);

  const handleAskQuestion = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newQuestion.trim() || !authorName.trim()) return;

    const created: QnAItem = {
      id: `qna-${Date.now()}`,
      question: newQuestion,
      author: authorName,
      date: 'Just now',
      answers: [],
    };

    setQnaList([created, ...qnaList]);
    setNewQuestion('');
    setAuthorName('');
    setIsAsking(false);
  };

  const handleUpvote = (qnaId: string, answerId: string) => {
    setQnaList((prev) =>
      prev.map((q) => {
        if (q.id !== qnaId) return q;
        return {
          ...q,
          answers: q.answers.map((a) =>
            a.id === answerId ? { ...a, upvotes: a.upvotes + 1 } : a
          ),
        };
      })
    );
  };

  return (
    <div className="space-y-6 pt-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/10">
        <div>
          <h3 className="text-xl font-bold text-white flex items-center gap-2">
            <HelpCircle className="w-5 h-5 text-cyan-400" />
            <span>Community Questions & Answers</span>
          </h3>
          <p className="text-xs text-slate-400 mt-1">
            Get technical clarifications directly from {vendorName} engineering and verified owners.
          </p>
        </div>
        <Button
          onClick={() => setIsAsking(!isAsking)}
          variant="outline"
          size="sm"
        >
          {isAsking ? 'Close Question Form' : 'Ask a Question'}
        </Button>
      </div>

      {isAsking && (
        <form onSubmit={handleAskQuestion} className="p-5 rounded-2xl bg-slate-900 border border-cyan-500/30 space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-mono text-slate-400 block mb-1">YOUR NAME / CALLSIGN</label>
              <input
                type="text"
                required
                value={authorName}
                onChange={(e) => setAuthorName(e.target.value)}
                placeholder="e.g. Alex Vance"
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-white/10 text-xs text-white focus:outline-none focus:border-cyan-400"
              />
            </div>
          </div>
          <div>
            <label className="text-xs font-mono text-slate-400 block mb-1">QUESTION</label>
            <textarea
              required
              rows={3}
              value={newQuestion}
              onChange={(e) => setNewQuestion(e.target.value)}
              placeholder="Ask about firmware support, calibration tolerances, battery lifespan..."
              className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-white/10 text-xs text-white focus:outline-none focus:border-cyan-400"
            />
          </div>
          <div className="flex justify-end">
            <Button type="submit" variant="primary" size="sm">
              <Send className="w-3.5 h-3.5 mr-1.5" />
              <span>Submit Question</span>
            </Button>
          </div>
        </form>
      )}

      {/* List of Questions */}
      <div className="space-y-4">
        {qnaList.map((item) => (
          <div key={item.id} className="p-4 rounded-2xl bg-slate-900/80 border border-white/5 space-y-3">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-start gap-2.5">
                <span className="text-xs font-mono font-bold text-cyan-400 bg-cyan-500/10 px-2 py-0.5 rounded border border-cyan-500/20">
                  Q:
                </span>
                <div>
                  <h4 className="text-sm font-semibold text-white">{item.question}</h4>
                  <span className="text-[11px] font-mono text-slate-500">Asked by {item.author} • {item.date}</span>
                </div>
              </div>
            </div>

            {/* Answers */}
            {item.answers.length === 0 ? (
              <p className="text-xs text-slate-500 italic pl-7">
                Awaiting response from {vendorName} laboratory specialists.
              </p>
            ) : (
              <div className="space-y-2 pl-7 border-l-2 border-cyan-500/30 ml-2">
                {item.answers.map((ans) => (
                  <div key={ans.id} className="space-y-1.5">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-slate-200">{ans.author}</span>
                      {ans.isVendor && (
                        <span className="text-[10px] font-mono bg-violet-500/20 text-violet-300 border border-violet-500/30 px-2 py-0.2 rounded-full">
                          OFFICIAL VENDOR
                        </span>
                      )}
                      <span className="text-[10px] font-mono text-slate-500">• {ans.date}</span>
                    </div>
                    <p className="text-xs text-slate-300 leading-relaxed">{ans.answer}</p>
                    <div className="flex items-center gap-2 pt-1">
                      <button
                        onClick={() => handleUpvote(item.id, ans.id)}
                        className="text-[11px] text-slate-400 hover:text-cyan-300 flex items-center gap-1 transition-colors"
                      >
                        <ThumbsUp className="w-3 h-3 text-cyan-400" />
                        <span>Helpful ({ans.upvotes})</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};
