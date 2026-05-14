import React, { useCallback, useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import Navbar from "../Navbar";
import { API_BASE_URL } from "../../config/api";
import "./repositoryDetails.css";

const RepositoryDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const currentUserId = localStorage.getItem("userId");
  const [repository, setRepository] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [issueSaving, setIssueSaving] = useState(false);
  const [error, setError] = useState("");
  const [editorState, setEditorState] = useState({
    name: "",
    description: "",
    content: "",
  });
  const [issueForm, setIssueForm] = useState({
    title: "",
    description: "",
  });

  const isOwner = repository?.owner?._id === currentUserId;

  const syncEditorState = (repo) => {
    setEditorState({
      name: repo?.name || "",
      description: repo?.description || "",
      content: "",
    });
  };

  const fetchRepository = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE_URL}/repo/${id}`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Unable to fetch repository");
      }

      setRepository(data);
      syncEditorState(data);
      setError("");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchRepository();
  }, [fetchRepository]);

  const handleRepositorySave = async (event) => {
    event.preventDefault();

    try {
      setSaving(true);
      const response = await fetch(`${API_BASE_URL}/repo/update/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(editorState),
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Unable to save repository");
      }

      setRepository(data.repository);
      syncEditorState(data.repository);
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleVisibilityToggle = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/repo/toggle/${id}`, {
        method: "PATCH",
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Unable to update visibility");
      }

      setRepository(data.repository);
      syncEditorState(data.repository);
    } catch (err) {
      setError(err.message);
    }
  };

  const handleDeleteRepository = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/repo/delete/${id}`, {
        method: "DELETE",
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Unable to delete repository");
      }

      navigate("/");
    } catch (err) {
      setError(err.message);
    }
  };

  const handleIssueSubmit = async (event) => {
    event.preventDefault();

    try {
      setIssueSaving(true);
      const response = await fetch(`${API_BASE_URL}/issue/create`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          repository: id,
          title: issueForm.title.trim(),
          description: issueForm.description.trim(),
        }),
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Unable to create issue");
      }

      setIssueForm({ title: "", description: "" });
      await fetchRepository();
    } catch (err) {
      setError(err.message);
    } finally {
      setIssueSaving(false);
    }
  };

  const handleIssueStatusToggle = async (issue) => {
    try {
      const response = await fetch(`${API_BASE_URL}/issue/update/${issue._id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title: issue.title,
          description: issue.description,
          status: issue.status === "open" ? "closed" : "open",
        }),
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Unable to update issue");
      }

      setRepository((currentRepository) => ({
        ...currentRepository,
        issues: currentRepository.issues.map((currentIssue) =>
          currentIssue._id === issue._id ? data.issue : currentIssue
        ),
      }));
    } catch (err) {
      setError(err.message);
    }
  };

  const handleIssueDelete = async (issueId) => {
    try {
      const response = await fetch(`${API_BASE_URL}/issue/delete/${issueId}`, {
        method: "DELETE",
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Unable to delete issue");
      }

      setRepository((currentRepository) => ({
        ...currentRepository,
        issues: currentRepository.issues.filter((issue) => issue._id !== issueId),
      }));
    } catch (err) {
      setError(err.message);
    }
  };

  if (loading) {
    return (
      <>
        <Navbar />
        <main className="repo-details-page">
          <p className="repo-banner">Loading repository...</p>
        </main>
      </>
    );
  }

  if (error && !repository) {
    return (
      <>
        <Navbar />
        <main className="repo-details-page">
          <div className="repo-banner repo-error">
            <p>{error}</p>
            <Link className="repo-link" to="/">
              Back to dashboard
            </Link>
          </div>
        </main>
      </>
    );
  }

  return (
    <>
      <Navbar />
      <main className="repo-details-page">
        <section className="repo-header-card">
          <div>
            <p className="repo-owner">
              {repository.owner?.username || "Unknown owner"} / {repository.name}
            </p>
            <h1>{repository.name}</h1>
            <p className="repo-subtitle">
              {repository.description || "No description provided yet."}
            </p>
          </div>

          <div className="repo-meta">
            <span className={repository.visibility ? "repo-badge" : "repo-badge muted"}>
              {repository.visibility ? "Public" : "Private"}
            </span>
            <span className="repo-badge muted">
              {repository.issues?.length || 0} issues
            </span>
            <span className="repo-badge muted">
              {repository.content?.length || 0} updates
            </span>
          </div>
        </section>

        {error && <p className="repo-banner repo-error">{error}</p>}

        <section className="repo-grid">
          <div className="repo-column">
            <section className="repo-panel">
              <div className="panel-heading">
                <h2>Repository Details</h2>
                {isOwner && (
                  <button
                    className="secondary-button"
                    type="button"
                    onClick={handleVisibilityToggle}
                  >
                    Make {repository.visibility ? "Private" : "Public"}
                  </button>
                )}
              </div>

              {isOwner ? (
                <form className="repo-form" onSubmit={handleRepositorySave}>
                  <label htmlFor="repo-edit-name">Name</label>
                  <input
                    id="repo-edit-name"
                    type="text"
                    value={editorState.name}
                    onChange={(event) =>
                      setEditorState((current) => ({
                        ...current,
                        name: event.target.value,
                      }))
                    }
                  />

                  <label htmlFor="repo-edit-description">Description</label>
                  <textarea
                    id="repo-edit-description"
                    rows="4"
                    value={editorState.description}
                    onChange={(event) =>
                      setEditorState((current) => ({
                        ...current,
                        description: event.target.value,
                      }))
                    }
                  />

                  <label htmlFor="repo-update-content">Add project update</label>
                  <textarea
                    id="repo-update-content"
                    rows="3"
                    placeholder="Document progress, release notes, or next steps."
                    value={editorState.content}
                    onChange={(event) =>
                      setEditorState((current) => ({
                        ...current,
                        content: event.target.value,
                      }))
                    }
                  />

                  <div className="repo-actions">
                    <button className="primary-button" disabled={saving} type="submit">
                      {saving ? "Saving..." : "Save changes"}
                    </button>
                    <button
                      className="danger-button"
                      type="button"
                      onClick={handleDeleteRepository}
                    >
                      Delete repository
                    </button>
                  </div>
                </form>
              ) : (
                <p className="repo-note">
                  This repository belongs to {repository.owner?.username || "another user"}.
                </p>
              )}
            </section>

            <section className="repo-panel">
              <div className="panel-heading">
                <h2>Project Updates</h2>
              </div>
              {!repository.content?.length ? (
                <p className="repo-note">No updates have been added yet.</p>
              ) : (
                <div className="content-list">
                  {repository.content.map((entry, index) => (
                    <article className="content-card" key={`${entry}-${index}`}>
                      <span>Update {index + 1}</span>
                      <p>{entry}</p>
                    </article>
                  ))}
                </div>
              )}
            </section>
          </div>

          <div className="repo-column">
            <section className="repo-panel">
              <div className="panel-heading">
                <h2>Issues</h2>
              </div>

              {isOwner && (
                <form className="repo-form issue-form" onSubmit={handleIssueSubmit}>
                  <label htmlFor="issue-title">Title</label>
                  <input
                    id="issue-title"
                    type="text"
                    value={issueForm.title}
                    onChange={(event) =>
                      setIssueForm((current) => ({
                        ...current,
                        title: event.target.value,
                      }))
                    }
                  />

                  <label htmlFor="issue-description">Description</label>
                  <textarea
                    id="issue-description"
                    rows="3"
                    value={issueForm.description}
                    onChange={(event) =>
                      setIssueForm((current) => ({
                        ...current,
                        description: event.target.value,
                      }))
                    }
                  />

                  <button
                    className="primary-button"
                    disabled={
                      issueSaving ||
                      !issueForm.title.trim() ||
                      !issueForm.description.trim()
                    }
                    type="submit"
                  >
                    {issueSaving ? "Creating..." : "Create issue"}
                  </button>
                </form>
              )}

              {!repository.issues?.length ? (
                <p className="repo-note">No issues yet.</p>
              ) : (
                <div className="issue-list">
                  {repository.issues.map((issue) => (
                    <article className="issue-card" key={issue._id}>
                      <div className="issue-header">
                        <h3>{issue.title}</h3>
                        <span
                          className={
                            issue.status === "open"
                              ? "issue-status open"
                              : "issue-status closed"
                          }
                        >
                          {issue.status}
                        </span>
                      </div>
                      <p>{issue.description}</p>
                      {isOwner && (
                        <div className="repo-actions">
                          <button
                            className="secondary-button"
                            type="button"
                            onClick={() => handleIssueStatusToggle(issue)}
                          >
                            Mark as {issue.status === "open" ? "closed" : "open"}
                          </button>
                          <button
                            className="danger-button"
                            type="button"
                            onClick={() => handleIssueDelete(issue._id)}
                          >
                            Delete issue
                          </button>
                        </div>
                      )}
                    </article>
                  ))}
                </div>
              )}
            </section>
          </div>
        </section>
      </main>
    </>
  );
};

export default RepositoryDetails;
