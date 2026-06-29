import React, { useState, useRef } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useAppDispatch } from '@/hooks/useAppDispatch'
import { login } from '@/store/slices/authSlice'
import { toast } from '@/components/ui/Toaster'
import { ShieldCheck, Loader2 } from 'lucide-react'

export const MFAPage: React.FC = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const dispatch = useAppDispatch()
  const [code, setCode] = useState(['', '', '', '', '', ''])
  const [isLoading, setIsLoading] = useState(false)
  const inputRefs = useRef<(HTMLInputElement | null)[]>([])

  const state = location.state as { userId?: string; from?: string }
  const from = state?.from ?? '/dashboard'

  const handleChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return
    const newCode = [...code]
    newCode[index] = value.slice(-1)
    setCode(newCode)
    if (value && index < 5) inputRefs.current[index + 1]?.focus()
  }

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !code[index] && index > 0) {
      inputRefs.current[index - 1]?.focus()
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const mfaCode = code.join('')
    if (mfaCode.length !== 6) return

    setIsLoading(true)
    try {
      await dispatch(login({ email: '', password: '', mfaCode } as any)).unwrap()
      navigate(from, { replace: true })
      toast.success('Verified!', 'Two-factor authentication successful')
    } catch (err: any) {
      toast.error('Invalid code', 'Please check your authenticator app')
      setCode(['', '', '', '', '', ''])
      inputRefs.current[0]?.focus()
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-nexabiz-50 to-background p-4">
      <div className="w-full max-w-sm">
        <div className="rounded-2xl border bg-card p-8 shadow-lg text-center">
          <ShieldCheck className="h-12 w-12 text-primary mx-auto mb-4" />
          <h2 className="text-2xl font-semibold mb-2">Two-factor authentication</h2>
          <p className="text-sm text-muted-foreground mb-6">
            Enter the 6-digit code from your authenticator app
          </p>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="flex gap-2 justify-center">
              {code.map((digit, i) => (
                <input
                  key={i}
                  ref={(el) => { inputRefs.current[i] = el }}
                  type="text"
                  inputMode="numeric"
                  value={digit}
                  onChange={(e) => handleChange(i, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(i, e)}
                  className="h-12 w-10 rounded-lg border text-center text-lg font-semibold focus:outline-none focus:ring-2 focus:ring-primary"
                  maxLength={1}
                  aria-label={`MFA digit ${i + 1}`}
                />
              ))}
            </div>

            <button
              type="submit"
              disabled={isLoading || code.some((d) => !d)}
              className="w-full flex items-center justify-center gap-2 rounded-lg bg-primary py-2.5 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50 transition-colors"
            >
              {isLoading && <Loader2 className="h-4 w-4 animate-spin" />}
              Verify
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
