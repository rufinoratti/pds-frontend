
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/components/ui/use-toast';
import { useNavigate, useOutletContext } from 'react-router-dom';
import { Eye, EyeOff, User, Mail, Lock } from 'lucide-react';

const AuthForm = ({ isRegister, onSubmit, darkMode }) => {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({ username, email, password, confirmPassword });
  };

  return (
    <motion.form
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      onSubmit={handleSubmit}
      className="space-y-6"
    >
      {isRegister && (
        <div className="space-y-2">
          <Label htmlFor={isRegister ? "reg-username" : "log-username"} className={darkMode ? 'text-gray-300' : 'text-gray-700'}>Nombre de Usuario</Label>
          <div className="relative">
            <User className={`absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 ${darkMode ? 'text-gray-500' : 'text-gray-400'}`} />
            <Input
              id={isRegister ? "reg-username" : "log-username"}
              type="text"
              placeholder="TuNombreDeUsuario"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              className={`pl-10 ${darkMode ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400 focus:border-sky-500' : 'focus:border-blue-500'}`}
            />
          </div>
        </div>
      )}
      <div className="space-y-2">
        <Label htmlFor={isRegister ? "reg-email" : "log-email"} className={darkMode ? 'text-gray-300' : 'text-gray-700'}>Correo Electrónico</Label>
        <div className="relative">
          <Mail className={`absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 ${darkMode ? 'text-gray-500' : 'text-gray-400'}`} />
          <Input
            id={isRegister ? "reg-email" : "log-email"}
            type="email"
            placeholder="tu@ejemplo.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className={`pl-10 ${darkMode ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400 focus:border-sky-500' : 'focus:border-blue-500'}`}
          />
        </div>
      </div>
      <div className="space-y-2">
        <Label htmlFor={isRegister ? "reg-password" : "log-password"} className={darkMode ? 'text-gray-300' : 'text-gray-700'}>Contraseña</Label>
        <div className="relative">
          <Lock className={`absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 ${darkMode ? 'text-gray-500' : 'text-gray-400'}`} />
          <Input
            id={isRegister ? "reg-password" : "log-password"}
            type={showPassword ? "text" : "password"}
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className={`pl-10 pr-10 ${darkMode ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400 focus:border-sky-500' : 'focus:border-blue-500'}`}
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className={`absolute right-3 top-1/2 transform -translate-y-1/2 ${darkMode ? 'text-gray-400 hover:text-gray-200' : 'text-gray-500 hover:text-gray-700'}`}
          >
            {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
          </button>
        </div>
      </div>
      {isRegister && (
        <div className="space-y-2">
          <Label htmlFor="confirm-password" className={darkMode ? 'text-gray-300' : 'text-gray-700'}>Confirmar Contraseña</Label>
          <div className="relative">
            <Lock className={`absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 ${darkMode ? 'text-gray-500' : 'text-gray-400'}`} />
            <Input
              id="confirm-password"
              type={showConfirmPassword ? "text" : "password"}
              placeholder="••••••••"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              className={`pl-10 pr-10 ${darkMode ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400 focus:border-sky-500' : 'focus:border-blue-500'}`}
            />
            <button
            type="button"
            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
            className={`absolute right-3 top-1/2 transform -translate-y-1/2 ${darkMode ? 'text-gray-400 hover:text-gray-200' : 'text-gray-500 hover:text-gray-700'}`}
          >
            {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
          </button>
          </div>
        </div>
      )}
      <Button type="submit" className={`w-full text-lg py-3 ${darkMode ? 'bg-sky-500 hover:bg-sky-600 text-white' : 'bg-blue-600 hover:bg-blue-700 text-white'}`}>
        {isRegister ? 'Crear Cuenta' : 'Iniciar Sesión'}
      </Button>
    </motion.form>
  );
};

function AuthPage() {
  const { toast } = useToast();
  const navigate = useNavigate();
  const { setCurrentUser, darkMode } = useOutletContext(); // Get setCurrentUser and darkMode from context

  const handleRegister = ({ username, email, password, confirmPassword }) => {
    if (password !== confirmPassword) {
      toast({ title: "Error de registro", description: "Las contraseñas no coinciden.", variant: "destructive" });
      return;
    }
    
    const users = JSON.parse(localStorage.getItem('users')) || [];
    if (users.find(user => user.email === email)) {
      toast({ title: "Error de registro", description: "El correo electrónico ya está en uso.", variant: "destructive" });
      return;
    }
    if (users.find(user => user.username === username)) {
      toast({ title: "Error de registro", description: "El nombre de usuario ya está en uso.", variant: "destructive" });
      return;
    }

    const newUser = { username, email, password, favoriteSport: '', skillLevel: '' };
    users.push(newUser);
    localStorage.setItem('users', JSON.stringify(users));
    localStorage.setItem('currentUser', JSON.stringify(newUser));
    setCurrentUser(newUser);
    toast({ title: "¡Registro Exitoso!", description: `Bienvenido/a, ${username}!` });
    navigate('/');
  };

  const handleLogin = ({ email, password }) => {
    const users = JSON.parse(localStorage.getItem('users')) || [];
    const user = users.find(user => user.email === email && user.password === password);

    if (user) {
      localStorage.setItem('currentUser', JSON.stringify(user));
      setCurrentUser(user);
      toast({ title: "¡Inicio de Sesión Exitoso!", description: `Bienvenido/a de nuevo, ${user.username}!` });
      navigate('/');
    } else {
      toast({ title: "Error de inicio de sesión", description: "Correo o contraseña incorrectos.", variant: "destructive" });
    }
  };

  return (
    <div className="flex items-center justify-center py-12 px-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
      >
        <Tabs defaultValue="login" className="w-full max-w-md">
          <TabsList className={`grid w-full grid-cols-2 ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-gray-100'}`}>
            <TabsTrigger value="login" className={darkMode ? 'data-[state=active]:bg-sky-600 data-[state=active]:text-white' : 'data-[state=active]:bg-blue-600 data-[state=active]:text-white'}>Iniciar Sesión</TabsTrigger>
            <TabsTrigger value="register" className={darkMode ? 'data-[state=active]:bg-sky-600 data-[state=active]:text-white' : 'data-[state=active]:bg-blue-600 data-[state=active]:text-white'}>Registrarse</TabsTrigger>
          </TabsList>
          <TabsContent value="login">
            <Card className={darkMode ? 'bg-gray-800/70 border-gray-700 backdrop-blur-md' : 'bg-white/70 border-gray-200 backdrop-blur-md'}>
              <CardHeader>
                <CardTitle className={`text-3xl font-bold text-center ${darkMode ? 'text-sky-400' : 'text-blue-700'}`}>¡Bienvenido/a de Nuevo!</CardTitle>
                <CardDescription className={`text-center ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  Ingresa tus credenciales para continuar.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <AuthForm onSubmit={handleLogin} darkMode={darkMode} />
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="register">
            <Card className={darkMode ? 'bg-gray-800/70 border-gray-700 backdrop-blur-md' : 'bg-white/70 border-gray-200 backdrop-blur-md'}>
              <CardHeader>
                <CardTitle className={`text-3xl font-bold text-center ${darkMode ? 'text-sky-400' : 'text-blue-700'}`}>Crea tu Cuenta</CardTitle>
                <CardDescription className={`text-center ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  Únete a la comunidad y no te pierdas ningún partido.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <AuthForm isRegister onSubmit={handleRegister} darkMode={darkMode} />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </motion.div>
    </div>
  );
}

export default AuthPage;
  