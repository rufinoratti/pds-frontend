
import React, { useState, useEffect } from 'react';
import { useParams, useOutletContext, Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/components/ui/use-toast';
import { User, Mail, Shield, BarChart3, Edit3, Save, LogOut, CalendarCheck2, Award } from 'lucide-react';
import useUserStore from '@/store/userStore';
import { getSports } from '@/services/getSports';
import { getUserMatches } from '@/services/getUserMatches';

const sports = ["Fútbol", "Básquet", "Vóley", "Tenis", "Pádel", "Otro", "No especificado"];
const levels = ["Principiante", "Intermedio", "Avanzado", "No especificado"];

// Función para convertir número de nivel a texto
const getLevelText = (nivel) => {
  switch (nivel) {
    case 1: return 'Principiante';
    case 2: return 'Intermedio';
    case 3: return 'Avanzado';
    default: return 'No especificado';
  }
};

function UserProfilePage() {
  const { id: profileId } = useParams(); // Cambiar de username a id
  const { darkMode } = useOutletContext(); // Solo obtener darkMode del context
  const { currentUser, setUser } = useUserStore(); // Usar el store de Zustand
  const { toast } = useToast();
  const navigate = useNavigate();

  const [profileData, setProfileData] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editableData, setEditableData] = useState({ favoriteSport: '', skillLevel: '' });
  const [userMatches, setUserMatches] = useState([]);
  const [deportes, setDeportes] = useState([]);
  const [userSportName, setUserSportName] = useState('No especificado');
  useEffect(() => {
    if (!currentUser) {
      navigate('/auth');
      return;
    }    // Si estamos viendo nuestro propio perfil
    if (currentUser.id === profileId) {
      setProfileData(currentUser);      // Cargar deportes desde la API
      const loadSports = async () => {
        try {
          const sportsData = await getSports();
          setDeportes(sportsData);
          
          // Encontrar el nombre del deporte del usuario
          let sportName = 'No especificado';
          if (currentUser.deporteId) {
            const userSport = sportsData.find(sport => sport.id === currentUser.deporteId);
            sportName = userSport ? userSport.nombre : 'No especificado';
          }
          setUserSportName(sportName);
          
          // Obtener el nivel de juego real del usuario
          const userLevel = getLevelText(currentUser.nivel);
          
          // Actualizar editableData con los valores reales
          setEditableData({ 
            favoriteSport: currentUser.deporteId || '', 
            skillLevel: userLevel
          });
          
        } catch (error) {
          console.error('Error cargando deportes:', error);
          setUserSportName('No especificado');
          
          // Fallback para editableData en caso de error
          const userLevel = getLevelText(currentUser.nivel);
          setEditableData({ 
            favoriteSport: '', 
            skillLevel: userLevel
          });
        }
      };

      // Cargar partidos del usuario desde la API
      const loadUserMatches = async () => {
        try {
          const matchesData = await getUserMatches(currentUser.id);
          console.log('Partidos del usuario cargados:', matchesData);
          setUserMatches(matchesData.slice(0, 5)); // Mostrar los últimos 5 partidos
        } catch (error) {
          console.error('Error cargando partidos del usuario:', error);
          setUserMatches([]); // Array vacío en caso de error
        }
      };

      // Cargar deportes y partidos
      loadSports();
      loadUserMatches();
      
      // TODO: Cargar matches del usuario desde la API
      // Por ahora, array vacío hasta implementar la API de matches
      setUserMatches([]);
    } else {
      // TODO: Implementar API para obtener datos de otros usuarios      // Por ahora, mostrar error
      toast({ title: "Error", description: "Solo puedes ver tu propio perfil por ahora.", variant: "destructive" });
      navigate('/');
    }
  }, [profileId, currentUser, navigate, toast]);
  const handleEditToggle = () => {
    if (isEditing) { // Saving changes
      // Actualizar los datos del usuario actual
      const updatedUser = { ...currentUser, ...editableData };
      setUser(updatedUser); // Usar el store de Zustand
      setProfileData(updatedUser); // Update local profile view
      toast({ title: "Perfil Actualizado", description: "Tus cambios han sido guardados." });
      
      // TODO: Aquí deberías hacer una llamada a la API para actualizar en el backend
      // Por ejemplo: await updateUserProfile(currentUser.id, editableData);
    }
    setIsEditing(!isEditing);
  };

  const handleInputChange = (field, value) => {
    setEditableData(prev => ({ ...prev, [field]: value }));
  };
  
  const handleLogout = () => {
    localStorage.removeItem('currentUser');
    setCurrentUser(null);
    toast({ title: "Sesión cerrada", description: "Has cerrado sesión exitosamente." });
    navigate('/auth');
  };

  if (!profileData) {
    return <div className={`text-center py-10 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Cargando perfil...</div>;
  }
  
  const isOwnProfile = currentUser && currentUser.id === profileData.id; // Cambiar a ID

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="max-w-4xl mx-auto space-y-8"
    >
      <Card className={darkMode ? 'bg-gray-800/70 border-gray-700 backdrop-blur-md' : 'bg-white/70 border-gray-200 backdrop-blur-md shadow-xl'}>
        <CardHeader className="flex flex-col sm:flex-row items-center space-y-4 sm:space-y-0 sm:space-x-6">
          <div className="relative">
             <img  
                alt={profileData.nombre || profileData.username} 
                class={`h-24 w-24 sm:h-32 sm:w-32 rounded-full object-cover border-4 ${darkMode ? 'border-sky-500' : 'border-blue-500'} shadow-lg`}
                 src="https://images.unsplash.com/photo-1515381881585-7bd8e76ebf92" />
            {isOwnProfile && (
                <Button size="icon" variant="outline" onClick={handleEditToggle} className={`absolute bottom-0 right-0 rounded-full h-10 w-10 ${darkMode ? 'bg-gray-700 border-gray-600 hover:bg-gray-600' : 'bg-white border-gray-300 hover:bg-gray-100'}`}>
                    {isEditing ? <Save className="h-5 w-5" /> : <Edit3 className="h-5 w-5" />}
                    <span className="sr-only">{isEditing ? 'Guardar Cambios' : 'Editar Perfil'}</span>
                </Button>
            )}
          </div>
          <div className="text-center sm:text-left">
            <CardTitle className={`text-4xl font-bold ${darkMode ? 'text-sky-300' : 'text-blue-700'}`}>{profileData.nombre || profileData.username}</CardTitle>
            <CardDescription className={`text-lg ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              <Mail className="inline mr-2 h-5 w-5" />{profileData.email}
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent className="mt-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className={`p-4 rounded-lg ${darkMode ? 'bg-gray-700/50' : 'bg-gray-100'}`}>
              <Label htmlFor="favoriteSport" className={`flex items-center text-sm font-medium mb-1 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}><Shield className="mr-2 h-4 w-4 text-green-500" />Deporte Favorito</Label>
              {isEditing && isOwnProfile ? (
                <Select value={editableData.favoriteSport} onValueChange={(value) => handleInputChange('favoriteSport', value)}>
                  <SelectTrigger id="favoriteSport" className={darkMode ? 'bg-gray-600 border-gray-500 text-white' : ''}>
                    <SelectValue placeholder="Elige tu deporte" />
                  </SelectTrigger>                  <SelectContent className={darkMode ? 'bg-gray-700 border-gray-600 text-gray-200' : ''}>
                    {deportes.map(deporte => 
                      <SelectItem key={deporte.id} value={deporte.id} className={darkMode ? 'hover:bg-gray-600' : ''}>
                        {deporte.nombre}
                      </SelectItem>
                    )}
                  </SelectContent>
                </Select>
              ) : (
                <p className={`text-lg font-semibold ${darkMode ? 'text-gray-100' : 'text-gray-800'}`}>{userSportName}</p>
              )}
            </div>
            <div className={`p-4 rounded-lg ${darkMode ? 'bg-gray-700/50' : 'bg-gray-100'}`}>
              <Label htmlFor="skillLevel" className={`flex items-center text-sm font-medium mb-1 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}><BarChart3 className="mr-2 h-4 w-4 text-yellow-500" />Nivel de Juego</Label>
              {isEditing && isOwnProfile ? (
                <Select value={editableData.skillLevel} onValueChange={(value) => handleInputChange('skillLevel', value)}>
                  <SelectTrigger id="skillLevel" className={darkMode ? 'bg-gray-600 border-gray-500 text-white' : ''}>
                    <SelectValue placeholder="Define tu nivel" />
                  </SelectTrigger>
                  <SelectContent className={darkMode ? 'bg-gray-700 border-gray-600 text-gray-200' : ''}>
                    {levels.map(l => <SelectItem key={l} value={l} className={darkMode ? 'hover:bg-gray-600' : ''}>{l}</SelectItem>)}
                  </SelectContent>
                </Select>
              ) : (
                <p className={`text-lg font-semibold ${darkMode ? 'text-gray-100' : 'text-gray-800'}`}>{getLevelText(profileData?.nivel)}</p>
              )}
            </div>
          </div>
          
           {isEditing && isOwnProfile && (
            <Button onClick={handleEditToggle} className={`w-full md:w-auto ${darkMode ? 'bg-sky-500 hover:bg-sky-600' : 'bg-blue-600 hover:bg-blue-700'}`}>
              <Save className="mr-2 h-4 w-4" /> Guardar Cambios
            </Button>
          )}
        </CardContent>
        {isOwnProfile && (
          <CardFooter className={`border-t pt-6 mt-6 ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
             <Button variant="destructive" onClick={handleLogout} className="w-full md:w-auto ml-auto">
                <LogOut className="mr-2 h-4 w-4" /> Cerrar Sesión
              </Button>
          </CardFooter>
        )}
      </Card>

      <Card className={darkMode ? 'bg-gray-800/70 border-gray-700 backdrop-blur-md' : 'bg-white/70 border-gray-200 backdrop-blur-md shadow-xl'}>
        <CardHeader>
          <CardTitle className={`flex items-center text-2xl font-semibold ${darkMode ? 'text-sky-400' : 'text-blue-700'}`}>
            <CalendarCheck2 className="mr-3 h-6 w-6"/> Actividad Reciente
          </CardTitle>
          <CardDescription className={darkMode ? 'text-gray-400' : 'text-gray-600'}>
            Partidos organizados o en los que {isOwnProfile ? 'has participado' : 'ha participado'} recientemente.
          </CardDescription>
        </CardHeader>        <CardContent>
          {userMatches.length > 0 ? (
            <ul className="space-y-4">
              {userMatches.map(match => (
                <li key={match.id} className={`p-4 rounded-lg flex justify-between items-center ${darkMode ? 'bg-gray-700/50 hover:bg-gray-700' : 'bg-gray-50 hover:bg-gray-100'} transition-colors`}>
                  <div>
                    <Link 
                      to={`/match/${match.id}`} 
                      className={`font-semibold text-lg ${darkMode ? 'text-sky-300 hover:text-sky-200' : 'text-blue-600 hover:text-blue-500'}`}
                    >
                      {match.deporte?.nombre || 'Deporte'} en {match.direccion || 'Ubicación'}
                    </Link>
                    <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                      {match.fecha ? new Date(match.fecha).toLocaleDateString('es-ES', { 
                        year: 'numeric', 
                        month: 'long', 
                        day: 'numeric' 
                      }) : 'Fecha no disponible'} 
                      {match.hora && ` a las ${match.hora}`}
                      {' - '}
                      <span className="font-medium">
                        {match.organizadorId === currentUser.id ? 'Organizador' : 'Participante'}
                      </span>
                      {match.estado && ` - `}
                      {match.estado && (
                        <span className={`font-medium px-2 py-1 rounded text-xs ${
                          match.estado === 'CANCELADO' ? 
                            'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200' : 
                          match.estado === 'CONFIRMADO' ?
                            'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' :
                          match.estado === 'EN_JUEGO' ?
                            'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200' :
                          match.estado === 'FINALIZADO' ?
                            'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200' :
                          match.estado === 'ARMADO' ?
                            'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200' :
                            'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200'
                        }`}>
                          {match.estado.replace('_', ' ')}
                        </span>
                      )}
                    </p>
                    {match.zona && (
                      <p className={`text-xs ${darkMode ? 'text-gray-500' : 'text-gray-500'}`}>
                        📍 {match.zona.nombre} • {match.cantidadJugadores} jugadores • {match.jugadoresConfirmados} confirmados
                      </p>
                    )}
                  </div>
                  <Button variant="ghost" size="sm" asChild>
                    <Link to={`/match/${match.id}`}>Ver</Link>
                  </Button>
                </li>
              ))}
            </ul>
          ) : (
            <p className={darkMode ? 'text-gray-400' : 'text-gray-600'}>
              {isOwnProfile ? 'Aún no has participado ni organizado partidos.' : 'Este usuario aún no tiene actividad en partidos.'} 
              <Link to="/find-match" className={`${darkMode ? 'text-sky-400 hover:underline' : 'text-blue-600 hover:underline'}`}>
                ¡Busca uno ahora!
              </Link>
            </p>
          )}
        </CardContent>
      </Card>

      {/* Placeholder for achievements or stats */}
      <Card className={darkMode ? 'bg-gray-800/70 border-gray-700 backdrop-blur-md' : 'bg-white/70 border-gray-200 backdrop-blur-md shadow-xl'}>
        <CardHeader>
          <CardTitle className={`flex items-center text-2xl font-semibold ${darkMode ? 'text-sky-400' : 'text-blue-700'}`}>
            <Award className="mr-3 h-6 w-6"/> Logros y Estadísticas
          </CardTitle>
          <CardDescription className={darkMode ? 'text-gray-400' : 'text-gray-600'}>
            Tu progreso y reconocimientos en la plataforma (Próximamente).
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className={`${darkMode ? 'text-gray-500' : 'text-gray-500'}`}>Estamos trabajando para traerte un sistema de logros y estadísticas detalladas. ¡Vuelve pronto!</p>
        </CardContent>
      </Card>

    </motion.div>
  );
}

export default UserProfilePage;
  