
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

const sports = ["Fútbol", "Básquet", "Vóley", "Tenis", "Pádel", "Otro", "No especificado"];
const levels = ["Principiante", "Intermedio", "Avanzado", "No especificado"];

function UserProfilePage() {
  const { username: profileUsername } = useParams();
  const { currentUser, setCurrentUser, darkMode } = useOutletContext();
  const { toast } = useToast();
  const navigate = useNavigate();

  const [profileData, setProfileData] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editableData, setEditableData] = useState({ favoriteSport: '', skillLevel: '' });
  const [userMatches, setUserMatches] = useState([]);

  useEffect(() => {
    if (!currentUser) {
      navigate('/auth');
      return;
    }

    const users = JSON.parse(localStorage.getItem('users')) || [];
    const viewingUser = users.find(u => u.username === profileUsername);

    if (viewingUser) {
      setProfileData(viewingUser);
      if (currentUser && currentUser.username === profileUsername) {
        setEditableData({ 
          favoriteSport: viewingUser.favoriteSport || 'No especificado', 
          skillLevel: viewingUser.skillLevel || 'No especificado' 
        });
      }
      // Load user's matches (organized or joined)
      const allMatches = JSON.parse(localStorage.getItem('matches')) || [];
      const filteredMatches = allMatches.filter(m => 
        m.organizerUsername === viewingUser.username || 
        (m.players && m.players.some(p => p.username === viewingUser.username))
      );
      setUserMatches(filteredMatches.slice(0, 5)); // Show recent 5
    } else {
      toast({ title: "Error", description: "Perfil no encontrado.", variant: "destructive" });
      navigate('/');
    }
  }, [profileUsername, currentUser, navigate, toast]);

  const handleEditToggle = () => {
    if (isEditing) { // Saving changes
      const users = JSON.parse(localStorage.getItem('users')) || [];
      const userIndex = users.findIndex(u => u.username === currentUser.username);
      if (userIndex !== -1) {
        users[userIndex] = { ...users[userIndex], ...editableData };
        localStorage.setItem('users', JSON.stringify(users));
        setCurrentUser(users[userIndex]); // Update context/global state
        setProfileData(users[userIndex]); // Update local profile view
        toast({ title: "Perfil Actualizado", description: "Tus cambios han sido guardados." });
      }
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
  
  const isOwnProfile = currentUser && currentUser.username === profileData.username;

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
                alt={profileData.username} 
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
            <CardTitle className={`text-4xl font-bold ${darkMode ? 'text-sky-300' : 'text-blue-700'}`}>{profileData.username}</CardTitle>
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
                  </SelectTrigger>
                  <SelectContent className={darkMode ? 'bg-gray-700 border-gray-600 text-gray-200' : ''}>
                    {sports.map(s => <SelectItem key={s} value={s} className={darkMode ? 'hover:bg-gray-600' : ''}>{s}</SelectItem>)}
                  </SelectContent>
                </Select>
              ) : (
                <p className={`text-lg font-semibold ${darkMode ? 'text-gray-100' : 'text-gray-800'}`}>{profileData.favoriteSport || 'No especificado'}</p>
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
                <p className={`text-lg font-semibold ${darkMode ? 'text-gray-100' : 'text-gray-800'}`}>{profileData.skillLevel || 'No especificado'}</p>
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
        </CardHeader>
        <CardContent>
          {userMatches.length > 0 ? (
            <ul className="space-y-4">
              {userMatches.map(match => (
                <li key={match.id} className={`p-4 rounded-lg flex justify-between items-center ${darkMode ? 'bg-gray-700/50 hover:bg-gray-700' : 'bg-gray-50 hover:bg-gray-100'} transition-colors`}>
                  <div>
                    <Link to={`/match/${match.id}`} className={`font-semibold text-lg ${darkMode ? 'text-sky-300 hover:text-sky-200' : 'text-blue-600 hover:text-blue-500'}`}>{match.sport} en {match.location}</Link>
                    <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>{new Date(match.dateTime).toLocaleDateString()} - Estado: <span className={`font-medium ${match.status === 'Cancelado' ? (darkMode ? 'text-red-400' : 'text-red-600') : (darkMode ? 'text-green-400' : 'text-green-600')}`}>{match.status}</span></p>
                  </div>
                  <Button variant="ghost" size="sm" asChild>
                    <Link to={`/match/${match.id}`}>Ver</Link>
                  </Button>
                </li>
              ))}
            </ul>
          ) : (
            <p className={darkMode ? 'text-gray-400' : 'text-gray-600'}>{isOwnProfile ? 'Aún no has participado ni organizado partidos.' : 'Este usuario aún no tiene actividad en partidos.'} <Link to="/find-match" className={`${darkMode ? 'text-sky-400 hover:underline' : 'text-blue-600 hover:underline'}`}>¡Busca uno ahora!</Link></p>
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
  