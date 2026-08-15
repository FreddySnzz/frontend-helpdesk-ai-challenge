'use client';

import { useAuth } from "@/data/contexts/AuthContext";
import { Activity, LogOut } from "lucide-react";
import { Button } from "./ui/button";

export default function Header() {
  const { logout } = useAuth();

  return (
    <header className="bg-black/30 text-secondary shadow-sm px-6 py-3 flex justify-between items-center">
      <div>
        <h1 className="text-xl font-bold tracking-tight flex items-center gap-2">
          <Activity className="text-slate-700" /> Helpdesk Dashboard
        </h1>
      </div>
      <Button 
        onClick={logout}
        className="group transition-all cursor-pointer"
      >
        <LogOut className="h-4 w-4 mr-2" /> 
        <p className="hidden transition-all ease-in-out group-hover:block text-sm">
          Sair
        </p>
      </Button>
    </header>
  )
}