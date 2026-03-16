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
  const postsEndRef = useRef<HTMLDivElement>(null);

  const fetchPosts = useCallback(async () => {
    try {
      setLoading(true);
      const data = await postsApi.getPosts(inventoryId);
      setPosts(data);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }, [inventoryId]);

  const setupSignalR = useCallback(async () => {
    // ← qo'shildi: allaqachon connection bor bo'lsa qaytish
    if (connectionRef.current) return;

    try {
      const token = localStorage.getItem("token");
      if (!token) return;

      const baseUrl = (import.meta.env.VITE_API_BASE_URL as string).replace(
        "/api",
        "",
      );

      const connection = new signalR.HubConnectionBuilder()
        .withUrl(`${baseUrl}/hubs/discussion`, {
          accessTokenFactory: () => token,
        })
        .withAutomaticReconnect()
        .build();

      // ← ref ga OLDIN yozish — race condition oldini olish
      connectionRef.current = connection;

      connection.onclose(() => setConnectionStatus("disconnected"));
      connection.onreconnecting(() => setConnectionStatus("reconnecting"));
      connection.onreconnected(() => setConnectionStatus("connected"));

      connection.on("NewPost", (post: PostDto) => {
        setPosts((prev) => {
          // ← duplicate oldini olish
          if (prev.some((p) => p.id === post.id)) return prev;
          return [...prev, post];
        });
      });

      await connection.start();
      setConnectionStatus("connected");
      await connection.invoke("JoinInventory", inventoryId.toString());
    } catch (err: unknown) {
      connectionRef.current = null;
      console.error("SignalR connection error:", err);
      setConnectionStatus("disconnected");
    }
  }, [inventoryId]);

  const cleanupSignalR = useCallback(async () => {
    if (connectionRef.current) {
      try {
        await connectionRef.current.invoke(
          "LeaveInventory",
          inventoryId.toString(),
        );
        await connectionRef.current.stop();
      } catch (err) {
        console.error("SignalR cleanup error:", err);
      }
      connectionRef.current = null;
    }
  }, [inventoryId]);

  useEffect(() => {
    fetchPosts();
    setupSignalR();
    return () => {
      cleanupSignalR();
    };
  }, [fetchPosts, setupSignalR, cleanupSignalR]);

  const handleSubmitPost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPostContent.trim() || isSubmitting) return;

    try {
      setIsSubmitting(true);
      const dto: CreatePostDto = { content: newPostContent.trim() };
      await postsApi.createPost(inventoryId, dto);
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
    switch (connectionStatus) {
      case "connected":
        return (
          <span style={{ color: "green" }}>
            🟢 {t("discussion.connected", "Connected")}
          </span>
        );
      case "reconnecting":
        return (
          <span style={{ color: "orange" }}>
            🟡 {t("discussion.reconnecting", "Reconnecting...")}
          </span>
        );
      case "disconnected":
        return (
          <span style={{ color: "red" }}>
            🔴 {t("discussion.disconnected", "Disconnected")}
          </span>
        );
      default:
        return (
          <span style={{ color: "gray" }}>
            ⏳ {t("discussion.connecting", "Connecting...")}
          </span>
        );
    }
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <div
      style={{
        padding: "1rem",
        height: "100%",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "1rem",
        }}
      >
        <h3>{t("discussion.title", "Discussion")}</h3>
        {getStatusIndicator()}
      </div>

      <div style={{ flex: 1, overflowY: "auto", marginBottom: "1rem" }}>
        {posts.length === 0 ? (
          <div
            style={{
              textAlign: "center",
              padding: "2rem",
              color: "var(--text-muted)",
            }}
          >
            {t("discussion.noPosts", "No posts yet. Start the conversation!")}
          </div>
        ) : (
          <div
            style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}
          >
            {posts.map((post) => (
              <div key={post.id} className="post-card">
                <div
                  style={{
                    display: "flex",
                    alignItems: "flex-start",
                    gap: "0.75rem",
                  }}
                >
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
                        .map((n) => n?.[0] || "")
                        .join("")
                        .toUpperCase()
                        .slice(0, 2)}
                    </div>
                  )}
                  <div style={{ flex: 1 }}>
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "0.5rem",
                        marginBottom: "0.25rem",
                      }}
                    >
                      <span style={{ fontWeight: "500" }}>
                        {post.authorName}
                      </span>
                      <span
                        style={{
                          fontSize: "0.875rem",
                          color: "var(--text-muted)",
                        }}
                      >
                        {timeAgo(post.createdAt)}
                      </span>
                    </div>
                    <div style={{ marginBottom: "0.5rem" }}>
                      <ReactMarkdown>{post.content}</ReactMarkdown>
                    </div>
                  </div>
                  {(user?.displayName === post.authorName ||
                    user?.roles?.includes("Admin")) && (
                    <button
                      onClick={() => handleDeletePost(post.id)}
                      style={{
                        background: "none",
                        border: "none",
                        color: "var(--danger)",
                        cursor: "pointer",
                        padding: "0.25rem",
                        borderRadius: "var(--radius-sm)",
                        opacity: 0,
                        transition: "opacity 0.2s",
                      }}
                      onMouseEnter={(e) =>
                        (e.currentTarget.style.opacity = "1")
                      }
                      onMouseLeave={(e) =>
                        (e.currentTarget.style.opacity = "0")
                      }
                      title={t("discussion.deletePost", "Delete post")}
                    >
                      🗑️
                    </button>
                  )}
                </div>
              </div>
            ))}
            <div ref={postsEndRef} />
          </div>
        )}
      </div>

      {isAuthenticated ? (
        <form onSubmit={handleSubmitPost} style={{ marginTop: "auto" }}>
          <div
            style={{ display: "flex", gap: "0.5rem", alignItems: "flex-end" }}
          >
            <textarea
              value={newPostContent}
              onChange={(e) => setNewPostContent(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={t("discussion.writeMessage", "Write a message...")}
              style={{
                flex: 1,
                minHeight: "80px",
                padding: "0.75rem",
                border: "1px solid var(--border)",
                borderRadius: "var(--radius-md)",
                background: "var(--bg-primary)",
                color: "var(--text-primary)",
                resize: "vertical",
              }}
              maxLength={4000}
            />
            <button
              type="submit"
              disabled={!newPostContent.trim() || isSubmitting}
              style={{
                padding: "0.75rem 1.5rem",
                background: "var(--accent)",
                color: "white",
                border: "none",
                borderRadius: "var(--radius-md)",
                cursor:
                  newPostContent.trim() && !isSubmitting
                    ? "pointer"
                    : "not-allowed",
                opacity: newPostContent.trim() && !isSubmitting ? 1 : 0.5,
              }}
            >
              {isSubmitting ? <LoadingSpinner /> : t("discussion.send", "Send")}
            </button>
          </div>
          <div
            style={{
              fontSize: "0.875rem",
              color: "var(--text-muted)",
              marginTop: "0.25rem",
            }}
          >
            {t(
              "discussion.markdownSupported",
              "Markdown supported. Ctrl+Enter to send.",
            )}
          </div>
        </form>
      ) : (
        <div
          style={{
            textAlign: "center",
            padding: "1rem",
            color: "var(--text-muted)",
          }}
        >
          {t("discussion.loginRequired", "Please login to join the discussion")}
        </div>
      )}

      {error && <ErrorAlert message={error} onDismiss={() => setError(null)} />}

      <style>{`
        .post-card {
          background: var(--bg-card);
          border: 1px solid var(--border);
          border-radius: var(--radius-md);
          padding: 1rem;
          transition: var(--transition);
        }
        .post-card:hover {
          border-color: var(--accent-subtle);
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
          font-size: 0.75rem;
          font-weight: 700;
        }
      `}</style>
    </div>
  );
};

export default DiscussionTab;
