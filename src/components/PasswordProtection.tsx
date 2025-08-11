import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Lock, Eye, EyeOff, Info } from 'lucide-react';
import { SECURITY_CONFIG } from '@/config/security';

interface PasswordProtectionProps {
  children: React.ReactNode;
}

const PasswordProtection = ({ children }: PasswordProtectionProps) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [loginAttempts, setLoginAttempts] = useState(0);

  useEffect(() => {
    // Check if user is already authenticated
    const authStatus = localStorage.getItem('website_authenticated');
    const authTime = localStorage.getItem('website_auth_time');
    
    if (authStatus === 'true' && authTime) {
      const authTimestamp = parseInt(authTime);
      const currentTime = Date.now();
      const hoursSinceAuth = (currentTime - authTimestamp) / (1000 * 60 * 60);
      
      // Check if session is still valid
      if (hoursSinceAuth < SECURITY_CONFIG.SESSION_DURATION_HOURS) {
        setIsAuthenticated(true);
      } else {
        // Session expired, clear storage
        localStorage.removeItem('website_authenticated');
        localStorage.removeItem('website_auth_time');
      }
    }
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    // Simulate a small delay for better UX
    await new Promise(resolve => setTimeout(resolve, 500));

    if (password === SECURITY_CONFIG.WEBSITE_PASSWORD) {
      setIsAuthenticated(true);
      localStorage.setItem('website_authenticated', 'true');
      localStorage.setItem('website_auth_time', Date.now().toString());
      setPassword('');
      setLoginAttempts(0);
    } else {
      const newAttempts = loginAttempts + 1;
      setLoginAttempts(newAttempts);
      
      if (newAttempts >= SECURITY_CONFIG.MAX_LOGIN_ATTEMPTS) {
        setError(`Too many failed attempts. Please try again later.`);
      } else {
        setError(`Incorrect password. ${SECURITY_CONFIG.MAX_LOGIN_ATTEMPTS - newAttempts} attempts remaining.`);
      }
      setPassword('');
    }
    
    setIsLoading(false);
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    localStorage.removeItem('website_authenticated');
    localStorage.removeItem('website_auth_time');
  };

  // If not authenticated, show login form
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <Card className="w-full max-w-md shadow-xl">
          <CardHeader className="text-center">
            <div className="mx-auto w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
              <Lock className="w-8 h-8 text-blue-600" />
            </div>
            <CardTitle className="text-2xl font-bold text-gray-900">
              Website Protected
            </CardTitle>
            <CardDescription className="text-gray-600">
              Enter the password to access Shaukat International Hospital
            </CardDescription>
          </CardHeader>
          
          <CardContent>
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="relative">
                <Input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Enter password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pr-10"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>

              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              {SECURITY_CONFIG.SHOW_PASSWORD_HINT && (
                <Alert>
                  <Info className="h-4 w-4" />
                  <AlertDescription>{SECURITY_CONFIG.PASSWORD_HINT}</AlertDescription>
                </Alert>
              )}

              <Button 
                type="submit" 
                className="w-full" 
                disabled={isLoading || loginAttempts >= SECURITY_CONFIG.MAX_LOGIN_ATTEMPTS}
              >
                {isLoading ? 'Checking...' : 'Access Website'}
              </Button>
            </form>

            <div className="mt-4 text-center text-sm text-gray-500">
              <p>Contact administrator for access</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // If authenticated, show the website content with logout button
  return (
    <div className="relative">
      {/* Logout button - positioned in bottom-right corner */}
      <div className="fixed bottom-4 right-4 z-50">
        <Button
          variant="outline"
          size="sm"
          onClick={handleLogout}
          className="bg-white/90 backdrop-blur-sm hover:bg-white shadow-lg"
        >
          <Lock className="w-4 h-4 mr-2" />
          Lock Website
        </Button>
      </div>

      {/* Website content */}
      {children}
    </div>
  );
};

export default PasswordProtection;
