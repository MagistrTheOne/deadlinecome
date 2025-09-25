"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { signUp, signIn } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Github, Mail } from "lucide-react";

export function SignUpForm() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  const handleEmailSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      const result = await signUp.email({
        name,
        email,
        password,
      });

      if (result.error) {
        setError(result.error.message || "Ошибка при регистрации");
      } else {
        router.push("/dashboard");
        router.refresh();
      }
    } catch (err) {
      setError("Произошла ошибка при регистрации");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSocialSignUp = async (provider: "github" | "google") => {
    setIsLoading(true);
    setError("");

    try {
      // Для социальной регистрации используем signIn.social
      await signIn.social({
        provider,
        callbackURL: "/dashboard",
      });
    } catch (err) {
      setError("Произошла ошибка при регистрации через социальную сеть");
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader className="text-center">
        <CardTitle className="text-2xl font-bold text-white">Регистрация</CardTitle>
        <CardDescription className="text-gray-400">
          Создайте новый аккаунт для начала работы
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <form onSubmit={handleEmailSignUp} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Имя</Label>
            <Input
              id="name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              disabled={isLoading}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={isLoading}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Пароль</Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              disabled={isLoading}
              minLength={6}
            />
          </div>
          <Button 
            type="submit" 
            className="w-full bg-gray-800 hover:bg-gray-700 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-200 border border-gray-600 hover:border-gray-500" 
            disabled={isLoading}
          >
            <Mail className="mr-2 h-5 w-5" />
            {isLoading ? (
              <span className="flex items-center">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Регистрация...
              </span>
            ) : (
              "Создать аккаунт"
            )}
          </Button>
        </form>

        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-background px-2 text-muted-foreground">
              Или продолжите с
            </span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <Button
            variant="outline"
            onClick={() => handleSocialSignUp("github")}
            disabled={isLoading}
            className="border-2 border-gray-600 hover:border-gray-500 hover:bg-gray-800 transition-all duration-200 font-medium py-3 text-white"
          >
            <Github className="mr-2 h-5 w-5" />
            GitHub
          </Button>
          <Button
            variant="outline"
            onClick={() => handleSocialSignUp("google")}
            disabled={isLoading}
            className="border-2 border-gray-600 hover:border-gray-500 hover:bg-gray-800 transition-all duration-200 font-medium py-3 text-white"
          >
            <Mail className="mr-2 h-5 w-5" />
            Google
          </Button>
        </div>

        <div className="text-center text-sm">
          Уже есть аккаунт?{" "}
          <a 
            href="/sign-in" 
            className="text-gray-300 hover:text-white font-semibold underline decoration-2 underline-offset-2 hover:decoration-white transition-colors duration-200"
          >
            Войти
          </a>
        </div>
      </CardContent>
    </Card>
  );
}
