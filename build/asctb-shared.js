
/**
  Get a list of key-value pairs nested within a Map.
  @param {Array} entry A [key, value] entry.
  @returns {Array<Array>|undefined} An array of key-value pairs, if the nested value is a Map object.

 **/
const getChildren = ([, value]) => value instanceof Map && Array.from(value);
/**
  Get the title of a D3.hierarchy node.
  @param {Object} node: A D3.hierarchy node or object with data property.
  @param {Array} node.data: The data property of the node.
  @returns {String} The title of the node.
**/
const getTitle = ({ data }) => data[0] ?? '';

/**
  Get the ASCT+B table rows for a D3.hierarchy node.
  @param {Object} node A D3.hierarchy node or object with data property.
  @param {Array} node.data The data property of the node.
  @returns {Generator} A generator that iterates through data objects corresponding to a node.
**/
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
  Indicates if a D3.hierarchy object represents an FTU or its component.
  @param {Object} node A D3.hierarchy node or object with data property.
  @param {Array} node.data The data property of the node.
  @returns {Boolean} A boolean indicating if the node is an FTU.
**/
function isFTUNode(node) {
  return [...dataAccessor(node)].every(data => !!data['FTU']);
}

/**
  Indicates if a D3.hierarchy object represents a cell type.
  @param {Object} node A D3.hierarchy node or object with data property.
  @param {Array} node.data The data property of the node.
  @returns {Boolean} A boolean indicating if the node represents a cell type.
**/
function isCellTypeNode(node) {
  const [key, value] = node.data;
  if (!Array.isArray(value)) return false;
  return key === dataAccessor(node).next().value['CT/1'];
}