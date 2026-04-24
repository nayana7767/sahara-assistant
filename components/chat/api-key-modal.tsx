'use client'

import { useState } from 'react'
import { Key, X } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { getOpenRouterApiKey, setOpenRouterApiKey, clearOpenRouterApiKey } from '@/lib/openrouter'

interface APIKeyModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function APIKeyModal({ open, onOpenChange }: APIKeyModalProps) {
  const [apiKey, setApiKey] = useState('')
  const [hasKey, setHasKey] = useState(!!getOpenRouterApiKey())
  const [loading, setLoading] = useState(false)

  const handleSave = async () => {
    if (!apiKey.trim()) {
      alert('Please enter an API key')
      return
    }

    setLoading(true)
    try {
      // Test the API key with a simple request
      const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey.trim()}`,
          'HTTP-Referer': typeof window !== 'undefined' ? window.location.origin : '',
          'X-Title': 'Sahara Legal Assistant'
        },
        body: JSON.stringify({
          model: 'openai/gpt-4o-mini',
          messages: [{ role: 'user', content: 'test' }],
          max_tokens: 1,
        }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error?.message || 'Invalid API key')
      }

      setOpenRouterApiKey(apiKey.trim())
      setHasKey(true)
      setApiKey('')
      onOpenChange(false)
    } catch (error) {
      alert(`Error: ${error instanceof Error ? error.message : 'Failed to validate API key'}`)
    } finally {
      setLoading(false)
    }
  }

  const handleRemove = () => {
    if (confirm('Are you sure you want to remove the API key?')) {
      clearOpenRouterApiKey()
      setHasKey(false)
      setApiKey('')
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Key className="h-5 w-5" />
            OpenRouter API Key
          </DialogTitle>
          <DialogDescription>
            {hasKey
              ? 'Your API key is configured. You can update it here.'
              : 'Enter your OpenRouter API key to enable AI responses.'}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {hasKey && (
            <div className="p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-md">
              <p className="text-sm text-green-800 dark:text-green-300">
                ✓ API key is configured and ready to use
              </p>
            </div>
          )}

          <div className="space-y-2">
            <label className="text-sm font-medium">API Key</label>
            <Input
              type="password"
              placeholder="sk-or-..."
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              disabled={loading}
            />
            <p className="text-xs text-muted-foreground">
              Get your API key from{' '}
              <a
                href="https://openrouter.ai/keys"
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:underline"
              >
                openrouter.ai/keys
              </a>
            </p>
          </div>

          <div className="flex gap-2">
            <Button
              onClick={handleSave}
              disabled={loading || !apiKey.trim()}
              className="flex-1"
            >
              {loading ? 'Validating...' : 'Save API Key'}
            </Button>
            {hasKey && (
              <Button
                variant="destructive"
                onClick={handleRemove}
                className="flex-1"
              >
                <X className="h-4 w-4 mr-2" />
                Remove
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
