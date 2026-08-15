'use client';

import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle 
} from "./ui/card";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { 
  Eye, 
  MoreHorizontalIcon, 
  Plus, 
  Trash2Icon, 
  MessageSquare 
} from "lucide-react";
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
import { useEffect, useRef, useState, useMemo } from "react";
import { Ticket } from "@/data/types/ticket.type";
import { metricsService } from "@/data/services/metrics.service";
import { ticketService } from "@/data/services/ticket.service";
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
import { useRouter } from "next/navigation";
import { formatDateWithTime } from "@/data/utils/formatDate";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuGroup, 
  DropdownMenuItem, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from "./ui/dropdown-menu";
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { cn } from "@/lib/utils";

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
  const router = useRouter();

  const [tickets, setTickets] = useState<Ticket[]>(initialTickets);
  const [metrics, setMetrics] = useState<any>(initialMetrics);
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  
  const [newTicket, setNewTicket] = useState({ title: '', description: '' });
  const [selectedTicket, setSelectedTicket] = useState<any | null>(null);
  const [newComment, setNewComment] = useState('');
  
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [filterStatus, setFilterStatus] = useState<string>('TODOS');
  const [filterPriority, setFilterPriority] = useState<string>('TODAS');

  const abortControllerRef = useRef<AbortController | null>(null);

  useEffect(() => {
    if (user?.role !== 'ADMIN') return;
    
    abortControllerRef.current = new AbortController();

    metricsService.listenStreamEvents(
      accessToken,
      abortControllerRef.current.signal,
      (payload) => {
        setMetrics(payload.metrics);
        refreshTickets();

        if (payload.alert) {
          toast.error("🚨 NOVO CHAMADO URGENTE 🚨", {
            description: payload.alert,
            duration: 10000,
          });
        }
      },
      (error) => {
        if (error instanceof Error) toast.error("Erro ao conectar-se ao SSE: " + error.message);
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
  }

  const handleCreateTicket = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      await ticketService.createTicket(newTicket, accessToken);
      toast.success("Chamado aberto com sucesso!");
      refreshTickets();
    } catch (error) {
      if (error instanceof Error) toast.error(error.message);
    } finally {
      setIsSubmitting(false);
      setIsModalOpen(false);
      setNewTicket({ title: '', description: '' });
    }
  }

  const handleOpenDetails = async (id: string) => {
    try {
      const details = await ticketService.getTicketById(id, accessToken);
      setSelectedTicket(details);
      setIsEditModalOpen(true);
    } catch (error) {
      if (error instanceof Error) toast.error(error.message);
    }
  }

  const handleAdminUpdate = async (field: string, value: string) => {
    if (!selectedTicket) return;

    try {
      await ticketService.updateTicket(
        selectedTicket.id, 
        { [field]: value }, 
        accessToken
      );

      toast.success(`Chamado atualizado com sucesso.`);
      handleOpenDetails(selectedTicket.id);
      refreshTickets();
    } catch (error) {
      if (error instanceof Error) toast.error(error.message);
    }
  }

  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!newComment.trim() || !selectedTicket) return;

    setIsSubmitting(true);
    try {
      await ticketService.addComment(selectedTicket.id, newComment, accessToken);
      toast.success("Comentário adicionado com sucesso.");
      setNewComment('');
      handleOpenDetails(selectedTicket.id);
    } catch (error) {
      if (error instanceof Error) toast.error(error.message);
    } finally {
      setIsSubmitting(false);
    }
  }

  const handleDeleteTicket = async (id: string) => {
    try {
      await ticketService.deleteTicket(id, accessToken);
      toast.success("Chamado excluído com sucesso.");
      refreshTickets();
    } catch (error) {
      if (error instanceof Error) toast.error(error.message);
    } finally {
      setIsSubmitting(false);
      setIsEditModalOpen(false);
      setSelectedTicket(null);
    }
  }

  const filteredTickets = useMemo(() => {
    return tickets.filter(t => {
      const matchStatus = filterStatus === 'TODOS' || t.status === filterStatus;
      const matchPriority = filterPriority === 'TODAS' || t.priority === filterPriority;
      return matchStatus && matchPriority;
    });
  }, [tickets, filterStatus, filterPriority]);

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'ALTA': return 'bg-red-700 hover:bg-red-600 font-bold';
      case 'MEDIA': return 'bg-yellow-600 hover:bg-yellow-700 font-bold';
      default: return 'bg-emerald-800 hover:bg-emerald-700 font-bold';
    }
  };

  const chartData = metrics?.byPriority?.map((m: any) => ({
    name: m.priority,
    value: m._count.id
  })) || [];

  const getHexPriorityColor = (priority: string) => {
    switch (priority?.toLowerCase()) {
      case 'alta': return '#c10007';
      case 'media': return '#d08700'; 
      case 'baixa': return '#006045'; 
      default: return '#aaaaaa';      
    }
  };
  
  const isTicketClosed = selectedTicket?.status === 'FECHADO';

  return (
    <div className="flex-1 flex flex-col w-full min-h-0">
      <div className="flex flex-col">
        <main className="flex flex-col w-full mb-8">
          <div className="flex p-4 justify-between">
            <div className="flex flex-col">
              <h1 className="text-lg font-bold tracking-tight">
                {user?.role === 'ADMIN' ? 'PAINEL ADMINISTRATIVO' : `Olá, ${user?.name}!`}
              </h1>
              <p className="text-muted-foreground text-sm">
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
                          cx="50%" cy="50%" labelLine={false} innerRadius={0} outerRadius={80} paddingAngle={0} dataKey="value"
                        >
                          {chartData.map((entry: any, index: number) => (
                            <Cell key={`cell-${index}`} fill={getHexPriorityColor(entry.name)} />
                          ))}
                        </Pie>
                        <Tooltip 
                          contentStyle={{ backgroundColor: '#18181b', borderColor: '#27272a', borderRadius: '8px' }} 
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
                  {metrics?.byPriority?.length > 0 ? (
                    metrics.byPriority.map((m: any) => (
                      <div key={m.priority} className="flex justify-between items-center mt-2">
                        <span className="text-sm font-bold text-zinc-200">{m.priority}</span>
                        <Badge className={getPriorityColor(m.priority)}>{m._count.id}</Badge>
                      </div>
                    ))
                  ) : (
                    <p className="text-2xl font-bold">0</p>
                  )}
                </CardContent>
              </Card>
            </div>
          )}

          <div className="px-4 md:px-8 mt-4 mb-2 flex flex-col md:flex-row justify-between items-center gap-4">
            <h2 className="text-lg font-bold">Lista de Chamados</h2>
            <div className="flex gap-2">
              <Select 
                value={filterStatus}
                onValueChange={(value) => setFilterStatus(value as string)}
                disabled={isSubmitting}
              >
                <SelectTrigger 
                  title="Filtar por status"
                  aria-label="Filtar por status"
                  className={cn("border border-muted-foreground/20 w-full cursor-pointer",
                    "focus:outline-none focus:ring-0 focus:ring-offset-0 transition-all",
                    "bg-primary hover:bg-black/20 font-space-grotesk text-secondary",
                  )}
                >
                  <SelectValue placeholder="Todos" className="text-sm font-semibold" />
                </SelectTrigger>
                <SelectContent className="transition-all font-space-grotesk bg-zinc-900 text-secondary border border-muted-foreground/20">
                  <SelectGroup>
                    <SelectItem value={'TODOS'} className="cursor-pointer focus:bg-primary focus:text-secondary">
                      Status: Todos
                    </SelectItem>
                    <SelectItem value={'ABERTO'} className="cursor-pointer focus:bg-primary focus:text-secondary">
                      Aberto
                    </SelectItem>
                    <SelectItem value={'EM_ANDAMENTO'} className="cursor-pointer focus:bg-primary focus:text-secondary">
                      Em Andamento
                    </SelectItem>
                    <SelectItem value={'RESOLVIDO'} className="cursor-pointer focus:bg-primary focus:text-secondary">
                      Resolvido
                    </SelectItem>
                    <SelectItem value={'FECHADO'} className="cursor-pointer focus:bg-primary focus:text-secondary">
                      Fechado
                    </SelectItem>
                  </SelectGroup>
                </SelectContent>
              </Select>
              <Select 
                value={filterPriority}
                onValueChange={(value) => setFilterPriority(value as string)}
                disabled={isSubmitting}
              >
                <SelectTrigger 
                  title="Filtar por prioridade"
                  aria-label="Filtar por prioridade"
                  className={cn("border border-muted-foreground/20 w-full cursor-pointer",
                    "focus:outline-none focus:ring-0 focus:ring-offset-0 transition-all",
                    "bg-primary hover:bg-black/20 font-space-grotesk text-secondary",
                  )}
                >
                  <SelectValue placeholder="Todas" className="text-sm font-semibold" />
                </SelectTrigger>
                <SelectContent className="transition-all font-space-grotesk bg-zinc-900 text-secondary border border-muted-foreground/20">
                  <SelectGroup>
                    <SelectItem value={'TODAS'} className="cursor-pointer focus:bg-primary focus:text-secondary">
                      Prioridade: Todas
                    </SelectItem>
                    <SelectItem value={'ALTA'} className="cursor-pointer focus:bg-primary focus:text-secondary">
                      Alta
                    </SelectItem>
                    <SelectItem value={'MEDIA'} className="cursor-pointer focus:bg-primary focus:text-secondary">
                      Média
                    </SelectItem>
                    <SelectItem value={'BAIXA'} className="cursor-pointer focus:bg-primary focus:text-secondary">
                      Baixa
                    </SelectItem>
                  </SelectGroup>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="mx-4 md:mx-8 bg-primary shadow-sm border border-muted-foreground/20 cursor-default rounded-lg overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-black/20 transition-colors border-muted-foreground/20">
                  <TableHead>Título</TableHead>
                  <TableHead>Categoria</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Prioridade</TableHead>
                  <TableHead>Responsável</TableHead>
                  <TableHead>Ação</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredTickets.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8">Nenhum chamado encontrado.</TableCell>
                  </TableRow>
                ) : (
                  filteredTickets.map((ticket) => (
                    <TableRow 
                      key={ticket.id} 
                      className="hover:bg-black/20 transition-colors border-muted-foreground/20"
                    >
                      <TableCell className="font-medium">
                        <p>{ticket.title}</p>
                        <p className="text-xs text-zinc-500">
                          {formatDateWithTime(ticket.createdAt)}
                        </p>
                      </TableCell>
                      <TableCell>
                        <Badge 
                          variant="outline" 
                          className="border-muted-foreground/30 bg-zinc-900 text-secondary"
                        >
                          {ticket.category}
                        </Badge>
                      </TableCell>
                      <TableCell>{ticket.status}</TableCell>
                      <TableCell>
                        <Badge className={cn(getPriorityColor(ticket.priority), "w-16")}>
                          {ticket.priority}
                        </Badge>
                      </TableCell>
                      <TableCell>{ticket.assignee?.name ? ticket.assignee.name : 'Não atribuído'}</TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger>
                            <div className="flex justify-center items-center rounded-lg h-8 w-8 hover:bg-black/20 cursor-pointer">
                              <MoreHorizontalIcon className="h-4 w-4" />
                            </div>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent 
                            align="end" 
                            className="bg-zinc-900 border-zinc-800 text-secondary font-space-grotesk rounded-lg"
                          >
                            <DropdownMenuGroup>
                              <DropdownMenuItem 
                                className={`cursor-pointer rounded-lg hover:bg-zinc-950/15 
                                  focus:bg-zinc-950/15 hover:text-secondary focus:text-secondary
                                `}
                                onClick={() => handleOpenDetails(ticket.id)}
                              >
                                <Eye className="h-4 w-4 mr-2" /> 
                                Ver Detalhes
                              </DropdownMenuItem>
                            </DropdownMenuGroup>
                            
                            {(user?.role === 'ADMIN' || (user?.role === 'SOLICITANTE' && ticket.status === 'ABERTO')) && (
                              <>
                                <DropdownMenuSeparator className="bg-zinc-800" />
                                <DropdownMenuGroup>
                                  <DropdownMenuItem 
                                    className={`cursor-pointer text-red-500 focus:text-red-500 
                                      rounded-lg hover:bg-zinc-950/15 focus:bg-zinc-950/15 hover:text-red-500
                                    `}
                                    onClick={() => handleDeleteTicket(ticket.id)}
                                  >
                                    <Trash2Icon className="h-4 w-4 mr-2" /> 
                                    {user?.role === 'ADMIN' ? 'Excluir' : 'Cancelar'}
                                  </DropdownMenuItem>
                                </DropdownMenuGroup>
                              </>
                            )}
                          </DropdownMenuContent>
                        </DropdownMenu>
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
        <p className="text-xs text-zinc-400">
          Descreva o seu problema. Nossa Inteligência Artificial fará a leitura e classificará a prioridade automaticamente.
        </p>
        <form onSubmit={handleCreateTicket} className="space-y-4 mt-2">
          <Input 
            placeholder="Ex: Mouse parou de funcionar"
            value={newTicket.title}
            onChange={e => setNewTicket({...newTicket, title: e.target.value})}
            className={"border-zinc-900/70 bg-primary/60 focus:outline-none"}
            required 
          />
          <Textarea 
            placeholder="Detalhe o máximo possível o que está acontecendo..."
            value={newTicket.description}
            onChange={e => setNewTicket({...newTicket, description: e.target.value})}
            className={"min-h-30 border-zinc-900/70 bg-primary/60 focus:outline-none focus-visible:border-0 focus-visible:ring-0 focus-visible:ring-offset-0"}
            required 
          />
          <Button 
            type="submit" 
            className="w-full hover:bg-zinc-900 cursor-pointer disabled:cursor-not-allowed" 
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Enviando e analisando...' : 'Abrir Chamado'}
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
        className="bg-zinc-900 max-h-[95vh]"
      >
        {selectedTicket && (
          <div className="flex flex-col gap-6 my-2 overflow-y-auto pr-2">
            <div className="flex flex-col gap-2">
              <div className="flex justify-between items-center">
                <p className="font-bold">Título:</p>
                <p className="text-sm text-zinc-400">{selectedTicket.title}</p>
              </div>
              <div className="flex justify-between items-start gap-8">
                <p className="font-bold">Descrição:</p>
                <p className="text-sm text-end text-zinc-400">{selectedTicket.description}</p>
              </div>
              <div className="flex justify-between items-center">
                <p className="font-bold">Aberto em:</p>
                <p className="text-sm text-zinc-400">{formatDateWithTime(selectedTicket.createdAt)}</p>
              </div>
              <div className="flex justify-between items-center">
                <p className="font-bold">Solicitante:</p>
                <p className="text-sm text-zinc-400">{selectedTicket.author?.name || 'Não atribuído'}</p>
              </div>
            </div>
            <hr className="border-muted-foreground/20" />

            {user?.role === 'ADMIN' ? (
              <div className="flex flex-col gap-3">
                <p className="font-bold text-sm">
                  Editar Chamado
                </p>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1">
                    <label className="text-xs text-muted-foreground">Status</label>
                    <Select 
                      value={selectedTicket.status}
                      onValueChange={(value) => handleAdminUpdate('status', value as string)}
                      disabled={isSubmitting}
                    >
                      <SelectTrigger 
                        title="Editar status"
                        aria-label="Editar status"
                        className={cn("border border-muted-foreground/20 w-full cursor-pointer",
                          "focus:outline-none focus:ring-0 focus:ring-offset-0 transition-all",
                          "bg-primary hover:bg-black/20 font-space-grotesk text-secondary",
                        )}
                      >
                        <SelectValue placeholder="Aberto" className="text-sm font-semibold" />
                      </SelectTrigger>
                      <SelectContent className="transition-all font-space-grotesk bg-zinc-900 text-secondary border border-muted-foreground/20">
                        <SelectGroup>
                          <SelectItem value={'ABERTO'} className="cursor-pointer focus:bg-primary focus:text-secondary">
                            Aberto
                          </SelectItem>
                          <SelectItem value={'EM_ANDAMENTO'} className="cursor-pointer focus:bg-primary focus:text-secondary">
                            Em Andamento
                          </SelectItem>
                          <SelectItem value={'RESOLVIDO'} className="cursor-pointer focus:bg-primary focus:text-secondary">
                            Resolvido
                          </SelectItem>
                          <SelectItem value={'FECHADO'} className="cursor-pointer focus:bg-primary focus:text-secondary">
                            Fechado
                          </SelectItem>
                        </SelectGroup>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex flex-col gap-1">
                    <label className="text-xs text-muted-foreground">Prioridade (Definida pela IA)</label>
                    <Select 
                      value={selectedTicket.priority}
                      onValueChange={(value) => handleAdminUpdate('priority', value as string)}
                      disabled={isSubmitting}
                    >
                      <SelectTrigger 
                        title="Editar prioridade"
                        aria-label="Editar prioridade"
                        className={cn("border border-muted-foreground/20 w-full cursor-pointer",
                          "focus:outline-none focus:ring-0 focus:ring-offset-0 transition-all",
                          "bg-primary hover:bg-black/20 font-space-grotesk text-secondary",
                        )}
                      >
                        <SelectValue placeholder="Média" className="text-sm font-semibold" />
                      </SelectTrigger>
                      <SelectContent className="transition-all font-space-grotesk bg-zinc-900 text-secondary border border-muted-foreground/20">
                        <SelectGroup>
                          <SelectItem value={'ALTA'} className="cursor-pointer focus:bg-primary focus:text-secondary">
                            Alta
                          </SelectItem>
                          <SelectItem value={'MEDIA'} className="cursor-pointer focus:bg-primary focus:text-secondary">
                            Média
                          </SelectItem>
                          <SelectItem value={'BAIXA'} className="cursor-pointer focus:bg-primary focus:text-secondary">
                            Baixa
                          </SelectItem>
                        </SelectGroup>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="flex flex-col gap-1 mt-2">
                  <label className="text-xs text-muted-foreground">Categoria (Definida pela IA)</label>
                  <Input 
                    className="border-muted-foreground/20 bg-primary text-sm h-9 focus:outline-none"
                    defaultValue={selectedTicket.category}
                    onBlur={(e) => handleAdminUpdate('category', e.target.value)}
                    disabled={isTicketClosed}
                  />
                </div>

                <hr className="border-muted-foreground/20" />
                <div className="flex justify-between items-center">
                  <div className="flex items-baseline gap-2">
                    <p className="font-bold text-sm">Responsável:</p>
                    <p className="text-sm text-muted-foreground">{selectedTicket.assignee?.name || 'Não atribuído'}</p>
                  </div>
                  {!selectedTicket.assigneeId && !isTicketClosed && (
                    <Button 
                      className="bg-primary hover:bg-black/50 text-secondary cursor-pointer"
                      onClick={() => handleAdminUpdate('assigneeId', user.id)}
                    >
                      Assumir
                    </Button>
                  )}
                </div>
              </div>
            ) : (
              <div className="flex flex-col gap-2">
                <div className="flex justify-between items-center">
                  <p className="font-bold">Categoria:</p>
                  <p className="text-sm text-zinc-400">{selectedTicket.category}</p>
                </div>
                <div className="flex justify-between items-center">
                  <p className="font-bold">Prioridade:</p>
                  <p className="text-sm text-zinc-400">{selectedTicket.priority}</p>
                </div>
                <div className="flex justify-between items-center">
                  <p className="font-bold">Status:</p>
                  <p className="text-sm text-zinc-400">{selectedTicket.status}</p>
                </div>
                <div className="flex justify-between items-center">
                  <p className="font-bold">Responsável:</p>
                  <p className="text-sm text-zinc-400">{selectedTicket.assignee?.name || 'Na fila'}</p>
                </div>
              </div>
            )}

            <div className="flex flex-col flex-1 border border-muted-foreground/10 rounded-lg overflow-hidden">
              <div className="bg-black/20 p-3 border-b border-muted-foreground/10">
                <h3 className="font-bold text-sm flex items-center gap-2">
                  <MessageSquare className="h-4 w-4"/>
                  Histórico e Comentários
                </h3>
              </div>
              
              <div className="p-2 space-y-4 overflow-y-auto">
                {selectedTicket.comments?.length === 0 ? (
                  <p className="text-xs text-center text-muted-foreground py-4">
                    Nenhuma interação registrada.
                  </p>
                ) : (
                  selectedTicket.comments?.map((comment: any) => (
                    <div 
                      key={comment.id} 
                      className={`p-3 rounded-lg text-sm border 
                        ${comment.authorId === user?.id ? 
                          'bg-black/40 border-muted-foreground/20 ml-4' : 
                          'bg-primary border-muted-foreground/10 mr-4'}
                      `}
                    >
                      <div className="flex justify-between text-xs mb-2">
                        <p className="font-bold opacity-20">
                          {comment.author?.name}
                        </p>
                        <p className="opacity-50">
                          {new Date(comment.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </p>
                      </div>
                      <p className="opacity-90">
                        {comment.text}
                      </p>
                    </div>
                  ))
                )}
              </div>
              <div className="p-3 bg-black/10 border-t border-muted-foreground/10">
                {isTicketClosed ? (
                  <p className="text-xs text-red-500 font-bold text-center">
                    Chamado fechado. Novos comentários estão desabilitados.
                  </p>
                ) : (
                  <form onSubmit={handleAddComment} className="flex gap-2">
                    <Input 
                      placeholder="Adicione um comentário..." 
                      value={newComment}
                      onChange={(e) => setNewComment(e.target.value)}
                      className="border-muted-foreground/20 bg-primary focus:outline-none"
                    />
                    <Button 
                      type="submit" 
                      disabled={isSubmitting || !newComment.trim()} 
                      className="hover:bg-zinc-900 cursor-pointer"
                    >
                      Enviar
                    </Button>
                  </form>
                )}
              </div>
            </div>
          </div>
        )}
      </CustomModal>
    </div>
  )
}