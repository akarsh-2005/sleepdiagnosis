import { AudioAnalyzer } from '@/components/AudioAnalyzer';

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      <div className="container mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl md:text-6xl font-bold text-gray-900 dark:text-white mb-4">
            Sleep<span className="text-blue-600 dark:text-blue-400">Guard</span>
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            AI-powered sleep apnea detection through advanced snore analysis
          </p>
        </div>
        <AudioAnalyzer />
      </div>
    </main>
  );
}