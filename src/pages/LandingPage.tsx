"use client";

import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, Sphere, MeshDistortMaterial } from "@react-three/drei";
import { Button } from "../components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import { Shield, Zap, Bell, FileText, Cloud } from "lucide-react";

const AnimatedTitle = ({ text }: { text: string }) => {
  return (
    <div className="flex overflow-hidden">
      {text.split("").map((char, index) => (
        <motion.span
          key={index}
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: index * 0.05 }}
          className="inline-block"
        >
          {char}
        </motion.span>
      ))}
    </div>
  );
};

const FeatureShowcase = () => {
  const [activeFeature, setActiveFeature] = useState(0);
  const features = [
    {
      title: "Real-Time Monitoring",
      description:
        "Watch your security metrics update in real-time with our advanced dashboard.",
    },
    {
      title: "AI-Powered Insights",
      description:
        "Our AI analyzes patterns to predict and prevent potential security breaches.",
    },
    {
      title: "Customizable Alerts",
      description:
        "Set up personalized alerts for the metrics that matter most to your organization.",
    },
    {
      title: "Compliance Reporting",
      description:
        "Generate comprehensive reports to meet various industry compliance standards.",
    },
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveFeature((prev) => (prev + 1) % features.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="bg-gradient-to-r from-purple-700 to-indigo-800 text-white p-8 rounded-2xl shadow-2xl">
      <h3 className="text-2xl font-bold mb-4">Feature Spotlight</h3>
      <div className="relative h-64">
        {features.map((feature, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, x: 20 }}
            animate={{
              opacity: index === activeFeature ? 1 : 0,
              x: index === activeFeature ? 0 : 20,
            }}
            transition={{ duration: 0.5 }}
            className="absolute inset-0"
          >
            <h4 className="text-xl font-semibold mb-2">{feature.title}</h4>
            <p>{feature.description}</p>
          </motion.div>
        ))}
      </div>
      <div className="flex justify-center mt-4">
        {features.map((_, index) => (
          <button
            key={index}
            className={`w-3 h-3 rounded-full mx-1 ${
              index === activeFeature ? "bg-white" : "bg-gray-400"
            }`}
            onClick={() => setActiveFeature(index)}
          />
        ))}
      </div>
    </div>
  );
};

export default function LandingPage() {
  const navigate = useNavigate();

  const handleNavigation = (path: string) => {
    if (path.startsWith("#")) {
      // Handle anchor links
      document.querySelector(path)?.scrollIntoView({ behavior: "smooth" });
    } else {
      // Handle route navigation
      navigate(path);
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      <header className="sticky top-0 z-50 backdrop-blur-md bg-white/30 dark:bg-gray-900/30">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <motion.div
            className="flex items-center"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
          >
            <img src="/logo.svg" alt="SIEM Guard Logo" className="w-10 h-10" />
            <span className="ml-2 text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-600 to-indigo-600 animate-gradient">
              SIEM Guard
            </span>
          </motion.div>
          <nav className="hidden md:flex space-x-8">
            <motion.div
              className="flex space-x-8"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <button
                onClick={() => handleNavigation("#features")}
                className="text-sm font-medium text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white transition-colors"
              >
                Features
              </button>
              <button
                onClick={() => handleNavigation("#pricing")}
                className="text-sm font-medium text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white transition-colors"
              >
                Pricing
              </button>
              <button
                onClick={() => handleNavigation("#contact")}
                className="text-sm font-medium text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white transition-colors"
              >
                Contact
              </button>
              <button
                onClick={() => handleNavigation("/dashboard")}
                className="text-sm font-medium text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white transition-colors"
              >
                Login
              </button>
            </motion.div>
          </nav>
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.4 }}
          >
            <Button
              onClick={() => handleNavigation("/dashboard")}
              className="hidden md:inline-flex bg-gradient-to-r from-purple-600 to-indigo-600 text-white hover:from-purple-700 hover:to-indigo-700 transition-all duration-300"
            >
              Get Started
            </Button>
            <Button variant="ghost" className="md:hidden">
              ☰
            </Button>
          </motion.div>
        </div>
      </header>

      <main className="flex-grow">
        <section className="py-20 md:py-32">
          <div className="container mx-auto px-4 flex flex-col md:flex-row items-center">
            <motion.div
              className="md:w-1/2 mb-12 md:mb-0"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <AnimatedTitle text="Real-Time Security Insights" />
              <h2 className="text-3xl md:text-4xl font-bold mt-2 mb-6 bg-clip-text text-transparent bg-gradient-to-r from-purple-600 to-indigo-600 animate-gradient">
                Simplified.
              </h2>
              <p className="text-xl mb-8 text-gray-600 dark:text-gray-300">
                AI-driven vulnerability detection and centralized security
                monitoring for cybersecurity specialists.
              </p>
              <Button
                onClick={() => handleNavigation("/dashboard")}
                size="lg"
                className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white hover:from-purple-700 hover:to-indigo-700 transition-all duration-300 animate-pulse-slow"
              >
                Start Monitoring Today
              </Button>
            </motion.div>
            <motion.div
              className="md:w-1/2 h-[400px]"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, delay: 0.3 }}
            >
              <Canvas>
                <OrbitControls
                  enableZoom={false}
                  autoRotate
                  autoRotateSpeed={0.5}
                />
                <ambientLight intensity={0.5} />
                <directionalLight position={[-2, 5, 2]} intensity={1} />
                <Sphere args={[1, 100, 200]} scale={2.4}>
                  <MeshDistortMaterial
                    color="#6366f1"
                    attach="material"
                    distort={0.3}
                    speed={1.5}
                    roughness={0.4}
                    metalness={0.8}
                  />
                </Sphere>
              </Canvas>
            </motion.div>
          </div>
        </section>

        <section id="features" className="py-20">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold text-center mb-16 bg-clip-text text-transparent bg-gradient-to-r from-purple-600 to-indigo-600">
              Key Features
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
              {[
                {
                  icon: Zap,
                  title: "Real-Time Threat Detection",
                  description:
                    "Instantly identify and respond to security threats as they happen.",
                },
                {
                  icon: Shield,
                  title: "AI-Powered Vulnerability Analysis",
                  description:
                    "Leverage advanced AI to predict and prevent potential security breaches.",
                },
                {
                  icon: Bell,
                  title: "Centralized Alerts and Logging",
                  description:
                    "Manage all your security alerts and logs from a single, intuitive dashboard.",
                },
                {
                  icon: FileText,
                  title: "Compliance Reporting",
                  description:
                    "Easily generate reports to meet various compliance requirements.",
                },
                {
                  icon: Cloud,
                  title: "Scalable Cloud Hosting",
                  description:
                    "Grow your security infrastructure effortlessly with our cloud-based solution.",
                },
              ].map((feature, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                >
                  <Card className="h-full transition-transform hover:scale-105 hover:shadow-lg dark:bg-gray-800">
                    <CardHeader>
                      <feature.icon className="w-12 h-12 mb-4 text-purple-600" />
                      <CardTitle className="text-xl">{feature.title}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <CardDescription className="text-gray-600 dark:text-gray-300">
                        {feature.description}
                      </CardDescription>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        <section className="py-20 bg-gray-50 dark:bg-gray-900">
          <div className="container mx-auto px-4">
            <motion.h2
              className="text-3xl font-bold text-center mb-16 bg-clip-text text-transparent bg-gradient-to-r from-purple-600 to-indigo-600"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
            >
              What Our Clients Say
            </motion.h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
              {[
                {
                  name: "John Doe",
                  role: "CISO at TechCorp",
                  quote:
                    "SIEM Guard has revolutionized our security operations. We've cut response times by 50% and improved our overall security posture.",
                  avatar: "/avatar1.jpg",
                },
                {
                  name: "Jane Smith",
                  role: "IT Director at FinanceHub",
                  quote:
                    "The AI-powered insights have been a game-changer. We're now proactively addressing vulnerabilities before they become threats.",
                  avatar: "/avatar2.jpg",
                },
                {
                  name: "Alex Johnson",
                  role: "Security Analyst at HealthNet",
                  quote:
                    "The centralized logging and compliance reporting features have saved us countless hours. It's an indispensable tool for our team.",
                  avatar: "/avatar3.jpg",
                },
              ].map((testimonial, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, scale: 0.9, y: 20 }}
                  whileInView={{ opacity: 1, scale: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  whileHover={{ scale: 1.02 }}
                  className="cursor-pointer"
                >
                  <Card className="h-full transition-all duration-300 hover:shadow-xl dark:bg-gray-800 relative overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-r from-purple-600/10 to-indigo-600/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    <CardHeader>
                      <div className="flex items-center">
                        <motion.img
                          src={testimonial.avatar}
                          alt={testimonial.name}
                          className="w-[60px] h-[60px] rounded-full mr-4"
                          whileHover={{ scale: 1.1 }}
                          transition={{ type: "spring", stiffness: 300 }}
                        />
                        <div>
                          <CardTitle className="text-lg">
                            {testimonial.name}
                          </CardTitle>
                          <CardDescription>{testimonial.role}</CardDescription>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <motion.p
                        className="italic text-gray-600 dark:text-gray-300 relative"
                        initial={{ opacity: 0 }}
                        whileInView={{ opacity: 1 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.5, delay: index * 0.2 }}
                      >
                        <span className="text-4xl text-purple-600/20 absolute -top-4 -left-2">
                          "
                        </span>
                        {testimonial.quote}
                        <span className="text-4xl text-purple-600/20 absolute -bottom-8 -right-2">
                          "
                        </span>
                      </motion.p>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        <section className="py-20">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold text-center mb-16 bg-clip-text text-transparent bg-gradient-to-r from-purple-600 to-indigo-600">
              How It Works
            </h2>
            <div className="flex flex-col md:flex-row justify-around items-center space-y-12 md:space-y-0">
              {[
                {
                  step: 1,
                  title: "Deploy the Agent",
                  description:
                    "Easily install our lightweight agent on your systems.",
                  icon: "🚀",
                },
                {
                  step: 2,
                  title: "Monitor Threats in Real Time",
                  description:
                    "Get instant alerts and visualizations of your security landscape.",
                  icon: "👀",
                },
                {
                  step: 3,
                  title: "Respond and Mitigate",
                  description:
                    "Take action quickly with our guided response protocols.",
                  icon: "👨‍💻",
                },
              ].map((step, index) => (
                <motion.div
                  key={index}
                  className="text-center"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.2 }}
                >
                  <div className="text-6xl mb-6">{step.icon}</div>
                  <h3 className="text-2xl font-bold mb-4">
                    Step {step.step}: {step.title}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-300 max-w-xs mx-auto">
                    {step.description}
                  </p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        <section className="py-20 bg-gray-50 dark:bg-gray-900">
          <div className="container mx-auto px-4">
            <FeatureShowcase />
          </div>
        </section>

        <section id="pricing" className="py-20">
          <div className="container mx-auto px-4">
            <motion.h2
              className="text-3xl font-bold text-center mb-16 bg-clip-text text-transparent bg-gradient-to-r from-purple-600 to-indigo-600"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
            >
              Pricing Plans
            </motion.h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
              {[
                {
                  name: "Basic",
                  price: "$99",
                  features: [
                    "Up to 5 agents",
                    "7-day log retention",
                    "Email support",
                  ],
                  popular: false,
                  gradient: "from-purple-500 to-indigo-500",
                },
                {
                  name: "Pro",
                  price: "$299",
                  features: [
                    "Up to 20 agents",
                    "30-day log retention",
                    "24/7 phone support",
                    "Advanced AI insights",
                  ],
                  popular: true,
                  gradient: "from-purple-600 to-indigo-600",
                },
                {
                  name: "Enterprise",
                  price: "Custom",
                  features: [
                    "Unlimited agents",
                    "1-year log retention",
                    "Dedicated account manager",
                    "Custom integrations",
                  ],
                  popular: false,
                  gradient: "from-purple-700 to-indigo-700",
                },
              ].map((plan, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  whileHover={{ y: -10 }}
                  className="relative"
                >
                  {plan.popular && (
                    <div className="absolute -top-5 left-0 right-0 flex justify-center">
                      <span className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white px-4 py-1 rounded-full text-sm font-medium">
                        Most Popular
                      </span>
                    </div>
                  )}
                  <Card
                    className={`h-full transition-all duration-300 hover:shadow-xl dark:bg-gray-800 ${
                      plan.popular ? "border-2 border-purple-500" : ""
                    }`}
                  >
                    <CardHeader>
                      <CardTitle className="text-2xl flex items-center justify-between">
                        {plan.name}
                        {plan.popular && (
                          <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ type: "spring", stiffness: 300 }}
                          >
                            <span className="text-purple-600">★</span>
                          </motion.div>
                        )}
                      </CardTitle>
                      <CardDescription>
                        <span
                          className={`text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r ${plan.gradient}`}
                        >
                          {plan.price}
                        </span>
                        {plan.price !== "Custom" && (
                          <span className="text-gray-600 dark:text-gray-300">
                            /month
                          </span>
                        )}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <ul className="list-none space-y-4 mb-6">
                        {plan.features.map((feature, featureIndex) => (
                          <motion.li
                            key={featureIndex}
                            className="flex items-center text-gray-600 dark:text-gray-300"
                            initial={{ opacity: 0, x: -20 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                            transition={{
                              duration: 0.3,
                              delay: index * 0.1 + featureIndex * 0.1,
                            }}
                          >
                            <svg
                              className="w-5 h-5 text-purple-600 mr-3"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth="2"
                                d="M5 13l4 4L19 7"
                              />
                            </svg>
                            {feature}
                          </motion.li>
                        ))}
                      </ul>
                      <Button
                        onClick={() => handleNavigation("/dashboard")}
                        className={`w-full bg-gradient-to-r ${plan.gradient} text-white hover:shadow-lg transition-all duration-300`}
                        size={plan.popular ? "lg" : "default"}
                      >
                        {plan.price === "Custom" ? "Contact Us" : "Get Started"}
                      </Button>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        <section className="py-20 bg-gradient-to-r from-purple-600 to-indigo-600 text-white relative overflow-hidden">
          <div className="absolute inset-0">
            <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxwYXRoIGQ9Ik0zNiAxOGMtNi42MjcgMC0xMiA1LjM3My0xMiAxMnM1LjM3MyAxMiAxMiAxMiAxMi01LjM3MyAxMi0xMi01LjM3My0xMi0xMi0xMnptMCAxOGMtMy4zMTQgMC02LTIuNjg2LTYtNnMyLjY4Ni02IDYtNiA2IDIuNjg2IDYgNi0yLjY4NiA2LTYgNnoiIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iLjEiLz48L2c+PC9zdmc+')] opacity-10" />
          </div>
          <motion.div
            className="container mx-auto px-4 text-center relative z-10"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <motion.h2
              className="text-4xl font-bold mb-6"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              Ready to Secure Your Systems?
            </motion.h2>
            <motion.p
              className="text-xl mb-8 max-w-2xl mx-auto"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.3 }}
            >
              Start your free trial today and experience the power of AI-driven
              security monitoring.
            </motion.p>
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.4 }}
            >
              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                <Button
                  onClick={() => handleNavigation("/dashboard")}
                  size="lg"
                  variant="secondary"
                  className="bg-white text-purple-600 hover:bg-gray-100 transition-all duration-300 min-w-[200px]"
                >
                  Start Free Trial
                </Button>
                <Button
                  onClick={() => handleNavigation("/dashboard")}
                  size="lg"
                  variant="outline"
                  className="border-white text-white hover:bg-white/10 transition-all duration-300 min-w-[200px]"
                >
                  Schedule Demo
                </Button>
              </div>
              <p className="mt-6 text-sm text-white/80">
                No credit card required • 14-day free trial • Cancel anytime
              </p>
            </motion.div>
          </motion.div>
          <div className="absolute bottom-0 left-0 right-0">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 1440 320"
              className="w-full h-auto"
            >
              <path
                fill="#ffffff"
                fillOpacity="0.05"
                d="M0,96L48,112C96,128,192,160,288,160C384,160,480,128,576,112C672,96,768,96,864,112C960,128,1056,160,1152,160C1248,160,1344,128,1392,112L1440,96L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"
              />
            </svg>
          </div>
        </section>
      </main>

      <footer className="bg-gray-100 dark:bg-gray-800 pt-12 pb-8 relative overflow-hidden">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-8">
            <div className="space-y-4">
              <div className="flex items-center">
                <img
                  src="/logo.svg"
                  alt="SIEM Guard Logo"
                  className="w-10 h-10"
                />
                <span className="ml-2 text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-600 to-indigo-600">
                  SIEM Guard
                </span>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-300">
                AI-powered security monitoring and vulnerability detection for
                modern enterprises.
              </p>
              <div className="flex space-x-4">
                <button
                  onClick={() => handleNavigation("#")}
                  className="text-gray-600 hover:text-purple-600 dark:text-gray-300 dark:hover:text-purple-400 transition-colors"
                >
                  <svg
                    className="w-6 h-6"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                  >
                    <path
                      fillRule="evenodd"
                      d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z"
                      clipRule="evenodd"
                    />
                  </svg>
                </button>
                <button
                  onClick={() => handleNavigation("#")}
                  className="text-gray-600 hover:text-purple-600 dark:text-gray-300 dark:hover:text-purple-400 transition-colors"
                >
                  <svg
                    className="w-6 h-6"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                  >
                    <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84" />
                  </svg>
                </button>
                <button
                  onClick={() => handleNavigation("#")}
                  className="text-gray-600 hover:text-purple-600 dark:text-gray-300 dark:hover:text-purple-400 transition-colors"
                >
                  <svg
                    className="w-6 h-6"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                  >
                    <path
                      fillRule="evenodd"
                      d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"
                      clipRule="evenodd"
                    />
                  </svg>
                </button>
              </div>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-white mb-4">
                Product
              </h3>
              <ul className="space-y-2">
                <li>
                  <button
                    onClick={() => handleNavigation("#features")}
                    className="text-sm text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white transition-colors"
                  >
                    Features
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => handleNavigation("#pricing")}
                    className="text-sm text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white transition-colors"
                  >
                    Pricing
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => handleNavigation("/dashboard")}
                    className="text-sm text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white transition-colors"
                  >
                    Security
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => handleNavigation("/dashboard")}
                    className="text-sm text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white transition-colors"
                  >
                    Enterprise
                  </button>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-white mb-4">
                Support
              </h3>
              <ul className="space-y-2">
                <li>
                  <button
                    onClick={() => handleNavigation("#")}
                    className="text-sm text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white transition-colors"
                  >
                    Documentation
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => handleNavigation("#")}
                    className="text-sm text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white transition-colors"
                  >
                    API Reference
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => handleNavigation("#")}
                    className="text-sm text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white transition-colors"
                  >
                    Status
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => handleNavigation("#contact")}
                    className="text-sm text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white transition-colors"
                  >
                    Contact
                  </button>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-white mb-4">
                Company
              </h3>
              <ul className="space-y-2">
                <li>
                  <button
                    onClick={() => handleNavigation("#")}
                    className="text-sm text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white transition-colors"
                  >
                    About
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => handleNavigation("#")}
                    className="text-sm text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white transition-colors"
                  >
                    Blog
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => handleNavigation("/privacy")}
                    className="text-sm text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white transition-colors"
                  >
                    Privacy Policy
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => handleNavigation("/terms")}
                    className="text-sm text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white transition-colors"
                  >
                    Terms of Service
                  </button>
                </li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-200 dark:border-gray-700 pt-8">
            <div className="flex flex-col md:flex-row justify-between items-center">
              <p className="text-sm text-gray-600 dark:text-gray-300">
                © 2023 SIEM Guard. All rights reserved.
              </p>
              <div className="flex space-x-6 mt-4 md:mt-0">
                <button
                  onClick={() => handleNavigation("/privacy")}
                  className="text-sm text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white transition-colors"
                >
                  Privacy
                </button>
                <button
                  onClick={() => handleNavigation("/terms")}
                  className="text-sm text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white transition-colors"
                >
                  Terms
                </button>
                <button
                  onClick={() => handleNavigation("#")}
                  className="text-sm text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white transition-colors"
                >
                  Cookies
                </button>
              </div>
            </div>
          </div>
        </div>
        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-gray-100 dark:to-gray-800 opacity-50 pointer-events-none" />
      </footer>
    </div>
  );
}
