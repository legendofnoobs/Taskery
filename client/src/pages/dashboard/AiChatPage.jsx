// import { useState, useRef, useEffect } from "react";
// import { useAiChat } from "../../hooks/useAiChat";
// import { ArrowLeft, Brain, Send } from "lucide-react";
// import ReactMarkdown from "react-markdown";
// import "highlight.js/styles/github-dark.css"; // or another highlight.js theme

// const AiChatPage = () => {
//     const { history, loading, sendMessage } = useAiChat();
//     const [input, setInput] = useState("");
//     const messagesEndRef = useRef(null);

//     const handleSend = () => {
//         if (input.trim()) {
//             sendMessage(input);
//             setInput("");
//         }
//     };

//     useEffect(() => {
//         messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
//     }, [history, loading]);

//     return (
//         <div className="flex flex-col md:ml-72">
//             {/* Header */}
//             <div className="fixed top-0 left-0 right-0 md:left-72 z-10 bg-white/70 dark:bg-zinc-900/70 px-4 py-4 flex items-center justify-between backdrop-blur-md border-b border-gray-200 dark:border-zinc-800">
//                 <div className="flex items-center gap-2">
//                     <button
//                         className="p-1 rounded-full hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors mr-2 block md:hidden"
//                         aria-label="Back to Inbox"
//                     >
//                         <ArrowLeft className="w-6 h-6 text-gray-900 dark:text-white" />
//                     </button>
//                     <h1 className="flex items-center gap-2 text-xl font-semibold text-gray-900 dark:text-white">
//                         <Brain className="w-6 h-6" /> AI Chat
//                     </h1>
//                 </div>
//             </div>

//             {/* Messages */}
//             <div className="flex-grow overflow-y-auto px-4 pt-24 pb-32">
//                 {history.map((msg, index) => (
//                     <div
//                         key={index}
//                         className={`flex mb-4 ${msg.role === "user" ? "justify-end" : "justify-start"}`}
//                     >
//                         <div
//                             className={`max-w-[75%] px-4 py-2 rounded-lg text-sm whitespace-pre-wrap leading-relaxed ${msg.role === "user"
//                                     ? "bg-blue-500 text-white"
//                                     : "bg-gray-100 dark:bg-zinc-800 text-gray-900 dark:text-gray-100"
//                                 }`}
//                         >
//                             <ReactMarkdown>
//                                 {typeof msg === "string"
//                                     ? msg
//                                     : msg?.parts?.[0]?.text || msg?.reply || ""}
//                             </ReactMarkdown>
//                         </div>
//                     </div>
//                 ))}


//                 {loading && (
//                     <div className="flex justify-start mb-4">
//                         <div className="px-4 py-2 rounded-lg bg-gray-100 dark:bg-zinc-800 text-gray-500">
//                             ...
//                         </div>
//                     </div>
//                 )}
//                 <div ref={messagesEndRef} />
//             </div>

//             {/* Input */}
//             <div className="fixed bottom-0 left-0 right-0 md:left-72 bg-white dark:bg-zinc-900 border-t border-gray-200 dark:border-zinc-800 px-4 py-4">
//                 <div className="flex items-center gap-2">
//                     <textarea
//                         rows={1}
//                         placeholder="Send a message..."
//                         className="flex-grow resize-none rounded-lg border border-gray-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 p-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
//                         value={input}
//                         onChange={(e) => setInput(e.target.value)}
//                         onKeyDown={(e) =>
//                             e.key === "Enter" &&
//                             !e.shiftKey &&
//                             (e.preventDefault(), handleSend())
//                         }
//                     />
//                     <button
//                         onClick={handleSend}
//                         disabled={!input.trim()}
//                         className="p-2 rounded-lg bg-blue-500 text-white hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
//                     >
//                         <Send className="w-5 h-5" />
//                     </button>
//                 </div>
//             </div>
//         </div>
//     );
// };

// export default AiChatPage;

import { useState, useRef, useEffect } from "react";
import { useAiChat } from "../../hooks/useAiChat";
import { ArrowLeft, Brain, Send, Trash2 } from "lucide-react";
import ReactMarkdown from "react-markdown";
import "highlight.js/styles/github-dark.css"; // or another highlight.js theme

const STORAGE_KEY = "aiChatHistory";

const AiChatPage = () => {
    const { history, loading, sendMessage, setHistory } = useAiChat();
    const [input, setInput] = useState("");
    const messagesEndRef = useRef(null);

    // 🔹 Load chat from localStorage on mount
    useEffect(() => {
        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved) {
            try {
                setHistory(JSON.parse(saved));
            } catch (e) {
                console.error("Failed to parse saved chat:", e);
            }
        }
    }, [setHistory]);

    // 🔹 Save chat to localStorage whenever history changes
    useEffect(() => {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(history));
    }, [history]);

    const handleSend = () => {
        if (input.trim()) {
            sendMessage(input);
            setInput("");
        }
    };

    const handleClear = () => {
        setHistory([]);
        localStorage.removeItem(STORAGE_KEY);
    };

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [history, loading]);

    return (
        <div className="flex flex-col md:ml-72">
            {/* Header */}
            <div className="fixed top-0 left-0 right-0 md:left-72 z-10 bg-white/70 dark:bg-zinc-900/70 px-4 py-4 flex items-center justify-between backdrop-blur-md border-b border-gray-200 dark:border-zinc-800">
                <div className="flex items-center gap-2">
                    <button
                        className="p-1 rounded-full hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors mr-2 block md:hidden"
                        aria-label="Back to Inbox"
                    >
                        <ArrowLeft className="w-6 h-6 text-gray-900 dark:text-white" />
                    </button>
                    <h1 className="flex items-center gap-2 text-xl font-semibold text-gray-900 dark:text-white">
                        <Brain className="w-6 h-6" /> Assistant
                    </h1>
                </div>
                {/* 🔹 Clear Chat button */}
                <button
                    onClick={handleClear}
                    className="flex items-center gap-1 px-3 py-1 rounded-lg bg-red-500 text-white hover:bg-red-600 text-sm"
                >
                    <Trash2 className="w-4 h-4" /> Clear
                </button>
            </div>

            {/* Messages */}
            <div className="flex-grow overflow-y-auto px-4 pt-24 pb-32">
                {history.map((msg, index) => (
                    <div
                        key={index}
                        className={`flex mb-4 ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                    >
                        <div
                            className={`max-w-[75%] px-4 py-2 rounded-lg text-sm whitespace-pre-wrap leading-relaxed ${
                                msg.role === "user"
                                    ? "bg-blue-500 text-white"
                                    : "bg-gray-100 dark:bg-zinc-800 text-gray-900 dark:text-gray-100"
                            }`}
                        >
                            <ReactMarkdown>
                                {typeof msg === "string"
                                    ? msg
                                    : msg?.parts?.[0]?.text || msg?.reply || ""}
                            </ReactMarkdown>
                        </div>
                    </div>
                ))}

                {loading && (
                    <div className="flex justify-start mb-4">
                        <div className="px-4 py-2 rounded-lg bg-gray-100 dark:bg-zinc-800 text-gray-500">
                            ...
                        </div>
                    </div>
                )}
                <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="fixed bottom-0 left-0 right-0 md:left-72 bg-white dark:bg-zinc-900 border-t border-gray-200 dark:border-zinc-800 px-4 py-4">
                <div className="flex items-center gap-2">
                    <textarea
                        rows={1}
                        placeholder="Send a message..."
                        className="flex-grow resize-none rounded-lg border border-gray-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 p-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={(e) =>
                            e.key === "Enter" &&
                            !e.shiftKey &&
                            (e.preventDefault(), handleSend())
                        }
                    />
                    <button
                        onClick={handleSend}
                        disabled={!input.trim()}
                        className="p-2 rounded-lg bg-blue-500 text-white hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <Send className="w-5 h-5" />
                    </button>
                </div>
            </div>
        </div>
    );
};

export default AiChatPage;
