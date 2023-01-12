export const cloneObject = (obj) =>
  !isEmptyObject(obj) ? Object.assign(Array.isArray(obj) ? [] : {}, obj) : obj;

export const isEmptyObject = (obj) => {
  let is_empty = true;
  if (obj && obj instanceof Object) {
    Object.keys(obj).forEach((key) => {
      if (Object.prototype.hasOwnProperty.call(obj, key)) is_empty = false;
    });
  }
  return is_empty;
};

export const getPropertyValue = (obj, k) => {
  let keys = k;
  if (!Array.isArray(keys)) keys = [keys];
  if (!isEmptyObject(obj) && keys[0] in obj && keys && keys.length > 1) {
    return getPropertyValue(obj[keys[0]], keys.slice(1));
  }
  // else return clone of object to avoid overwriting data
  return obj ? cloneObject(obj[keys[0]]) : undefined;
};

export const isEmptyValue = (data) => {
  let is_empty_data = false;
  if (Array.isArray(data)) {
    if (!data.length) {
      is_empty_data = true;
    }
  } else if (typeof response_data === "object") {
    if (!Object.keys(data).length) {
      is_empty_data = true;
    }
  }
  return is_empty_data;
};
