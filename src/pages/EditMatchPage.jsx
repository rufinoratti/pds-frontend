import React, { useState, useEffect } from 'react';
import { useToast } from '@/components/ui/use-toast';
import { useNavigate, useOutletContext, useParams } from 'react-router-dom';
import { CalendarPlus, MapPin, Users, Clock, BarChart3, AlertTriangle, Sparkles, ShieldPlus, Trophy } from 'lucide-react';
import { motion } from 'framer-motion';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';

const sports = ["Fútbol", "Básquet", "Vóley", "Tenis", "Pádel", "Otro"];
const levels = ["Cualquier nivel", "Principiante", "Intermedio", "Avanzado"];

function EditMatchPage() {
  const { matchId } = useParams();
  const { toast } = useToast();
  const navigate = useNavigate();
  const { currentUser, darkMode } = useOutletContext();

  const [matchData, setMatchData] = useState({
    sport: '',
    playersNeeded: 2,
    duration: 60,
    location: '',
    dateTime: '',
    requiredLevel: 'Cualquier nivel'
  });
  
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedMatches = JSON.parse(localStorage.getItem('matches')) || [];
    const matchToEdit = storedMatches.find(m => m.id === matchId);

    if (matchToEdit) {
      // Format dateTime for the input field
      const [datePart, timePart] = matchToEdit.dateTime.split('T');
      const formattedDateTime = `${datePart}T${timePart}`;

      setMatchData({
        sport: matchToEdit.sport || '',
        playersNeeded: matchToEdit.playersNeeded || 2,
        duration: matchToEdit.duration || 60,
        location: matchToEdit.location || '',
        dateTime: formattedDateTime || '',
        requiredLevel: matchToEdit.levelRequired || 'Cualquier nivel'
      });
      setLoading(false);
    } else {
      toast({ title: "Error", description: "Partido no encontrado para editar.", variant: "destructive" });
      navigate('/');
    }
  }, [matchId, navigate, toast]);

  const handleInputChange = (field, value) => {
    setMatchData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!currentUser) {
      toast({ title: "Error", description: "Debes iniciar sesión para editar un partido.", variant: "destructive" });
      navigate('/auth');
      return;
    }

     if (!matchData.sport || !matchData.playersNeeded || !matchData.duration || !matchData.location || !matchData.dateTime) {
        toast({ title: "Campos incompletos", description: "Por favor, rellena todos los campos obligatorios.", variant: "destructive" });
        return;
    }

    const storedMatches = JSON.parse(localStorage.getItem('matches')) || [];
    const matchIndex = storedMatches.findIndex(m => m.id === matchId);

    if (matchIndex !== -1) {
      const updatedMatch = {
        ...storedMatches[matchIndex],
        sport: matchData.sport,
        playersNeeded: matchData.playersNeeded,
        duration: matchData.duration,
        location: matchData.location,
        dateTime: matchData.dateTime,
        levelRequired: matchData.requiredLevel,
        // Note: We are not changing players or status via this form to keep it simple.
        // More complex logic would be needed if these fields were editable here.
      };

      storedMatches[matchIndex] = updatedMatch;
      localStorage.setItem('matches', JSON.stringify(storedMatches));

      toast({ title: "¡Partido Actualizado!", description: "Los cambios han sido guardados.", variant: "default" });
      navigate(`/match/${matchId}`); // Navigate back to the details page
    } else {
       toast({ title: "Error", description: "No se pudo encontrar el partido para actualizar.", variant: "destructive" });
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
        <h2 className={`text-3xl font-bold mb-4 ${darkMode ? 'text-sky-300' : 'text-blue-700'}`}>¡Edita Tu Partido!</h2>
        <p className={`${darkMode ? 'text-gray-300' : 'text-gray-600'} mb-6 text-lg`}>
          Para editar un partido, necesitas iniciar sesión.
        </p>
        <Button asChild size="lg" className={`${darkMode ? 'bg-sky-500 hover:bg-sky-600' : 'bg-blue-600 hover:bg-blue-700'}`}>
          <Link to="/auth">Acceder o Registrarse</Link>
        </Button>
      </motion.div>
    );
  }
  
  if (loading) {
       return (
        <div className="flex justify-center items-center h-64">
            <Sparkles className={`h-12 w-12 animate-spin ${darkMode ? 'text-sky-400' : 'text-blue-600'}`} />
            <p className={`ml-4 text-xl ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Cargando datos del partido...</p>
        </div>
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
            Editar Partido
          </CardTitle>
          <CardDescription className={`${darkMode ? 'text-gray-400' : 'text-gray-600'} text-lg`}>
            Modifica los detalles de tu partido.
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
                    {sports.map(s => <SelectItem key={s} value={s} className={darkMode ? 'hover:bg-gray-600' : ''}>{s}</SelectItem>)}
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
              </div>

              <div>
                <Label htmlFor="requiredLevel" className={`flex items-center text-sm font-medium mb-1 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                  <Trophy className="mr-2 h-4 w-4 text-yellow-500" /> Nivel Requerido
                </Label>
                <Select value={matchData.requiredLevel} onValueChange={(value) => handleInputChange('requiredLevel', value)}>
                  <SelectTrigger id="requiredLevel" className={darkMode ? 'bg-gray-600 border-gray-500 text-white' : ''}>
                    <SelectValue placeholder="Selecciona el nivel requerido" />
                  </SelectTrigger>
                  <SelectContent className={darkMode ? 'bg-gray-700 border-gray-600 text-gray-200' : ''}>
                    {levels.map(l => <SelectItem key={l} value={l} className={darkMode ? 'hover:bg-gray-600' : ''}>{l}</SelectItem>)}
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
                <Label htmlFor="location" className={`flex items-center text-sm font-medium mb-1 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                  <MapPin className="mr-2 h-4 w-4 text-red-500" /> Ubicación *
                </Label>
                <Input
                  id="location"
                  type="text"
                  value={matchData.location}
                  onChange={(e) => handleInputChange('location', e.target.value)}
                  placeholder="Ingresa la ubicación del partido"
                  className={darkMode ? 'bg-gray-600 border-gray-500 text-white' : ''}
                />
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
                Campos marcados con * son obligatorios.
              </p>
            </div>

            <Button type="submit" className={`w-full text-lg py-3 mt-4 ${darkMode ? 'bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-600 hover:to-blue-700 text-white' : 'bg-gradient-to-r from-sky-600 to-blue-700 hover:from-sky-700 hover:to-blue-800 text-white'}`}>
              <Sparkles className="mr-2 h-5 w-5" />
              Guardar Cambios
            </Button>
          </form>
        </CardContent>
      </Card>
    </motion.div>
  );
}

export default EditMatchPage; 