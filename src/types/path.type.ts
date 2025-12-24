export interface pathCreate {
  title: string;
  description?: string | undefined;
  categoryId: number;
  difficulty?: "BEGINNER" | "INTERMEDIATE" | "ADVANCED" | undefined;
}
export interface pathUpdate {
  title?: string | undefined;
  description?: string | undefined;
  categoryId?: number | undefined;
  difficulty?: "BEGINNER" | "INTERMEDIATE" | "ADVANCED" | undefined;
}
