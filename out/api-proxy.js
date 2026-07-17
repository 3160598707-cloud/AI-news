// 静态导出 API 代理 - 将 /api/xxx 请求自动转到 /api/xxx.json
(function() {
  var origFetch = window.fetch;
  window.fetch = function(url, options) {
    if (typeof url === 'string' && url.indexOf('/api/') === 0) {
      // 去掉可能的查询参数
      var q = url.indexOf('?');
      var path = q >= 0 ? url.substring(0, q) : url;
      // 已有 .json 后缀就不加
      if (!path.match(/\.json$/)) {
        url = path + '.json' + (q >= 0 ? url.substring(q) : '');
      }
      // POST 改 GET
      if (options && options.method === 'POST') {
        options = Object.assign({}, options, { method: 'GET' });
      }
    }
    return origFetch.call(window, url, options);
  };
})();
