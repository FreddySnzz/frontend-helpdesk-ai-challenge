'use client';

import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle 
} from "./ui/card";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { Eye, Plus } from "lucide-react";
import { Input } from "./ui/input";
import { Textarea } from "./ui/textarea";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "./ui/table";
import { useEffect, useRef, useState } from "react";
import { Ticket } from "@/data/types/ticket.type";
import { metricsService } from "@/data/services/metrics.service";
import { useAuth } from "@/data/contexts/AuthContext";
import { toast } from "sonner";
import { 
  Cell, 
  Pie, 
  PieChart, 
  ResponsiveContainer, 
  Tooltip 
} from "recharts";
import CustomModal from "./CustomModal";
import { ticketService } from "@/data/services/ticket.service";
import { useRouter } from "next/navigation";

interface DashboardLayoutProps {
  initialTickets: Ticket[];
  initialMetrics: any;
  accessToken: string;
}

export default function DashboardLayout({ 
  initialTickets, 
  initialMetrics, 
  accessToken
 }: DashboardLayoutProps) {
  const { user } = useAuth();

  const [tickets, setTickets] = useState<Ticket[]>(initialTickets);
  const [metrics, setMetrics] = useState<any>(initialMetrics);
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [newTicket, setNewTicket] = useState({ title: '', description: '' });
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const abortControllerRef = useRef<AbortController | null>(null);
  const router = useRouter();

  useEffect(() => {
    if (user?.role !== 'ADMIN') return;
    
    abortControllerRef.current = new AbortController();

    metricsService.listenStreamEvents(
      accessToken,
      abortControllerRef.current.signal,
      (payload) => {
        console.log('Novo evento SSE recebido:', payload);
        setMetrics(payload.metrics);

        if (payload.alert) {
          toast.info("NOVO CHAMADO URGENTE!")
        }
      },
      (error) => {
        console.error('Falha na conexão SSE', error);
      }
    );

    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    }
  }, [user, accessToken]);

  const refreshTickets = async () => {
    try {
      const res = await ticketService.getAllTickets(accessToken);
      setTickets(res);
      router.refresh();
    } catch (error) {
      if (error instanceof Error) toast.error(error.message);
    }
  };
  
  const handleCreateTicket = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      await ticketService.createTicket(newTicket, accessToken);
      refreshTickets();
    } catch (error) {
      if (error instanceof Error) toast.error(error.message);
    } finally {
      setIsSubmitting(false);
      setIsModalOpen(false);
      setNewTicket({ title: '', description: '' });
    }
  };

  const handleDeleteTicket = async (id: string) => {
    try {
      await ticketService.deleteTicket(id, accessToken);
      refreshTickets();
    } catch (error) {
      if (error instanceof Error) toast.error(error.message);
    } finally {
      setIsSubmitting(false);
      setIsEditModalOpen(false);
      setSelectedTicket(null);
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'ALTA': return 'bg-red-700 hover:bg-red-600 font-bold';
      case 'MEDIA': return 'bg-yellow-500 hover:bg-yellow-600 font-bold';
      default: return 'bg-green-700 hover:bg-green-600 font-bold';
    }
  };

  const chartData = metrics.byPriority?.map((m: any) => ({
    name: m.priority,
    value: m._count.id
  })) || [];

  const getHexPriorityColor = (priority: string) => {
    switch (priority?.toLowerCase()) {
      case 'alta': return '#c10007';
      case 'media': return '#efb100'; 
      case 'baixa': return '#008236'; 
      default: return '#aaaaaa';      
    }
  };
  
  return (
    <div className="flex-1 flex flex-col w-full min-h-0">
      <div className="flex flex-col">
        <main className="flex flex-col w-full mb-8">
          <div className="flex p-4 justify-between">
            <div className="flex flex-col">
              <h1 className="text-lg font-bold tracking-tight">
                {user?.role === 'ADMIN' ? 'PAINEL ADMINISTRATIVO' : `Olá, ${user?.name}!`}
              </h1>
              <p className={"text-muted-foreground text-sm"}>
                {user?.role === 'ADMIN' ? 'Gerencie os chamados de toda plataforma.' : 'Bem-vindo de volta ao seu painel de chamados.'}
              </p>
            </div>
            <button 
              onClick={() => setIsModalOpen(true)}
              className={`flex text-center justify-center items-center gap-2 py-2 px-4 cursor-pointer
                border border-muted-foreground/20 rounded-lg hover:bg-black/20 transition-colors text-sm
              `}
            >
              <Plus className="h-4 w-4" /> 
              <p>Abrir Chamado</p>
            </button>
          </div>
          <hr className="border-muted-foreground/20" />

          {user?.role === 'ADMIN' && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4 px-4 md:px-8 mb-4">
              <Card className="bg-primary rounded-xl shadow-sm border border-muted-foreground/20 max-w-70">
                <CardHeader>
                  <CardTitle className="text-sm font-bold text-zinc-200">
                    Total por Prioridade
                  </CardTitle>
                </CardHeader>
                <CardContent className="h-45">
                  {chartData.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart responsive>
                        <Pie
                          data={chartData}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          innerRadius={0}
                          outerRadius={80}
                          paddingAngle={0}
                          dataKey="value"
                        >
                          {chartData.map((entry: any, index: number) => (
                            <Cell 
                              key={`cell-${index}`} 
                              fill={getHexPriorityColor(entry.name)} 
                            />
                          ))}
                        </Pie>
                        <Tooltip 
                          contentStyle={{ 
                            backgroundColor: '#18181b', 
                            borderColor: '#27272a', 
                            borderRadius: '8px' 
                          }} 
                          itemStyle={{ color: '#e4e4e7' }}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="flex h-full items-center justify-center">
                      <p className="text-2xl font-bold text-zinc-400">0</p>
                    </div>
                  )}
                </CardContent>
                <CardContent>
                  {metrics.byPriority?.length > 0 ? (
                    metrics.byPriority.map((m: any) => (
                      <div key={m.priority} className="flex justify-between items-center mt-2">
                        <span className="text-sm font-bold text-zinc-200">
                          {m.priority}
                        </span>
                        <Badge className={getPriorityColor(m.priority)}>
                          {m._count.id}
                        </Badge>
                      </div>
                    ))
                  ) : (
                    <p className="text-2xl font-bold">0</p>
                  )}
                </CardContent>
              </Card>
              {/* O desafio foca na contagem e alerta. Mais cards podem ser adicionados aqui. */}
            </div>
          )}

          <div className="bg-primary shadow-sm border border-muted-foreground/20 cursor-default">
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-black/20 transition-colors border-muted-foreground/20">
                  <TableHead>Título</TableHead>
                  <TableHead>Categoria (IA)</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Prioridade</TableHead>
                  <TableHead>Aberto em</TableHead>
                  <TableHead>Responsável</TableHead>
                  <TableHead>Ação</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {tickets.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8">
                      Nenhum chamado encontrado.
                    </TableCell>
                  </TableRow>
                ) : (
                  tickets.map((ticket) => (
                    <TableRow 
                      key={ticket.id} 
                      className="hover:bg-black/20 transition-colors border-muted-foreground/20"
                    >
                      <TableCell className="font-medium">
                        {ticket.title}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="border-muted-foreground/30 bg-zinc-900 text-secondary">
                          {ticket.category}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {ticket.status}
                      </TableCell>
                      <TableCell>
                        <Badge className={getPriorityColor(ticket.priority)}>
                          {ticket.priority}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {new Date(ticket.createdAt).toLocaleDateString('pt-BR')}
                      </TableCell>
                      <TableCell>
                        {ticket.assigneeId ? ticket.assigneeId : 'Não atribuído'}
                      </TableCell>
                      <TableCell>
                        <Button 
                          onClick={() => {
                            setIsEditModalOpen(true);
                            setSelectedTicket(ticket);
                          }}
                          className="text-secondary cursor-pointer"
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </main>
      </div>

      <CustomModal
        title="Abrir Chamado"
        modalOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setNewTicket({ title: '', description: '' });
        }}
      >
        <form onSubmit={handleCreateTicket} className="space-y-4">
          <Input 
            placeholder="Título resumido" 
            value={newTicket.title}
            onChange={e => setNewTicket({...newTicket, title: e.target.value})}
            className={"border-zinc-900/70 bg-primary/60 focus:outline-none"}
            required 
          />
          <Textarea 
            placeholder="Detalhe exatamente o que está acontecendo..."
            value={newTicket.description}
            onChange={e => setNewTicket({...newTicket, description: e.target.value})}
            className={"min-h-25 border-zinc-900/70 bg-primary/60 focus:outline-none focus-visible:border-0 focus-visible:ring-0 focus-visible:ring-offset-0"}
            required 
          />
          <Button 
            type="submit" 
            className="w-full hover:bg-zinc-900 cursor-pointer disabled:cursor-not-allowed" 
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Enviando e analisando...' : 'Enviar Chamado'}
          </Button>
        </form>
      </CustomModal>

      <CustomModal
        title="Detalhes do Chamado"
        modalOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setSelectedTicket(null);
        }}
      >
        <div className="flex flex-col my-2">
          {selectedTicket && (
            <div className="flex flex-col gap-1">
              <div className="flex justify-between items-center">
                <p className="font-bold">Título:</p>
                <p className="text-sm">{selectedTicket.title}</p>
              </div>
              <div className="flex justify-between items-start gap-8">
                <p className="font-bold">Descrição:</p>
                <p className="text-sm text-end">{selectedTicket.description}</p>
              </div>
              <div className="flex justify-between items-center">
                <p className="font-bold">Categoria:</p>
                <p className="text-sm" >{selectedTicket.category}</p>
              </div>
              <div className="flex justify-between items-center">
                <p className="font-bold">Prioridade:</p>
                <p className="text-sm">{selectedTicket.priority}</p>
              </div>
              <div className="flex justify-between items-center">
                <p className="font-bold">Status:</p>
                <p className="text-sm">{selectedTicket.status}</p>
              </div>
              <div className="flex justify-between items-center">
                <p className="font-bold">Responsável:</p>
                <p className="text-sm">{selectedTicket.assigneeId ? selectedTicket.assigneeId : 'Não atribuído'}</p>
              </div>
              <div className="flex justify-between items-center">
                <p className="font-bold">Aberto em:</p>
                {new Date(selectedTicket.createdAt).toLocaleDateString('pt-BR')}
              </div>
            </div>
          )}
        </div>

        <Button 
          onClick={() => handleDeleteTicket(selectedTicket?.id || '')}
          className="w-full bg-red-800 hover:bg-red-800/80 cursor-pointer disabled:cursor-not-allowed" 
          disabled={isSubmitting}
        >
          {isSubmitting ? 'Deletando...' : 'Deletar'}
        </Button>
      </CustomModal>
    </div>
  )
}