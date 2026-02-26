import { UpperBar } from "./components/UpperBar";

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="max-w-7xl mx-auto px-4 py-4 space-y-6">
      <UpperBar />
      <main>{children}</main>
    </div>
  );
}
