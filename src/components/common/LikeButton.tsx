import React, { useState, useEffect } from "react";
import { Heart } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import { likesApi } from "../../api/likes.api";
import LoadingSpinner from "./LoadingSpinner";
import "../../styles/components/common/LikeButton.css";

interface LikeButtonProps {
  itemId: number;
  initialLikes?: number;
  initialLiked?: boolean;
}

const LikeButton: React.FC<LikeButtonProps> = ({
  itemId,
  initialLikes = 0,
  initialLiked = false,
}) => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  
  const [liked, setLiked] = useState(initialLiked);
  const [count, setCount] = useState(initialLikes);
  const [isLoading, setIsLoading] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);

  useEffect(() => {
    const fetchStatus = async () => {
      if (!isAuthenticated) return;
      try {
        setIsLoading(true);
        const result = await likesApi.getLikeStatus(itemId);
        setLiked(result.likedByCurrentUser);
        setCount(result.totalLikes);
      } catch (err) {
        console.error("Failed to fetch like status", err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchStatus();
  }, [itemId, isAuthenticated]);

  const handleToggle = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!isAuthenticated) {
      navigate("/login");
      return;
    }

    if (isSyncing) return;

    // 1. Optimistic update
    const previousLiked = liked;
    const previousCount = count;
    
    setLiked(!previousLiked);
    setCount(prev => previousLiked ? prev - 1 : prev + 1);
    setIsSyncing(true);

    try {
      // 2. API call
      const result = await likesApi.toggleLike(itemId);
      
      // 3. Update with real data
      setLiked(result.likedByCurrentUser);
      setCount(result.totalLikes);
    } catch (err) {
      // 4. Rollback on error
      setLiked(previousLiked);
      setCount(previousCount);
      console.error("Failed to toggle like", err);
    } finally {
      setIsSyncing(false);
    }
  };

  if (isLoading) {
    return (
      <div className="like-btn-loading">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <button 
      className={`like-btn ${liked ? 'liked' : ''}`} 
      onClick={handleToggle}
      disabled={isSyncing}
      aria-label={liked ? "Unlike" : "Like"}
    >
      <Heart 
        size={20} 
        fill={liked ? "#ef4444" : "transparent"} 
        className={liked ? "text-danger" : ""}
      />
      <span className="like-count">{count}</span>
    </button>
  );
};

export default LikeButton;
