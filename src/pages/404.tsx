import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Home, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/hooks/useAuth';
import { motion } from 'framer-motion';
import { useEffect } from 'react';

export default function NotFoundPage() {
  const navigate = useNavigate();
  const { authState } = useAuth();
  const { isAuthenticated, isLoading } = authState;

  const handleGoBack = () => {
    if (window.history.length > 1) {
      navigate(-1);
    } else {
      navigate(isAuthenticated ? '/dashboard' : '/login');
    }
  };

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { duration: 0.5 } }
  };

  // Show loading state if auth is still being checked
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted/20 flex items-center justify-center p-4">
      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="w-full max-w-md"
      >
        <Card className="border-0 shadow-lg overflow-hidden">
          <CardHeader className="bg-primary/5 border-b">
            <motion.div variants={item} className="flex items-center justify-center mb-4">
              <div className="bg-destructive/10 p-3 rounded-full">
                <AlertTriangle className="h-12 w-12 text-destructive" />
              </div>
            </motion.div>
            <motion.div variants={item}>
              <CardTitle className="text-4xl font-bold text-center">404</CardTitle>
              <CardDescription className="text-center text-lg mt-2">
                Oops! Page not found
              </CardDescription>
            </motion.div>
          </CardHeader>
          
          <CardContent className="pt-8 pb-6">
            <motion.div variants={item} className="text-center">
              <p className="text-muted-foreground mb-6">
                The page you're looking for doesn't exist or has been moved.
              </p>
              <div className="h-48 relative overflow-hidden rounded-lg bg-muted/30 flex items-center justify-center">
                <div className="absolute inset-0 bg-grid-primary/10 [mask-image:linear-gradient(0deg,#fff,transparent)]" />
                <div className="relative z-10 flex flex-col items-center">
                  <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                    <AlertTriangle className="h-8 w-8 text-primary" />
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {isAuthenticated ? 'Let\'s get you back on track' : 'Please sign in to continue'}
                  </p>
                </div>
              </div>
            </motion.div>
          </CardContent>
          
          <CardFooter className="flex flex-col space-y-3 sm:flex-row sm:space-y-0 sm:space-x-3 justify-center pb-8 px-6">
            <motion.div variants={item} className="w-full sm:w-auto">
              <Button
                variant="outline"
                className="w-full group"
                onClick={handleGoBack}
              >
                <ArrowLeft className="mr-2 h-4 w-4 transition-transform group-hover:-translate-x-1" />
                Go Back
              </Button>
            </motion.div>
            
            <motion.div variants={item} className="w-full sm:w-auto">
              <Button
                className="w-full group"
                onClick={() => navigate(isAuthenticated ? '/dashboard' : '/login')}
              >
                <Home className="mr-2 h-4 w-4 transition-transform group-hover:scale-110" />
                {isAuthenticated ? 'Go to Dashboard' : 'Go to Login'}
              </Button>
            </motion.div>
          </CardFooter>
        </Card>
        
        <motion.div 
          variants={item}
          className="mt-6 text-center text-sm text-muted-foreground"
        >
          <p>
            Need help?{' '}
            <a 
              href="#" 
              className="text-primary hover:underline"
              onClick={(e) => {
                e.preventDefault();
                // Implement your help/support functionality
                alert('Support contact: support@gymmanagement.com');
              }}
            >
              Contact support
            </a>
          </p>
        </motion.div>
      </motion.div>
    </div>
  );
}
