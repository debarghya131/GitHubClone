import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../Navbar";
import { API_BASE_URL } from "../../config/api";
import "./createRepository.css";

const CreateRepository = () => {
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [visibility, setVisibility] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");

    const owner = localStorage.getItem("userId");
    if (!owner) {
      navigate("/auth");
      return;
    }

    try {
      setLoading(true);
      const response = await fetch(`${API_BASE_URL}/repo/create`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          owner,
          name: name.trim(),
          description: description.trim(),
          visibility,
          content: [],
          issues: [],
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Unable to create repository");
      }

      navigate(`/repo/${data.repository._id}`);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Navbar />
      <main className="create-repo-page">
        <form className="create-repo-form" onSubmit={handleSubmit}>
          <h1>Create a new repository</h1>

          <label htmlFor="repo-name">Repository name</label>
          <input
            id="repo-name"
            required
            type="text"
            value={name}
            onChange={(event) => setName(event.target.value)}
          />

          <label htmlFor="repo-description">Description</label>
          <textarea
            id="repo-description"
            rows="4"
            value={description}
            onChange={(event) => setDescription(event.target.value)}
          />

          <fieldset>
            <legend>Visibility</legend>
            <label className="radio-option">
              <input
                checked={visibility}
                name="visibility"
                type="radio"
                onChange={() => setVisibility(true)}
              />
              Public
            </label>
            <label className="radio-option">
              <input
                checked={!visibility}
                name="visibility"
                type="radio"
                onChange={() => setVisibility(false)}
              />
              Private
            </label>
          </fieldset>

          {error && <p className="form-error">{error}</p>}

          <button disabled={loading || !name.trim()} type="submit">
            {loading ? "Creating..." : "Create repository"}
          </button>
        </form>
      </main>
    </>
  );
};

export default CreateRepository;
