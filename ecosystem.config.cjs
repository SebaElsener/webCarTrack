
module.exports = {
    apps : [{
      name   : "cluster8080",
      script : "./src/server.js",
      args   : "-p 8080 -m CLUSTER"
    },{
      name   : "cluster8082",
      script : "./src/server.js",
      args   : "-p 8082 -m CLUSTER"
    },{
      name   : "cluster8083",
      script : "./src/server.js",
      args   : "-p 8083 -m CLUSTER"
    },{
      name   : "cluster8084",
      script : "./src/server.js",
      args   : "-p 8084 -m CLUSTER"
    },{
      name   : "cluster8085",
      script : "./src/server.js",
      args   : "-p 8085 -m CLUSTER"
    }]
  }