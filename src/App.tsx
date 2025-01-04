import React, { useEffect, useState } from 'react';
import { supabase } from './lib/supabase';
import { AuthForm } from './components/AuthForm';
import { ChatMessage } from './components/ChatMessage';
import { ChatInput } from './components/ChatInput';
import { MessageCircle, LogOut } from 'lucide-react';

interface Message {
  id: string;
  content: string;
  user_id: string;
  created_at: string;
  profiles: {
    username: string;
    avatar_url: string | null;
  };
}

function App() {
  const [session, setSession] = useState(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [profile, setProfile] = useState(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session?.user) {
        fetchProfile(session.user.id);
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (session?.user) {
        fetchProfile(session.user.id);
      } else {
        setProfile(null);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (session) {
      fetchMessages();
      
      const channel = supabase
        .channel('public:messages')
        .on('postgres_changes', { 
          event: 'INSERT', 
          schema: 'public', 
          table: 'messages' 
        }, payload => {
          const newMessage = payload.new as Message;
          setMessages(prev => [...prev, newMessage]);
        })
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    }
  }, [session]);

  const fetchProfile = async (userId: string) => {
    const { data } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();
    setProfile(data);
  };

  const fetchMessages = async () => {
    const { data } = await supabase
      .from('messages')
      .select(`
        *,
        profiles (
          username,
          avatar_url
        )
      `)
      .order('created_at', { ascending: true });
    setMessages(data || []);
  };

  const handleSendMessage = async (content: string) => {
    if (!session?.user) return;

    await supabase.from('messages').insert({
      content,
      user_id: session.user.id
    });
  };

  const handleSignOut = () => {
    supabase.auth.signOut();
  };

  if (!session) {
    return <AuthForm />;
  }

  return (
    <div className="flex flex-col h-screen bg-gray-50">
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <div className="flex items-center">
            <MessageCircle className="h-8 w-8 text-blue-500" />
            <h1 className="ml-2 text-xl font-bold text-gray-900">Chat App</h1>
          </div>
          <button
            onClick={handleSignOut}
            className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <LogOut className="h-4 w-4 mr-2" />
            Sign out
          </button>
        </div>
      </header>

      <main className="flex-1 overflow-y-auto p-4">
        <div className="max-w-3xl mx-auto space-y-4">
          {messages.map((message) => (
            <ChatMessage
              key={message.id}
              content={message.content}
              username={message.profiles.username}
              avatarUrl={message.profiles.avatar_url}
              timestamp={message.created_at}
              isOwnMessage={message.user_id === session.user.id}
            />
          ))}
        </div>
      </main>

      <div className="max-w-3xl mx-auto w-full">
        <ChatInput onSendMessage={handleSendMessage} />
      </div>
    </div>
  );
}

export default App;