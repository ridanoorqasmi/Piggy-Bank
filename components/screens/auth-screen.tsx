"use client"

import { useState } from "react"
import Image from "next/image"
import { authSignInSchema, authSignUpSchema } from "@/lib/validations"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Eye, EyeOff } from "lucide-react"

interface AuthScreenProps {
  onSignIn: (email: string, password: string) => Promise<void>
  onSignUp: (email: string, password: string, displayName?: string) => Promise<void>
  error: string | null
  onClearError: () => void
  isLoading?: boolean
}

export function AuthScreen({
  onSignIn,
  onSignUp,
  error,
  onClearError,
  isLoading = false,
}: AuthScreenProps) {
  const [isLogin, setIsLogin] = useState(true)
  const [showPassword, setShowPassword] = useState(false)
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [displayName, setDisplayName] = useState("")
  const [submitting, setSubmitting] = useState(false)
  const [formError, setFormError] = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    onClearError()
    setFormError(null)
    const schema = isLogin ? authSignInSchema : authSignUpSchema
    const result = schema.safeParse({
      email: email.trim(),
      password: password.trim(),
      ...(isLogin ? {} : { displayName: displayName.trim() || undefined }),
    })
    if (!result.success) {
      const first = result.error.flatten().formErrors[0] ?? result.error.message
      setFormError(first)
      return
    }
    setSubmitting(true)
    try {
      if (isLogin) {
        await onSignIn(result.data.email, result.data.password)
      } else {
        const displayNameValue =
          "displayName" in result.data && typeof result.data.displayName === "string"
            ? result.data.displayName
            : undefined
        await onSignUp(result.data.email, result.data.password, displayNameValue)
      }
    } catch {
      // Error shown by parent via error prop
    } finally {
      setSubmitting(false)
    }
  }

  const busy = isLoading || submitting

  return (
    <main className="flex min-h-dvh items-center justify-center bg-background p-6">
      <div className="w-full max-w-sm">
        <div className="animate-retro-in mb-6 text-center">
          <div className="animate-float mx-auto mb-4 size-28 overflow-hidden rounded-full">
            <Image
              src="/images/piggy-hero.jpg"
              alt="Piggy mascot holding gold coins"
              width={112}
              height={112}
              className="size-full object-cover"
              priority
            />
          </div>
          <h1 className="font-serif text-5xl tracking-tight text-foreground">
            Piggy
          </h1>
          <p className="mt-1 text-xs font-medium uppercase tracking-[0.25em] text-muted-foreground">
            Personal Finance
          </p>
          <div className="mx-auto mt-4 h-px w-16 bg-primary/40" />
        </div>

        <form
          onSubmit={handleSubmit}
          className="retro-card retro-noise animate-retro-in stagger-2 rounded-2xl bg-card p-6"
        >
          <div className="flex flex-col gap-5">
            {(formError || error) && (
              <p className="rounded-lg bg-destructive/15 px-3 py-2 text-sm text-destructive">
                {formError || error}
              </p>
            )}
            {!isLogin && (
              <div className="flex flex-col gap-2">
                <Label htmlFor="name" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Full Name
                </Label>
                <Input
                  id="name"
                  type="text"
                  placeholder="Your name"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  className="h-12 rounded-xl border-border bg-muted text-foreground placeholder:text-muted-foreground"
                />
              </div>
            )}
            <div className="flex flex-col gap-2">
              <Label htmlFor="email" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Email
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="hello@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="h-12 rounded-xl border-border bg-muted text-foreground placeholder:text-muted-foreground"
                required
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="password" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Password
              </Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="h-12 rounded-xl border-border bg-muted pr-12 text-foreground placeholder:text-muted-foreground"
                  required
                  minLength={6}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground transition-colors hover:text-foreground"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                </button>
              </div>
            </div>

            <div className="retro-divider border-t" />

            <Button
              type="submit"
              disabled={busy}
              className="h-12 rounded-xl bg-primary text-sm font-bold uppercase tracking-wider text-primary-foreground transition-all hover:bg-primary/90 hover:shadow-[0_0_20px_rgba(242,130,106,0.25)] active:scale-[0.98] disabled:opacity-50"
            >
              {busy ? "Please wait…" : isLogin ? "Sign In" : "Create Account"}
            </Button>
          </div>
        </form>

        <p className="animate-retro-in stagger-3 mt-6 text-center text-sm text-muted-foreground">
          {isLogin ? "Don't have an account?" : "Already have an account?"}{" "}
          <button
            type="button"
            onClick={() => {
              setIsLogin(!isLogin)
              onClearError()
              setFormError(null)
            }}
            className="font-semibold text-primary underline decoration-primary/30 underline-offset-4 transition-colors hover:decoration-primary"
          >
            {isLogin ? "Create one" : "Sign in"}
          </button>
        </p>
      </div>
    </main>
  )
}
