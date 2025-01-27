import React from 'react';
import { BookOpen, Users, Clock, Trophy, ChevronRight } from 'lucide-react';
import { Logo } from '../../assets';
import { Link } from 'react-router';

const LandingPage = () => {
  return (
    <div className="min-h-screen bg-base-100">
      {/* Navbar */}
      <div className="absolute z-50 p-4 text-white bg-transparent md:p-7 navbar">
        <div className="navbar-start">
          <Logo className="w-8 h-8" />
          <a className="text-xl btn btn-ghost">OFPPT</a>
        </div>
        <div className="navbar-end">
          <Link to="/login" className="rounded-full btn btn-primary">
            Get Started
          </Link>
        </div>
      </div>

      {/* Hero Section */}
      <div
        className="min-h-screen hero"
        style={{
          backgroundImage:
            'url("https://laquotidienne.ma/uploads/actualites/632586ddcef40_ofppt.jpeg")',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      >
        <div className="hero-overlay bg-opacity-60"></div>
        <div className="text-center hero-content text-neutral-content">
          <div className="max-w-2xl px-4">
            <h1 className="mb-5 text-4xl font-bold md:text-5xl">Elevate School Management</h1>
            <p className="mb-5 text-lg md:text-xl">
              Revolutionize educational administration with our intelligent, user-friendly platform
              designed to simplify complex school operations.
            </p>
            <div className="flex flex-col justify-center gap-4 md:flex-row">
              <Link to="/login" className="btn btn-primary">
                Get Started
                <ChevronRight className="ml-2" />
              </Link>
              <a href="#features" className="btn btn-outline btn-secondary">
                Explore Features
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div id="features" className="py-16 bg-base-200">
        <div className="container px-4 mx-auto">
          <h2 className="mb-12 text-3xl font-bold text-center md:text-4xl">
            Comprehensive School Solutions
          </h2>
          <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-4">
            {[
              {
                icon: BookOpen,
                color: 'text-primary',
                title: 'Academic Excellence',
                description: 'Advanced curriculum management and academic tracking systems.',
              },
              {
                icon: Users,
                color: 'text-secondary',
                title: 'Student Insights',
                description: 'Comprehensive student performance and engagement analytics.',
              },
              {
                icon: Clock,
                color: 'text-accent',
                title: 'Smart Scheduling',
                description: 'Intelligent time management and resource allocation.',
              },
              {
                icon: Trophy,
                color: 'text-neutral',
                title: 'Performance Tracking',
                description: 'Detailed reporting and progress monitoring tools.',
              },
            ].map(({ icon: Icon, color, title, description }, index) => (
              <div
                key={index}
                className="transition-transform shadow-xl card bg-base-100 hover:scale-105"
              >
                <div className="items-center text-center card-body">
                  <Icon className={`mb-4 ${color}`} size={52} strokeWidth={1.5} />
                  <h3 className="card-title">{title}</h3>
                  <p>{description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* About Section */}
      <div className="py-16 bg-base-200">
        <div className="container px-4 mx-auto">
          <h2 className="mb-12 text-3xl font-bold text-center md:text-4xl">Why Choose OFPPT?</h2>
          <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
            {[
              {
                title: 'User-Friendly Interface',
                description:
                  'Our platform is designed to be intuitive and easy to use for all stakeholders.',
              },
              {
                title: 'Advanced Automation',
                description:
                  'Automate repetitive tasks and streamline complex processes for efficiency.',
              },
              {
                title: 'Real-Time Insights',
                description:
                  'Gain real-time visibility into student performance and school operations.',
              },
              {
                title: 'Scalability and Flexibility',
                description:
                  'Our platform can grow with your institution and adapt to changing needs.',
              },
            ].map(({ title, description }, index) => (
              <div
                key={index}
                className="transition-transform shadow-xl card bg-base-100 hover:scale-105"
              >
                <div className="items-center text-center card-body">
                  <h3 className="card-title">{title}</h3>
                  <p>{description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default LandingPage;
