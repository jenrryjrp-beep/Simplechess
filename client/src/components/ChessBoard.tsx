import React, { useEffect, useRef, useState } from 'react';
import { Chessground } from 'chessground';
import { Chess } from 'chess.js';
import 'chessground/assets/chessground.base.css';
import 'chessground/assets/chessground.brown.css';
import 'chessground/assets/chessground.cburnett.css';
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { ChevronLeft, ChevronRight, RotateCcw, Upload, ThumbsUp, ThumbsDown, Star } from "lucide-react";

interface GameHistory {
  fen: string;
  move: string;
  nag?: string;
}

const ChessBoard: React.FC = () => {
  const boardRef = useRef<HTMLDivElement>(null);
  const [game] = useState(new Chess());
  const [cg, setCg] = useState<any>(null);
  const [pgnInput, setPgnInput] = useState('');
  const [history, setHistory] = useState<GameHistory[]>([{ fen: 'start', move: 'Inici' }]);
  const [currentIdx, setCurrentIdx] = useState(0);

  const toDests = (chess: Chess) => {
    const dests = new Map();
    chess.board().forEach((row) => {
      row.forEach((s) => {
        if (s && s.color === chess.turn()) {
          const mvs = chess.moves({ square: s.square, verbose: true });
          if (mvs.length) dests.set(s.square, mvs.map((m) => m.to));
        }
      });
    });
    return dests;
  };

  useEffect(() => {
    if (boardRef.current && !cg) {
      const chessground = Chessground(boardRef.current, {
        fen: game.fen(),
        movable: {
          free: false,
          color: 'white',
          dests: toDests(game),
          events: {
            after: (orig: any, dest: any) => {
              const currentTurn = game.turn();
              const move = game.move({ from: orig, to: dest, promotion: 'q' });
              if (move) {
                const newHistory = history.slice(0, currentIdx + 1);
                newHistory.push({ fen: game.fen(), move: move.san });
                setHistory(newHistory);
                setCurrentIdx(newHistory.length - 1);
                
                chessground.set({
                  fen: game.fen(),
                  turnColor: game.turn() === 'w' ? 'white' : 'black',
                  movable: { 
                    color: game.turn() === 'w' ? 'white' : 'black',
                    dests: toDests(game) 
                  },
                });
              } else {
                chessground.set({ fen: game.fen() });
              }
            },
          },
        },
      });
      setCg(chessground);
    }
  }, [cg, game, history, currentIdx]);

  const jumpTo = (idx: number) => {
    const target = history[idx];
    game.load(target.fen === 'start' ? 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1' : target.fen);
    cg?.set({
      fen: game.fen(),
      turnColor: game.turn() === 'w' ? 'white' : 'black',
      movable: { 
        color: game.turn() === 'w' ? 'white' : 'black',
        dests: toDests(game) 
      }
    });
    setCurrentIdx(idx);
  };

  const addNag = (nag: string) => {
    if (currentIdx === 0) return;
    const newHistory = [...history];
    newHistory[currentIdx].nag = nag;
    setHistory(newHistory);
  };

  return (
    <div className="flex flex-col items-center gap-4 p-4 max-w-4xl mx-auto">
      <Card className="p-4 bg-[#1a1a1a] shadow-lg rounded-xl border-2 border-[#ffb3ba]">
        <div ref={boardRef} className="touch-none" style={{ width: '400px', height: '400px' }}></div>
      </Card>
      <div className="flex gap-2">
        <Button variant="outline" size="icon" onClick={() => jumpTo(Math.max(0, currentIdx - 1))} className="border-[#ffb3ba] text-[#ffb3ba] hover:bg-[#ff9aa2] hover:text-[#1a1a1a] transition-all duration-200">
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <Button variant="outline" size="icon" onClick={() => jumpTo(Math.min(history.length - 1, currentIdx + 1))} className="border-[#ffb3ba] text-[#ffb3ba] hover:bg-[#ff9aa2] hover:text-[#1a1a1a] transition-all duration-200">
          <ChevronRight className="h-4 w-4" />
        </Button>
        <Button variant="outline" size="icon" onClick={() => { game.reset(); jumpTo(0); setHistory([{ fen: 'start', move: 'Inici' }]); }} className="border-[#ffb3ba] text-[#ffb3ba] hover:bg-[#ff9aa2] hover:text-[#1a1a1a] transition-all duration-200">
          <RotateCcw className="h-4 w-4" />
        </Button>
      </div>
      <div className="flex gap-2">
        <Button variant="secondary" size="sm" onClick={() => addNag('!')} className="bg-[#ffb3ba] text-[#1a1a1a] hover:bg-[#ff9aa2] flex gap-1 items-center font-bold">
          <ThumbsUp className="h-3 w-3" /> !
        </Button>
        <Button variant="secondary" size="sm" onClick={() => addNag('?')} className="bg-[#ffb3ba] text-[#1a1a1a] hover:bg-[#ff9aa2] flex gap-1 items-center font-bold">
          <ThumbsDown className="h-3 w-3" /> ?
        </Button>
        <Button variant="secondary" size="sm" onClick={() => addNag('!!')} className="bg-[#ffb3ba] text-[#1a1a1a] hover:bg-[#ff9aa2] flex gap-1 items-center font-bold">
          <Star className="h-3 w-3" /> !!
        </Button>
      </div>
      <div className="w-full max-w-md space-y-2">
        <Textarea
          value={pgnInput}
          onChange={(e) => setPgnInput(e.target.value)}
          placeholder="Pega aquí tu PGN de Lichess..."
          className="min-h-[100px] font-mono text-sm border-[#ffb3ba] bg-[#1a1a1a] text-[#ffb3ba] placeholder:text-[#ffb3ba]/50 focus-visible:ring-[#ffb3ba]"
        />
        <Button className="w-full bg-[#ffb3ba] text-[#1a1a1a] hover:bg-[#ff9aa2] font-bold py-6 transition-all duration-200" onClick={() => { /* lógica de carga */ }}>
          <Upload className="mr-2 h-4 w-4" /> Cargar PGN
        </Button>
      </div>
      <div className="w-full grid grid-cols-4 gap-2 text-xs font-medium max-h-[200px] overflow-y-auto p-2 bg-[#1a1a1a]/50 rounded-lg border border-[#ffb3ba]/20">
        {history.map((h, i) => (
          <div
            key={i}
            onClick={() => jumpTo(i)}
            className={`p-2 rounded cursor-pointer text-center transition-all duration-200 border ${
              i === currentIdx 
                ? 'bg-[#ffb3ba] text-[#1a1a1a] border-[#ffb3ba] scale-105 shadow-[0_0_10px_rgba(255,179,186,0.5)]' 
                : 'bg-[#1a1a1a] text-[#ffb3ba] border-[#ffb3ba]/30 hover:border-[#ffb3ba]'
            }`}
          >
            {i === 0 ? 'Inicio' : `${Math.ceil(i/2)}${i%2===1?'.':'...'} ${h.move}${h.nag || ''}`}
          </div>
        ))}
      </div>
    </div>
  );
};

export default ChessBoard;
