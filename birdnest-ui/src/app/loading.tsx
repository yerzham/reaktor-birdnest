export default function Loading() {
  return (
    <div className="flex flex-col justify-center items-center h-screen">
      <div className="animate-spin rounded-full h-24 w-24 border-b-2 border-gray-900"></div>
      <h1 className="text-2xl font-bold text-gray-800 mt-8">
        Loading...
      </h1>
    </div>
  );
}