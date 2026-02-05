import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity, TextInput, Modal, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { X, Sparkles, ListChecks, Send, MapPin } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Colors from '@/constants/colors';
import { useTourCreation } from '@/contexts/TourCreationContext';
import { getBaseUrl } from '@/lib/api';
import { useMutation, useQueryClient, useQuery } from '@tanstack/react-query';
import { createTour, getAttractions, getCafes } from '@/lib/api';
import { useUser } from '@/contexts/UserContext';
import { useRouter } from 'expo-router';

interface CreateTourModalProps {
  visible: boolean;
  onClose: () => void;
  onEnableSelectionMode?: () => void;
}

export default function CreateTourModal({ visible, onClose, onEnableSelectionMode }: CreateTourModalProps) {
  const [mode, setMode] = useState<'select' | 'ai' | 'naming' | null>(null);
  const [tourNameInput, setTourNameInput] = useState('');
  const [inputText, setInputText] = useState('');
  const { enableSelectionMode } = useTourCreation();
  const { user } = useUser();
  const router = useRouter();
  const queryClient = useQueryClient();
  
  const attractionsQuery = useQuery({
    queryKey: ['attractions'],
    queryFn: () => getAttractions(),
  });
  const cafesQuery = useQuery({
    queryKey: ['cafes'],
    queryFn: () => getCafes(),
  });
  
  const generateTourMutation = useMutation({
    mutationFn: createTour,
    onSuccess: (data) => {
      console.log('AI Tour generated:', data);
      queryClient.invalidateQueries({ queryKey: ['tours', user.id] });
      setMode(null);
      setInputText('');
      onClose();
      router.push({ pathname: '/tour/[id]', params: { id: data.id } });
    },
    onError: (error) => {
      console.error('Failed to generate tour:', error);
    },
  });
  
  const [messages, setMessages] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const handleToolCall = async (toolName: string, args: any) => {
    if (toolName === 'searchPlaces') {
      const allPlaces = [
        ...(attractionsQuery.data || []).map(p => ({ ...p, type: 'attraction' })),
        ...(cafesQuery.data || []).map(p => ({ ...p, type: 'cafe' })),
      ];
      
      const filtered = allPlaces.filter(place => 
        place.name.toLowerCase().includes(args.query.toLowerCase()) ||
        place.category?.toLowerCase().includes(args.query.toLowerCase()) ||
        place.description?.toLowerCase().includes(args.query.toLowerCase())
      ).slice(0, 8);
      
      return {
        places: filtered.map(p => ({
          id: p.id,
          name: p.name,
          category: p.category,
          description: p.description,
        })),
      };
    }
    
    if (toolName === 'createTour') {
      if (!user.location) {
        return { error: 'User location not available' };
      }
      
      const startDate = new Date();
      startDate.setDate(startDate.getDate() + 1);
      
      generateTourMutation.mutate({
        userId: user.id,
        title: args.title,
        placeIds: args.placeIds,
        userLocation: user.location,
        startDate: startDate.toISOString(),
      });
      
      return { success: true, message: 'Creating your tour...' };
    }
  };

  const append = async ({ role, content }: { role: string; content: string }) => {
    const userMessage = { id: `msg-${Date.now()}`, role, content };
    setMessages(prev => [...prev, userMessage]);
    setIsLoading(true);

    try {
      const response = await fetch(getBaseUrl() + '/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [...messages, userMessage],
          tools: {
            searchPlaces: {
              description: 'Search for places (attractions, cafes) in Tokyo by category, type, or keyword.',
              parameters: {
                type: 'object',
                properties: {
                  query: { type: 'string', description: 'Search query' }
                },
                required: ['query']
              },
            },
            createTour: {
              description: 'Create a tour with selected place IDs and tour title.',
              parameters: {
                type: 'object',
                properties: {
                  title: { type: 'string', description: 'Tour title' },
                  placeIds: { type: 'array', items: { type: 'string' }, description: 'Place IDs' }
                },
                required: ['title', 'placeIds']
              },
            },
          },
        }),
      });

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      let assistantMessage = { id: `msg-${Date.now() + 1}`, role: 'assistant', content: '', toolInvocations: [] as any[] };
      setMessages(prev => [...prev, assistantMessage]);

      if (reader) {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          const chunk = decoder.decode(value);
          const lines = chunk.split('\n').filter(line => line.trim());

          for (const line of lines) {
            if (line.startsWith('0:')) {
              const text = line.substring(3).replace(/^"(.*)"$/, '$1');
              assistantMessage.content += text;
              setMessages(prev => prev.map(m => m.id === assistantMessage.id ? { ...assistantMessage } : m));
            } else if (line.startsWith('9:')) {
              const toolData = JSON.parse(line.substring(2));
              if (toolData.toolCallId) {
                const toolInvocation = {
                  toolCallId: toolData.toolCallId,
                  toolName: toolData.toolName,
                  args: toolData.args,
                  state: 'call' as const,
                };
                assistantMessage.toolInvocations.push(toolInvocation);
                setMessages(prev => prev.map(m => m.id === assistantMessage.id ? { ...assistantMessage } : m));

                const result = await handleToolCall(toolData.toolName, toolData.args);
                const invIndex = assistantMessage.toolInvocations.findIndex(t => t.toolCallId === toolData.toolCallId);
                if (invIndex !== -1) {
                  assistantMessage.toolInvocations[invIndex] = {
                    ...assistantMessage.toolInvocations[invIndex],
                    state: 'result' as const,
                    result,
                  };
                  setMessages(prev => prev.map(m => m.id === assistantMessage.id ? { ...assistantMessage } : m));
                }
              }
            }
          }
        }
      }
    } catch (error) {
      console.error('Chat error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendMessage = async () => {
    if (!inputText.trim() || isLoading) return;
    const text = inputText;
    setInputText('');
    await append({ role: 'user', content: text });
  };
  
  useEffect(() => {
    if (visible && mode === 'ai' && messages.length === 0) {
      setMessages([
        {
          id: `msg-${Date.now()}`,
          role: 'assistant',
          content: 'Hi! I\'ll help you create the perfect Tokyo tour. What are you interested in? (temples, sushi restaurants, modern architecture, shopping, parks, etc.)',
        },
      ]);
    }
  }, [visible, mode, messages.length, setMessages]);

  const handleManualCreate = () => {
    setMode('naming');
  };

  const handleStartSelection = () => {
    if (!tourNameInput.trim()) return;
    enableSelectionMode(tourNameInput);
    setTourNameInput('');
    setMode(null);
    onClose();
    if (onEnableSelectionMode) {
      onEnableSelectionMode();
    }
  };

  const handleClose = () => {
    if (mode) {
      setMode(null);
      setTourNameInput('');
      setInputText('');
    } else {
      setMode(null);
      setTourNameInput('');
      setInputText('');
      onClose();
    }
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={false}
      onRequestClose={onClose}
    >
      <View style={styles.modalContainer}>
        <LinearGradient
          colors={['#F0F4FF', '#FFE5F0', '#E8F5F7']}
          style={StyleSheet.absoluteFill}
        />
        
        <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
          <View style={styles.header}>
            <Text style={styles.title}>Create New Tour</Text>
            <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
              <X size={24} color={Colors.textPrimary} />
            </TouchableOpacity>
          </View>

          {!mode ? (
            <View style={styles.modeSelection}>
              <TouchableOpacity 
                style={styles.modeCard} 
                activeOpacity={0.9}
                onPress={() => setMode('ai')}
              >
                <LinearGradient
                  colors={[Colors.sakuraPink, Colors.skyBlue]}
                  style={StyleSheet.absoluteFill}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                />
                <View style={styles.modeIconContainer}>
                  <Sparkles size={48} color={Colors.snowWhite} />
                </View>
                <Text style={styles.modeTitle}>AI Tour Generator</Text>
                <Text style={styles.modeDescription}>
                  Let AI create an optimized itinerary based on your interests
                </Text>
              </TouchableOpacity>

              <TouchableOpacity 
                style={[styles.modeCard, styles.modeCardWhite]} 
                activeOpacity={0.9}
                onPress={handleManualCreate}
              >
                <View style={[styles.modeIconContainer, styles.modeIconContainerWhite]}>
                  <ListChecks size={48} color={Colors.fujiBlue} />
                </View>
                <Text style={[styles.modeTitle, styles.modeTitleDark]}>Manual Selection</Text>
                <Text style={[styles.modeDescription, styles.modeDescriptionDark]}>
                  Browse attractions and build your own custom tour
                </Text>
              </TouchableOpacity>
            </View>
          ) : mode === 'naming' ? (
            <View style={styles.namingContainer}>
              <Text style={styles.namingTitle}>Name Your Tour</Text>
              <Text style={styles.namingDescription}>
                Give your custom tour a memorable name
              </Text>
              
              <TextInput
                style={styles.nameInput}
                placeholder="e.g., My Perfect Tokyo Adventure"
                placeholderTextColor={Colors.textSecondary}
                value={tourNameInput}
                onChangeText={setTourNameInput}
                autoFocus
              />

              <TouchableOpacity
                style={[styles.continueButton, !tourNameInput.trim() && styles.continueButtonDisabled]}
                onPress={handleStartSelection}
                disabled={!tourNameInput.trim()}
                activeOpacity={0.8}
              >
                <Text style={styles.continueButtonText}>Continue to Select Places</Text>
              </TouchableOpacity>
            </View>
          ) : mode === 'ai' ? (
            <View style={styles.chatContainer}>
              <ScrollView 
                style={styles.messagesContainer}
                contentContainerStyle={styles.messagesContent}
                showsVerticalScrollIndicator={false}
              >
                {messages.map((msg: any) => (
                  <View key={msg.id} style={{ marginVertical: 6 }}>
                    {msg.content && (
                      <View
                        style={[
                          styles.messageBubble,
                          msg.role === 'user' ? styles.userBubble : styles.aiBubble
                        ]}
                      >
                        <Text style={[
                          styles.messageText,
                          msg.role === 'user' ? styles.userText : styles.aiText
                        ]}>
                          {msg.content}
                        </Text>
                      </View>
                    )}
                    {msg.toolInvocations?.map((tool: any, i: number) => {
                      if (tool.state === 'call') {
                        return (
                          <View key={`${msg.id}-${i}`} style={styles.toolBubble}>
                            <ActivityIndicator size="small" color={Colors.sakuraPink} />
                            <Text style={styles.toolText}>
                              {tool.toolName === 'searchPlaces' ? 'Searching places...' : 'Creating tour...'}
                            </Text>
                          </View>
                        );
                      }
                      
                      if (tool.state === 'result') {
                        if (tool.toolName === 'searchPlaces') {
                          const output = tool.result;
                          if (output?.places) {
                            return (
                              <View key={`${msg.id}-${i}`} style={styles.placesContainer}>
                                {output.places.map((place: any) => (
                                  <View key={place.id} style={styles.placeCard}>
                                    <MapPin size={16} color={Colors.sakuraPink} />
                                    <View style={styles.placeInfo}>
                                      <Text style={styles.placeName}>{place.name}</Text>
                                      <Text style={styles.placeCategory} numberOfLines={1}>{place.category}</Text>
                                    </View>
                                  </View>
                                ))}
                              </View>
                            );
                          }
                        }
                        return null;
                      }
                      return null;
                    })}
                  </View>
                ))}
              </ScrollView>

              <View style={styles.inputContainer}>
                <TextInput
                  style={styles.input}
                  placeholder="Type your message..."
                  placeholderTextColor={Colors.textSecondary}
                  value={inputText}
                  onChangeText={setInputText}
                  multiline
                  maxLength={500}
                />
                <TouchableOpacity 
                  style={styles.sendButton}
                  onPress={handleSendMessage}
                  activeOpacity={0.8}
                >
                  <Send size={20} color={Colors.snowWhite} />
                </TouchableOpacity>
              </View>
            </View>
          ) : null}
        </SafeAreaView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.textPrimary,
  },
  closeButton: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: Colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modeSelection: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 20,
    gap: 16,
  },
  modeCard: {
    flex: 1,
    borderRadius: 10,
    padding: 32,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  modeCardWhite: {
    backgroundColor: Colors.surface,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  modeIconContainer: {
    width: 96,
    height: 96,
    borderRadius: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  modeIconContainerWhite: {
    backgroundColor: '#EBF5FF',
  },
  modeTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.snowWhite,
    marginBottom: 12,
    textAlign: 'center',
  },
  modeTitleDark: {
    color: Colors.textPrimary,
  },
  modeDescription: {
    fontSize: 16,
    color: Colors.snowWhite,
    textAlign: 'center',
    lineHeight: 24,
    opacity: 0.9,
  },
  modeDescriptionDark: {
    color: Colors.textSecondary,
    opacity: 1,
  },
  chatContainer: {
    flex: 1,
    paddingHorizontal: 20,
  },
  messagesContainer: {
    flex: 1,
  },
  messagesContent: {
    paddingVertical: 16,
  },
  messageBubble: {
    maxWidth: '80%',
    padding: 16,
    borderRadius: 10,
    marginBottom: 12,
  },
  userBubble: {
    alignSelf: 'flex-end',
    backgroundColor: Colors.sakuraPink,
  },
  aiBubble: {
    alignSelf: 'flex-start',
    backgroundColor: Colors.surface,
  },
  messageText: {
    fontSize: 15,
    lineHeight: 22,
  },
  userText: {
    color: Colors.snowWhite,
  },
  aiText: {
    color: Colors.textPrimary,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingVertical: 16,
    gap: 12,
  },
  input: {
    flex: 1,
    backgroundColor: Colors.surface,
    borderRadius: 10,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: Colors.textPrimary,
    maxHeight: 120,
  },
  sendButton: {
    width: 48,
    height: 48,
    borderRadius: 10,
    backgroundColor: Colors.sakuraPink,
    justifyContent: 'center',
    alignItems: 'center',
  },
  namingContainer: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 40,
  },
  namingTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: Colors.textPrimary,
    marginBottom: 12,
  },
  namingDescription: {
    fontSize: 16,
    color: Colors.textSecondary,
    marginBottom: 32,
    lineHeight: 24,
  },
  nameInput: {
    backgroundColor: Colors.surface,
    borderRadius: 10,
    paddingHorizontal: 16,
    paddingVertical: 16,
    fontSize: 18,
    color: Colors.textPrimary,
    marginBottom: 24,
  },
  continueButton: {
    backgroundColor: Colors.sakuraPink,
    borderRadius: 10,
    paddingVertical: 16,
    alignItems: 'center',
  },
  continueButtonDisabled: {
    opacity: 0.5,
  },
  continueButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.snowWhite,
  },
  toolBubble: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8F9FA',
    padding: 12,
    borderRadius: 10,
    gap: 8,
  },
  toolText: {
    fontSize: 14,
    color: Colors.textSecondary,
    fontStyle: 'italic',
  },
  placesContainer: {
    gap: 8,
    marginTop: 4,
  },
  placeCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    padding: 12,
    borderRadius: 10,
    gap: 10,
  },
  placeInfo: {
    flex: 1,
  },
  placeName: {
    fontSize: 15,
    fontWeight: '600',
    color: Colors.textPrimary,
    marginBottom: 2,
  },
  placeCategory: {
    fontSize: 13,
    color: Colors.textSecondary,
  },
  errorBubble: {
    backgroundColor: '#FFEBEE',
    padding: 12,
    borderRadius: 10,
  },
  errorText: {
    fontSize: 14,
    color: '#C62828',
  },
});
