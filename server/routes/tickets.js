const express = require("express");
const router = express.Router();
const { Dropbox } = require("dropbox");
require("dotenv").config();
// const fetch = require("node-fetch");

router.post("/upload", async (req, res) => {
  const ticket = req.body;

  if (!ticket || !ticket.reported_by) {
    return res.status(400).json({ error: "Missing fields" });
  }

  // dynamic import для ESM модуля
  const fetchModule = await import("node-fetch");
  const fetch = fetchModule.default;

  const dbx = new Dropbox({
    accessToken: process.env.DROPBOX_TOKEN,
    fetch: fetch,
  });

  const fileName = `ticket_${Date.now()}.json`;
  const path = `/support-tickets/${fileName}`;

  try {
    await dbx.filesUpload({
      path,
      contents: JSON.stringify(ticket, null, 2),
      mode: { ".tag": "add" },
    });

    return res.status(200).json({ status: "success", path });
  } catch (error) {
    console.error("Dropbox error:", error);
    return res.status(500).json({ error: "Upload failed" });
  }
});

module.exports = router;
