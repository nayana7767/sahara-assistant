'use client'

import { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { AlertCircle, Eye, EyeOff } from 'lucide-react'
import { getOpenRouterApiKey, setOpenRouterApiKey } from '@/lib/openrouter'

interface ApiKeyDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onApiKeySet: () => void
}

export function ApiKeyDialog({ open, onOpenChange, onApiKeySet }: ApiKeyDialogProps) {
  const [apiKey, setApiKey] = useState('')
  const [showKey, setShowKey] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (open) {
      const stored = getOpenRouterApiKey()
      if (stored) {
        setApiKey(stored)
      }
      setError('')
    }
  }, [open])

  const handleSave = async () => {
    setError('')
    
    if (!apiKey.trim()) {
      setError('API key cannot be empty')
      return
    }

    setIsSaving(true)
    try {
      // Validate API key by making a test request
      const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`,
          'HTTP-Referer': window.location.origin,
          'X-Title': 'Sahara Legal Assistant'
        },
        body: JSON.stringify({
          model: 'openai/gpt-4o-mini',
          messages: [{ role: 'user', content: 'test' }],
          max_tokens: 1,
        }),
      })

      if (!response.ok) {
        throw new Error('Invalid API key or API error')
      }

      setOpenRouterApiKey(apiKey)
      setError('')
      onApiKeySet()
      onOpenChange(false)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to validate API key')
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>OpenRouter API Key</DialogTitle>
          <DialogDescription>
            Enter your OpenRouter API key to enable AI-powered legal assistance. Get one at{' '}
            <a href="https://openrouter.ai" target="_blank" rel="noopener noreferrer" className="text-primary underline">
              openrouter.ai
            </a>
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="relative">
            <Input
              type={showKey ? 'text' : 'password'}
              placeholder="Enter your OpenRouter API key"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              disabled={isSaving}
              className="pr-10"
            />
            <button
              onClick={() => setShowKey(!showKey)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              disabled={isSaving}
            >
              {showKey ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>

          {error && (
            <div className="flex gap-2 rounded-lg bg-destructive/10 p-3 text-sm text-destructive">
              <AlertCircle size={18} className="flex-shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <div className="text-xs text-muted-foreground space-y-1">
            <p>✓ Your API key is stored locally in your browser</p>
            <p>✓ Never shared with our servers</p>
            <p>✓ Model: openai/gpt-4o-mini</p>
          </div>
        </div>

        <div className="flex gap-3 justify-end">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isSaving}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            disabled={isSaving || !apiKey.trim()}
          >
            {isSaving ? 'Validating...' : 'Save API Key'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
