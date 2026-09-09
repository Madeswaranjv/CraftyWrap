import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center text-center px-4">
      <h2 className="text-4xl font-extrabold text-warmbrown-800 dark:text-peach-100 mb-2">404</h2>
      <p className="text-warmbrown-600 dark:text-warmbrown-300 mb-6">Page Not Found</p>
      <Link
        href="/"
        className="rounded-full bg-warmbrown-800 text-white px-6 py-2.5 text-sm font-semibold hover:bg-warmbrown-700 transition"
      >
        Return Home
      </Link>
    </div>
  );
}
