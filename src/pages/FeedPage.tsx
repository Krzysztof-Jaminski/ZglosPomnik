import React, { useState, useEffect } from 'react';
import { TreePost } from '../components/Feed/TreePost';
import { TreePost as TreePostType } from '../types';
import { treesService } from '../services/treesService';
import { GlassButton } from '../components/UI/GlassButton';
import { useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import mockData from '../mockdata.json';

export const FeedPage: React.FC = () => {
  const [posts, setPosts] = useState<TreePostType[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [sortBy, setSortBy] = useState<'recent' | 'popular'>('recent');
  const [filterStatus] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all');
  const location = useLocation();
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    loadPosts();
  }, []);

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

  const loadPosts = async (isLoadMore = false) => {
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
      } else {
        // Użyj mockdata dla niezalogowanych użytkowników
        treesData = mockData.trees.map(tree => ({
          id: tree.id,
          species: tree.commonName,
          speciesLatin: tree.species,
          location: {
            lat: tree.latitude,
            lng: tree.longitude,
            address: `Warszawa, ${tree.latitude.toFixed(6)}, ${tree.longitude.toFixed(6)}`
          },
          status: tree.status as 'pending' | 'approved' | 'rejected',
          submissionDate: tree.reportedAt,
          userData: {
            userName: tree.reportedBy,
            avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(tree.reportedBy)}&background=10b981&color=fff`
          },
          votes: {
            approve: Math.floor(Math.random() * 20) + 1,
            reject: Math.floor(Math.random() * 5)
          },
          description: tree.notes,
          images: tree.photos,
          circumference: Math.floor(Math.random() * 200) + 50, // 50-250 cm
          height: Math.floor(Math.random() * 20) + 10, // 10-30 m
          condition: ['Dobra', 'Średnia', 'Zła'][Math.floor(Math.random() * 3)],
          isAlive: Math.random() > 0.1, // 90% szans na żywe
          estimatedAge: Math.floor(Math.random() * 100) + 20, // 20-120 lat
          isMonument: tree.status === 'approved',
          approvalDate: tree.status === 'approved' ? tree.reportedAt : ''
        }));
      }
      
      // Convert trees to posts with social features
      const postsData: TreePostType[] = treesData.map(tree => ({
        ...tree,
        likes: tree.votes.approve,
        dislikes: tree.votes.reject,
        userVote: null, // TODO: Implement user voting
        comments: [], // Comments are now loaded from API in TreePost component
        legendComment: undefined // Legend comments are now handled by API
      }));

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
    // Comments are now handled by the TreePost component via API
    // This function is kept for compatibility but doesn't do anything
    console.log('Comment submission handled by TreePost component:', postId, commentText);
  };

  const handleCommentVote = async (commentId: string, vote: 'like' | 'dislike') => {
    // Comment voting is now handled by the TreePost component via API
    // This function is kept for compatibility but doesn't do anything
    console.log('Comment vote handled by TreePost component:', commentId, vote);
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