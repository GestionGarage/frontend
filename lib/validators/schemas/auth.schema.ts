import { z } from 'zod';

export const loginSchema = z.object({
  email: z.string().email('Email invalide'),
  password: z.string().min(8, 'Mot de passe requis (min 8 caractères)'),
});

export const refreshTokenSchema = z.object({
  refresh_token: z.string().min(1),
});

export type LoginDto = z.infer<typeof loginSchema>;
export type RefreshTokenDto = z.infer<typeof refreshTokenSchema>;

export interface JwtPayload {
  sub: string;
  email: string;
  role: 'admin';
  iat?: number;
  exp?: number;
}

export interface AuthResponse {
  access_token: string;
  expires_in: number;
  user: {
    id: string;
    email: string;
    role: 'admin';
  };
}
