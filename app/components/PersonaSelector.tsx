'use client';

import { useState } from 'react';
import clsx from 'clsx';

export type RoastPersona = 'hacker' | 'gordon' | 'parent' | 'interviewer' | 'drill' | 'meme' | 'therapist';

export interface PersonaOption {
  id: RoastPersona;
  name: string;
  description: string;
  emoji: string;
}

export const PERSONAS: PersonaOption[] = [
  {
    id: 'hacker',
    name: '3RROR_K1NG',
    description: 'Classic hacker roast',
    emoji: '💀',
  },
  {
    id: 'gordon',
    name: 'Gordon Websy',
    description: 'Kitchen nightmare energy',
    emoji: '👨‍🍳',
  },
  {
    id: 'parent',
    name: 'Disappointed Parent',
    description: 'Guilt-trip style',
    emoji: '😔',
  },
  {
    id: 'interviewer',
    name: 'Tech Interviewer',
    description: 'FAANG energy',
    emoji: '🤔',
  },
  {
    id: 'drill',
    name: 'Drill Sergeant',
    description: 'Military tough love',
    emoji: '🎖️',
  },
  {
    id: 'meme',
    name: 'Meme Lord',
    description: 'Gen-Z internet speak',
    emoji: '🗿',
  },
  {
    id: 'therapist',
    name: 'Web Therapist',
    description: 'Gentle devastation',
    emoji: '🛋️',
  },
];

interface PersonaSelectorProps {
  selected: RoastPersona;
  onSelect: (persona: RoastPersona) => void;
  className?: string;
  compact?: boolean;
}

export function PersonaSelector({ selected, onSelect, className, compact = false }: PersonaSelectorProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const selectedPersona = PERSONAS.find(p => p.id === selected) || PERSONAS[0];

  if (compact) {
    return (
      <div className={clsx('relative', className)}>
        <button
          type="button"
          onClick={() => setIsExpanded(!isExpanded)}
          className={clsx(
            'flex items-center gap-2 px-3 py-2 rounded-lg border transition-all',
            'bg-void-50 border-void-100 hover:border-terminal/50',
            isExpanded && 'border-terminal/50'
          )}
        >
          <span className="text-lg">{selectedPersona.emoji}</span>
          <span className="text-sm text-gray-300">{selectedPersona.name}</span>
          <svg
            className={clsx('w-4 h-4 text-gray-500 transition-transform', isExpanded && 'rotate-180')}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>

        {isExpanded && (
          <div className="absolute top-full left-0 mt-2 w-64 bg-void-50 border border-void-100 rounded-lg shadow-xl z-50 py-2">
            <div className="px-3 py-2 border-b border-void-100 mb-1">
              <span className="text-xs text-gray-500 uppercase tracking-wide">Choose Your Roaster</span>
            </div>
            {PERSONAS.map((persona) => (
              <button
                key={persona.id}
                type="button"
                onClick={() => {
                  onSelect(persona.id);
                  setIsExpanded(false);
                }}
                className={clsx(
                  'w-full flex items-center gap-3 px-3 py-2 text-left transition-colors',
                  selected === persona.id
                    ? 'bg-terminal/10 text-terminal'
                    : 'hover:bg-void-100 text-gray-300'
                )}
              >
                <span className="text-xl">{persona.emoji}</span>
                <div>
                  <div className="text-sm font-medium">{persona.name}</div>
                  <div className="text-xs text-gray-500">{persona.description}</div>
                </div>
                {selected === persona.id && (
                  <span className="ml-auto text-terminal">✓</span>
                )}
              </button>
            ))}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className={clsx('w-full', className)}>
      <div className="flex items-center gap-2 mb-3">
        <span className="text-sm text-gray-400">Choose Your Roaster:</span>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2">
        {PERSONAS.map((persona) => (
          <button
            key={persona.id}
            type="button"
            onClick={() => onSelect(persona.id)}
            className={clsx(
              'flex flex-col items-center p-3 rounded-lg border transition-all',
              selected === persona.id
                ? 'bg-terminal/10 border-terminal/50 text-terminal'
                : 'bg-void-50 border-void-100 text-gray-400 hover:border-terminal/30 hover:text-gray-300'
            )}
          >
            <span className="text-2xl mb-1">{persona.emoji}</span>
            <span className="text-xs font-medium text-center leading-tight">{persona.name}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
