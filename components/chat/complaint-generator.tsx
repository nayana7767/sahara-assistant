'use client'

import { useState } from 'react'
import { FileText, Download, Copy, Check, Loader2, X } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { ScrollArea } from '@/components/ui/scroll-area'
import type { Language } from '@/lib/types'

const COMPLAINT_TYPES = {
  fir: { en: 'First Information Report (FIR)', hi: 'प्रथम सूचना रिपोर्ट (FIR)' },
  rti: { en: 'RTI Application', hi: 'RTI आवेदन' },
  consumer: { en: 'Consumer Complaint', hi: 'उपभोक्ता शिकायत' },
  legal_notice: { en: 'Legal Notice', hi: 'कानूनी नोटिस' },
}

interface ComplaintGeneratorProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  language: Language
  sessionId: string | null
}

export function ComplaintGenerator({
  open,
  onOpenChange,
  language,
  sessionId,
}: ComplaintGeneratorProps) {
  const [type, setType] = useState<string>('')
  const [details, setDetails] = useState('')
  const [generatedContent, setGeneratedContent] = useState('')
  const [isGenerating, setIsGenerating] = useState(false)
  const [copied, setCopied] = useState(false)

  const handleGenerate = async () => {
    if (!type || !details.trim()) return

    setIsGenerating(true)
    setGeneratedContent('')

    try {
      const response = await fetch('/api/generate-complaint', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type,
          details,
          language,
          sessionId,
        }),
      })

      if (response.ok) {
        const { content } = await response.json()
        setGeneratedContent(content)
      }
    } catch (error) {
      console.error('Failed to generate complaint:', error)
    } finally {
      setIsGenerating(false)
    }
  }

  const handleCopy = async () => {
    await navigator.clipboard.writeText(generatedContent)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleDownload = () => {
    const blob = new Blob([generatedContent], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${type}_${new Date().toISOString().split('T')[0]}.txt`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const handleReset = () => {
    setType('')
    setDetails('')
    setGeneratedContent('')
  }

  const title = language === 'hi' ? 'दस्तावेज़ जनरेटर' : 'Document Generator'
  const subtitle = language === 'hi'
    ? 'अपने विवरण दर्ज करें और AI-संचालित कानूनी दस्तावेज़ प्राप्त करें'
    : 'Enter your details and get AI-powered legal documents'

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-primary" />
            {title}
          </DialogTitle>
          <DialogDescription>{subtitle}</DialogDescription>
        </DialogHeader>

        {!generatedContent ? (
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>
                {language === 'hi' ? 'दस्तावेज़ प्रकार' : 'Document Type'}
              </Label>
              <Select value={type} onValueChange={setType}>
                <SelectTrigger>
                  <SelectValue
                    placeholder={
                      language === 'hi'
                        ? 'दस्तावेज़ प्रकार चुनें'
                        : 'Select document type'
                    }
                  />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(COMPLAINT_TYPES).map(([key, label]) => (
                    <SelectItem key={key} value={key}>
                      {label[language]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>
                {language === 'hi'
                  ? 'घटना/मामले का विवरण'
                  : 'Incident/Case Details'}
              </Label>
              <Textarea
                value={details}
                onChange={(e) => setDetails(e.target.value)}
                placeholder={
                  language === 'hi'
                    ? 'घटना का पूरा विवरण दें: क्या हुआ, कब हुआ, कहां हुआ, कौन शामिल था...'
                    : 'Provide complete details: what happened, when, where, who was involved...'
                }
                className="min-h-[150px]"
              />
            </div>

            <Button
              onClick={handleGenerate}
              disabled={!type || !details.trim() || isGenerating}
              className="w-full"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  {language === 'hi' ? 'जनरेट हो रहा है...' : 'Generating...'}
                </>
              ) : (
                <>
                  <FileText className="h-4 w-4 mr-2" />
                  {language === 'hi' ? 'दस्तावेज़ जनरेट करें' : 'Generate Document'}
                </>
              )}
            </Button>
          </div>
        ) : (
          <div className="flex-1 flex flex-col min-h-0 py-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-medium">
                {language === 'hi' ? 'जनरेट किया गया दस्तावेज़' : 'Generated Document'}
              </h3>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleCopy}
                  className="gap-1.5"
                >
                  {copied ? (
                    <>
                      <Check className="h-4 w-4" />
                      {language === 'hi' ? 'कॉपी हुआ' : 'Copied'}
                    </>
                  ) : (
                    <>
                      <Copy className="h-4 w-4" />
                      {language === 'hi' ? 'कॉपी' : 'Copy'}
                    </>
                  )}
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleDownload}
                  className="gap-1.5"
                >
                  <Download className="h-4 w-4" />
                  {language === 'hi' ? 'डाउनलोड' : 'Download'}
                </Button>
              </div>
            </div>

            <ScrollArea className="flex-1 border rounded-lg p-4 bg-muted/30">
              <pre className="whitespace-pre-wrap text-sm font-mono">
                {generatedContent}
              </pre>
            </ScrollArea>

            <Button
              variant="outline"
              onClick={handleReset}
              className="mt-4"
            >
              {language === 'hi' ? 'नया दस्तावेज़ बनाएं' : 'Create New Document'}
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
