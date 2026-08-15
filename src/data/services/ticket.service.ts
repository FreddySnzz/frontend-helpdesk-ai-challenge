import { CreateTicketPayload, EditTicketPayload, Ticket } from "../types/ticket.type";

export const ticketService = {
  async getAllTickets(token: string): Promise<Ticket[]> {
    if (!token) throw new Error('Realize o login primeiro.');
    const response = await fetch('http://localhost:8080/ticket', {
      headers: { 'Authorization': `Bearer ${token}` },
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.message || 'Erro ao buscar chamados');
    return data;
  },

  async getTicketById(id: string, token: string): Promise<Ticket> {
    if (!token) throw new Error('Realize o login primeiro.');
    const response = await fetch(`http://localhost:8080/ticket/${id}`, {
      headers: { 'Authorization': `Bearer ${token}` },
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.message || 'Erro ao buscar detalhes do chamado');
    return data;
  },

  async createTicket(payload: CreateTicketPayload, token: string): Promise<Ticket> {
    if (!token) throw new Error('Realize o login primeiro.');
    const response = await fetch('http://localhost:8080/ticket', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(payload),
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.message || 'Erro ao criar chamado (Possível duplicidade)');
    return data;
  },

  async updateTicket(id: string, payload: EditTicketPayload, token: string): Promise<void> {
    if (!token) throw new Error('Realize o login primeiro.');
    const response = await fetch(`http://localhost:8080/ticket/${id}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(payload),
    });
    if (!response.ok) {
      const data = await response.json();
      throw new Error(data.message || 'Erro ao atualizar chamado');
    }
  },

  async addComment(ticketId: string, text: string, token: string): Promise<void> {
    if (!token) throw new Error('Realize o login primeiro.');
    const response = await fetch(`http://localhost:8080/ticket/${ticketId}/comments`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({ text }),
    });
    if (!response.ok) {
      const data = await response.json();
      throw new Error(data.message || 'Erro ao adicionar comentário');
    }
  },

  async deleteTicket(id: string, token: string): Promise<void> {
    if (!token) throw new Error('Realize o login primeiro.');
    const response = await fetch(`http://localhost:8080/ticket/${id}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${token}` },
    });
    if (!response.ok) {
      const data = await response.json();
      throw new Error(data.message || 'Erro ao deletar chamado');
    }
  },
};