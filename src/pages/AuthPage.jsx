import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/components/ui/use-toast';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import useUserStore from '@/store/userStore';
import { signup, login } from '@/services/auth';
import { getAllZones } from '@/services/zones';
import { getSports } from '@/services/getSports';

function AuthPage() {
  const [isLogin, setIsLogin] = React.useState(true);
  const [formData, setFormData] = React.useState({
    nombre: '',
    email: '',
    password: '',
    nivel: 1,
    zonaId: '',
    deporteId: '',
  });
  const [isLoading, setIsLoading] = React.useState(false);
  const [zones, setZones] = React.useState([]);
  const [sports, setSports] = React.useState([]);
  const { toast } = useToast();
  const navigate = useNavigate();
  const { currentUser, setUser, logout } = useUserStore();

  // Cargar zonas y deportes al montar el componente
  React.useEffect(() => {
    const loadData = async () => {
      try {
        const [zonesData, sportsData] = await Promise.all([
          getAllZones(),
          getSports()
        ]);
        setZones(zonesData);
        setSports(sportsData);
      } catch (error) {
        console.error('Error loading zones and sports:', error);
        toast({
          title: "Error",
          description: "No se pudieron cargar las zonas y deportes.",
          variant: "destructive",
        });
      }
    };

    loadData();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      let response;
      
      if (isLogin) {
        // Usar el service de login
        response = await login({
          email: formData.email,
          password: formData.password
        });
        
        // Actualizar el estado global del usuario
        // El usuario está en response.data.user según la estructura del backend
        if (response.data && response.data.user) {
          setUser(response.data.user);
        }
        
        toast({
          title: "¡Bienvenido!",
          description: "Has iniciado sesión exitosamente.",
        });
        navigate('/');
      } else {
        // Usar el service de signup
        response = await signup({
          nombre: formData.nombre,
          email: formData.email,
          password: formData.password,
          nivel: parseInt(formData.nivel),
          zonaId: formData.zonaId,
          deporteId: formData.deporteId
        });
        
        toast({
          title: "¡Registro exitoso!",
          description: "Tu cuenta ha sido creada. Por favor, inicia sesión.",
        });
        setIsLogin(true);
        setFormData({ 
          nombre: '', 
          email: '', 
          password: '', 
          nivel: 1, 
          zonaId: '', 
          deporteId: '' 
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: error.message || "Ha ocurrido un error. Por favor, intenta de nuevo.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSelectChange = (name, value) => {
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  return (
    <div className="container mx-auto flex items-center justify-center min-h-[calc(100vh-4rem)] py-8">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-2xl text-center">
            {isLogin ? 'Iniciar Sesión' : 'Crear Cuenta'}
          </CardTitle>
          <CardDescription className="text-center">
            {isLogin 
              ? 'Ingresa tus credenciales para acceder a tu cuenta'
              : 'Completa el formulario para crear tu cuenta'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {!isLogin && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="nombre">Nombre completo</Label>
                  <Input
                    id="nombre"
                    name="nombre"
                    type="text"
                    placeholder="Juan Pérez"
                    value={formData.nombre}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="nivel">Nivel de habilidad</Label>
                  <Select onValueChange={(value) => handleSelectChange('nivel', parseInt(value))} value={formData.nivel.toString()}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecciona tu nivel" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">1 - Principiante</SelectItem>
                      <SelectItem value="2">2 - Intermedio</SelectItem>
                      <SelectItem value="3">3 - Avanzado</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="zonaId">Zona</Label>
                  <Select onValueChange={(value) => handleSelectChange('zonaId', value)} value={formData.zonaId}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecciona una zona" />
                    </SelectTrigger>
                    <SelectContent>
                      {zones.map((zone) => (
                        <SelectItem key={zone.id} value={zone.id}>
                          {zone.nombre}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="deporteId">Deporte</Label>
                  <Select onValueChange={(value) => handleSelectChange('deporteId', value)} value={formData.deporteId}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecciona un deporte" />
                    </SelectTrigger>
                    <SelectContent>
                      {sports.map((sport) => (
                        <SelectItem key={sport.id} value={sport.id}>
                          {sport.nombre}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </>
            )}
            <div className="space-y-2">
              <Label htmlFor="email">Correo electrónico</Label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="john@example.com"
                value={formData.email}
                onChange={handleChange}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Contraseña</Label>
              <Input
                id="password"
                name="password"
                type="password"
                placeholder="••••••••"
                value={formData.password}
                onChange={handleChange}
                required
              />
            </div>
            <Button 
              type="submit" 
              className="w-full"
              disabled={isLoading}
            >
              {isLoading ? 'Cargando...' : isLogin ? 'Iniciar Sesión' : 'Registrarse'}
            </Button>
          </form>
        </CardContent>
        <CardFooter className="flex justify-center">
          <Button
            variant="link"
            onClick={() => setIsLogin(!isLogin)}
            className="text-sm"
          >
            {isLogin 
              ? '¿No tienes una cuenta? Regístrate'
              : '¿Ya tienes una cuenta? Inicia sesión'}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}

export default AuthPage;
