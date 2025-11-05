import React, { useState, useCallback } from 'react';
import { Edit, Trash2, X, ChevronLeft, ChevronRight, Save } from 'lucide-react';
import { TreePost as TreePostType, ApiTreeSubmission } from '../../types';
import { motion, AnimatePresence } from 'framer-motion';
import { logger } from '../../utils/logger';
import { useAutoTextarea } from '../../hooks/useAutoTextarea';
import { DeleteConfirmationModal } from '../UI/DeleteConfirmationModal';
import { treesService } from '../../services/treesService';
import { speciesService } from '../../services/speciesService';
import { useAuth } from '../../context/AuthContext';

interface TreePostProps {
  post: TreePostType;
  onDelete?: (postId: string) => void;
  onUpdate?: () => void;
  isEditing?: boolean;
  onStartEdit?: () => void;
  onCancelEdit?: () => void;
}

export const TreePost: React.FC<TreePostProps> = ({
  post,
  onDelete,
  onUpdate,
  isEditing: externalIsEditing,
  onStartEdit,
  onCancelEdit
}) => {
  const { user, isModerator } = useAuth();
  
  // Log tree object to console for debugging
  logger.log('TreePost - Tree object:', post);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showPhotoModal, setShowPhotoModal] = useState(false);
  const [selectedPhotoIndex, setSelectedPhotoIndex] = useState(0);
  const [showMapScreenshotModal, setShowMapScreenshotModal] = useState(false);
  const isEditing = externalIsEditing || false;
  const [editName, setEditName] = useState<string>(post.name || '');
  const [editDescription, setEditDescription] = useState<string>(post.description || '');
  const [editLegend, setEditLegend] = useState<string>(post.legend || '');
  const [editCircumference, setEditCircumference] = useState<string>(post.circumference?.toString() || '');
  const [editHeight, setEditHeight] = useState<string>(post.height?.toString() || '');
  const [editCrownSpread, setEditCrownSpread] = useState<string>(post.crownSpread?.toString() || '');
  const [editEstimatedAge, setEditEstimatedAge] = useState<string>(post.estimatedAge?.toString() || '');
  const [editLat, setEditLat] = useState<string>(post.location?.lat?.toString() || '');
  const [editLng, setEditLng] = useState<string>(post.location?.lng?.toString() || '');
  const [editAddress, setEditAddress] = useState<string>(post.location?.address || '');
  const [editPlotNumber, setEditPlotNumber] = useState<string>(post.location?.plotNumber || '');
  const [editDistrict, setEditDistrict] = useState<string>(post.location?.district || '');
  const [editProvince, setEditProvince] = useState<string>(post.location?.province || '');
  const [editCounty, setEditCounty] = useState<string>(post.location?.county || '');
  const [editCommune, setEditCommune] = useState<string>(post.location?.commune || '');
  const [isSaving, setIsSaving] = useState(false);

  // Auto-resize textareas
  const { ref: descRef, onInput: onDescInput } = useAutoTextarea(editDescription);
  const { ref: legendRef, onInput: onLegendInput } = useAutoTextarea(editLegend);

  // Initialize edit values when editing starts
  React.useEffect(() => {
    if (isEditing) {
      setEditName(post.name || '');
      setEditDescription(post.description || '');
      setEditLegend(post.legend || '');
      setEditCircumference(post.circumference?.toString() || '');
      setEditHeight(post.height?.toString() || '');
      setEditCrownSpread(post.crownSpread?.toString() || '');
      setEditEstimatedAge(post.estimatedAge?.toString() || '');
      setEditLat(post.location?.lat?.toString() || '');
      setEditLng(post.location?.lng?.toString() || '');
      setEditAddress(post.location?.address || '');
      setEditPlotNumber(post.location?.plotNumber || '');
      setEditDistrict(post.location?.district || '');
      setEditProvince(post.location?.province || '');
      setEditCounty(post.location?.county || '');
      setEditCommune(post.location?.commune || '');
    }
  }, [isEditing, post]);



  // Handle tree post deletion
  const handleDeletePost = async () => {
    if (!onDelete) return;
    
    // TODO: TEMPORARY - Always try to delete, let API handle permission validation
    // TODO: In the future, this should check: user && post.userData.userId && post.userData.userId === user.id
    const hasPermission = true; // Always try to delete for now
    logger.log('Attempting to delete post:', {
      hasPermission,
      postUserName: post.userData.userName,
      postUserId: post.userData.userId, // This is null/undefined for now
      postId: post.id,
      post: post
    });
    
    setIsDeleting(true);
    try {
      await treesService.deleteTree(post.id);
      logger.log('Post deleted successfully');
      onDelete(post.id);
      setShowDeleteModal(false);
    } catch (error: any) {
      logger.error('Error deleting post:', error);
      
      // Handle specific error cases
      if (error.message?.includes('403')) {
        logger.log('403 Error - No permission to delete this post');
      } else if (error.message?.includes('404')) {
        logger.log('404 Error - Post not found');
      } else if (error.message?.includes('401')) {
        logger.log('401 Error - Session expired');
      } else if (error.message?.includes('500') || error.message?.includes('Server error')) {
        logger.log('500 Error - Server error:', error.message);
      } else {
        logger.log('Other error:', error.message);
      }
    } finally {
      setIsDeleting(false);
    }
  };

  // Moderatorzy mogą edytować/usunąć wszystko, zwykli użytkownicy tylko swoje posty
  const isPostOwner = user && post.userData.userId && post.userData.userId === user.id;
  const canDeletePost = isModerator || isPostOwner;
  const canEditPost = isModerator || isPostOwner;

  // Photo modal functions
  const openPhotoModal = useCallback((index: number) => {
    setSelectedPhotoIndex(index);
    setShowPhotoModal(true);
  }, []);

  const closePhotoModal = useCallback(() => {
    setShowPhotoModal(false);
  }, []);

  const nextPhoto = useCallback(() => {
    setSelectedPhotoIndex((prev) => (prev + 1) % (post.imageUrls?.length || 1));
  }, [post.imageUrls?.length]);

  const prevPhoto = useCallback(() => {
    setSelectedPhotoIndex((prev) => (prev - 1 + (post.imageUrls?.length || 1)) % (post.imageUrls?.length || 1));
  }, [post.imageUrls?.length]);

  // Map screenshot modal functions
  const openMapScreenshotModal = useCallback(() => {
    setShowMapScreenshotModal(true);
  }, []);

  const closeMapScreenshotModal = useCallback(() => {
    setShowMapScreenshotModal(false);
  }, []);

  return (
    <div className="w-full mb-4 sm:mb-6">
      {/* Gradient Frame Container */}
                  <div className="relative rounded-xl p-1 shadow-lg border border-gray-200/40 dark:border-gray-400/30">
        <div className="bg-gray-50 dark:bg-gray-900 rounded-lg">
          <div className="space-y-2 sm:space-y-3 p-3 sm:p-4">
                        {/* Header with user info and actions */}
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center space-x-2">
                            <div className="w-10 h-10 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center">
                              <span className="text-green-600 dark:text-green-400 font-semibold text-sm">
                                {post.userData.userName.charAt(0).toUpperCase()}
                              </span>
                            </div>
                            <div>
                              <div className="font-medium text-gray-900 dark:text-white text-sm sm:text-base">
                                {post.userData.userName}
                              </div>
                              <div className="text-sm text-gray-500 dark:text-gray-400">
                                {new Date(post.submissionDate).toLocaleDateString('pl-PL')}
                              </div>
                            </div>
                          </div>
                          
                          <div className="flex items-center space-x-2">
                            {/* Edit button */}
                            {canEditPost && !isEditing && (
                              <button
                                onClick={onStartEdit}
                                className="p-2 text-blue-400 hover:text-blue-600 dark:text-blue-500 dark:hover:text-blue-400 transition-colors rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/20 flex items-center justify-center min-h-[32px] min-w-[32px]"
                                title="Edytuj post"
                              >
                                <Edit className="w-4 h-4 box-border" style={{ lineHeight: 1, fontSize: '16px' }} />
                              </button>
                            )}
                            {isEditing && (
                              <div className="flex items-center space-x-2">
                                <button
                                  onClick={async () => {
                                    setIsSaving(true);
                                    try {
                                      // Find species ID by matching name
                                      let speciesId = '';
                                      try {
                                        const allSpecies = await speciesService.getSpecies();
                                        const matchingSpecies = allSpecies.find((s: any) => 
                                          s.polishName === post.species || 
                                          s.latinName === post.speciesLatin ||
                                          s.latinName === post.speciesLatin?.replace(/ L\.?$/, '')
                                        );
                                        if (matchingSpecies) {
                                          speciesId = matchingSpecies.id;
                                        }
                                      } catch (error) {
                                        logger.error('Error finding species:', error);
                                      }

                                      if (!speciesId) {
                                        alert('Nie można znaleźć gatunku drzewa. Spróbuj ponownie.');
                                        setIsSaving(false);
                                        return;
                                      }

                                      const apiTreeData: ApiTreeSubmission = {
                                        speciesId: speciesId,
                                        name: editName,
                                        location: {
                                          lat: parseFloat(editLat) || post.location?.lat || 0,
                                          lng: parseFloat(editLng) || post.location?.lng || 0,
                                          address: editAddress || post.location?.address || '',
                                          plotNumber: editPlotNumber || undefined,
                                          district: editDistrict || undefined,
                                          province: editProvince || undefined,
                                          county: editCounty || undefined,
                                          commune: editCommune || undefined
                                        },
                                        circumference: parseFloat(editCircumference) || post.circumference || 0,
                                        height: parseFloat(editHeight) || post.height || 0,
                                        soil: post.soil || [],
                                        health: post.health || [],
                                        environment: post.environment || [],
                                        isAlive: post.isAlive !== false,
                                        estimatedAge: editEstimatedAge ? parseInt(editEstimatedAge) : post.estimatedAge,
                                        crownSpread: parseFloat(editCrownSpread) || post.crownSpread || 0,
                                        description: editDescription,
                                        legend: editLegend,
                                        isMonument: post.isMonument || false
                                      };

                                      // Fetch existing photos from URLs to include in update
                                      const existingPhotos: File[] = [];
                                      
                                      if (post.imageUrls && post.imageUrls.length > 0) {
                                        try {
                                          const photoPromises = post.imageUrls.map(async (url) => {
                                            try {
                                              const response = await fetch(url);
                                              const blob = await response.blob();
                                              const fileName = url.split('/').pop() || `image_${Date.now()}.jpg`;
                                              return new File([blob], fileName, { type: blob.type });
                                            } catch (error) {
                                              logger.error('Error loading photo:', url, error);
                                              return null;
                                            }
                                          });
                                          const fetchedPhotos = (await Promise.all(photoPromises)).filter((photo): photo is File => photo !== null);
                                          existingPhotos.push(...fetchedPhotos);
                                        } catch (error) {
                                          logger.error('Error loading existing photos:', error);
                                        }
                                      }

                                      if (existingPhotos.length === 0) {
                                        alert('Nie można zapisać bez zdjęć. Wymagane jest co najmniej jedno zdjęcie.');
                                        setIsSaving(false);
                                        return;
                                      }

                                      await treesService.updateTree(post.id, apiTreeData, existingPhotos);
                                      if (onCancelEdit) onCancelEdit();
                                      if (onUpdate) onUpdate();
                                    } catch (error: any) {
                                      logger.error('Error updating tree:', error);
                                      alert(error.message || 'Błąd podczas aktualizacji');
                                    } finally {
                                      setIsSaving(false);
                                    }
                                  }}
                                  disabled={isSaving}
                                  className="p-2 text-green-400 hover:text-green-600 dark:text-green-500 dark:hover:text-green-400 transition-colors rounded-lg hover:bg-green-50 dark:hover:bg-green-900/20 flex items-center justify-center min-h-[32px] min-w-[32px]"
                                  title="Zapisz zmiany"
                                >
                                  <Save className="w-4 h-4 box-border" style={{ lineHeight: 1, fontSize: '16px' }} />
                                </button>
                                <button
                                  onClick={() => {
                                    if (onCancelEdit) onCancelEdit();
                                  }}
                                  className="p-2 text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-400 transition-colors rounded-lg hover:bg-gray-50 dark:hover:bg-gray-900/20 flex items-center justify-center min-h-[32px] min-w-[32px]"
                                  title="Anuluj"
                                >
                                  <X className="w-4 h-4 box-border" style={{ lineHeight: 1, fontSize: '16px' }} />
                                </button>
                              </div>
                            )}
                            
                            {/* Delete button */}
                            {canDeletePost && (
                              <button
                                onClick={() => {
                                  logger.log('Delete post clicked:', {
                                    hasPermission: canDeletePost,
                                    postUserName: post.userData.userName,
                                    postUserId: post.userData.userId,
                                    postId: post.id
                                  });
                                  setShowDeleteModal(true);
                                }}
                                className="p-2 text-red-400 hover:text-red-600 dark:text-red-500 dark:hover:text-red-400 transition-colors rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 flex items-center justify-center min-h-[32px] min-w-[32px]"
                                title="Usuń post"
                              >
                                <Trash2 className="w-4 h-4 box-border" style={{ lineHeight: 1, fontSize: '16px' }} />
                              </button>
                            )}
                          </div>
                        </div>

                        {/* Photos Section - MAIN CONTENT */}
                        {post.imageUrls && post.imageUrls.length > 0 && (
                          <div className="bg-white/10 dark:bg-gray-800/20 backdrop-blur-sm border-2 border-green-200/50 dark:border-green-400/30 rounded-lg p-2 sm:p-3 shadow-xl">
                            {/* Photo Grid - LARGER PHOTOS */}
                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 sm:gap-3">
                              {post.imageUrls.map((image, index) => {
                                const isLastImage = index === post.imageUrls.length - 1;
                                const isOddCount = post.imageUrls.length % 2 !== 0;
                                const shouldSpanTwo = isLastImage && isOddCount;
                                
                                return (
                                  <div 
                                    key={index} 
                                    className={`relative ${shouldSpanTwo ? 'col-span-2 sm:col-span-2 aspect-[2/1]' : 'aspect-square'}`}
                                  >
                                    <img
                                      src={image}
                                      crossOrigin={image.includes('drzewapistorage.blob.core.windows.net') ? undefined : 'anonymous'}
                                      referrerPolicy="no-referrer"
                                      alt={`Tree photo ${index + 1}`}
                                      className="w-full h-full object-cover rounded-lg cursor-pointer shadow-sm"
                                      onClick={() => openPhotoModal(index)}
                                    />
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        )}

            {/* Map Screenshot */}
            {post.treeScreenshotUrl && (
              <div className="bg-white/10 dark:bg-gray-800/20 backdrop-blur-sm border-2 border-blue-200/50 dark:border-blue-400/30 rounded-lg p-2 sm:p-3 shadow-xl">
                <div className="relative">
                  <img
                    src={post.treeScreenshotUrl}
                    crossOrigin={post.treeScreenshotUrl.includes('drzewapistorage.blob.core.windows.net') ? undefined : 'anonymous'}
                    referrerPolicy="no-referrer"
                    alt="Map screenshot"
                    className="w-full h-20 sm:h-24 object-cover rounded cursor-pointer"
                    onClick={openMapScreenshotModal}
                  />
                  <div className="absolute top-1 left-1 bg-black/50 text-white text-xs px-2 py-1 rounded">
                    Lokalizacja na mapie
                  </div>
                </div>
          </div>
        )}

            {/* Species Information */}
            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-2 sm:p-3">
              <div className="flex items-center space-x-2 mb-1">
                <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                <span className="text-xs font-semibold text-blue-600 dark:text-blue-400">Gatunek</span>
              </div>
              <div className="space-y-1">
                <p className="text-sm sm:text-base font-medium text-blue-700 dark:text-blue-300">
                  {post.species}
                </p>
                <p className="text-xs italic text-blue-600 dark:text-blue-400">
                  {post.speciesLatin}{!post.speciesLatin.endsWith('L.') ? ' L.' : ''}
                </p>
              </div>
            </div>

                        {/* All Tree Information - One Big Block */}
                        <div className="bg-white/10 dark:bg-gray-800/20 backdrop-blur-sm border-2 border-gray-200/50 dark:border-gray-400/30 rounded-lg p-2 sm:p-3 shadow-xl">
                          <div className="space-y-3">
                            {/* Tree Name - FIRST FIELD ON THE LEFT */}
                            <div>
                              <h3 className="text-xs font-semibold text-gray-900 dark:text-white mb-1">Nazwa drzewa</h3>
                              {isEditing ? (
                                <input
                                  type="text"
                                  value={editName}
                                  onChange={(e) => setEditName(e.target.value)}
                                  className="w-full px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-0 focus:border-gray-400 dark:bg-gray-800 dark:text-white transition-all"
                                  placeholder="Nazwa drzewa"
                                />
                              ) : (
                                <p className="text-xs text-gray-700 dark:text-gray-300">
                                  {post.name || 'Brak nazwy'}
                                </p>
                              )}
                            </div>

                            {/* Description */}
                            <div>
                              <h3 className="text-xs font-semibold text-gray-900 dark:text-white mb-1">Opis</h3>
                              {isEditing ? (
                                <textarea
                                  ref={descRef}
                                  value={editDescription}
                                  onChange={(e) => setEditDescription(e.target.value)}
                                  onInput={onDescInput}
                                  rows={5}
                                  className="w-full px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-0 focus:border-gray-400 dark:bg-gray-800 dark:text-white resize-none transition-all min-h-[80px] overflow-hidden"
                                  placeholder="Opis drzewa"
                                />
                              ) : (
                                <p className="text-xs text-gray-700 dark:text-gray-300">
                                  {post.description || 'Brak opisu'}
                                </p>
                              )}
                            </div>

                {/* Tree Measurements */}
                <div>
                  <h3 className="text-xs font-semibold text-gray-900 dark:text-white mb-2">Wymiary drzewa</h3>
                  {isEditing ? (
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                      <div className="bg-white/50 dark:bg-gray-700/50 rounded p-1 sm:p-2">
                        <label className="text-xs font-medium text-gray-600 dark:text-gray-400 mb-1 block">Obwód (cm)</label>
                        <input
                          type="number"
                          value={editCircumference}
                          onChange={(e) => setEditCircumference(e.target.value)}
                          className="w-full px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-0 focus:border-gray-400 dark:bg-gray-800 dark:text-white transition-all"
                        />
                      </div>
                      <div className="bg-white/50 dark:bg-gray-700/50 rounded p-1 sm:p-2">
                        <label className="text-xs font-medium text-gray-600 dark:text-gray-400 mb-1 block">Wysokość (m)</label>
                        <input
                          type="number"
                          value={editHeight}
                          onChange={(e) => setEditHeight(e.target.value)}
                          className="w-full px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-0 focus:border-gray-400 dark:bg-gray-800 dark:text-white transition-all"
                        />
                      </div>
                      <div className="bg-white/50 dark:bg-gray-700/50 rounded p-1 sm:p-2">
                        <label className="text-xs font-medium text-gray-600 dark:text-gray-400 mb-1 block">Korona (m)</label>
                        <input
                          type="number"
                          value={editCrownSpread}
                          onChange={(e) => setEditCrownSpread(e.target.value)}
                          className="w-full px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-0 focus:border-gray-400 dark:bg-gray-800 dark:text-white transition-all"
                        />
                      </div>
                      <div className="bg-white/50 dark:bg-gray-700/50 rounded p-1 sm:p-2">
                        <label className="text-xs font-medium text-gray-600 dark:text-gray-400 mb-1 block">Wiek (lata)</label>
                        <input
                          type="number"
                          value={editEstimatedAge}
                          onChange={(e) => setEditEstimatedAge(e.target.value)}
                          className="w-full px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-0 focus:border-gray-400 dark:bg-gray-800 dark:text-white transition-all"
                        />
                      </div>
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                      <div className="bg-white/50 dark:bg-gray-700/50 rounded p-1 sm:p-2 text-center">
                        <p className="text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Obwód</p>
                        <p className="text-sm font-bold text-gray-900 dark:text-white">{post.circumference} cm</p>
                      </div>
                      <div className="bg-white/50 dark:bg-gray-700/50 rounded p-1 sm:p-2 text-center">
                        <p className="text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Wysokość</p>
                        <p className="text-sm font-bold text-gray-900 dark:text-white">{post.height} m</p>
                      </div>
                      <div className="bg-white/50 dark:bg-gray-700/50 rounded p-1 sm:p-2 text-center">
                        <p className="text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Korona</p>
                        <p className="text-sm font-bold text-gray-900 dark:text-white">{post.crownSpread} m</p>
                      </div>
                      {post.estimatedAge && (
                        <div className="bg-white/50 dark:bg-gray-700/50 rounded p-1 sm:p-2 text-center">
                          <p className="text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Wiek</p>
                          <p className="text-sm font-bold text-gray-900 dark:text-white">{post.estimatedAge} lat</p>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Location */}
                <div>
                  <h3 className="text-xs font-semibold text-gray-900 dark:text-white mb-2">
                    Lokalizacja
                  </h3>
                  {isEditing ? (
                    <div className="space-y-2">
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="text-xs font-medium text-gray-600 dark:text-gray-400 mb-1 block">Latitude</label>
                          <input
                            type="number"
                            step="any"
                            value={editLat}
                            onChange={(e) => setEditLat(e.target.value)}
                            className="w-full px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-0 focus:border-gray-400 dark:bg-gray-800 dark:text-white transition-all"
                          />
                        </div>
                        <div>
                          <label className="text-xs font-medium text-gray-600 dark:text-gray-400 mb-1 block">Longitude</label>
                          <input
                            type="number"
                            step="any"
                            value={editLng}
                            onChange={(e) => setEditLng(e.target.value)}
                            className="w-full px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-0 focus:border-gray-400 dark:bg-gray-800 dark:text-white transition-all"
                          />
                        </div>
                      </div>
                      <div>
                        <label className="text-xs font-medium text-gray-600 dark:text-gray-400 mb-1 block">Adres</label>
                        <input
                          type="text"
                          value={editAddress}
                          onChange={(e) => setEditAddress(e.target.value)}
                          className="w-full px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-0 focus:border-gray-400 dark:bg-gray-800 dark:text-white transition-all"
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="text-xs font-medium text-gray-600 dark:text-gray-400 mb-1 block">Gmina</label>
                          <input
                            type="text"
                            value={editCommune}
                            onChange={(e) => setEditCommune(e.target.value)}
                            className="w-full px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-0 focus:border-gray-400 dark:bg-gray-800 dark:text-white transition-all"
                          />
                        </div>
                        <div>
                          <label className="text-xs font-medium text-gray-600 dark:text-gray-400 mb-1 block">Powiat</label>
                          <input
                            type="text"
                            value={editCounty}
                            onChange={(e) => setEditCounty(e.target.value)}
                            className="w-full px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-0 focus:border-gray-400 dark:bg-gray-800 dark:text-white transition-all"
                          />
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="text-xs font-medium text-gray-600 dark:text-gray-400 mb-1 block">Dzielnica</label>
                          <input
                            type="text"
                            value={editDistrict}
                            onChange={(e) => setEditDistrict(e.target.value)}
                            className="w-full px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-0 focus:border-gray-400 dark:bg-gray-800 dark:text-white transition-all"
                          />
                        </div>
                        <div>
                          <label className="text-xs font-medium text-gray-600 dark:text-gray-400 mb-1 block">Województwo</label>
                          <input
                            type="text"
                            value={editProvince}
                            onChange={(e) => setEditProvince(e.target.value)}
                            className="w-full px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-0 focus:border-gray-400 dark:bg-gray-800 dark:text-white transition-all"
                          />
                        </div>
                      </div>
                      <div>
                        <label className="text-xs font-medium text-gray-600 dark:text-gray-400 mb-1 block">Numer działki</label>
                        <input
                          type="text"
                          value={editPlotNumber}
                          onChange={(e) => setEditPlotNumber(e.target.value)}
                          className="w-full px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-0 focus:border-gray-400 dark:bg-gray-800 dark:text-white transition-all"
                        />
                      </div>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      <p className="text-xs text-gray-700 dark:text-gray-300">
                        <strong>Adres:</strong> {post.location?.address || 'Brak adresu'}
                      </p>
                      <p className="text-xs text-gray-700 dark:text-gray-300">
                        <strong>Gmina:</strong> {post.location?.commune || 'Brak danych'}
                      </p>
                      <p className="text-xs text-gray-700 dark:text-gray-300">
                        <strong>Powiat:</strong> {post.location?.county || 'Brak danych'}
                      </p>
                      <p className="text-xs text-gray-700 dark:text-gray-300">
                        <strong>Dzielnica:</strong> {post.location?.district || 'Brak danych'}
                      </p>
                      <p className="text-xs text-gray-700 dark:text-gray-300">
                        <strong>Województwo:</strong> {post.location?.province || 'Brak danych'}
                      </p>
                      <p className="text-xs text-gray-700 dark:text-gray-300">
                        <strong>Numer działki:</strong> {post.location?.plotNumber || 'Brak danych'}
                      </p>
                      <p className="text-xs text-gray-700 dark:text-gray-300">
                        <strong>Lat:</strong> {post.location?.lat?.toFixed(6)}, <strong>Lng:</strong> {post.location?.lng?.toFixed(6)}
                      </p>
                    </div>
                  )}
                </div>

                {/* Health, Soil, Environment Tags */}
                {((post.health && Array.isArray(post.health) && post.health.length > 0) || 
                  (post.soil && Array.isArray(post.soil) && post.soil.length > 0) || 
                  (post.environment && Array.isArray(post.environment) && post.environment.length > 0)) && (
                  <div>
                    <h3 className="text-xs font-semibold text-gray-900 dark:text-white mb-2">Szczegóły</h3>
                    <div className="space-y-2">
                      {post.health && Array.isArray(post.health) && post.health.length > 0 && (
                        <div>
                          <p className="text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Zdrowie:</p>
                          <div className="flex flex-wrap gap-1">
                            {post.health.map((tag, index) => (
                              <span
                                key={`health-${index}`}
                                className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300 border border-green-200 dark:border-green-700"
                              >
                                {tag}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                      
                      {post.soil && Array.isArray(post.soil) && post.soil.length > 0 && (
                        <div>
                          <p className="text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Gleba:</p>
                          <div className="flex flex-wrap gap-1">
                            {post.soil.map((tag, index) => (
                              <span
                                key={`soil-${index}`}
                                className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300 border border-orange-200 dark:border-orange-700"
                              >
                                {tag}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                      
                      {post.environment && Array.isArray(post.environment) && post.environment.length > 0 && (
                        <div>
                          <p className="text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Środowisko:</p>
                          <div className="flex flex-wrap gap-1">
                            {post.environment.map((tag, index) => (
                              <span
                                key={`env-${index}`}
                                className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300 border border-blue-200 dark:border-blue-700"
                              >
                                {tag}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Legend */}
                <div>
                  <h3 className="text-xs font-semibold text-gray-900 dark:text-white mb-1">Historie i legendy</h3>
                  {isEditing ? (
                    <textarea
                      ref={legendRef}
                      value={editLegend}
                      onChange={(e) => setEditLegend(e.target.value)}
                      onInput={onLegendInput}
                      rows={5}
                      className="w-full px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-0 focus:border-gray-400 dark:bg-gray-800 dark:text-white resize-none transition-all min-h-[80px] overflow-hidden"
                      placeholder="Historie i legendy"
                    />
                  ) : (
                    <p className="text-xs text-gray-700 dark:text-gray-300">
                      {post.legend || 'Brak historii i legend'}
                    </p>
                  )}
                </div>
              </div>
            </div>

                        {/* Status */}
                        <div className="bg-white/10 dark:bg-gray-800/20 backdrop-blur-sm border-2 border-purple-200/50 dark:border-purple-400/30 rounded-lg p-2 sm:p-3 shadow-xl">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-2">
                              <div className="w-2 h-2 rounded-full bg-purple-500"></div>
                              <span className="text-xs font-medium text-purple-600 dark:text-purple-400">
                                Status: {post.status === 'Approved' ? 'Zatwierdzone' : 
                                        post.status === 'Pending' ? 'Oczekujące' : 'Odrzucone'}
                              </span>
                            </div>
                            
                            {post.votesCount !== undefined && (
                              <div className="text-xs text-purple-500 dark:text-purple-400">
                                Głosy: {post.votesCount}
                              </div>
                            )}
                          </div>
                        </div>
          </div>
        </div>
      </div>

      {/* Delete Post Confirmation Modal */}
      <DeleteConfirmationModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={handleDeletePost}
        title="Usuń post"
        message="Czy na pewno chcesz usunąć ten post? Ta akcja jest nieodwracalna."
        confirmText="Usuń post"
        cancelText="Anuluj"
        isLoading={isDeleting}
      />

      {/* Photo Preview Modal */}
      <AnimatePresence>
        {showPhotoModal && post.imageUrls && post.imageUrls.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/90 flex items-center justify-center z-[9999] p-4"
            onClick={closePhotoModal}
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              className="relative max-w-5xl max-h-[90vh] w-full"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Close button */}
              <button
                onClick={closePhotoModal}
                className="absolute -top-12 right-0 text-white hover:text-gray-300 transition-colors z-10"
              >
                <X className="w-8 h-8" />
              </button>

              {/* Photo counter */}
              <div className="absolute -top-12 left-0 text-white text-lg font-medium z-10">
                {selectedPhotoIndex + 1} / {post.imageUrls.length}
              </div>

              {/* Main photo */}
              <img
                src={post.imageUrls[selectedPhotoIndex]}
                alt={`Photo ${selectedPhotoIndex + 1}`}
                className="max-w-full max-h-full object-contain rounded-lg"
              />

              {/* Navigation arrows */}
              {post.imageUrls.length > 1 && (
                <>
                  <button
                    onClick={prevPhoto}
                    className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-black/50 text-white hover:bg-black/70 transition-colors rounded-full p-2"
                  >
                    <ChevronLeft className="w-6 h-6" />
                  </button>
                  <button
                    onClick={nextPhoto}
                    className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-black/50 text-white hover:bg-black/70 transition-colors rounded-full p-2"
                  >
                    <ChevronRight className="w-6 h-6" />
                  </button>
                </>
              )}

              {/* Thumbnail strip */}
              {post.imageUrls.length > 1 && (
                <div className="flex gap-2 bg-black/50 rounded-lg p-2 mt-4">
                  {post.imageUrls.map((photo, index) => (
                    <button
                      key={index}
                      onClick={() => setSelectedPhotoIndex(index)}
                      className={`w-12 h-12 rounded overflow-hidden transition-opacity ${
                        index === selectedPhotoIndex ? 'opacity-100 ring-2 ring-white' : 'opacity-60 hover:opacity-80'
                      }`}
                    >
                      <img
                        src={photo}
                        alt={`Thumbnail ${index + 1}`}
                        className="w-full h-full object-cover"
                      />
                    </button>
                  ))}
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Map Screenshot Preview Modal */}
      <AnimatePresence>
        {showMapScreenshotModal && post.treeScreenshotUrl && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/90 flex items-center justify-center z-[9999] p-4"
            onClick={closeMapScreenshotModal}
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              className="relative max-w-5xl max-h-[90vh] w-full"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Close button */}
              <button
                onClick={closeMapScreenshotModal}
                className="absolute -top-12 right-4 text-white hover:text-gray-300 transition-colors z-10"
              >
                <X className="w-8 h-8" />
              </button>

              {/* Title */}
              <div className="absolute -top-12 left-1/2 transform -translate-x-1/2 text-white text-lg font-medium z-10 whitespace-nowrap">
                Screenshot mapy lokalizacji
              </div>

              {/* Main screenshot */}
              <img
                src={post.treeScreenshotUrl}
                alt="Map screenshot"
                className="max-w-[90vw] max-h-[80vh] object-contain rounded-lg shadow-lg mx-auto block"
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};