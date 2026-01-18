import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import ChessBoard from "@/components/ChessBoard";

function Router() {
  return (
    <Switch>
      <Route path="/" component={ChessBoard} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <div className="min-h-screen bg-[#1a1a1a] text-[#ffb3ba] p-8">
          <h1 className="text-4xl font-bold mb-8 text-center text-[#ffb3ba]">Simple Chess</h1>
          <ChessBoard />
        </div>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
