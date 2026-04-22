import { useState, useEffect } from 'react';
import { BookOpen, Users, Download, Star, TrendingUp, Award } from 'lucide-react';

export default function StatsSection() {
  const [stats, setStats] = useState({
    examsCount: 0,
    usersCount: 0,
    downloadsCount: 0,
    averageRating: 0,
    satisfactionRate: 0,
    universitiesCount: 0
  });

  const [animatedStats, setAnimatedStats] = useState({
    examsCount: 0,
    usersCount: 0,
    downloadsCount: 0,
    averageRating: 0,
    satisfactionRate: 0,
    universitiesCount: 0
  });

  useEffect(() => {
    // Données de démonstration (en production, viendraient d'une API)
    setStats({
      examsCount: 15420,
      usersCount: 8750,
      downloadsCount: 45680,
      averageRating: 4.8,
      satisfactionRate: 96,
      universitiesCount: 25
    });
  }, []);

  useEffect(() => {
    const duration = 2000; // 2 secondes d'animation
    const steps = 60;
    const increment = {
      examsCount: stats.examsCount / steps,
      usersCount: stats.usersCount / steps,
      downloadsCount: stats.downloadsCount / steps,
      averageRating: stats.averageRating / steps,
      satisfactionRate: stats.satisfactionRate / steps,
      universitiesCount: stats.universitiesCount / steps
    };

    let currentStep = 0;
    const timer = setInterval(() => {
      currentStep++;
      if (currentStep <= steps) {
        setAnimatedStats({
          examsCount: Math.floor(increment.examsCount * currentStep),
          usersCount: Math.floor(increment.usersCount * currentStep),
          downloadsCount: Math.floor(increment.downloadsCount * currentStep),
          averageRating: (increment.averageRating * currentStep).toFixed(1),
          satisfactionRate: Math.floor(increment.satisfactionRate * currentStep),
          universitiesCount: Math.floor(increment.universitiesCount * currentStep)
        });
      } else {
        clearInterval(timer);
      }
    }, duration / steps);

    return () => clearInterval(timer);
  }, [stats]);

  const statsData = [
    {
      icon: BookOpen,
      value: animatedStats.examsCount.toLocaleString(),
      label: "Examens disponibles",
      color: "from-blue-500 to-blue-600",
      bgColor: "bg-blue-50"
    },
    {
      icon: Users,
      value: animatedStats.usersCount.toLocaleString(),
      label: "Étudiants actifs",
      color: "from-green-500 to-green-600",
      bgColor: "bg-green-50"
    },
    {
      icon: Download,
      value: animatedStats.downloadsCount.toLocaleString(),
      label: "Téléchargements",
      color: "from-purple-500 to-purple-600",
      bgColor: "bg-purple-50"
    },
    {
      icon: Star,
      value: animatedStats.averageRating,
      label: "Note moyenne",
      color: "from-yellow-500 to-yellow-600",
      bgColor: "bg-yellow-50"
    },
    {
      icon: TrendingUp,
      value: `${animatedStats.satisfactionRate}%`,
      label: "Taux de satisfaction",
      color: "from-emerald-500 to-emerald-600",
      bgColor: "bg-emerald-50"
    },
    {
      icon: Award,
      value: animatedStats.universitiesCount,
      label: "Universités partenaires",
      color: "from-red-500 to-red-600",
      bgColor: "bg-red-50"
    }
  ];

  return (
    <section className="py-16 bg-gray-50">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            Des chiffres qui parlent d'eux-mêmes
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Rejoignez une communauté de milliers d'étudiants qui utilisent notre plateforme
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {statsData.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <div
                key={index}
                className="bg-white rounded-2xl shadow-lg p-8 hover:shadow-xl transition-shadow duration-300"
              >
                <div className={`w-16 h-16 rounded-full bg-gradient-to-r ${stat.color} flex items-center justify-center mb-6`}>
                  <Icon className="text-white" size={32} />
                </div>
                <div className="space-y-2">
                  <h3 className="text-3xl font-bold text-gray-900">
                    {stat.value}
                  </h3>
                  <p className="text-gray-600 text-lg">
                    {stat.label}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        <div className="mt-16 text-center">
          <div className="inline-flex items-center gap-4 bg-white rounded-full px-8 py-4 shadow-lg">
            <div className="flex -space-x-2">
              {[1, 2, 3, 4, 5].map((i) => (
                <div
                  key={i}
                  className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 border-2 border-white flex items-center justify-center text-white font-semibold text-sm"
                >
                  {String.fromCharCode(65 + i)}
                </div>
              ))}
            </div>
            <p className="text-gray-700 font-medium">
              <span className="font-bold text-blue-600">+500</span> nouveaux étudiants cette semaine
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
