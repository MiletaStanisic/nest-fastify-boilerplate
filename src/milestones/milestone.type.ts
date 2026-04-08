export type Milestone = {
  id: string;
  clientId: string;
  title: string;
  description: string | undefined;
  dueDate: string | undefined;
  completed: boolean;
  createdAt: string;
};
