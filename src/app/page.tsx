import { Header } from "@/components/layout/header";
import { SearchForm } from "@/components/sections/search-form";

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col bg-[#f5f5f5]">
      <Header />

      <main className="flex-1">
        {/* Search Section */}
        <SearchForm />
      </main>
    </div>
  );
}
