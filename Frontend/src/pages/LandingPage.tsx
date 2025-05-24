import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";

const LandingPage = () => {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate a loading state
    const timer = setTimeout(() => {
      setLoading(false);
    }, 800);
    
    return () => clearTimeout(timer);
  }, []);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { 
        staggerChildren: 0.15,
        delayChildren: 0.2
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { 
      y: 0, 
      opacity: 1,
      transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] }
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-pulse-gentle">
          <div className="h-12 w-48 bg-primary/20 rounded-lg mb-8"></div>
          <div className="h-4 w-72 bg-muted rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-background overflow-hidden">
      {/* Top Nav */}
      <header className="w-full flex justify-end p-6">
        <Button asChild variant="outline" size="sm" className="text-base px-4 py-2">
          <Link to="/login">Login</Link>
        </Button>
      </header>

      {/* Hero Section */}
      <section className="py-20 px-6 flex flex-col items-center justify-center text-center min-h-[90vh]">
        <motion.div
          className="max-w-3xl mx-auto"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          <motion.h1 
            className="text-4xl md:text-6xl font-bold mb-6 tracking-tight"
            variants={itemVariants}
          >
            The Ultimate Loyalty<br />
            <span className="text-primary">Management Platform</span>
          </motion.h1>
          
          <motion.p 
            className="text-xl md:text-2xl text-muted-foreground mb-12 max-w-2xl mx-auto"
            variants={itemVariants}
          >
            A comprehensive suite of apps for restaurants, admins, and customers to manage loyalty programs with ease.
          </motion.p>
          
          <motion.div 
            className="flex flex-col sm:flex-row gap-4 justify-center mb-16"
            variants={itemVariants}
          >
            <Button asChild size="lg" className="text-base px-8 py-6">
              <Link to="/login">Get Started</Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="text-base px-8 py-6">
              <Link to="/login">Learn More</Link>
            </Button>
          </motion.div>
          
          <motion.div
            className="grid grid-cols-1 md:grid-cols-4 gap-8"
            variants={itemVariants}
          >
            {/* Admin Card */}
            <Link 
              to="/admin/dashboard" 
              className="glass-card hover-scale p-6 rounded-lg text-center group"
            >
              <div className="h-12 w-12 bg-primary/10 text-primary rounded-full flex items-center justify-center mx-auto mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <h3 className="text-lg font-medium mb-2">Admin Dashboard</h3>
              <p className="text-sm text-muted-foreground">Manage restaurants and content across the platform</p>
            </Link>
            
            {/* Restaurant Card */}
            <Link 
              to="/restaurant/dashboard" 
              className="glass-card hover-scale p-6 rounded-lg text-center"
            >
              <div className="h-12 w-12 bg-primary/10 text-primary rounded-full flex items-center justify-center mx-auto mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
              </div>
              <h3 className="text-lg font-medium mb-2">Restaurant Portal</h3>
              <p className="text-sm text-muted-foreground">Track customers and manage loyalty points</p>
            </Link>
            
            {/* Scanner Card */}
            <Link 
              to="/scanner" 
              className="glass-card hover-scale p-6 rounded-lg text-center"
            >
              <div className="h-12 w-12 bg-primary/10 text-primary rounded-full flex items-center justify-center mx-auto mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
                </svg>
              </div>
              <h3 className="text-lg font-medium mb-2">Scanner App</h3>
              <p className="text-sm text-muted-foreground">Scan QR codes to add or redeem points</p>
            </Link>
            
            {/* Customer Card */}
            <Link 
              to="/customer/home" 
              className="glass-card hover-scale p-6 rounded-lg text-center"
            >
              <div className="h-12 w-12 bg-primary/10 text-primary rounded-full flex items-center justify-center mx-auto mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
              <h3 className="text-lg font-medium mb-2">Customer App</h3>
              <p className="text-sm text-muted-foreground">View and use loyalty cards for rewards</p>
            </Link>
          </motion.div>
        </motion.div>
      </section>
      
      {/* Footer */}
      <footer className="py-8 px-6 border-t border-border">
        <div className="max-w-7xl mx-auto">
          <p className="text-center text-sm text-muted-foreground">
            © 2023 Loyalty App. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
