class Rest {
  constructor(private baseUrl: string) {}

  static encodeQueryString(data) {
    var ret = [];
    for (var d in data) {
      ret.push(encodeURIComponent(d) + "=" + encodeURIComponent(data[d]));
    }
    return ret.join("&");
  }

  public call<T>(
    methode: string,
    url: string,
    queryString?: { [key: string]: any },
    data?: { [key: string]: any }
  ) {
    var deferred = Q.defer<T>();
    var request = new XMLHttpRequest();
    request.open(
      methode,
      this.baseUrl + url + "?" + Rest.encodeQueryString(queryString)
    );
    request.onload = function() {
      var response: any;
      try {
        response = JSON.parse(request.response);
      } catch (e) {
        response = request.response;
      }
      if (request.status < 200 || request.status >= 300) {
        deferred.reject(response.error.message);
      } else {
        deferred.resolve(response);
      }
    };
    if (data == null) {
      request.send();
    } else {
      request.setRequestHeader("Content-Type", "application/json");
      request.send(JSON.stringify(data));
    }
    return deferred.promise;
  }
}
