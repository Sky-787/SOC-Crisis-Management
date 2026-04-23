const fc = require('fast-check');
const { isolateNetwork } = require('../src/protocols/isolate-network');
const { generateDecryptionKey } = require('../src/protocols/generate-decryption-key');
const { blockIp } = require('../src/protocols/block-ip');

// ── Helpers ────────────────────────────────────────────────────────────────

/** Crea un CrisisState con valores por defecto sobreescribibles. */
function makeState(overrides = {}) {
  return {
    encryptionPercentage: 0,
    trafficMap: [
      { ip: '192.168.1.1', volume: 100 },
      { ip: '10.0.0.1', volume: 50 },
    ],
    accessLog: [],
    availableProtocols: ['isolate-network', 'generate-decryption-key', 'block-ip'],
    ...overrides,
  };
}

/** Aplica un ciclo de degradación (sin side effects, solo para tests). */
function applyDegradation(state, increment) {
  return {
    ...state,
    encryptionPercentage: Math.min(100, state.encryptionPercentage + increment),
    accessLog: [
      ...state.accessLog,
      `[${new Date().toISOString()}] ALERT: Ransomware encrypted ${increment}% more files`,
    ],
  };
}

/** Arbitrario de fast-check para un CrisisState válido. */
const arbitraryCrisisState = () =>
  fc.record({
    encryptionPercentage: fc.integer({ min: 0, max: 100 }),
    trafficMap: fc.array(
      fc.record({
        ip: fc.ipV4(),
        volume: fc.integer({ min: 1, max: 500 }),
      }),
      { minLength: 0, maxLength: 10 }
    ),
    accessLog: fc.array(fc.string(), { minLength: 0, maxLength: 20 }),
    availableProtocols: fc.constant([
      'isolate-network',
      'generate-decryption-key',
      'block-ip',
    ]),
  });

// ── P1 — Degradación monotónica del Encryption_Percentage ─────────────────

describe('P1 — Degradación monotónica del Encryption_Percentage', () => {
  test('el encryptionPercentage nunca decrece y nunca supera 100', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 0, max: 97 }),
        fc.integer({ min: 1, max: 3 }),
        (initial, increment) => {
          const state = makeState({ encryptionPercentage: initial });
          const next = applyDegradation(state, increment);
          return (
            next.encryptionPercentage >= state.encryptionPercentage &&
            next.encryptionPercentage <= 100
          );
        }
      ),
      { numRuns: 1000 }
    );
  });

  test('con encryptionPercentage en 100, el valor no supera 100', () => {
    fc.assert(
      fc.property(fc.integer({ min: 1, max: 3 }), (increment) => {
        const state = makeState({ encryptionPercentage: 100 });
        const next = applyDegradation(state, increment);
        return next.encryptionPercentage === 100;
      }),
      { numRuns: 100 }
    );
  });
});

// ── P2 — Round-trip de serialización del Crisis_State ─────────────────────

describe('P2 — Round-trip de serialización del Crisis_State', () => {
  test('JSON.parse(JSON.stringify(state)) produce un objeto equivalente', () => {
    fc.assert(
      fc.property(arbitraryCrisisState(), (state) => {
        const roundTripped = JSON.parse(JSON.stringify(state));
        return (
          roundTripped.encryptionPercentage === state.encryptionPercentage &&
          roundTripped.trafficMap.length === state.trafficMap.length &&
          roundTripped.accessLog.length === state.accessLog.length &&
          roundTripped.availableProtocols.length === state.availableProtocols.length
        );
      }),
      { numRuns: 500 }
    );
  });
});

// ── P3 — Idempotencia del bloqueo de IP ───────────────────────────────────

describe('P3 — Idempotencia del bloqueo de IP', () => {
  test('bloquear la misma IP dos veces produce el mismo trafficMap', () => {
    fc.assert(
      fc.property(
        arbitraryCrisisState(),
        fc.ipV4(),
        (state, ip) => {
          const once = blockIp(state, ip);
          const twice = blockIp(once, ip);
          if (once.trafficMap.length !== twice.trafficMap.length) return false;
          return once.trafficMap.every(
            (entry, i) =>
              entry.ip === twice.trafficMap[i].ip &&
              entry.volume === twice.trafficMap[i].volume
          );
        }
      ),
      { numRuns: 500 }
    );
  });
});

// ── P4 — Independencia de Rooms ───────────────────────────────────────────

describe('P4 — Independencia de Rooms', () => {
  test('aplicar un protocolo en stateA no altera stateB', () => {
    fc.assert(
      fc.property(
        arbitraryCrisisState(),
        arbitraryCrisisState(),
        fc.constantFrom('isolate-network', 'generate-decryption-key'),
        (stateA, stateB, protocol) => {
          const encBefore = stateB.encryptionPercentage;
          const trafficBefore = stateB.trafficMap.length;
          const logBefore = stateB.accessLog.length;

          // Aplicar protocolo sobre stateA
          if (protocol === 'isolate-network') isolateNetwork(stateA);
          else generateDecryptionKey(stateA);

          // stateB no debe haber cambiado
          return (
            stateB.encryptionPercentage === encBefore &&
            stateB.trafficMap.length === trafficBefore &&
            stateB.accessLog.length === logBefore
          );
        }
      ),
      { numRuns: 500 }
    );
  });
});

// ── P5 — Unicidad de Action_Codes entre Rooms ─────────────────────────────

describe('P5 — Unicidad de Action_Codes entre Rooms', () => {
  function generateActionCode() {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    return Array.from({ length: 6 }, () =>
      chars[Math.floor(Math.random() * chars.length)]
    ).join('');
  }

  test('la tasa de colisión entre 1000 pares de códigos es menor al 0.01%', () => {
    const SAMPLE = 1000;
    let collisions = 0;

    for (let i = 0; i < SAMPLE; i++) {
      const codeA = generateActionCode();
      const codeB = generateActionCode();
      if (codeA === codeB) collisions++;
    }

    const collisionRate = collisions / SAMPLE;
    expect(collisionRate).toBeLessThan(0.0001);
  });
});

// ── P6 — Reducción acotada del Encryption_Percentage ─────────────────────

describe('P6 — Reducción acotada del Encryption_Percentage', () => {
  test('generate-decryption-key nunca lleva encryptionPercentage por debajo de 0', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 0, max: 100 }),
        (initial) => {
          const state = makeState({ encryptionPercentage: initial });
          const result = generateDecryptionKey(state);
          return result.encryptionPercentage >= 0;
        }
      ),
      { numRuns: 1000 }
    );
  });
});

// ── P7 — Crecimiento del Access_Log ───────────────────────────────────────

describe('P7 — Crecimiento del Access_Log', () => {
  test('el accessLog siempre crece después de un ciclo de degradación', () => {
    fc.assert(
      fc.property(
        arbitraryCrisisState(),
        fc.integer({ min: 1, max: 3 }),
        (state, increment) => {
          const next = applyDegradation(state, increment);
          return next.accessLog.length > state.accessLog.length;
        }
      ),
      { numRuns: 500 }
    );
  });

  test('los protocolos también agregan entradas al accessLog', () => {
    fc.assert(
      fc.property(
        arbitraryCrisisState(),
        fc.constantFrom('isolate-network', 'generate-decryption-key'),
        (state, protocol) => {
          const result =
            protocol === 'isolate-network'
              ? isolateNetwork(state)
              : generateDecryptionKey(state);
          return result.accessLog.length > state.accessLog.length;
        }
      ),
      { numRuns: 500 }
    );
  });
});
