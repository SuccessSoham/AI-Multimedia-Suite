import type React from "react"
import { ArrowRight } from "lucide-react"

import { Badge } from "@/components/ui/badge"

interface CommunicationLogMessage {
  type: string
  protocol: string
  from: string
  to: string
  payload: any
  timestamp: Date
}

interface CommunicationLogProps {
  messages: CommunicationLogMessage[]
}

const formatPayload = (payload: any) => {
  if (typeof payload === "object") {
    return JSON.stringify(payload, null, 2)
  }
  return String(payload)
}

const getProtocolColor = (protocol: string) => {
  switch (protocol) {
    case "A2A":
      return "bg-blue-100 text-blue-800"
    case "gRPC":
      return "bg-green-100 text-green-800"
    case "REST":
      return "bg-purple-100 text-purple-800"
    default:
      return "bg-gray-100 text-gray-800"
  }
}

const getMessageTypeColor = (type: string) => {
  switch (type) {
    case "request":
      return "bg-yellow-100 text-yellow-800"
    case "response":
      return "bg-green-100 text-green-800"
    default:
      return "bg-gray-100 text-gray-800"
  }
}

const CommunicationLog: React.FC<CommunicationLogProps> = ({ messages }) => {
  return (
    <div>
      {messages.map((message, index) => (
        <div key={index} className="mb-4 border rounded p-4">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center space-x-2 mb-1">
                <Badge variant="outline" className={getMessageTypeColor(message.type)}>
                  {message.type.toUpperCase()}
                </Badge>
                <Badge variant="outline" className={getProtocolColor(message.protocol)}>
                  {message.protocol}
                </Badge>
                <span className="text-xs text-muted-foreground">{message.timestamp.toLocaleTimeString()}</span>
              </div>
              <div className="text-sm">
                <span className="font-medium">{message.from}</span>
                <ArrowRight className="h-3 w-3 mx-2 inline" />
                <span className="font-medium">{message.to}</span>
              </div>
              <div className="mt-2 p-2 bg-muted rounded text-xs">
                <pre className="whitespace-pre-wrap">{formatPayload(message.payload)}</pre>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}

export default CommunicationLog
