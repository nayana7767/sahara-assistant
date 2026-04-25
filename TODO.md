# Multilingual TTS Fix - TODO

## Steps
- [x] 1. Analyze current `hooks/useSpeech.ts` and identify issues
- [x] 2. Read dependent files (`translations.ts`, `types.ts`, consumers)
- [x] 3. Rewrite `hooks/useSpeech.ts` with robust voice loading, matching, and fallback
- [x] 4. Fix TypeScript type issues (`SpeechRecognition`, `SpeechRecognitionEvent`, `SpeechRecognitionErrorEvent`)
- [x] 5. Verified compilation (only pre-existing error in `chat-container.tsx` remains)

