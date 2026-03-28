export default function LoadingSpinner() {
  return (
    <div className="flex items-center justify-center p-8">
      <div className="animate-spin">
        <div className="w-12 h-12 border-4 border-slate-200 border-t-purple-600 rounded-full" />
      </div>
    </div>
  );
}
