//back/modules/landingInterno/landing.queries.js
// ======================================================
// INSERT LEAD
// ======================================================

export const INSERT_LEAD_CAMPANIA = `
  INSERT INTO core.leads_campania (
    nombre_completo,
    dni,
    numero_telefono,
    email,
    provincia,
    comentario,
    inicampania,
    campania,
    producto,
    id_tipobase,
    idusuario,
    permitellamada,
    politica,
    -- valores predefinidos
    origen,
    plataforma,
    alias,
    --
    idcampania,
    idkeyunico,
    id_anuncio,
    fcreacion,
    fecha_creacion,
    fecha_liquidacion

  )
  VALUES (

    -- CLIENTE
    $1,   -- nombre_completo
    $2,   -- dni
    $3,   -- telefono
    $4,   -- email
    $5,   -- provincia
    $6,   -- comentario

    -- CAMPAÑA
    $7,   -- inicampania
    $8,   -- campania_name
    $9,   -- producto

    -- BASE
    $10,  -- id_tipobase

    -- USUARIO
    $11,  -- idusuario

    -- FLAGS
    $12,  -- permitellamada
    1,    -- politica

    -- ESTATICOS
    'RRSS',               -- origen
    'Landing Interno',   -- plataforma
    'FORMULARIO INTERNO',-- alias

    -- IDS
    0,     -- idcampania
    $13,   -- idkeyunico
    $14,   -- id_anuncio

    -- FECHAS
    NOW(), -- fcreacion
    NOW(), -- fecha_creacion
    NOW()  -- fecha_liquidacion

  )
  RETURNING *;
`

// ======================================================
// OBTENER DATOS DE CAMPAÑA
// ======================================================

export const GET_CAMPANIA_INFO = `
  SELECT DISTINCT
    ci.id_camp AS idcamp,
    ci.ini_campania AS inicampania,
    ci.campania_name AS campania_name,
    ci.producto AS producto
  FROM core.campanas_ini ci
  WHERE ci.id_camp = $1
  ORDER BY ci.ini_campania ASC, ci.producto ASC;
`
// ======================================================
// OBTENER TIPOS BASE POR CAMPAÑA
// ======================================================

export const GET_TIPOS_BASE_BY_CAMPANIA = `
  SELECT
    p."IdCamp",
    p.id_tipobase,
    p."Activo",
    t.medio,
    t.segmento,
    t.des_tipobase
  FROM core.tbc_tipobase_digital_prioridad p
  INNER JOIN core.tbc_tipobase_digital t
    ON t.id_tipobase = p.id_tipobase
  WHERE p."IdCamp" = $1
    AND p."Activo" = 1
  ORDER BY t.id_tipobase ASC;
`


// ======================================================
// OBTENER UN TIPO BASE ESPECIFICO
// ======================================================

export const GET_TIPO_BASE_BY_ID = `
  SELECT
    p."IdCamp",
    p.id_tipobase,
    t.medio,
    t.segmento,
    t.des_tipobase
  FROM core.tbc_tipobase_digital_prioridad p
  INNER JOIN core.tbc_tipobase_digital t
    ON t.id_tipobase = p.id_tipobase
  WHERE p."IdCamp" = $1
    AND p.id_tipobase = $2
    AND p."Activo" = 1
  LIMIT 1;
`
// ======================================================
// OBTENER INFO CAMPAÑA POR IDCAMP
// ======================================================

export const GET_CAMPANIA_BY_ID = `
  SELECT
    ci.id_camp AS Idcamp,
    ci.ini_campania AS IniCampania,
    ci.campania_name AS campania_name,
    ci.producto AS producto
  FROM core.campanas_ini ci
  WHERE ci.id_camp = $1
  LIMIT 1;
`;
// ======================================================
// OBTENER TELEFONO POR IDKEY
// ======================================================

export const GET_TELEFONO_BY_IDKEY = `
  SELECT
    lc.idkey,
    lc.numero_telefono
  FROM core.leads_campania lc
  WHERE lc.idkey = $1
  LIMIT 1;
`;
