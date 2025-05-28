
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label'; // Importación añadida
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/components/ui/use-toast';
import { Link, useOutletContext } from 'react-router-dom';
import { MapPin, CalendarDays, Users, Search, Filter, ShieldAlert, ShieldCheck, ShieldQuestion, Clock, Sparkles, ChevronRight } from 'lucide-react';

const sports = ["Fútbol", "Básquet", "Vóley", "Tenis", "Pádel", "Otro"];
const levels = ["Cualquiera", "Principiante", "Intermedio", "Avanzado"];

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
    // Add other statuses as needed
    default:
      bgColor = darkMode ? 'bg-gray-500/20' : 'bg-gray-100';
      textColor = darkMode ? 'text-gray-400' : 'text-gray-500';
      Icon = ShieldQuestion;
  }
  return (
    <div className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${bgColor} ${textColor}`}>
      <Icon className="w-3 h-3 mr-1.5" />
      {status}
    </div>
  );
};


function FindMatchPage() {
  const { toast } = useToast();
  const { currentUser, darkMode } = useOutletContext();
  const [matches, setMatches] = useState([]);
  const [filteredMatches, setFilteredMatches] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [sportFilter, setSportFilter] = useState('');
  const [levelFilter, setLevelFilter] = useState('');
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    const storedMatches = JSON.parse(localStorage.getItem('matches')) || [];
    setMatches(storedMatches);
    setFilteredMatches(storedMatches);
  }, []);

  useEffect(() => {
    let result = matches;
    if (searchTerm) {
      result = result.filter(match =>
        match.sport.toLowerCase().includes(searchTerm.toLowerCase()) ||
        match.location.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    if (sportFilter) {
      result = result.filter(match => match.sport === sportFilter);
    }
    if (levelFilter && levelFilter !== "Cualquiera") {
      result = result.filter(match => match.levelRequired === levelFilter || match.levelRequired === "Cualquiera");
    }
    setFilteredMatches(result);
  }, [searchTerm, sportFilter, levelFilter, matches]);

  if (!currentUser) {
    return (
       <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className={`text-center p-8 rounded-lg shadow-xl ${darkMode ? 'bg-gray-800/70 border border-gray-700' : 'bg-white/70 border border-gray-200'}`}
      >
        <Sparkles className={`mx-auto mb-4 h-16 w-16 ${darkMode ? 'text-sky-400' : 'text-blue-600'}`} />
        <h2 className={`text-3xl font-bold mb-4 ${darkMode ? 'text-sky-300' : 'text-blue-700'}`}>Acceso Exclusivo</h2>
        <p className={`${darkMode ? 'text-gray-300' : 'text-gray-600'} mb-6 text-lg`}>
          Para buscar partidos, necesitas iniciar sesión o crear una cuenta. ¡Es rápido y fácil!
        </p>
        <Button asChild size="lg" className={`${darkMode ? 'bg-sky-500 hover:bg-sky-600' : 'bg-blue-600 hover:bg-blue-700'}`}>
          <Link to="/auth">Unirme a la Comunidad</Link>
        </Button>
      </motion.div>
    );
  }

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="space-y-8"
    >
      <div className={`p-6 rounded-xl shadow-lg ${darkMode ? 'bg-gray-800/70 border border-gray-700' : 'bg-white/70 border border-gray-200 backdrop-blur-md'}`}>
        <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
          <h1 className={`text-4xl font-extrabold ${darkMode ? 'text-transparent bg-clip-text bg-gradient-to-r from-sky-400 to-blue-500' : 'text-transparent bg-clip-text bg-gradient-to-r from-sky-600 to-blue-700'}`}>
            Encuentra tu Partido Ideal
          </h1>
          <Button onClick={() => setShowFilters(!showFilters)} variant="outline" className={`${darkMode ? 'border-sky-500 text-sky-400 hover:bg-sky-500/20' : 'border-blue-600 text-blue-700 hover:bg-blue-600/10'}`}>
            <Filter className="mr-2 h-4 w-4" /> {showFilters ? 'Ocultar Filtros' : 'Mostrar Filtros'}
          </Button>
        </div>
        
        <div className="relative mb-6">
          <Search className={`absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 ${darkMode ? 'text-gray-500' : 'text-gray-400'}`} />
          <Input
            type="text"
            placeholder="Buscar por deporte o ubicación..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className={`pl-10 text-lg py-3 ${darkMode ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400 focus:border-sky-500' : 'focus:border-blue-500'}`}
          />
        </div>

        {showFilters && (
          <motion.div 
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6 overflow-hidden"
          >
            <div>
              <Label htmlFor="sport-filter" className={`mb-1 block ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Deporte</Label>
              <Select value={sportFilter} onValueChange={setSportFilter}>
                <SelectTrigger id="sport-filter" className={darkMode ? 'bg-gray-700 border-gray-600 text-white' : ''}>
                  <SelectValue placeholder="Todos los deportes" />
                </SelectTrigger>
                <SelectContent className={darkMode ? 'bg-gray-800 border-gray-700 text-gray-200' : ''}>
                  <SelectItem value="" className={darkMode ? 'hover:bg-gray-700' : ''}>Todos los deportes</SelectItem>
                  {sports.map(sport => <SelectItem key={sport} value={sport} className={darkMode ? 'hover:bg-gray-700' : ''}>{sport}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="level-filter" className={`mb-1 block ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Nivel Requerido</Label>
              <Select value={levelFilter} onValueChange={setLevelFilter}>
                <SelectTrigger id="level-filter" className={darkMode ? 'bg-gray-700 border-gray-600 text-white' : ''}>
                  <SelectValue placeholder="Cualquier Nivel" />
                </SelectTrigger>
                <SelectContent className={darkMode ? 'bg-gray-800 border-gray-700 text-gray-200' : ''}>
                  {levels.map(level => <SelectItem key={level} value={level} className={darkMode ? 'hover:bg-gray-700' : ''}>{level}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </motion.div>
        )}
      </div>

      {filteredMatches.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredMatches.map((match, index) => (
            <motion.div
              key={match.id || index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
            >
              <Card className={`overflow-hidden h-full flex flex-col transform hover:shadow-2xl transition-shadow duration-300 ${darkMode ? 'bg-gray-800 border-gray-700 hover:border-sky-500' : 'bg-white hover:border-blue-500'}`}>
                <CardHeader className="pb-4">
                   <div className="flex justify-between items-start">
                    <CardTitle className={`text-2xl font-bold ${darkMode ? 'text-sky-400' : 'text-blue-700'}`}>{match.sport}</CardTitle>
                    <MatchStatusBadge status={match.status || 'Necesitamos jugadores'} darkMode={darkMode} />
                  </div>
                  <CardDescription className={`${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Organizado por: {match.organizerUsername || 'Usuario Anónimo'}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3 flex-grow">
                  <div className="flex items-center">
                    <MapPin className={`mr-2 h-5 w-5 ${darkMode ? 'text-sky-400' : 'text-blue-600'}`} />
                    <span className={`${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>{match.location}</span>
                  </div>
                  <div className="flex items-center">
                    <CalendarDays className={`mr-2 h-5 w-5 ${darkMode ? 'text-sky-400' : 'text-blue-600'}`} />
                    <span className={`${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>{new Date(match.dateTime).toLocaleDateString()} - {new Date(match.dateTime).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                  </div>
                   <div className="flex items-center">
                    <Clock className={`mr-2 h-5 w-5 ${darkMode ? 'text-sky-400' : 'text-blue-600'}`} />
                    <span className={`${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Duración: {match.duration} min</span>
                  </div>
                  <div className="flex items-center">
                    <Users className={`mr-2 h-5 w-5 ${darkMode ? 'text-sky-400' : 'text-blue-600'}`} />
                    <span className={`${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Jugadores: {(match.players && match.players.length) || 0} / {match.playersNeeded}</span>
                  </div>
                  <div className="flex items-center">
                    <Sparkles className={`mr-2 h-5 w-5 ${darkMode ? 'text-sky-400' : 'text-blue-600'}`} />
                    <span className={`${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Nivel: {match.levelRequired}</span>
                  </div>
                </CardContent>
                <CardFooter className="pt-4">
                  <Button asChild className={`w-full ${darkMode ? 'bg-sky-500 hover:bg-sky-600' : 'bg-blue-600 hover:bg-blue-700'}`}>
                    <Link to={`/match/${match.id}`}>
                      Ver Detalles <ChevronRight className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>
                </CardFooter>
              </Card>
            </motion.div>
          ))}
        </div>
      ) : (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className={`text-center py-12 px-6 rounded-xl shadow-lg ${darkMode ? 'bg-gray-800/70 border border-gray-700' : 'bg-white/70 border border-gray-200 backdrop-blur-md'}`}
        >
          <Search className={`mx-auto mb-6 h-20 w-20 ${darkMode ? 'text-sky-500' : 'text-blue-500'}`} />
          <h2 className={`text-3xl font-semibold mb-3 ${darkMode ? 'text-sky-300' : 'text-blue-700'}`}>No hay partidos que coincidan</h2>
          <p className={`${darkMode ? 'text-gray-400' : 'text-gray-600'} mb-6 max-w-md mx-auto`}>
            Intenta ajustar tus filtros o amplía tu búsqueda. ¡También puedes crear tu propio partido!
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Button onClick={() => {setSearchTerm(''); setSportFilter(''); setLevelFilter('');}} variant="outline" className={`${darkMode ? 'border-sky-500 text-sky-400 hover:bg-sky-500/20' : 'border-blue-600 text-blue-700 hover:bg-blue-600/10'}`}>
              Limpiar Filtros
            </Button>
            <Button asChild className={`${darkMode ? 'bg-sky-500 hover:bg-sky-600' : 'bg-blue-600 hover:bg-blue-700'}`}>
              <Link to="/create-match">Crear un Partido</Link>
            </Button>
          </div>
        </motion.div>
      )}
    </motion.div>
  );
}

export default FindMatchPage;
  