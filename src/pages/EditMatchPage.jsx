import React, { useState, useEffect } from 'react';
import { useToast } from '@/components/ui/use-toast';
import { useNavigate, useOutletContext, useParams } from 'react-router-dom';
import { CalendarPlus, MapPin, Users, Clock, AlertTriangle, Sparkles, ShieldPlus, Trophy, Shirt } from 'lucide-react';
import { motion } from 'framer-motion';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

import { getMatchById } from '@/services/getMatches';
import { getSports } from '@/services/getSports';
import { getAllZones } from '@/services/zones';
import { updateMatch } from '../services/getMatches';

const levels = ["Cualquier nivel", "Principiante", "Intermedio", "Avanzado"];
const teams = ["none", "Equipo A", "Equipo B"]; // Changed empty string to 'none'

function EditMatchPage() {
  const { matchId } = useParams();
  const { toast } = useToast();
  const navigate = useNavigate();
  const context = useOutletContext();

  // Verificar que el contexto esté disponible
  if (!context) {
    console.error('Contexto no disponible');
    return (
      <div className="flex justify-center items-center h-screen">
        <p className="text-red-500">Error: Contexto de usuario no disponible. Asegúrate de estar logueado.</p>
      </div>
    );
  }

  const { currentUser, darkMode } = context;

  const [matchData, setMatchData] = useState({
    sport: '',
    playersNeeded: 2,
    duration: 60,
    location: '',
    dateTime: '',
    requiredLevel: 'Cualquier nivel',
    players: [],
    teams: { teamA: [], teamB: [] }
  });
  const [sports, setSports] = useState([]);
  const [zones, setZones] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isOrganizer, setIsOrganizer] = useState(false);


  useEffect(() => {
    const fetchMatch = async () => {
      try {
        const matchToEdit = await getMatchById(matchId);
        if (matchToEdit) {
          console.log('matchToEdit found:', matchToEdit);
          // Format dateTime for the input field
          // Join fecha and hora fields into dateTime format
          const fecha = matchToEdit.fecha || '';
          const hora = matchToEdit.hora || '';
          const formattedDateTime = fecha && hora ? `${fecha}T${hora}` : '';

          setMatchData({
            sport: matchToEdit.deporte.nombre || '',
            playersNeeded: matchToEdit.cantidadJugadores || 2,
            duration: matchToEdit.duracion * 60 || 60,
            location: matchToEdit.direccion || '',
            dateTime: formattedDateTime || '',
            requiredLevel: matchToEdit.levelRequired || 'Cualquier nivel',
            players: matchToEdit.participantes || [],
            teams: matchToEdit.teams || { teamA: [], teamB: [] }
          });
          
          // Set isOrganizer based on fetched match data and currentUser
          const userIsOrganizer = currentUser && matchToEdit.organizerId === currentUser.id; // Cambiar a ID
          setIsOrganizer(userIsOrganizer);
        } else {
          console.log('matchToEdit not found for id:', matchId);
          toast({ title: "Error", description: "Partido no encontrado para editar.", variant: "destructive" });
          navigate('/find-match');
        }
      } catch (error) {
        console.error('Error fetching match:', error);
        toast({ title: "Error", description: "Error al cargar el partido.", variant: "destructive" });
        navigate('/find-match');
      } finally {
        setLoading(false);
      }
    };

    const getData = async () => {
      const [sports, zones] = await Promise.all([
        getSports(),
        getAllZones()
      ]);
      setSports(sports);
      setZones(zones);
    };

    fetchMatch();
    getData();
  }, [matchId, navigate, toast, currentUser]);

  const handleInputChange = (field, value) => {
    setMatchData(prev => ({ ...prev, [field]: value }));
  };

  const handleTeamAssignment = (playerUsername, team) => {
    setMatchData(prev => {
      const newTeams = { ...prev.teams };
      
      // Remove player from both teams
      newTeams.teamA = newTeams.teamA.filter(p => p !== playerUsername);
      newTeams.teamB = newTeams.teamB.filter(p => p !== playerUsername);
      
      // Add player to selected team if not 'none'
      if (team === 'Equipo A') {
        newTeams.teamA.push(playerUsername);
      } else if (team === 'Equipo B') {
        newTeams.teamB.push(playerUsername);
      }
      // If team is 'none', the player is already removed from both teams above
      
      return { ...prev, teams: newTeams };
    });
  };


  const handleSubmit = async (e) => {
    e.preventDefault();

    // Check if isOrganizer is true before allowing submit
    if (!isOrganizer) {
       toast({ title: "Acceso denegado", description: "Solo el organizador puede editar este partido.", variant: "destructive" });
       return;
    }


     if (!matchData.sport || !matchData.playersNeeded || !matchData.duration || !matchData.location || !matchData.dateTime) {
        toast({ title: "Campos incompletos", description: "Por favor, rellena todos los campos obligatorios.", variant: "destructive" });
        return;
    }

    const updatedMatch = {
      ...matchData,
      deporteId: matchData.sport,
      cantidadJugadores: matchData.playersNeeded,
      duracion: matchData.duration,
      direccion: matchData.location,
      fecha: matchData.dateTime.split('T')[0],
      hora: matchData.dateTime.split('T')[1],
      levelRequired: matchData.requiredLevel,
      participantes: matchData.players,
    }

    const response = await updateMatch(updatedMatch);


  };

  // Show loading state
  if (loading) {
       return (
        <div className="flex justify-center items-center h-64">
            <Sparkles className={`h-12 w-12 animate-spin ${darkMode ? 'text-sky-400' : 'text-blue-600'}`} />
            <p className={`ml-4 text-xl ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Cargando datos del partido...</p>
        </div>
    );
  }

  // Show access denied message if not organizer after loading
   if (!isOrganizer) {
     return (
       <motion.div 
         initial={{ opacity: 0, y: 20 }}
         animate={{ opacity: 1, y: 0 }}
         transition={{ duration: 0.5 }}
         className={`text-center p-8 rounded-lg shadow-xl ${darkMode ? 'bg-gray-800/70 border border-gray-700' : 'bg-white/70 border border-gray-200'}`}
       >
         <ShieldPlus className={`mx-auto mb-4 h-16 w-16 ${darkMode ? 'text-sky-400' : 'text-blue-600'}`} />
         <h2 className={`text-3xl font-bold mb-4 ${darkMode ? 'text-sky-300' : 'text-blue-700'}`}>Acceso Denegado</h2>
         <p className={`${darkMode ? 'text-gray-300' : 'text-gray-600'} mb-6 text-lg`}>
           Solo el organizador puede editar este partido.
         </p>
         <Button onClick={() => navigate('/find-match')} size="lg" className={`${darkMode ? 'bg-sky-500 hover:bg-sky-600' : 'bg-blue-600 hover:bg-blue-700'}`}>
           Volver a la búsqueda
         </Button>
       </motion.div>
     );
   }

  // If loading is false and isOrganizer is true, render the form
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

            {/* Team Assignment Section */}
            {matchData.players.length > 0 && (
              <div className="mt-8">
                <Label className={`flex items-center text-lg font-medium mb-4 ${darkMode ? 'text-sky-300' : 'text-blue-700'}`}>
                  <Shirt className="mr-2 h-5 w-5" /> Asignación de Equipos
                </Label>
                <div className="space-y-4">
                  {matchData.players.map(player => {
                    const assignedTeam = matchData.teams.teamA.includes(player.username) ? 'Equipo A' :
                                         matchData.teams.teamB.includes(player.username) ? 'Equipo B' : 'none';
                    return (
                      <div key={player.username} className="flex items-center justify-between p-3 rounded-lg bg-gray-100 dark:bg-gray-700">
                        <div className="flex items-center">
                           <img 
                            alt={player.username} 
                            className={`h-8 w-8 rounded-full mr-3 ${darkMode ? 'border-2 border-sky-500' : 'border-2 border-blue-500'}`}
                            src="https://images.unsplash.com/photo-1643101447193-9c59d5db2771" // Placeholder image
                          />
                          <span className={`${darkMode ? 'text-gray-200' : 'text-gray-800'}`}>{player.username}</span>
                        </div>
                        <Select
                          value={assignedTeam}
                          onValueChange={(value) => handleTeamAssignment(player.username, value)}
                        >
                          <SelectTrigger className="w-40">
                            <SelectValue placeholder="Seleccionar equipo" />
                          </SelectTrigger>
                          <SelectContent>
                            {teams.map(team => (
                              <SelectItem key={team} value={team}>{team === 'none' ? 'Sin asignar' : team}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

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