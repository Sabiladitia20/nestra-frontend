import { createClient } from './client';

// ─── Types ──────────────────────────────────────────────────────────────────────
export interface ChatSession {
  id: string;
  user_id: string;
  title: string;
  created_at: string;
  updated_at: string;
}

export interface ChatMessage {
  id: string;
  session_id: string;
  role: 'user' | 'assistant';
  content: string;
  created_at: string;
}

// ─── Helpers ────────────────────────────────────────────────────────────────────

/** Get the currently logged-in user's ID, or null */
export async function getCurrentUserId(): Promise<string | null> {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  return user?.id ?? null;
}

/** Create a new chat session */
export async function createChatSession(userId: string, title = 'Chat Baru'): Promise<ChatSession | null> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('chat_sessions')
    .insert({ user_id: userId, title })
    .select()
    .single();

  if (error) {
    console.error('Error creating chat session:', error.message);
    return null;
  }
  return data as ChatSession;
}

/** Fetch all chat sessions for a user, ordered by most recently updated */
export async function getChatSessions(userId: string): Promise<ChatSession[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('chat_sessions')
    .select('*')
    .eq('user_id', userId)
    .order('updated_at', { ascending: false });

  if (error) {
    console.error('Error fetching chat sessions:', error.message);
    return [];
  }
  return (data ?? []) as ChatSession[];
}

/** Fetch all messages for a given session, ordered chronologically */
export async function getChatMessages(sessionId: string): Promise<ChatMessage[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('chat_messages')
    .select('*')
    .eq('session_id', sessionId)
    .order('created_at', { ascending: true });

  if (error) {
    console.error('Error fetching chat messages:', error.message);
    return [];
  }
  return (data ?? []) as ChatMessage[];
}

/** Add a message to a session and bump the session's updated_at timestamp */
export async function addChatMessage(
  sessionId: string,
  role: 'user' | 'assistant',
  content: string,
): Promise<ChatMessage | null> {
  const supabase = createClient();

  // Insert the message
  const { data, error } = await supabase
    .from('chat_messages')
    .insert({ session_id: sessionId, role, content })
    .select()
    .single();

  if (error) {
    console.error('Error adding chat message:', error.message);
    return null;
  }

  // Bump session updated_at
  await supabase
    .from('chat_sessions')
    .update({ updated_at: new Date().toISOString() })
    .eq('id', sessionId);

  return data as ChatMessage;
}

/** Update a session's title (e.g. from the first user message) */
export async function updateSessionTitle(sessionId: string, title: string): Promise<void> {
  const supabase = createClient();
  const truncated = title.length > 50 ? title.slice(0, 50) + '…' : title;
  await supabase
    .from('chat_sessions')
    .update({ title: truncated })
    .eq('id', sessionId);
}

/** Delete a chat session (cascades to messages via FK) */
export async function deleteChatSession(sessionId: string): Promise<void> {
  const supabase = createClient();
  const { error } = await supabase
    .from('chat_sessions')
    .delete()
    .eq('id', sessionId);

  if (error) {
    console.error('Error deleting chat session:', error.message);
  }
}
