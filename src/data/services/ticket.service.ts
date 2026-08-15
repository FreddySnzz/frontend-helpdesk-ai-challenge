import { CreateTicket, Ticket } from "../types/ticket.type";

export const ticketService = {
  async getAllTickets(token: string): Promise<Ticket[]> {
    if (!token) throw new Error('Realize o login primeiro.');

    const response = await fetch('http://localhost:8080/ticket', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Erro ao buscar chamados');
    }

    return data;
  },

  async createTicket(payload: CreateTicket, token: string): Promise<Ticket> {
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

    if (!response.ok) {
      throw new Error(data.message || 'Erro ao criar chamados');
    }

    return data;
  },

  async deleteTicket(id: string, token: string): Promise<void> {
    if (!token) throw new Error('Realize o login primeiro.');

    const response = await fetch('http://localhost:8080/ticket/' + id, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
    });

    if (response.ok) return;

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Erro ao deletar chamado');
    }
  },
};