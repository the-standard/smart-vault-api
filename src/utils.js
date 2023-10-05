const parseQueryParams = queryParams => {
  let params = {}
  
  if (queryParams) {
    params = queryParams && queryParams.split('&').reduce((obj, param) => {
      const splitParam = param.split('=');
      return { ... obj, [splitParam[0]]: splitParam[1] }
    }, params);
  }

  return params;
}

module.exports = {
  parseQueryParams
}