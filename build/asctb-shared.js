
/**
 * Get a list of key-value pairs nested within a Map.
 * @param {Array} entry A [key, value] entry.
 * @returns {Array<Array> | undefined} An array of key-value pairs, if the nested value is a Map object.
 */
const getChildren = ([, value]) => value instanceof Map && Array.from(value);
/**
 * Get the title of a D3.hierarchy node.
 * @param {object} node: A D3.hierarchy node or object with data property.
 * @param {Array} node.data: The data property of the node.
 * @returns {string} The title of the node.
 */
const getTitle = ({ data }) => data[0] ?? '';

/**
 * Get the ASCT+B table rows for a D3.hierarchy node.
 * @generator
 * @param {object} node A D3.hierarchy node or object with data property.
 * @param {Array} node.data The data property of the node.
 * @yields {object} A CSV data row corresponding to the node.
*/
function* dataAccessor({ data }) {
  if (!Array.isArray(data)) return {};
  const [, value] = data;
  if (value instanceof Map) {
    for (const data of value.entries()) {
      yield* dataAccessor({ data });
    }
  } else if (Array.isArray(value)) {
    for (const row of value) {
      yield row;
    }
  }
  return {};
}

/**
 * Indicates if a D3.hierarchy object represents an FTU or its component.
 * @param {object} node A D3.hierarchy node or object with data property
 * @returns {boolean} A boolean indicating if the node is an FTU. 
 */
function isFTUNode(node) {
  return [...dataAccessor(node)].every(data => !!data['FTU/1']);
}

/**
 * Indicates if a D3.hierarchy object represents a cell type.
 * @param {object} node A D3.hierarchy node or object with data property.
 * @returns {boolean} A boolean indicating if the node represents a cell type.
**/
function isCellTypeNode(node) {
  const [groupKey, value] = node.data;
  if (!Array.isArray(value)) return false;
  const data = dataAccessor(node).next().value;
  return Object.keys(data)
    // Filter all CT columns
    .filter(k => /CT\/[0-9]+/.test(k))
    // Check if grouping key matches any CT column
    .some(k => groupKey === data[k]);
}