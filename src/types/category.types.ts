export interface CategoryCreate {
  name: string;
  descriptions: string;
  slug: string;
}
export interface CategoryUpdate {
  name?: string;
  descriptions?: string;
  slug?: string;
}
