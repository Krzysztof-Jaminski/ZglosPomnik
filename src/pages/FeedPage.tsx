import React, { useState, useEffect } from 'react';
import { TreePost } from '../components/Feed/TreePost';
import { TreePost as TreePostType, Comment } from '../types';
import { treesService } from '../services/treesService';
import { commentsService } from '../services/commentsService';
import { api } from '../services/api';
import { GlassButton } from '../components/UI/GlassButton';
import { useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export const FeedPage: React.FC = () => {
  const [posts, setPosts] = useState<TreePostType[]>([]);
  const [allComments, setAllComments] = useState<Comment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [sortBy, setSortBy] = useState<'recent' | 'popular'>('recent');
  const [filterStatus] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all');
  const location = useLocation();
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    const initializeData = async () => {
      await loadComments();
    };
    initializeData();
  }, []);

  // Reload posts when comments change
  useEffect(() => {
    console.log('allComments changed:', allComments.length, 'posts:', posts.length);
    if (allComments.length > 0 || posts.length > 0) {
      loadPostsWithComments(allComments);
    }
  }, [allComments]);

  // Load all comments on page load
  const loadComments = async () => {
    try {
      if (isAuthenticated) {
        const comments = await commentsService.getAllComments();
        console.log('Loaded comments from API:', comments);
        setAllComments(comments);
      } else {
        // For non-authenticated users, use mock comments
        const mockComments = await api.getComments();
        console.log('Loaded mock comments:', mockComments);
        setAllComments(mockComments);
      }
    } catch (error) {
      console.error('Error loading comments:', error);
      // Fallback to localStorage
      const comments = commentsService.getCommentsFromStorage();
      console.log('Fallback comments from localStorage:', comments);
      setAllComments(comments);
    }
  };

  // Handle scroll to specific tree from map
  useEffect(() => {
    const scrollToTreeId = location.state?.scrollToTreeId;
    if (scrollToTreeId && posts.length > 0) {
      // Wait a bit for posts to render, then scroll to the specific tree
      setTimeout(() => {
        const treeElement = document.getElementById(`tree-post-${scrollToTreeId}`);
        if (treeElement) {
          treeElement.scrollIntoView({ 
            behavior: 'smooth', 
            block: 'center' 
          });
          // Highlight the post briefly
          treeElement.classList.add('ring-2', 'ring-green-500', 'ring-opacity-50');
          setTimeout(() => {
            treeElement.classList.remove('ring-2', 'ring-green-500', 'ring-opacity-50');
          }, 3000);
        }
      }, 500);
    }
  }, [posts, location.state]);

  useEffect(() => {
    const handleScroll = () => {
      // Sprawdzamy scroll na głównym kontenerze aplikacji
      const mainContainer = document.querySelector('main.overflow-y-auto');
      if (mainContainer) {
        const { scrollTop, scrollHeight, clientHeight } = mainContainer;
        console.log('Scroll event:', { scrollTop, scrollHeight, clientHeight, threshold: scrollHeight - 200 });
        if (scrollTop + clientHeight >= scrollHeight - 200) {
          console.log('Triggering loadMorePosts');
          loadMorePosts();
        }
      }
    };

    // Nasłuchuj scroll na głównym kontenerze
    const mainContainer = document.querySelector('main.overflow-y-auto');
    if (mainContainer) {
      console.log('Added scroll listener to main container');
      mainContainer.addEventListener('scroll', handleScroll);
      return () => {
        console.log('Removed scroll listener');
        mainContainer.removeEventListener('scroll', handleScroll);
      };
    } else {
      console.log('Main container not found');
    }
  }, [isLoadingMore, hasMore]);

  const loadPostsWithComments = async (comments: Comment[], isLoadMore = false) => {
    console.log('loadPostsWithComments called with comments:', comments.length);
    try {
      if (isLoadMore) {
        setIsLoadingMore(true);
      } else {
        setIsLoading(true);
      }
      
      let treesData;
      
      if (isAuthenticated) {
        // Użyj prawdziwego API dla zalogowanych użytkowników
        treesData = await treesService.getTrees();
        console.log('API Trees data:', treesData);
      } else {
        // Użyj mock data dla niezalogowanych użytkowników
        treesData = await api.getTrees();
        console.log('Mock Trees data:', treesData);
      }
      
      // Convert trees to posts with social features
      const postsData: TreePostType[] = treesData.map(tree => {
        // Find comments for this tree (only for counting)
        const treeComments = comments.filter(comment => {
          // Search by treeSubmissionId - this is the correct way
          return comment.treeSubmissionId === tree.id;
        });
        
        // Calculate total likes and dislikes from comments
        const totalCommentLikes = treeComments.reduce((sum, comment) => sum + comment.votes.like, 0);
        const totalCommentDislikes = treeComments.reduce((sum, comment) => sum + comment.votes.dislike, 0);
        
        console.log(`Tree ${tree.species} has ${treeComments.length} comments (${totalCommentLikes} likes, ${totalCommentDislikes} dislikes)`);
        
        return {
          ...tree,
          likes: tree.votes.like + totalCommentLikes, // Tree votes + comment likes
          dislikes: tree.votes.dislike + totalCommentDislikes, // Tree votes + comment dislikes
          userVote: null, // TODO: Implement user voting
          comments: [], // Don't load comment details here - load on demand
          commentsCount: treeComments.length, // Store comment count
          legendComment: treeComments.find(comment => comment.isLegend)
        };
      });

      if (isLoadMore) {
        setPosts(prevPosts => [...prevPosts, ...postsData]);
      } else {
        setPosts(postsData);
      }
      
      // Symulujemy ograniczoną liczbę postów (dla demo)
      setHasMore(postsData.length > 0);
    } catch (error) {
      console.error('Error loading posts:', error);
    } finally {
      setIsLoading(false);
      setIsLoadingMore(false);
    }
  };

  const loadPosts = async (isLoadMore = false) => {
    return loadPostsWithComments(allComments, isLoadMore);
  };

  const loadMorePosts = () => {
    console.log('loadMorePosts called', { isLoadingMore, hasMore });
    if (!isLoadingMore && hasMore) {
      console.log('Loading more posts...');
      loadPosts(true);
    }
  };



  const handleLike = async (postId: string) => {
    setPosts(prevPosts =>
      prevPosts.map(post => {
        if (post.id === postId) {
          const wasLiked = post.userVote === 'like';
          const wasDisliked = post.userVote === 'dislike';
          
          return {
            ...post,
            likes: wasLiked ? post.likes - 1 : post.likes + 1,
            dislikes: wasDisliked ? post.dislikes - 1 : post.dislikes,
            userVote: wasLiked ? null : 'like'
          };
        }
        return post;
      })
    );
  };

  const handleDislike = async (postId: string) => {
    setPosts(prevPosts =>
      prevPosts.map(post => {
        if (post.id === postId) {
          const wasLiked = post.userVote === 'like';
          const wasDisliked = post.userVote === 'dislike';
          
          return {
            ...post,
            likes: wasLiked ? post.likes - 1 : post.likes,
            dislikes: wasDisliked ? post.dislikes - 1 : post.dislikes + 1,
            userVote: wasDisliked ? null : 'dislike'
          };
        }
        return post;
      })
    );
  };

  const handleComment = async (postId: string, commentText: string) => {
    try {
      if (isAuthenticated) {
        const newComment = await commentsService.addTreeComment(postId, commentText);
        // Add new comment to local state
        setAllComments(prevComments => [newComment, ...prevComments]);
        // Update posts with new comment
        setPosts(prevPosts => 
          prevPosts.map(post => {
            if (post.id === postId) {
              return {
                ...post,
                comments: [newComment, ...post.comments]
              };
            }
            return post;
          })
        );
      }
    } catch (error) {
      console.error('Error adding comment:', error);
    }
  };

  const handleCommentVote = async (commentId: string, vote: 'like' | 'dislike') => {
    try {
      if (isAuthenticated) {
        const voteType = vote === 'like' ? 'Like' : 'Dislike';
        const updatedVotes = await commentsService.voteComment(commentId, voteType);
        
        // Update comment votes in local state
        setAllComments(prevComments =>
          prevComments.map(comment =>
            comment.id === commentId
              ? { ...comment, votes: updatedVotes }
              : comment
          )
        );
        
        // Update posts with updated comment votes
        setPosts(prevPosts =>
          prevPosts.map(post => ({
            ...post,
            comments: post.comments.map(comment =>
              comment.id === commentId
                ? { ...comment, votes: updatedVotes }
                : comment
            )
          }))
        );
      }
    } catch (error) {
      console.error('Error voting on comment:', error);
    }
  };

  const filteredAndSortedPosts = posts
    .filter(post => filterStatus === 'all' || post.status === filterStatus)
    .sort((a, b) => {
      if (sortBy === 'popular') {
        return (b.likes - b.dislikes) - (a.likes - a.dislikes);
      }
      return new Date(b.submissionDate).getTime() - new Date(a.submissionDate).getTime();
    });

  if (isLoading) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-300 text-lg">Ładowanie feed'a...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full bg-gray-50 dark:bg-gray-900 py-6 overflow-y-auto">
      <div className="max-w-lg mx-auto px-6">
        {/* Filters */}
        <div className="flex justify-center gap-4 mb-6">
          <GlassButton
            onClick={() => setSortBy('recent')}
            variant={sortBy === 'recent' ? 'primary' : 'secondary'}
            size="xs"
          >
            Najnowsze
          </GlassButton>
          <GlassButton
            onClick={() => setSortBy('popular')}
            variant={sortBy === 'popular' ? 'primary' : 'secondary'}
            size="xs"
          >
            Popularne
          </GlassButton>
        </div>

        {/* Posts */}
        <div className="space-y-6">
          {filteredAndSortedPosts.map((post) => (
            <div
              key={post.id}
            >
              <TreePost
                post={post}
                onLike={handleLike}
                onDislike={handleDislike}
                onComment={handleComment}
                onCommentVote={handleCommentVote}
              />
            </div>
          ))}
        </div>

        {filteredAndSortedPosts.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500 dark:text-gray-400 text-lg">
              Brak zgłoszeń spełniających kryteria
            </p>
          </div>
        )}

        {/* Loading more indicator */}
        {isLoadingMore && (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto mb-2"></div>
            <p className="text-gray-500 dark:text-gray-400 text-sm">Ładowanie więcej...</p>
          </div>
        )}

        {/* End of feed indicator */}
        {!hasMore && filteredAndSortedPosts.length > 0 && (
          <div className="text-center py-8">
            <p className="text-gray-500 dark:text-gray-400 text-sm">
              To wszystkie dostępne zgłoszenia
            </p>
          </div>
        )}
      </div>
    </div>
  );
};