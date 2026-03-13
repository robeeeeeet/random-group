export interface Group {
  index: number;
  color: string;
  name: string;
}

export interface EventData {
  id: string;
  groupCount: number;
  groups: Group[];
  adminToken: string;
  createdAt: string;
}

export interface Participant {
  id: string;
  name: string;
  groupIndex: number;
}
