import React, { useState, useEffect } from "react";
import {
  useParams,
  useNavigate,
  useOutletContext,
  Link,
} from "react-router-dom";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useToast } from "@/components/ui/use-toast";
import {
  MapPin,
  CalendarDays,
  Users,
  Clock,
  ShieldAlert,
  UserPlus,
  Trash2,
  Edit3,
  UserCheck,
  UserX,
  MessageSquare,
  AlertTriangle,
  Sparkles,
  ChevronLeft,
  ShieldCheck,
  ShieldQuestion,
  CheckCircle,
  XCircle,
  Trophy,
  Loader2,
} from "lucide-react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { endMatch, getMatchById, joinMatch, leaveMatch, confirmMatch, startMatch, setMatchWinner } from "../services/getMatches";
import useUserStore from "@/store/userStore";

const MatchStatusBadge = ({ status, darkMode }) => {  let bgColor, textColor, Icon;
  switch (status) {
    case "NECESITAMOS_JUGADORES":
      bgColor = darkMode ? "bg-yellow-500/20" : "bg-yellow-100";
      textColor = darkMode ? "text-yellow-400" : "text-yellow-600";
      Icon = ShieldAlert;
      break;
    case "ARMADO":
      bgColor = darkMode ? "bg-green-500/20" : "bg-green-100";
      textColor = darkMode ? "text-green-400" : "text-green-600";
      Icon = ShieldCheck;
      break;
    case "CONFIRMADO":
      bgColor = darkMode ? "bg-blue-500/20" : "bg-blue-100";
      textColor = darkMode ? "text-blue-400" : "text-blue-600";
      Icon = CheckCircle;
      break;
    case "EN_JUEGO":
      bgColor = darkMode ? "bg-purple-500/20" : "bg-purple-100";
      textColor = darkMode ? "text-purple-400" : "text-purple-600";
      Icon = Clock;
      break;
    case "FINALIZADO":
      bgColor = darkMode ? "bg-gray-500/20" : "bg-gray-100";
      textColor = darkMode ? "text-gray-400" : "text-gray-600";
      Icon = Trophy;
      break;
    case "CANCELADO":
      bgColor = darkMode ? "bg-red-500/20" : "bg-red-100";
      textColor = darkMode ? "text-red-400" : "text-red-600";
      Icon = XCircle;
      break;
    default:
      bgColor = darkMode ? "bg-gray-500/20" : "bg-gray-100";
      textColor = darkMode ? "text-gray-400" : "text-gray-500";
      Icon = ShieldQuestion;
  }
  return (
    <div
      className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${bgColor} ${textColor} shadow-md`}
    >
      <Icon className="w-4 h-4 mr-2" />
      {status}
    </div>
  );
};

function MatchDetailsPage() {
  const { matchId } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { darkMode } = useOutletContext();
  const { currentUser } = useUserStore();  const [match, setMatch] = useState(null);
  const [isPlayerJoined, setIsPlayerJoined] = useState(false);
  const [isOrganizer, setIsOrganizer] = useState(false);
  const [showResultDialog, setShowResultDialog] = useState(false);
  const [selectedWinner, setSelectedWinner] = useState(undefined); // undefined = no seleccionado, null = empate, "A"/"B" = equipo ganador
  const [matchesLoading, setMatchesLoading] = useState(true);
  const [confirmingMatch, setConfirmingMatch] = useState(false);
  const [startingMatch, setStartingMatch] = useState(false);
  const [finishingMatch, setFinishingMatch] = useState(false);
  const [cancelingMatch, setCancelingMatch] = useState(false);
  const [joiningMatch, setJoiningMatch] = useState(false);

  const fetchMatch = async () => {
    try {
      const matchData = await getMatchById(matchId);
      if (matchData) {
        setMatch(matchData);
        if (currentUser?.id) {
          setIsPlayerJoined(matchData.participantes?.some(p => p.usuarioId === currentUser.id));
          setIsOrganizer(matchData.organizadorId === currentUser.id);
        }
      } else {
        toast({
          title: "Error",
          description: "Partido no encontrado.",
          variant: "destructive",
        });
        navigate("/find-match");
      }
    } catch (error) {
      console.error("Error fetching match:", error);
      toast({
        title: "Error",
        description: "Error al cargar el partido.",
        variant: "destructive",
      });
      navigate("/find-match");
    } finally {
      setMatchesLoading(false);
    }
  };

  useEffect(() => {

    fetchMatch();
  }, [matchId, currentUser, toast, navigate]);

  const updateMatchInStorage = (updatedMatch) => {
    const storedMatches = JSON.parse(localStorage.getItem("matches")) || [];
    const matchIndex = storedMatches.findIndex((m) => m.id === updatedMatch.id);
    if (matchIndex !== -1) {
      storedMatches[matchIndex] = updatedMatch;
      localStorage.setItem("matches", JSON.stringify(storedMatches));
      setMatch(updatedMatch); // Update local state
    }
  };
  const handleJoinLeaveMatch = async () => {
    if (!currentUser) {
      toast({
        title: "Acción requerida",
        description: "Debes iniciar sesión para unirte.",
        variant: "default",
      });
      navigate("/auth");
      return;
    }

    setJoiningMatch(true);
    try {
      if (isPlayerJoined) {
        // Leave match
        const response = await leaveMatch(matchId, currentUser.id);

        if (response.success) {
          setIsPlayerJoined(false);
          await fetchMatch();
          toast({
            title: "Has salido del partido",
            description: `Ya no estás en la lista para ${match.deporte?.nombre}.`,
          });
        }
      } else {
        // Join match
        // Call the API to join the match
        const team = match.participantes.length % 2 === 0 ? "A" : "B"; // Alternate between teams A and B
        const response = await joinMatch(matchId, currentUser.id, team);

        if (response) {
          setIsPlayerJoined(true);
          await fetchMatch();
          toast({
            title: "¡Te has unido!",
            description: `Estás en la lista para ${match.deporte?.nombre}. ¡Prepárate!`,
          });
        }
      }
    } catch (error) {
      console.error("Error joining/leaving match:", error);
      toast({
        title: "Error",
        description: isPlayerJoined 
          ? "No se pudo salir del partido. Por favor intente nuevamente."
          : "No se pudo unir al partido. Por favor intente nuevamente.",
        variant: "destructive",
      });
    } finally {
      setJoiningMatch(false);
    }
  };
  const handleCancelMatch = async () => {
    if (!isOrganizer) return;
    
    setCancelingMatch(true);
    try {
      const response = await endMatch(matchId);

      if (response.success) {
        toast({
          title: "Partido Cancelado",
          description: "El partido ha sido cancelado.",
          variant: "destructive",
        });
        navigate("/find-match");
      }
    } catch (error) {
      console.error("Error cancelando partido:", error);
      toast({
        title: "Error",
        description: "No se pudo cancelar el partido. Inténtalo de nuevo.",
        variant: "destructive",
      });
    } finally {
      setCancelingMatch(false);
    }
  };const handleConfirmMatch = async () => {
    if (!isOrganizer) return;
    
    setConfirmingMatch(true);
    try {
      await confirmMatch(matchId);
      
      // Actualizar el estado local
      const updatedMatch = { ...match, estado: "CONFIRMADO" };
      setMatch(updatedMatch);
      
      toast({
        title: "Partido Confirmado",
        description: "El partido ha sido confirmado. ¡A jugar!",
        variant: "default",
      });
    } catch (error) {
      console.error('Error confirmando partido:', error);
      toast({
        title: "Error",
        description: "No se pudo confirmar el partido. Inténtalo de nuevo.",
        variant: "destructive",
      });
    } finally {
      setConfirmingMatch(false);
    }
  };  const handleStartMatch = async () => {
    if (!isOrganizer) return;
    
    setStartingMatch(true);
    try {
      await startMatch(matchId);
      
      // Actualizar el estado local
      const updatedMatch = { ...match, estado: "EN_JUEGO" };
      setMatch(updatedMatch);
      
      toast({
        title: "¡Partido Iniciado!",
        description: "El partido ha comenzado. ¡Buena suerte!",
        variant: "default",
      });
    } catch (error) {
      console.error('Error iniciando partido:', error);
      toast({
        title: "Error",
        description: "No se pudo iniciar el partido. Inténtalo de nuevo.",
        variant: "destructive",
      });
    } finally {
      setStartingMatch(false);
    }
  };
  const handleFinishMatch = () => {
    if (!isOrganizer) return;
    setShowResultDialog(true);
  };  const handleFinishWithWinner = async () => {
    console.log('handleFinishWithWinner called with:', { selectedWinner, matchId });
    
    if (selectedWinner === undefined) {
      toast({
        title: "Error",
        description: "Por favor selecciona un ganador o empate.",
        variant: "destructive",
      });
      return;
    }
    
    setFinishingMatch(true);
    try {
      // Utilizamos la función de servicio setMatchWinner tanto para ganador como para empate
      await setMatchWinner(matchId, selectedWinner);
      
      // Determinar el texto para mostrar según el ganador seleccionado
      let winnerText = selectedWinner === "A" ? "Equipo A" : 
                      selectedWinner === "B" ? "Equipo B" : "Empate";
      
      // Actualizar la interfaz de usuario
      const updatedMatch = {
        ...match,
        estado: "FINALIZADO",
        equipoGanador: selectedWinner,
        result: {
          winner: winnerText,
        },
      };
      
      setMatch(updatedMatch);
      setShowResultDialog(false);
      setSelectedWinner(undefined); // Limpiar selección completamente
      
      toast({
        title: "¡Partido Finalizado!",
        description: winnerText === "Empate" ? "El partido terminó en empate." : `¡Ganó el ${winnerText}!`,
        variant: "default",
      });
      
      // Actualizar partidos en el almacenamiento local (opcional)
      updateMatchInStorage(updatedMatch);

    } catch (error) {
      console.error("Error al finalizar el partido:", error);
      toast({
        title: "Error",
        description: "No se pudo finalizar el partido. Inténtalo de nuevo.",
        variant: "destructive",
      });
    } finally {
      setFinishingMatch(false);
    }
  };

  if (!match) {
    return (
      <div className="flex justify-center items-center h-64">
        <Sparkles
          className={`h-12 w-12 animate-spin ${darkMode ? "text-sky-400" : "text-blue-600"
            }`}
        />
        <p
          className={`ml-4 text-xl ${darkMode ? "text-gray-300" : "text-gray-700"
            }`}
        >
          Cargando detalles del partido...
        </p>
      </div>
    );
  }

  const playersRemaining = match.cantidadJugadores - match.jugadoresConfirmados;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Button
        variant="outline"
        onClick={() => navigate(-1)}
        className={`mb-6 ${darkMode
          ? "border-sky-500 text-sky-400 hover:bg-sky-500/20"
          : "border-blue-600 text-blue-700 hover:bg-blue-600/10"
          }`}
      >
        <ChevronLeft className="mr-2 h-4 w-4" /> Volver a la búsqueda
      </Button>

      <Card
        className={`overflow-hidden shadow-2xl ${darkMode
          ? "bg-gray-800/70 border-gray-700 backdrop-blur-md"
          : "bg-white/70 border-gray-200 backdrop-blur-md"
          }`}
      >
        <CardHeader className="pb-4">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
            <CardTitle
              className={`text-4xl font-extrabold ${darkMode
                ? "text-transparent bg-clip-text bg-gradient-to-r from-sky-400 to-blue-500"
                : "text-transparent bg-clip-text bg-gradient-to-r from-sky-600 to-blue-700"
                }`}
            >
              {match.deporte?.nombre}
            </CardTitle>
            <MatchStatusBadge status={match.estado} darkMode={darkMode} />
          </div>
          <CardDescription
            className={`text-lg ${darkMode ? "text-gray-400" : "text-gray-600"
              }`}
          >
            Organizado por:{" "}
            <span className="font-semibold">{match.organizador?.nombre}</span>
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6 py-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div
              className={`p-4 rounded-lg ${darkMode ? "bg-gray-700/50" : "bg-gray-50"
                }`}
            >
              <h3
                className={`text-xl font-semibold mb-3 ${darkMode ? "text-sky-300" : "text-blue-700"
                  }`}
              >
                Detalles del Evento
              </h3>
              <div className="space-y-3">
                <div className="flex items-start">
                  <MapPin
                    className={`mr-3 mt-1 h-5 w-5 flex-shrink-0 ${darkMode ? "text-sky-400" : "text-blue-600"
                      }`}
                  />
                  <div>
                    <span
                      className={`font-medium ${darkMode ? "text-gray-200" : "text-gray-800"
                        }`}
                    >
                      Dirección:
                    </span>
                    <p
                      className={`${darkMode ? "text-gray-400" : "text-gray-600"
                        }`}
                    >
                      {match.direccion}
                    </p>
                  </div>
                </div>
                <div className="flex items-start">
                  <CalendarDays
                    className={`mr-3 mt-1 h-5 w-5 flex-shrink-0 ${darkMode ? "text-sky-400" : "text-blue-600"
                      }`}
                  />
                  <div>
                    <span
                      className={`font-medium ${darkMode ? "text-gray-200" : "text-gray-800"
                        }`}
                    >
                      Fecha y Hora:
                    </span>
                    <p
                      className={`${darkMode ? "text-gray-400" : "text-gray-600"
                        }`}
                    >
                      {new Date(match.fecha).toLocaleDateString()} -{" "}
                      {match.hora}
                    </p>
                  </div>
                </div>
                <div className="flex items-start">
                  <Clock
                    className={`mr-3 mt-1 h-5 w-5 flex-shrink-0 ${darkMode ? "text-sky-400" : "text-blue-600"
                      }`}
                  />
                  <div>
                    <span
                      className={`font-medium ${darkMode ? "text-gray-200" : "text-gray-800"
                        }`}
                    >
                      Duración:
                    </span>
                    <p
                      className={`${darkMode ? "text-gray-400" : "text-gray-600"
                        }`}
                    >
                      {match.duracion} horas
                    </p>
                  </div>
                </div>
                <div className="flex items-start">
                  <Sparkles
                    className={`mr-3 mt-1 h-5 w-5 flex-shrink-0 ${darkMode ? "text-sky-400" : "text-blue-600"
                      }`}
                  />
                  <div>
                    <span
                      className={`font-medium ${darkMode ? "text-gray-200" : "text-gray-800"
                        }`}
                    >
                      Nivel Requerido:
                    </span>
                    <p
                      className={`${darkMode ? "text-gray-400" : "text-gray-600"
                        }`}
                    >
                      {match.nivelMinimo} - {match.nivelMaximo}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div
              className={`p-4 rounded-lg ${darkMode ? "bg-gray-700/50" : "bg-gray-50"
                }`}
            >
              <h3
                className={`text-xl font-semibold mb-3 ${darkMode ? "text-sky-300" : "text-blue-700"
                  }`}
              >
                Jugadores
              </h3>
              <div className="flex items-center mb-3">
                <Users
                  className={`mr-3 h-5 w-5 ${darkMode ? "text-sky-400" : "text-blue-600"
                    }`}
                />
                <span
                  className={`font-medium ${darkMode ? "text-gray-200" : "text-gray-800"
                    }`}
                >                  {match.jugadoresConfirmados} / {match.cantidadJugadores}{" "}
                  confirmados
                </span>
              </div>
              {playersRemaining > 0 &&
                match.estado === "NECESITAMOS_JUGADORES" && (
                  <p
                    className={`text-sm mb-3 ${darkMode ? "text-yellow-300" : "text-yellow-700"
                      }`}
                  >
                    <AlertTriangle className="inline mr-1 h-4 w-4" /> ¡Aún
                    faltan {playersRemaining} jugador
                    {playersRemaining === 1 ? "" : "es"}!
                  </p>
                )}
              {match.participantes?.length === 0 ? (
                <p
                  className={`${darkMode ? "text-gray-400" : "text-gray-600"}`}
                >
                  Aún no hay jugadores unidos. ¡Sé el primero!
                </p>
              ) : (
                <ul className="space-y-2 max-h-40 overflow-y-auto pr-2">
                  {match.participantes?.map((participante) => (
                    <li
                      key={participante.id}
                      className={`flex items-center p-2 rounded ${darkMode ? "bg-gray-600/50" : "bg-gray-100"
                        }`}
                    >
                      <img
                        alt={participante.usuario.nombre}
                        className={`h-6 w-6 rounded-full mr-2 ${darkMode
                          ? "border-2 border-sky-500"
                          : "border-2 border-blue-500"
                          }`}
                        src="https://images.unsplash.com/photo-1643101447193-9c59d5db2771"
                      />
                      <div>
                        <span
                          className={`${darkMode ? "text-gray-300" : "text-gray-700"
                            }`}
                        >
                          {participante.usuario.nombre}
                        </span>
                        <div className="text-xs mt-0.5">
                          <span
                            className={`${participante.equipo === "A"
                              ? darkMode
                                ? "text-blue-400"
                                : "text-blue-600"
                              : darkMode
                                ? "text-red-400"
                                : "text-red-600"
                              }`}
                          >
                            Equipo {participante.equipo}
                          </span>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>

          {currentUser &&
            !isOrganizer &&
            match.estado !== "CANCELADO" &&
            match.estado !== "FINALIZADO" && (              <Button
                onClick={handleJoinLeaveMatch}
                disabled={joiningMatch}
                className={`w-full mt-6 text-lg py-3 ${isPlayerJoined
                  ? darkMode
                    ? "bg-red-600 hover:bg-red-700 disabled:bg-red-400"
                    : "bg-red-500 hover:bg-red-600 disabled:bg-red-300"
                  : darkMode
                    ? "bg-green-500 hover:bg-green-600 disabled:bg-green-400"
                    : "bg-green-600 hover:bg-green-700 disabled:bg-green-400"
                  } text-white disabled:cursor-not-allowed`}
              >
                {joiningMatch ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    {isPlayerJoined ? "Saliendo..." : "Uniéndose..."}
                  </>
                ) : isPlayerJoined ? (
                  <>
                    <UserX className="mr-2 h-5 w-5" /> Salir del Partido
                  </>
                ) : (
                  <>
                    <UserPlus className="mr-2 h-5 w-5" /> Unirme al Partido
                  </>
                )}
              </Button>
            )}
        </CardContent>

        {isOrganizer &&
          match.estado !== "CANCELADO" &&
          match.estado !== "FINALIZADO" && (
            <CardFooter className="flex flex-col sm:flex-row justify-end gap-4 pt-6 border-t mt-4">              {match.estado === "CONFIRMADO" && (
                <Button
                  onClick={handleStartMatch}
                  disabled={startingMatch}
                  className={`${darkMode
                    ? "bg-purple-500 hover:bg-purple-600"
                    : "bg-purple-600 hover:bg-purple-700"
                    }`}
                >
                  {startingMatch ? (
                    <>
                      <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full mr-2"></div>
                      Iniciando...
                    </>
                  ) : (
                    <>
                      <Clock className="mr-2 h-4 w-4" /> Iniciar Partido
                    </>
                  )}
                </Button>
              )}              {match.estado === "EN_JUEGO" && (
                <Button
                  onClick={handleFinishMatch}
                  disabled={finishingMatch}
                  className={`${darkMode
                    ? "bg-gray-500 hover:bg-gray-600"
                    : "bg-gray-600 hover:bg-gray-700"
                    }`}
                >
                  {finishingMatch ? (
                    <>
                      <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full mr-2"></div>
                      Finalizando...
                    </>
                  ) : (
                    <>
                      <Trophy className="mr-2 h-4 w-4" /> Finalizar Partido
                    </>
                  )}                </Button>              )}
              {match.estado !== "ARMADO" && match.estado !== "EN_JUEGO" && (
                <Dialog>
                  <DialogTrigger asChild>
                    <Button
                      variant="destructive"
                      className={`${darkMode
                        ? "bg-red-600 hover:bg-red-700"
                        : "bg-red-500 hover:bg-red-600"
                        }`}
                    >
                      <Trash2 className="mr-2 h-4 w-4" /> Cancelar Partido
                    </Button>
                  </DialogTrigger>
                <DialogContent
                  className={darkMode ? "bg-gray-800 border-gray-700" : ""}
                >
                  <DialogHeader>
                    <DialogTitle
                      className={darkMode ? "text-sky-400" : "text-blue-700"}
                    >
                      ¿Seguro que quieres cancelar?
                    </DialogTitle>
                    <DialogDescription
                      className={darkMode ? "text-gray-400" : "text-gray-600"}
                    >
                      Esta acción no se puede deshacer. Los jugadores serán
                      notificados.
                    </DialogDescription>
                  </DialogHeader>
                  <DialogFooter>
                    <Button
                      variant="outline"
                      onClick={() => {
                        /* Close dialog */
                      }}
                      className={
                        darkMode ? "border-gray-600 hover:bg-gray-700" : ""
                      }
                    >
                      No, mantener
                    </Button>                    <Button
                      variant="destructive"
                      onClick={() => {
                        handleCancelMatch(); /* Close dialog */
                      }}
                      disabled={cancelingMatch}
                      className={`${darkMode
                        ? "bg-red-600 hover:bg-red-700"
                        : "bg-red-500 hover:bg-red-600"
                        }`}
                    >
                      {cancelingMatch ? (
                        <>
                          <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full mr-2"></div>
                          Cancelando...
                        </>
                      ) : (
                        "Sí, Cancelar Partido"
                      )}
                    </Button>
                  </DialogFooter>                </DialogContent>
              </Dialog>
              )}
              {match.estado === "ARMADO" && (
                <Button
                  onClick={handleConfirmMatch}
                  disabled={confirmingMatch}
                  className={`${darkMode
                    ? "bg-green-500 hover:bg-green-600"
                    : "bg-green-600 hover:bg-green-700"
                    }`}
                >
                  {confirmingMatch ? (
                    <>
                      <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full mr-2"></div>
                      Confirmando...
                    </>
                  ) : (
                    <>
                      <CheckCircle className="mr-2 h-4 w-4" /> Confirmar Partido
                    </>
                  )}
                </Button>
              )}
            </CardFooter>
          )}        <Dialog open={showResultDialog} onOpenChange={setShowResultDialog}>
          <DialogContent
            className={darkMode ? "bg-gray-800 border-gray-700" : ""}
          >
            <DialogHeader>
              <DialogTitle
                className={darkMode ? "text-sky-400" : "text-blue-700"}
              >
                Finalizar Partido
              </DialogTitle>
              <DialogDescription
                className={darkMode ? "text-gray-400" : "text-gray-600"}
              >
                Selecciona el equipo ganador o indica si hubo empate.
              </DialogDescription>
            </DialogHeader>            <div className="flex flex-col gap-4 py-4">
              <Button
                variant={selectedWinner === "A" ? "default" : "outline"}
                onClick={() => setSelectedWinner("A")}
                disabled={finishingMatch}
                className={`p-6 text-lg ${selectedWinner === "A" 
                  ? darkMode ? "bg-blue-600 hover:bg-blue-700" : "bg-blue-700 hover:bg-blue-800"
                  : darkMode ? "border-blue-500 text-blue-400 hover:bg-blue-600 hover:text-white" : "border-blue-600 text-blue-700 hover:bg-blue-700 hover:text-white"
                }`}
              >
                Ganador: Equipo A
              </Button>
              
              <Button
                variant={selectedWinner === "B" ? "default" : "outline"}
                onClick={() => setSelectedWinner("B")}
                disabled={finishingMatch}
                className={`p-6 text-lg ${selectedWinner === "B" 
                  ? darkMode ? "bg-red-600 hover:bg-red-700" : "bg-red-700 hover:bg-red-800"
                  : darkMode ? "border-red-500 text-red-400 hover:bg-red-600 hover:text-white" : "border-red-600 text-red-700 hover:bg-red-700 hover:text-white"
                }`}
              >
                Ganador: Equipo B
              </Button>
              
              <Button
                variant={selectedWinner === null ? "default" : "outline"}
                onClick={() => setSelectedWinner(null)}
                disabled={finishingMatch}
                className={`p-6 text-lg ${selectedWinner === null
                  ? darkMode ? "bg-yellow-600 hover:bg-yellow-700" : "bg-yellow-700 hover:bg-yellow-800"
                  : darkMode ? "border-yellow-500 text-yellow-400 hover:bg-yellow-600 hover:text-white" : "border-yellow-600 text-yellow-700 hover:bg-yellow-700 hover:text-white"
                }`}
              >
                Empate
              </Button>
            </div>
            <DialogFooter>              <Button
                variant="outline"
                onClick={() => {
                  setShowResultDialog(false);
                  setSelectedWinner(undefined);
                }}
                disabled={finishingMatch}
                className={darkMode ? "border-gray-600 hover:bg-gray-700" : ""}
              >
                Cancelar
              </Button><Button
                onClick={handleFinishWithWinner}
                disabled={selectedWinner === undefined || finishingMatch}
                className={`${darkMode
                  ? "bg-sky-500 hover:bg-sky-600"
                  : "bg-blue-600 hover:bg-blue-700"
                  }`}
              >
                {finishingMatch ? (
                  <>
                    <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full mr-2"></div>
                    Finalizando...
                  </>
                ) : (
                  "Finalizar Partido"
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>        {match.estado === "FINALIZADO" && match.result && (
          <CardFooter
            className={`pt-6 border-t mt-4 ${darkMode ? "border-gray-700" : "border-gray-300"
              }`}
          >
            <div
              className={`flex items-center p-4 rounded-md w-full ${darkMode
                ? "bg-gray-700/50 border border-gray-600"
                : "bg-gray-50 border border-gray-200"
                }`}
            >
              <Trophy
                className={`h-8 w-8 mr-3 flex-shrink-0 ${
                  match.result.winner === "Empate"
                    ? darkMode ? "text-yellow-400" : "text-yellow-500"
                    : match.result.winner === "Equipo A"
                      ? darkMode ? "text-blue-400" : "text-blue-500"
                      : darkMode ? "text-red-400" : "text-red-500"
                }`}
              />
              <div>
                <h4
                  className={`font-semibold text-lg ${darkMode ? "text-gray-200" : "text-gray-800"
                    }`}
                >
                  Resultado Final
                </h4>
                <p
                  className={`${darkMode ? "text-gray-300" : "text-gray-700"
                    } font-medium text-lg`}
                >
                  {match.result.winner === "Empate"
                    ? "¡Empate!"
                    : `¡Ganó el ${match.result.winner}!`}
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
