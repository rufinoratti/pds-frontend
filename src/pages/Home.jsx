"use client";
import { useEffect, useState } from "react";
import { Link, useOutletContext, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Users, Zap, CalendarPlus } from "lucide-react";
import { getSports } from "@/services/getSports";
import { Button } from "@/components/ui/button";

const FeatureCard = ({
  icon,
  title,
  description,
  delay,
  darkMode,
  onClick,
  clickable = false,
}) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.5, delay }}
    className={`p-6 rounded-xl shadow-xl transform hover:scale-105 transition-transform duration-300 ${
      clickable ? "cursor-pointer hover:shadow-2xl" : ""
    } ${
      darkMode
        ? "bg-gray-800/70 backdrop-blur-md border border-gray-700"
        : "bg-white/70 backdrop-blur-md border border-gray-200"
    }`}
    onClick={onClick}
  >
    <div
      className={`flex items-center justify-center w-12 h-12 rounded-full mb-4 mx-auto ${
        darkMode ? "bg-sky-500/20 text-sky-400" : "bg-blue-500/10 text-blue-600"
      }`}
    >
      {icon}
    </div>
    <h3
      className={`text-xl font-semibold mb-2 text-center ${
        darkMode ? "text-sky-300" : "text-blue-700"
      }`}
    >
      {title}
    </h3>
    <p
      className={`${
        darkMode ? "text-gray-400" : "text-gray-600"
      } text-sm text-center`}
    >
      {description}
    </p>
    {clickable && (
      <div
        className={`mt-4 text-center text-sm font-medium ${
          darkMode ? "text-sky-400" : "text-blue-600"
        }`}
      >
        Hacer clic para continuar →
      </div>
    )}
  </motion.div>
);

function Home() {
  const { darkMode, currentUser } = useOutletContext();
  const [sports, setSports] = useState([]);

  useEffect(() => {
    const fetchSports = async () => {
      try {
        const sports = await getSports();
        setSports(sports);
      } catch (error) {
        console.error("Error fetching sports:", error);
      }
    };
    fetchSports();
  }, []);

  console.log(sports);

  const navigate = useNavigate();

  const handleFindPlayersClick = () => {
    navigate("/find-match");
  };

  const handleOrganizeMatchClick = () => {
    navigate("/create-match");
  };

  return (
    <div className="flex flex-col items-center justify-center text-center py-8 md:py-16">
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.7, type: "spring", stiffness: 100 }}
        className="mb-10 md:mb-16"
      >
        <h1
          className={`text-5xl md:text-7xl font-extrabold tracking-tight mb-6 ${
            darkMode
              ? "text-transparent bg-clip-text bg-gradient-to-r from-sky-400 via-blue-500 to-indigo-500"
              : "text-transparent bg-clip-text bg-gradient-to-r from-sky-600 via-blue-700 to-indigo-700"
          }`}
        >
          Conéctate. Juega. Disfruta.
        </h1>
        <p
          className={`text-lg md:text-xl ${
            darkMode ? "text-gray-300" : "text-gray-700"
          } max-w-2xl mx-auto`}
        >
          Encuentra compañeros para tu próximo partido de fútbol, básquet, vóley
          y más. ¡Nunca te quedes sin equipo!
        </p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.3 }}
        className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4 mb-16 md:mb-24"
      >
        <Button
          size="lg"
          asChild
          className={`text-lg font-semibold shadow-lg transform hover:scale-105 transition-transform duration-300 ${
            darkMode
              ? "bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-600 hover:to-blue-700 text-white"
              : "bg-gradient-to-r from-sky-600 to-blue-700 hover:from-sky-700 hover:to-blue-800 text-white"
          }`}
        >
          <Link to="/find-match">Buscar Partido</Link>
        </Button>
        <Button
          size="lg"
          variant="outline"
          asChild
          className={`text-lg font-semibold shadow-lg transform hover:scale-105 transition-transform duration-300 ${
            darkMode
              ? "border-sky-500 text-sky-400 hover:bg-sky-500/20"
              : "border-blue-600 text-blue-700 hover:bg-blue-600/10"
          }`}
        >
          <Link to="/create-match">Crear Partido</Link>
        </Button>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto mb-16">
        <FeatureCard
          icon={<Users className="w-6 h-6" />}
          title="Encuentra Jugadores"
          description="Conéctate con deportistas en tu área y completa tu equipo fácilmente."
          delay={0.5}
          darkMode={darkMode}
          onClick={handleFindPlayersClick}
          clickable={true}
        />
        <FeatureCard
          icon={<CalendarPlus className="w-6 h-6" />}
          title="Organiza Partidos"
          description="Crea y gestiona tus propios encuentros deportivos con detalles personalizables."
          delay={0.7}
          darkMode={darkMode}
          onClick={handleOrganizeMatchClick}
          clickable={true}
        />
        <FeatureCard
          icon={<Zap className="w-6 h-6" />}
          title="Juega Más"
          description="Descubre nuevas oportunidades para practicar tus deportes favoritos y mantente activo."
          delay={0.9}
          darkMode={darkMode}
          clickable={false}
        />
      </div>

      {currentUser && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 1.1 }}
          className={`p-8 rounded-xl shadow-xl ${
            darkMode
              ? "bg-gray-800/70 backdrop-blur-md border border-gray-700"
              : "bg-white/70 backdrop-blur-md border border-gray-200"
          } max-w-3xl mx-auto`}
        >
          <h2
            className={`text-3xl font-bold mb-4 ${
              darkMode ? "text-sky-400" : "text-blue-700"
            }`}
          >
            ¡Hola, {currentUser.username}!
          </h2>
          <p className={`${darkMode ? "text-gray-300" : "text-gray-700"} mb-6`}>
            ¿Listo para tu próximo partido? Revisa los partidos disponibles o
            crea uno nuevo.
          </p>
          <div className="flex justify-center space-x-4">
            <Button
              asChild
              className={`${
                darkMode
                  ? "bg-sky-500 hover:bg-sky-600"
                  : "bg-blue-600 hover:bg-blue-700"
              }`}
            >
              <Link to="/find-match">Ver Partidos Cerca</Link>
            </Button>
          </div>
        </motion.div>
      )}

      <div className="mt-16">
        <h2
          className={`text-3xl font-bold mb-8 ${
            darkMode ? "text-sky-300" : "text-blue-800"
          }`}
        >
          Deportes Populares
        </h2>
        <div className="flex flex-wrap justify-center gap-4">
          {sports?.map((sport, index) => (
            <motion.div
              key={sport.id}
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3, delay: 1.3 + index * 0.1 }}
              className={`px-6 py-3 rounded-full text-sm font-medium cursor-pointer shadow-md hover:shadow-lg transition-shadow ${
                darkMode
                  ? "bg-gray-700 text-gray-200 hover:bg-gray-600"
                  : "bg-white text-gray-700 hover:bg-gray-50"
              }`}
              onClick={() => navigate(`/find-match?sport=${sport.id}`)}
            >
              {sport.nombre}
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default Home;
