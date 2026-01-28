'use client';

import { motion } from 'framer-motion';

interface Testimonial {
  quote: string;
  author: string;
  role: string;
  avatar: string;
  score?: { before: number; after: number };
}

const testimonials: Testimonial[] = [
  {
    quote: "Ran my portfolio through this and it found 23 issues I had no idea existed. Fixed them all in an hour using the AI suggestions. Score went from 54 to 91.",
    author: "Sarah Chen",
    role: "Frontend Developer",
    avatar: "SC",
    score: { before: 54, after: 91 },
  },
  {
    quote: "Finally, an audit tool that doesn't just list problems but actually tells you HOW to fix them. The roast was brutal but accurate.",
    author: "Marcus Johnson",
    role: "Indie Hacker",
    avatar: "MJ",
  },
  {
    quote: "We integrated this into our CI pipeline. Now every PR gets roasted before merge. Our Lighthouse scores have never been higher.",
    author: "Alex Rivera",
    role: "Tech Lead @ Startup",
    avatar: "AR",
    score: { before: 67, after: 94 },
  },
  {
    quote: "I was mass-applying to jobs and my portfolio was getting no responses. 3RROR_K1NG showed me my site was broken on mobile. Fixed it, got 3 interviews that week.",
    author: "Jordan Park",
    role: "Junior Developer",
    avatar: "JP",
  },
];

export function Testimonials() {
  return (
    <div className="w-full max-w-5xl mx-auto">
      <h2 className="text-2xl sm:text-3xl font-bold text-center mb-4">
        <span className="text-terminal">&gt;</span> Wall of Roasts
      </h2>
      <p className="text-gray-400 text-center mb-8 max-w-xl mx-auto">
        Real developers. Real roasts. Real improvements.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {testimonials.map((testimonial, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: index * 0.1, duration: 0.5 }}
            className="bg-void-50 border border-void-100 rounded-lg p-5 hover:border-terminal/30 transition-colors group"
          >
            {/* Score improvement badge */}
            {testimonial.score && (
              <div className="flex items-center gap-2 mb-3 text-xs">
                <span className="px-2 py-1 bg-danger/20 text-danger rounded">
                  {testimonial.score.before}
                </span>
                <span className="text-gray-500">→</span>
                <span className="px-2 py-1 bg-terminal/20 text-terminal rounded">
                  {testimonial.score.after}
                </span>
                <span className="text-terminal ml-1">
                  +{testimonial.score.after - testimonial.score.before} pts
                </span>
              </div>
            )}

            {/* Quote */}
            <p className="text-gray-300 text-sm leading-relaxed mb-4">
              &ldquo;{testimonial.quote}&rdquo;
            </p>

            {/* Author */}
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-terminal/30 to-neon-cyan/30 flex items-center justify-center text-sm font-bold text-terminal">
                {testimonial.avatar}
              </div>
              <div>
                <p className="font-medium text-gray-200 text-sm">{testimonial.author}</p>
                <p className="text-xs text-gray-500">{testimonial.role}</p>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
