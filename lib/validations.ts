import { z } from "zod"

export const authSignInSchema = z.object({
  email: z.string().min(1, "Email is required").email("Invalid email"),
  password: z.string().min(6, "Password must be at least 6 characters"),
})

export const authSignUpSchema = authSignInSchema.extend({
  displayName: z.string().max(100).optional(),
})

export const createAccountSchema = z.object({
  name: z.string().min(1, "Account name is required").max(100),
  type: z.enum(["spending", "saving"]),
  balance: z.number().min(0, "Starting amount cannot be negative"),
  originalAmount: z.number().min(0, "Starting amount cannot be negative"),
  totalSpend: z.number().min(0),
  goalAmount: z.number().min(0).optional(),
  color: z.string().min(1, "Color is required"),
})

export const addTransactionSchema = z.object({
  amount: z.number().positive("Amount must be greater than 0"),
  type: z.enum(["expense", "income"]),
  category: z.string().min(1, "Please select a category"),
  description: z.string().max(500),
  date: z.string().min(1, "Date is required"),
})

export const editTransactionSchema = z.object({
  amount: z.number().positive("Amount must be greater than 0"),
  type: z.enum(["expense", "income"]),
  category: z.string().min(1, "Please select a category"),
  description: z.string().min(1, "Title is required").max(500),
  date: z.string().min(1, "Date is required"),
})

export type AuthSignInInput = z.infer<typeof authSignInSchema>
export type AuthSignUpInput = z.infer<typeof authSignUpSchema>
export type CreateAccountInput = z.infer<typeof createAccountSchema>
export type AddTransactionInput = z.infer<typeof addTransactionSchema>
export type EditTransactionInput = z.infer<typeof editTransactionSchema>
