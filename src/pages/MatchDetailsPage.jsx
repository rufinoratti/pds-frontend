import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useOutletContext, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useToast } from '@/components/ui/use-toast';
import { MapPin, CalendarDays, Users, Clock, ShieldAlert, UserPlus, Trash2, Edit3, UserCheck, UserX, MessageSquare, AlertTriangle, Sparkles, ChevronLeft, ShieldCheck, ShieldQuestion, CheckCircle, XCircle, Trophy } from 'lucide-react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';

const MatchStatusBadge = ({ status, darkMode }) => {
  let bgColor, textColor, Icon;
  switch (status) {
    case 'Necesitamos jugadores':
      bgColor = darkMode ? 'bg-yellow-500/20' : 'bg-yellow-100';
      textColor = darkMode ? 'text-yellow-400' : 'text-yellow-600';
      Icon = ShieldAlert;
      break;
    case 'Partido armado':
      bgColor = darkMode ? 'bg-green-500/20' : 'bg-green-100';
      textColor = darkMode ? 'text-green-400' : 'text-green-600';
      Icon = ShieldCheck;
      break;
    case 'Confirmado':
      bgColor = darkMode ? 'bg-blue-500/20' : 'bg-blue-100';
      textColor = darkMode ? 'text-blue-400' : 'text-blue-600';
      Icon = CheckCircle;
      break;
    case 'En juego':
      bgColor = darkMode ? 'bg-purple-500/20' : 'bg-purple-100';
      textColor = darkMode ? 'text-purple-400' : 'text-purple-600';
      Icon = Clock;
      break;
    case 'Finalizado':
      bgColor = darkMode ? 'bg-gray-500/20' : 'bg-gray-100';
      textColor = darkMode ? 'text-gray-400' : 'text-gray-600';
      Icon = Trophy;
      break;
    case 'Cancelado':
      bgColor = darkMode ? 'bg-red-500/20' : 'bg-red-100';
      textColor = darkMode ? 'text-red-400' : 'text-red-600';
      Icon = XCircle;
      break;
    default:
      bgColor = darkMode ? 'bg-gray-500/20' : 'bg-gray-100';
      textColor = darkMode ? 'text-gray-400' : 'text-gray-500';
      Icon = ShieldQuestion;
  }
  return (
    <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${bgColor} ${textColor} shadow-md`}>
      <Icon className="w-4 h-4 mr-2" />
      {status}
    </div>
  );
};

function MatchDetailsPage() {
  const { matchId } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { currentUser, darkMode } = useOutletContext();
  const [match, setMatch] = useState(null);
  const [isPlayerJoined, setIsPlayerJoined] = useState(false);
  const [isOrganizer, setIsOrganizer] = useState(false);
  const [showResultDialog, setShowResultDialog] = useState(false);
  const [result, setResult] = useState({ teamAScore: '', teamBScore: '' });

  useEffect(() => {
    const storedMatches = JSON.parse(localStorage.getItem('matches')) || [];
    const currentMatch = storedMatches.find(m => m.id === matchId);
    
    if (currentMatch) {
      setMatch(currentMatch);
      if (currentUser) {
        setIsPlayerJoined(currentMatch.players && currentMatch.players.some(player => player.username === currentUser.username));
        setIsOrganizer(currentMatch.organizerUsername === currentUser.username);
      }
    } else {
      toast({ title: "Error", description: "Partido no encontrado.", variant: "destructive" });
      navigate('/find-match');
    }
  }, [matchId, currentUser, toast, navigate]);

  const updateMatchInStorage = (updatedMatch) => {
    const storedMatches = JSON.parse(localStorage.getItem('matches')) || [];
    const matchIndex = storedMatches.findIndex(m => m.id === updatedMatch.id);
    if (matchIndex !== -1) {
      storedMatches[matchIndex] = updatedMatch;
      localStorage.setItem('matches', JSON.stringify(storedMatches));
      setMatch(updatedMatch); // Update local state
    }
  };

  const handleJoinLeaveMatch = () => {
    if (!currentUser) {
      toast({ title: "Acción requerida", description: "Debes iniciar sesión para unirte.", variant: "default" });
      navigate('/auth');
      return;
    }

    let updatedMatch = { ...match };
    if (isPlayerJoined) { // Leave match
      updatedMatch.players = updatedMatch.players.filter(player => player.username !== currentUser.username);
      toast({ title: "Has salido del partido", description: `Ya no estás en la lista para ${match.sport}.` });
    } else { // Join match
      if (updatedMatch.players.length >= updatedMatch.playersNeeded) {
        toast({ title: "Partido Lleno", description: "Este partido ya ha alcanzado el número máximo de jugadores.", variant: "destructive" });
        return;
      }
      updatedMatch.players = [...updatedMatch.players, { username: currentUser.username, email: currentUser.email }]; // Add more user info if needed
      toast({ title: "¡Te has unido!", description: `Estás en la lista para ${match.sport}. ¡Prepárate!` });
    }

    // Auto-update status
    if (updatedMatch.players.length >= updatedMatch.playersNeeded) {
      if (updatedMatch.status === 'Necesitamos jugadores') {
        updatedMatch.status = 'Partido armado';
        toast({ title: "¡Equipo Completo!", description: "El partido ha alcanzado el número de jugadores necesarios.", variant: "default" });
      }
    } else {
      if (updatedMatch.status === 'Partido armado') {
         updatedMatch.status = 'Necesitamos jugadores';
         toast({ title: "Jugador se fue", description: "Un jugador ha dejado el partido, se necesitan más.", variant: "default" });
      }
    }
    
    updateMatchInStorage(updatedMatch);
    setIsPlayerJoined(!isPlayerJoined);
  };
  
  const handleCancelMatch = () => {
    if (!isOrganizer) return;
    const updatedMatch = { ...match, status: 'Cancelado' };
    updateMatchInStorage(updatedMatch);
    toast({ title: "Partido Cancelado", description: "El partido ha sido cancelado.", variant: "destructive" });
  };
  
  const handleConfirmMatch = () => {
    if (!isOrganizer) return;
    // This would typically involve checking if all players confirmed via notifications
    // For now, we just change the status
    const updatedMatch = { ...match, status: 'Confirmado' };
    updateMatchInStorage(updatedMatch);
    toast({ title: "Partido Confirmado", description: "El partido ha sido confirmado. ¡A jugar!", variant: "default" });
  };

  const handleStartMatch = () => {
    if (!isOrganizer) return;
    const updatedMatch = { ...match, status: 'En juego' };
    updateMatchInStorage(updatedMatch);
    toast({ title: "¡Partido Iniciado!", description: "El partido ha comenzado. ¡Buena suerte!", variant: "default" });
  };

  const handleFinishMatch = () => {
    if (!isOrganizer) return;
    setShowResultDialog(true);
  };

  const handleResultSubmit = () => {
    if (!result.teamAScore || !result.teamBScore) {
      toast({ title: "Error", description: "Por favor ingresa el resultado completo.", variant: "destructive" });
      return;
    }

    const teamAScore = parseInt(result.teamAScore);
    const teamBScore = parseInt(result.teamBScore);
    
    if (isNaN(teamAScore) || isNaN(teamBScore)) {
      toast({ title: "Error", description: "Los resultados deben ser números válidos.", variant: "destructive" });
      return;
    }

    const winner = teamAScore > teamBScore ? 'Equipo A' : teamBScore > teamAScore ? 'Equipo B' : 'Empate';
    const updatedMatch = { 
      ...match, 
      status: 'Finalizado',
      result: {
        teamAScore,
        teamBScore,
        winner
      }
    };
    
    updateMatchInStorage(updatedMatch);
    setShowResultDialog(false);
    toast({ 
      title: "¡Partido Finalizado!", 
      description: `Resultado: Equipo A ${teamAScore} - ${teamBScore} Equipo B. ${winner === 'Empate' ? '¡Empate!' : `¡Ganó el ${winner}!`}`, 
      variant: "default" 
    });
  };

  if (!match) {
    return (
        <div className="flex justify-center items-center h-64">
            <Sparkles className={`h-12 w-12 animate-spin ${darkMode ? 'text-sky-400' : 'text-blue-600'}`} />
            <p className={`ml-4 text-xl ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Cargando detalles del partido...</p>
        </div>
    );
  }

  const playersRemaining = match.playersNeeded - match.players.length;

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Button variant="outline" onClick={() => navigate(-1)} className={`mb-6 ${darkMode ? 'border-sky-500 text-sky-400 hover:bg-sky-500/20' : 'border-blue-600 text-blue-700 hover:bg-blue-600/10'}`}>
        <ChevronLeft className="mr-2 h-4 w-4" /> Volver a la búsqueda
      </Button>

      <Card className={`overflow-hidden shadow-2xl ${darkMode ? 'bg-gray-800/70 border-gray-700 backdrop-blur-md' : 'bg-white/70 border-gray-200 backdrop-blur-md'}`}>
        <CardHeader className="pb-4">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
                <CardTitle className={`text-4xl font-extrabold ${darkMode ? 'text-transparent bg-clip-text bg-gradient-to-r from-sky-400 to-blue-500' : 'text-transparent bg-clip-text bg-gradient-to-r from-sky-600 to-blue-700'}`}>
                    {match.sport}
                </CardTitle>
                <MatchStatusBadge status={match.status} darkMode={darkMode} />
            </div>
            <CardDescription className={`text-lg ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                Organizado por: <span className="font-semibold">{match.organizerUsername}</span>
            </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6 py-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className={`p-4 rounded-lg ${darkMode ? 'bg-gray-700/50' : 'bg-gray-50'}`}>
              <h3 className={`text-xl font-semibold mb-3 ${darkMode ? 'text-sky-300' : 'text-blue-700'}`}>Detalles del Evento</h3>
              <div className="space-y-3">
                <div className="flex items-start">
                  <MapPin className={`mr-3 mt-1 h-5 w-5 flex-shrink-0 ${darkMode ? 'text-sky-400' : 'text-blue-600'}`} />
                  <div>
                    <span className={`font-medium ${darkMode ? 'text-gray-200' : 'text-gray-800'}`}>Dirección:</span>
                    <p className={`${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>{match.direccion}</p>
                  </div>
                  <div>
                    <span className={`font-medium ${darkMode ? 'text-gray-200' : 'text-gray-800'}`}>Zona:</span>
                    <p className={`${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>{match.zona}</p>
                  </div>
                </div>
                <div className="flex items-start">
                  <CalendarDays className={`mr-3 mt-1 h-5 w-5 flex-shrink-0 ${darkMode ? 'text-sky-400' : 'text-blue-600'}`} />
                   <div>
                    <span className={`font-medium ${darkMode ? 'text-gray-200' : 'text-gray-800'}`}>Fecha y Hora:</span>
                    <p className={`${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>{new Date(match.dateTime).toLocaleString([], {dateStyle: 'full', timeStyle: 'short'})}</p>
                  </div>
                </div>
                <div className="flex items-start">
                  <Clock className={`mr-3 mt-1 h-5 w-5 flex-shrink-0 ${darkMode ? 'text-sky-400' : 'text-blue-600'}`} />
                  <div>
                    <span className={`font-medium ${darkMode ? 'text-gray-200' : 'text-gray-800'}`}>Duración:</span>
                    <p className={`${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>{match.duration} minutos</p>
                  </div>
                </div>
                 <div className="flex items-start">
                  <Sparkles className={`mr-3 mt-1 h-5 w-5 flex-shrink-0 ${darkMode ? 'text-sky-400' : 'text-blue-600'}`} />
                  <div>
                    <span className={`font-medium ${darkMode ? 'text-gray-200' : 'text-gray-800'}`}>Nivel Requerido:</span>
                    <p className={`${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>{match.levelRequired}</p>
                  </div>
                </div>
              </div>
            </div>

            <div className={`p-4 rounded-lg ${darkMode ? 'bg-gray-700/50' : 'bg-gray-50'}`}>
              <h3 className={`text-xl font-semibold mb-3 ${darkMode ? 'text-sky-300' : 'text-blue-700'}`}>Jugadores</h3>
              <div className="flex items-center mb-3">
                <Users className={`mr-3 h-5 w-5 ${darkMode ? 'text-sky-400' : 'text-blue-600'}`} />
                <span className={`font-medium ${darkMode ? 'text-gray-200' : 'text-gray-800'}`}>{match.players.length} / {match.playersNeeded} confirmados</span>
              </div>
              {playersRemaining > 0 && match.status === 'Necesitamos jugadores' && (
                <p className={`text-sm mb-3 ${darkMode ? 'text-yellow-300' : 'text-yellow-700'}`}>
                  <AlertTriangle className="inline mr-1 h-4 w-4" /> ¡Aún faltan {playersRemaining} jugador{playersRemaining === 1 ? '' : 'es'}!
                </p>
              )}
               {match.players.length === 0 ? (
                 <p className={`${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Aún no hay jugadores unidos. ¡Sé el primero!</p>
               ) : (
                <ul className="space-y-2 max-h-40 overflow-y-auto pr-2">
                  {match.players.map(player => (
                    <li key={player.username} className={`flex items-center p-2 rounded ${darkMode ? 'bg-gray-600/50' : 'bg-gray-100'}`}>
                       <img  
                        alt={player.username} 
                        class={`h-6 w-6 rounded-full mr-2 ${darkMode ? 'border-2 border-sky-500' : 'border-2 border-blue-500'}`}
                         src="https://images.unsplash.com/photo-1643101447193-9c59d5db2771" />
                      <div>
                        <span className={`${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>{player.username}</span>
                        {match.teams && (
                          <div className="text-xs mt-0.5">
                            {match.teams.teamA.includes(player.username) && (
                              <span className={`${darkMode ? 'text-blue-400' : 'text-blue-600'}`}>Equipo A</span>
                            )}
                            {match.teams.teamB.includes(player.username) && (
                              <span className={`${darkMode ? 'text-red-400' : 'text-red-600'}`}>Equipo B</span>
                            )}
                          </div>
                        )}
                      </div>
                    </li>
                  ))}
                </ul>
               )}
            </div>
          </div>

          {currentUser && !isOrganizer && match.status !== 'Cancelado' && match.status !== 'Finalizado' && (
            <Button
              onClick={handleJoinLeaveMatch}
              className={`w-full mt-6 text-lg py-3 ${
                isPlayerJoined
                  ? (darkMode ? 'bg-red-600 hover:bg-red-700' : 'bg-red-500 hover:bg-red-600')
                  : (darkMode ? 'bg-green-500 hover:bg-green-600' : 'bg-green-600 hover:bg-green-700')
              } text-white`}
            >
              {isPlayerJoined ? <><UserX className="mr-2 h-5 w-5" /> Salir del Partido</> : <><UserPlus className="mr-2 h-5 w-5" /> Unirme al Partido</>}
            </Button>
          )}
        </CardContent>

        {isOrganizer && match.status !== 'Cancelado' && match.status !== 'Finalizado' && (
          <CardFooter className="flex flex-col sm:flex-row justify-end gap-4 pt-6 border-t mt-4">
            {match.status === 'Confirmado' && (
              <Button onClick={handleStartMatch} className={`${darkMode ? 'bg-purple-500 hover:bg-purple-600' : 'bg-purple-600 hover:bg-purple-700'}`}>
                <Clock className="mr-2 h-4 w-4" /> Iniciar Partido
              </Button>
            )}
            {match.status === 'En juego' && (
              <Button onClick={handleFinishMatch} className={`${darkMode ? 'bg-gray-500 hover:bg-gray-600' : 'bg-gray-600 hover:bg-gray-700'}`}>
                <Trophy className="mr-2 h-4 w-4" /> Finalizar Partido
              </Button>
            )}
            <Dialog>
              <DialogTrigger asChild>
                <Button variant="destructive" className={`${darkMode ? 'bg-red-600 hover:bg-red-700' : 'bg-red-500 hover:bg-red-600'}`}>
                  <Trash2 className="mr-2 h-4 w-4" /> Cancelar Partido
                </Button>
              </DialogTrigger>
              <DialogContent className={darkMode ? 'bg-gray-800 border-gray-700' : ''}>
                <DialogHeader>
                  <DialogTitle className={darkMode ? 'text-sky-400' : 'text-blue-700'}>¿Seguro que quieres cancelar?</DialogTitle>
                  <DialogDescription className={darkMode ? 'text-gray-400' : 'text-gray-600'}>
                    Esta acción no se puede deshacer. Los jugadores serán notificados.
                  </DialogDescription>
                </DialogHeader>
                <DialogFooter>
                  <Button variant="outline" onClick={() => { /* Close dialog */ }} className={darkMode ? 'border-gray-600 hover:bg-gray-700' : ''}>No, mantener</Button>
                  <Button variant="destructive" onClick={() => { handleCancelMatch(); /* Close dialog */ }} className={`${darkMode ? 'bg-red-600 hover:bg-red-700' : 'bg-red-500 hover:bg-red-600'}`}>Sí, Cancelar Partido</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
            {match.status === 'Partido armado' && (
              <Button onClick={handleConfirmMatch} className={`${darkMode ? 'bg-green-500 hover:bg-green-600' : 'bg-green-600 hover:bg-green-700'}`}>
                <CheckCircle className="mr-2 h-4 w-4" /> Confirmar Partido
              </Button>
            )}
            <Button 
              variant="outline" 
              className={darkMode ? 'border-sky-500 text-sky-400 hover:bg-sky-500/20' : ''}
              onClick={() => navigate(`/edit-match/${match.id}`)}
            >
              <Edit3 className="mr-2 h-4 w-4" /> Editar Partido
            </Button>
          </CardFooter>
        )}

        <Dialog open={showResultDialog} onOpenChange={setShowResultDialog}>
          <DialogContent className={darkMode ? 'bg-gray-800 border-gray-700' : ''}>
            <DialogHeader>
              <DialogTitle className={darkMode ? 'text-sky-400' : 'text-blue-700'}>Registrar Resultado</DialogTitle>
              <DialogDescription className={darkMode ? 'text-gray-400' : 'text-gray-600'}>
                Ingresa el resultado final del partido.
              </DialogDescription>
            </DialogHeader>
            <div className="grid grid-cols-2 gap-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="teamAScore" className={darkMode ? 'text-gray-300' : 'text-gray-700'}>Equipo A</Label>
                <Input
                  id="teamAScore"
                  type="number"
                  min="0"
                  value={result.teamAScore}
                  onChange={(e) => setResult(prev => ({ ...prev, teamAScore: e.target.value }))}
                  className={darkMode ? 'bg-gray-700 border-gray-600' : ''}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="teamBScore" className={darkMode ? 'text-gray-300' : 'text-gray-700'}>Equipo B</Label>
                <Input
                  id="teamBScore"
                  type="number"
                  min="0"
                  value={result.teamBScore}
                  onChange={(e) => setResult(prev => ({ ...prev, teamBScore: e.target.value }))}
                  className={darkMode ? 'bg-gray-700 border-gray-600' : ''}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowResultDialog(false)} className={darkMode ? 'border-gray-600 hover:bg-gray-700' : ''}>
                Cancelar
              </Button>
              <Button onClick={handleResultSubmit} className={`${darkMode ? 'bg-sky-500 hover:bg-sky-600' : 'bg-blue-600 hover:bg-blue-700'}`}>
                Registrar Resultado
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {match.status === 'Finalizado' && match.result && (
          <CardFooter className={`pt-6 border-t mt-4 ${darkMode ? 'border-gray-700' : 'border-gray-300'}`}>
            <div className={`flex items-center p-4 rounded-md w-full ${darkMode ? 'bg-gray-700/50 border border-gray-600' : 'bg-gray-50 border border-gray-200'}`}>
              <Trophy className={`h-8 w-8 mr-3 flex-shrink-0 ${darkMode ? 'text-yellow-400' : 'text-yellow-500'}`} />
              <div>
                <h4 className={`font-semibold text-lg ${darkMode ? 'text-gray-200' : 'text-gray-800'}`}>Resultado Final</h4>
                <p className={`${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  Equipo A {match.result.teamAScore} - {match.result.teamBScore} Equipo B
                </p>
                <p className={`${darkMode ? 'text-gray-300' : 'text-gray-700'} font-medium`}>
                  {match.result.winner === 'Empate' ? '¡Empate!' : `¡Ganó el ${match.result.winner}!`}
                </p>
              </div>
            </div>
          </CardFooter>
        )}
      </Card>
    </motion.div>
  );
}

export default MatchDetailsPage;
  