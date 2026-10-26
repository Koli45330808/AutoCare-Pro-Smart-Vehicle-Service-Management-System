import { useState } from "react";
import {
  Bot,
  User,
  Send,
  Sparkles,
  Trash2,
  Car,
  Wrench,
  FileText,
  MapPin,
  Clock,
  MessageCircle,
} from "lucide-react";

const quickPrompts = [
  {
    title: "Vehicle Problem",
    text: "Why is my car making a strange noise?",
    icon: Wrench,
  },
  {
    title: "Service Recommendation",
    text: "What service does my Honda City need?",
    icon: Car,
  },
  {
    title: "Quotation Help",
    text: "Explain my quotation to me",
    icon: FileText,
  },
  {
    title: "Service Status",
    text: "Where is my vehicle service?",
    icon: MapPin,
  },
  {
    title: "Maintenance",
    text: "When should I change engine oil?",
    icon: Clock,
  },
];

const getAIResponse = (message) => {
  const text = message.toLowerCase();

  if (
    text.includes("noise") ||
    text.includes("sound") ||
    text.includes("brake")
  ) {
    return `A strange noise can have different causes.

For example:
• Grinding noise may indicate worn brake pads.
• Squealing may come from brake pads or belts.
• Clicking noise while turning can indicate a CV joint issue.
• Knocking noise from the engine should be inspected quickly.

I recommend getting the vehicle inspected by a technician before continuing long-distance driving.`;
  }

  if (
    text.includes("service") ||
    text.includes("maintenance") ||
    text.includes("honda")
  ) {
    return `For a Honda City, regular maintenance normally includes:

• Engine oil and oil filter replacement
• Brake inspection
• Tyre and wheel inspection
• Battery inspection
• Coolant level check
• Air filter inspection
• AC performance check

If your vehicle has reached its scheduled service interval, booking a General Service is a good option.`;
  }

  if (
    text.includes("quotation") ||
    text.includes("quote") ||
    text.includes("price") ||
    text.includes("cost")
  ) {
    return `Your current demo quotation contains:

Engine Oil Replacement — ₹1,800
Front Brake Pad Replacement — ₹2,500
Vehicle Inspection — ₹500

Subtotal — ₹4,800
GST 18% — ₹864
Total — ₹5,664

The quotation should be reviewed before approving the service.`;
  }

  if (
    text.includes("status") ||
    text.includes("where") ||
    text.includes("tracking") ||
    text.includes("vehicle")
  ) {
    return `Your demo booking SVS-1001 is currently at:

Booking Submitted ✓
Booking Confirmed ✓
Technician Assigned ✓
Vehicle Inspection — Current Stage

Next stages:
Diagnosis → Quotation → Customer Approval → Service → Invoice

You can also open the Service Tracking page from your dashboard.`;
  }

  if (
    text.includes("oil") ||
    text.includes("engine oil")
  ) {
    return `Engine oil replacement depends on the vehicle model, oil type and driving conditions.

As a general guideline, many vehicles require an oil change around 7,500–10,000 km or approximately every 6–12 months.

Always follow your vehicle manufacturer's recommended service interval.`;
  }

  if (
    text.includes("booking") ||
    text.includes("book")
  ) {
    return `You can book a vehicle service from:

Customer Dashboard → Book Service

Select:
1. Vehicle
2. Service type
3. Date
4. Time
5. Problem description
6. Pickup & Drop option

Then submit the booking request.`;
  }

  if (
    text.includes("hello") ||
    text.includes("hi") ||
    text.includes("hey")
  ) {
    return `Hello! 👋

I'm your Smart Vehicle AI Assistant.

I can help you with:
• Vehicle problems
• Service recommendations
• Quotations
• Service status
• Maintenance questions
• Booking guidance

What would you like to know?`;
  }

  return `I can help you with your vehicle service.

You can ask me things like:

• "Why is my car making a noise?"
• "What service does my Honda City need?"
• "Explain my quotation"
• "Where is my service?"
• "When should I change engine oil?"

Please describe your vehicle problem or question.`;
};

function AIAssistant() {
  const [messages, setMessages] = useState([
    {
      id: 1,
      sender: "ai",
      text: `Hello Akash! 👋

I'm your Smart Vehicle AI Assistant.

I can help you with vehicle problems, service recommendations, quotations, maintenance and service status.

How can I help you today?`,
    },
  ]);

  const [input, setInput] = useState("");
  const [typing, setTyping] = useState(false);

  const sendMessage = (message = input) => {
    const trimmedMessage = message.trim();

    if (!trimmedMessage || typing) {
      return;
    }

    const userMessage = {
      id: Date.now(),
      sender: "user",
      text: trimmedMessage,
    };

    setMessages((previous) => [...previous, userMessage]);
    setInput("");
    setTyping(true);

    setTimeout(() => {
      const response = {
        id: Date.now() + 1,
        sender: "ai",
        text: getAIResponse(trimmedMessage),
      };

      setMessages((previous) => [...previous, response]);
      setTyping(false);
    }, 900);
  };

  const clearChat = () => {
    setMessages([
      {
        id: Date.now(),
        sender: "ai",
        text: "Chat cleared. How can I help you with your vehicle today? 🚗",
      },
    ]);
  };

  return (
    <div className="min-h-screen bg-slate-100 p-4 md:p-6">
      <div className="mx-auto max-w-7xl">

        {/* Header */}
        <div className="mb-6 flex flex-col gap-4 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 p-6 text-white shadow-lg md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white/20">
              <Bot size={32} />
            </div>

            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-bold">
                  AI Vehicle Assistant
                </h1>

                <span className="rounded-full bg-green-400 px-2 py-1 text-xs font-bold text-green-950">
                  ONLINE
                </span>
              </div>

              <p className="mt-1 text-sm text-blue-100">
                Smart assistance for your vehicle service needs
              </p>
            </div>
          </div>

          <button
            onClick={clearChat}
            className="flex items-center justify-center gap-2 rounded-xl bg-white/15 px-4 py-2.5 text-sm font-semibold hover:bg-white/25"
          >
            <Trash2 size={17} />
            Clear Chat
          </button>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">

          {/* Chat */}
          <div className="overflow-hidden rounded-2xl bg-white shadow-lg lg:col-span-2">

            {/* Chat Header */}
            <div className="flex items-center gap-3 border-b border-slate-200 p-5">
              <div className="flex h-11 w-11 items-center justify-center rounded-full bg-blue-100">
                <Sparkles className="text-blue-600" size={22} />
              </div>

              <div>
                <h2 className="font-bold text-slate-800">
                  Smart Vehicle Assistant
                </h2>
                <p className="text-xs text-slate-500">
                  Ask questions about your vehicle
                </p>
              </div>
            </div>

            {/* Messages */}
            <div className="h-[500px] overflow-y-auto bg-slate-50 p-4 md:p-6">

              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`mb-5 flex ${
                    message.sender === "user"
                      ? "justify-end"
                      : "justify-start"
                  }`}
                >
                  <div
                    className={`flex max-w-[85%] gap-3 ${
                      message.sender === "user"
                        ? "flex-row-reverse"
                        : ""
                    }`}
                  >
                    <div
                      className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full ${
                        message.sender === "user"
                          ? "bg-blue-600 text-white"
                          : "bg-indigo-100 text-indigo-600"
                      }`}
                    >
                      {message.sender === "user" ? (
                        <User size={18} />
                      ) : (
                        <Bot size={18} />
                      )}
                    </div>

                    <div
                      className={`rounded-2xl px-4 py-3 text-sm leading-6 shadow-sm ${
                        message.sender === "user"
                          ? "rounded-tr-sm bg-blue-600 text-white"
                          : "rounded-tl-sm bg-white text-slate-700"
                      }`}
                    >
                      {message.text.split("\n").map((line, index) => (
                        <div key={index}>
                          {line}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ))}

              {/* Typing */}
              {typing && (
                <div className="mb-5 flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-full bg-indigo-100 text-indigo-600">
                    <Bot size={18} />
                  </div>

                  <div className="rounded-2xl rounded-tl-sm bg-white px-5 py-3 shadow-sm">
                    <div className="flex gap-1">
                      <span className="h-2 w-2 animate-bounce rounded-full bg-slate-400"></span>
                      <span className="h-2 w-2 animate-bounce rounded-full bg-slate-400 [animation-delay:150ms]"></span>
                      <span className="h-2 w-2 animate-bounce rounded-full bg-slate-400 [animation-delay:300ms]"></span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Input */}
            <div className="border-t border-slate-200 bg-white p-4">
              <div className="flex gap-3">
                <input
                  type="text"
                  value={input}
                  onChange={(event) => setInput(event.target.value)}
                  onKeyDown={(event) => {
                    if (event.key === "Enter") {
                      sendMessage();
                    }
                  }}
                  placeholder="Ask something about your vehicle..."
                  className="flex-1 rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                />

                <button
                  onClick={() => sendMessage()}
                  disabled={!input.trim() || typing}
                  className="flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-3 font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <Send size={18} />
                  <span className="hidden sm:block">Send</span>
                </button>
              </div>

              <p className="mt-2 text-center text-xs text-slate-400">
                AI suggestions are for assistance. A technician should inspect
                serious vehicle problems.
              </p>
            </div>
          </div>

          {/* Right Panel */}
          <div className="space-y-6">

            {/* Current Vehicle */}
            <div className="rounded-2xl bg-white p-5 shadow-lg">
              <div className="mb-4 flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-100 text-blue-600">
                  <Car size={21} />
                </div>

                <div>
                  <h3 className="font-bold text-slate-800">
                    Current Vehicle
                  </h3>
                  <p className="text-xs text-slate-500">
                    Selected vehicle
                  </p>
                </div>
              </div>

              <div className="rounded-xl bg-slate-50 p-4">
                <p className="font-bold text-slate-800">
                  Honda City
                </p>

                <p className="mt-1 text-sm text-slate-500">
                  MH12AB1234
                </p>

                <div className="mt-3 flex justify-between text-xs">
                  <span className="text-slate-500">
                    Model
                  </span>
                  <span className="font-semibold text-slate-700">
                    2023
                  </span>
                </div>

                <div className="mt-2 flex justify-between text-xs">
                  <span className="text-slate-500">
                    Fuel
                  </span>
                  <span className="font-semibold text-slate-700">
                    Petrol
                  </span>
                </div>
              </div>
            </div>

            {/* Quick Questions */}
            <div className="rounded-2xl bg-white p-5 shadow-lg">
              <div className="mb-4 flex items-center gap-3">
                <MessageCircle className="text-blue-600" size={21} />

                <div>
                  <h3 className="font-bold text-slate-800">
                    Quick Questions
                  </h3>
                  <p className="text-xs text-slate-500">
                    Try one of these
                  </p>
                </div>
              </div>

              <div className="space-y-3">
                {quickPrompts.map((prompt) => {
                  const Icon = prompt.icon;

                  return (
                    <button
                      key={prompt.title}
                      onClick={() => sendMessage(prompt.text)}
                      disabled={typing}
                      className="flex w-full items-center gap-3 rounded-xl border border-slate-200 p-3 text-left transition hover:border-blue-300 hover:bg-blue-50 disabled:opacity-50"
                    >
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-blue-100 text-blue-600">
                        <Icon size={18} />
                      </div>

                      <div>
                        <p className="text-xs font-bold text-slate-700">
                          {prompt.title}
                        </p>

                        <p className="mt-1 text-xs text-slate-500">
                          {prompt.text}
                        </p>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* AI Features */}
            <div className="rounded-2xl bg-gradient-to-br from-indigo-50 to-blue-50 p-5">
              <div className="flex items-center gap-2">
                <Sparkles className="text-indigo-600" size={20} />

                <h3 className="font-bold text-slate-800">
                  AI Capabilities
                </h3>
              </div>

              <ul className="mt-4 space-y-2 text-sm text-slate-600">
                <li>✓ Vehicle problem analysis</li>
                <li>✓ Service recommendations</li>
                <li>✓ Quotation explanation</li>
                <li>✓ Service status assistance</li>
                <li>✓ Maintenance guidance</li>
              </ul>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}

export default AIAssistant;