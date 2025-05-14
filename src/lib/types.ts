export interface EthicalRouteType {
  question: string;
  description: string;
  participations: number;
  created_at: Date | { seconds: number; nanoseconds: number };
  branches: Record<string, BranchType>;
}

export interface EthicalRouteTypeWithId extends EthicalRouteType {
  documentId: string;
}

export interface EthicalRouteWithDifference extends EthicalRouteTypeWithId {
  difference: number;
}

export type BranchType = {
  conclusion?: string;
  advice?: string;
  comentario_final?: string;
  question?: string;
  branches?: Record<string, BranchType>;
};
