import React, { useState, useEffect, useCallback } from 'react';
import { TreePost } from '../components/Feed/TreePost';
import { TreePost as TreePostType } from '../types';
import { treesService } from '../services/treesService';
import { commentsService } from '../services/commentsService';
import { api } from '../services/api';
import { GlassButton } from '../components/UI/GlassButton';
import { useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export const FeedPage: React.FC = () => {
  const [posts, setPosts] = useState<TreePostType[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [hasMorePosts, setHasMorePosts] = useState(true);
  const [currentPage, setCurrentPage] = useState(0);
  const [sortBy, setSortBy] = useState<'recent' | 'popular'>('recent');
  const [filterStatus] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const location = useLocation();
  const { isAuthenticated } = useAuth();
  
  const POSTS_PER_PAGE = 5; // Load 5 posts at a time

  // Load posts function with pagination
  const loadPosts = useCallback(async (page: number, isInitialLoad: boolean = false) => {
    if (isInitialLoad) {
      setIsLoading(true);
    } else {
      setIsLoadingMore(true);
    }

    try {
      // Load trees from API
      const treesData = await treesService.getTrees();
      
      // Sort trees by submission date (newest first)
      const sortedTrees = treesData.sort((a, b) => {
        const dateA = new Date(a.submissionDate || 0);
        const dateB = new Date(b.submissionDate || 0);
        return dateB.getTime() - dateA.getTime();
      });

      // Convert trees to posts format
      const allPostsData: TreePostType[] = sortedTrees.map(tree => ({
        ...tree,
        likes: tree.votes?.like || 0,
        dislikes: tree.votes?.dislike || 0,
        userVote: null, // Will be set by API if user has voted
        comments: [], // Comments will be loaded on demand
        commentCount: tree.commentCount || 0
      }));

      // Apply pagination
      const startIndex = page * POSTS_PER_PAGE;
      const endIndex = startIndex + POSTS_PER_PAGE;
      const paginatedPosts = allPostsData.slice(startIndex, endIndex);

      if (isInitialLoad) {
        setPosts(paginatedPosts);
      } else {
        setPosts(prevPosts => [...prevPosts, ...paginatedPosts]);
      }

      // Check if there are more posts
      setHasMorePosts(endIndex < allPostsData.length);
      setCurrentPage(page);

    } catch (error) {
      console.error('Error loading trees:', error);
      // Fallback to mock data if API fails
      const mockTrees = await api.getTrees();
      const allPostsData: TreePostType[] = mockTrees.map(tree => ({
        ...tree,
        likes: tree.votes?.like || 0,
        dislikes: tree.votes?.dislike || 0,
        userVote: null,
        comments: [],
        commentCount: tree.commentCount || 0
      }));

      // Apply pagination to mock data too
      const startIndex = page * POSTS_PER_PAGE;
      const endIndex = startIndex + POSTS_PER_PAGE;
      const paginatedPosts = allPostsData.slice(startIndex, endIndex);

      if (isInitialLoad) {
        setPosts(paginatedPosts);
      } else {
        setPosts(prevPosts => [...prevPosts, ...paginatedPosts]);
      }

      setHasMorePosts(endIndex < allPostsData.length);
      setCurrentPage(page);
    } finally {
      if (isInitialLoad) {
        setIsLoading(false);
      } else {
        setIsLoadingMore(false);
      }
    }
  }, []);

  // Load initial posts
  useEffect(() => {
    loadPosts(0, true);
  }, [loadPosts]);


  // Infinite scroll detection using Intersection Observer
  useEffect(() => {
    const loadMoreTrigger = document.getElementById('load-more-trigger');
    if (!loadMoreTrigger) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !isLoadingMore && hasMorePosts) {
          console.log('Loading more posts...');
          loadPosts(currentPage + 1, false);
        }
      },
      { threshold: 0.1 }
    );

    observer.observe(loadMoreTrigger);
    return () => observer.disconnect();
  }, [isLoadingMore, hasMorePosts, currentPage, loadPosts]);

  // Handle scroll to specific tree from map
  useEffect(() => {
    const scrollToTreeId = location.state?.scrollToTreeId;
    if (scrollToTreeId && posts.length > 0) {
      // Wait a bit for posts to render, then scroll to the specific tree
      setTimeout(() => {
        const treeElement = document.getElementById(`tree-post-${scrollToTreeId}`);
        if (treeElement) {
          treeElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
          // Add highlight effect
          treeElement.classList.add('ring-4', 'ring-green-500', 'ring-opacity-50');
          setTimeout(() => {
            treeElement.classList.remove('ring-4', 'ring-green-500', 'ring-opacity-50');
          }, 3000);
        }
      }, 500);
    }
  }, [posts, location.state]);

  // Handle tree voting
  const handleLike = async (postId: string) => {
    try {
      const post = posts.find(p => p.id === postId);
      if (!post) return;

      const wasLiked = post.userVote === 'like';
      const wasDisliked = post.userVote === 'dislike';

      if (isAuthenticated) {
        let updatedVotes;
        if (wasLiked) {
          // Remove existing like
          updatedVotes = await treesService.removeVoteFromTree(postId);
        } else {
          // Add like (or change from dislike to like)
          updatedVotes = await treesService.voteOnTree(postId, 'like');
        }

        // Update local state with API response
        setPosts(prevPosts =>
          prevPosts.map(p => {
            if (p.id === postId) {
              return {
                ...p,
                likes: updatedVotes.like,
                dislikes: updatedVotes.dislike,
                userVote: wasLiked ? null : 'like'
              };
            }
            return p;
          })
        );
      } else {
        // Fallback to local state update for non-authenticated users
        setPosts(prevPosts =>
          prevPosts.map(p => {
            if (p.id === postId) {
              return {
                ...p,
                likes: wasLiked ? p.likes - 1 : p.likes + 1,
                dislikes: wasDisliked ? p.dislikes - 1 : p.dislikes,
                userVote: wasLiked ? null : 'like'
              };
            }
            return p;
          })
        );
      }
    } catch (error) {
      console.error('Error liking post:', error);
    }
  };

  const handleDislike = async (postId: string) => {
    try {
      const post = posts.find(p => p.id === postId);
      if (!post) return;

      const wasLiked = post.userVote === 'like';
      const wasDisliked = post.userVote === 'dislike';

      if (isAuthenticated) {
        let updatedVotes;
        if (wasDisliked) {
          // Remove existing dislike
          updatedVotes = await treesService.removeVoteFromTree(postId);
        } else {
          // Add dislike (or change from like to dislike)
          updatedVotes = await treesService.voteOnTree(postId, 'dislike');
        }

        // Update local state with API response
        setPosts(prevPosts =>
          prevPosts.map(p => {
            if (p.id === postId) {
              return {
                ...p,
                likes: updatedVotes.like,
                dislikes: updatedVotes.dislike,
                userVote: wasDisliked ? null : 'dislike'
              };
            }
            return p;
          })
        );
      } else {
        // Fallback to local state update for non-authenticated users
        setPosts(prevPosts =>
          prevPosts.map(p => {
            if (p.id === postId) {
              return {
                ...p,
                likes: wasLiked ? p.likes - 1 : p.likes,
                dislikes: wasDisliked ? p.dislikes - 1 : p.dislikes + 1,
                userVote: wasDisliked ? null : 'dislike'
              };
            }
            return p;
          })
        );
      }
    } catch (error) {
      console.error('Error disliking post:', error);
    }
  };

  // Handle comment creation
  const handleComment = async (postId: string, commentText: string, userId?: string) => {
    try {
      if (isAuthenticated) {
        const newComment = await commentsService.addTreeComment(postId, commentText, userId);
        
        // Update local state
        setPosts(prevPosts =>
          prevPosts.map(post => {
            if (post.id === postId) {
              return {
                ...post,
                comments: [newComment, ...post.comments],
                commentCount: post.commentCount + 1
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

  // Handle post deletion
  const handleDeletePost = (postId: string) => {
    setPosts(prevPosts => prevPosts.filter(post => post.id !== postId));
  };


  // Search function
  const searchPosts = (posts: TreePostType[], query: string) => {
    if (!query.trim()) return posts;
    
    const lowercaseQuery = query.toLowerCase();
    
    return posts.filter(post => {
      return post.species?.toLowerCase().includes(lowercaseQuery) ||
             post.speciesLatin?.toLowerCase().includes(lowercaseQuery) ||
             post.userData?.userName?.toLowerCase().includes(lowercaseQuery) ||
             post.description?.toLowerCase().includes(lowercaseQuery);
    });
  };

  // Filter and sort posts
  const filteredAndSortedPosts = posts
    .filter(post => filterStatus === 'all' || post.status === filterStatus)
    .filter(post => searchPosts([post], searchQuery).length > 0)
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
    <div className="h-full flex flex-col">
        {/* Header */}
        <div className="flex-shrink-0 p-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-center">
            <div className="flex items-center space-x-2">
            <GlassButton
              onClick={() => setSortBy('recent')}
              variant={sortBy === 'recent' ? 'primary' : 'secondary'}
              size="sm"
            >
              Najnowsze
            </GlassButton>
            <GlassButton
              onClick={() => setSortBy('popular')}
              variant={sortBy === 'popular' ? 'primary' : 'secondary'}
              size="sm"
            >
              Popularne
            </GlassButton>
          </div>
        </div>

        {/* Search */}
        <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700">
          <div className="flex gap-3">
            {/* Search Input */}
            <div className="flex-1">
              <input
                type="text"
                placeholder="Szukaj postów..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full px-4 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
              />
            </div>
            
            {/* Clear Search Button */}
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="px-4 py-2 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-600 dark:text-gray-300 rounded-lg transition-colors"
              >
                Wyczyść
              </button>
            )}
          </div>
        </div>

      {/* Posts */}
      <div className="flex-1 overflow-y-auto py-4">
        <div className="space-y-8 sm:space-y-12 w-full sm:px-4 lg:px-6">
          {filteredAndSortedPosts.map((post) => (
            <div
              key={post.id}
              id={`tree-post-${post.id}`}
            >
              <TreePost
                post={post}
                onLike={handleLike}
                onDislike={handleDislike}
                onComment={handleComment}
                onDelete={handleDeletePost}
              />
            </div>
          ))}
        </div>

        {/* Search Results Info */}
        {searchQuery && (
          <div className="px-4 py-2 bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Znaleziono {filteredAndSortedPosts.length} wyników dla "{searchQuery}"
            </p>
          </div>
        )}

        {filteredAndSortedPosts.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500 dark:text-gray-400 text-lg">
              {searchQuery ? 'Brak wyników wyszukiwania' : 'Brak zgłoszeń spełniających kryteria'}
            </p>
          </div>
        )}

        {/* Load more trigger element */}
        {!searchQuery && hasMorePosts && (
          <div id="load-more-trigger" className="h-10 flex items-center justify-center">
            {isLoadingMore ? (
              <div className="text-center">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-green-600 mx-auto mb-2"></div>
                <p className="text-gray-600 dark:text-gray-300 text-sm">Ładowanie...</p>
              </div>
            ) : (
              <div className="text-center">
                <p className="text-gray-500 dark:text-gray-400 text-sm">Przewiń w dół, aby załadować więcej</p>
              </div>
            )}
          </div>
        )}

        {/* End of posts indicator */}
        {!searchQuery && !hasMorePosts && posts.length > 0 && (
          <div className="px-4 py-6">
            <div className="text-center">
              <p className="text-gray-500 dark:text-gray-400">
                To wszystkie dostępne posty
              </p>
            </div>
          </div>
        )}
        </div>
      </div>
    </div>
  );
};