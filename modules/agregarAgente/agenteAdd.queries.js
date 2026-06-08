//back/modules/agregarAgente/agenteAdd.queries.js
export const QUERY_PERSONA_BY_DOCUMENTO = `
  SELECT
    numero_documento,
    nombres,
    ape_paterno,
    ape_materno
  FROM resources.personas
  WHERE numero_documento = $1
  LIMIT 1
`


export const QUERY_USUARIO_EXISTE = `
  SELECT id_usuario
  FROM agent.usuarios
  WHERE usuario = $1
  LIMIT 1
`

export const INSERT_USUARIO = `
  INSERT INTO agent.usuarios
  (
    doc_num,
    nombre,
    usuario,
    fecha_registro,
    activo
  )
  VALUES ($1, $2, $3, NOW(), true)
  RETURNING id_usuario
`

export const UPDATE_USUARIO = `
  UPDATE agent.usuarios
  SET
    doc_num = $1,
    nombre = $2,
    fecha_modifica = NOW()
  WHERE id_usuario = $3
`

export const UPSERT_CREDENCIAL = `
  INSERT INTO agent.usuarios_credenciales
  (
    id_usuario,
    tipo,
    password_hash,
    password_updated_at
  )
  VALUES ($1, 'LOCAL', $2, NOW())
  ON CONFLICT (id_usuario)
  DO UPDATE SET
    password_hash = EXCLUDED.password_hash,
    password_updated_at = NOW()
`

export const INSERT_PLATAFORMA = `
  INSERT INTO agent.usuarios_plataformas
  (
    id_usuario,
    id_plataforma
  )
  VALUES ($1, $2)
`

export const UPSERT_HORARIO = `
  INSERT INTO agent.usuarios_horario
(
  
  hora_in,
  hora_out,
  id_usuario
)
VALUES ($1, $2, $3)
`

export const INSERT_CARTERIZACION = `
  INSERT INTO agent.usuarios_carterizacion
  (
    id_usuario,
    id_campana,
    tipo_campana,
    modulo_activo,
    fecha_registro,
    fecha_modifica
  )
  VALUES
  (
    $1,
    $2,
    1,
    true,
    NOW(),
    NOW()
  )

`
// funciones del supervisor para agregar agentes a cada campaña y editar horarios
export const QUERY_USUARIO_BY_DNI = `
  SELECT
    id_usuario
  FROM agent.usuarios
  WHERE doc_num = $1
  LIMIT 1
`
// este update no se usa
export const UPDATE_HORARIO = `
  UPDATE agent.usuarios_horario
  SET
    hora_in = $1,
    hora_out = $2,
    fecha_modifica = NOW()
  WHERE id_usuario = $3
`
// ======================================================
// UPDATE HORARIO AGENTE
// ======================================================

export const UPDATE_HORARIO_BY_USUARIO = `
  UPDATE agent.usuarios_horario
  SET
    hora_in = $1,
    hora_out = $2,
    fecha_modifica = NOW()
  WHERE id_usuario = $3
`

// ======================================================
// INSERTAR NUEVA CAMPAÑA
// ======================================================

export const INSERT_NUEVA_CAMPANA = `
  INSERT INTO agent.usuarios_carterizacion
  (
    id_usuario,
    id_campana,
    tipo_campana,
    modulo_activo,
    fecha_registro,
    fecha_modifica
  )
  VALUES
  (
    $1,
    $2,
    1,
    true,
    NOW(),
    NOW()
  )

`