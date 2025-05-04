'use client'
import { motion } from 'framer-motion'
import { useState, useRef, useEffect } from 'react'
import { FiSend, FiSmile, FiClock, FiCheck, FiMenu, FiArrowLeft } from 'react-icons/fi'

type User = {
  id: string
  name: string
  avatar: string
  status: 'online' | 'offline' | 'busy' | 'away'
  customStatus?: string
}

type Message = {
  id: string
  text: string
  from: string
  fromId: string
  time: string
  reactions?: Record<string, string[]>
  isRead?: boolean
}

const statusMessages = {
  online: 'Active now',
  offline: 'Offline',
  busy: 'Busy',
  away: 'Away',
}

const quickStatuses = ['brb', 'busy', 'in a meeting', 'available']

export default function ChatApp() {
  const [users, setUsers] = useState<User[]>([])
  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [typing, setTyping] = useState(false)
  const [showEmojiPicker, setShowEmojiPicker] = useState(false)
  const [showStatusMenu, setShowStatusMenu] = useState(false)
  const [userStatus, setUserStatus] = useState<'online' | 'offline' | 'busy' | 'away'>('online')
  const [customStatus, setCustomStatus] = useState('')
  const [showSidebar, setShowSidebar] = useState(true)
  const [isMobile, setIsMobile] = useState(false)

  const messageEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const emojis = ['😀', '😂', '❤️', '👍', '🙏', '🔥', '🎉', '🤔']

  useEffect(() => {
    const checkIfMobile = () => {
      setIsMobile(window.innerWidth < 768)
      if (window.innerWidth >= 768) {
        setShowSidebar(true)
      }
    }

    checkIfMobile()
    window.addEventListener('resize', checkIfMobile)
    return () => window.removeEventListener('resize', checkIfMobile)
  }, [])

  useEffect(() => {
    const sampleUsers: User[] = [
      {
        id: '1',
        name: 'Alice',
        avatar: `https://i.pravatar.cc/150?img=1`,
        status: 'online',
        customStatus: 'Working on the project'
      },
      {
        id: '2',
        name: 'Bob',
        avatar: `https://i.pravatar.cc/150?img=2`,
        status: 'online'
      },
      {
        id: '3',
        name: 'Charlie',
        avatar: `https://i.pravatar.cc/150?img=3`,
        status: 'away',
        customStatus: 'brb'
      }
    ]
    setUsers(sampleUsers)
  }, [])

  useEffect(() => {
    if (selectedUser) {
      const userMessages: Message[] = [
        {
          id: '1',
          text: `Hi there! This is the start of your conversation with ${selectedUser.name}`,
          from: selectedUser.name,
          fromId: selectedUser.id,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        },
        {
          id: '2',
          text: 'How can I help you today?',
          from: selectedUser.name,
          fromId: selectedUser.id,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]
      setMessages(userMessages)
      if (isMobile) setShowSidebar(false)
    } else {
      setMessages([])
    }
  }, [selectedUser, isMobile])

  useEffect(() => {
    messageEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const handleSendMessage = () => {
    if (!input.trim() || !selectedUser) return

    const newMessage: Message = {
      id: Date.now().toString(),
      text: input,
      from: 'You',
      fromId: 'you',
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      isRead: false
    }

    setMessages([...messages, newMessage])
    setInput('')
    setShowEmojiPicker(false)

    if (Math.random() > 0.3) {
      setTyping(true)
      setTimeout(() => {
        const replies = [
          'Got it!',
          'Thanks for letting me know',
          'I see what you mean',
          'Let me think about that',
          'What about you?',
        ]
        const replyMessage: Message = {
          id: Date.now().toString(),
          text: replies[Math.floor(Math.random() * replies.length)],
          from: selectedUser.name,
          fromId: selectedUser.id,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
        setMessages(prev => [...prev, replyMessage])
        setTyping(false)
      }, 1000 + Math.random() * 2000)
    }
  }

  const handleReaction = (messageId: string, emoji: string) => {
    setMessages(messages.map(msg => {
      if (msg.id === messageId) {
        const reactions = msg.reactions || {}
        const userReactions = reactions[emoji] || []

        // Toggle reaction
        if (userReactions.includes('you')) {
          const updated = userReactions.filter(id => id !== 'you')
          if (updated.length === 0) {
            const rest = { ...reactions };
            delete rest[emoji];
            return { ...msg, reactions: Object.keys(rest).length ? rest : undefined }
          }
          return { ...msg, reactions: { ...reactions, [emoji]: updated } }
        } else {
          return { ...msg, reactions: { ...reactions, [emoji]: [...userReactions, 'you'] } }
        }
      }
      return msg
    }))
  }

  const sendQuickStatus = (status: string) => {
    if (!selectedUser) return

    const newMessage: Message = {
      id: Date.now().toString(),
      text: status,
      from: 'You',
      fromId: 'you',
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      isRead: false
    }
    setMessages([...messages, newMessage])
    setShowStatusMenu(false)
  }

  const updateStatus = (status: typeof userStatus, custom?: string) => {
    setUserStatus(status)
    if (custom) setCustomStatus(custom)
    setShowStatusMenu(false)
  }

  const handleBackToChatList = () => {
    setSelectedUser(null)
    if (isMobile) setShowSidebar(true)
  }

  return (
    <div className="flex h-screen bg-gray-50 text-gray-800">
      {isMobile && (
        <div className="md:hidden fixed top-0 left-0 right-0 bg-white p-3 border-b border-gray-200 flex items-center z-10">
          {selectedUser ? (
            <>
              <button
                onClick={handleBackToChatList}
                className="p-2 mr-2 text-gray-600"
              >
                <FiArrowLeft className="w-5 h-5" />
              </button>
              <div className="flex items-center flex-1">
                <div className="relative mr-3">
                  <img
                    src={selectedUser.avatar}
                    className="w-8 h-8 rounded-full"
                    alt={selectedUser.name}
                  />
                  <span className={`absolute bottom-0 right-0 w-2 h-2 rounded-full border border-white ${selectedUser.status === 'online' ? 'bg-green-500' :
                    selectedUser.status === 'busy' ? 'bg-red-500' :
                      selectedUser.status === 'away' ? 'bg-yellow-500' : 'bg-gray-400'
                    }`}></span>
                </div>
                <div className="flex-1">
                  <h2 className="font-semibold">{selectedUser.name}</h2>
                  <p className="text-xs text-gray-500">
                    {typing ? 'typing...' : selectedUser.customStatus || statusMessages[selectedUser.status]}
                  </p>
                </div>
              </div>
            </>
          ) : (
            <>
              <button
                onClick={() => setShowSidebar(!showSidebar)}
                className="p-2 mr-2 text-gray-600"
              >
                <FiMenu className="w-5 h-5" />
              </button>
              <h2 className="font-semibold">Messages</h2>
            </>
          )}
        </div>
      )}

      <div className={`${showSidebar ? 'flex' : 'hidden'} md:flex w-full md:w-1/4 border-r border-gray-200 bg-white flex-col fixed md:relative h-full z-20`}>


        <div className="p-4 border-b border-gray-200 relative">
          <button
            onClick={() => setShowStatusMenu(!showStatusMenu)}
            className="flex items-center space-x-2 w-full group"
          >
            <div className="relative">
              <img
                src="https://i.pravatar.cc/150?img=4"
                className="w-10 h-10 rounded-full"
                alt="Your profile"
              />
              <span className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-white ${userStatus === 'online' ? 'bg-green-500' :
                userStatus === 'busy' ? 'bg-red-500' :
                  userStatus === 'away' ? 'bg-yellow-500' : 'bg-gray-400'
                }`}></span>
            </div>
            <div className="text-left">
              <p className="font-medium">You</p>
              <p className="text-xs text-gray-500">
                {customStatus || statusMessages[userStatus]}
              </p>
            </div>
          </button>

          {showStatusMenu && (
            <div className="absolute left-4 right-4 mt-2 bg-white shadow-lg rounded-md p-2 z-10">
              <div className="p-2">
                <h4 className="text-xs font-semibold text-gray-500 mb-1">SET STATUS</h4>
                {(['online', 'away', 'busy', 'offline'] as const).map(status => (
                  <button
                    key={status}
                    onClick={() => updateStatus(status)}
                    className="flex items-center w-full p-2 hover:bg-gray-100 rounded"
                  >
                    <span className={`w-2 h-2 rounded-full mr-2 ${status === 'online' ? 'bg-green-500' :
                      status === 'busy' ? 'bg-red-500' :
                        status === 'away' ? 'bg-yellow-500' : 'bg-gray-400'
                      }`}></span>
                    <span>{statusMessages[status]}</span>
                    {userStatus === status && <FiCheck className="ml-auto" />}
                  </button>
                ))}
              </div>

              <div className="p-2 border-t border-gray-100">
                <h4 className="text-xs font-semibold text-gray-500 mb-1">QUICK STATUS</h4>
                {quickStatuses.map(status => (
                  <button
                    key={status}
                    onClick={() => {
                      updateStatus('online', status)
                      sendQuickStatus(status)
                    }}
                    className="w-full text-left p-2 hover:bg-gray-100 rounded"
                  >
                    {status}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="flex-1 overflow-y-auto p-4">
          <h2 className="font-semibold mb-4">Online Users</h2>
          <ul className="space-y-3">
            {users.map(user => (
              <li
                key={user.id}
                onClick={() => setSelectedUser(user)}
                className={`flex items-center p-2 rounded-lg cursor-pointer transition-colors ${selectedUser?.id === user.id ? 'bg-blue-100' : 'hover:bg-gray-100'
                  }`}
              >
                <div className="relative mr-3">
                  <img
                    src={user.avatar}
                    className="w-10 h-10 rounded-full"
                    alt={user.name}
                  />
                  <span className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-white ${user.status === 'online' ? 'bg-green-500' :
                    user.status === 'busy' ? 'bg-red-500' :
                      user.status === 'away' ? 'bg-yellow-500' : 'bg-gray-400'
                    }`}></span>
                </div>
                <div>
                  <p className="font-medium">{user.name}</p>
                  <p className="text-xs text-gray-500">
                    {user.customStatus || statusMessages[user.status]}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className={`flex-1 flex flex-col ${isMobile ? 'pt-14' : ''}`}>
        {selectedUser ? (
          <>
            {!isMobile && (
              <div className="p-4 border-b border-gray-200 bg-white flex items-center">
                <div className="relative mr-3">
                  <img
                    src={selectedUser.avatar}
                    className="w-10 h-10 rounded-full"
                    alt={selectedUser.name}
                  />
                  <span className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-white ${selectedUser.status === 'online' ? 'bg-green-500' :
                    selectedUser.status === 'busy' ? 'bg-red-500' :
                      selectedUser.status === 'away' ? 'bg-yellow-500' : 'bg-gray-400'
                    }`}></span>
                </div>
                <div>
                  <h2 className="font-semibold">{selectedUser.name}</h2>
                  <p className="text-xs text-gray-500">
                    {typing ? 'typing...' : selectedUser.customStatus || statusMessages[selectedUser.status]}
                  </p>
                </div>
              </div>
            )}

            <div className="flex-1 overflow-y-auto p-4 bg-gray-50">
              <div className="space-y-3">
                {messages.map(message => (
                  <div
                    key={message.id}
                    className={`flex ${message.fromId === 'you' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div className="group relative">
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${message.fromId === 'you'
                          ? 'bg-blue-600 text-white rounded-br-none'
                          : 'bg-white border border-gray-200 rounded-bl-none'
                          }`}
                      >
                        <p>{message.text}</p>
                        <div className={`flex items-center justify-between mt-1 text-xs ${message.fromId === 'you' ? 'text-blue-200' : 'text-gray-500'
                          }`}>
                          <span>{message.time}</span>
                          {message.fromId === 'you' && (
                            <span>{message.isRead ? '✓✓' : '✓'}</span>
                          )}
                        </div>

                        {message.reactions && Object.entries(message.reactions).length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-2">
                            {Object.entries(message.reactions).map(([emoji, users]) => (
                              <button
                                key={emoji}
                                onClick={() => handleReaction(message.id, emoji)}
                                className={`text-xs px-1 rounded ${users.includes('you')
                                  ? 'bg-blue-100 text-blue-800'
                                  : 'bg-gray-100 text-gray-800'
                                  }`}
                              >
                                {emoji} {users.length}
                              </button>
                            ))}
                          </div>
                        )}
                      </motion.div>

                      <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                        <div className="bg-white rounded-full shadow-md p-1 flex space-x-1">
                          {['👍', '❤️', '😂', '😮'].map(emoji => (
                            <button
                              key={emoji}
                              onClick={() => handleReaction(message.id, emoji)}
                              className="text-sm hover:scale-125 transform transition-transform"
                            >
                              {emoji}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
                <div ref={messageEndRef} />
              </div>
            </div>

            <div className="p-4 border-t border-gray-200 bg-white relative">
              {typing && (
                <div className="absolute -top-6 left-4 bg-white px-2 py-1 rounded-t-lg shadow-sm text-xs text-gray-500 flex items-center">
                  <span className="flex space-x-1 mr-1">
                    <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce"></span>
                    <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></span>
                    <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></span>
                  </span>
                  {selectedUser.name} is typing...
                </div>
              )}

              <div className="flex items-center">
                <button
                  onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                  className="p-2 text-gray-500 hover:text-gray-700"
                >
                  <FiSmile className="w-5 h-5" />
                </button>

                {showEmojiPicker && (
                  <div className="absolute bottom-16 left-4 bg-white shadow-lg rounded-lg p-2 grid grid-cols-8 gap-1 z-10">
                    {emojis.map(emoji => (
                      <button
                        key={emoji}
                        onClick={() => {
                          setInput(input + emoji)
                          setShowEmojiPicker(false)
                          inputRef.current?.focus()
                        }}
                        className="text-xl p-1 hover:bg-gray-100 rounded"
                      >
                        {emoji}
                      </button>
                    ))}
                  </div>
                )}

                <button
                  onClick={() => setShowStatusMenu(!showStatusMenu)}
                  className="p-2 text-gray-500 hover:text-gray-700"
                >
                  <FiClock className="w-5 h-5" />
                </button>

                <input
                  ref={inputRef}
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                  placeholder="Type a message..."
                  className="flex-1 border border-gray-300 rounded-full py-2 px-4 mx-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />

                <button
                  onClick={handleSendMessage}
                  disabled={!input.trim()}
                  className={`p-2 rounded-full ${input.trim()
                    ? 'bg-blue-600 text-white hover:bg-blue-700'
                    : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                    }`}
                >
                  <FiSend className="w-5 h-5" />
                </button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center bg-gray-50 p-8">
            <div className="text-center max-w-md">
              <div className="mx-auto w-24 h-24 bg-gray-200 rounded-full mb-4 flex items-center justify-center">
                <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
              </div>
              <h3 className="text-xl font-medium text-gray-700 mb-2">No chat selected</h3>
              <p className="text-gray-500 mb-6">Choose a conversation from the sidebar to start chatting</p>
              {users.length > 0 && (
                <button
                  onClick={() => setSelectedUser(users[0])}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                >
                  Start with {users[0].name}
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}