export const ESTADOS_PARTIDA = {
  EN_ESPERA: 'en_espera',
  EN_JUEGO: 'en_juego',
  FINALIZADA: 'finalizada'
};

export const ESTADOS_PARTIDA_LABELS = {
  [ESTADOS_PARTIDA.EN_ESPERA]: 'En Espera',
  [ESTADOS_PARTIDA.EN_JUEGO]: 'En Juego',
  [ESTADOS_PARTIDA.FINALIZADA]: 'Finalizada'
};

export const ROLES_USUARIO = {
  USER: 'user',
  ADMIN: 'admin'
};

export const MATRIZ_ADYACENCIA = {
    // Lo Contador
    1: [4,5,7],
    // Oriente
    2: [14,21],
    // San Joaquín
    3: [6,10,13,15,16,17,19,20,23],
    6: [3,10,13,15,19],
    10: [3,6,13,15,20],
    13: [3,6,10,15,20],
    15: [3,6,10,13,20],
    16: [17,23],
    17: [16,23],
    19: [3,6],
    20: [3,10,13,15],
    23: [16,17],
    // Casa Central
    4: [1,5,7,11,12,14,21,22],
    5: [1,4,7,12],
    7: [1,4,5,12],
    11: [4,12,14,21],
    12: [4,5,7,11,14,22],
    14: [2,4,11,12,21],
    21: [2,4,11,14],
    22: [4,12],
    // Villarrica
    8: [9,18],
    9: [8,18],
    18: [8,9],
  };