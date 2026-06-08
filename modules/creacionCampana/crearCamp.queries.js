//back/modules/creacionCampana/crearCamp.queries.js


// ======================================================
// GET IDS
// ======================================================

export const GET_LAST_ID_VISTA_ADMIN = `
  SELECT COALESCE(MAX(id_vista), 0) AS last_id
  FROM admin.campanas;
`;

// ======================================================
// VALIDACIONES
// ======================================================

export const VALIDATE_CAMPANIA_EXISTS = `
  SELECT 1
  FROM admin.campanas
  WHERE LOWER(nombre) = LOWER($1)
  LIMIT 1;
`;

export const VALIDATE_ID_EXISTS = `
  SELECT 1
  FROM admin.campanas
  WHERE id_camp = $1
  LIMIT 1;
`;

export const GET_CAMPANIA_ADMIN = `
  SELECT *
  FROM admin.campanas
  WHERE id_camp = $1
  LIMIT 1;
`;

export const GET_CAMPANIA_AGENT = `
  SELECT *
  FROM agent.campanas
  WHERE id_campana = $1
  LIMIT 1;
`;

export const GET_CAMPANIA_CORE = `
  SELECT *
  FROM core.campanas
  WHERE id_campana = $1
  LIMIT 1;
`;

export const GET_CAMPANIA_CORE_INI = `
  SELECT *
  FROM core.campanas_ini
  WHERE id_camp = $1
  ORDER BY id_orden ASC;
`;

export const GET_CONTROL_MODULOS = `
  SELECT *
  FROM admin.control_de_modulos
  WHERE id_camp = $1
  ORDER BY id_modulo ASC;
`;

// ======================================================
// INSERTS
// ======================================================

export const INSERT_ADMIN_CAMPANA = `
  INSERT INTO admin.campanas (
    id_camp,
    nombre,
    activa,
    id_vista
  )
  VALUES ($1, $2, $3, $4);
`;

export const INSERT_AGENT_CAMPANA = `
  INSERT INTO agent.campanas (
    id_campana,
    nombre,
    activa,
    id_vista
  )
  VALUES ($1, $2, $3, $4);
`;

export const INSERT_CONTROL_MODULOS = `
  INSERT INTO admin.control_de_modulos (
    id_camp,
    id_modulo,
    modulo_activo
  )
  VALUES ($1, $2, $3);
`;

export const INSERT_CORE_CAMPANA = `
  INSERT INTO core.campanas (
    id_campana,
    nombre,
    activa,
    fecha_creacion
  )
  VALUES ($1, $2, $3, NOW());
`;

export const INSERT_CORE_CAMPANA_INI = `
  INSERT INTO core.campanas_ini (
    id_camp,
    ini_campania,
    producto,
    campania_name
  )
  VALUES ($1, $2, $3, $4);
`;

// ======================================================
// DELETES
// ======================================================

export const DELETE_CONTROL_MODULOS = `
  DELETE FROM admin.control_de_modulos
  WHERE id_camp = $1;
`;

export const DELETE_ADMIN_CAMPANA = `
  DELETE FROM admin.campanas
  WHERE id_camp = $1;
`;

export const DELETE_AGENT_CAMPANA = `
  DELETE FROM agent.campanas
  WHERE id_campana = $1;
`;

export const DELETE_CORE_CAMPANIA_INI = `
  DELETE FROM core.campanas_ini
  WHERE id_camp = $1;
`;

export const DELETE_CORE_CAMPANIA = `
  DELETE FROM core.campanas
  WHERE id_campana = $1;
`;
export const GET_ALL_CAMPANIAS_ADMIN = `
  SELECT *
  FROM admin.campanas
  ORDER BY id_camp ASC;
`;
 // apartado de edicion: 
 export const INSERT_NEW_INI_CAMPANIA = `
  INSERT INTO core.campanas_ini (
    id_camp,
    ini_campania,
    producto,
    campania_name
  )
  VALUES ($1, $2, $3, $4)
  RETURNING *;
`;
export const UPDATE_ADMIN_CAMPANA = `
  UPDATE admin.campanas
  SET
    nombre = $2,
    activa = $3
  WHERE id_camp = $1
  RETURNING *;
`;
export const UPDATE_AGENT_CAMPANA = `
  UPDATE agent.campanas
  SET
    nombre = $2,
    activa = $3
  WHERE id_campana = $1
  RETURNING *;
`;
export const UPDATE_CORE_CAMPANA = `
  UPDATE core.campanas
  SET
    nombre = $2,
    activa = $3
  WHERE id_campana = $1
  RETURNING *;
`;
export const UPDATE_CORE_CAMPANIA_INI = `
  UPDATE core.campanas_ini
  SET
    ini_campania = $2,
    producto = $3,
    campania_name = $4
  WHERE id_orden = $1
  RETURNING *;
`; 
//para nuevos archivos
export const DELETE_ONE_INI = `
  DELETE FROM core.campanas_ini
  WHERE id_orden = $1;
`;