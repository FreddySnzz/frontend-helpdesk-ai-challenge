'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { Loader2 } from 'lucide-react';
import { useAuth } from '@/data/contexts/AuthContext';
import { cn } from '@/lib/utils';
import { authService } from '@/data/services/auth.service';
import { PasswordInput } from '@/components/ui/password-input';
import { toast } from 'sonner';
import Link from 'next/link';

export default function RegisterPage() {
  const { login } = useAuth();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await authService.register(name, email, password);
      login(response.access_token, response.user);
      toast.success('Usuário cadastrado com sucesso!');
    } catch (error) {
      if (error instanceof Error) {
        toast.error(error.message);
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-primary p-4 font-space-grotesk">
      <Card className="w-full max-w-md shadow-lg border-0 bg-zinc-800 text-secondary">
        <CardHeader className="space-y-1 text-center">
          <CardTitle className="text-2xl font-bold tracking-tight">
            Helpdesk Dashboard
          </CardTitle>
          <CardDescription>
            Insira suas credenciais para acessar a central de chamados.
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleRegister}>
          <CardContent className="space-y-4">
            <div className="space-y-2 text-left">
              <Label htmlFor="name">Nome</Label>
              <Input 
                id="name" 
                type="name" 
                placeholder="João Silva"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required 
                className={cn("border-zinc-900 bg-primary focus:outline-none")}
              />
            </div>

            <div className="space-y-2 text-left">
              <Label htmlFor="email">E-mail</Label>
              <Input 
                id="email" 
                type="email" 
                placeholder="admin@helpdesk.com" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required 
                className={cn("border-zinc-900 bg-primary focus:outline-none")}
              />
            </div>

            <div className="space-y-2 text-left">
              <Label htmlFor="password">Senha</Label>
              <PasswordInput 
                id="password" 
                autoComplete="current-password"
                value={password}
                placeholder="Senha"
                onChange={(e) => setPassword(e.target.value)}
                required 
                className={cn("border-zinc-900 bg-primary focus:outline-none")}
              />
            </div>
          </CardContent>
          <CardContent className="text-center mt-1">
            <Link
              href="/login"
              className="text-center text-xs text-zinc-500 hover:text-zinc-400 hover:italic cursor-pointer"
            >
              Já possui uma conta? Faça login.
            </Link>
          </CardContent>
          <CardFooter>
            <Button 
              type="submit" 
              className="w-full mt-4 cursor-pointer disabled:cursor-not-allowed bg-zinc-700 hover:bg-zinc-700/60" 
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Criando...
                </>
              ) : (
                'Cadastrar'
              )}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}