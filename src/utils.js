const parseQueryParams = queryParams => {
  let params = {}
  
  try {
    if (queryParams) {
      params = queryParams && queryParams.split('&').reduce((obj, param) => {
        const splitParam = param.split('=');
        return { ... obj, [splitParam[0]]: splitParam[1].replace("%E2%82%AE", "₮") };
      }, params);
    }
  } finally {
    return params;
  }
}

module.exports = {
  parseQueryParams
}