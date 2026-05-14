import React, { useEffect, useState } from "react";
import axios from "axios";
import "./profile.css";
import Navbar from "../Navbar";
import { UnderlineNav } from "@primer/react";
import { BookIcon, RepoIcon } from "@primer/octicons-react";
import HeatMapProfile from "./HeatMap";
import { useAuth } from "../../useAuth";
import { API_BASE_URL } from "../../config/api";
import { Link } from "react-router-dom";

const Profile = () => {
  const [userDetails, setUserDetails] = useState({ username: "username" });
  const [repositories, setRepositories] = useState([]);
  const { setCurrentUser } = useAuth();

  const username = userDetails.username || "username";
  const email = userDetails.email || "";
  const publicCount = repositories.filter((repo) => repo.visibility).length;
  const privateCount = repositories.length - publicCount;

  useEffect(() => {
    const fetchUserDetails = async () => {
      const userId = localStorage.getItem("userId");

      if (userId) {
        try {
          const [profileResponse, repositoryResponse] = await Promise.all([
            axios.get(`${API_BASE_URL}/userProfile/${userId}`),
            axios.get(`${API_BASE_URL}/repo/user/${userId}`),
          ]);
          setUserDetails(profileResponse.data);
          setRepositories(repositoryResponse.data.repositories || []);
        } catch (err) {
          console.error("Cannot fetch user details: ", err);
        }
      }
    };
    fetchUserDetails();
  }, []);

  return (
    <>
      <Navbar />
      <UnderlineNav aria-label="Repository" className="profile-tabs">
        <UnderlineNav.Item
          aria-current="page"
          icon={BookIcon}
          sx={{
            backgroundColor: "transparent",
            color: "white",
            "&:hover": {
              textDecoration: "underline",
              color: "white",
            },
          }}
        >
          Overview
        </UnderlineNav.Item>

        <UnderlineNav.Item
          icon={RepoIcon}
          sx={{
            backgroundColor: "transparent",
            color: "whitesmoke",
            "&:hover": {
              textDecoration: "underline",
              color: "white",
            },
          }}
        >
          Starred Repositories
        </UnderlineNav.Item>
      </UnderlineNav>

      <div className="profile-page-wrapper">
        <div className="user-profile-section">
          <div className="profile-image">{username.charAt(0).toUpperCase()}</div>

          <div className="name">
            <h3>{username}</h3>
            {email && <p>{email}</p>}
          </div>

          <div className="follower">
            <p>{repositories.length} Repositories</p>
            <p>{publicCount} Public</p>
            <p>{privateCount} Private</p>
          </div>

          <button
            onClick={() => {
              localStorage.removeItem("token");
              localStorage.removeItem("userId");
              setCurrentUser(null);

              window.location.href = "/auth";
            }}
            id="logout"
          >
            Logout
          </button>
        </div>

        <div className="heat-map-section">
          <HeatMapProfile />
          <section className="profile-repositories">
            <div className="profile-repositories-header">
              <h4>Repositories</h4>
              <Link className="profile-create-link" to="/create">
                New
              </Link>
            </div>

            {repositories.length === 0 ? (
              <p className="profile-empty">No repositories yet.</p>
            ) : (
              <div className="profile-repo-list">
                {repositories.map((repo) => (
                  <article className="profile-repo-card" key={repo._id}>
                    <div>
                      <Link className="profile-repo-link" to={`/repo/${repo._id}`}>
                        {repo.name}
                      </Link>
                      <p>{repo.description || "No description provided."}</p>
                    </div>
                    <span className="profile-repo-badge">
                      {repo.visibility ? "Public" : "Private"}
                    </span>
                  </article>
                ))}
              </div>
            )}
          </section>
        </div>
      </div>
    </>
  );
};

export default Profile;
