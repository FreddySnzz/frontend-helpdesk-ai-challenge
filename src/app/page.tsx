import DynamicBreadcrumb from "@/components/DynamicBreadcrumb";

export default function Home() {
  return (
    <div className="flex flex-col h-dvh overflow-y-auto bg-background-alternative font-space-grotesk bg-primary text-secondary">
      <main className="flex-1 flex flex-col px-8 md:px-12 lg:px-32">
        <div className="shrink-0 mb-6">
          <DynamicBreadcrumb className="mt-14 py-4 md:mt-16 md:py-6" />
          <hr className="border-muted-foreground/30" />
        </div>
      </main>
    </div>
  );
}
