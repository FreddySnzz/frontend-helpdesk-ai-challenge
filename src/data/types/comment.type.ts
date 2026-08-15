export interface Comment {
  id: string;
  text: string;
  authorId: string;
  author: {
    name: string;
    email: string;
  };
  createdAt: string;
}