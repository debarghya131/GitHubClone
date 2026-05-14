const mongoose = require("mongoose");
const Repository = require("../models/repoModel");
const User = require("../models/userModel");
const Issue = require("../models/issueModel");

async function createRepository(req, res) {
  const { owner, name, issues, content, description, visibility } = req.body;

  try {
    if (!name || !name.trim()) {
      return res.status(400).json({ error: "Repository name is required!" });
    }

    if (!mongoose.Types.ObjectId.isValid(owner)) {
      return res.status(400).json({ error: "Invalid User ID!" });
    }

    const user = await User.findById(owner);
    if (!user) {
      return res.status(404).json({ error: "Owner not found!" });
    }

    const newRepository = new Repository({
      name: name.trim(),
      description: description?.trim() || "",
      visibility: typeof visibility === "boolean" ? visibility : true,
      owner,
      content: Array.isArray(content) ? content : [],
      issues: Array.isArray(issues) ? issues : [],
    });

    const result = await newRepository.save();
    user.repositories.push(result._id);
    await user.save();

    res.status(201).json({
      message: "Repository created!",
      repository: result,
    });
  } catch (err) {
    console.error("Error during repository creation : ", err.message);
    if (err.code === 11000) {
      return res.status(400).json({ error: "Repository name already exists!" });
    }
    res.status(500).json({ error: "Server error" });
  }
}

async function getAllRepositories(req, res) {
  try {
    const repositories = await Repository.find({ visibility: true })
      .populate("owner")
      .populate("issues");

    res.json(repositories);
  } catch (err) {
    console.error("Error during fetching repositories : ", err.message);
    res.status(500).send("Server error");
  }
}

async function fetchRepositoryById(req, res) {
  const { id } = req.params;
  try {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: "Invalid repository ID!" });
    }

    const repository = await Repository.findById(id)
      .populate("owner")
      .populate("issues");

    if (!repository) {
      return res.status(404).json({ error: "Repository not found!" });
    }

    res.json(repository);
  } catch (err) {
    console.error("Error during fetching repository : ", err.message);
    res.status(500).send("Server error");
  }
}

async function fetchRepositoryByName(req, res) {
  const { name } = req.params;
  try {
    const repository = await Repository.findOne({ name })
      .populate("owner")
      .populate("issues");

    if (!repository) {
      return res.status(404).json({ error: "Repository not found!" });
    }

    res.json(repository);
  } catch (err) {
    console.error("Error during fetching repository : ", err.message);
    res.status(500).send("Server error");
  }
}

async function fetchRepositoriesForCurrentUser(req, res) {
  const { userID } = req.params;

  try {
    if (!mongoose.Types.ObjectId.isValid(userID)) {
      return res.status(400).json({ error: "Invalid User ID!" });
    }

    const repositories = await Repository.find({ owner: userID }).sort({
      createdAt: -1,
    });

    res.json({ message: "Repositories found!", repositories });
  } catch (err) {
    console.error("Error during fetching user repositories : ", err.message);
    res.status(500).send("Server error");
  }
}

async function updateRepositoryById(req, res) {
  const { id } = req.params;
  const { content, description, name } = req.body;

  try {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: "Invalid repository ID!" });
    }

    const repository = await Repository.findById(id);
    if (!repository) {
      return res.status(404).json({ error: "Repository not found!" });
    }

    if (typeof name === "string" && name.trim()) {
      repository.name = name.trim();
    }

    if (typeof description === "string") {
      repository.description = description.trim();
    }

    if (typeof content === "string" && content.trim()) {
      repository.content.push(content.trim());
    }

    await repository.save();
    const updatedRepository = await Repository.findById(id)
      .populate("owner")
      .populate("issues");

    res.json({
      message: "Repository updated successfully!",
      repository: updatedRepository,
    });
  } catch (err) {
    console.error("Error during updating repository : ", err.message);
    res.status(500).send("Server error");
  }
}

async function toggleVisibilityById(req, res) {
  const { id } = req.params;

  try {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: "Invalid repository ID!" });
    }

    const repository = await Repository.findById(id);
    if (!repository) {
      return res.status(404).json({ error: "Repository not found!" });
    }

    repository.visibility = !repository.visibility;

    await repository.save();
    const updatedRepository = await Repository.findById(id)
      .populate("owner")
      .populate("issues");

    res.json({
      message: "Repository visibility toggled successfully!",
      repository: updatedRepository,
    });
  } catch (err) {
    console.error("Error during toggling visibility : ", err.message);
    res.status(500).send("Server error");
  }
}

async function deleteRepositoryById(req, res) {
  const { id } = req.params;
  try {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: "Invalid repository ID!" });
    }

    const repository = await Repository.findByIdAndDelete(id);
    if (!repository) {
      return res.status(404).json({ error: "Repository not found!" });
    }

    await User.findByIdAndUpdate(repository.owner, {
      $pull: { repositories: repository._id, starRepos: repository._id },
    });
    await Issue.deleteMany({ repository: repository._id });

    res.json({ message: "Repository deleted successfully!" });
  } catch (err) {
    console.error("Error during deleting repository : ", err.message);
    res.status(500).send("Server error");
  }
}

module.exports = {
  createRepository,
  getAllRepositories,
  fetchRepositoryById,
  fetchRepositoryByName,
  fetchRepositoriesForCurrentUser,
  updateRepositoryById,
  toggleVisibilityById,
  deleteRepositoryById,
};
