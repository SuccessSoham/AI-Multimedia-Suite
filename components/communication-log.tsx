import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { ArrowRight, MessageSquare, Bell, RefreshCw } from "lucide-react"
import type { CommunicationMessage } from "@/app/page"

interface CommunicationLogProps {
  messages: CommunicationMessage[]
}

export function CommunicationLog({ messages }: CommunicationLogProps) {
  const getMessageIcon = (type: CommunicationMessage["type"]) => {
    switch (type) {
      case "request":
        return <MessageSquare className="h-4 w-4" />
      case "response":
        return <RefreshCw className="h-4 w-4" />
      case "notification":
        return <Bell className="h-4 w-4" />
    }
  }

  const getMessageColor = (type: CommunicationMessage["type"]) => {
    switch (type) {
      case "request":
        return "default"
      case "response":
        return "secondary"
      case "notification":
        return "outline"
    }
  }

  const getProtocolColor = (protocol: CommunicationMessage["protocol"]) => {
    switch (protocol) {
      case "A2A":
        return "bg-blue-100 text-blue-800"
      case "gRPC":
        return "bg-green-100 text-green-800"
      case "REST":
        return "bg-purple-100 text-purple-800"
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Agent Communication Log</CardTitle>
        <CardDescription>
          Real-time communication between agents using A2A protocol and other messaging systems
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[600px] w-full">
          {messages.length === 0 ? (
            <div className="text-center py-8 text-slate-500">
              No communication messages yet. Start processing a file to see agent interactions.
            </div>
          ) : (
            <div className="space-y-3">
              {messages.map((message) => (
                <div key={message.id} className="border rounded-lg p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Badge variant={getMessageColor(message.type)} className="flex items-center gap-1">
                        {getMessageIcon(message.type)}
                        {message.type}
                      </Badge>
                      <Badge className={`text-xs ${getProtocolColor(message.protocol)}`}>{message.protocol}</Badge>
                    </div>
                    <span className="text-xs text-slate-500">{message.timestamp.toLocaleTimeString()}</span>
                  </div>

                  <div className="flex items-center space-x-2 text-sm">
                    <span className="font-medium bg-slate-100 px-2 py-1 rounded">{message.from}</span>
                    <ArrowRight className="h-4 w-4 text-slate-400" />
                    <span className="font-medium bg-slate-100 px-2 py-1 rounded">{message.to}</span>
                  </div>

                  <div className="bg-slate-50 rounded p-3">
                    <pre className="text-xs text-slate-700 whitespace-pre-wrap">
                      {JSON.stringify(message.payload, null, 2)}
                    </pre>
                  </div>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
      </CardContent>
    </Card>
  )
}
