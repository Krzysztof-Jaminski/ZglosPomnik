import React, { useState, useEffect } from 'react';
import { TreePost } from '../components/Feed/TreePost';
import { TreePost as TreePostType } from '../types';
import { api } from '../services/api';
import { GlassButton } from '../components/UI/GlassButton';

export const FeedPage: React.FC = () => {
  const [posts, setPosts] = useState<TreePostType[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [sortBy, setSortBy] = useState<'recent' | 'popular'>('recent');
  const [filterStatus] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all');

  useEffect(() => {
    loadPosts();
  }, []);

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
      
      const treesData = await api.getTrees();
      
      // Convert trees to posts with social features
      const postsData: TreePostType[] = treesData.map(tree => ({
        ...tree,
        likes: Math.floor(Math.random() * 50),
        dislikes: Math.floor(Math.random() * 10),
        userVote: Math.random() > 0.7 ? (Math.random() > 0.5 ? 'like' as const : 'dislike' as const) : null,
        comments: generateMockComments(tree.id),
        legendComment: Math.random() > 0.6 ? generateLegendComment(tree.id) : undefined
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

  const generateMockComments = (treeId: string) => {
    const commentTexts = [
      'Pamiętam jak w dzieciństwie bawiłem się pod tym dębem. Miałem wtedy 8 lat i wydawał mi się ogromny. Teraz, 30 lat później, nadal stoi w tym samym miejscu, ale ja już nie jestem taki mały. To drzewo widziało całe pokolenia dzieci bawiących się w jego cieniu.',
      'Moja babcia opowiadała, że ten dąb był już stary, gdy ona była małą dziewczynką. Mówiła, że w czasie wojny ludzie chowali się w jego dziupli podczas nalotów. To drzewo uratowało życie wielu mieszkańcom tej dzielnicy.',
      'W zeszłym roku podczas burzy jedna z gałęzi spadła na mój samochód. Zamiast się złościć, pomyślałem - to drzewo było tu długo przede mną i będzie długo po mnie. Naprawiłem samochód i teraz parkuję dalej, żeby nie przeszkadzać temu staruszkowi.',
      'Każdej wiosny obserwuję jak ten dąb budzi się do życia. Najpierw pojawiają się małe listki, potem kwiaty, a na końcu żołędzie. To jak naturalny kalendarz pór roku. Moje dzieci uczą się od niego cierpliwości i cyklu życia.',
      'W czasie upałów to drzewo daje najlepszy cień w całej okolicy. Ludzie przychodzą tu z kocami, książkami i kanapkami. To miejsce spotkań całej społeczności. Bez tego dębu nasza dzielnica straciłaby swoją duszę.',
      'Moja córka ma alergię na pyłki, ale akurat pyłki tego dębu jej nie szkodzą. Lekarz powiedział, że to rzadkość. Córka nazywa go "przyjaznym dębem" i zawsze macha do niego ręką, gdy przechodzimy obok.',
      'W zeszłym miesiącu zauważyłem, że w dziupli tego dębu zamieszkała rodzina sów. Każdego wieczora słychać ich pohukiwanie. To niesamowite, jak jedno drzewo może być domem dla tylu stworzeń - ptaków, owadów, a nawet małych ssaków.'
    ];

    const numComments = Math.floor(Math.random() * 8);
    return Array.from({ length: numComments }, (_, index) => ({
      id: `${treeId}-comment-${index}`,
      treeId,
      userId: `user-${index}`,
      userName: `Użytkownik ${index + 1}`,
      content: commentTexts[Math.floor(Math.random() * commentTexts.length)],
      createdAt: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString(),
      likes: Math.floor(Math.random() * 20),
      dislikes: Math.floor(Math.random() * 5),
      userVote: Math.random() > 0.8 ? (Math.random() > 0.5 ? 'like' as const : 'dislike' as const) : null
    }));
  };

  const generateLegendComment = (treeId: string) => {
    const legendTexts = [
      'Ten dąb pamięta czasy, gdy wokół niego były tylko pola i łąki. Dziś stoi w centrum miasta, ale jego korzenie sięgają głęboko w historię. Miejscowi mówią, że w jego cieniu odpoczywał sam Napoleon podczas przemarszu przez te ziemie.',
      'Według starych map z XVIII wieku, ten dąb był już wtedy znaczącym punktem orientacyjnym. Podróżnicy zatrzymywali się przy nim, żeby odpocząć i napić się wody ze źródła, które biło u jego stóp. Dziś źródło już nie istnieje, ale dąb nadal stoi.',
      'Moja prababcia opowiadała, że w czasie powstania styczniowego pod tym dębem ukrywali się powstańcy. Drzewo było tak gęste, że żołnierze rosyjscy nie mogli ich znaleźć. Dąb uratował życie wielu patriotom.',
      'Ten dąb to prawdziwy skarb dendrologiczny. Jego pierśnica wynosi ponad 4 metry, co oznacza, że ma prawdopodobnie ponad 300 lat. To jeden z najstarszych dębów w całym województwie i powinien być chroniony jako pomnik przyrody.'
    ];

    return {
      id: `${treeId}-legend`,
      treeId,
      userId: 'expert-user',
      userName: 'Ekspert Dendrologiczny',
      content: legendTexts[Math.floor(Math.random() * legendTexts.length)],
      createdAt: new Date(Date.now() - Math.random() * 24 * 60 * 60 * 1000).toISOString(),
      likes: Math.floor(Math.random() * 100) + 100, // Higher likes to ensure it's the legend
      dislikes: Math.floor(Math.random() * 10),
      userVote: null
    };
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
    const newComment = {
      id: `${postId}-comment-${Date.now()}`,
      treeId: postId,
      userId: 'current-user',
      userName: 'Ty',
      content: commentText,
      createdAt: new Date().toISOString(),
      likes: 0,
      dislikes: 0,
      userVote: null
    };

    setPosts(prevPosts =>
      prevPosts.map(post => {
        if (post.id === postId) {
          return {
            ...post,
            comments: [...post.comments, newComment]
          };
        }
        return post;
      })
    );
  };

  const handleCommentVote = async (commentId: string, vote: 'like' | 'dislike') => {
    setPosts(prevPosts =>
      prevPosts.map(post => ({
        ...post,
        comments: post.comments.map(comment => {
          if (comment.id === commentId) {
            const wasLiked = comment.userVote === 'like';
            const wasDisliked = comment.userVote === 'dislike';
            
            if (vote === 'like') {
              return {
                ...comment,
                likes: wasLiked ? comment.likes - 1 : comment.likes + 1,
                dislikes: wasDisliked ? comment.dislikes - 1 : comment.dislikes,
                userVote: wasLiked ? null : 'like'
              };
            } else {
              return {
                ...comment,
                likes: wasLiked ? comment.likes - 1 : comment.likes,
                dislikes: wasDisliked ? comment.dislikes - 1 : comment.dislikes + 1,
                userVote: wasDisliked ? null : 'dislike'
              };
            }
          }
          return comment;
        })
      }))
    );
  };

  const filteredAndSortedPosts = posts
    .filter(post => filterStatus === 'all' || post.status === filterStatus)
    .sort((a, b) => {
      if (sortBy === 'popular') {
        return (b.likes - b.dislikes) - (a.likes - a.dislikes);
      }
      return new Date(b.reportedAt).getTime() - new Date(a.reportedAt).getTime();
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