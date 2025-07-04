import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/components/ui/use-toast';
import { useNavigate, useOutletContext, Link } from 'react-router-dom';
import { CalendarPlus, MapPin, Users, Clock, BarChart3, AlertTriangle, Sparkles, ShieldPlus, Trophy } from 'lucide-react';
import { getAllZones } from '@/services/zones';
import { getSports } from '@/services/getSports';
import { createMatch } from '../services/getMatches';
import useUserStore from '@/store/userStore';

//const sports = ["Fútbol", "Básquet", "Vóley", "Tenis", "Pádel", "Otro"];
const levels = [
  { label: "Cualquier nivel", min: 1, max: 3 },
  { label: "Solo principiantes", min: 1, max: 1 },
  { label: "Solo intermedios", min: 2, max: 2 },
  { label: "Solo avanzados", min: 3, max: 3 },
  { label: "Intermedio a avanzado", min: 2, max: 3 }
];

const tiposEmparejamiento = [
  { value: "ZONA", label: "Por zona geográfica" },
  { value: "NIVEL", label: "Por nivel de juego" },
  { value: "HISTORIAL", label: "Por historial de partidos" },
  { value: "LIBRE", label: "Libre (cualquier jugador)" }
];

function CreateMatchPage() {
  const { toast } = useToast();
  const navigate = useNavigate();
  const { darkMode } = useOutletContext();
  const { currentUser } = useUserStore();
  const [zones, setZones] = useState([]);
  const [sports, setSports] = useState([]);
  const [matchData, setMatchData] = useState({
    sport: '',
    playersNeeded: 2,
    duration: 120, // en minutos
    direccion: '',
    zona: '',
    dateTime: '',
    requiredLevel: 'Cualquier nivel',
    tipoEmparejamiento: 'ZONA'
  });

  console.log(matchData)

  React.useEffect(() => {
    const loadData = async () => {
      const [zonesData, sportsData] = await Promise.all([
        getAllZones(),
        getSports()
      ]);
      setZones(zonesData);
      setSports(sportsData);
    };
    loadData();
  }, []);
  const handleInputChange = (field, value) => {
    setMatchData(prev => ({ ...prev, [field]: value }));
  };
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!currentUser) {
      toast({ title: "Error", description: "Debes iniciar sesión para crear un partido.", variant: "destructive" });
      navigate('/auth');
      return;
    }    if (!matchData.sport || !matchData.playersNeeded || !matchData.duration || !matchData.zona || !matchData.dateTime || !matchData.direccion || !matchData.tipoEmparejamiento) {
      toast({ title: "Campos incompletos", description: "Por favor, rellena todos los campos obligatorios.", variant: "destructive" });
      return;
    }

    // Encontrar el nivel seleccionado para obtener min y max
    const selectedLevel = levels.find(l => l.label === matchData.requiredLevel);
    
    const newMatch = {
      zonaId: zones.find(z => z.nombre === matchData.zona)?.id,
      deporteId: sports.find(s => s.nombre === matchData.sport)?.id,
      organizadorId: currentUser.id,
      fecha: matchData.dateTime.split('T')[0],
      hora: matchData.dateTime.split('T')[1],
      duracion: matchData.duration / 60, // convertir minutos a horas
      direccion: matchData.direccion,
      tipoEmparejamiento: matchData.tipoEmparejamiento,
      nivelMinimo: selectedLevel ? selectedLevel.min : 1,
      nivelMaximo: selectedLevel ? selectedLevel.max : 3,
      cantidadJugadores: matchData.playersNeeded
    };

    try {
      const response = await createMatch(newMatch);
      
      if (response) {
        toast({ title: "¡Partido Creado!", description: `Tu partido de ${matchData.sport} ha sido creado exitosamente.` });
        navigate(`/match/${response.id}`);
      } else {
        toast({ title: "Error", description: "No se pudo crear el partido. Por favor intente nuevamente.", variant: "destructive" });
      }
    } catch (error) {
      console.error('Error creating match:', error);
      toast({ title: "Error", description: "No se pudo crear el partido. Por favor intente nuevamente.", variant: "destructive" });
    }
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
            <div className="space-y-4">
              <div>
                <Label htmlFor="sport" className={`flex items-center text-sm font-medium mb-1 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                  <Trophy className="mr-2 h-4 w-4 text-yellow-500" /> Deporte *
                </Label>
                <Select value={matchData.sport} onValueChange={(value) => handleInputChange('sport', value)}>
                  <SelectTrigger id="sport" className={darkMode ? 'bg-gray-600 border-gray-500 text-white' : ''}>
                    <SelectValue placeholder="Elige un deporte" />
                  </SelectTrigger>
                  <SelectContent className={darkMode ? 'bg-gray-700 border-gray-600 text-gray-200' : ''}>
                    {sports.map(s => <SelectItem key={s.id} value={s.nombre} className={darkMode ? 'hover:bg-gray-600' : ''}>{s.nombre}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="playersNeeded" className={`flex items-center text-sm font-medium mb-1 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                  <Users className="mr-2 h-4 w-4 text-blue-500" /> Jugadores Necesarios *
                </Label>
                <Input
                  id="playersNeeded"
                  type="number"
                  min="2"
                  max="22"
                  value={matchData.playersNeeded}
                  onChange={(e) => handleInputChange('playersNeeded', parseInt(e.target.value))}
                  className={darkMode ? 'bg-gray-600 border-gray-500 text-white' : ''}
                />
              </div>              <div>
                <Label htmlFor="requiredLevel" className={`flex items-center text-sm font-medium mb-1 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                  <Trophy className="mr-2 h-4 w-4 text-yellow-500" /> Nivel Requerido
                </Label>
                <Select value={matchData.requiredLevel} onValueChange={(value) => handleInputChange('requiredLevel', value)}>
                  <SelectTrigger id="requiredLevel" className={darkMode ? 'bg-gray-600 border-gray-500 text-white' : ''}>
                    <SelectValue placeholder="Selecciona el nivel requerido" />
                  </SelectTrigger>
                  <SelectContent className={darkMode ? 'bg-gray-700 border-gray-600 text-gray-200' : ''}>
                    {levels.map(l => <SelectItem key={l.label} value={l.label} className={darkMode ? 'hover:bg-gray-600' : ''}>{l.label}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="tipoEmparejamiento" className={`flex items-center text-sm font-medium mb-1 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                  <ShieldPlus className="mr-2 h-4 w-4 text-purple-500" /> Tipo de Emparejamiento *
                </Label>
                <Select value={matchData.tipoEmparejamiento} onValueChange={(value) => handleInputChange('tipoEmparejamiento', value)}>
                  <SelectTrigger id="tipoEmparejamiento" className={darkMode ? 'bg-gray-600 border-gray-500 text-white' : ''}>
                    <SelectValue placeholder="Selecciona el tipo de emparejamiento" />
                  </SelectTrigger>
                  <SelectContent className={darkMode ? 'bg-gray-700 border-gray-600 text-gray-200' : ''}>
                    {tiposEmparejamiento.map(tipo => (
                      <SelectItem key={tipo.value} value={tipo.value} className={darkMode ? 'hover:bg-gray-600' : ''}>
                        {tipo.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="duration" className={`flex items-center text-sm font-medium mb-1 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                  <Clock className="mr-2 h-4 w-4 text-green-500" /> Duración (minutos) *
                </Label>
                <Input
                  id="duration"
                  type="number"
                  min="30"
                  max="180"
                  step="30"
                  value={matchData.duration}
                  onChange={(e) => handleInputChange('duration', parseInt(e.target.value))}
                  className={darkMode ? 'bg-gray-600 border-gray-500 text-white' : ''}
                />
              </div>
              <div>
                <Label htmlFor="direccion" className={`flex items-center text-sm font-medium mb-1 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                  <MapPin className="mr-2 h-4 w-4 text-red-500" /> Dirección *
                </Label>
                <Input
                  id="direccion"
                  type="text"
                  value={matchData.direccion}
                  onChange={(e) => handleInputChange('direccion', e.target.value)}
                  placeholder="Ej: Av. Libertador 1234"
                  className={darkMode ? 'bg-gray-600 border-gray-500 text-white' : ''}
                />
              </div>

              <div>
                <Label htmlFor="zona" className={`flex items-center text-sm font-medium mb-1 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                  <MapPin className="mr-2 h-4 w-4 text-red-500" /> Zona *
                </Label>
                <Select value={matchData.zona} onValueChange={(value) => handleInputChange('zona', value)}>
                  <SelectTrigger id="zona" className={darkMode ? 'bg-gray-600 border-gray-500 text-white' : ''}>
                    <SelectValue placeholder="Elige una zona" />
                  </SelectTrigger>
                  <SelectContent className={darkMode ? 'bg-gray-700 border-gray-600 text-gray-200' : ''}>
                    {zones.map(s => <SelectItem key={s.id} value={s.nombre} className={darkMode ? 'hover:bg-gray-600' : ''}>{s.nombre}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="dateTime" className={`flex items-center text-sm font-medium mb-1 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                  <CalendarPlus className="mr-2 h-4 w-4 text-purple-500" /> Fecha y Hora *
                </Label>
                <Input
                  id="dateTime"
                  type="datetime-local"
                  value={matchData.dateTime}
                  onChange={(e) => handleInputChange('dateTime', e.target.value)}
                  className={darkMode ? 'bg-gray-600 border-gray-500 text-white' : ''}
                />
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
