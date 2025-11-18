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

  // Reglas para el dígito verificador del RUT chileno:
  // - Si el resultado (dv) es entre 1 y 9, ese es el dígito verificador
  // - Si el resultado (dv) es 10, se usa la letra "K"
  // - Si el resultado (dv) es 11, el dígito verificador es "0"
  
  if (dv === 11) return '0';  // Cuando resto = 0
  if (dv === 10) return 'K';  // Cuando resto = 1
  return dv.toString();        // Cuando dv está entre 1 y 9 (resto entre 2 y 10)
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

/**
 * Formatea un RUT para mostrar (xx.xxx.xxx-x)
 * Acepta RUTs con o sin formato, con o sin dígito verificador
 * @param {string} rut - RUT a formatear (puede venir con o sin formato)
 * @returns {string} - RUT formateado como xx.xxx.xxx-x
 */
export function formatearRUTParaMostrar(rut) {
  if (!rut) return '';
  
  // Limpiar el RUT de cualquier formato previo
  const rutLimpio = rut.replace(/[^0-9kK]/g, '');
  
  if (!rutLimpio || rutLimpio.length === 0) {
    return '';
  }
  
  let rutNumeros, dv;
  
  // Si el RUT tiene 9 caracteres, asumir formato estándar: 8 números + 1 DV
  if (rutLimpio.length === 9) {
    rutNumeros = rutLimpio.slice(0, 8);
    dv = rutLimpio.slice(8, 9).toUpperCase();
    
    // Validar que el DV sea correcto
    const dvCalculado = calcularDigitoVerificador(rutNumeros);
    if (dv !== dvCalculado) {
      // Si el DV no coincide, usar el calculado (el de la BD podría estar mal)
      dv = dvCalculado;
    }
  } 
  // Si el RUT tiene más de 9 caracteres, tomar solo los primeros 8 como números y el 9º como DV
  else if (rutLimpio.length > 9) {
    rutNumeros = rutLimpio.slice(0, 8);
    dv = rutLimpio.slice(8, 9).toUpperCase();
    
    // Validar y corregir el DV si es necesario
    const dvCalculado = calcularDigitoVerificador(rutNumeros);
    if (dv !== dvCalculado) {
      dv = dvCalculado;
    }
  }
  // Si el RUT tiene entre 2 y 8 caracteres, separar números del DV
  else if (rutLimpio.length >= 2) {
    rutNumeros = rutLimpio.slice(0, -1);
    dv = rutLimpio.slice(-1).toUpperCase();
    
    // Validar que el DV sea correcto
    const dvCalculado = calcularDigitoVerificador(rutNumeros);
    if (dv !== dvCalculado) {
      // Si el DV no coincide, usar el calculado
      dv = dvCalculado;
    }
  } 
  // RUT muy corto (menos de 2 caracteres), calcular DV
  else {
    rutNumeros = rutLimpio;
    dv = calcularDigitoVerificador(rutNumeros);
  }
  
  // Formatear números con puntos
  let rutFormateado = '';
  let contador = 0;
  
  // Agregar puntos de miles de derecha a izquierda
  for (let i = rutNumeros.length - 1; i >= 0; i--) {
    if (contador === 3) {
      rutFormateado = '.' + rutFormateado;
      contador = 0;
    }
    rutFormateado = rutNumeros.charAt(i) + rutFormateado;
    contador++;
  }
  
  // Retornar con formato xx.xxx.xxx-x
  return rutFormateado + '-' + dv;
}

