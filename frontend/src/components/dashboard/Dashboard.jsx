import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import "./dashboard.css";
import Navbar from "../Navbar";
import { API_BASE_URL } from "../../config/api";

const Dashboard = () => {
  const [repositories, setRepositories] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [suggestedRepositories, setSuggestedRepositories] = useState([]);
  const [searchResults, setSearchResults] = useState([]);

  useEffect(() => {
    const userId = localStorage.getItem("userId");

    const fetchRepositories = async () => {
      if (!userId) {
        setRepositories([]);
        return;
      }

      try {
        const response = await fetch(`${API_BASE_URL}/repo/user/${userId}`);
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || "Unable to fetch repositories");
        }

        setRepositories(Array.isArray(data.repositories) ? data.repositories : []);
      } catch (err) {
        console.error("Error while fetching repositories: ", err);
        setRepositories([]);
      }
    };

    const fetchSuggestedRepositories = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/repo/all`);
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || "Unable to fetch suggested repositories");
        }

        setSuggestedRepositories(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error("Error while fetching suggested repositories: ", err);
        setSuggestedRepositories([]);
      }
    };

    fetchRepositories();
    fetchSuggestedRepositories();
  }, []);

  useEffect(() => {
    if (searchQuery === "") {
      setSearchResults(Array.isArray(repositories) ? repositories : []);
    } else {
      const filteredRepo = repositories.filter((repo) =>
        repo.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setSearchResults(filteredRepo);
    }
  }, [searchQuery, repositories]);

  return (
    <>
      <Navbar />
      <section id="dashboard">
        <aside className="dashboard-panel">
          <h3>Suggested Repositories</h3>
          {suggestedRepositories.length === 0 ? (
            <p className="empty-state">No public repositories yet.</p>
          ) : (
            suggestedRepositories.map((repo) => {
              return (
                <article className="repo-card" key={repo._id}>
                  <Link className="repo-card-link" to={`/repo/${repo._id}`}>
                    <h4>{repo.name}</h4>
                  </Link>
                  <p>{repo.description || "No description provided."}</p>
                </article>
              );
            })
          )}
        </aside>
        <main className="dashboard-main">
          <h2>Your Repositories</h2>
          <div id="search">
            <input
              type="text"
              value={searchQuery}
              placeholder="Search..."
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <div className="repo-list">
            {searchResults.length === 0 ? (
              <p className="empty-state">
                {searchQuery
                  ? "No repositories match your search."
                  : "You do not have any repositories yet."}
              </p>
            ) : (
              searchResults.map((repo) => {
                return (
                  <article className="repo-card" key={repo._id}>
                    <Link className="repo-card-link" to={`/repo/${repo._id}`}>
                      <h4>{repo.name}</h4>
                    </Link>
                    <p>{repo.description || "No description provided."}</p>
                  </article>
                );
              })
            )}
          </div>
        </main>
        <aside className="dashboard-panel">
          <h3>Upcoming Events</h3>
          <ul>
            <li>
              <p>Tech Conference - Dec 15</p>
            </li>
            <li>
              <p>Developer Meetup - Dec 25</p>
            </li>
            <li>
              <p>React Summit - Jan 5</p>
            </li>
          </ul>
        </aside>
      </section>
    </>
  );
};

export default Dashboard;
