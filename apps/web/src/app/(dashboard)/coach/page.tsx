"use client";

import * as React from "react";
import { Header } from "@/components/layout/header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { api } from "@/lib/api";
import { createClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";
import { useSearchParams } from "next/navigation";
import {
  Send,
  Sparkles,
  Lightbulb,
  Target,
  Brain,
  Zap,
  MessageSquare,
} from "lucide-react";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
}

function CoachPage() {
  const searchParams = useSearchParams();
  const callId = searchParams.get("call_id");
  const [messages, setMessages] = React.useState<Message[]>([]);
  const [inputValue, setInputValue] = React.useState("");
  const [isTyping, setIsTyping] = React.useState(false);
  const [hasLoadedContext, setHasLoadedContext] = React.useState(false);
  const messagesEndRef = React.useRef<HTMLDivElement>(null);
  const supabase = createClient();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  React.useEffect(() => {
    scrollToBottom();
  }, [messages]);

  React.useEffect(() => {
    if (callId && !hasLoadedContext) {
      setHasLoadedContext(true);
      setMessages([{
        id: "ctx",
        role: "assistant",
        content: "Cargando contexto de la llamada analizada...",
      }]);
      api.get(`/api/v1/analyses/${callId}`).then((data) => {
        const greeting = `Hola! Estoy analizando tu llamada "${data.call_id}" con el cliente.\n\nPuntuacion: ${data.overall_score}/100 | Probabilidad de cierre: ${data.closing_probability}%\n\nPuedes preguntarme sobre:\n- Por que me fue bien/mal en la llamada\n- Como mejorar mis objeciones\n- Que hubiera dicho mejor\n- Como mejorar mi cierre\n- Estrategias para esta situacion\n\nQue quieres saber?`;
        setMessages([{
          id: "greeting",
          role: "assistant",
          content: greeting,
        }]);
      }).catch(() => {
        setMessages([{
          id: "greeting",
          role: "assistant",
          content: "Hola! Soy tu Coach IA de ventas. Puedo ayudarte con tecnicas de cierre, manejo de objeciones, y mas. Que quieres trabajar hoy?",
        }]);
      });
    } else if (!callId && messages.length === 0) {
      setMessages([{
        id: "greeting",
        role: "assistant",
        content: "Hola! Soy tu Coach IA de ventas.\n\nPuedo ayudarte con:\n- Tecnicas de cierre\n- Manejo de objeciones\n- Mejorar tu rapport\n- Estrategias de descubrimiento\n- Analisis de llamadas\n\nQue quieres que trabajemos hoy?",
      }]);
    }
  }, [callId]);

  const handleSend = async (content: string) => {
    if (!content.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: content.trim(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputValue("");
    setIsTyping(true);

    try {
      const { data: { session } } = await supabase.auth.getSession();

      const res = await fetch(`${api.baseUrl}/api/v1/coach/chat`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(session?.access_token ? { Authorization: `Bearer ${session.access_token}` } : {}),
        },
        body: JSON.stringify({
          message: content,
          call_id: callId || undefined,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setMessages((prev) => [...prev, {
          id: (Date.now() + 1).toString(),
          role: "assistant",
          content: data.response,
        }]);
      } else {
        throw new Error("API error");
      }
    } catch {
      setMessages((prev) => [...prev, {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: "No pude conectar con el backend. Verifica que este corriendo.",
      }]);
    }

    setIsTyping(false);
  };

  const suggestedQuestions = callId
    ? [
        { icon: Lightbulb, label: "Analiza mis errores en esta llamada", color: "text-amber-500" },
        { icon: Target, label: "Como mejorar mi cierre?", color: "text-emerald-500" },
        { icon: Brain, label: "Que hubiera dicho mejor?", color: "text-purple-500" },
        { icon: Zap, label: "Dame mejores respuestas a las objeciones", color: "text-blue-500" },
      ]
    : [
        { icon: Lightbulb, label: "Como mejorar mi cierre de ventas?", color: "text-amber-500" },
        { icon: Target, label: "Como manejo objeciones de precio?", color: "text-emerald-500" },
        { icon: Brain, label: "Que es SPIN Selling?", color: "text-purple-500" },
        { icon: Zap, label: "Dame tips para mejorar mi rapport", color: "text-blue-500" },
      ];

  return (
    <>
      <Header title="Coach IA" subtitle={callId ? "Analizando tu llamada" : "Tu asistente personal de ventas"} />

      <div className="flex flex-col h-[calc(100vh-64px)]">
        <div className="flex-1 overflow-y-auto p-6 max-w-[900px] mx-auto w-full">
          <div className="space-y-6">
            {messages.map((message) => (
              <div key={message.id} className={cn("flex gap-3 animate-fade-in", message.role === "user" ? "justify-end" : "justify-start")}>
                {message.role === "assistant" && (
                  <div className="flex items-center justify-center w-9 h-9 rounded-xl bg-emerald-500 text-white flex-shrink-0">
                    <Sparkles className="w-5 h-5" />
                  </div>
                )}
                <div className={cn("max-w-[80%] rounded-2xl px-5 py-4",
                  message.role === "user" ? "bg-emerald-500 text-white" : "bg-white border border-slate-200")}>
                  <div className="text-sm leading-relaxed whitespace-pre-wrap">{message.content}</div>
                </div>
                {message.role === "user" && <Avatar alt="Tu" size="sm" />}
              </div>
            ))}
            {isTyping && (
              <div className="flex gap-3 animate-fade-in">
                <div className="flex items-center justify-center w-9 h-9 rounded-xl bg-emerald-500 text-white flex-shrink-0"><Sparkles className="w-5 h-5" /></div>
                <div className="bg-white border border-slate-200 rounded-2xl px-5 py-4">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-emerald-500 rounded-full animate-bounce" />
                    <div className="w-2 h-2 bg-emerald-500 rounded-full animate-bounce [animation-delay:0.2s]" />
                    <div className="w-2 h-2 bg-emerald-500 rounded-full animate-bounce [animation-delay:0.4s]" />
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        </div>

        {messages.length <= 2 && (
          <div className="px-6 pb-4 max-w-[900px] mx-auto w-full">
            <div className="flex flex-wrap gap-2">
              {suggestedQuestions.map((q, i) => (
                <button key={i} onClick={() => handleSend(q.label)}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white border border-slate-200 text-sm text-slate-600 hover:border-emerald-300 hover:bg-emerald-50 transition-all duration-200">
                  <q.icon className={cn("w-4 h-4", q.color)} />{q.label}
                </button>
              ))}
            </div>
          </div>
        )}

        <div className="border-t border-slate-100 bg-white p-4">
          <div className="max-w-[900px] mx-auto">
            <form onSubmit={(e) => { e.preventDefault(); handleSend(inputValue); }} className="flex items-center gap-3">
              <Input value={inputValue} onChange={(e) => setInputValue(e.target.value)}
                placeholder={callId ? "Pregunta sobre tu llamada..." : "Escribe tu pregunta sobre ventas..."}
                className="flex-1" disabled={isTyping} />
              <Button type="submit" size="icon" disabled={!inputValue.trim() || isTyping}><Send className="w-4 h-4" /></Button>
            </form>
          </div>
        </div>
      </div>
    </>
  );
}

export default CoachPage;
