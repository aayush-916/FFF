const express = require("express");
const { exec } = require("child_process");

const app = express();
app.use(express.json());

app.post("/webhook", (req, res) => {
  console.log("📩 Webhook received");

  exec("bash ~/deploy.sh", (err, stdout, stderr) => {
    if (err) {
      console.error("❌ Deploy error:", err);
      return;
    }
    console.log(stdout);
    console.error(stderr);
  });

  res.send("Deploy triggered");
});

app.listen(9000, () => {
  console.log("🚀 Webhook server running on port 9000");
});
