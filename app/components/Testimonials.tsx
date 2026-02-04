'use client';

import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';

interface Testimonial {
  quote: string;
  author: string;
  role: string;
  avatar: string;
  image?: string;
  score?: { before: number; after: number };
}

const testimonials: Testimonial[] = [
  {
    quote: "Ran my portfolio through this and it found 23 issues I had no idea existed. Fixed them all in an hour using the AI suggestions. Score went from 54 to 91.",
    author: "Sarah Chen",
    role: "Frontend Developer",
    avatar: "SC",
    image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop&crop=face",
    score: { before: 54, after: 91 },
  },
  {
    quote: "Finally, an audit tool that doesn't just list problems but actually tells you HOW to fix them. The analysis was thorough and actionable.",
    author: "Marcus Johnson",
    role: "Indie Hacker",
    avatar: "MJ",
    image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face",
  },
  {
    quote: "We integrated this into our CI pipeline. Now every PR gets analyzed before merge. Our Lighthouse scores have never been higher.",
    author: "Alex Rivera",
    role: "Tech Lead @ Startup",
    avatar: "AR",
    image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face",
    score: { before: 67, after: 94 },
  },
  {
    quote: "I was mass-applying to jobs and my portfolio was getting no responses. 3RK showed me my site was broken on mobile. Fixed it, got 3 interviews that week.",
    author: "Jordan Park",
    role: "Junior Developer",
    avatar: "JP",
    image: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop&crop=face",
  },
];

export function Testimonials() {
  return (
    <div className="w-full max-w-5xl mx-auto">
      <h2 className="text-display-sm sm:text-display-md text-center mb-4 text-gray-900 text-shadow-heading">
        What Developers Are Saying
      </h2>
      <p className="text-gray-500 text-center mb-8 max-w-xl mx-auto">
        Real developers. Real results. Real improvements.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {testimonials.map((testimonial, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: index * 0.1, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
            className="bg-white border border-gray-200 rounded-xl p-5 hover:border-primary/30 hover:shadow-card-hover hover:-translate-y-0.5 transition-all duration-200 group"
          >
            {/* Score improvement badge */}
            {testimonial.score && (
              <div className="flex items-center gap-2 mb-3 text-xs">
                <span className="px-2 py-1 bg-danger/10 text-danger rounded-lg font-medium ring-1 ring-danger/20">
                  {testimonial.score.before}
                </span>
                <ArrowRight size={14} className="text-gray-400" />
                <span className="px-2 py-1 bg-success/10 text-success rounded-lg font-medium ring-1 ring-success/20">
                  {testimonial.score.after}
                </span>
                <span className="text-success font-medium ml-1">
                  +{testimonial.score.after - testimonial.score.before} pts
                </span>
              </div>
            )}

            {/* Quote */}
            <p className="text-gray-700 text-sm leading-relaxed mb-4">
              &ldquo;{testimonial.quote}&rdquo;
            </p>

            {/* Author */}
            <div className="flex items-center gap-3">
              {testimonial.image ? (
                <img
                  src={testimonial.image}
                  alt={testimonial.author}
                  width={40}
                  height={40}
                  className="w-10 h-10 rounded-full object-cover ring-2 ring-gray-100"
                  loading="lazy"
                />
              ) : (
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center text-sm font-bold text-primary ring-2 ring-primary/10">
                  {testimonial.avatar}
                </div>
              )}
              <div>
                <p className="font-medium text-gray-900 text-sm">{testimonial.author}</p>
                <p className="text-xs text-gray-500">{testimonial.role}</p>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
