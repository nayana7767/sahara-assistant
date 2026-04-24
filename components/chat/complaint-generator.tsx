'use client'

import { useState } from 'react'
import { FileText, Download, Copy, Check, Loader2, Printer } from 'lucide-react'
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
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { ScrollArea } from '@/components/ui/scroll-area'
import type { Language } from '@/lib/types'
import type { TranslationKey } from '@/lib/i18n/translations'

const DOC_TYPE_KEYS: { value: string; key: TranslationKey }[] = [
  { value: 'fir', key: 'docType.fir' },
  { value: 'rti', key: 'docType.rti' },
  { value: 'consumer', key: 'docType.consumer' },
  { value: 'legal_notice', key: 'docType.legalNotice' },
  { value: 'affidavit', key: 'docType.affidavit' },
]

interface ComplaintGeneratorProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  language: Language
  sessionId: string | null
  t: (key: TranslationKey) => string
}

export function ComplaintGenerator({
  open,
  onOpenChange,
  language,
  sessionId,
  t,
}: ComplaintGeneratorProps) {
  const [type, setType] = useState<string>('')
  const [details, setDetails] = useState('')
  const [name, setName] = useState('')
  const [location, setLocation] = useState('')
  const [generatedContent, setGeneratedContent] = useState('')
  const [isGenerating, setIsGenerating] = useState(false)
  const [copied, setCopied] = useState(false)

  const handleGenerate = async () => {
    if (!type || !details.trim()) return

    setIsGenerating(true)
    setGeneratedContent('')

    // Build enriched details with form fields
    const enrichedDetails = [
      name && `Name: ${name}`,
      location && `Location: ${location}`,
      `Details: ${details}`,
    ].filter(Boolean).join('\n')

    try {
      const response = await fetch('/api/generate-complaint', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type,
          details: enrichedDetails,
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

  const handlePrint = () => {
    const printWindow = window.open('', '_blank')
    if (printWindow) {
      printWindow.document.write(`
        <!DOCTYPE html>
        <html>
        <head>
          <title>${t('doc.generated')}</title>
          <style>
            body { font-family: 'Times New Roman', serif; padding: 2cm; line-height: 1.6; color: #000; }
            pre { white-space: pre-wrap; font-family: 'Times New Roman', serif; font-size: 14px; }
          </style>
        </head>
        <body>
          <pre>${generatedContent}</pre>
        </body>
        </html>
      `)
      printWindow.document.close()
      printWindow.print()
    }
  }

  const handleReset = () => {
    setType('')
    setDetails('')
    setName('')
    setLocation('')
    setGeneratedContent('')
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-primary" />
            {t('doc.title')}
          </DialogTitle>
          <DialogDescription>{t('doc.subtitle')}</DialogDescription>
        </DialogHeader>

        {!generatedContent ? (
          <div className="space-y-4 py-4 overflow-y-auto">
            <div className="space-y-2">
              <Label>{t('doc.typeLabel')}</Label>
              <Select value={type} onValueChange={setType}>
                <SelectTrigger>
                  <SelectValue placeholder={t('doc.selectType')} />
                </SelectTrigger>
                <SelectContent>
                  {DOC_TYPE_KEYS.map((docType) => (
                    <SelectItem key={docType.value} value={docType.value}>
                      {t(docType.key)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>
                  {language === 'en' ? 'Your Name' : language === 'hi' ? 'आपका नाम' : language === 'kn' ? 'ನಿಮ್ಮ ಹೆಸರು' : language === 'te' ? 'మీ పేరు' : 'உங்கள் பெயர்'}
                </Label>
                <Input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="[YOUR NAME]"
                />
              </div>
              <div className="space-y-2">
                <Label>
                  {language === 'en' ? 'Location' : language === 'hi' ? 'स्थान' : language === 'kn' ? 'ಸ್ಥಳ' : language === 'te' ? 'స్థానం' : 'இடம்'}
                </Label>
                <Input
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="City, State"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>{t('doc.detailsLabel')}</Label>
              <Textarea
                value={details}
                onChange={(e) => setDetails(e.target.value)}
                placeholder={t('doc.detailsPlaceholder')}
                className="min-h-[120px]"
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
                  {t('doc.generating')}
                </>
              ) : (
                <>
                  <FileText className="h-4 w-4 mr-2" />
                  {t('doc.generate')}
                </>
              )}
            </Button>
          </div>
        ) : (
          <div className="flex-1 flex flex-col min-h-0 py-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-medium">{t('doc.generated')}</h3>
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
                      {t('doc.copied')}
                    </>
                  ) : (
                    <>
                      <Copy className="h-4 w-4" />
                      {t('doc.copy')}
                    </>
                  )}
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handlePrint}
                  className="gap-1.5"
                >
                  <Printer className="h-4 w-4" />
                  {t('doc.print')}
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleDownload}
                  className="gap-1.5"
                >
                  <Download className="h-4 w-4" />
                  {t('doc.download')}
                </Button>
              </div>
            </div>

            <ScrollArea className="flex-1 border rounded-lg p-4 bg-muted/30">
              <pre className="whitespace-pre-wrap text-sm font-mono leading-relaxed">
                {generatedContent}
              </pre>
            </ScrollArea>

            <Button
              variant="outline"
              onClick={handleReset}
              className="mt-4"
            >
              {t('doc.createNew')}
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
