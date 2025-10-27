/**
 * Calcula el dígito verificador de un RUT chileno
 * @param {string} rut - RUT sin dígito verificador (solo números)
 * @returns {string} - Dígito verificador (0-9 o K)
 */
export function calcularDigitoVerificador(rut) {
  // Limpiar el RUT de cualquier formato
  const rutLimpio = rut.replace(/[^0-9]/g, '');
  
  if (!rutLimpio || rutLimpio.length === 0) {
    return '';
  }

  let suma = 0;
  let multiplicador = 2;

  // Recorrer el RUT de derecha a izquierda
  for (let i = rutLimpio.length - 1; i >= 0; i--) {
    suma += parseInt(rutLimpio.charAt(i)) * multiplicador;
    multiplicador = multiplicador === 7 ? 2 : multiplicador + 1;
  }

  const resto = suma % 11;
  const dv = 11 - resto;

  if (dv === 11) return '0';
  if (dv === 10) return 'K';
  return dv.toString();
}

/**
 * Formatea un RUT chileno con puntos mientras se escribe (sin DV)
 * @param {string} rut - RUT sin formato
 * @returns {string} - RUT formateado solo con puntos (ej: 12.345.678)
 */
export function formatearRUT(rut) {
  // Limpiar el RUT de cualquier formato previo
  const rutLimpio = rut.replace(/[^0-9]/g, '');
  
  if (!rutLimpio || rutLimpio.length === 0) {
    return '';
  }

  // Formatear con puntos
  let rutFormateado = '';
  let contador = 0;

  // Agregar puntos de miles de derecha a izquierda
  for (let i = rutLimpio.length - 1; i >= 0; i--) {
    if (contador === 3) {
      rutFormateado = '.' + rutFormateado;
      contador = 0;
    }
    rutFormateado = rutLimpio.charAt(i) + rutFormateado;
    contador++;
  }

  return rutFormateado;
}

/**
 * Formatea un RUT completo con puntos y dígito verificador
 * @param {string} rut - RUT sin formato
 * @returns {string} - RUT formateado completo (ej: 12.345.678-9)
 */
export function formatearRUTCompleto(rut) {
  // Limpiar el RUT de cualquier formato previo
  const rutLimpio = rut.replace(/[^0-9]/g, '');
  
  if (!rutLimpio || rutLimpio.length === 0) {
    return '';
  }

  // Calcular DV
  const dv = calcularDigitoVerificador(rutLimpio);
  
  // Formatear con puntos
  let rutFormateado = '';
  let contador = 0;

  // Agregar puntos de miles de derecha a izquierda
  for (let i = rutLimpio.length - 1; i >= 0; i--) {
    if (contador === 3) {
      rutFormateado = '.' + rutFormateado;
      contador = 0;
    }
    rutFormateado = rutLimpio.charAt(i) + rutFormateado;
    contador++;
  }

  // Agregar el dígito verificador
  return rutFormateado + '-' + dv;
}

/**
 * Limpia un RUT de puntos y guión
 * @param {string} rut - RUT formateado
 * @returns {string} - RUT sin formato
 */
export function limpiarRUT(rut) {
  return rut.replace(/[^0-9kK]/g, '').toUpperCase();
}

/**
 * Valida si un RUT chileno es válido
 * @param {string} rut - RUT a validar
 * @returns {boolean} - true si es válido, false si no
 */
export function validarRUT(rut) {
  const rutLimpio = limpiarRUT(rut);
  
  if (rutLimpio.length < 2) {
    return false;
  }

  const rutNumeros = rutLimpio.slice(0, -1);
  const dv = rutLimpio.slice(-1);
  
  const dvCalculado = calcularDigitoVerificador(rutNumeros);
  
  return dv === dvCalculado;
}

