import Link from 'next/link';
import { GlitchText } from '@/components/GlitchText';

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4">
      <div className="text-center max-w-lg">
        {/* ASCII Art 404 */}
        <pre className="text-terminal font-mono text-xs sm:text-sm mb-8 select-none">
{`
    ██╗  ██╗ ██████╗ ██╗  ██╗
    ██║  ██║██╔═████╗██║  ██║
    ███████║██║██╔██║███████║
    ╚════██║████╔╝██║╚════██║
         ██║╚██████╔╝     ██║
         ╚═╝ ╚═════╝      ╚═╝
`}
        </pre>

        <h1 className="text-3xl sm:text-4xl font-bold mb-4">
          <GlitchText
            text="PAGE NOT FOUND"
            className="text-danger"
            glitchIntensity="medium"
          />
        </h1>

        <p className="text-gray-400 mb-8">
          The page you're looking for has been moved, deleted, or never existed.
          Perhaps it's hiding in the void.
        </p>

        {/* Terminal-style message */}
        <div className="bg-void-50 rounded-lg border border-void-100 p-4 mb-8 text-left font-mono text-sm">
          <p className="text-gray-500">
            <span className="text-danger">[ERROR]</span> Resource not found
          </p>
          <p className="text-gray-500">
            <span className="text-neon-yellow">[WARN]</span> Check URL for typos
          </p>
          <p className="text-gray-500">
            <span className="text-terminal">[INFO]</span> Redirecting to home...
          </p>
          <p className="mt-2">
            <span className="text-terminal">$</span>
            <span className="cursor-blink"> </span>
          </p>
        </div>

        <Link
          href="/"
          className="btn-primary inline-block"
        >
          Return to Home
        </Link>
      </div>
    </div>
  );
}
