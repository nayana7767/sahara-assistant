"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { Scale } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

import { ChatHeader } from "./chat-header";
import { ChatMessage } from "./chat-message";
import { ChatInput } from "./chat-input";
import { QuickActions } from "./quick-actions";
import { SOSModal } from "./sos-modal";
import { ChartHistorySidebar } from "./chart-history-sidebar";
import { ChartHistoryDrawer } from "./chart-history-drawer";
import { ComplaintGenerator } from "./complaint-generator";
import { FloatingSOS } from "./floating-sos";
import { APIKeyModal } from "./api-key-modal";

import { useTranslation } from "@/lib/i18n/useTranslation";
import { useChartHistory } from "@/hooks/useChartHistory";
import {
  callOpenRouterAPI,
  getOpenRouterApiKey,
  type OpenRouterMessage,
} from "@/lib/openrouter";

import type { ChatSession } from "@/lib/types";
import type { ChartRecord } from "@/lib/chart-storage";

interface StoredMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
}

export function ChatContainer() {
  const { language, setLanguage, t, isLoaded } = useTranslation();
  const { charts, saveChart, deleteChart } = useChartHistory();

  const [messages, setMessages] = useState<StoredMessage[]>([]);
  const [activeChartId, setActiveChartId] = useState<string | null>(null);

  const [isLoading, setIsLoading] = useState(false);
  const [isInitialLoad] = useState(false);

  const [sosOpen, setSOSOpen] = useState(false);
  const [complaintOpen, setComplaintOpen] = useState(false);
  const [apiKeyOpen, setApiKeyOpen] = useState(false);
  const [hasApiKey, setHasApiKey] = useState(false);

  const scrollRef = useRef<HTMLDivElement>(null);

  // API key check
  useEffect(() => {
    setHasApiKey(!!getOpenRouterApiKey());
  }, [apiKeyOpen]);

  // Auto scroll
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const createNewSession = () => {
    setMessages([]);
    setActiveChartId(null);
  };

  const handleSendMessage = useCallback(
    async (content: string) => {
      const apiKey = getOpenRouterApiKey();

      if (!apiKey) {
        setApiKeyOpen(true);
        return;
      }

      const userMsg: StoredMessage = {
        id: Date.now().toString(),
        role: "user",
        content,
      };

      setMessages((prev) => [...prev, userMsg]);

      setIsLoading(true);

      const assistantMsg: StoredMessage = {
        id: Date.now() + "-ai",
        role: "assistant",
        content: "",
      };

      setMessages((prev) => [...prev, assistantMsg]);

      try {
        const msgs: OpenRouterMessage[] = [
          ...messages.map((m) => ({
            role: m.role,
            content: m.content,
          })),
          { role: "user", content },
        ];

        let result = "";

        await callOpenRouterAPI(msgs, apiKey, (chunk) => {
          result += chunk;

          setMessages((prev) => {
            const updated = [...prev];
            updated[updated.length - 1].content = result;
            return updated;
          });
        });

        if (result) {
          const chart = saveChart(result, language);
          setActiveChartId(chart.id);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    },
    [messages, language, saveChart]
  );


  return (
    <div className="flex flex-col h-screen bg-white">
      {/* FULL-WIDTH HEADER */}
      <ChatHeader
        language={language}
        onLanguageChange={setLanguage}
        onOpenSOS={() => setSOSOpen(true)}
        onOpenDocuments={() => setComplaintOpen(true)}
        onOpenAPIKey={() => setApiKeyOpen(true)}
        t={t}
      />

      {/* MAIN LAYOUT: Sidebar + Chat Area */}
      <div className="flex flex-1 overflow-hidden">
        {/* LEFT SIDEBAR - Fixed width 280px */}
        <ChartHistorySidebar
          charts={charts}
          activeChartId={activeChartId}
          onSelectChart={(c: ChartRecord) => {
            setActiveChartId(c.id);
            setMessages([
              {
                id: c.id,
                role: "assistant",
                content: c.content,
              },
            ]);
          }}
          onDeleteChart={deleteChart}
          onNewChart={createNewSession}
        />

        {/* MAIN CHAT AREA - Flex grow with centered content */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* MESSAGES CONTAINER */}
          <div
            ref={scrollRef}
            className="flex-1 overflow-y-auto px-4 py-6 flex flex-col items-center"
          >
            <div className="w-full max-w-3xl">
              {messages.length === 0 ? (
                // EMPTY STATE with greeting
                <div className="flex flex-col items-center justify-center h-full pt-20 space-y-8">
                  <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.5 }}
                    className="text-center"
                  >
                    <h2 className="text-4xl font-bold text-foreground mb-3">
                      Hi, I am Sahara 👋
                    </h2>
                    <p className="text-lg text-muted-foreground">
                      {t('welcome.subtitle')}
                    </p>
                  </motion.div>

                  {/* QUICK ACTIONS */}
                  <QuickActions
                    language={language}
                    onSelect={handleSendMessage}
                    t={t}
                  />
                </div>
              ) : (
                // MESSAGES
                messages.map((m) => (
                  <ChatMessage
                    key={m.id}
                    role={m.role}
                    content={m.content}
                    isStreaming={isLoading}
                    language={language}
                    t={t}
                  />
                ))
              )}
            </div>
          </div>

          {/* INPUT AREA - Centered at bottom */}
          <div className="px-4 py-6 border-t border-border/50 flex justify-center">
            <div className="w-full max-w-3xl">
              <ChatInput
                onSend={handleSendMessage}
                isLoading={isLoading}
                language={language}
                t={t}
              />
            </div>
          </div>
        </div>
      </div>

      {/* MODALS */}
      <SOSModal open={sosOpen} onOpenChange={setSOSOpen} language={language} t={t} />

      <ComplaintGenerator
        open={complaintOpen}
        onOpenChange={setComplaintOpen}
        language={language}
        t={t}
      />

      <APIKeyModal
        open={apiKeyOpen}
        onOpenChange={(o) => {
          setApiKeyOpen(o);
          if (!o) setHasApiKey(!!getOpenRouterApiKey());
        }}
      />

      <FloatingSOS onClick={() => setSOSOpen(true)} />
    </div>
  );
}