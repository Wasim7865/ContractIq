export interface User {
  id: number;
  email: string;
  full_name: string;
  created_at: string;
}

export interface AuthResponse {
  access_token: string;
  token_type: string;
  user: User;
}

export interface ClauseAnalysis {
  clause_title: string;
  clause_text: string;
  risk_level: 'low' | 'medium' | 'high' | 'critical';
  risk_score: number;
  explanation: string;
  original_text?: string;
}

export interface Analysis {
  id: number;
  contract_id: number;
  overall_risk_score: number;
  overall_risk_level: 'low' | 'medium' | 'high' | 'critical';
  summary: string;
  contract_type: string;
  key_dates: Record<string, string> | null;
  parties: string[] | null;
  clauses: ClauseAnalysis[];
  suggestions: string[];
  created_at: string;
  analysis_duration_ms: number | null;
}

export interface Contract {
  id: number;
  title: string;
  filename: string | null;
  upload_type: 'pdf' | 'text';
  status: 'pending' | 'analyzing' | 'completed' | 'failed';
  file_size: number | null;
  created_at: string;
  updated_at: string;
}

export interface ContractDetail extends Contract {
  content_text: string;
  analysis: Analysis | null;
}
