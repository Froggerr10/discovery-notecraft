'use client';

import React from 'react';

interface SectionProgressProps {
  currentSection: number;
  totalSections: number;
  completedSections: number[];
  sectionNames: string[];
  onSectionClick?: (section: number) => void;
  className?: string;
}

export default function SectionProgress({
  currentSection,
  totalSections,
  completedSections,
  sectionNames,
  onSectionClick,
  className = ''
}: SectionProgressProps) {
  const progressPercentage = ((currentSection - 1) / totalSections) * 100;

  const getSectionStatus = (sectionNumber: number) => {
    if (completedSections.includes(sectionNumber)) return 'completed';
    if (sectionNumber === currentSection) return 'current';
    if (sectionNumber < currentSection) return 'accessible';
    return 'locked';
  };

  const getSectionIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return (
          <svg className="w-4 h-4 text-emerald-400" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
          </svg>
        );
      case 'current':
        return (
          <div className="w-3 h-3 bg-teal-400 rounded-full animate-pulse"></div>
        );
      case 'accessible':
        return (
          <div className="w-3 h-3 bg-gray-400 rounded-full"></div>
        );
      default:
        return (
          <div className="w-3 h-3 bg-gray-600 rounded-full"></div>
        );
    }
  };

  const getSectionStyles = (status: string) => {
    const baseStyles = "flex items-center justify-center w-10 h-10 rounded-full border-2 transition-all duration-300";
    
    switch (status) {
      case 'completed':
        return `${baseStyles} bg-emerald-500/20 border-emerald-400 backdrop-blur-sm`;
      case 'current':
        return `${baseStyles} bg-teal-500/30 border-teal-400 backdrop-blur-sm shadow-lg shadow-teal-400/20`;
      case 'accessible':
        return `${baseStyles} bg-white/5 border-gray-400 backdrop-blur-sm hover:bg-white/10 cursor-pointer`;
      default:
        return `${baseStyles} bg-gray-600/20 border-gray-600`;
    }
  };

  return (
    <div className={`${className}`}>
      {/* Header with Progress Info */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-2xl font-bold text-white">
              Discovery Notecraft™
            </h2>
            <p className="text-gray-400 text-sm">
              Seção {currentSection} de {totalSections}
            </p>
          </div>
          <div className="text-right">
            <div className="text-3xl font-bold text-teal-400">
              {Math.round(progressPercentage)}%
            </div>
            <div className="text-xs text-gray-400">
              {completedSections.length} seções concluídas
            </div>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="relative">
          <div className="w-full h-3 bg-gray-700/50 rounded-full backdrop-blur-sm border border-white/10">
            <div 
              className="h-full bg-gradient-to-r from-teal-400 to-emerald-400 rounded-full transition-all duration-700 ease-out shadow-lg shadow-teal-400/20"
              style={{ width: `${progressPercentage}%` }}
            />
          </div>
          
          {/* Progress Glow Effect */}
          <div 
            className="absolute top-0 h-full bg-gradient-to-r from-teal-400/50 to-emerald-400/50 rounded-full blur-sm transition-all duration-700"
            style={{ width: `${progressPercentage}%` }}
          />
        </div>
      </div>

      {/* Current Section Info */}
      <div className="mb-6 p-4 rounded-lg backdrop-blur-sm bg-white/5 border border-white/10">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-teal-500/30 rounded-full flex items-center justify-center">
            <span className="text-teal-400 font-semibold text-sm">{currentSection}</span>
          </div>
          <div>
            <h3 className="text-white font-semibold">
              {sectionNames[currentSection - 1] || `Seção ${currentSection}`}
            </h3>
            <p className="text-gray-400 text-sm">
              {currentSection === totalSections ? 'Última seção' : 'Em andamento'}
            </p>
          </div>
        </div>
      </div>

      {/* Section Navigation Grid */}
      <div className="grid grid-cols-6 md:grid-cols-9 lg:grid-cols-17 gap-2 mb-6">
        {Array.from({ length: totalSections }, (_, index) => {
          const sectionNumber = index + 1;
          const status = getSectionStatus(sectionNumber);
          
          return (
            <div
              key={sectionNumber}
              className={`relative group ${onSectionClick && status !== 'locked' ? 'cursor-pointer' : ''}`}
              onClick={() => {
                if (onSectionClick && status !== 'locked') {
                  onSectionClick(sectionNumber);
                }
              }}
            >
              <div className={getSectionStyles(status)}>
                {getSectionIcon(status)}
              </div>
              
              {/* Section Number Badge */}
              <div className="absolute -bottom-6 left-1/2 transform -translate-x-1/2">
                <span className={`text-xs font-medium ${
                  status === 'current' ? 'text-teal-400' :
                  status === 'completed' ? 'text-emerald-400' :
                  status === 'accessible' ? 'text-gray-400' :
                  'text-gray-600'
                }`}>
                  {sectionNumber}
                </span>
              </div>

              {/* Hover Tooltip */}
              {sectionNames[index] && (
                <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-gray-900 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap z-10 pointer-events-none">
                  {sectionNames[index]}
                  <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900"></div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-3 gap-4">
        <div className="p-3 rounded-lg backdrop-blur-sm bg-emerald-500/10 border border-emerald-400/20 text-center">
          <div className="text-2xl font-bold text-emerald-400">
            {completedSections.length}
          </div>
          <div className="text-xs text-emerald-300">Concluídas</div>
        </div>
        
        <div className="p-3 rounded-lg backdrop-blur-sm bg-teal-500/10 border border-teal-400/20 text-center">
          <div className="text-2xl font-bold text-teal-400">
            {currentSection <= totalSections ? 1 : 0}
          </div>
          <div className="text-xs text-teal-300">Atual</div>
        </div>
        
        <div className="p-3 rounded-lg backdrop-blur-sm bg-gray-500/10 border border-gray-400/20 text-center">
          <div className="text-2xl font-bold text-gray-400">
            {totalSections - currentSection}
          </div>
          <div className="text-xs text-gray-300">Restantes</div>
        </div>
      </div>

      {/* Time Estimation */}
      <div className="mt-4 p-3 rounded-lg backdrop-blur-sm bg-white/5 border border-white/10 text-center">
        <div className="text-sm text-gray-400">
          ⏱️ Tempo estimado restante: {Math.max(0, (totalSections - currentSection + 1) * 2)} min
        </div>
      </div>
    </div>
  );
}