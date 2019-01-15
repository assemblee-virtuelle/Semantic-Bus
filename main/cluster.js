var recluster = require("recluster");
var path = require("path");
//var numCPUs = require("os").cpus().length;
// for (var i=0; i<numCPUs; i++){
//
// }

var cluster = recluster(path.join(__dirname, "app.js"), {
  /* Options */
});

cluster.run();

process.on("SIGUSR2", function() {
  console.log("Signal SIGUSR2 reçu, Rechargement du cluster ...");
  cluster.reload();
});

console.log("Cluster démarré, Utilisez la commande 'kill -s SIGUSR2 " + process.pid + "' pour le recharger.");
