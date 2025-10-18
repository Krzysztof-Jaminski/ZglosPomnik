import React, { useState, useEffect, useCallback } from 'react';
import { TreePost } from '../components/Feed/TreePost';
import { TreePost as TreePostType } from '../types';
import { treesService } from '../services/treesService';
import { api } from '../services/api';
import { useLocation } from 'react-router-dom';
import { SearchInput } from '../components/UI/SearchInput';

export const FeedPage: React.FC = () => {
  const [allPosts, setAllPosts] = useState<TreePostType[]>([]);
  const [displayedPosts, setDisplayedPosts] = useState<TreePostType[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [hasMorePosts, setHasMorePosts] = useState(true);
  const [currentPage, setCurrentPage] = useState(0);
  const [filterStatus] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const location = useLocation();
  
  const POSTS_PER_PAGE = 5; // Display 5 posts at a time

  // Load all posts function
  const loadAllPosts = useCallback(async () => {
    setIsLoading(true);

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
        ...tree
      }));

      setAllPosts(allPostsData);
      
      // Display first 5 posts
      const firstPagePosts = allPostsData.slice(0, POSTS_PER_PAGE);
      setDisplayedPosts(firstPagePosts);
      setHasMorePosts(allPostsData.length > POSTS_PER_PAGE);
      setCurrentPage(0);

    } catch (error) {
      console.error('Error loading trees:', error);
      // Fallback to mock data if API fails
      const mockTrees = await api.getTrees();
      const allPostsData: TreePostType[] = mockTrees.map(tree => ({
        ...tree
      }));

      setAllPosts(allPostsData);
      
      // Display first 5 posts
      const firstPagePosts = allPostsData.slice(0, POSTS_PER_PAGE);
      setDisplayedPosts(firstPagePosts);
      setHasMorePosts(allPostsData.length > POSTS_PER_PAGE);
      setCurrentPage(0);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Load more posts function
  const loadMorePosts = useCallback(() => {
    if (isLoadingMore || !hasMorePosts) return;

    setIsLoadingMore(true);
    
    const nextPage = currentPage + 1;
    const startIndex = nextPage * POSTS_PER_PAGE;
    const endIndex = startIndex + POSTS_PER_PAGE;
    
    const nextPagePosts = allPosts.slice(startIndex, endIndex);
    setDisplayedPosts(prevPosts => [...prevPosts, ...nextPagePosts]);
    setHasMorePosts(endIndex < allPosts.length);
    setCurrentPage(nextPage);
    
    setIsLoadingMore(false);
  }, [allPosts, currentPage, hasMorePosts, isLoadingMore]);

  // Load initial posts
  useEffect(() => {
    loadAllPosts();
  }, [loadAllPosts]);


  // Infinite scroll detection using Intersection Observer
  useEffect(() => {
    const loadMoreTrigger = document.getElementById('load-more-trigger');
    if (!loadMoreTrigger) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !isLoadingMore && hasMorePosts) {
          console.log('Loading more posts...');
          loadMorePosts();
        }
      },
      { threshold: 0.1 }
    );

    observer.observe(loadMoreTrigger);
    return () => observer.disconnect();
  }, [isLoadingMore, hasMorePosts, loadMorePosts]);

  // Handle scroll to specific tree from map
  useEffect(() => {
    const scrollToTreeId = location.state?.scrollToTreeId;
    if (scrollToTreeId && displayedPosts.length > 0) {
      // Wait a bit for posts to render, then scroll to the specific tree
      setTimeout(() => {
        const treeElement = document.getElementById(`tree-post-${scrollToTreeId}`);
        if (treeElement) {
          treeElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }, 500);
    }
  }, [displayedPosts, location.state]);


  // Handle post deletion
  const handleDeletePost = (postId: string) => {
    setDisplayedPosts(prevPosts => prevPosts.filter(post => post.id !== postId));
    setAllPosts(prevPosts => prevPosts.filter(post => post.id !== postId));
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
  const filteredAndSortedPosts = displayedPosts
    .filter(post => filterStatus === 'all' || post.status === filterStatus)
    .filter(post => searchPosts([post], searchQuery).length > 0)
    .sort((a, b) => {
      // Always sort by date since we removed likes/dislikes
      return new Date(b.submissionDate).getTime() - new Date(a.submissionDate).getTime();
    });

  if (isLoading) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-300 text-sm">Ładowanie feed'a...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      {/* Posts */}
      <div className="flex-1 overflow-y-auto">
        {/* Search */}
        <div className="px-3 py-2">
          <SearchInput
            value={searchQuery}
            onChange={setSearchQuery}
            placeholder="Szukaj postów..."
            size="md"
            variant="compact"
            showClearButton={false}
          />
        </div>

        <div className="space-y-4 sm:space-y-6 w-full px-2 py-2">
          {filteredAndSortedPosts.map((post) => (
            <div
              key={post.id}
              id={`tree-post-${post.id}`}
            >
              <TreePost
                post={post}
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
            <p className="text-gray-500 dark:text-gray-400 text-sm">
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

      </div>
    </div>
  );
};