import { Timestamp } from "firebase/firestore";

export interface Technician {
  id: string;
  name: string;
  email: string;
  agentId: string;
}

// New interface for tickets
export interface Ticket {
  id: string;
  ticketNumber: string;
  createdAt: Timestamp;
  url: string;
}

export enum ControlStatus {
  InProgress = "In Progress",
  InReview = "In Review",
  Complete = "Complete",
}

export enum PriorityLevel {
  Low = "Low",
  Medium = "Medium",
  High = "High",
  Critical = "Critical",
}

export enum Company {
  BGC = "BGC",
  Cambio = "Cambio",
  Both = "Both"
}

export interface Control {
  id: string;
  dcfId: string; // e.g., "DCF-441"
  title: string; // e.g., "Audit Log Retention Period"
  explanation: string;
  status: ControlStatus;
  priorityLevel: PriorityLevel | null; // New field for priority
  estimatedCompletionDate: Timestamp | null; // Use Firestore Timestamp for dates
  assigneeId: string | null; // ID of the assigned Technician, null if unassigned
  order: number; // For drag-and-drop ordering
  tags: string[]; // For additional filtering capabilities
  progress: number; // Percentage complete (0-100)
  lastUpdated: Timestamp | null; // When the control was last modified
  externalUrl: string | null; // URL to external ticketing system
  company: Company; // Company the control is associated with
  ticketNumber: string | null; // New field for ticket number
  ticketUrl: string | null; // New field for ticket URL
}

// Interface for search and filter options
export interface ControlFilters {
  search: string;
  status: ControlStatus[] | null;
  priority: PriorityLevel[] | null;
  assignee: string[] | null;
  tags: string[] | null;
  company: Company[] | null; // Add company filter
  dateRange: {
    start: Timestamp | null;
    end: Timestamp | null;
  } | null;
}

// Interface for batch operations
export interface BatchOperation {
  controlIds: string[];
  updates: Partial<Omit<Control, 'id'>>;
}

// Type for view mode
export type ViewMode = 'kanban' | 'timeline' | 'compact';

// Type for view density
export type ViewDensity = 'full' | 'medium' | 'compact'; 