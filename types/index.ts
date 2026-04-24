export type User = {
  id: string;
  email: string;
  created_at: string;
  avatar_url?: string;
  full_name?: string;
};

export type Workspace = {
  id: string;
  name: string;
  created_at: string;
  owner_id: string;
};

export type Agent = {
  id: string;
  workspace_id: string;
  name: string;
  description: string;
  model: string;
  created_at: string;
};

export type Task = {
  id: string;
  agent_id: string;
  title: string;
  status: "pending" | "in_progress" | "completed" | "failed";
  created_at: string;
};

export type ApiKey = {
  id: string;
  workspace_id: string;
  key_hint: string;
  created_at: string;
};
