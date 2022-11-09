/** Server startup for BizTime. */

const app = require("./app");

app.listen(3001, function () {
  console.log("Listening on 3001");
});