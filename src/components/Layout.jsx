import React from 'react';
import { Link, Outlet, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { Toaster } from '@/components/ui/toaster';
import { Sun, Moon, LogOut, UserPlus, Search, PlusCircle, FolderHeart as HomeIcon, Menu } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import useUserStore from '@/store/userStore';

function Layout() {
  const { toast } = useToast();
  const [darkMode, setDarkMode] = React.useState(() => {
    const savedMode = localStorage.getItem('darkMode');
    return savedMode ? JSON.parse(savedMode) : false;
  });
  const { currentUser, logout } = useUserStore();
  const navigate = useNavigate();

  React.useEffect(() => {
    localStorage.setItem('darkMode', JSON.stringify(darkMode));
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
    toast({
      title: "Modo de visualización cambiado",
      description: !darkMode ? "Modo oscuro activado 🌙" : "Modo claro activado ☀️",
    });
  };

  const handleLogout = () => {
    logout();
    toast({ title: "Sesión cerrada", description: "Has cerrado sesión exitosamente." });
    navigate('/auth');
  };
  
  const navLinks = [
    { to: "/", label: "Inicio", icon: <HomeIcon className="mr-2 h-4 w-4" /> },
    { to: "/find-match", label: "Buscar Partido", icon: <Search className="mr-2 h-4 w-4" /> },
    { to: "/create-match", label: "Crear Partido", icon: <PlusCircle className="mr-2 h-4 w-4" /> },
  ];

  return (
    <div className={`min-h-screen flex flex-col transition-colors duration-500 ${darkMode ? 'bg-gray-900 text-white' : 'bg-gradient-to-br from-sky-100 via-blue-50 to-indigo-100 text-gray-800'}`}>
      <Toaster />
      <header className={`sticky top-0 z-40 w-full border-b ${darkMode ? 'border-gray-700 bg-gray-900/80 backdrop-blur-md' : 'border-gray-200 bg-white/80 backdrop-blur-md'}`}>
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <div className="flex items-center">
              <Link to="/" className="flex items-center space-x-2">
                <span className={`text-2xl font-bold ${darkMode ? 'text-sky-400' : 'text-blue-600'}`}>ZonaDeport</span>
              </Link>
            </div>

            <nav className="hidden md:flex items-center space-x-4">
              {navLinks.map(link => (
                <Button key={link.to} variant="ghost" asChild className={`${darkMode ? 'hover:bg-gray-700 text-gray-200' : 'hover:bg-sky-100 text-gray-700'}`}>
                  <Link to={link.to}>
                    {link.icon} {link.label}
                  </Link>
                </Button>
              ))}
            </nav>

            <div className="flex items-center space-x-3">
              <Button
                variant="outline"
                size="icon"
                onClick={toggleDarkMode}
                className={`rounded-full transition-all duration-300 focus:ring-2 focus:ring-offset-2 ${darkMode ? 'bg-yellow-400 hover:bg-yellow-500 text-gray-900 focus:ring-yellow-300 border-yellow-500' : 'bg-indigo-600 hover:bg-indigo-700 text-white focus:ring-indigo-500 border-indigo-700'}`}
                aria-label="Toggle dark mode"
              >
                {darkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
              </Button>

              {currentUser ? (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className={`rounded-full h-9 w-9 p-0 ${darkMode ? 'hover:bg-gray-700' : 'hover:bg-sky-100'}`}>
                      <img  
                        alt={currentUser.username || "Avatar de Usuario"} 
                        className="h-8 w-8 rounded-full"
                        src="https://images.unsplash.com/flagged/photo-1608632359963-5828fa3b4141" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className={darkMode ? 'bg-gray-800 border-gray-700' : ''}>
                    <DropdownMenuLabel className={darkMode ? 'text-gray-300' : ''}>Mi Cuenta</DropdownMenuLabel>
                    <DropdownMenuSeparator className={darkMode ? 'bg-gray-700' : ''}/>
                    <DropdownMenuItem className={darkMode ? 'hover:bg-gray-700 text-gray-300' : ''} onClick={() => navigate(`/profile/${currentUser.username}`)}>Perfil</DropdownMenuItem>
                    <DropdownMenuItem className={darkMode ? 'hover:bg-gray-700 text-gray-300' : ''}>Configuración</DropdownMenuItem>
                    <DropdownMenuSeparator className={darkMode ? 'bg-gray-700' : ''}/>
                    <DropdownMenuItem onClick={handleLogout} className={`text-red-500 ${darkMode ? 'hover:bg-red-700/20' : 'hover:bg-red-500/10'}`}>
                      <LogOut className="mr-2 h-4 w-4" />
                      Cerrar Sesión
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                <Button variant="default" asChild className={`${darkMode ? 'bg-sky-500 hover:bg-sky-600 text-white' : 'bg-blue-600 hover:bg-blue-700 text-white'}`}>
                  <Link to="/auth">
                    <UserPlus className="mr-2 h-4 w-4" />
                    Acceder
                  </Link>
                </Button>
              )}
              <div className="md:hidden">
                <Sheet>
                  <SheetTrigger asChild>
                    <Button variant="outline" size="icon" className={darkMode ? 'border-gray-600 hover:bg-gray-700' : 'border-gray-300 hover:bg-gray-100'}>
                      <Menu className="h-5 w-5" />
                    </Button>
                  </SheetTrigger>
                  <SheetContent side="right" className={darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white'}>
                    <nav className="flex flex-col space-y-4 mt-8">
                      {navLinks.map(link => (
                        <Button key={link.to} variant="ghost" asChild className={`w-full justify-start ${darkMode ? 'hover:bg-gray-700 text-gray-200' : 'hover:bg-sky-100 text-gray-700'}`}>
                          <Link to={link.to}>
                            {link.icon} {link.label}
                          </Link>
                        </Button>
                      ))}
                    </nav>
                  </SheetContent>
                </Sheet>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="flex-grow container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Outlet context={{ currentUser, darkMode }} />
      </main>

      <footer className={`py-8 text-center border-t ${darkMode ? 'border-gray-700 text-gray-500' : 'border-gray-200 text-gray-600'}`}>
        <p>&copy; {new Date().getFullYear()} ZonaDeport. Todos los derechos reservados.</p>
        <p className="text-sm">Conectando deportistas, un partido a la vez.</p>
      </footer>
    </div>
  );
}

export default Layout;