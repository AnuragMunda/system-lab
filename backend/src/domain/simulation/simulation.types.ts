/**
 * This file defines the types and interfaces related to simulations in the system.
 */

export type SimulationStatus =
  | "pending"
  | "running"
  | "paused"
  | "completed"
  | "failed"
  | "cancelled";

export interface SimulationConfig {
  durationSeconds: number;
  requestsPerSecond: number;
  simulationSpeed: number;
}

export interface Simulation {
  id: string;
  architectureId: string;

  status: SimulationStatus;
  config: SimulationConfig;

  startedAt?: Date;
  completedAt?: Date;
}
