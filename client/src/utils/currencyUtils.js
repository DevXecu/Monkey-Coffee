/**
 * Utilidades para formatear moneda en pesos chilenos (CLP)
 */

/**
 * Formatea un número como moneda chilena (CLP)
 * @param {number} amount - Cantidad a formatear
 * @returns {string} - Cantidad formateada como moneda CLP con formato $XXX.XXX
 */
export function formatCurrency(amount) {
  if (!amount && amount !== 0) return "N/A";
  
  // Formatear número con puntos como separadores de miles
  const formattedNumber = new Intl.NumberFormat("es-CL", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
  
  // Agregar "$" al inicio
  return `$${formattedNumber}`;
}

/**
 * Formatea un número como moneda chilena con decimales opcionales
 * @param {number} amount - Cantidad a formatear
 * @param {number} decimals - Número de decimales (default: 0)
 * @returns {string} - Cantidad formateada como moneda CLP
 */
export function formatCurrencyWithDecimals(amount, decimals = 0) {
  if (!amount && amount !== 0) return "N/A";
  
  return new Intl.NumberFormat("es-CL", {
    style: "currency",
    currency: "CLP",
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(amount);
}

/**
 * Formatea un número como texto con separadores de miles (sin símbolo de moneda)
 * @param {number} amount - Cantidad a formatear
 * @returns {string} - Cantidad formateada con separadores
 */
export function formatNumber(amount) {
  if (!amount && amount !== 0) return "N/A";
  
  return new Intl.NumberFormat("es-CL").format(amount);
}

/**
 * Formatea un número como entero sin decimales (sin símbolo de moneda)
 * @param {number} amount - Cantidad a formatear
 * @returns {string} - Cantidad formateada como entero
 */
export function formatInteger(amount) {
  if (!amount && amount !== 0) return "N/A";
  
  // Redondear a entero y formatear
  const integerValue = Math.round(Number(amount));
  return new Intl.NumberFormat("es-CL", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(integerValue);
}

