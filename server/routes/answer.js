const express = require("express");
const Answer = require("../models/Answer");

const router = express.Router();

router.get("/:formId", async (req, res) => {
  const answers = await Answer.findAll({
    where: { formId: req.params.formId },
  });
  res.json(answers);
});

router.post("/:formId", async (req, res) => {
  const { question, answer } = req.body;
  if (!question || !answer)
    return res.status(400).json({ error: "question и answer обязательны" });

  const newAnswer = await Answer.create({
    formId: req.params.formId,
    question,
    answer,
  });
  res.status(201).json(newAnswer);
});

module.exports = router;
