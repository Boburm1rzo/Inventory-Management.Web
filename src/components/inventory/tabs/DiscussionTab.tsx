import React, { useState, useEffect, useCallback, useRef } from "react";
import { useTranslation } from "react-i18next";
import { useAuth } from "../../../hooks/useAuth";
import { postsApi } from "../../../api/posts.api";
import type { PostDto, CreatePostDto } from "../../../types";
import ErrorAlert from "../../common/ErrorAlert";
import LoadingSpinner from "../../common/LoadingSpinner";
import ReactMarkdown from "react-markdown";
import * as signalR from "@microsoft/signalr";
import { timeAgo } from "../../../utils/time";

interface DiscussionTabProps {
  inventoryId: number;
}

const DiscussionTab: React.FC<DiscussionTabProps> = ({ inventoryId }) => {
  const { t } = useTranslation();
  const { isAuthenticated, user } = useAuth();
  const [posts, setPosts] = useState<PostDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [newPostContent, setNewPostContent] = useState("");
  const [connectionStatus, setConnectionStatus] = useState<
    "connecting" | "connected" | "reconnecting" | "disconnected"
  >("connecting");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const connectionRef = useRef<signalR.HubConnection | null>(null);

  const fetchPosts = useCallback(async () => {
    try {
      setLoading(true);
      const data = await postsApi.getPosts(inventoryId);
      // Sort newest first
      setPosts(
        data.sort(
          (a, b) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
        ),
      );
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }, [inventoryId]);

  const setupSignalR = useCallback(
    async (isMounted: () => boolean) => {
      if (connectionRef.current) return;

      try {
        const token = localStorage.getItem("token");
        if (!token) return;

        const baseUrl = (import.meta.env.VITE_API_BASE_URL as string).replace(
          "/api",
          "",
        );
        const hubUrl = `${baseUrl}/hubs/discussion`;
        console.log("SignalR Hub URL:", hubUrl);

        const connection = new signalR.HubConnectionBuilder()
          .withUrl(hubUrl, {
            accessTokenFactory: () => token,
          })
          .withAutomaticReconnect()
          .build();

        connectionRef.current = connection;

        connection.onclose(() => {
          if (isMounted()) setConnectionStatus("disconnected");
        });
        connection.onreconnecting(() => {
          if (isMounted()) setConnectionStatus("reconnecting");
        });
        connection.onreconnected(() => {
          if (isMounted()) setConnectionStatus("connected");
        });

        connection.on("NewPost", (post: PostDto) => {
          setPosts((prev) => {
            if (prev.some((p) => p.id === post.id)) return prev;
            return [post, ...prev]; // New posts at the top
          });
        });

        await connection.start();

        if (!isMounted()) {
          await connection.stop();
          return;
        }

        setConnectionStatus("connected");
        await connection.invoke("JoinInventory", inventoryId.toString());
      } catch (err: any) {
        connectionRef.current = null;
        // Suppress "stopped during negotiation" or abort errors as they are expected during navigation
        if (
          err.name === "AbortError" ||
          err.message?.includes("stopped during negotiation")
        ) {
          return;
        }
        console.error("SignalR connection error:", err);
        if (isMounted()) setConnectionStatus("disconnected");
      }
    },
    [inventoryId],
  );

  const cleanupSignalR = useCallback(async () => {
    const connection = connectionRef.current;
    connectionRef.current = null; // Clear ref immediately
    if (connection) {
      try {
        if (connection.state === signalR.HubConnectionState.Connected) {
          await connection.invoke("LeaveInventory", inventoryId.toString());
        }
        await connection.stop();
      } catch (err) {
        // Ignore errors during cleanup
      }
    }
  }, [inventoryId]);

  useEffect(() => {
    let mounted = true;
    const isMounted = () => mounted;

    fetchPosts();
    setupSignalR(isMounted);

    return () => {
      mounted = false;
      cleanupSignalR();
    };
  }, [fetchPosts, setupSignalR, cleanupSignalR]);

  const handleSubmitPost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPostContent.trim() || isSubmitting) return;

    try {
      setIsSubmitting(true);
      const dto: CreatePostDto = { content: newPostContent.trim() };
      const newPost = await postsApi.createPost(inventoryId, dto);
      setPosts((prev) =>
        prev.some((p) => p.id === newPost.id) ? prev : [newPost, ...prev],
      );
      setNewPostContent("");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeletePost = async (postId: number) => {
    try {
      await postsApi.deletePost(inventoryId, postId);
      setPosts((prev) => prev.filter((p) => p.id !== postId));
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.ctrlKey && e.key === "Enter") {
      handleSubmitPost(e);
    }
  };

  const getStatusIndicator = () => {
    const statusColors = {
      connected: "green",
      reconnecting: "orange",
      disconnected: "red",
      connecting: "gray",
    };
    const color = statusColors[connectionStatus] || "gray";
    const label = t(`discussion.${connectionStatus}`, connectionStatus);

    return (
      <span style={{ color, fontSize: "0.75rem", fontWeight: "600" }}>
        ● {label.charAt(0).toUpperCase() + label.slice(1)}
      </span>
    );
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div className="discussion-container">
      <div className="discussion-header">
        <div className="d-flex justify-content-between align-items-center mb-3">
          <h3 className="m-0">{t("discussion.title", "Discussion")}</h3>
          {getStatusIndicator()}
        </div>

        {isAuthenticated ? (
          <form onSubmit={handleSubmitPost} className="post-form">
            <div className="input-wrapper">
              <textarea
                value={newPostContent}
                onChange={(e) => setNewPostContent(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={t("discussion.writeMessage", "Write a message...")}
                maxLength={4000}
              />
              <button
                type="submit"
                disabled={!newPostContent.trim() || isSubmitting}
                className="send-btn"
              >
                {isSubmitting ? "..." : t("discussion.send", "Post")}
              </button>
            </div>
            <div className="form-hint">
              {t(
                "discussion.markdownSupported",
                "Markdown supported. Ctrl+Enter to post.",
              )}
            </div>
          </form>
        ) : (
          <div className="login-hint">
            {t(
              "discussion.loginRequired",
              "Please login to join the discussion",
            )}
          </div>
        )}
      </div>

      <div className="posts-list">
        {posts.length === 0 ? (
          <div className="no-posts">
            {t("discussion.noPosts", "No posts yet. Start the conversation!")}
          </div>
        ) : (
          <div className="posts-stack">
            {posts.map((post) => (
              <div key={post.id} className="post-card">
                <div className="post-layout">
                  {post.avatarUrl ? (
                    <img
                      src={post.avatarUrl}
                      alt={post.authorName}
                      className="avatar"
                    />
                  ) : (
                    <div className="avatar-initials">
                      {(post.authorName || "?")
                        .split(" ")
                        .map((n) => n?.[0])
                        .join("")
                        .toUpperCase()
                        .slice(0, 2)}
                    </div>
                  )}
                  <div className="post-content-area">
                    <div className="post-meta">
                      <span className="author-name">{post.authorName}</span>
                      <span className="post-time">
                        {timeAgo(post.createdAt)}
                      </span>
                    </div>
                    <div className="post-text">
                      <ReactMarkdown>{post.content}</ReactMarkdown>
                    </div>
                  </div>
                  {(user?.displayName === post.authorName ||
                    user?.roles?.includes("Admin")) && (
                    <button
                      onClick={() => handleDeletePost(post.id)}
                      className="delete-post-btn"
                      title={t("discussion.deletePost", "Delete post")}
                    >
                      🗑️
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {error && <ErrorAlert message={error} onDismiss={() => setError(null)} />}

      <style>{`
        .discussion-container {
          height: 100%;
          display: flex;
          flex-direction: column;
          padding: 1rem;
        }
        
        .discussion-header {
          flex-shrink: 0;
          padding-bottom: 1rem;
          border-bottom: 1px solid var(--border);
          margin-bottom: 1rem;
        }

        .post-form {
          background: var(--bg-secondary);
          padding: 1rem;
          border-radius: var(--radius-md);
          border: 1px solid var(--border);
        }

        .input-wrapper {
          display: flex;
          gap: 0.75rem;
          align-items: flex-start;
        }

        .input-wrapper textarea {
          flex: 1;
          min-height: 60px;
          max-height: 150px;
          padding: 0.75rem;
          border: 1px solid var(--border);
          border-radius: var(--radius-md);
          background: var(--bg-primary);
          color: var(--text-primary);
          resize: none;
          font-size: 0.95rem;
        }

        .send-btn {
          padding: 0.75rem 1.5rem;
          background: var(--accent);
          color: white;
          border: none;
          border-radius: var(--radius-md);
          font-weight: 600;
          cursor: pointer;
        }

        .posts-list {
          flex: 1;
          overflow-y: auto;
          padding-right: 0.5rem;
        }

        .posts-stack {
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
        }

        .post-card {
          background: var(--bg-card);
          border: 1px solid var(--border);
          border-radius: var(--radius-md);
          padding: 1rem;
        }

        .post-layout {
          display: flex;
          gap: 0.75rem;
          position: relative;
        }

        .post-content-area {
          flex: 1;
          min-width: 0;
        }

        .post-meta {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          margin-bottom: 0.25rem;
        }

        .author-name {
          font-weight: 700;
          font-size: 0.9rem;
        }

        .post-time {
          font-size: 0.8rem;
          color: var(--text-muted);
        }

        .post-text {
          font-size: 0.95rem;
          word-break: break-word;
        }

        .delete-post-btn {
          background: none;
          border: none;
          color: var(--danger);
          cursor: pointer;
          opacity: 0;
          transition: opacity 0.2s;
        }

        .post-card:hover .delete-post-btn {
          opacity: 1;
        }

        .avatar {
          width: 36px;
          height: 36px;
          border-radius: 50%;
          object-fit: cover;
        }

        .avatar-initials {
          width: 36px;
          height: 36px;
          border-radius: 50%;
          background: var(--accent);
          color: white;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 700;
          font-size: 0.8rem;
        }
      `}</style>
    </div>
  );
};

export default DiscussionTab;
