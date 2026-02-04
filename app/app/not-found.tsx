import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-screen flex bg-gray-900 relative overflow-hidden">
      {/* Background decorations */}
      <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-gray-600/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
      <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-gray-500/20 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2" />
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wMyI+PHBhdGggZD0iTTAgMGg0MHY0MEgweiIvPjwvZz48L2c+PC9zdmc+')] opacity-50" />

      <div className="relative z-10 flex-1 flex items-center justify-center px-4">
        <div className="text-center max-w-lg">
          {/* Logo */}
          <Link href="/" className="inline-flex items-center gap-3 mb-12">
            <div className="w-12 h-12 rounded-xl bg-gray-900 flex items-center justify-center shadow-lg">
              <span className="text-white text-xl font-black">C</span>
            </div>
            <span className="text-3xl font-black text-white">Crisp</span>
          </Link>

          {/* 404 Display */}
          <div className="mb-8">
            <span className="text-[120px] sm:text-[160px] font-black text-gray-900 leading-none block">
              404
            </span>
          </div>

          <h1 className="text-3xl sm:text-4xl font-black text-white mb-4">
            Page not found
          </h1>

          <p className="text-xl text-white/60 mb-10">
            The page you&apos;re looking for doesn&apos;t exist or has been moved.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/"
              className="px-8 py-4 bg-gray-900 text-white font-bold text-lg rounded-xl shadow-xl hover:shadow-2xl hover:-translate-y-0.5 transition-all"
            >
              Go to Homepage
            </Link>
            <Link
              href="/dashboard"
              className="px-8 py-4 bg-white/10 backdrop-blur text-white font-bold text-lg rounded-xl border border-white/20 hover:bg-white/20 transition-all"
            >
              View Dashboard
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
