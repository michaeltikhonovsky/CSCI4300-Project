import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="flex gap-4 flex-col items-center justify-center h-screen">
      <h2 className="text-4xl font-bold">404 Not Found</h2>
      <Link
        href="/"
        className={buttonVariants({
          size: "lg",
          className: "text-2xl p-6 bg-white text-black",
        })}
      >
        Return Home
      </Link>
    </div>
  );
}
