const mongoose = require("mongoose");
const Issue = require("../models/issueModel");
const Repository = require("../models/repoModel");

async function createIssue(req, res) {
  const { title, description, repository } = req.body;

  try {
    if (!title || !description || !repository) {
      return res.status(400).json({ error: "All fields are required!" });
    }

    if (!mongoose.Types.ObjectId.isValid(repository)) {
      return res.status(400).json({ error: "Invalid repository ID!" });
    }

    const existingRepository = await Repository.findById(repository);
    if (!existingRepository) {
      return res.status(404).json({ error: "Repository not found!" });
    }

    const issue = new Issue({
      title: title.trim(),
      description: description.trim(),
      repository,
    });

    await issue.save();
    existingRepository.issues.push(issue._id);
    await existingRepository.save();

    res.status(201).json({ message: "Issue created", issue });
  } catch (err) {
    console.error("Error during issue creation : ", err.message);
    res.status(500).send("Server error");
  }
}

async function updateIssueById(req, res) {
  const { id } = req.params;
  const { title, description, status } = req.body;
  try {
    const issue = await Issue.findById(id);

    if (!issue) {
      return res.status(404).json({ error: "Issue not found!" });
    }

    if (title) issue.title = title;
    if (description) issue.description = description;
    if (status) issue.status = status;

    await issue.save();

    res.json({ message: "Issue updated", issue });
  } catch (err) {
    console.error("Error during issue updation : ", err.message);
    res.status(500).send("Server error");
  }
}

async function deleteIssueById(req, res) {
  const { id } = req.params;

  try {
    const issue = await Issue.findByIdAndDelete(id);

    if (!issue) {
      return res.status(404).json({ error: "Issue not found!" });
    }

    await Repository.findByIdAndUpdate(issue.repository, {
      $pull: { issues: issue._id },
    });
    res.json({ message: "Issue deleted" });
  } catch (err) {
    console.error("Error during issue deletion : ", err.message);
    res.status(500).send("Server error");
  }
}

async function getAllIssues(req, res) {
  const { repository } = req.query;

  try {
    const filter = repository ? { repository } : {};
    const issues = await Issue.find(filter);
    res.status(200).json(issues);
  } catch (err) {
    console.error("Error during issue fetching : ", err.message);
    res.status(500).send("Server error");
  }
}

async function getIssueById(req, res) {
  const { id } = req.params;
  try {
    const issue = await Issue.findById(id);

    if (!issue) {
      return res.status(404).json({ error: "Issue not found!" });
    }

    res.json(issue);
  } catch (err) {
    console.error("Error during issue updation : ", err.message);
    res.status(500).send("Server error");
  }
}

module.exports = {
  createIssue,
  updateIssueById,
  deleteIssueById,
  getAllIssues,
  getIssueById,
};
