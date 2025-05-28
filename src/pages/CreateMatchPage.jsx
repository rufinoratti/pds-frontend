import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/components/ui/use-toast';
import { useNavigate, useOutletContext, Link } from 'react-router-dom';
import { CalendarPlus, MapPin, Users, Clock, BarChart3, AlertTriangle, Sparkles, ShieldPlus } from 'lucide-react';

const sports = ["Fútbol", "Básquet", "Vóley", "Tenis", "Pádel", "Otro"];
const levels = ["Cualquiera", "Principiante", "Intermedio", "Avanzado"];

function CreateMatchPage() {
  const { toast } = useToast();
  const navigate = useNavigate();
  const { currentUser, darkMode } = useOutletContext();

  const [sport, setSport] = useState('');
  const [playersNeeded, setPlayersNeeded] = useState('');
  const [duration, setDuration] = useState('');
  const [location, setLocation] = useState('');
  const [dateTime, setDateTime] = useState('');
  const [levelRequired, setLevelRequired] = useState('Cualquiera');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!currentUser) {
      toast({ title: "Error", description: "Debes iniciar sesión para crear un partido.", variant: "destructive" });
      navigate('/auth');
      return;
    }

    if (!sport || !playersNeeded || !duration || !location || !dateTime) {
        toast({ title: "Campos incompletos", description: "Por favor, rellena todos los campos obligatorios.", variant: "destructive" });
        return;
    }
    
    const newMatch = {
      id: Date.now().toString(), // Simple ID generation
      organizerId: currentUser.username, // Assuming username is unique ID
      organizerUsername: currentUser.username,
      sport,
      playersNeeded: parseInt(playersNeeded),
      duration: parseInt(duration),
      location,
      dateTime,
      levelRequired,
      status: "Necesitamos jugadores",
      players: [{ username: currentUser.username, email: currentUser.email }], // Añadir al creador como primer jugador
    };

    // Actualizar el estado si ya se alcanzó el número de jugadores necesarios
    if (newMatch.players.length >= newMatch.playersNeeded) {
      newMatch.status = "Partido armado";
    }

    const matches = JSON.parse(localStorage.getItem('matches')) || [];
    matches.push(newMatch);
    localStorage.setItem('matches', JSON.stringify(matches));

    toast({ title: "¡Partido Creado!", description: `Tu partido de ${sport} ha sido creado exitosamente.` });
    navigate(`/match/${newMatch.id}`);
  };
  
  if (!currentUser) {
    return (
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className={`text-center p-8 rounded-lg shadow-xl ${darkMode ? 'bg-gray-800/70 border border-gray-700' : 'bg-white/70 border border-gray-200'}`}
      >
        <ShieldPlus className={`mx-auto mb-4 h-16 w-16 ${darkMode ? 'text-sky-400' : 'text-blue-600'}`} />
        <h2 className={`text-3xl font-bold mb-4 ${darkMode ? 'text-sky-300' : 'text-blue-700'}`}>¡Crea Tu Propio Partido!</h2>
        <p className={`${darkMode ? 'text-gray-300' : 'text-gray-600'} mb-6 text-lg`}>
          Para organizar un partido, necesitas iniciar sesión o crear una cuenta.
        </p>
        <Button asChild size="lg" className={`${darkMode ? 'bg-sky-500 hover:bg-sky-600' : 'bg-blue-600 hover:bg-blue-700'}`}>
          <Link to="/auth">Acceder o Registrarse</Link>
        </Button>
      </motion.div>
    );
  }

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="max-w-2xl mx-auto"
    >
      <Card className={darkMode ? 'bg-gray-800/70 border-gray-700 backdrop-blur-md' : 'bg-white/70 border-gray-200 backdrop-blur-md shadow-xl'}>
        <CardHeader className="text-center">
          <CalendarPlus className={`mx-auto mb-4 h-12 w-12 ${darkMode ? 'text-sky-400' : 'text-blue-600'}`} />
          <CardTitle className={`text-4xl font-extrabold ${darkMode ? 'text-transparent bg-clip-text bg-gradient-to-r from-sky-400 to-blue-500' : 'text-transparent bg-clip-text bg-gradient-to-r from-sky-600 to-blue-700'}`}>
            Organiza un Nuevo Partido
          </CardTitle>
          <CardDescription className={`${darkMode ? 'text-gray-400' : 'text-gray-600'} text-lg`}>
            Define los detalles y encuentra jugadores para tu próximo encuentro.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="sport" className={darkMode ? 'text-gray-300' : 'text-gray-700'}>Deporte*</Label>
                <Select value={sport} onValueChange={setSport} required>
                  <SelectTrigger id="sport" className={darkMode ? 'bg-gray-700 border-gray-600 text-white' : ''}>
                    <SelectValue placeholder="Selecciona un deporte" />
                  </SelectTrigger>
                  <SelectContent className={darkMode ? 'bg-gray-800 border-gray-700 text-gray-200' : ''}>
                    {sports.map(s => <SelectItem key={s} value={s} className={darkMode ? 'hover:bg-gray-700' : ''}>{s}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="playersNeeded" className={darkMode ? 'text-gray-300' : 'text-gray-700'}>Jugadores Necesarios*</Label>
                 <div className="relative">
                    <Users className={`absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 ${darkMode ? 'text-gray-500' : 'text-gray-400'}`} />
                    <Input id="playersNeeded" type="number" placeholder="Ej: 10" value={playersNeeded} onChange={(e) => setPlayersNeeded(e.target.value)} required className={`pl-10 ${darkMode ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400 focus:border-sky-500' : 'focus:border-blue-500'}`} min="1" />
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="location" className={darkMode ? 'text-gray-300' : 'text-gray-700'}>Ubicación*</Label>
              <div className="relative">
                <MapPin className={`absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 ${darkMode ? 'text-gray-500' : 'text-gray-400'}`} />
                <Input id="location" type="text" placeholder="Ej: Cancha El Potrero, Calle Falsa 123" value={location} onChange={(e) => setLocation(e.target.value)} required className={`pl-10 ${darkMode ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400 focus:border-sky-500' : 'focus:border-blue-500'}`} />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="dateTime" className={darkMode ? 'text-gray-300' : 'text-gray-700'}>Fecha y Hora*</Label>
                <Input id="dateTime" type="datetime-local" value={dateTime} onChange={(e) => setDateTime(e.target.value)} required className={darkMode ? 'bg-gray-700 border-gray-600 text-white focus:border-sky-500 [&::-webkit-calendar-picker-indicator]:bg-gray-500' : 'focus:border-blue-500'} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="duration" className={darkMode ? 'text-gray-300' : 'text-gray-700'}>Duración (minutos)*</Label>
                 <div className="relative">
                    <Clock className={`absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 ${darkMode ? 'text-gray-500' : 'text-gray-400'}`} />
                    <Input id="duration" type="number" placeholder="Ej: 90" value={duration} onChange={(e) => setDuration(e.target.value)} required className={`pl-10 ${darkMode ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400 focus:border-sky-500' : 'focus:border-blue-500'}`} min="10" />
                </div>
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="levelRequired" className={darkMode ? 'text-gray-300' : 'text-gray-700'}>Nivel Requerido</Label>
               <div className="relative">
                 <BarChart3 className={`absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 ${darkMode ? 'text-gray-500' : 'text-gray-400'}`} />
                <Select value={levelRequired} onValueChange={setLevelRequired}>
                    <SelectTrigger id="levelRequired" className={`pl-10 ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : ''}`}>
                        <SelectValue placeholder="Selecciona un nivel" />
                    </SelectTrigger>
                    <SelectContent className={darkMode ? 'bg-gray-800 border-gray-700 text-gray-200' : ''}>
                        {levels.map(level => <SelectItem key={level} value={level} className={darkMode ? 'hover:bg-gray-700' : ''}>{level}</SelectItem>)}
                    </SelectContent>
                </Select>
              </div>
            </div>
            
            <div className="flex items-start space-x-3 pt-2">
              <AlertTriangle className={`h-5 w-5 mt-0.5 ${darkMode ? 'text-yellow-400' : 'text-yellow-500'}`} />
              <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                Campos marcados con * son obligatorios. Asegúrate de que la información sea clara para atraer a los jugadores correctos.
              </p>
            </div>

            <Button type="submit" className={`w-full text-lg py-3 mt-4 ${darkMode ? 'bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-600 hover:to-blue-700 text-white' : 'bg-gradient-to-r from-sky-600 to-blue-700 hover:from-sky-700 hover:to-blue-800 text-white'}`}>
              <Sparkles className="mr-2 h-5 w-5" />
              Crear Partido
            </Button>
          </form>
        </CardContent>
      </Card>
    </motion.div>
  );
}

export default CreateMatchPage;
  