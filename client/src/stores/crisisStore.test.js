import { describe, it, expect, beforeEach, vi } from 'vitest';
import useCrisisStore from './crisisStore';

describe('Crisis_Store (Zustand)', () => {
  beforeEach(() => {
    useCrisisStore.getState().reset();
  });

  it('P8: El store debe reflejar el último Crisis_State recibido sin mezcla', () => {
    const state1 = {
      encryptionPercentage: 10,
      trafficMap: [{ ip: '1.1.1.1', volume: 100 }],
      accessLog: ['Log 1'],
      availableProtocols: ['isolate-network']
    };

    const state2 = {
      encryptionPercentage: 20,
      trafficMap: [{ ip: '2.2.2.2', volume: 200 }],
      accessLog: ['Log 2'],
      availableProtocols: ['block-ip']
    };

    useCrisisStore.getState().setCrisisState(state1);
    expect(useCrisisStore.getState().crisisState).toEqual(state1);

    useCrisisStore.getState().setCrisisState(state2);
    expect(useCrisisStore.getState().crisisState).toEqual(state2);
    expect(useCrisisStore.getState().crisisState.trafficMap).toHaveLength(1);
    expect(useCrisisStore.getState().crisisState.trafficMap[0].ip).toBe('2.2.2.2');
  });

  it('P9: actionCode solo debe actualizarse si el rol es Monitor', () => {
    // Caso: Rol es Técnico
    useCrisisStore.getState().setPlayer('Agente T', 'Técnico', 'ROOM-01');
    useCrisisStore.getState().setActionCode('XJ92KL');
    expect(useCrisisStore.getState().actionCode).toBeNull();

    // Caso: Rol es Monitor
    useCrisisStore.getState().setPlayer('Agente M', 'Monitor', 'ROOM-01');
    useCrisisStore.getState().setActionCode('XJ92KL');
    expect(useCrisisStore.getState().actionCode).toBe('XJ92KL');
  });

  it('P10: El reset del store debe ser idempotente', () => {
    // Modificar estado
    useCrisisStore.getState().setPlayer('Agente', 'Monitor', 'ROOM-01');
    useCrisisStore.getState().setConnection(true);
    useCrisisStore.getState().setActionCode('ABCDEF');

    // Primer reset
    useCrisisStore.getState().reset();
    const stateAfterFirstReset = { ...useCrisisStore.getState() };

    // Segundo reset
    useCrisisStore.getState().reset();
    const stateAfterSecondReset = { ...useCrisisStore.getState() };

    expect(stateAfterFirstReset.playerRole).toBeNull();
    expect(stateAfterFirstReset.socketConnected).toBe(false);
    expect(stateAfterFirstReset.actionCode).toBeNull();
    
    // Comparar estados (ignorando funciones de zustand)
    expect(stateAfterFirstReset.playerName).toBe(stateAfterSecondReset.playerName);
    expect(stateAfterFirstReset.playerRole).toBe(stateAfterSecondReset.playerRole);
    expect(stateAfterFirstReset.roomId).toBe(stateAfterSecondReset.roomId);
    expect(stateAfterFirstReset.socketConnected).toBe(stateAfterSecondReset.socketConnected);
  });
});
