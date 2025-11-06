import { useRouter } from 'next/router';
import { ArrowLeft, Home, AlertTriangle, ShieldAlert, Server, Wrench } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';

interface ErrorPageProps {
  statusCode?: number;
  title?: string;
  message?: string;
  showGoBack?: boolean;
  showHome?: boolean;
  className?: string;
}

const errorConfigs = {
  404: {
    icon: AlertTriangle,
    title: 'Page Not Found',
    message: 'The page you\'re looking for doesn\'t exist or has been moved.',
    color: 'bg-amber-500/10 text-amber-600 dark:text-amber-400',
  },
  403: {
    icon: ShieldAlert,
    title: 'Access Denied',
    message: 'You don\'t have permission to access this page.',
    color: 'bg-rose-500/10 text-rose-600 dark:text-rose-400',
  },
  500: {
    icon: Server,
    title: 'Server Error',
    message: 'Something went wrong on our end. Please try again later.',
    color: 'bg-red-500/10 text-red-600 dark:text-red-400',
  },
  maintenance: {
    icon: Wrench,
    title: 'Under Maintenance',
    message: 'We\'re performing some maintenance. Please check back soon!',
    color: 'bg-blue-500/10 text-blue-600 dark:text-blue-400',
  },
} as const;

type ErrorType = keyof typeof errorConfigs | 'maintenance';

export function ErrorPage({
  statusCode = 404,
  title,
  message,
  showGoBack = true,
  showHome = true,
  className,
}: ErrorPageProps) {
  const router = useRouter();
  const isMaintenance = statusCode === 'maintenance';
  const errorType = isMaintenance ? 'maintenance' : (statusCode in errorConfigs ? statusCode as ErrorType : 500);
  const { icon: Icon, title: defaultTitle, message: defaultMessage, color } = errorConfigs[errorType];

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

  return (
    <motion.div 
      variants={container}
      initial="hidden"
      animate="show"
      className={cn("min-h-screen flex items-center justify-center p-4", className)}
    >
      <div className="w-full max-w-md">
        <Card className="border-0 shadow-lg overflow-hidden">
          <CardHeader className="bg-primary/5 border-b">
            <motion.div variants={item} className="flex items-center justify-center mb-4">
              <div className={cn("p-3 rounded-full", color)}>
                <Icon className="h-12 w-12" />
              </div>
            </motion.div>
            <motion.div variants={item}>
              <CardTitle className="text-3xl font-bold text-center">
                {isMaintenance ? 'Maintenance' : statusCode}
              </CardTitle>
              <CardDescription className="text-center text-lg mt-2">
                {title || defaultTitle}
              </CardDescription>
            </motion.div>
          </CardHeader>
          
          <CardContent className="pt-8 pb-6">
            <motion.div variants={item} className="text-center">
              <p className="text-muted-foreground mb-6">
                {message || defaultMessage}
              </p>
              <div className="h-48 relative overflow-hidden rounded-lg bg-muted/30 flex items-center justify-center">
                <div className="absolute inset-0 bg-grid-primary/10 [mask-image:linear-gradient(0deg,#fff,transparent)]" />
                <div className="relative z-10 flex flex-col items-center">
                  <div className={cn("h-16 w-16 rounded-full flex items-center justify-center mb-4", color.replace('text-', 'bg-').replace('dark:text-', 'dark:bg-'))}>
                    <Icon className="h-8 w-8" />
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {errorType === 404 ? 'Nothing to see here' : 'Something went wrong'}
                  </p>
                </div>
              </div>
            </motion.div>
          </CardContent>
          
          <CardFooter className="flex flex-col space-y-3 sm:flex-row sm:space-y-0 sm:space-x-3 justify-center pb-8 px-6">
            {showGoBack && (
              <motion.div variants={item} className="w-full sm:w-auto">
                <Button
                  variant="outline"
                  className="w-full group"
                  onClick={() => router.back()}
                >
                  <ArrowLeft className="mr-2 h-4 w-4 transition-transform group-hover:-translate-x-1" />
                  Go Back
                </Button>
              </motion.div>
            )}
            
            {showHome && (
              <motion.div variants={item} className="w-full sm:w-auto">
                <Button
                  className="w-full group"
                  onClick={() => router.push('/')}
                >
                  <Home className="mr-2 h-4 w-4 transition-transform group-hover:scale-110" />
                  Go to Home
                </Button>
              </motion.div>
            )}
          </CardFooter>
        </Card>
        
        <motion.div 
          variants={item}
          className="mt-6 text-center text-sm text-muted-foreground"
        >
          <p>Need help? <a href="#" className="text-primary hover:underline">Contact support</a></p>
        </motion.div>
      </div>
    </motion.div>
  );
}
