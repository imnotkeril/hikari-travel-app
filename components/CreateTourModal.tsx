import React, { useState } from 'react';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity, TextInput, Modal } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { X, Sparkles, ListChecks, Send } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Colors from '@/constants/colors';
import { useTourCreation } from '@/contexts/TourCreationContext';

interface CreateTourModalProps {
  visible: boolean;
  onClose: () => void;
  onEnableSelectionMode?: () => void;
}

export default function CreateTourModal({ visible, onClose, onEnableSelectionMode }: CreateTourModalProps) {
  const [mode, setMode] = useState<'select' | 'ai' | 'naming' | null>(null);
  const [tourNameInput, setTourNameInput] = useState('');
  const [messages, setMessages] = useState<{ role: 'user' | 'ai'; text: string }[]>([
    { role: 'ai', text: 'Hi! I\'ll help you create the perfect Tokyo tour. What are you interested in? (temples, sushi, modern architecture, etc.)' }
  ]);
  const [inputText, setInputText] = useState('');
  const { enableSelectionMode } = useTourCreation();

  const handleSendMessage = () => {
    if (!inputText.trim()) return;
    
    setMessages([...messages, { role: 'user', text: inputText }]);
    setInputText('');
    
    setTimeout(() => {
      setMessages(prev => [...prev, { 
        role: 'ai', 
        text: 'Great! How many days will you be in Tokyo?' 
      }]);
    }, 1000);
  };

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
      setMessages([{ role: 'ai', text: 'Hi! I\'ll help you create the perfect Tokyo tour. What are you interested in? (temples, sushi, modern architecture, etc.)' }]);
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
                {messages.map((msg, index) => (
                  <View 
                    key={index} 
                    style={[
                      styles.messageBubble,
                      msg.role === 'user' ? styles.userBubble : styles.aiBubble
                    ]}
                  >
                    <Text style={[
                      styles.messageText,
                      msg.role === 'user' ? styles.userText : styles.aiText
                    ]}>
                      {msg.text}
                    </Text>
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
});
