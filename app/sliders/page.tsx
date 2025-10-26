import Link from 'next/link';
import BlueSlider from '@/src/components/BlueSlider';
import RedSlider from '@/src/components/RedSlider';

export default function SlidersTestPage() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-8">
      <div className="mx-auto max-w-4xl space-y-8">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-slate-900">
            Inverse Slider Test
          </h1>
          <p className="mt-2 text-slate-600">
            Two sliders communicating via Zustand store. The red slider always
            shows the inverse of the blue slider value.
          </p>
        </div>

        <div className="grid gap-8 md:grid-cols-2">
          <div className="flex items-center justify-center">
            <BlueSlider label="Blue Slider" min={0} max={100} step={1} />
          </div>

          <div className="flex items-center justify-center">
            <RedSlider label="Red Slider" min={0} max={100} step={1} />
          </div>
        </div>

        <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="mb-3 text-lg font-semibold text-slate-900">
            How it works:
          </h2>
          <ul className="space-y-2 text-sm text-slate-600">
            <li className="flex items-start">
              <span className="mr-2 text-blue-600">•</span>
              <span>
                Move the <strong className="text-blue-600">blue slider</strong>{' '}
                and watch the red slider automatically adjust to the inverse
                value
              </span>
            </li>
            <li className="flex items-start">
              <span className="mr-2 text-red-600">•</span>
              <span>
                Move the <strong className="text-red-600">red slider</strong>{' '}
                and watch the blue slider automatically adjust to the inverse
                value
              </span>
            </li>
            <li className="flex items-start">
              <span className="mr-2 text-slate-400">•</span>
              <span>
                Both components are completely separate and communicate only
                through a Zustand store
              </span>
            </li>
          </ul>
        </div>

        <div className="text-center">
          <Link
            href="/"
            className="text-sm text-slate-600 underline hover:text-slate-900"
          >
            ← Back to home
          </Link>
        </div>
      </div>
    </main>
  );
}
