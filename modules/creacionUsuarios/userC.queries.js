//back/modules/creacionUsuarios/userC.queries.js
export const QUERY_BUSCAR_DNI = `
  SELECT TOP 1
    dni_int AS dni,
    nombres,
    ap_pat,
    ap_mat
  FROM reniec
  WHERE dni_int = @dni
`;
export const QUERY_OBTENER_DETALLE = `
  SELECT
    dni_int AS dni,
    nombres,
    ap_pat,
    ap_mat,

    CONVERT(VARCHAR, fecha_nac, 103) AS fecha_nacimiento,

    DATEDIFF(YEAR, fecha_nac, GETDATE()) -
      CASE
        WHEN MONTH(fecha_nac) > MONTH(GETDATE())
          OR (
            MONTH(fecha_nac) = MONTH(GETDATE())
            AND DAY(fecha_nac) > DAY(GETDATE())
          )
        THEN 1
        ELSE 0
      END AS edad,

    direccion,
    cadena,
    madre,
    padre

  FROM reniec
  WHERE dni_int = @dni
`;

export const INSERT_PERSONA = `
  INSERT INTO resources.personas (
    tipo_documento,
    numero_documento,
    nombres,
    ape_paterno,
    ape_materno,
    fecha_nacimiento,
    sexo,
    direccion,
    estado,
    fecha_registro
  )
  VALUES (
    $1,
    $2,
    $3,
    $4,
    $5,
    $6,
    $7,
    $8,
    $9,
    NOW()
  )
  RETURNING *
`