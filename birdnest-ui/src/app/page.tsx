export const dynamic = 'force-dynamic',
  dynamicParams = true,
  revalidate = 0,
  fetchCache = 'auto',
  runtime = 'nodejs',
  preferredRegion = 'auto'

import { ViolationList } from "@/components/violationList";
import { ViolationDTO } from "@/dto/violation.dto";

const getViolations = async () => {
  // Record time
  const start = Date.now();
  const response = await fetch(`${process.env.API_SERVER_URL}/violations`, {
    cache: "no-cache"
  });
  const violations: ViolationDTO[] = await response.json();
  console.log(`Took ${Date.now() - start}ms to fetch violations`);
  return violations;
};

export default async function Home() {
  const violations = await getViolations();
  const webSocketUrl = process.env.API_CLIENT_URL ? `${process.env.API_CLIENT_URL}/socket`.replace("http", "ws") : undefined;

  if (!webSocketUrl) {
    throw new Error("No API_CLIENT_URL environment variable set");
  }

  return (
    <>
      <main className="container pt-8">
        <h1 className="text-4xl font-bold text-gray-900">
          Birdnest violations
        </h1>
        <p className="text-gray-600">A list of violations from the last 10 minutes</p>
        <div className="mt-8">
          <ViolationList violations={violations} webSocketUrl={webSocketUrl}/>
        </div>
      </main>
    </>
  );
}
