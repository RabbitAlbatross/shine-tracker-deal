import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Navbar } from '@/components/Navbar';
import { Link } from 'react-router-dom';
import { 
  TrendingDown, 
  Bell, 
  Shield, 
  Zap, 
  Target,
  BarChart3,
  ArrowRight,
  CheckCircle2
} from 'lucide-react';

export default function Index() {
  const features = [
    {
      icon: <TrendingDown className="h-8 w-8" />,
      title: 'Price Tracking',
      description: 'Monitor product prices across multiple e-commerce platforms in real-time'
    },
    {
      icon: <Bell className="h-8 w-8" />,
      title: 'Smart Alerts',
      description: 'Get instant notifications when prices drop below your target'
    },
    {
      icon: <Target className="h-8 w-8" />,
      title: 'Personalized Recommendations',
      description: 'AI-powered suggestions based on your browsing history and preferences'
    },
    {
      icon: <BarChart3 className="h-8 w-8" />,
      title: 'Price History',
      description: 'View historical price trends with interactive charts and analytics'
    },
    {
      icon: <Shield className="h-8 w-8" />,
      title: 'Secure & Private',
      description: 'Your data is encrypted and protected with industry-standard security'
    },
    {
      icon: <Zap className="h-8 w-8" />,
      title: 'Lightning Fast',
      description: 'Real-time updates with minimal latency for the best deals'
    }
  ];

  const steps = [
    {
      number: '01',
      title: 'Create Account',
      description: 'Sign up in seconds with your email'
    },
    {
      number: '02',
      title: 'Add Products',
      description: 'Track any product from supported stores'
    },
    {
      number: '03',
      title: 'Set Target Price',
      description: 'Define your ideal price point'
    },
    {
      number: '04',
      title: 'Get Notified',
      description: 'Receive alerts when prices drop'
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4 sm:px-6 lg:px-8 bg-gradient-subtle">
        <div className="container mx-auto text-center">
          <div className="animate-fade-in">
            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold mb-6 leading-tight">
              Never Miss a
              <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent"> Deal </span>
              Again
            </h1>
            <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
              Track prices, get instant alerts, and save money on your favorite products with intelligent price monitoring
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/auth">
                <Button size="lg" className="text-lg px-8">
                  Get Started Free
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <Button size="lg" variant="outline" className="text-lg px-8">
                View Demo
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">Powerful Features</h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Everything you need to track prices and save money
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, index) => (
              <Card 
                key={index} 
                className="border-2 hover:border-primary transition-all duration-300 hover:shadow-lg"
              >
                <CardContent className="p-6">
                  <div className="bg-gradient-primary p-3 rounded-lg w-fit mb-4 text-white">
                    {feature.icon}
                  </div>
                  <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                  <p className="text-muted-foreground">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="py-20 px-4 sm:px-6 lg:px-8 bg-muted/30">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">How It Works</h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Start saving in four simple steps
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {steps.map((step, index) => (
              <div key={index} className="text-center">
                <div className="text-6xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent mb-4">
                  {step.number}
                </div>
                <h3 className="text-xl font-semibold mb-2">{step.title}</h3>
                <p className="text-muted-foreground">{step.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="container mx-auto">
          <Card className="bg-gradient-primary text-white border-0 overflow-hidden relative">
            <div className="absolute inset-0 bg-grid-white/10"></div>
            <CardContent className="p-12 relative z-10">
              <div className="max-w-3xl mx-auto text-center">
                <h2 className="text-4xl font-bold mb-4">
                  Ready to Start Saving?
                </h2>
                <p className="text-xl mb-8 text-white/90">
                  Join thousands of smart shoppers who never overpay
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Link to="/auth">
                    <Button size="lg" variant="secondary" className="text-lg px-8">
                      Create Free Account
                    </Button>
                  </Link>
                </div>
                <div className="mt-8 flex flex-wrap justify-center gap-6 text-sm text-white/80">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-5 w-5" />
                    No credit card required
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-5 w-5" />
                    Free forever
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-5 w-5" />
                    Cancel anytime
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t py-12 px-4 sm:px-6 lg:px-8">
        <div className="container mx-auto text-center text-muted-foreground">
          <p>© 2025 PriceTracker. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}