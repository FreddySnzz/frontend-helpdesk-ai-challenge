export type Priority = 'BAIXA' | 'MEDIA' | 'ALTA';
export type Status = 'ABERTO' | 'EM_ANDAMENTO' | 'RESOLVIDO' | 'FECHADO';

export interface Ticket {
  id: string;
  title: string;
  description: string;
  category: string;
  priority: Priority;
  status: Status;
  isAiClassified: boolean;
  authorId: string;
  assigneeId: string | null;
  createdAt: string;
  updatedAt: string;
  author: {
    name: string;
    email: string;
  };
  assignee?: {
    name: string;
    email: string;
  };
}

export interface CreateTicketPayload {
  title: string;
  description: string;
  category?: string | null;
  priority?: Priority | null;
  status?: Status | null;
  assigneeId?: string | null;
}

export interface EditTicketPayload {
  category?: string | null;
  priority?: Priority | null;
  status?: Status | null;
  assigneeId?: string | null;
}